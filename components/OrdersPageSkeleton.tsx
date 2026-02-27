import { Skeleton } from '@/components/ui/skeleton'
import { Card } from '@/components/ui/card'

export default function OrdersPageSkeleton() {
  return (
    <div className="space-y-4 p-4 sm:p-6 lg:p-8 dark:bg-[#0d1117]">
      {/* Header Skeleton */}
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Skeleton className="h-8 sm:h-9 w-32 mb-2" />
          <Skeleton className="h-4 sm:h-5 w-48 sm:w-64" />
        </div>
        <Skeleton className="h-9 w-24 hidden sm:block" />
      </div>

      {/* Orders List Skeleton */}
      <div className="space-y-4 sm:space-y-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="p-4 sm:p-6 overflow-hidden">
            <div className="space-y-6">
              {/* Product Preview Skeleton */}
              <div>
                <div className="flex items-center justify-between gap-2">
                  <Skeleton className="h-6 w-32 mb-4" />
                  <Skeleton className="h-6 w-32 mb-4" />
                </div>
                <div className="relative w-full aspect-square sm:h-96 bg-muted rounded-lg overflow-hidden">
                  <Skeleton className="w-full h-full" />
                </div>
              </div>

              {/* Order Details Skeleton */}
              <div className="flex flex-col sm:flex-row items-start justify-between gap-6">
                <div className="flex-1 w-full">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-4">
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-16" />
                  </div>

                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-24" />
                  </div>

                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-10 text-xs" />
                    <Skeleton className="h-6 w-14 rounded-full" />
                    <Skeleton className="h-6 w-14 rounded-full" />
                  </div>
                </div>

                {/* Customer Info Skeleton */}
                <div className="w-full sm:w-auto sm:text-right space-y-2 border-t sm:border-t-0 pt-4 sm:pt-0">
                  <Skeleton className="h-5 w-32 sm:ml-auto" />
                  <Skeleton className="h-4 w-40 sm:ml-auto" />
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
