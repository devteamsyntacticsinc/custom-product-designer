import Image from "next/image";
import { useState, useEffect } from "react";
import { useAssets } from "@/contexts/AssetsContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Box } from "lucide-react";

// Custom component for blob URLs that bypasses Next.js Image requirements
const BlobImage = ({
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

export default function ProductPreview() {
  const { assets, selectedProductType } = useAssets();
  const [previews, setPreviews] = useState<Record<string, string>>({});

  useEffect(() => {
    const newPreviews: Record<string, string> = {};
    const objectUrls: string[] = [];

    Object.entries(assets).forEach(([id, file]) => {
      if (file) {
        const url = URL.createObjectURL(file);
        newPreviews[id] = url;
        objectUrls.push(url);
      }
    });

    // Use a timeout to avoid synchronous setState
    const timeoutId = setTimeout(() => {
      setPreviews(newPreviews);
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      objectUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [assets]);
  const frontProductImage = selectedProductType?.image_products?.find(
    (img) => img.is_hasBack === false,
  );

  console.log("assets:", assets);
  

  return (
    <div className="flex-1 p-4 lg:p-8 overflow-y-auto lg:overflow-hidden scrollbar-hide">
      <div className="max-w-7xl mx-auto h-full pt-15 md:pt-10 lg:pt-5">
        <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900 mb-8">
          Product Preview
        </h2>

        {/* Product Display */}
        <div className="flex flex-col lg:flex-row w-full relative justify-center items-start ">
          {/* Front Product */}
          {frontProductImage ? (
            <div className="relative aspect-square flex justify-center items-start w-[50%]">
              <Image
                src={frontProductImage.filepath}
                alt="Front Product"
                width={1000}
                height={1000}
                className="object-contain"
              />
              {/* Front Design Area - Top Left */}
              <div
                className={`absolute top-[25%] left-[65%] w-[10%] h-[10%] border-2 border-dashed border-gray-400 rounded flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 overflow-hidden bg-white/50 z-10 ${selectedProductType?.is_onlyType ? "hidden" : ""}`}
              >
                {previews["front-top-left"] ? (
                  <BlobImage
                    src={previews["front-top-left"]}
                    alt="Preview"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <span className="text-gray-400 text-[10px]">
                    Front Top Left
                  </span>
                )}
              </div>
              {/* Front Design Area - Center Large */}
              <div
                className={`absolute border-2 border-dashed border-gray-400 rounded flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 overflow-hidden bg-white/50 z-10 ${selectedProductType?.is_onlyType ? "top-[53%] left-[45%] w-[30%] h-[40%] " : "top-[58%] left-[50%] w-[30%] h-[40%]"}`}
              >
                {previews["front-center"] ? (
                  <BlobImage
                    src={previews["front-center"]}
                    alt="Preview"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <span className="text-gray-400 text-[10px]">
                    Front Center
                  </span>
                )}
              </div>
            </div>
          ) : (
            <Card className="w-full h-[45vh] flex items-center justify-center">
              <CardContent className="flex flex-col items-center justify-center text-center gap-4">
                <Box className="size-20 text-muted-foreground" />
                <div className="flex-1">
                  <CardTitle className="text-lg">
                    {selectedProductType
                      ? "No Front Product Image"
                      : "No Product Selected"}
                  </CardTitle>
                  <CardDescription className="text-base">
                    {selectedProductType
                      ? "Please select a product type with a front image."
                      : "Please select a product type."}
                  </CardDescription>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Back Product (Only for shirts) */}
          {selectedProductType?.image_products?.find(
            (img) => img.is_hasBack === true,
          ) && (
            <div className="relative aspect-square flex justify-center items-start w-[50%]">
              <Image
                src={
                  selectedProductType?.image_products?.find(
                    (img) => img.is_hasBack === true,
                  )?.filepath || "/image/Back Shirt.png"
                }
                alt="T-Shirt Back"
                width={1000}
                height={1000}
                className="object-contain"
              />
              {/* Back Design Area - Top Center */}
              <div className="absolute top-[25%] left-[50%] w-[10%] h-[10%] border-2 border-dashed border-gray-400 rounded flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 overflow-hidden bg-white/50 z-10">
                {previews["back-top"] ? (
                  <BlobImage
                    src={previews["back-top"]}
                    alt="Preview"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <span className="text-gray-400 text-[10px]">Back Top</span>
                )}
              </div>
              {/* Back Design Area - Bottom Center */}
              <div className="absolute top-[75%] left-[50%] w-[38%] h-[8%] border-2 border-dashed border-gray-400 rounded flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 overflow-hidden bg-white/50 z-10">
                {previews["back-bottom"] ? (
                  <BlobImage
                    src={previews["back-bottom"]}
                    alt="Preview"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <span className="text-gray-400 text-[10px]">Back Bottom</span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
