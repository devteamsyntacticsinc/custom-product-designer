"use client";

import React, { useState, useEffect, Dispatch, SetStateAction } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ProductService } from "@/lib/api/product";
import { ProductType, Brand } from "@/types/product";
import SizingAndQuantity from "@/components/SizingAndQuantity";
import AssetUpload from "./AssetUpload";

interface ProductCustomizerProps {
  productType: ProductType[];
  setProductType: Dispatch<SetStateAction<ProductType[]>>;
  brand: string;
  setBrand: Dispatch<SetStateAction<string>>;
  color: string;
  setColor: Dispatch<SetStateAction<string>>;
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
  assets: Record<string, File | null>;
  setAssets: React.Dispatch<React.SetStateAction<Record<string, File | null>>>;
}

export default function ProductCustomizer({
  productType,
  setProductType,
  brand,
  setBrand,
  color,
  setColor,
  sizeSelection,
  setSizeSelection,
  assets,
  setAssets,
}: ProductCustomizerProps) {
  const [selectedProductTypeId, setSelectedProductTypeId] = useState("");
  const [loadingProductTypes, setLoadingProductTypes] = useState(true);
  const [loadingBrands, setLoadingBrands] = useState(false);
  const [brands, setBrands] = useState<Brand[]>([]);

  useEffect(() => {
    const fetchProductTypes = async () => {
      try {
        setLoadingProductTypes(true);
        const res = await ProductService.getProductTypes();
        setProductType(res);
      } catch (error) {
        console.error("Failed to fetch product types:", error);
      } finally {
        setLoadingProductTypes(false);
      }
    };
    fetchProductTypes();
  }, []);

  useEffect(() => {
    if (!selectedProductTypeId) {
      setBrands([]);
      return;
    }

    const fetchBrandsData = async () => {
      try {
        setLoadingBrands(true);
        const brandRes = await ProductService.getBrands(selectedProductTypeId);
        setBrands(brandRes);
        setBrand("");
      } catch (error) {
        console.error("Failed to fetch brands:", error);
      } finally {
        setLoadingBrands(false);
      }
    };

    fetchBrandsData();
  }, [selectedProductTypeId, setBrand]);

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
          value={selectedProductTypeId}
          onValueChange={setSelectedProductTypeId}
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
            {Array.isArray(productType) &&
              productType.map((type) => (
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
        <div className="flex gap-2 flex-wrap">
          {[
            "white",
            "black",
            "red",
            "blue",
            "green",
            "yellow",
            "purple",
            "orange",
          ].map((colorOption) => (
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
          productTypeId={selectedProductTypeId}
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
