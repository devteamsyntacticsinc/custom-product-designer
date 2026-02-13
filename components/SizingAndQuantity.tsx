"use client";

import { Input } from "@/components/ui/input";
import { Label } from "./ui/label";
import { useEffect, useState } from "react";
import { ProductType, Size } from "@/types/product";

const SIZE_ORDER = {
  "Extra Small": 1,
  Small: 2,
  Medium: 3,
  Large: 4,
  "Extra Large": 5,
  "2XL": 6,
  "3XL": 7,
} as const;

interface SizingAndQuantityProps {
  sizeSelection: {
    size: string;
    quantity: number;
  }[];
  setSizeSelection: (
    value: {
      size: string;
      quantity: number;
    }[],
  ) => void;
  productTypeId: string;
  brandId: string;
}

export default function SizingAndQuantity({
  productTypeId,
  brandId,
  sizeSelection,
  setSizeSelection,
}: SizingAndQuantityProps) {
  const [sizes, setSizes] = useState<Size[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadSizes = async () => {
      setIsLoading(true);
      const response = await fetch("/api/sizes");
      const sizes = await response.json();
      if (sizes) {
        sizes.sort(
          (a: Size, b: Size) =>
            (SIZE_ORDER[a.value as keyof typeof SIZE_ORDER] || 999) -
            (SIZE_ORDER[b.value as keyof typeof SIZE_ORDER] || 999),
        );
        setSizes(sizes);

        // Initialize sizeSelection with all sizes and quantity 0
        setSizeSelection(
          sizes.map((size: Size) => ({
            size: size.value,
            quantity: 0,
          })),
        );

        setIsLoading(false);
      }
    };
    loadSizes();
  }, [setSizeSelection, productTypeId, brandId]);

  // Handle quantity change for a specific size
  const handleQuantityChange = (sizeValue: string, quantity: number) => {
    setSizeSelection(
      sizeSelection.map((item) =>
        item.size === sizeValue ? { ...item, quantity: quantity } : item,
      ),
    );
  };

  // Get quantity for a specific size
  const getQuantity = (sizeValue: string): number => {
    return sizeSelection.find((item) => item.size === sizeValue)?.quantity || 0;
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-2">
        <Label className="text-sm">Size:</Label>
        <Label className="text-sm">Quantity:</Label>
      </div>
      <div className="space-y-2">
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <div className="grid grid-cols-2 gap-2" key={index}>
                <div className="h-6 w-16 bg-muted rounded animate-pulse" />
                <div className="h-10 w-full bg-muted rounded animate-pulse" />
              </div>
            ))}
          </div>
        ) : (
          sizes.map((size) => (
            <div className="grid grid-cols-2 gap-2" key={size.id}>
              <p className="text-base font-medium text-muted-foreground">
                {size.value}
              </p>
              <Input
                type="number"
                min="0"
                value={getQuantity(size.value)}
                onChange={(e) =>
                  handleQuantityChange(
                    size.value,
                    parseInt(e.target.value) || 0,
                  )
                }
                className="flex-1"
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
