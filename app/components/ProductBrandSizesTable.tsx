"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronUp, CircleQuestionMark } from "lucide-react";
import { ChevronDown, ChevronRight } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  Brand,
  BrandGroup,
  ProductType,
  Size,
  SizeProduct,
  BrandTypeWithDetails,
} from "@/types/product";
import axios, { AxiosError } from "axios";
import { useToast } from "@/contexts/ToastContext";
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
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Get size order for sorting from smallest to largest
const getSizeOrder = (value: string): number => {
  const normalized = value.toLowerCase().replace(/\s+/g, " ").trim();

  // Count how many "extra"/"x" prefixes there are to handle XS, XL, XXL, XXXL etc.
  const extraPrefixMatch = normalized.match(/^(x+|extra\s+)+/);
  const prefixCount = extraPrefixMatch
    ? extraPrefixMatch[0].replace(/extra\s+/g, "x").replace(/\s/g, "").length
    : 0;

  if (normalized.includes("small")) return 10 - prefixCount; // XS=9, XXS=8 (smaller = lower index)
  if (normalized === "medium" || normalized === "m") return 20;
  if (normalized.includes("large")) return 30 + prefixCount; // L=30, XL=31, XXL=32 (larger = higher index)

  return 99; // unknown sizes go to the end
};

// Fetch size products from API
const fetchSizeProducts = async () => {
  try {
    const response = await axios.get("/api/size-products");
    if (!response.data) {
      throw new Error("Failed to fetch sizes");
    }
    const data = response.data;
    return data;
  } catch (error) {
    console.error("Error fetching size products:", error);
    return [];
  }
};

const fetchBrandTypes = async () => {
  try {
    const response = await axios.get("/api/brand-types");
    if (!response.data) {
      throw new Error("Failed to fetch brand types");
    }
    const data = response.data;
    return data;
  } catch (error) {
    console.error("Error fetching brand types:", error);
    return [];
  }
};

// Fetch sizes from API
const fetchSizes = async () => {
  try {
    const response = await axios.get("/api/sizes");
    if (!response.data) {
      throw new Error("Failed to fetch sizes");
    }
    const data = response.data;
    return data;
  } catch (error) {
    console.error("Error fetching size products:", error);
    return [];
  }
};

