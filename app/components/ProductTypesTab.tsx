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
  const [productTypes, setProductTypes] = useState<
    (ProductType & { is_Active: boolean; is_onlyType: boolean })[]
  >([]);
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

  const handleSubmitProductType = async (
    payload: ProductType & { is_Active: boolean; is_onlyType: boolean },
  ) => {
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
          <CardTitle className="text-lg sm:text-2xl">Product Types</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Manage different types of products available in your store
          </CardDescription>
        </div>
        <ProductTypeSheet
          mode="create"
          isLoading={isMutating}
          onSubmit={handleSubmitProductType}
        >
          <Button
            size="sm"
            className="w-full sm:w-auto text-xs sm:text-sm h-8 sm:h-10"
          >
            <Plus className="h-4 w-4 mr-2 text-xs sm:text-sm" />
            Add Product Type
          </Button>
        </ProductTypeSheet>
      </CardHeader>
      <CardContent className="p-0 sm:p-6">
        <div className="overflow-x-auto p-2">
          <Table>
            <TableHeader>
              <TableRow className="h-10 sm:h-12">
                <TableHead className="w-[50px] sm:w-[60px] px-2 sm:px-4 text-xs sm:text-sm">
                  ID
                </TableHead>
                <TableHead className="px-2 sm:px-4 text-xs sm:text-sm">
                  Name
                </TableHead>
                <TableHead className="px-2 sm:px-4 text-xs sm:text-sm">
                  Status
                </TableHead>
                <TableHead className="px-2 sm:px-4 text-xs sm:text-sm">
                  Only Type
                </TableHead>
                <TableHead className="text-right px-2 sm:px-4 text-xs sm:text-sm">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isFetchingProductTypes ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow
                    key={`product-types-loading-${index}`}
                    className="h-10 sm:h-12"
                  >
                    <TableCell className="px-2 sm:px-4">
                      <Skeleton className="h-3 w-4 sm:h-4 sm:w-6" />
                    </TableCell>
                    <TableCell className="px-2 sm:px-4">
                      <Skeleton className="h-3 w-16 sm:h-4 sm:w-20" />
                    </TableCell>
                    <TableCell className="px-2 sm:px-4">
                      <Skeleton className="h-5 w-12 sm:h-6 sm:w-16" />
                    </TableCell>
                    <TableCell className="px-2 sm:px-4">
                      <Skeleton className="h-5 w-12 sm:h-6 sm:w-16" />
                    </TableCell>
                    <TableCell className="text-right px-2 sm:px-4">
                      <div className="flex items-center justify-end gap-1">
                        <Skeleton className="h-7 w-7 sm:h-8 sm:w-8" />
                        <Skeleton className="h-7 w-7 sm:h-8 sm:w-8" />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-xs text-red-600 p-4">
                    {error}
                  </TableCell>
                </TableRow>
              ) : productTypes.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center py-8 text-gray-400 text-xs sm:text-sm"
                  >
                    No product types found
                  </TableCell>
                </TableRow>
              ) : (
                productTypes.map((productType) => (
                  <TableRow key={productType.id} className="h-10 sm:h-12">
                    <TableCell className="text-xs sm:text-sm text-gray-500 px-2 sm:px-4">
                      #{productType.id}
                    </TableCell>
                    <TableCell className="font-medium text-[11px] sm:text-sm px-2 sm:px-4">
                      {productType.name}
                    </TableCell>
                    <TableCell className="px-2 sm:px-4">
                      <Badge
                        variant={
                          productType.is_Active ? "default" : "secondary"
                        }
                        className="text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0"
                      >
                        {productType.is_Active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-2 sm:px-4">
                      <Badge
                        variant={
                          productType.is_onlyType ? "default" : "secondary"
                        }
                        className="text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0"
                      >
                        {productType.is_onlyType ? "True" : "False"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right px-2 sm:px-4">
                      <div className="flex items-center justify-end gap-1">
                        <ProductTypeSheet
                          mode="edit"
                          isLoading={isMutating}
                          initialData={productType}
                          onSubmit={handleSubmitProductType}
                        >
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 sm:h-8 sm:w-8"
                            disabled={isMutating}
                          >
                            <Edit className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                          </Button>
                        </ProductTypeSheet>
                        <DeleteDialog
                          isLoading={isMutating}
                          setIsLoading={setIsMutating}
                          productType={productType}
                          fetchProductTypes={fetchProductTypes}
                        >
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 sm:h-8 sm:w-8 text-destructive"
                            disabled={isMutating}
                          >
                            <Trash2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
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
  initialData?: ProductType & { is_Active: boolean; is_onlyType: boolean };
  onSubmit: (data: ProductType & { is_Active: boolean; is_onlyType: boolean }) => Promise<void>;
  isLoading: boolean;
}) {
  const [name, setName] = useState("");
  const [open, onOpenChange] = useState(false);
  const [active, setActive] = useState(true);
  const [onlyType, setOnlyType] = useState(false);

  const handleOpenChange = (nextOpen: boolean) => {
    onOpenChange(nextOpen);

    if (nextOpen) {
      setName(initialData?.name ?? "");
      setActive(initialData?.is_Active ?? true);
      setOnlyType(initialData?.is_onlyType ?? false);
    } else {
      setName("");
      setActive(true);
      setOnlyType(false);
    }
  };

  const handleSubmit = async () => {
    try {
      await onSubmit({
        id: initialData?.id ?? 0,
        name,
        is_Active: active,
        is_onlyType: onlyType,
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

      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="text-lg sm:text-xl">
            {isEdit ? "Edit Product Type" : "Add New Product Type"}
          </SheetTitle>
          <SheetDescription className="text-xs sm:text-sm">
            {isEdit
              ? "Update the selected product type."
              : "Add a new product type to the system."}
          </SheetDescription>
        </SheetHeader>

        <div className="py-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="product-type-name" className="text-sm">
              Product Type Name
            </Label>
            <Input
              id="product-type-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter product type name"
              className="text-sm"
            />
          </div>

          <div className="flex flex-col">
            <Label htmlFor="product-type-name" className="text-sm">
              Is only Type
            </Label>
            <div className="flex content-center space-x-2 mt-2">
              <Switch
                checked={onlyType}
                onCheckedChange={setOnlyType}
                id="product-type-onlyType"
              />
              <Label htmlFor="product-type-onlyType" className="text-sm">
                {onlyType ? "True" : "False"}
              </Label>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              checked={active}
              onCheckedChange={setActive}
              id="product-type-active"
            />
            <Label htmlFor="product-type-active" className="text-sm">
              {active ? "Active" : "Inactive"}
            </Label>
          </div>
        </div>

        <SheetFooter className="mt-6 sm:mt-0">
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
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
  productType: ProductType & { is_Active: boolean; is_onlyType: boolean };
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
        error instanceof Error
          ? error.message
          : "Failed to delete product type",
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
