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
import { ProductType } from "@/types/product";
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

export default function ProductTypesTab() {
  const [productTypes, setProductTypes] = useState<(ProductType & { is_Active: boolean })[]>([]);
  const [isFetchingProductTypes, setIsFetchingProductTypes] = useState(false);
  const [isMutating, setIsMutating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addToast } = useToast();

  const fetchProductTypes = async () => {
    try {
      setError(null);
      setIsFetchingProductTypes(true);

      // Add cache-busting timestamp to prevent stale data
      const timestamp = Date.now();
      const response = await fetch(`/api/product-types?t=${timestamp}`, {
        cache: "no-store", // Prevent browser caching
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch product types");
      }

      const productTypes = await response.json();
      setProductTypes(productTypes);
    } catch (error) {
      console.log(error);
      setError(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setIsFetchingProductTypes(false);
    }
  };

  useEffect(() => {
    fetchProductTypes();
  }, []);

  const handleSubmitProductType = async (payload: ProductType & { is_Active: boolean }) => {
    setIsMutating(true);
    try {
      if (payload.id) {
        // UPDATE
        const res = await fetch(`/api/product-types`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ...payload, id: payload.id.toString() }),
        });

        // Check HTTP status
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData?.error || "Failed to update product type");
        }
        addToast("success", "Product type updated successfully");
      } else {
        // SAVE
        const res = await fetch("/api/product-types", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
        // Check HTTP status
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData?.error || "Failed to save product type");
        }
        addToast("success", "Product type saved successfully");
      }

      await fetchProductTypes();
    } catch (error) {
      console.error(error);
      addToast(
        "error",
        error instanceof Error ? error.message : "Failed to save product type",
      );
    } finally {
      setIsMutating(false);
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0 py-4 sm:py-6">
        <div>
          <CardTitle className="text-xl sm:text-2xl">Product Types</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Manage different types of products available in your store
          </CardDescription>
        </div>
        <ProductTypeSheet
          mode="create"
          isLoading={isMutating}
          onSubmit={handleSubmitProductType}
        >
          <Button size="sm" className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Add Product Type
          </Button>
        </ProductTypeSheet>
      </CardHeader>
      <CardContent className="p-0 sm:p-6">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[60px]">ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isFetchingProductTypes ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={`product-types-loading-${index}`}>
                    <TableCell>
                      <Skeleton className="h-4 w-6" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-16" />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Skeleton className="h-8 w-8" />
                        <Skeleton className="h-8 w-8" />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-sm text-red-600 p-4">
                    {error}
                  </TableCell>
                </TableRow>
              ) : productTypes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                    No product types found
                  </TableCell>
                </TableRow>
              ) : (
                productTypes.map((productType) => (
                  <TableRow key={productType.id}>
                    <TableCell className="text-xs text-gray-500">#{productType.id}</TableCell>
                    <TableCell className="font-medium text-sm">{productType.name}</TableCell>
                    <TableCell>
                      <Badge variant={productType.is_Active ? "default" : "secondary"} className="text-[10px] px-2 py-0">
                        {productType.is_Active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <ProductTypeSheet
                          mode="edit"
                          isLoading={isMutating}
                          initialData={productType}
                          onSubmit={handleSubmitProductType}
                        >
                          <Button variant="ghost" size="icon" className="h-8 w-8" disabled={isMutating}>
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                        </ProductTypeSheet>
                        <DeleteDialog
                          isLoading={isMutating}
                          setIsLoading={setIsMutating}
                          productType={productType}
                          fetchProductTypes={fetchProductTypes}
                        >
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" disabled={isMutating}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </DeleteDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

function ProductTypeSheet({
  children,
  mode,
  initialData,
  onSubmit,
  isLoading,
}: {
  children: React.ReactNode;
  mode: "create" | "edit";
  initialData?: ProductType & { is_Active: boolean };
  onSubmit: (data: ProductType & { is_Active: boolean }) => Promise<void>;
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
          <SheetTitle>{isEdit ? "Edit Product Type" : "Add New Product Type"}</SheetTitle>
          <SheetDescription>
            {isEdit
              ? "Update the selected product type."
              : "Add a new product type to the system."}
          </SheetDescription>
        </SheetHeader>

        <div className="py-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="product-type-name">Product Type Name</Label>
            <Input
              id="product-type-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter product type name"
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
                ? "Update Product Type"
                : "Save Product Type"}
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
  productType,
  fetchProductTypes,
}: {
  children: React.ReactNode;
  isLoading: boolean;
  setIsLoading: (value: boolean) => void;
  productType: ProductType & { is_Active: boolean };
  fetchProductTypes: () => Promise<void>;
}) {
  const { addToast } = useToast();
  const [open, setOpen] = useState(false);

  const handleDeleteProductType = async () => {
    if (!productType.id) return;

    setIsLoading(true);
    try {
      const res = await fetch(`/api/product-types?id=${productType.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData?.error || "Failed to delete product type");
      }
      await fetchProductTypes();
      addToast("success", "Product type deleted successfully");
      setOpen(false);
    } catch (error) {
      console.error(error);
      addToast(
        "error",
        error instanceof Error ? error.message : "Failed to delete product type",
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
            product type &quot;{productType.name}&quot;.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild disabled={isLoading}>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button
            variant="destructive"
            className="text-background"
            onClick={handleDeleteProductType}
            disabled={isLoading}
          >
            {isLoading ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