export default function ProductBrandSizesTable({
  refetchSize,
}: {
  refetchSize: number;
}) {
  const [sizeProducts, setSizeProducts] = useState<SizeProduct[]>([]);
  const [brandTypes, setBrandTypes] = useState<BrandTypeWithDetails[]>([]);
  const [sizes, setSizes] = useState<Size[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [expandedTypes, setExpandedTypes] = useState<Set<string>>(
    new Set(["Shirt"]),
  );
  const [hasExpanded, setHasExpanded] = useState(false);
  const [originalState, setOriginalState] = useState<SizeProduct[]>([]);
  const [pendingChanges, setPendingChanges] = useState<{
    toAdd: { brandT_id: number; size_id: number }[];
    toDelete: number[];
  }>({ toAdd: [], toDelete: [] });

  const { addToast } = useToast();

  // Fetch data by axios and set it to a state
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const data = await fetchSizeProducts();
        setSizeProducts(data);
        setOriginalState(data);

        const brandTypesData = await fetchBrandTypes();

        setBrandTypes(brandTypesData);

        // Fetch sizes and set them
        const sizesData = await fetchSizes();
        setSizes(sizesData);
      } catch (error) {
        console.error("Error loading size products:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [refetchSize]);

  // Calculate diff between current and original state
  const calculateDiff = (current: SizeProduct[], original: SizeProduct[]) => {
    const toDelete = original
      .filter(
        (orig) =>
          !current.find(
            (curr) =>
              curr.brandT_id === orig.brandT_id &&
              curr.size_id === orig.size_id,
          ),
      )
      .map((item) => item.id);

    const toAdd = current
      .filter((curr) => {
        const existsInOriginal = original.find(
          (orig) =>
            orig.brandT_id === curr.brandT_id && orig.size_id === curr.size_id,
        );

        return !existsInOriginal;
      })
      .map((item) => ({
        brandT_id: item.brandT_id,
        size_id: item.size_id,
      }));

    return { toAdd, toDelete };
  };

  // Check if there are pending changes
  const hasChanges =
    pendingChanges.toAdd.length > 0 || pendingChanges.toDelete.length > 0;

  // Group brands by product type
  const groupedByProductType = useMemo(() => {
    const map = new Map<
      string,
      {
        productTypeName: string;
        brandTypes: Map<number, BrandGroup & { hasBrandName: boolean }>;
      }
    >();

    // First, build complete structure from ALL brand-types relationships
    brandTypes.forEach((brandType) => {
      const productTypeName = brandType.product_type.name;
      const brandName = brandType.brands?.name ?? null;
      const hasBrandName = brandName !== null;

      if (!map.has(productTypeName)) {
        map.set(productTypeName, {
          productTypeName,
          brandTypes: new Map(),
        });
      }

      const productGroup = map.get(productTypeName)!;

      if (!productGroup.brandTypes.has(brandType.id)) {
        productGroup.brandTypes.set(brandType.id, {
          brandTypeId: brandType.id,
          brandName,
          sizes: new Set<string>(), // Start empty — sizes will be populated below
          brandTypeRef: {
            id: brandType.id,
            brands: brandName ? { name: brandName } : { name: "" },
            product_type: { name: productTypeName },
          },
          sizeId: 0,
          hasBrandName, // ✅ stored early
        });
      }
    });

    // Then, populate sizes from existing size products
    sizeProducts.forEach((item) => {
      const productTypeName = item.brand_type?.product_type?.name ?? "Unknown";

      const productGroup = map.get(productTypeName);
      if (!productGroup) return;

      const brandTypeGroup = productGroup.brandTypes.get(item.brand_type.id);
      if (!brandTypeGroup) return;

      brandTypeGroup.sizes.add(item.sizes.value);
    });

    return Array.from(map.values())
      .sort((a, b) =>
        b.productTypeName.localeCompare(a.productTypeName, undefined, {
          sensitivity: "base",
        }),
      )
      .map((group) => ({
        productTypeName: group.productTypeName,
        brands: Array.from(group.brandTypes.values()).sort((a, b) =>
          (a.brandName ?? "").localeCompare(b.brandName ?? ""),
        ),
      }));
  }, [brandTypes, sizeProducts]);

  // Handles the expansion of each product type using a button
  const toggleTypeExpanded = (
    productTypeName: string,
    productTypeNames?: string[],
  ) => {
    if (productTypeNames && productTypeNames.length > 0) {
      const newExpanded = new Set(productTypeNames);
      setExpandedTypes(newExpanded);
      return;
    }
    const newExpanded = new Set(expandedTypes);
    if (newExpanded.has(productTypeName)) {
      newExpanded.delete(productTypeName);
    } else {
      newExpanded.add(productTypeName);
    }
    setExpandedTypes(newExpanded);
  };

  // Helper functions for "ALL" checkbox functionality
  const isAllChecked = (brand: BrandGroup): boolean => {
    return sizes.every(({ value }) => brand.sizes.has(value));
  };

  // Handles the "ALL" checkbox functionality
  const handleAllToggle = (brand: BrandGroup, isChecked: boolean) => {
    // Use the brandTypeRef from the brand group, or find it from existing data
    const brandTypeRef =
      brand.brandTypeRef ||
      sizeProducts.find((item) => item.brand_type?.id === brand.brandTypeId)
        ?.brand_type ||
      originalState.find((item) => item.brand_type?.id === brand.brandTypeId)
        ?.brand_type;

    if (!brandTypeRef) return;

    setSizeProducts((prev) => {
      let newProducts = [...prev];

      if (isChecked) {
        // Add all missing sizes for this brand
        sizes.forEach(({ id: sizeId, value }) => {
          const exists = newProducts.some(
            (item) =>
              // Handle both cases: items with valid brand_type.id and items with brandT_id: null
              (item.brand_type?.id === brand.brandTypeId ||
                (item.brandT_id === null &&
                  item.brand_type?.id === brand.brandTypeId)) &&
              item.sizes.value === value,
          );

          if (!exists) {
            const nextId =
              newProducts.reduce((maxId, item) => Math.max(maxId, item.id), 0) +
              1;
            newProducts.push({
              id: nextId,
              sizes: { value },
              brand_type: brandTypeRef,
              brandT_id: brand.brandTypeId,
              size_id: sizeId,
            });
          }
        });
      } else {
        // Remove all sizes for this brand
        newProducts = newProducts.filter(
          (item) =>
            // Handle both cases: items with valid brand_type.id and items with brandT_id: null
            !(
              item.brand_type?.id === brand.brandTypeId ||
              (item.brandT_id === null &&
                item.brand_type?.id === brand.brandTypeId)
            ),
        );
      }

      // Update pending changes
      const diff = calculateDiff(newProducts, originalState);
      setPendingChanges(diff);

      return newProducts;
    });
  };

  // Checkbox toggle logic
  const handleSizeChange = (
    brandTypeId: number,
    brandName: string,
    size: string,
    sizeId: number,
    isMug: boolean,
  ) => {
    setSizeProducts((prev) => {
      const existingIndex = prev.findIndex(
        (item) =>
          item.brand_type?.id === brandTypeId && item.sizes.value === size,
      );

      let newProducts;
      if (existingIndex !== -1) {
        newProducts = prev.filter((_, idx) => idx !== existingIndex);
      } else {
        // Find brand type reference from current brand groups or existing data
        const brandGroup = groupedByProductType
          .flatMap((group) => group.brands)
          .find((brand) => brand.brandTypeId === brandTypeId);

        const brandTypeRef =
          brandGroup?.brandTypeRef ||
          prev.find((item) => item.brand_type?.id === brandTypeId)
            ?.brand_type ||
          originalState.find((item) => item.brand_type?.id === brandTypeId)
            ?.brand_type;

        if (!brandTypeRef) return prev;

        const nextId =
          prev.reduce((maxId, item) => Math.max(maxId, item.id), 0) + 1;
        newProducts = [
          ...prev,
          {
            id: nextId,
            sizes: { value: size },
            brand_type: brandTypeRef,
            brandT_id: brandTypeId,
            size_id: sizeId, // Use the actual sizeId passed from the checkbox
          },
        ];
      }

      // Update pending changes with the new state
      const diff = calculateDiff(newProducts, originalState);
      setPendingChanges(diff);

      return newProducts;
    });
  };

  // Saving the changes logic
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const diff = calculateDiff(sizeProducts, originalState);

      // Execute parallel API calls
      const promises = [];

      if (diff.toAdd.length > 0) {
        promises.push(axios.post("/api/size-products", { items: diff.toAdd }));
      }

      if (diff.toDelete.length > 0) {
        promises.push(
          axios.delete("/api/size-products", { data: { ids: diff.toDelete } }),
        );
      }

      if (promises.length > 0) {
        await Promise.all(promises);

        // Refresh data after successful save
        const freshData = await fetchSizeProducts();
        setSizeProducts(freshData);
        setOriginalState(freshData);
        setPendingChanges({ toAdd: [], toDelete: [] });
      }
      addToast("success", "Size products saved successfully");
    } catch (error) {
      const axiosError = error as AxiosError<{
        error?: string;
        message?: string;
      }>;

      const message =
        axiosError.response?.data?.error ||
        axiosError.response?.data?.message ||
        axiosError.message ||
        "Failed to save size";

      console.error(message);
      addToast("error", message);
    } finally {
      setIsSaving(false);
    }
  };

  // Discard changes logic
  const handleDiscard = () => {
    setSizeProducts(originalState);
    setPendingChanges({ toAdd: [], toDelete: [] });
  };

  return (
    <Card
      className={cn(
        "relative py-4 sm:py-6 max-w-full overflow-hidden",
        hasChanges && "pb-[120px] sm:pb-[105px]",
      )}
    >
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <CardTitle className="text-lg sm:text-2xl">Brand Sizes</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Manage sizes for each brand in your store.
          </CardDescription>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full sm:w-auto gap-2 cursor-pointer text-xs sm:text-sm"
          onClick={() => {
            if (!hasExpanded) {
              const productTypeNames = groupedByProductType.map(
                (productType) => productType.productTypeName,
              );
              toggleTypeExpanded("", productTypeNames);
              setHasExpanded(true);
            } else {
              setExpandedTypes(new Set());
              setHasExpanded(false);
            }
          }}
        >
          {hasExpanded ? (
            <>
              <ChevronUp className="size-4" />
              Hide All Products
            </>
          ) : (
            <>
              <ChevronDown className="size-4" />
              Show All Products
            </>
          )}
        </Button>
      </CardHeader>

      <CardContent className="space-y-6">
        {isLoading
          ? // Skeleton Loader
            Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="space-y-4">
                <div className="flex items-center gap-3 pb-4 border-b border-border">
                  <div className="w-10 h-10 bg-muted animate-pulse rounded-md" />
                  <div className="h-6 w-32 bg-muted animate-pulse rounded-md" />
                  <div className="h-5 w-16 bg-muted animate-pulse rounded-md ml-auto" />
                </div>
                <div className="w-full overflow-x-auto border rounded-md">
                  <Table className="w-full min-w-max border-collapse">
                    <TableHeader className="border-b border-border">
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="text-muted-foreground sticky left-0 bg-background z-20 px-4 border-r min-w-[140px] sm:min-w-[180px]">
                          Brand Name
                        </TableHead>
                        <TableHead className="text-muted-foreground text-center min-w-[70px] sm:min-w-24">
                          ALL
                        </TableHead>
                        {Array.from({ length: 6 }).map((_, index) => (
                          <TableHead
                            key={index}
                            className="text-muted-foreground text-center min-w-[70px] sm:min-w-24"
                          >
                            <Skeleton className="h-5 w-12 mx-auto" />
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Array.from({ length: 4 }).map((_, brandIndex) => (
                        <TableRow
                          key={brandIndex}
                          className="border-border hover:bg-secondary/30 transition-colors"
                        >
                          <TableCell className="text-foreground font-medium sticky left-0 bg-background z-10 px-4 border-r min-w-[140px] sm:min-w-[180px]">
                            <Skeleton className="h-5 w-24" />
                          </TableCell>
                          <TableCell className="text-center">
                            <Skeleton className="size-5 sm:size-7 mx-auto" />
                          </TableCell>
                          {Array.from({ length: 6 }).map((_, size) => (
                            <TableCell key={size} className="text-center">
                              <Skeleton className="size-5 sm:size-7 mx-auto" />
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            ))
          : groupedByProductType.map((productTypeGroup) => (
              <div key={productTypeGroup.productTypeName} className="space-y-4">
                <div className="flex items-center gap-3 pb-4 border-b border-border">
                  <Button
                    onClick={() =>
                      toggleTypeExpanded(productTypeGroup.productTypeName)
                    }
                    variant="ghost"
                    className="cursor-pointer gap-2 pl-1 h-8 sm:h-10"
                  >
                    {expandedTypes.has(productTypeGroup.productTypeName) ? (
                      <ChevronDown className="size-4 sm:size-5" />
                    ) : (
                      <ChevronRight className="size-4 sm:size-5" />
                    )}
                    <h2 className="text-lg sm:text-xl font-semibold text-foreground">
                      {productTypeGroup.productTypeName}
                    </h2>
                  </Button>
                  <span className="text-[10px] sm:text-sm text-muted-foreground ml-auto">
                    {productTypeGroup.brands.length} brand
                    {productTypeGroup.brands.length !== 1 ? "s" : ""}
                  </span>
                </div>
                <div
                  className={cn(
                    "w-full overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent rounded-md",
                    expandedTypes.has(productTypeGroup.productTypeName)
                      ? "border"
                      : "",
                  )}
                >
                  {expandedTypes.has(productTypeGroup.productTypeName) && (
                    <Table className="w-full min-w-max border-collapse">
                      <TableHeader className="border-b border-border">
                        <TableRow className="hover:bg-transparent h-10 sm:h-12">
                          {productTypeGroup.brands.some(
                            (brand) => brand.hasBrandName,
                          ) && (
                            <TableHead className="text-muted-foreground sticky left-0 bg-background z-30 px-2 sm:px-4 border-r min-w-[110px] sm:min-w-[180px] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] text-[10px] sm:text-xs">
                              Brand Name
                            </TableHead>
                          )}
                          <TableHead className="text-muted-foreground text-center min-w-[50px] sm:min-w-24 px-2 sm:px-4 text-[10px] sm:text-xs">
                            ALL
                          </TableHead>
                          {sizes
                            .sort(
                              (a, b) =>
                                getSizeOrder(a.value) - getSizeOrder(b.value),
                            )
                            .map(({ id, value }) => (
                              <Tooltip key={id}>
                                <TooltipTrigger asChild>
                                  <TableHead
                                    key={id}
                                    className="text-muted-foreground text-center min-w-[60px] sm:min-w-24 px-2 sm:px-4 text-[10px] sm:text-xs"
                                  >
                                    {value}
                                  </TableHead>
                                </TooltipTrigger>
                                <TooltipContent>{value}</TooltipContent>
                              </Tooltip>
                            ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {productTypeGroup.brands.map((brand) => (
                          <TableRow
                            key={`${brand.brandTypeId}-${brand.brandName}`}
                            className="border-border hover:bg-secondary/30 transition-colors group h-10 sm:h-12"
                          >
                            {productTypeGroup.brands.some(
                              (brand) => brand.hasBrandName,
                            ) && (
                              <TableCell className="text-foreground font-medium sticky left-0 bg-background z-20 px-2 sm:px-4 border-r whitespace-nowrap min-w-[110px] sm:min-w-[180px] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] group-hover:bg-[#f4f4f5] dark:group-hover:bg-[#18181b] transition-colors text-[11px] sm:text-sm">
                                {brand.brandName}
                              </TableCell>
                            )}
                            <TableCell className="text-center px-2 sm:px-4">
                              <Checkbox
                                checked={isAllChecked(brand)}
                                onCheckedChange={(checked) =>
                                  handleAllToggle(brand, checked as boolean)
                                }
                                className="cursor-pointer size-4 sm:size-6"
                              />
                            </TableCell>
                            {sizes.map(({ id, value }) => (
                              <TableCell
                                key={id}
                                className="text-center px-2 sm:px-4"
                              >
                                <Checkbox
                                  checked={brand.sizes.has(value)}
                                  onCheckedChange={() =>
                                    handleSizeChange(
                                      brand.brandTypeId,
                                      brand.brandName,
                                      value,
                                      id,
                                      productTypeGroup.productTypeName ===
                                        "Mug",
                                    )
                                  }
                                  className="cursor-pointer size-4 sm:size-6"
                                />
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </div>
              </div>
            ))}
      </CardContent>

      {hasChanges && (
        <CardFooter className="fixed bottom-0 left-0 right-0 bg-background border-t border-border px-4 py-4 sm:py-6 z-30">
          <div className="w-full lg:ml-[275px] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <CircleQuestionMark className="size-5 sm:size-6 text-muted-foreground" />
              <span className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
                You have unsaved changes. Do you want to save?
              </span>
            </div>
            <div className="flex w-full sm:w-auto gap-2 sm:gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDiscard}
                disabled={isSaving}
                className="flex-1 sm:flex-none cursor-pointer"
              >
                Discard
              </Button>
              <SaveChangesDialog onSubmit={handleSave} isSaving={isSaving}>
                <Button
                  size="sm"
                  disabled={isSaving}
                  className="flex-1 sm:flex-none cursor-pointer"
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </SaveChangesDialog>
            </div>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}

function SaveChangesDialog({
  children,
  onSubmit,
  isSaving,
}: {
  children: React.ReactNode;
  onSubmit: () => Promise<void>;
  isSaving?: boolean;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Save Size Changes?</DialogTitle>
          <DialogDescription>
            This will update the available sizes for your products. This action
            cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={isSaving}>
              Cancel
            </Button>
          </DialogClose>
          <Button onClick={onSubmit} disabled={isSaving}>
            {isSaving ? "Saving..." : "Confirm Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
