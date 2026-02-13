"use client";

import { useState } from "react";
import ProductCustomizer from "@/components/ProductCustomizer";
import ProductPreview from "@/components/ProductPreview";

export default function Home() {
  const [productType, setProductType] = useState("");
  const [brand, setBrand] = useState("");
  const [color, setColor] = useState("");
 const [sizeSelection, setSizeSelection] = useState<
   {
     size: string;
     quantity: number;
   }[]
 >([
   {
     size: "",
     quantity: 1,
   },
 ]);
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Sidebar - Controls */}
      <ProductCustomizer
        productType={productType}
        setProductType={setProductType}
        brand={brand}
        setBrand={setBrand}
        color={color}
        setColor={setColor}
        sizeSelection={sizeSelection}
        setSizeSelection={setSizeSelection}
      />

      {/* Right Content - Product Preview */}
      <ProductPreview />
    </div>
  );
}
