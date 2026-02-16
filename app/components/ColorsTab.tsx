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
import { Color } from "@/types/product";
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

export default function ColorsTab() {
  const [colors, setColors] = useState<(Color & { is_Active: boolean })[]>([]);
  const [isFetchingColors, setIsFetchingColors] = useState(false);
  const [isMutating, setIsMutating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addToast } = useToast();

  // fetch all colors using use effect an set state

  const fetchColors = async () => {
    try {
      setError(null);
      setIsFetchingColors(true);

      // Add cache-busting timestamp to prevent stale data
      const timestamp = Date.now();
      const response = await fetch(`/api/colors?t=${timestamp}`, {
        cache: "no-store", // Prevent browser caching
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch colors");
      }

      const colors = await response.json();
      setColors(colors);
    } catch (error) {
      console.log(error);
      setError(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setIsFetchingColors(false);
    }
  };
  useEffect(() => {
    fetchColors();
  }, []);

  const handleSubmitColor = async (payload: Color & { is_Active: boolean }) => {
    setIsMutating(true);
    try {
      if (payload.id) {
        // UPDATE
        const res = await fetch(`/api/colors`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ...payload, id: payload.id.toString() }),
        });

        // Check HTTP status
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData?.error || "Failed to update color");
        }
        addToast("success", "Color updated successfully");
      } else {
        // SAVE
        const res = await fetch("/api/colors", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
        // Check HTTP status
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData?.error || "Failed to save color");
        }
        addToast("success", "Color saved successfully");
      }

      await fetchColors();
    } catch (error) {
      console.error(error);
      addToast(
        "error",
        error instanceof Error ? error.message : "Failed to save color",
      );
      setError(error instanceof Error ? error.message : "Failed to save color");
    } finally {
      setIsMutating(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex items-center justify-between py-6">
        <div>
          <CardTitle>Colors</CardTitle>
          <CardDescription>
            Manage product colors available in your store
          </CardDescription>
        </div>
        <ColorSheet
          mode="create"
          isLoading={isMutating}
          onSubmit={handleSubmitColor}
        >
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Color
          </Button>
        </ColorSheet>
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
            {isFetchingColors ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={`colors-loading-${index}`}>
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
              colors.map((color) => (
                <TableRow key={color.id}>
                  <TableCell>{color.id}</TableCell>
                  <TableCell className="font-medium">{color.value}</TableCell>
                  <TableCell>
                    <Badge variant={color.is_Active ? "default" : "secondary"}>
                      {color.is_Active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <ColorSheet
                      mode="edit"
                      isLoading={isMutating}
                      initialData={color}
                      onSubmit={handleSubmitColor}
                    >
                      <Button variant="ghost" size="icon" disabled={isMutating}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    </ColorSheet>
                    <DeleteDialog
                      isLoading={isMutating}
                      setIsLoading={setIsMutating}
                      color={color}
                      fetchColors={fetchColors}
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

function ColorSheet({
  children,
  mode,
  initialData,
  onSubmit,
  isLoading,
}: {
  children: React.ReactNode;
  mode: "create" | "edit";
  initialData?: Color & { is_Active: boolean };
  onSubmit: (data: Color & { is_Active: boolean }) => Promise<void>;
  isLoading: boolean;
}) {
  const [name, setName] = useState("");
  const [open, onOpenChange] = useState(false);
  const [active, setActive] = useState(true);

  const handleOpenChange = (nextOpen: boolean) => {
    onOpenChange(nextOpen);

    if (nextOpen) {
      setName(initialData?.value ?? "");
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
        value: name,
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
          <SheetTitle>{isEdit ? "Edit Color" : "Add New Color"}</SheetTitle>
          <SheetDescription>
            {isEdit
              ? "Update the selected color."
              : "Add a new color to the system."}
          </SheetDescription>
        </SheetHeader>

        <div className="py-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="color-name">Color Name</Label>
            <Input
              id="color-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter color name"
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
                ? "Update Color"
                : "Save Color"}
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
  color,
  fetchColors,
}: {
  children: React.ReactNode;
  isLoading: boolean;
  setIsLoading: (value: boolean) => void;
  color: Color & { is_Active: boolean };
  fetchColors: () => Promise<void>;
}) {
  const { addToast } = useToast();
  const [open, setOpen] = useState(false);

  const handleDeleteColor = async () => {
    if (!color.id) return;

    setIsLoading(true);
    try {
      const res = await fetch(`/api/colors?id=${color.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData?.error || "Failed to delete color");
      }
      await fetchColors();
      addToast("success", "Color deleted successfully");
      setOpen(false);
    } catch (error) {
      console.error(error);
      addToast(
        "error",
        error instanceof Error ? error.message : "Failed to delete color",
      );
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
            color &quot;{color.value}&quot;.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild disabled={isLoading}>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button
            variant="destructive"
            className="text-background"
            onClick={handleDeleteColor}
            disabled={isLoading}
          >
            {isLoading ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
