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
      <div className="relative w-full h-96 flex items-center justify-center rounded-lg overflow-hidden">
      {/* T-shirt Mockup */}
      <Image
        src="/image/shirt.png"
        alt="T-Shirt Mockup"
        fill
        className="object-contain"
      />
      
      {/* Front Design Area - Top Left */}
      <div className="absolute top-[37%] left-[38%] sm:top-[36%] sm:left-[39%] md:top-[35%] md:left-[39%] lg:top-[37%] lg:left-[41%] w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-8 lg:h-8 border-2 border-dashed border-gray-400 rounded flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 overflow-hidden bg-white/50">
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
      <div className="absolute top-[57%] left-[37.5%] w-20 h-24 border-2 border-dashed border-gray-400 rounded flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 overflow-hidden bg-white/50">
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
      
      {/* Back Design Area - Top Center */}
      <div className="absolute top-[48%] left-[62%] w-16 h-16 border-2 border-dashed border-gray-400 rounded flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 overflow-hidden bg-white/50">
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
      <div className="absolute top-[68%] left-[62%] w-32 h-8 border-2 border-dashed border-gray-400 rounded flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 overflow-hidden bg-white/50">
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
  );
}
