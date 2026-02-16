"use client";

import ProductCustomizer from "@/components/ProductCustomizer";
import ProductPreview from "@/components/ProductPreview";
import { AssetsProvider } from "@/contexts/AssetsContext";

export default function Home() {
  return (
    <AssetsProvider>
      <div className="min-h-screen bg-gray-50 flex">
        {/* Left Sidebar - Controls */}
        <ProductCustomizer />

        {/* Right Content - Product Preview */}
        <ProductPreview />
      </div>
    </AssetsProvider>
  );
}
