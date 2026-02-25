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
import { ProductType, ProductImage } from "@/types/product";
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

export const validateImageClient = (file: File): Promise<void> => {
  const MIN_RATIO = 0.85;
  const MAX_RATIO = 1.15;
  const MIN_SIZE = 500;

  return new Promise((resolve, reject) => {
    const img = document.createElement("img");
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      const { width, height } = img;
      const ratio = width / height;

      URL.revokeObjectURL(objectUrl);

      if (width < MIN_SIZE || height < MIN_SIZE) {
        reject(
          new Error("Image must have at least 500 width x 500 height pixels."),
        );
        return;
      }

      if (ratio < MIN_RATIO || ratio > MAX_RATIO) {
        reject(
          new Error(
            "Image must be square (equal width and height) or near-square (at least 85% match).",
          ),
        );
        return;
      }

      resolve();
    };

    img.onerror = () => {
      reject(new Error("Invalid image file."));
    };

    img.src = objectUrl;
  });
};

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
    payload: ProductType & {
      images: { file: File; is_hasBack: boolean }[];
      imagesToDelete?: number[];
      existingImages?: { id: number; filepath: string; is_hasBack: boolean }[];
    },
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

      // Append images to delete
      if (payload.imagesToDelete && payload.imagesToDelete.length > 0) {
        payload.imagesToDelete.forEach((imageId, index) => {
          formData.append(`imagesToDelete[${index}]`, imageId.toString());
        });
      }

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
  initialData?: ProductType & {
    image_products?: { id: number; filepath: string; is_hasBack: boolean }[];
  };
  onSubmit: (
    data: ProductType & {
      images: { file: File; is_hasBack: boolean }[];
      imagesToDelete?: number[];
      existingImages?: { id: number; filepath: string; is_hasBack: boolean }[];
    },
  ) => Promise<void>;
  isLoading: boolean;
}) {
  const [name, setName] = useState("");
  const [open, onOpenChange] = useState(false);
  const [active, setActive] = useState(true);
  const [onlyType, setOnlyType] = useState(false);
  const [assigned, setAssigned] = useState("");
  const [imageValidationError, setImageValidationError] = useState("");
  const [assets, setAssets] = useState<ProductImage[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<number[]>([]);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const handleFileChange = async (slotId: string, file: File | null) => {
    if (file) {
      if (assets.length >= 2) {
        alert("Maximum of 2 images allowed.");
        if (fileInputRefs.current[slotId]) {
          fileInputRefs.current[slotId]!.value = "";
        }
        return;
      }

      // Validate image before processing
      try {
        await validateImageClient(file);
        setImageValidationError(""); // Clear any previous validation errors
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Invalid image file.";
        setImageValidationError(errorMessage);
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

      setAssets((prev) => [...prev, { file, is_hasBack, _isExisting: false }]);
      if (fileInputRefs.current[slotId]) {
        fileInputRefs.current[slotId]!.value = "";
      }
    }
  };

  const removeAsset = (index: number) => {
    const assetToRemove = assets[index];

    // If it's an existing image, add to delete list
    if (assetToRemove._isExisting) {
      setImagesToDelete((prev) => [...prev, assetToRemove.id]);
    }

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
      setImageValidationError(""); // Reset validation error when opening

      // Load existing images for edit mode
      if (mode === "edit" && initialData?.image_products) {
        const existingImages: ProductImage[] = initialData.image_products.map(
          (img) => ({
            id: img.id || 0, // Fallback for safety
            filepath: img.filepath,
            is_hasBack: img.is_hasBack,
            _isExisting: true,
          }),
        );
        setAssets(existingImages);
      } else {
        setAssets([]);
      }

      setImagesToDelete([]);
    } else {
      setName("");
      setActive(true);
      setOnlyType(false);
      setImageValidationError(""); // Reset validation error when closing
      setAssets([]);
      setImagesToDelete([]);
    }
  };

  const handleSubmit = async () => {
    try {
      // Separate new images from existing ones
      const newImages = assets.filter((asset) => !asset._isExisting) as {
        file: File;
        is_hasBack: boolean;
      }[];

      await onSubmit({
        id: initialData?.id ?? 0,
        name,
        is_Active: active,
        is_onlyType: onlyType,
        images: newImages,
        imagesToDelete,
        existingImages: assets.filter((asset) => asset._isExisting),
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
                        {item._isExisting ? (
                          <Image
                            src={item.filepath}
                            alt="preview"
                            width={40}
                            height={40}
                            className="max-w-full max-h-full object-contain"
                          />
                        ) : (
                          <Image
                            src={URL.createObjectURL(item.file)}
                            alt="preview"
                            width={40}
                            height={40}
                            className="max-w-full max-h-full object-contain"
                          />
                        )}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-semibold text-gray-900 truncate">
                          {item._isExisting
                            ? `Existing ${item.is_hasBack ? "Back" : "Front"} Image`
                            : item.file.name}
                        </span>
                        <div className="flex items-center space-x-1 mt-0.5">
                          <span
                            className={`text-[9px] px-1.5 py-0.5 rounded-full ${item.is_hasBack ? "bg-orange-50 text-orange-600 font-medium" : "bg-blue-50 text-blue-600 font-medium"}`}
                          >
                            {item.is_hasBack ? "Back" : "Front"}
                          </span>
                          {item._isExisting && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium">
                              Existing
                            </span>
                          )}
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
                          className="scale-75 data-[state=unchecked]:bg-primary"
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
          <p className="text-muted-foreground">
            Need help? View a sample of an{" "}
            <ImageDialogShowcase>
              <span className="underline font-medium text-black cursor-pointer">
                accepted image.{" "}
              </span>
            </ImageDialogShowcase>
          </p>

          {assigned && assets.length !== 0 && (
            <p className="text-red-500 text-sm italic">{assigned}</p>
          )}

          {imageValidationError && (
            <p className="text-red-500 text-sm italic">
              {imageValidationError}
            </p>
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

        <SheetFooter className="mt-6">
          <Button
            onClick={handleSubmit}
            disabled={
              isLoading ||
              name.length === 0 ||
              assets.length === 0 ||
              assigned.length > 0 ||
              imageValidationError.length > 0
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
  productType: ProductType & {
    image_products?: { id: number; filepath: string; is_hasBack: boolean }[];
  };
  fetchProductTypes: () => Promise<void>;
}) {
  const { addToast } = useToast();
  const [open, setOpen] = useState(false);

  const handleDeleteProductType = async () => {
    if (!productType.id) return;

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("id", productType.id.toString());

      // If there are images to delete, add them to FormData
      if (productType.image_products && productType.image_products.length > 0) {
        productType.image_products.forEach((image, index) => {
          formData.append(`imagesToDelete[${index}]`, image.id.toString());
        });
      }

      const res = await axios.delete("/api/product-types", {
        data: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (!res.data) {
        throw new Error("Failed to delete product type");
      }
      await fetchProductTypes();
      addToast("success", "Product type deleted successfully");
      setOpen(false);
    } catch (error) {
      console.error(error);
      const errorMessage = axios.isAxiosError(error)
        ? error.response?.data?.error || error.message
        : error instanceof Error
          ? error.message
          : "Failed to delete product type";

      addToast("error", errorMessage);
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
                Since this is an &quot;Only Type&quot; product, the system will
                also check for and remove any unused brand type associations.
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

function ImageDialogShowcase({ children }: { children: React.ReactNode }) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-[700px]!">
        <DialogHeader>
          <DialogTitle>Sample Accepted Image</DialogTitle>
          <DialogDescription>
            This is an example of an image that would be accepted for creating a
            product type.
          </DialogDescription>
        </DialogHeader>
        <figure className="size-[600px] mx-auto border">
          <Image
            src="https://tcxoekzhoslcfdotjgqg.supabase.co/storage/v1/object/public/product-images/mug.png"
            alt="Mug Image"
            width={600}
            height={600}
          />
        </figure>
        <div className="space-y-2">
          <h3>Image Requirements</h3>
          <ul className="list-disc list-inside space-y-1">
            <li>Must be a PNG or JPG file</li>
            <li>Must have a transparent background</li>
            <li>Must be at least 500x500 pixels</li>
            <li>
              Image must be square (equal width and height) or near-square (at
              least 85% match)
            </li>
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
}
