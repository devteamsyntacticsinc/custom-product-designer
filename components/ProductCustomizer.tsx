"use client";

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import AssetUpload from "@/components/AssetUpload";
import SizingAndQuantity from "@/components/SizingAndQuantity";

interface ProductCustomizerProps {
  productType: string;
  setProductType: (value: string) => void;
  brand: string;
  setBrand: (value: string) => void;
  color: string;
  setColor: (value: string) => void;
  quantity: string;
  setQuantity: (value: string) => void;
}

export default function ProductCustomizer({
  productType,
  setProductType,
  brand,
  setBrand,
  color,
  setColor,
  quantity,
  setQuantity,
}: ProductCustomizerProps) {
  return (
    <div className="w-80 bg-white shadow-lg p-6 overflow-y-auto flex flex-col min-h-full">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Customize Your Product</h2>
      
      {/* Product Type */}
      <div className="mb-6">
        <Label htmlFor="product-type" className="text-sm font-medium text-gray-700 mb-2 block">
          Product Type
        </Label>
        <Select value={productType} onValueChange={setProductType}>
          <SelectTrigger id="product-type">
            <SelectValue placeholder="Select product type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="tshirt">T-Shirt</SelectItem>
            <SelectItem value="hoodie">Hoodie</SelectItem>
            <SelectItem value="tank-top">Tank Top</SelectItem>
            <SelectItem value="long-sleeve">Long Sleeve</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Brand */}
      <div className="mb-6">
        <Label htmlFor="brand" className="text-sm font-medium text-gray-700 mb-2 block">
          Brand
        </Label>
        <Select value={brand} onValueChange={setBrand}>
          <SelectTrigger id="brand">
            <SelectValue placeholder="Select brand" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="nike">Nike</SelectItem>
            <SelectItem value="adidas">Adidas</SelectItem>
            <SelectItem value="puma">Puma</SelectItem>
            <SelectItem value="under-armour">Under Armour</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Select Color */}
      <div className="mb-6">
        <Label htmlFor="color" className="text-sm font-medium text-gray-700 mb-2 block">
          Select color
        </Label>
        <div className="flex gap-2 flex-wrap">
          {["white", "black", "red", "blue", "green", "yellow", "purple", "orange"].map((colorOption) => (
            <button
              key={colorOption}
              onClick={() => setColor(colorOption)}
              className={`w-8 h-8 rounded-full border-2 ${
                color === colorOption ? "border-blue-500" : "border-gray-300"
              }`}
              style={{ backgroundColor: colorOption }}
            />
          ))}
        </div>
      </div>

      {/* Place Your Assets */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Place your assets</h3>
        <AssetUpload />
      </div>

      {/* Sizing and Quantity */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Sizing and Quantity</h3>
        <SizingAndQuantity quantity={quantity} setQuantity={setQuantity} />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mt-auto pt-6">
        <Button variant="outline" className="flex-1">
          Reset
        </Button>
        <Button className="flex-1 bg-gray-800 hover:bg-gray-900">
          Next
        </Button>
      </div>
    </div>
  );
}
