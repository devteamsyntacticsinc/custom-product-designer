import { Skeleton } from '@/components/ui/skeleton'
import { Card } from '@/components/ui/card'

export default function OrdersPageSkeleton() {
  return (
    <div className="space-y-4 px-6 py-6">
      {/* Header Skeleton */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <Skeleton className="h-9 w-24 mb-2" />
          <Skeleton className="h-5 w-48" />
        </div>
        <Skeleton className="h-9 w-20" />
      </div>

      {/* Orders List Skeleton */}
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="p-6">
            <div className="space-y-6">
              {/* Product Preview Skeleton */}
              <div>
                <Skeleton className="h-6 w-32 mb-4" />
                <div className="relative w-full h-96 bg-gray-50 rounded-lg overflow-hidden">
                  <Skeleton className="w-full h-full" />
                </div>
              </div>

              {/* Order Details Skeleton */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-2">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-20" />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Skeleton className="h-3 w-12" />
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                </div>

                {/* Customer Info Skeleton */}
                <div className="text-right space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-40" />
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
