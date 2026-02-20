import Image from "next/image";
import { OrderWithCustomer } from "@/types/order";

// Custom component for external URLs that bypasses Next.js Image requirements for some cases
const ExternalImage = ({ src, alt, className }: { src: string; alt: string; className: string }) => (
  // eslint-disable-next-line @next/next/no-img-element
  <img src={src} alt={alt} className={className} />
);

interface OrderProductPreviewProps {
  order: OrderWithCustomer;
}

export default function OrderProductPreview({ order }: OrderProductPreviewProps) {
  const productImages = order.product_images || [];

  // Create a record of images by placement using exact database values
  const imagesByPlacement: Record<string, string> = {};
  productImages.forEach(img => {
    imagesByPlacement[img.place] = img.url;
  });

  // Extract brand and product type information
  const brandType = order.brand_type?.[0];
  const brandName = brandType?.brands?.name || 'Unknown Brand';
  const productTypeName = brandType?.product_type?.name || 'Unknown Product Type';

  return (
    <div className="space-y-4">
      {/* Product Info */}
      <div className="flex items-center gap-4 text-sm text-gray-600">
        <span className="font-medium">{brandName}</span>
        <span>•</span>
        <span className="font-medium">{productTypeName}</span>
      </div>

      {/* T-shirt Mockup */}
      <div className="flex flex-col lg:flex-row w-full relative justify-center items-start">

        <div className="relative w-fit flex items-center justify-center">
          <Image
            src="/image/Front Shirt.png"
            alt="T-Shirt Mockup"
            width={500}
            height={500}
            className="object-contain"
          />

          {/* Front Design Area - Top Left */}
          <div className="absolute top-[35%] left-[63%] w-[10%] h-[10%] border-2 border-dashed border-gray-400 rounded flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 overflow-hidden bg-white/50 z-10">
            {imagesByPlacement["Front - Top Left"] ? (
              <ExternalImage
                src={imagesByPlacement["Front - Top Left"]}
                alt="Front Top Left Design"
                className="w-full h-full object-contain"
              />
            ) : (
              <span className="text-gray-400 text-[8px] sm:text-xs md:text-sm">Front Top Left</span>
            )}
          </div>

          {/* Front Design Area - Center Large */}
          <div className="absolute top-[58%] left-[50%] w-[30%] h-[35%] border-2 border-dashed border-gray-400 rounded flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 overflow-hidden bg-white/50 z-10">
            {imagesByPlacement["Front - Center"] ? (
              <ExternalImage
                src={imagesByPlacement["Front - Center"]}
                alt="Front Center Design"
                className="w-full h-full object-contain"
              />
            ) : (
              <span className="text-gray-400 text-xs">Front Center</span>
            )}
          </div>
        </div>


        <div className="relative w-fit flex items-center justify-center">
          <Image
            src="/image/Back Shirt.png"
            alt="T-Shirt Mockup"
            width={500}
            height={500}
            className="object-contain"
          />

          {/* Back Design Area - Top Center */}
          <div className="absolute top-[35%] left-[50%] w-[10%] h-[10%] border-2 border-dashed border-gray-400 rounded flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 overflow-hidden bg-white/50 z-10">
            {imagesByPlacement["Back - Top"] ? (
              <ExternalImage
                src={imagesByPlacement["Back - Top"]}
                alt="Back Top Design"
                className="w-full h-full object-contain"
              />
            ) : (
              <span className="text-gray-400 text-xs">Back Top</span>
            )}
          </div>

          {/* Back Design Area - Bottom Center */}
          <div className="absolute top-[70%] left-[50%] w-[38%] h-[8%] border-2 border-dashed border-gray-400 rounded flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 overflow-hidden bg-white/50 z-10">
            {imagesByPlacement["Back - Bottom"] ? (
              <ExternalImage
                src={imagesByPlacement["Back - Bottom"]}
                alt="Back Bottom Design"
                className="w-full h-full object-contain"
              />
            ) : (
              <span className="text-gray-400 text-xs">Back Bottom</span>
            )}
          </div>
        </div>
      </div>
    </div >
  );
}
