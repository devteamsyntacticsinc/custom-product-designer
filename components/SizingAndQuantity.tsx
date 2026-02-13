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

interface SizingAndQuantityProps {
  quantity: string;
  setQuantity: (value: string) => void;
}

export default function SizingAndQuantity({
  quantity,
  setQuantity,
}: SizingAndQuantityProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-center gap-4">
        <div className="flex-2">
          <Label className="text-sm text-muted-foreground mb-2">Size:</Label>
          <Select defaultValue="M">
            <SelectTrigger className="w-full">
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
