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
  quantity: string;
  setQuantity: (value: string) => void;
}

export default function SizingAndQuantity({
  quantity,
  setQuantity,
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
      }
    };

    try {
      loadSizes();
    } catch (error) {
      console.error("Failed to load sizes:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-center gap-4">
        <div className="flex-2">
          <Label className="text-sm text-muted-foreground mb-2">Size:</Label>
          <Select>
            {isLoading ? (
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Loading sizes..." />
              </SelectTrigger>
            ) : (
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a size" />
              </SelectTrigger>
            )}
            <SelectContent>
              {sizes.map((size) => (
                <SelectItem key={size.id} value={size.id.toString()}>
                  {size.value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1 space-y-2">
          <Label className="text-sm text-muted-foreground mb-2 block">
            Quantity:
          </Label>
          <Input
            type="number"
            min="1"
            value={quantity}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setQuantity(e.target.value)
            }
            className="w-full"
          />
        </div>
      </div>
      <Button className="" size="icon" variant="outline">
        <Plus />
      </Button>
    </div>
  );
}
