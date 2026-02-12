"use client";

import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SizingAndQuantityProps {
  quantity: string;
  setQuantity: (value: string) => void;
}

export default function SizingAndQuantity({ quantity, setQuantity }: SizingAndQuantityProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">Size:</span>
        <Select defaultValue="M">
          <SelectTrigger className="w-24">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="XS">XS</SelectItem>
            <SelectItem value="S">S</SelectItem>
            <SelectItem value="M">M</SelectItem>
            <SelectItem value="L">L</SelectItem>
            <SelectItem value="XL">XL</SelectItem>
            <SelectItem value="XXL">XXL</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">Quantity:</span>
        <Input
          type="number"
          min="1"
          value={quantity}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuantity(e.target.value)}
          className="w-24"
        />
      </div>
    </div>
  );
}
