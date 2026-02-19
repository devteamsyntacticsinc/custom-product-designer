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
import { CircleQuestionMark, Trash2 } from "lucide-react";
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
import { SizeProduct } from "@/types/product";
import axios from "axios";

const ALL_SIZES = [
  "Extra Small",
  "Small",
  "Medium",
  "Large",
  "Extra Large",
  "XXLarge",
];

const SIZE_ABBREVIATIONS: Record<string, string> = {
  "Extra Small": "XS",
  Small: "S",
  Medium: "M",
  Large: "L",
  "Extra Large": "XL",
  XXLarge: "XXL",
};

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

export default function ProductBrandSizesTable() {
  const [sizeProducts, setSizeProducts] = useState<SizeProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedTypes, setExpandedTypes] = useState<Set<string>>(
    new Set(["Shirt"]),
  );
  const [hasChanges, setHasChanges] = useState(false);
  const [originalState, setOriginalState] = useState(
    JSON.stringify(sizeProducts),
  );

  // to fetch data by axios and set it to a state
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const data = await fetchSizeProducts();
        setSizeProducts(data);
      } catch (error) {
        console.error("Error loading size products:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  console.log(sizeProducts);

  // Group brands by product type
  const groupedByProductType = useMemo(() => {
    const map = new Map<
      string,
      {
        productTypeName: string;
        brandTypes: Map<
          number,
          {
            brandTypeId: number;
            brandName: string;
            sizes: Set<string>;
            brandTypeRef: SizeProduct["brand_type"];
            sizeId: number;
          }
        >;
      }
    >();

    sizeProducts.forEach((item) => {
      const productTypeName = item.brand_type?.product_type?.name || "Unknown";
      const brandName = item.brand_type?.brands?.name || "Unknown";

      if (!map.has(productTypeName)) {
        map.set(productTypeName, {
          productTypeName,
          brandTypes: new Map(),
        });
      }

      const productGroup = map.get(productTypeName);
      if (!productGroup) return;

      if (!productGroup.brandTypes.has(item.brand_type.id)) {
        productGroup.brandTypes.set(item.brand_type.id, {
          brandTypeId: item.brand_type.id,
          brandName,
          sizes: new Set(),
          brandTypeRef: item.brand_type,
          sizeId: item.size_id,
        });
      }

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
  }, [sizeProducts]);

  // Handles the expansion of each product type using a button
  const toggleTypeExpanded = (productTypeName: string) => {
    const newExpanded = new Set(expandedTypes);
    if (newExpanded.has(productTypeName)) {
      newExpanded.delete(productTypeName);
    } else {
      newExpanded.add(productTypeName);
    }
    setExpandedTypes(newExpanded);
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

      if (existingIndex !== -1) {
        return prev.filter((_, idx) => idx !== existingIndex);
      }

      const brandTypeRef = prev.find(
        (item) => item.brand_type.id === brandTypeId,
      )?.brand_type;

      if (!brandTypeRef) return prev;

      const nextId =
        prev.reduce((maxId, item) => Math.max(maxId, item.id), 0) + 1;
      return [
        ...prev,
        {
          id: nextId,
          sizes: { value: size },
          brand_type: brandTypeRef,
          brandT_id: brandTypeId,
          size_id: sizeId,
        },
      ];
    });
    setHasChanges(true);
  };

  // Saving the changes logic
  const handleSave = () => {
    setOriginalState(JSON.stringify(sizeProducts));
    setHasChanges(false);
  };

  const handleDiscard = () => {
    setSizeProducts(JSON.parse(originalState));
    setHasChanges(false);
  };

  return (
    <Card className={cn("relative py-6", hasChanges && "pb-[105px]")}>
      <CardHeader className="">
        <CardTitle>Brand Sizes</CardTitle>
        <CardDescription>
          Manage sizes for each brand in your store.
        </CardDescription>
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
                      {ALL_SIZES.map((size) => (
                        <TableHead
                          key={size}
                          className="text-muted-foreground text-center min-w-24"
                        >
                          {SIZE_ABBREVIATIONS[size]}
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
                        {ALL_SIZES.map((size) => (
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
                    size="icon"
                    className="cursor-pointer"
                  >
                    {expandedTypes.has(productTypeGroup.productTypeName) ? (
                      <ChevronDown className="w-5 h-5" />
                    ) : (
                      <ChevronRight className="w-5 h-5" />
                    )}
                  </Button>
                  <h2 className="text-xl font-semibold text-foreground">
                    {productTypeGroup.productTypeName}
                  </h2>
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
                        {ALL_SIZES.map((size) => (
                          <TableHead
                            key={size}
                            className="text-muted-foreground text-center min-w-24"
                          >
                            {SIZE_ABBREVIATIONS[size]}
                          </TableHead>
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
                          {ALL_SIZES.map((size) => (
                            <TableCell key={size} className="text-center">
                              <Checkbox
                                checked={brand.sizes.has(size)}
                                onCheckedChange={() =>
                                  handleSizeChange(
                                    brand.brandTypeId,
                                    brand.brandName,
                                    size,
                                    brand.sizeId,
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
                className="cursor-pointer"
              >
                Discard
              </Button>
              <Button onClick={handleSave} className="cursor-pointer">
                Save Changes
              </Button>
            </div>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
