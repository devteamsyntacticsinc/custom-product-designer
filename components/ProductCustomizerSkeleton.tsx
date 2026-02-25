import { Skeleton } from "@/components/ui/skeleton";

export default function ProductCustomizerSkeleton() {
  return (
    <div className="w-80 bg-white shadow-lg p-6 overflow-y-auto flex flex-col min-h-full">
      {/* Title */}
      <Skeleton className="h-8 w-48 mb-6" />

      {/* Product Type */}
      <div className="mb-6">
        <Skeleton className="h-4 w-24 mb-2" />
        <Skeleton className="h-10 w-full" />
      </div>

      {/* Brand */}
      <div className="mb-6">
        <Skeleton className="h-4 w-16 mb-2" />
        <Skeleton className="h-10 w-full" />
      </div>

      {/* Color */}
      <div className="mb-6">
        <Skeleton className="h-4 w-20 mb-2" />
        <Skeleton className="h-10 w-full" />
      </div>

      {/* Assets Section */}
      <div className="mb-6">
        <Skeleton className="h-6 w-32 mb-4" />
        <div className="grid grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="aspect-square">
              <Skeleton className="h-full w-full rounded-lg" />
            </div>
          ))}
        </div>
      </div>

      {/* Sizing and Quantity */}
      <div className="mb-6">
        <Skeleton className="h-6 w-40 mb-4" />
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <div className="grid grid-cols-2 gap-2" key={index}>
              <div className="h-6 w-16 bg-muted rounded animate-pulse" />
              <div className="h-10 w-full bg-muted rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mt-auto pt-6">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 flex-1" />
      </div>
    </div>
  );
}
