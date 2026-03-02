import Image from "next/image";
import { OrderWithCustomer } from "@/types/order";
import { Box, Download, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import React, { useMemo, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import Link from "next/link";

// Custom component for external URLs that bypasses Next.js Image requirements for some cases
const ExternalImage = React.memo(({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className: string;
}) => (
  // eslint-disable-next-line @next/next/no-img-element
  <img src={src} alt={alt} className={className} loading="lazy" />
));

ExternalImage.displayName = "ExternalImage";

interface OrderProductPreviewProps {
  order: OrderWithCustomer;
}

interface DesignAreaProps {
  placement: string;
  label: string;
  customClass: string;
  imageUrl?: string;
  onDownload: (url: string, filename: string) => void;
  orderId: string;
}

const DesignArea = React.memo(({
  placement,
  label,
  customClass,
  imageUrl,
  onDownload,
  orderId,
}: DesignAreaProps) => {
  const handleClick = useCallback(() => {
    if (imageUrl) {
      onDownload(imageUrl, `${orderId}_${placement.replace(/\s+/g, "_")}.png`);
    }
  }, [imageUrl, onDownload, orderId, placement]);

  return (
    <div
      className={`absolute ${customClass} border-2 border-dashed border-gray-400 rounded flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 overflow-hidden bg-white/50 z-10 transition-all duration-200 ${
        imageUrl ? "cursor-pointer hover:border-primary hover:bg-background group" : ""
      }`}
      onClick={handleClick}
      title={imageUrl ? `Click to download ${label}` : ""}
      role={imageUrl ? "button" : undefined}
      tabIndex={imageUrl ? 0 : undefined}
      onKeyDown={(e) => {
        if (imageUrl && (e.key === "Enter" || e.key === " ")) {
          handleClick();
        }
      }}
    >
      {imageUrl ? (
        <>
          <ExternalImage
            src={imageUrl}
            alt={label}
            className="w-full h-full object-contain"
          />
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
            <Download className="text-white w-4 h-4" />
          </div>
        </>
      ) : (
        <span className="text-gray-400 text-[8px] sm:text-xs md:text-sm text-center px-1 select-none">
          {label}
        </span>
      )}
    </div>
  );
});

DesignArea.displayName = "DesignArea";

export default function OrderProductPreview({
  order,
}: OrderProductPreviewProps) {
  // Memoize expensive computations
  const {
    productImages,
    productTypeImages,
    isOnlyType,
    imageIsFront,
    imageIsBack,
    imagesByPlacement,
    brandName,
    productTypeName,
    shouldDisplayBrand,
  } = useMemo(() => {
    const productImages = order.product_images || [];
    const productTypeImages =
      order.products?.[0]?.product_type?.image_products || [];
    const isOnlyType = order.products?.[0]?.product_type?.is_onlyType || false;
    const imageIsFront = productTypeImages.find(
      (img) => img.is_hasBack === false,
    );
    const imageIsBack = productTypeImages.find((img) => img.is_hasBack === true);

    // Create a record of images by placement using exact database values
    const imagesByPlacement: Record<string, string> = {};
    productImages.forEach((img) => {
      if (img.place && img.url) {
        imagesByPlacement[img.place] = img.url;
      }
    });

    // Extract brand and product type information
    const brandType = order.products?.[0];
    const brandName = brandType?.brands?.name || "Unknown Brand";
    const productTypeName =
      brandType?.product_type?.name || "Unknown Product Type";

    // Check if brand should be displayed
    const shouldDisplayBrand = !isOnlyType && brandName !== "Unknown Brand";

    return {
      productImages,
      productTypeImages,
      isOnlyType,
      imageIsFront,
      imageIsBack,
      imagesByPlacement,
      brandName,
      productTypeName,
      shouldDisplayBrand,
    };
  }, [order]);

  const handleDownload = useCallback(async (url: string, filename: string) => {
    if (!url) return;
    
    try {
      // Add timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the blob URL after a short delay
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 100);
    } catch (error) {
      console.error("Download failed:", error);
      // Fallback: open in new tab
      window.open(url, "_blank", "noopener,noreferrer");
    }
  }, []);

  return (
    <div className="space-y-4">
      {/* Product Info & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-background dark:bg-[#0d1117] border rounded-xl shadow-sm">
        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex flex-col">
            {shouldDisplayBrand && (
              <span className="font-semibold  dark:text-white text-sm lg:text-lg">
                {brandName}
              </span>
            )}
            <span
              className={`text-xs lg:text-base text-gray-500 ${!shouldDisplayBrand ? "font-semibold  dark:text-white text-sm lg:text-lg" : ""}`}
            >
              {productTypeName}
            </span>
          </div>
          <div className="h-8 w-px bg-gray-200 hidden sm:block" />
          <p className="text-xs lg:text-base text-gray-400 max-w-[200px]">
            Tip: Click specific design areas on the mockup to download
            individual files.
          </p>
        </div>

        {productImages.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            className="h-10"
            onClick={(e: React.MouseEvent) => {
              e.preventDefault();
              e.stopPropagation();
              productImages.forEach((img, index) => {
                if (img.url && img.place) {
                  setTimeout(() => {
                    handleDownload(
                      img.url,
                      `${order.id}_${img.place.replace(/\s+/g, "_")}.png`,
                    );
                  }, index * 500); // Stagger downloads to prevent browser blocking
                }
              });
            }}
            disabled={productImages.length === 0}
          >
            <Download className="h-4 w-4" />
            Download All Designs ({productImages.length})
          </Button>
        )}
      </div>

      {/* T-shirt Mockup */}
      <div className="flex flex-col lg:flex-row w-full relative justify-center items-start">
        {isOnlyType && imageIsFront?.filepath && (
          <div className="relative w-fit flex items-center justify-center rounded-lg max-w-lg">
            <Image
              src={imageIsFront.filepath}
              alt="Front View"
              width={700}
              height={700}
              className="object-contain"
              onError={(e) => {
                console.error("Failed to load front image:", imageIsFront.filepath);
                e.currentTarget.style.display = "none";
              }}
              loading="lazy"
            />

            {/* Center area - positioning for single-type products */}
            <DesignArea
              placement="Front - Center"
              label="Front Center"
              customClass="top-[50%] left-[44%] w-[30%] h-[45%]"
              imageUrl={imagesByPlacement["Front - Center"]}
              onDownload={handleDownload}
              orderId={order.id}
            />
          </div>
        )}
        {!isOnlyType && imageIsFront?.filepath && (
          <div className="relative w-fit flex items-center justify-center rounded-lg">
            <Image
              src={imageIsFront.filepath}
              alt="Front View"
              width={350}
              height={350}
              className="object-contain"
              onError={(e) => {
                console.error("Failed to load front image:", imageIsFront.filepath);
                e.currentTarget.style.display = "none";
              }}
              loading="lazy"
            />

            <DesignArea
              placement="Front - Top Left"
              label="Front Top Left"
              customClass="top-[30%] left-[63%] w-[10%] h-[10%]"
              imageUrl={imagesByPlacement["Front - Top Left"]}
              onDownload={handleDownload}
              orderId={order.id}
            />

            <DesignArea
              placement="Front - Center"
              label="Front Center"
              customClass="top-[62%] left-[50%] w-[30%] h-[35%]"
              imageUrl={imagesByPlacement["Front - Center"]}
              onDownload={handleDownload}
              orderId={order.id}
            />
          </div>
        )}

        {!isOnlyType && imageIsBack?.filepath && (
          <div className="relative w-fit flex items-center justify-center rounded-lg p-2">
            <Image
              src={imageIsBack.filepath}
              alt="Back View"
              width={350}
              height={350}
              className="object-contain"
              onError={(e) => {
                console.error("Failed to load back image:", imageIsBack.filepath);
                e.currentTarget.style.display = "none";
              }}
              loading="lazy"
            />

            <DesignArea
              placement="Back - Top"
              label="Back Top"
              customClass="top-[35%] left-[50%] w-[10%] h-[10%]"
              imageUrl={imagesByPlacement["Back - Top"]}
              onDownload={handleDownload}
              orderId={order.id}
            />

            <DesignArea
              placement="Back - Bottom"
              label="Back Bottom"
              customClass="top-[80%] left-[50%] w-[38%] h-[8%]"
              imageUrl={imagesByPlacement["Back - Bottom"]}
              onDownload={handleDownload}
              orderId={order.id}
            />
          </div>
        )}
        {!imageIsBack && !imageIsFront && (
          <Card className="flex-1 h-64 flex flex-col justify-center">
            <CardHeader className="items-center justify-center flex flex-col">
              <Box className="text-muted-foreground size-8" />
              <CardTitle>No Design Available</CardTitle>
              <CardDescription>
                {productTypeName} doesn&apos;t have any images and design areas
                configured.
              </CardDescription>
            </CardHeader>
            <CardContent className="items-center justify-center flex">
              <Link href="/admin/products">
                <Button variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Images for {productTypeName}
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
