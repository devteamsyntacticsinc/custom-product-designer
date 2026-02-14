"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ProductType, Brand, Color } from "@/types/product";
import SizingAndQuantity from "@/components/SizingAndQuantity";
import AssetUpload from "./AssetUpload";
import { useAssets } from "@/contexts/AssetsContext";

export default function ProductCustomizer() {
  const { assets, setAssets } = useAssets();
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

  const [productTypes, setProductTypes] = useState<ProductType[]>([]);
  const [loadingProductTypes, setLoadingProductTypes] = useState(true);
  const [loadingBrands, setLoadingBrands] = useState(false);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loadingColors, setLoadingColors] = useState(false);
  const [colors, setColors] = useState<Color[]>([]);


  useEffect(() => {
    const fetchProductTypes = async () => {
      try {
        setLoadingProductTypes(true);
        const res = await fetch("/api/product-types");
        const data = await res.json();
        setProductTypes(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch product types:", error);
      } finally {
        setLoadingProductTypes(false);
      }
    };
    fetchProductTypes();
  }, []);

  useEffect(() => {
    if (!productType) return;

    const fetchBrandsData = async () => {
      try {
        setLoadingBrands(true);
        const brandRes = await fetch(`/api/brands?typeId=${productType}`);
        const data = await brandRes.json();
        setBrands(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch brands:", error);
      } finally {
        setLoadingBrands(false);
      }
    };

    fetchBrandsData();
  }, [productType]);

  useEffect(() => {
    const fetchColors = async () => {
      try {
        setLoadingColors(true);
        const res = await fetch("/api/colors");
        const data = await res.json();
        setColors(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch colors:", error);
      } finally {
        setLoadingColors(false);
      }
    };
    fetchColors();
  }, []);

  return (
    <div className="w-80 bg-white shadow-lg p-6 overflow-y-auto flex flex-col min-h-full">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Customize Your Product
      </h2>

      {/* Product Type */}
      <div className="mb-6">
        <Label
          htmlFor="product-type"
          className="text-sm font-medium text-gray-700 mb-2 block"
        >
          Product Type
        </Label>
        <Select
          value={productType}
          onValueChange={setProductType}
          disabled={loadingProductTypes}
        >
          <SelectTrigger id="product-type">
            <SelectValue
              placeholder={
                loadingProductTypes
                  ? "Loading product types..."
                  : "Select product type"
              }
            />
          </SelectTrigger>
          <SelectContent>
            {Array.isArray(productTypes) &&
              productTypes.map((type) => (
                <SelectItem key={type.id} value={type.id}>
                  {type.name}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>

      {/* Brand */}
      <div className="mb-6">
        <Label
          htmlFor="brand"
          className="text-sm font-medium text-gray-700 mb-2 block"
        >
          Brand
        </Label>
        <Select
          value={brand}
          onValueChange={setBrand}
          disabled={loadingBrands || brands.length === 0}
        >
          <SelectTrigger id="brand">
            <SelectValue
              placeholder={loadingBrands ? "Loading brands..." : "Select brand"}
            />
          </SelectTrigger>
          <SelectContent>
            {brands.length === 0 && !loadingBrands ? (
              <SelectItem value="none" disabled>
                No brands available
              </SelectItem>
            ) : (
              brands.map((b) => (
                <SelectItem key={b.id} value={String(b.id)}>
                  {b.name}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>

      {/* Select Color */}
      <div className="mb-6">
        <Label
          htmlFor="color"
          className="text-sm font-medium text-gray-700 mb-2 block"
        >
          Select color
        </Label>
        <Select
          value={color}
          onValueChange={setColor}
          disabled={loadingColors || colors.length === 0}
        >
          <SelectTrigger id="color">
            <SelectValue
              placeholder={loadingColors ? "Loading colors..." : "Select color"}
            />
          </SelectTrigger>
          <SelectContent>
            {colors.length === 0 && !loadingColors ? (
              <SelectItem value="none" disabled>
                No colors available
              </SelectItem>
            ) : (
              colors.map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>
                  {c.value}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>

      {/* Place Your Assets */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Place your assets
        </h3>
        <AssetUpload assets={assets} setAssets={setAssets} />
      </div>

      {/* Sizing and Quantity */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Sizing and Quantity
        </h3>
        <SizingAndQuantity
          brandId={brand}
          productTypeId={productType}
          sizeSelection={sizeSelection}
          setSizeSelection={setSizeSelection}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mt-auto pt-6">
        <Button variant="outline" className="flex-1">
          Reset
        </Button>
        <Button className="flex-1 bg-gray-800 hover:bg-gray-900">Next</Button>
      </div>
    </div>
  );
}
