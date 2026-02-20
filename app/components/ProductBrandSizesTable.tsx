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
import { cn } from "@/lib/utils";
import { BrandGroup, Size, SizeProduct } from "@/types/product";
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

// Abbreviate size values like "Extra Small" to "XS"
const abbreviateSize = (value: string): string => {
  const WORD_MAP: Record<string, string> = {
    extra: "X",
    double: "XX",
    triple: "XXX",
  };

  // Normalize common run-together prefixes before splitting
  const normalized = value
    .replace(/^XX/i, "Double ")
    .replace(/^X(?=[A-Z])/i, "Extra ");

  return normalized
    .split(/[\s-]+/)
    .map((word) => {
      const lower = word.toLowerCase();
      return WORD_MAP[lower] ?? word[0].toUpperCase();
    })
    .join("");
};

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
        brandTypes: Map<number, BrandGroup>;
      }
    >();
    // ✅ First, seed ALL brands from originalState so they always appear
    originalState.forEach((item) => {
      const productTypeName = item.brand_type?.product_type?.name || "Unknown";
      const brandName = item.brand_type?.brands?.name || "Unknown";

      if (!map.has(productTypeName)) {
        map.set(productTypeName, { productTypeName, brandTypes: new Map() });
      }

      const productGroup = map.get(productTypeName)!;

      if (!productGroup.brandTypes.has(item.brand_type.id)) {
        productGroup.brandTypes.set(item.brand_type.id, {
          brandTypeId: item.brand_type.id,
          brandName,
          sizes: new Set(), // Start empty — sizes will be added below
          brandTypeRef: item.brand_type,
          sizeId: item.size_id,
        });
      }
    });

    // ✅ Then, populate only the currently checked sizes from sizeProducts
    sizeProducts.forEach((item) => {
      const productTypeName = item.brand_type?.product_type?.name || "Unknown";
      const productGroup = map.get(productTypeName);
      if (!productGroup) return;

      const brandTypeGroup = productGroup.brandTypes.get(item.brand_type.id);
      if (!brandTypeGroup) return;

      brandTypeGroup.sizes.add(item.sizes.value);
    });

    return Array.from(map.values()).map((group) => ({
      productTypeName: group.productTypeName,
      brands: Array.from(group.brandTypes.values()).sort((a, b) =>
        a.brandName.localeCompare(b.brandName),
      ),
    }));
  }, [sizeProducts, originalState]);

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
    const brandTypeRef =
      sizeProducts.find((item) => item.brand_type.id === brand.brandTypeId)
        ?.brand_type ??
      originalState.find((item) => item.brand_type.id === brand.brandTypeId)
        ?.brand_type; // ✅ fallback

    if (!brandTypeRef) return;

    setSizeProducts((prev) => {
      let newProducts = [...prev];

      if (isChecked) {
        // Add all missing sizes for this brand
        sizes.forEach(({ id: sizeId, value }) => {
          const exists = newProducts.some(
            (item) =>
              item.brand_type.id === brand.brandTypeId &&
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
          (item) => item.brand_type.id !== brand.brandTypeId,
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
  ) => {
    setSizeProducts((prev) => {
      const existingIndex = prev.findIndex(
        (item) =>
          item.brand_type.id === brandTypeId &&
          (item.brand_type.brands?.name || "Unknown") === brandName &&
          item.sizes.value === size,
      );

      let newProducts;
      if (existingIndex !== -1) {
        newProducts = prev.filter((_, idx) => idx !== existingIndex);
      } else {
        const brandTypeRef =
          prev.find((item) => item.brand_type.id === brandTypeId)?.brand_type ??
          originalState.find((item) => item.brand_type.id === brandTypeId)
            ?.brand_type; // ✅ fallback

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
    <Card className={cn("relative py-6", hasChanges && "pb-[105px]")}>
      <CardHeader className="flex justify-between">
        <div>
          <CardTitle>Brand Sizes</CardTitle>
          <CardDescription>
            Manage sizes for each brand in your store.
          </CardDescription>
        </div>
        <Button
          variant="outline"
          className="gap-2 pl-3 cursor-pointer"
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
              <div key={index} className="overflow-x-auto">
                <div className="flex items-center gap-3 pb-4 border-b border-border">
                  <div className="w-10 h-10 bg-muted animate-pulse rounded-md" />
                  <div className="h-6 w-32 bg-muted animate-pulse rounded-md" />
                  <div className="h-5 w-16 bg-muted animate-pulse rounded-md ml-auto" />
                </div>
                <Table>
                  <TableHeader className="border-b border-border">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="text-muted-foreground">
                        Brand Name
                      </TableHead>
                      <TableHead className="text-muted-foreground text-center min-w-24">
                        ALL
                      </TableHead>
                      {Array.from({ length: 6 }).map((_, index) => (
                        <TableHead
                          key={index}
                          className="text-muted-foreground text-center min-w-24"
                        >
                          <div className="h-5 w-24 bg-muted animate-pulse rounded-md" />
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
                        <TableCell className="text-foreground font-medium">
                          <div className="h-5 w-24 bg-muted animate-pulse rounded-md" />
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="w-7 h-7 bg-muted animate-pulse rounded-md mx-auto" />
                        </TableCell>
                        {Array.from({ length: 6 }).map((_, size) => (
                          <TableCell key={size} className="text-center">
                            <div className="w-7 h-7 bg-muted animate-pulse rounded-md mx-auto" />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ))
          : groupedByProductType.map((productTypeGroup) => (
              <div
                key={productTypeGroup.productTypeName}
                className="overflow-x-auto"
              >
                <div className="flex items-center gap-3 pb-4 border-b border-border">
                  <Button
                    onClick={() =>
                      toggleTypeExpanded(productTypeGroup.productTypeName)
                    }
                    variant="ghost"
                    className="cursor-pointer gap-2 pl-2"
                  >
                    {expandedTypes.has(productTypeGroup.productTypeName) ? (
                      <ChevronDown className="size-5!" />
                    ) : (
                      <ChevronRight className="size-5!" />
                    )}
                    <h2 className="text-xl font-semibold text-foreground">
                      {productTypeGroup.productTypeName}
                    </h2>
                  </Button>
                  <span className=" text-muted-foreground ml-auto">
                    {productTypeGroup.brands.length} brand
                    {productTypeGroup.brands.length !== 1 ? "s" : ""}
                  </span>
                </div>

                {expandedTypes.has(productTypeGroup.productTypeName) && (
                  <Table>
                    <TableHeader className="border-b border-border">
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="text-muted-foreground">
                          Brand Name
                        </TableHead>
                        <TableHead className="text-muted-foreground text-center min-w-24">
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
                                  className="text-muted-foreground text-center min-w-24"
                                >
                                  {abbreviateSize(value)}
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
                          className="border-border hover:bg-secondary/30 transition-colors"
                        >
                          <TableCell className="text-foreground font-medium">
                            {brand.brandName}
                          </TableCell>
                          <TableCell className="text-center">
                            <Checkbox
                              checked={isAllChecked(brand)}
                              onCheckedChange={(checked) =>
                                handleAllToggle(brand, checked as boolean)
                              }
                              className="cursor-pointer size-7"
                            />
                          </TableCell>
                          {sizes.map(({ id, value }) => (
                            <TableCell key={id} className="text-center">
                              <Checkbox
                                checked={brand.sizes.has(value)}
                                onCheckedChange={() =>
                                  handleSizeChange(
                                    brand.brandTypeId,
                                    brand.brandName,
                                    value,
                                    id, // Use the correct size_id from mapping
                                  )
                                }
                                className="cursor-pointer size-7"
                              />
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            ))}
      </CardContent>

      {hasChanges && (
        <CardFooter className="fixed bottom-0 left-0 right-0 bg-background border-t border-border px-4 py-8">
          <div className="ml-[275px] flex flex-1 items-center justify-between">
            <div className="flex items-center gap-2">
              <CircleQuestionMark className="size-6" />
              <span className="text-muted-foreground">
                Are you sure you want to save these changes?
              </span>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleDiscard}
                disabled={isSaving}
                className="cursor-pointer"
              >
                Discard
              </Button>
              <SaveChangesDialog onSubmit={handleSave} isSaving={isSaving}>
                <Button disabled={isSaving} className="cursor-pointer">
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
