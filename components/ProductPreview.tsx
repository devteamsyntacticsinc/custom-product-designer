import Image from "next/image";
import { useState, useEffect } from "react";
import { useAssets } from "@/contexts/AssetsContext";

// Custom component for blob URLs that bypasses Next.js Image requirements
const BlobImage = ({ src, alt, className }: { src: string; alt: string; className: string }) => (
  // eslint-disable-next-line @next/next/no-img-element
  <img src={src} alt={alt} className={className} />
);

export default function ProductPreview() {
  const { assets } = useAssets();
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

  return (
    <div className="flex-1 p-4 lg:p-8 overflow-y-auto">
      <div className="max-w-7xl mx-auto h-full pt-15">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Product Preview</h2>

        {/* Product Display */}
        <div className="flex flex-col lg:flex-row w-full relative justify-center items-start">
          {/* Front T-shirt */}
          <div className="relative w-full aspect-square">
            <Image
              src="/image/Front Shirt.png"
              alt="T-Shirt Front"
              width={1000}
              height={1000}
              className="object-contain"
            />
            {/* Front Design Area - Top Left */}
            <div className="absolute top-[35%] left-[63%] w-[10%] h-[10%] border-2 border-dashed border-gray-400 rounded flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 overflow-hidden bg-white/50 z-10">
              {previews["front-top-left"] ? (
                <BlobImage src={previews["front-top-left"]} alt="Preview" className="w-full h-full object-contain" />
              ) : (
                <span className="text-gray-400 text-[10px]">Front Top Left</span>
              )}
            </div>
            {/* Front Design Area - Center Large */}
            <div className="absolute top-[58%] left-[50%] w-[30%] h-[35%] border-2 border-dashed border-gray-400 rounded flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 overflow-hidden bg-white/50 z-10">
              {previews["front-center"] ? (
                <BlobImage src={previews["front-center"]} alt="Preview" className="w-full h-full object-contain" />
              ) : (
                <span className="text-gray-400 text-[10px]">Front Center</span>
              )}
            </div>
          </div>

          {/* Back T-shirt */}
          <div className="relative w-full aspect-square">
            <Image
              src="/image/Back Shirt.png"
              alt="T-Shirt Back"
              width={1000}
              height={1000}
              className="object-contain"
            />
            {/* Back Design Area - Top Center */}
            <div className="absolute top-[35%] left-[50%] w-[10%] h-[10%] border-2 border-dashed border-gray-400 rounded flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 overflow-hidden bg-white/50 z-10">
              {previews["back-top"] ? (
                <BlobImage src={previews["back-top"]} alt="Preview" className="w-full h-full object-contain" />
              ) : (
                <span className="text-gray-400 text-[10px]">Back Top</span>
              )}
            </div>
            {/* Back Design Area - Bottom Center */}
            <div className="absolute top-[70%] left-[50%] w-[38%] h-[8%] border-2 border-dashed border-gray-400 rounded flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 overflow-hidden bg-white/50 z-10">
              {previews["back-bottom"] ? (
                <BlobImage src={previews["back-bottom"]} alt="Preview" className="w-full h-full object-contain" />
              ) : (
                <span className="text-gray-400 text-[10px]">Back Bottom</span>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
