import Image from "next/image";
import { OrderWithCustomer } from "@/types/order";
import { Box, Download, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import Link from "next/link";

// Custom component for external URLs that bypasses Next.js Image requirements for some cases
const ExternalImage = ({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className: string;
}) => (
  // eslint-disable-next-line @next/next/no-img-element
  <img src={src} alt={alt} className={className} />
);

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

const DesignArea = ({
  placement,
  label,
  customClass,
  imageUrl,
  onDownload,
  orderId,
}: DesignAreaProps) => {
  return (
    <div
      className={`absolute ${customClass} border-2 border-dashed border-gray-400  rounded flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 overflow-hidden bg-white/50 z-10 transition-all duration-200 ${imageUrl ? "cursor-pointer hover:border-primary hover:bg-background group" : ""}`}
      onClick={() =>
        imageUrl &&
        onDownload(imageUrl, `${orderId}_${placement.replace(/\s+/g, "_")}.png`)
      }
      title={imageUrl ? `Click to download ${label}` : ""}
    >
      {imageUrl ? (
        <>
          <ExternalImage
            src={imageUrl}
            alt={label}
            className="w-full h-full object-contain"
          />
          <div className="absolute inset-0 bg-black/20  opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
            <Download className="text-white w-4 h-4" />
          </div>
        </>
      ) : (
        <span className="text-gray-400 text-[8px] sm:text-xs md:text-sm text-center px-1">
          {label}
        </span>
      )}
    </div>
  );
};

export default function OrderProductPreview({
  order,
}: OrderProductPreviewProps) {
  const productImages = order.product_images || [];
  const productTypeImages =
    order.brand_type?.[0]?.product_type?.image_products || [];
  // Check is is only type
  const isOnlyType = order.brand_type?.[0]?.product_type?.is_onlyType || false;
  // Finds images that are front and back
  const imageIsFront = productTypeImages.find(
    (img) => img.is_hasBack === false,
  );
  const imageIsBack = productTypeImages.find((img) => img.is_hasBack === true);

  // Create a record of images by placement using exact database values
  const imagesByPlacement: Record<string, string> = {};
  productImages.forEach((img) => {
    imagesByPlacement[img.place] = img.url;
  });

  // Extract brand and product type information
  const brandType = order.brand_type?.[0];
  const brandName = brandType?.brands?.name || "Unknown Brand";
  const productTypeName =
    brandType?.product_type?.name || "Unknown Product Type";

  // Check if brand should be displayed
  const shouldDisplayBrand = !isOnlyType && brandName !== "Unknown Brand";

  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Download failed:", error);
      // Fallback: open in new tab
      window.open(url, "_blank");
    }
  };

  return (
    <div className="space-y-4">
      {/* Product Info & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-background dark:bg-gray-700 border dark:border-gray-800 rounded-xl shadow-sm">
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
              productImages.forEach((img, index) => {
                setTimeout(() => {
                  handleDownload(
                    img.url,
                    `${order.id}_${img.place.replace(/\s+/g, "_")}.png`,
                  );
                }, index * 500); // Stagger downloads to prevent browser blocking
              });
            }}
          >
            <Download className="h-4 w-4 " />
            Download All Designs ({productImages.length})
          </Button>
        )}
      </div>

      {/* T-shirt Mockup */}
      <div className="flex flex-col lg:flex-row w-full relative justify-center items-start">
        {isOnlyType && imageIsFront && (
          <div className="relative w-fit flex items-center justify-center rounded-lg max-w-lg">
            {imageIsFront && (
              <Image
                src={imageIsFront.filepath}
                alt="Front View"
                width={700}
                height={700}
                className="object-contain"
              />
            )}

            {/* Center area - Mug positioning */}
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
        {!isOnlyType && imageIsFront && (
          <div className="relative w-fit flex items-center justify-center rounded-lg">
            {imageIsFront && (
              <Image
                src={imageIsFront.filepath}
                alt="Front View"
                width={350}
                height={350}
                className="object-contain"
              />
            )}

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

        {!isOnlyType && imageIsBack && (
          <div className="relative w-fit flex items-center justify-center rounded-lg p-2">
            {imageIsBack && (
              <Image
                src={imageIsBack.filepath}
                alt="Back View"
                width={350}
                height={350}
                className="object-contain"
              />
            )}

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
            <CardContent className="items-center justify-center flex ">
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
