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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/contexts/ToastContext";

const fetchBrands = async () => {
  const response = await axios.get(`/api/brands`);

  if (!response.data) {
    throw new Error("Failed to fetch brands");
  }
  return response.data;
};

const fetchProductTypes = async () => {
  const response = await axios.get(`/api/product-types`);
  if (!response.data) {
    throw new Error("Failed to fetch product types");
  }
  return response.data;
};

interface BrandExtended extends Brand {
  brand_type: {
    type_id: 1;
  }[];
}

export default function BrandsTab() {
  const [brands, setBrands] = useState<BrandExtended[]>([]);
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);
  const [isFetchingBrands, setIsFetchingBrands] = useState(false);
  const [isMutating, setIsMutating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addToast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError(null);
        setIsFetchingBrands(true);

        // Fetch brands
        const brands = await fetchBrands();
        setBrands(brands);

        // Fetch product types
        const productTypes = await fetchProductTypes();
        setProductTypes(productTypes);
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
        setError(
          error instanceof Error ? error.message : "Something went wrong",
        );
      } finally {
        setIsFetchingBrands(false);
      }
    };
    fetchData();
  }, []);

  const handleSubmitBrand = async (
    payload: Brand & { is_Active: boolean; type_id?: number },
  ) => {
    const { type_id, id: brand_id, name, is_Active } = payload;

    setIsMutating(true);
    try {
      if (brand_id) {
        // UPDATE
        const res = await axios.put(`/api/brands`, {
          id: brand_id,
          name,
          is_Active,
        });

        // Check HTTP status
        if (res.status !== 200) {
          const errorData = res.data;
          throw new Error(errorData?.error || "Failed to update brand");
        }
        addToast("success", "Brand updated successfully");
      } else {
        // SAVE - Use atomic operation
        if (!type_id) {
          throw new Error("Product type is required when creating a brand");
        }

        const res = await axios.post("/api/brands", {
          name,
          is_Active,
          type_id,
        });

        // Check HTTP status
        if (res.status !== 201) {
          const errorData = res.data;
          throw new Error(errorData?.error || "Failed to save brand");
        }
        addToast("success", "Brand saved successfully");
      }

      await fetchBrands();
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
                          fetchBrands={fetchBrands}
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
    data: Brand & { is_Active: boolean; type_id?: number },
  ) => Promise<void>;
  isLoading: boolean;
  productTypes: ProductType[];
}) {
  const [name, setName] = useState("");
  const [selectedTypeId, setSelectedTypeId] = useState<number | undefined>();
  const [open, onOpenChange] = useState(false);
  const [active, setActive] = useState(true);

  const handleOpenChange = (nextOpen: boolean) => {
    onOpenChange(nextOpen);

    if (nextOpen) {
      setName(initialData?.name ?? "");
      setActive(initialData?.is_Active ?? true);
      setSelectedTypeId(initialData?.type_id);
    } else {
      setName("");
      setActive(true);
      setSelectedTypeId(undefined);
    }
  };

  const handleSubmit = async () => {
    try {
      await onSubmit({
        id: initialData?.id ?? 0,
        name,
        is_Active: active,
        type_id: selectedTypeId,
      });
      setName("");
      setSelectedTypeId(undefined);
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

          <div className="space-y-2">
            <Label htmlFor="product-type">Product Type</Label>
            <Select
              value={selectedTypeId?.toString()}
              onValueChange={(value: string) =>
                setSelectedTypeId(Number(value))
              }
              disabled={isEdit}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a product type" />
              </SelectTrigger>
              <SelectContent>
                {productTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id.toString()}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Switch checked={active} onCheckedChange={setActive} />
            <Label className="text-xs lg:text-sm">
              {active ? "Active" : "Inactive"}
            </Label>
          </div>
        </div>

        <SheetFooter>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || (!isEdit && !selectedTypeId)}
          >
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
