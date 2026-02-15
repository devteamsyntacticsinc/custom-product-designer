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

  return (
    <div className="relative w-full h-96 flex items-center justify-center rounded-lg overflow-hidden">
      {/* T-shirt Mockup */}
      <Image
        src="/image/shirt.png"
        alt="T-Shirt Mockup"
        fill
        className="object-contain"
      />
      
      {/* Front Design Area - Top Left */}
      <div className="absolute top-[37%] left-[41%] w-8 h-8 border-2 border-dashed border-gray-400 rounded flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 overflow-hidden bg-white/50">
        {imagesByPlacement["Front - Top Left"] ? (
          <ExternalImage 
            src={imagesByPlacement["Front - Top Left"]} 
            alt="Front Top Left Design" 
            className="w-full h-full object-contain" 
          />
        ) : (
          <span className="text-gray-400 text-xs">Front Top Left</span>
        )}
      </div>
      
      {/* Front Design Area - Center Large */}
      <div className="absolute top-[57%] left-[38.5%] w-20 h-24 border-2 border-dashed border-gray-400 rounded flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 overflow-hidden bg-white/50">
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
      <div className="absolute top-[48%] left-[61.3%] w-16 h-16 border-2 border-dashed border-gray-400 rounded flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 overflow-hidden bg-white/50">
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
      <div className="absolute top-[68%] left-[61.3%] w-32 h-8 border-2 border-dashed border-gray-400 rounded flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 overflow-hidden bg-white/50">
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
  );
}
