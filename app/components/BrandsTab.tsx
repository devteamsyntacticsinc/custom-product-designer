"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Edit, Trash2, Plus } from "lucide-react";
import { Brand } from "@/types/product";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/contexts/ToastContext";

export default function BrandsTab() {
  const [brands, setBrands] = useState<(Brand & { is_Active: boolean })[]>([]);
  const [isFetchingBrands, setIsFetchingBrands] = useState(false);
  const [isMutating, setIsMutating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addToast } = useToast();

  const fetchBrands = async () => {
    try {
      setError(null);
      setIsFetchingBrands(true);

      // Add cache-busting timestamp to prevent stale data
      const timestamp = Date.now();
      const response = await fetch(`/api/brands?t=${timestamp}`, {
        cache: "no-store", // Prevent browser caching
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch brands");
      }

      const brands = await response.json();
      setBrands(brands);
    } catch (error) {
      console.log(error);
      setError(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setIsFetchingBrands(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const handleSubmitBrand = async (payload: Brand & { is_Active: boolean }) => {
    setIsMutating(true);
    try {
      if (payload.id) {
        // UPDATE
        const res = await fetch(`/api/brands`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ...payload, id: payload.id.toString() }),
        });

        // Check HTTP status
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData?.error || "Failed to update brand");
        }
        addToast("success", "Brand updated successfully");
      } else {
        // SAVE
        const res = await fetch("/api/brands", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
        // Check HTTP status
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData?.error || "Failed to save brand");
        }
        addToast("success", "Brand saved successfully");
      }

      await fetchBrands();
    } catch (error) {
      console.error(error);
      addToast(
        "error",
        error instanceof Error ? error.message : "Failed to save brand",
      );
    } finally {
      setIsMutating(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex items-center justify-between py-6">
        <div>
          <CardTitle>Brands</CardTitle>
          <CardDescription>
            Manage product brands available in your store
          </CardDescription>
        </div>
        <BrandSheet
          mode="create"
          isLoading={isMutating}
          onSubmit={handleSubmitBrand}
        >
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Brand
          </Button>
        </BrandSheet>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isFetchingBrands ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={`brands-loading-${index}`}>
                  <TableCell>
                    <Skeleton className="h-4 w-10" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-20" />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-8 w-8" />
                      <Skeleton className="h-8 w-8" />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : error ? (
              <TableRow>
                <TableCell colSpan={4} className="text-sm text-red-600">
                  {error}
                </TableCell>
              </TableRow>
            ) : (
              brands.map((brand) => (
                <TableRow key={brand.id}>
                  <TableCell>{brand.id}</TableCell>
                  <TableCell className="font-medium">{brand.name}</TableCell>
                  <TableCell>
                    <Badge variant={brand.is_Active ? "default" : "secondary"}>
                      {brand.is_Active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <BrandSheet
                      mode="edit"
                      isLoading={isMutating}
                      initialData={brand}
                      onSubmit={handleSubmitBrand}
                    >
                      <Button variant="ghost" size="icon" disabled={isMutating}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    </BrandSheet>
                    <DeleteDialog
                      isLoading={isMutating}
                      setIsLoading={setIsMutating}
                      brand={brand}
                      fetchBrands={fetchBrands}
                    >
                      <Button variant="ghost" size="icon" disabled={isMutating}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </DeleteDialog>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function BrandSheet({
  children,
  mode,
  initialData,
  onSubmit,
  isLoading,
}: {
  children: React.ReactNode;
  mode: "create" | "edit";
  initialData?: Brand & { is_Active: boolean };
  onSubmit: (data: Brand & { is_Active: boolean }) => Promise<void>;
  isLoading: boolean;
}) {
  const [name, setName] = useState("");
  const [open, onOpenChange] = useState(false);
  const [active, setActive] = useState(true);

  const handleOpenChange = (nextOpen: boolean) => {
    onOpenChange(nextOpen);

    if (nextOpen) {
      setName(initialData?.name ?? "");
      setActive(initialData?.is_Active ?? true);
    } else {
      setName("");
      setActive(true);
    }
  };

  const handleSubmit = async () => {
    try {
      await onSubmit({
        id: initialData?.id ?? "",
        name,
        is_Active: active,
      });
      setName("");
      onOpenChange(false);
    } catch (error) {
      console.error(error);
    }
  };

  const isEdit = mode === "edit";

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>{children}</SheetTrigger>

      <SheetContent>
        <SheetHeader>
          <SheetTitle>{isEdit ? "Edit Brand" : "Add New Brand"}</SheetTitle>
          <SheetDescription>
            {isEdit
              ? "Update the selected brand."
              : "Add a new brand to the system."}
          </SheetDescription>
        </SheetHeader>

        <div className="py-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="brand-name">Brand Name</Label>
            <Input
              id="brand-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter brand name"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch checked={active} onCheckedChange={setActive} />
            <Label>{active ? "Active" : "Inactive"}</Label>
          </div>
        </div>

        <SheetFooter>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading
              ? isEdit
                ? "Updating..."
                : "Saving..."
              : isEdit
                ? "Update Brand"
                : "Save Brand"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function DeleteDialog({
  children,
  isLoading,
  setIsLoading,
  brand,
  fetchBrands,
}: {
  children: React.ReactNode;
  isLoading: boolean;
  setIsLoading: (value: boolean) => void;
  brand: Brand & { is_Active: boolean };
  fetchBrands: () => Promise<void>;
}) {
  const { addToast } = useToast();
  const [open, setOpen] = useState(false);

  const handleDeleteBrand = async () => {
    if (!brand.id) return;

    setIsLoading(true);
    try {
      const res = await fetch(`/api/brands?id=${brand.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData?.error || "Failed to delete brand");
      }
      await fetchBrands();
      addToast("success", "Brand deleted successfully");
      setOpen(false);
    } catch (error) {
      console.error(error);
      addToast(
        "error",
        error instanceof Error ? error.message : "Failed to delete brand",
      );
      // Close dialog on error as well
      setOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you absolutely sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete your
            brand &quot;{brand.name}&quot;.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild disabled={isLoading}>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button
            variant="destructive"
            className="text-background"
            onClick={handleDeleteBrand}
            disabled={isLoading}
          >
            {isLoading ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
