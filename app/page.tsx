"use client";

import { useState } from "react";
import ProductCustomizer from "@/components/ProductCustomizer";
import ProductPreview from "@/components/ProductPreview";
import { ProductType } from "@/types/product";

export default function Home() {
  const [productType, setProductType] = useState<ProductType[]>([]);
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

  const [assets, setAssets] = useState<Record<string, File | null>>({
    "front-top-left": null,
    "front-center": null,
    "back-top": null,
    "back-bottom": null,
  });

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
        assets={assets}
        setAssets={setAssets}
      />

      {/* Right Content - Product Preview */}
      <ProductPreview assets={assets} />
    </div>
  );
}
