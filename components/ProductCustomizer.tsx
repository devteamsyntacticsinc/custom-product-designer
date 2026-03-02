"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { Combobox } from "@/components/ui/combobox";
import { Label } from "@/components/ui/label";
import { ProductType, Brand, Color, ColorProduct, Size } from "@/types/product";
import SizingAndQuantity from "@/components/SizingAndQuantity";
import AssetUpload from "./AssetUpload";
import { useAssets } from "@/contexts/AssetsContext";
import ContactInformation from "./ContactInformation";
import { CardTitle } from "@/components/ui/card";
import ProductCustomizerSkeleton from "./ProductCustomizerSkeleton";

export default function ProductCustomizer() {
  const { assets, setAssets, selectedProductType, setSelectedProductType } =
    useAssets();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState<"customize" | "contact">(
    "customize",
  );
  const [productType, setProductType] = useState("");
  const [brand, setBrand] = useState("");
  const [color, setColor] = useState("");
  const [sizeSelection, setSizeSelection] = useState<
    {
      size: number;
      quantity: number;
    }[]
  >([]);
  const [contactData, setContactData] = useState({
    fullName: "",
    email: "",
    contactNumber: "",
    address: "",
  });

  const [productTypes, setProductTypes] = useState<ProductType[]>([]);
  const [loadingProductTypes, setLoadingProductTypes] = useState(true);
  const [loadingBrands, setLoadingBrands] = useState(false);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [colors, setColors] = useState<Color[]>([]);
  const [loadingBrandColors, setLoadingBrandColors] = useState(false);
  const [sizes, setSizes] = useState<Size[]>([]);

  const handleNext = () => {
    setCurrentStep("contact");
  };

  const handleBack = () => {
    setCurrentStep("customize");
  };

  const handleContactSubmit = async (contactData: {
    fullName: string;
    email: string;
    contactNumber: string;
    address: string;
  }) => {
    console.log("Contact data submitted:", contactData);

    try {
      // Get the display names for the selected IDs
      const selectedBrand = brands.find((b) => String(b.id) === brand);
      const brandName = selectedBrand?.name || brand;
      const selectedColor = colors.find((c) => String(c.id) === color);
      const colorName = selectedColor?.value || color;
      const selectedProductType = productTypes.find(
        (pt) => pt.id === Number(productType),
      );
      const productTypeName = selectedProductType?.name || productType;

      // Create FormData to handle file uploads
      const formData = new FormData();

      // Map sizeSelection to include size values for email display
      const sizeSelectionWithValues = sizeSelection.map(item => {
        const size = sizes.find(s => s.id === item.size);
        return {
          size: item.size, // Keep ID for database
          sizeValue: size?.value || `Size ${item.size}`, // Add value for email
          quantity: item.quantity
        };
      });

      // Add all the order data as JSON with both IDs and display names
      const orderData = {
        // IDs for database insertion
        productTypeId: productType,
        brandId: selectedProductType?.is_onlyType ? null : brand,
        colorId: selectedProductType?.is_onlyType ? null : color,
        // Display names for email
        productType: productTypeName,
        brand: brandName,
        color: colorName,
        is_onlyType: selectedProductType?.is_onlyType,
        sizeSelection: sizeSelectionWithValues,
        contactInformation: contactData,
      };

      formData.append("orderData", JSON.stringify(orderData));

      // Add files to FormData
      Object.entries(assets).forEach(([key, file]) => {
        if (file) {
          formData.append(key, file);
        }
      });

      const response = await fetch("/api/orders", {
        method: "POST",
        body: formData, // Don't set Content-Type header, let browser set it with boundary
      });

      if (!response.ok) {
        throw new Error("Failed to submit order");
      }

      const result = await response.json();
      console.log("Order submitted successfully:", result);

      // Reset form after successful submission
      handleReset();
      setCurrentStep("customize");
    } catch (error) {
      console.error("Error submitting order:", error);
      throw error; // Re-throw to let toast handle it
    }
  };

  const handleReset = () => {
    setProductType("");
    setBrand("");
    setColor("");
    setSelectedProductType(null);
    setSizeSelection([]);
    setAssets({
      "front-top-left": null,
      "front-center": null,
      "back-top": null,
      "back-bottom": null,
    });
  };

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
    const fetchSizes = async () => {
      try {
        const res = await fetch("/api/sizes");
        const data = await res.json();
        setSizes(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch sizes:", error);
      }
    };
    fetchSizes();
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
    // Clear colors when no brand is selected or is_onlyType is true
    if (!brand || selectedProductType?.is_onlyType) {
      setColors([]);
      setColor("");
      return;
    }

    const fetchBrandColors = async () => {
      try {
        setLoadingBrandColors(true);

        // Fetch all color-brand relationships
        const colorProductsRes = await fetch("/api/color-products");
        const colorProducts = await colorProductsRes.json();

        // Filter colors for the selected brand
        const brandColorIds = colorProducts
          .filter(
            (item: ColorProduct) => item.products.brand_id === Number(brand),
          )
          .map((item: ColorProduct) => item.color_id);

        console.log("brandColorIds", brandColorIds);

        // Fetch all colors and filter by brand-specific IDs
        const colorsRes = await fetch("/api/colors");
        const allColors = await colorsRes.json();
        const filteredColors = allColors.filter((color: Color) =>
          brandColorIds.includes(color.id),
        );

        setColors(filteredColors);
      } catch (error) {
        console.error("Failed to fetch brand colors:", error);
        setColors([]);
      } finally {
        setLoadingBrandColors(false);
      }
    };

    fetchBrandColors();
  }, [brand, selectedProductType?.is_onlyType]);

  // Render Contact Information step
  if (currentStep === "contact") {
    // Get the actual brand name from the brands array
    const selectedBrand = brands.find((b) => String(b.id) === brand);
    const brandName = selectedBrand?.name || brand;
    // Get the actual color name
    const selectedColor = colors.find((c) => String(c.id) === color);
    const colorName = selectedColor?.value || color;
    // Get the actual product type name
    const selectedProductType = productTypes.find(
      (pt) => pt.id === Number(productType),
    );
    const productTypeName = selectedProductType?.name || productType;

    return (
      <>
        {/* Burger Button */}
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="lg:hidden fixed top-4 left-4 z-40 p-2 bg-background rounded-md shadow-md border"
        >
          <Menu className="h-6 w-6 text-gray-700" />
        </button>

        {/* Backdrop */}
        {isMobileMenuOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        <div
          className={`
          fixed inset-y-0 left-0 z-50 w-80 bg-background dark:bg-[#010409] shadow-lg p-6 overflow-y-auto scrollbar-hide flex flex-col h-full
          transform transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
          lg:relative lg:translate-x-0 lg:flex lg:z-0
        `}
        >
          <div className="lg:hidden flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold ">Print Pro</h2>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 text-gray-500 hover:text-gray-700"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <ContactInformation
            onBack={handleBack}
            onSubmit={handleContactSubmit}
            productType={productTypeName}
            brand={brandName}
            color={colorName}
            is_onlyType={selectedProductType?.is_onlyType}
            sizeSelection={sizeSelection}
            assets={assets}
            contactData={contactData}
            setContactData={setContactData}
          />
        </div>
      </>
    );
  }

  // Render Product Customizer step
  // Show skeleton while initial product types are loading
  if (loadingProductTypes) {
    return (
      <>
        {/* Burger Button */}
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="lg:hidden fixed w-full z-40 p-4 bg-background dark:bg-[#010409] shadow-md border"
        >
          <div className="flex items-center content-center gap-3">
            <Menu className="h-6 w-6 text-gray-700" />
            <CardTitle className="text-lg md:text-xl lg:text-2xl font-bold text-center">
              Print Pro
            </CardTitle>
          </div>
        </button>
        <ProductCustomizerSkeleton />
      </>
    );
  }

  return (
    <>
      {/* Burger Button */}
      <button
        onClick={() => setIsMobileMenuOpen(true)}
        className="lg:hidden fixed w-full z-40 p-4 bg-background dark:bg-[#010409] border"
      >
        <div className="flex items-center content-center gap-3">
          <Menu className="h-6 w-6 text-gray-700" />
          <CardTitle className="text-lg md:text-xl lg:text-2xl font-bold text-center">
            Print Pro
          </CardTitle>
        </div>
      </button>

      {/* Backdrop */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <div
        className={`
        fixed inset-y-0 left-0 z-50 w-80 bg-background dark:bg-[#010409] shadow-lg p-6 overflow-y-auto scrollbar-hide flex flex-col h-full
        transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
        lg:relative lg:translate-x-0 lg:flex lg:z-0
      `}
      >
        <div className="lg:hidden flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold ">Print Pro</h2>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2 text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <h2 className="hidden lg:block text-2xl font-bold  mb-6">Print Pro</h2>

        {/* Product Type */}
        <div className="mb-6">
          <Label
            htmlFor="product-type"
            className="text-sm font-medium text-gray-700 mb-2 block"
          >
            Product Type
          </Label>
          <Combobox
            placeholder={
              loadingProductTypes
                ? "Loading product types..."
                : "Select product type"
            }
            value={productType}
            onValueChange={(value) => {
              setProductType(value);
              const selected = productTypes.find(
                (pt) => pt.id.toString() === value,
              );
              setSelectedProductType(selected || null);
              // Reset brand and color when product type changes
              setBrand("");
              setColor("");
            }}
            options={productTypes.map((type) => ({
              value: type.id.toString(),
              label: type.name,
            }))}
            className="w-full"
            disabled={loadingProductTypes}
            loading={loadingProductTypes}
          />
        </div>

        {/* Brand */}
        <div
          className={`mb-6 ${selectedProductType?.is_onlyType ? "opacity-50 pointer-events-none" : ""}`}
        >
          <Label
            htmlFor="brand"
            className="text-sm font-medium text-gray-700 mb-2 block"
          >
            Brand {selectedProductType?.is_onlyType && "(Disabled)"}
          </Label>
          <Combobox
            placeholder={loadingBrands ? "Loading brands..." : "Select brand"}
            value={brand}
            onValueChange={(value) => {
              setBrand(value);
              // Clear color selection when brand changes
              setColor("");
            }}
            options={brands.map((b) => ({
              value: String(b.id),
              label: b.name,
            }))}
            className="w-full"
            disabled={
              loadingBrands ||
              brands.length === 0 ||
              selectedProductType?.is_onlyType
            }
            loading={loadingBrands}
            emptyText={
              brands.length === 0 ? "No brands available" : "No brand found."
            }
          />
        </div>

        {/* Select Color */}
        <div
          className={`mb-6 ${selectedProductType?.is_onlyType ? "opacity-50 pointer-events-none" : ""}`}
        >
          <Label
            htmlFor="color"
            className="text-sm font-medium text-gray-700 mb-2 block"
          >
            Select color {selectedProductType?.is_onlyType && "(Disabled)"}
          </Label>
          <Combobox
            placeholder={
              loadingBrandColors ? "Loading colors..." : "Select color"
            }
            value={color}
            onValueChange={setColor}
            options={colors.map((c) => ({
              value: String(c.id),
              label: c.value,
            }))}
            className="w-full"
            disabled={
              loadingBrandColors ||
              colors.length === 0 ||
              selectedProductType?.is_onlyType ||
              !brand
            }
            loading={loadingBrandColors}
            emptyText={
              !brand
                ? "Select a brand first"
                : colors.length === 0
                  ? "No colors available for this brand"
                  : "No color found."
            }
          />
        </div>

        {/* Place Your Assets */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold  mb-4">Place your assets</h3>
          <AssetUpload assets={assets} setAssets={setAssets} />
        </div>

        {/* Sizing and Quantity */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold  mb-4">Sizing and Quantity</h3>
          <SizingAndQuantity
            brandId={brand}
            productTypeId={productType}
            sizeSelection={sizeSelection}
            setSizeSelection={setSizeSelection}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-auto pt-6">
          <Button variant="outline" className="flex-1" onClick={handleReset}>
            Reset
          </Button>
          <Button
            className="flex-1"
            onClick={handleNext}
            disabled={
              loadingProductTypes ||
              loadingBrands ||
              loadingBrandColors ||
              !productType ||
              (!selectedProductType?.is_onlyType && !brand) ||
              (!selectedProductType?.is_onlyType && !color) ||
              (!assets["front-top-left"] && !assets["front-center"]) ||
              !sizeSelection.some((item) => item.quantity > 0)
            }
          >
            Next
          </Button>
        </div>
      </div>
    </>
  );
}
