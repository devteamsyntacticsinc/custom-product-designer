"use client";

import { useEffect, useState } from "react";
import axios, { AxiosError } from "axios";
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
import { Brand, ProductType } from "@/types/product";
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
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/contexts/ToastContext";

interface BrandExtended extends Brand {
  brand_type: {
    type_id: 1;
  }[];
}

interface BrandUpdateData {
  id: number;
  name?: string;
  is_Active?: boolean;
  type_ids?: number[];
}

export default function BrandsTab() {
  const [brands, setBrands] = useState<BrandExtended[]>([]);
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);
  const [isFetchingBrands, setIsFetchingBrands] = useState(false);
  const [isMutating, setIsMutating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addToast } = useToast();

  const fetchData = async () => {
    try {
      setError(null);
      setIsFetchingBrands(true);

      // Fetch brands
      const brands = await axios.get(`/api/brands`);

      if (!brands.data) {
        throw new Error("Failed to fetch brands");
      }
      setBrands(brands.data);

      // Fetch product types
      const productTypes = await axios.get(`/api/product-types`);
      if (!productTypes.data) {
        throw new Error("Failed to fetch product types");
      }
      // Get only the is_onlyType that is false
      const newProductType = productTypes.data.filter(
        (item: ProductType) => item.is_onlyType === false,
      );
      setProductTypes(newProductType);
    } catch (error) {
      const axiosError = error as AxiosError<{
        error?: string;
        message?: string;
      }>;

      const message =
        axiosError.response?.data?.error ||
        axiosError.response?.data?.message ||
        axiosError.message ||
        "Failed to fetch data";

      console.error(message);
      addToast("error", message);
      setError(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setIsFetchingBrands(false);
    }
  };

  const handleSubmitBrand = async (
    payload: Brand & { is_Active: boolean; type_ids?: number[] },
  ) => {
    const { type_ids, id: brand_id, name, is_Active } = payload;

    setIsMutating(true);
    try {
      if (brand_id) {
        // UPDATE - Update brand info and types if provided
        const updateData: BrandUpdateData = {
          id: brand_id,
        };

        if (name !== undefined) updateData.name = name;
        if (is_Active !== undefined) updateData.is_Active = is_Active;
        if (type_ids !== undefined) updateData.type_ids = type_ids;

        const res = await axios.put(`/api/brands`, updateData);

        // Check HTTP status
        if (res.status !== 200) {
          const errorData = res.data;
          throw new Error(errorData?.error || "Failed to update brand");
        }
        addToast("success", "Brand updated successfully");
      } else {
        // SAVE - Create with multiple types
        if (!type_ids || type_ids.length === 0) {
          throw new Error("At least one product type must be selected");
        }

        const res = await axios.post("/api/brands", {
          name,
          is_Active,
          type_ids,
        });

        // Check HTTP status
        if (res.status !== 201) {
          const errorData = res.data;
          throw new Error(errorData?.error || "Failed to save brand");
        }
        addToast("success", "Brand saved successfully");
      }

      await fetchData();
    } catch (error) {
      const axiosError = error as AxiosError<{
        error?: string;
        message?: string;
      }>;

      const message =
        axiosError.response?.data?.error ||
        axiosError.response?.data?.message ||
        axiosError.message ||
        "Failed to save brand";

      addToast("error", message);
    } finally {
      setIsMutating(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0 py-4 sm:py-6">
        <div>
          <CardTitle className="text-lg lg:text-2xl">Brands</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Manage product brands available in your store
          </CardDescription>
        </div>
        <BrandSheet
          mode="create"
          isLoading={isMutating}
          onSubmit={handleSubmitBrand}
          productTypes={productTypes}
        >
          <Button
            size="sm"
            className="w-full sm:w-auto text-xs sm:text-sm h-8 sm:h-10"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Brand
          </Button>
        </BrandSheet>
      </CardHeader>
      <CardContent className="p-0 sm:p-6">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="text-xs sm:text-sm">
                <TableHead className="w-[60px]">ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Product Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isFetchingBrands ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={`brands-loading-${index}`}>
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
              ) : brands.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center py-8 text-gray-500"
                  >
                    No brands found
                  </TableCell>
                </TableRow>
              ) : (
                brands.map((brand) => (
                  <TableRow key={brand.id}>
                    <TableCell className="text-xs lg:text-sm text-gray-500">
                      #{brand.id}
                    </TableCell>
                    <TableCell className="font-medium text-xs lg:text-sm">
                      {brand.name}
                    </TableCell>
                    <TableCell>
                      {brand.type_id ? (
                        brand.brand_type.map(({ type_id }) => {
                          const type = productTypes.find(
                            (type) => type.id === type_id,
                          );
                          return (
                            <Badge key={type_id} className="mr-2">
                              {type?.name}
                            </Badge>
                          );
                        })
                      ) : (
                        <Badge variant="outline">No type assigned</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={brand.is_Active ? "default" : "secondary"}
                        className="text-[10px] px-2 py-0"
                      >
                        {brand.is_Active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <BrandSheet
                          mode="edit"
                          isLoading={isMutating}
                          initialData={brand}
                          onSubmit={handleSubmitBrand}
                          productTypes={productTypes}
                        >
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            disabled={isMutating}
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                        </BrandSheet>
                        <DeleteDialog
                          isLoading={isMutating}
                          setIsLoading={setIsMutating}
                          brand={brand}
                          fetchBrands={fetchData}
                        >
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            disabled={isMutating}
                          >
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

function BrandSheet({
  children,
  mode,
  initialData,
  onSubmit,
  isLoading,
  productTypes,
}: {
  children: React.ReactNode;
  mode: "create" | "edit";
  initialData?: BrandExtended;
  onSubmit: (
    data: Brand & { is_Active: boolean; type_ids?: number[] },
  ) => Promise<void>;
  isLoading: boolean;
  productTypes: ProductType[];
}) {
  const [name, setName] = useState("");
  const [selectedTypeIds, setSelectedTypeIds] = useState<number[]>([]);
  const [open, onOpenChange] = useState(false);
  const [active, setActive] = useState(true);

  const handleOpenChange = (nextOpen: boolean) => {
    onOpenChange(nextOpen);

    if (nextOpen) {
      setName(initialData?.name ?? "");
      setActive(initialData?.is_Active ?? true);
      setSelectedTypeIds(
        initialData?.brand_type?.map((bt) => bt.type_id) ?? [],
      );
    } else {
      setName("");
      setActive(true);
      setSelectedTypeIds([]);
    }
  };

  const handleSubmit = async () => {
    try {
      await onSubmit({
        id: initialData?.id ?? 0,
        name,
        is_Active: active,
        type_ids: selectedTypeIds,
      } as Brand & { is_Active: boolean; type_ids?: number[] });
      setName("");
      setSelectedTypeIds([]);
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
          <SheetTitle className="text-lg lg:text-xl">
            {isEdit ? "Edit Brand" : "Add New Brand"}
          </SheetTitle>
          <SheetDescription className="text-xs lg:text-sm">
            {isEdit
              ? "Update the selected brand."
              : "Add a new brand to the system."}
          </SheetDescription>
        </SheetHeader>

        <div className="py-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="brand-name" className="text-xs lg:text-sm">
              Brand Name
            </Label>
            <Input
              id="brand-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter brand name"
              className="text-xs lg:text-sm h-8 lg:h-10"
            />
          </div>

          <div className="space-y-2 mb-6">
            <Label htmlFor="product-type">Product Types</Label>
            <div className="space-y-4 max-h-32 my-4">
              {productTypes.map((type) => (
                <div key={type.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`product-type-${type.id}`}
                    checked={selectedTypeIds.includes(type.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedTypeIds([...selectedTypeIds, type.id]);
                      } else {
                        setSelectedTypeIds(
                          selectedTypeIds.filter((id) => id !== type.id),
                        );
                      }
                    }}
                    className="size-6"
                    disabled={false}
                  />
                  <Label
                    htmlFor={`product-type-${type.id}`}
                    className="text-base font-medium"
                  >
                    {type.name}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch checked={active} onCheckedChange={setActive} />
            <Label className="text-xs lg:text-sm">
              {active ? "Active" : "Inactive"}
            </Label>
          </div>
          {name.length === 0 && (
            <p className="text-red-500 text-sm italic">
              *Brand Name is required before saving.
            </p>
          )}
          {selectedTypeIds.length === 0 && (
            <p className="text-red-500 text-sm italic">
              *Product Type is required before saving.
            </p>
          )}
        </div>

        <SheetFooter>
          <Button
            onClick={handleSubmit}
            disabled={
              isLoading || selectedTypeIds.length === 0 || name.length === 0
            }
          >
            {isLoading
              ? isEdit
                ? "Updating..."
                : `Saving${selectedTypeIds.length > 1 ? ` ${selectedTypeIds.length} types` : ""}...`
              : isEdit
                ? "Update Brand"
                : `Save Brand${selectedTypeIds.length > 1 ? ` & ${selectedTypeIds.length} types` : ""}`}
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
  brand: BrandExtended;
  fetchBrands: () => Promise<void>;
}) {
  const { addToast } = useToast();
  const [open, setOpen] = useState(false);

  const handleDeleteBrand = async () => {
    if (!brand.id) return;

    setIsLoading(true);
    try {
      const res = await axios.delete(`/api/brands?id=${brand.id}`);

      if (res.status !== 200) {
        const errorData = res.data;
        throw new Error(errorData?.error || "Failed to delete brand");
      }
      await fetchBrands();
      addToast("success", "Brand deleted successfully");
      setOpen(false);
    } catch (error) {
      const axiosError = error as AxiosError<{
        error?: string;
        message?: string;
      }>;

      const message =
        axiosError.response?.data?.error ||
        axiosError.response?.data?.message ||
        axiosError.message ||
        "Failed to delete brand";

      console.error(message);
      addToast("error", message);
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
