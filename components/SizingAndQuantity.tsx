"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { ProductService } from "@/lib/api/product";
import { Size } from "@/types/product";

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
}

export default function SizingAndQuantity({
  sizeSelection,
  setSizeSelection,
}: SizingAndQuantityProps) {
  const [sizes, setSizes] = useState<Size[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Feat: Fetch sizes from API
    const loadSizes = async () => {
      setIsLoading(true);
      const sizes = await ProductService.getSizes();
      if (sizes) {
        // Re-order sizes to make sure it is small, medium and large
        sizes.sort(
          (a, b) =>
            (SIZE_ORDER[a.value as keyof typeof SIZE_ORDER] || 999) -
            (SIZE_ORDER[b.value as keyof typeof SIZE_ORDER] || 999),
        );
        setSizes(sizes);
        setIsLoading(false);
      }
    };
    loadSizes();
  }, []);

  const updateSelection = (
    index: number,
    field: "size" | "quantity",
    value: string | number,
  ) => {
    const updated = [...sizeSelection];

    updated[index] = {
      ...updated[index],
      [field]: field === "quantity" ? Number(value) : value,
    };

    setSizeSelection(updated);
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-col gap-2 ">
        <div className="grid grid-cols-2 ">
          <Label className="text-sm">Size:</Label>
          <Label className="text-sm">Quantity:</Label>
        </div>
        <div className="space-y-2 ">
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, index) => (
                <div className="grid grid-cols-2" key={index}>
                  {/* Update to use skeleton component */}
                  <div className="h-6 w-16 bg-muted rounded animate-pulse" />
                  <div className="h-10 w-full bg-muted rounded animate-pulse" />
                </div>
              ))}
            </div>
          ) : (
            sizes.map((size) => (
              <div className="grid grid-cols-2" key={size.id}>
                <p className="text-base font-medium text-muted-foreground">
                  {size.value}
                </p>
                <Input type="number" min="1" className="flex-1" disabled />
              </div>
            ))
          )}
        </div>

        {/* <div className="flex-1 space-y-2">
          <Input
            type="number"
            min="1"
            // value={selection.quantity}
            // onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            //   updateSelection(index, "quantity", e.target.value)
            // }
            className="w-full"
          />
        </div> */}
      </div>
    </div>
  );
}
