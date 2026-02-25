"use client";

import { useEffect, useState, useRef } from "react";
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
import { Edit, Trash2, Plus, Upload, X } from "lucide-react";
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
import axios from "axios";
import Image from "next/image";

export default function ProductTypesTab() {
  const [productTypes, setProductTypes] = useState<
    (ProductType & { images: { file: File; is_hasBack: boolean }[] })[]
  >([]);
  const [isFetchingProductTypes, setIsFetchingProductTypes] = useState(false);
  const [isMutating, setIsMutating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addToast } = useToast();

  const fetchProductTypes = async () => {
    try {
      setError(null);
      setIsFetchingProductTypes(true);

      const response = await axios.get(`/api/product-types`);

      if (!response.data) {
        throw new Error("Failed to fetch product types");
      }

      const productTypes = response.data;
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
    payload: ProductType & { images: { file: File; is_hasBack: boolean }[] },
  ) => {
    setIsMutating(true);
    try {
      const formData = new FormData();

      // Append basic product type data
      formData.append("id", payload.id.toString());
      formData.append("name", payload.name);
      formData.append("is_Active", (payload.is_Active ?? true).toString());
      formData.append("is_onlyType", (payload.is_onlyType ?? false).toString());

      // Append images with their metadata
      payload.images.forEach((imageData, index) => {
        formData.append(`images[${index}].file`, imageData.file);
        formData.append(
          `images[${index}].is_hasBack`,
          imageData.is_hasBack.toString(),
        );
      });

      if (payload.id) {
        // UPDATE
        const response = await axios.put("/api/product-types", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        if (!response.data) {
          throw new Error("Failed to update product type");
        }

        addToast("success", "Product type updated successfully");
      } else {
        // SAVE
        const response = await axios.post("/api/product-types", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        if (!response.data) {
          throw new Error("Failed to save product type");
        }

        addToast("success", "Product type saved successfully");
      }

      await fetchProductTypes();
    } catch (error) {
      console.error(error);
      const errorMessage = axios.isAxiosError(error)
        ? error.response?.data?.error || error.message
        : error instanceof Error
          ? error.message
          : "Failed to save product type";

      addToast("error", errorMessage);
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
  initialData?: ProductType & { images: { file: File; is_hasBack: boolean }[] };
  onSubmit: (
    data: ProductType & { images: { file: File; is_hasBack: boolean }[] },
  ) => Promise<void>;
  isLoading: boolean;
}) {
  const [name, setName] = useState("");
  const [open, onOpenChange] = useState(false);
  const [active, setActive] = useState(true);
  const [onlyType, setOnlyType] = useState(false);
  const [assigned, setAssigned] = useState("");
  const [assets, setAssets] = useState<{ file: File; is_hasBack: boolean }[]>(
    [],
  );
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const handleFileChange = (slotId: string, file: File | null) => {
    if (file) {
      if (assets.length >= 2) {
        alert("Maximum of 2 images allowed.");
        if (fileInputRefs.current[slotId]) {
          fileInputRefs.current[slotId]!.value = "";
        }
        return;
      }

      const isFrontTaken = assets.some((a) => !a.is_hasBack);
      const isBackTaken = assets.some((a) => a.is_hasBack);

      let is_hasBack = false;
      if (isFrontTaken && !isBackTaken) {
        is_hasBack = true;
      } else if (isFrontTaken && isBackTaken) {
        if (fileInputRefs.current[slotId]) {
          fileInputRefs.current[slotId]!.value = "";
        }
        return;
      }

      setAssets((prev) => [...prev, { file, is_hasBack }]);
      if (fileInputRefs.current[slotId]) {
        fileInputRefs.current[slotId]!.value = "";
      }
    }
  };

  const removeAsset = (index: number) => {
    setAssets((prev) => prev.filter((_, i) => i !== index));
  };

  const togglePlacement = (index: number) => {
    const nextIsBack = !assets[index].is_hasBack;

    const updatedAssets = assets.map((a, i) =>
      i === index ? { ...a, is_hasBack: nextIsBack } : a,
    );

    const frontCount = updatedAssets.filter((a) => !a.is_hasBack).length;
    const backCount = updatedAssets.filter((a) => a.is_hasBack).length;

    if (frontCount > 1 || backCount > 1) {
      setAssigned(
        "*Only one image should be assigned to the front or the back.",
      );
    } else {
      setAssigned("");
    }

    setAssets(updatedAssets);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    onOpenChange(nextOpen);

    if (nextOpen) {
      setName(initialData?.name ?? "");
      setActive(initialData?.is_Active ?? true);
      setOnlyType(initialData?.is_onlyType ?? false);
      setAssets([]);
    } else {
      setName("");
      setActive(true);
      setOnlyType(false);
      setAssets([]);
    }
  };

  const handleSubmit = async () => {
    try {
      await onSubmit({
        id: initialData?.id ?? 0,
        name,
        is_Active: active,
        is_onlyType: onlyType,
        images: assets,
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

          {name.length === 0 && (
            <p className="text-red-500 text-sm italic">
              *Product Type Name is required before saving.
            </p>
          )}

          <div className="space-y-4">
            <Label htmlFor="product-type-image" className="text-sm font-medium">
              Product Type Images
            </Label>
            <Input
              type="file"
              accept="image/*"
              className="hidden"
              id="product-type-image-input"
              ref={(el) => {
                fileInputRefs.current["image"] = el;
              }}
              onChange={(e) =>
                handleFileChange("image", e.target.files?.[0] || null)
              }
            />
            <div
              className={`group flex items-center justify-between p-3 rounded-xl border border-gray-200 transition-colors min-w-0 bg-gray-50/50 cursor-pointer ${assets.length < 2 ? "" : "hidden"}`}
              onClick={() => {
                if (assets.length < 2) {
                  fileInputRefs.current["image"]?.click();
                }
              }}
            >
              <span className="text-sm truncate mr-2 text-gray-600">
                Upload Product Type Image
              </span>
              <Upload className="w-6 h-6 text-gray-400 group-hover:text-gray-600 mb-2" />
            </div>

            {/* Image List */}
            {assets.length > 0 && (
              <div className="space-y-2 mt-4 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                {assets.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 rounded-lg border border-gray-200 bg-white"
                  >
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                      <div className="w-10 h-10 rounded border border-gray-100 shrink-0 overflow-hidden flex items-center justify-center bg-gray-50">
                        <Image
                          src={URL.createObjectURL(item.file)}
                          alt="preview"
                          width={40}
                          height={40}
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-semibold text-gray-900 truncate">
                          {item.file.name}
                        </span>
                        <div className="flex items-center space-x-1 mt-0.5">
                          <span
                            className={`text-[9px] px-1.5 py-0.5 rounded-full ${item.is_hasBack ? "bg-orange-50 text-orange-600 font-medium" : "bg-blue-50 text-blue-600 font-medium"}`}
                          >
                            {item.is_hasBack ? "Back" : "Front"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 ml-4">
                      <div className="flex items-center space-x-2">
                        <span
                          className={`text-[10px] ${!item.is_hasBack ? "text-gray-900 font-bold" : "text-gray-400"}`}
                        >
                          F
                        </span>
                        <Switch
                          checked={item.is_hasBack}
                          onCheckedChange={() => togglePlacement(index)}
                          className="scale-75"
                        />
                        <span
                          className={`text-[10px] ${item.is_hasBack ? "text-gray-900 font-bold" : "text-gray-400"}`}
                        >
                          B
                        </span>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeAsset(index);
                        }}
                        className="p-1 rounded-full hover:bg-red-50 text-red-500 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {assigned && assets.length !== 0 && (
            <p className="text-red-500 text-sm italic">{assigned}</p>
          )}

          {assets.length === 0 && (
            <p className="text-red-500 text-sm italic">
              *Product Type Image is required before saving.
            </p>
          )}

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
            disabled={
              isLoading ||
              name.length === 0 ||
              assets.length === 0 ||
              assigned.length > 0
            }
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
  productType: ProductType & { images: { file: File; is_hasBack: boolean }[] };
  fetchProductTypes: () => Promise<void>;
}) {
  const { addToast } = useToast();
  const [open, setOpen] = useState(false);

  const handleDeleteProductType = async () => {
    if (!productType.id) return;

    setIsLoading(true);
    try {
      const res = await axios.delete(`/api/product-types?id=${productType.id}`);

      if (!res.data) {
        throw new Error("Failed to delete product type");
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
            {productType.is_onlyType && (
              <>
                {" "}
                Since this is an &quot;Only Type&quot; product, the system will also check for and remove any unused brand type associations.
              </>
            )}
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
