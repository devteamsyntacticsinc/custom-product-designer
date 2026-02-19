"use client";

import { useState } from "react";
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

interface Brand {
  id: number;
  name: string;
  sizes: Record<string, boolean>;
}

interface ProductType {
  id: number;
  name: string;
  brands: Brand[];
}

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

export default function ProductBrandSizesTable() {
  const [productTypes, setProductTypes] = useState<ProductType[]>([
    {
      id: 1,
      name: "Shirts",
      brands: [
        {
          id: 101,
          name: "Penshoppe",
          sizes: {
            Small: true,
            Medium: true,
            Large: false,
            "Extra Small": false,
            "Extra Large": true,
            XXLarge: false,
          },
        },
        {
          id: 102,
          name: "Bench",
          sizes: {
            Small: false,
            Medium: true,
            Large: true,
            "Extra Small": true,
            "Extra Large": false,
            XXLarge: false,
          },
        },
        {
          id: 103,
          name: "Uniqlo",
          sizes: {
            Small: true,
            Medium: true,
            Large: true,
            "Extra Small": false,
            "Extra Large": true,
            XXLarge: true,
          },
        },
      ],
    },
    {
      id: 2,
      name: "Jackets",
      brands: [
        {
          id: 201,
          name: "North Face",
          sizes: {
            Small: true,
            Medium: true,
            Large: true,
            "Extra Small": false,
            "Extra Large": true,
            XXLarge: false,
          },
        },
        {
          id: 202,
          name: "Uniqlo",
          sizes: {
            Small: false,
            Medium: true,
            Large: true,
            "Extra Small": false,
            "Extra Large": false,
            XXLarge: false,
          },
        },
      ],
    },
    {
      id: 3,
      name: "Mugs",
      brands: [
        {
          id: 301,
          name: "Starbucks",
          sizes: {
            Small: true,
            Medium: true,
            Large: true,
            "Extra Small": false,
            "Extra Large": false,
            XXLarge: false,
          },
        },
        {
          id: 302,
          name: "IKEA",
          sizes: {
            Small: false,
            Medium: true,
            Large: true,
            "Extra Small": false,
            "Extra Large": false,
            XXLarge: false,
          },
        },
      ],
    },
  ]);

  const [expandedTypes, setExpandedTypes] = useState<Set<number>>(new Set([1]));
  const [hasChanges, setHasChanges] = useState(false);
  const [originalState, setOriginalState] = useState(
    JSON.stringify(productTypes),
  );

  const toggleTypeExpanded = (typeId: number) => {
    const newExpanded = new Set(expandedTypes);
    if (newExpanded.has(typeId)) {
      newExpanded.delete(typeId);
    } else {
      newExpanded.add(typeId);
    }
    setExpandedTypes(newExpanded);
  };

  const handleSizeChange = (typeId: number, brandId: number, size: string) => {
    setProductTypes((prevTypes) =>
      prevTypes.map((type) =>
        type.id === typeId
          ? {
              ...type,
              brands: type.brands.map((brand) =>
                brand.id === brandId
                  ? {
                      ...brand,
                      sizes: {
                        ...brand.sizes,
                        [size]: !brand.sizes[size],
                      },
                    }
                  : brand,
              ),
            }
          : type,
      ),
    );
    setHasChanges(true);
  };

  const handleDeleteBrand = (typeId: number, brandId: number) => {
    setProductTypes((prevTypes) =>
      prevTypes.map((type) =>
        type.id === typeId
          ? {
              ...type,
              brands: type.brands.filter((b) => b.id !== brandId),
            }
          : type,
      ),
    );
    setHasChanges(true);
  };

  const handleSave = () => {
    setOriginalState(JSON.stringify(productTypes));
    setHasChanges(false);
  };

  const handleDiscard = () => {
    setProductTypes(JSON.parse(originalState));
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
        {productTypes.map((productType) => (
          <div key={productType.id} className="overflow-x-auto">
            <div className="flex items-center gap-3 pb-4 border-b border-border">
              <Button
                onClick={() => toggleTypeExpanded(productType.id)}
                variant="ghost"
                size="icon"
                className="cursor-pointer"
              >
                {expandedTypes.has(productType.id) ? (
                  <ChevronDown className="w-5 h-5" />
                ) : (
                  <ChevronRight className="w-5 h-5" />
                )}
              </Button>
              <h2 className="text-xl font-semibold text-foreground">
                {productType.name}
              </h2>
              <span className=" text-muted-foreground ml-auto">
                {productType.brands.length} brand
                {productType.brands.length !== 1 ? "s" : ""}
              </span>
            </div>

            {expandedTypes.has(productType.id) && (
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
                    <TableHead className="text-muted-foreground text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productType.brands.map((brand) => (
                    <TableRow
                      key={brand.id}
                      className="border-border hover:bg-secondary/30 transition-colors"
                    >
                      <TableCell className="text-foreground font-medium">
                        {brand.name}
                      </TableCell>
                      {ALL_SIZES.map((size) => (
                        <TableCell key={size} className="text-center">
                          <Checkbox
                            checked={brand.sizes[size] || false}
                            onCheckedChange={() =>
                              handleSizeChange(productType.id, brand.id, size)
                            }
                            className="cursor-pointer size-7"
                          />
                        </TableCell>
                      ))}
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            handleDeleteBrand(productType.id, brand.id)
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
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
