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
    <div className="flex-1 p-8">
      <div className="max-w-6xl mx-auto h-full">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Product Preview</h2>

        {/* Product Display */}
        <div className="relative w-full h-full flex items-center justify-center">
          {/* T-shirt Mockup */}
          <Image
            src="/image/shirt.png"
            alt="T-Shirt Front"
            fill
            className="object-contain"
          />
          {/* Front Design Area - Top Left */}
          <div className="absolute top-[40%] left-[34%] w-15 h-15 border-2 border-dashed border-gray-400 rounded flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 overflow-hidden bg-white/50">
            {previews["front-top-left"] ? (
              <BlobImage src={previews["front-top-left"]} alt="Preview" className="w-full h-full object-contain" />
            ) : (
              <span className="text-gray-400 text-xs">Front Top Left</span>
            )}
          </div>
          {/* Front Design Area - Center Large */}
          <div className="absolute top-[55%] left-[28%] w-48 h-56 border-2 border-dashed border-gray-400 rounded flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 overflow-hidden bg-white/50">
            {previews["front-center"] ? (
              <BlobImage src={previews["front-center"]} alt="Preview" className="w-full h-full object-contain" />
            ) : (
              <span className="text-gray-400 text-xs">Front Center</span>
            )}
          </div>
          {/* Back Design Area - Top Center */}
          <div className="absolute top-[50%] left-[71%] w-24 h-24 border-2 border-dashed border-gray-400 rounded flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 overflow-hidden bg-white/50">
            {previews["back-top"] ? (
              <BlobImage src={previews["back-top"]} alt="Preview" className="w-full h-full object-contain" />
            ) : (
              <span className="text-gray-400 text-xs">Back Top</span>
            )}
          </div>
          {/* Back Design Area - Bottom Center */}
          <div className="absolute top-[66%] left-[71%] w-48 h-10 border-2 border-dashed border-gray-400 rounded flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 overflow-hidden bg-white/50">
            {previews["back-bottom"] ? (
              <BlobImage src={previews["back-bottom"]} alt="Preview" className="w-full h-full object-contain" />
            ) : (
              <span className="text-gray-400 text-xs">Back Bottom</span>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
