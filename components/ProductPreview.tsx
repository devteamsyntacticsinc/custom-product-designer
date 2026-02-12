"use client";

import Image from "next/image";

export default function ProductPreview() {
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
              <div className="absolute top-[40%] left-[34%] w-18 h-18 border-2 border-dashed border-gray-400 rounded flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2">
                <span className="text-gray-400 text-xs">Front Top Left</span>
              </div>
              {/* Front Design Area - Center Large */}
              <div className="absolute top-[53%] left-[28%] w-48 h-56 border-2 border-dashed border-gray-400 rounded flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2">
                <span className="text-gray-400 text-xs">Front Center</span>
              </div>
              {/* Back Design Area - Top Center */}
              <div className="absolute top-[50%] left-[71%] w-24 h-24 border-2 border-dashed border-gray-400 rounded flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2">
                <span className="text-gray-400 text-xs">Back Top</span>
              </div>
              {/* Back Design Area - Bottom Center */}
              <div className="absolute top-[66%] left-[71%] w-48 h-10 border-2 border-dashed border-gray-400 rounded flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2">
                <span className="text-gray-400 text-xs">Back Bottom</span>
              </div>
           
          </div>
        
      </div>
    </div>
  );
}
