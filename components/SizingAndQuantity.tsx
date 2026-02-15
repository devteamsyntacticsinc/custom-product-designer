"use client";

import { Input } from "@/components/ui/input";
import { Label } from "./ui/label";
import { useEffect, useState, useCallback } from "react";
import { Size } from "@/types/product";
import { InfoIcon } from "lucide-react";
import { cn } from "@/lib/utils";

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
  const [sizesByProductTypeAndBrand, setSizesByProductTypeAndBrand] = useState<
    Size[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadSizes = async () => {
      setIsLoading(true);

      // Always fetch all sizes
      const response = await fetch("/api/sizes");
      const sizes = await response.json();

      // Fetch filtered sizes only if both productTypeId and brandId are provided
      let availableSizes: Size[] = [];
      if (productTypeId || brandId) {
        const responseByProductId = await fetch(
          `/api/sizes-by-type?typeId=${productTypeId || ""}&brandId=${brandId || ""}`,
        );
        availableSizes = await responseByProductId.json();
      }

      if (sizes) {
        sizes.sort(
          (a: Size, b: Size) =>
            (SIZE_ORDER[a.value as keyof typeof SIZE_ORDER] || 999) -
            (SIZE_ORDER[b.value as keyof typeof SIZE_ORDER] || 999),
        );

        setSizes(sizes);
        setSizesByProductTypeAndBrand(availableSizes);

        // Remove initialization - let user input control the values
        // Only initialize if sizeSelection is completely empty
        if (sizeSelection.length === 0) {
          console.log('Creating empty sizeSelection array');
          const initialSelection = sizes.map((size: Size) => ({
            size: size.value,
            quantity: 0,
          }));
          setSizeSelection(initialSelection);
        } else {
          console.log('SizeSelection already exists, not initializing');
        }
      }

      setIsLoading(false);
    };

    loadSizes();
  }, [productTypeId, brandId, sizeSelection.length, setSizeSelection]);

  // Handle quantity change for a specific size
  const handleQuantityChange = useCallback((sizeValue: string, quantity: string) => {
    console.log('handleQuantityChange called:', {
      sizeValue,
      quantity,
      currentSizeSelection: sizeSelection
    });
    
    const numValue = parseInt(quantity) || 0;
    console.log('Setting new value:', numValue);
    
    setSizeSelection(
      sizeSelection.map((item) =>
        item.size === sizeValue ? { ...item, quantity: numValue } : item,
      ),
    );
  }, [sizeSelection, setSizeSelection]);

  const isSizeAvailable = (sizeValue: string): boolean => {
    console.log('isSizeAvailable called with:', {
      sizeValue,
      productTypeId,
      brandId,
      sizesByProductTypeAndBrand,
      hasProductOrBrand: !!(productTypeId || brandId)
    });
    
    // If no product type or brand is selected, disable all inputs
    if (!productTypeId && !brandId) {
      console.log('No product type or brand selected - disabling');
      return false;
    }
    // Check if the size exists in the filtered list
    const isAvailable = sizesByProductTypeAndBrand.some((size) => size.value === sizeValue);
    console.log('Size availability for', sizeValue, ':', isAvailable);
    return isAvailable;
  };

  // Get quantity for a specific size
  const getQuantity = useCallback((sizeValue: string): number => {
    const quantity = sizeSelection.find((item) => item.size === sizeValue)?.quantity || 0;
    console.log('getQuantity for', sizeValue, ':', quantity);
    return quantity;
  }, [sizeSelection]);

  return (
    <div className="flex flex-col gap-2">
      <div>
        <div className="grid grid-cols-2">
          <Label className="text-sm">Size:</Label>
          <Label className="text-sm">Quantity:</Label>
        </div>
        {!productTypeId && !brandId && (
          <div className="text-xs text-amber-600 py-2 flex gap-1">
            <InfoIcon className="inline-block size-5" />
            <span>
              Please select a product type or brand to see available sizes
            </span>
          </div>
        )}
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
          sizes.map((size) => {
            const available = isSizeAvailable(size.value);
            return (
              <div className="grid grid-cols-2 gap-2" key={size.id}>
                <p
                  className={cn(
                    "text-base font-medium",
                    !available && "text-muted-foreground",
                  )}
                >
                  {size.value}
                </p>
                <Input
                  type="text"
                  value={getQuantity(size.value).toString()}
                  onChange={(e) => {
                    // Only allow numbers
                    const value = e.target.value.replace(/[^0-9]/g, '');
                    handleQuantityChange(
                      size.value,
                      value,
                    );
                  }}
                  disabled={!available}
                  className="flex-1"
                  placeholder="0"
                />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
