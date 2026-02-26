import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function AdminDashboardSkeleton() {
  return (
    <div className="p-6">
      {/* Header Skeleton */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <Skeleton className="h-7 lg:h-8 w-32 mb-2" />
          <Skeleton className="h-4 lg:h-5 w-48" />
        </div>
        <Skeleton className="h-9 w-9 rounded-md" />
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="p-6">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </div>
            <div>
              <Skeleton className="h-8 w-16 mb-1" />
              <Skeleton className="h-3 w-32" />
            </div>
          </Card>
        ))}
      </div>

      {/* Two-column layout: Charts + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Left Column - Charts */}
        <div className="flex flex-col gap-6">
          {/* Most Ordered Products Chart Skeleton */}
          <Card className="p-6">
            <div className="flex flex-row items-center justify-between flex-wrap gap-4 mb-4">
              <div>
                <Skeleton className="h-4 lg:h-5 w-44 mb-2" />
                <Skeleton className="h-3 lg:h-4 w-40" />
              </div>
              <div className="flex items-center gap-2">
                <div className="flex flex-col gap-1">
                  <Skeleton className="h-2.5 w-16" />
                  <Skeleton className="h-8 w-[200px]" />
                </div>
              </div>
            </div>
            <Skeleton className="h-[300px] w-full rounded-md" />
          </Card>

          {/* Top Customers Chart Skeleton */}
          <Card className="p-6">
            <div className="flex flex-row items-center justify-between flex-wrap gap-4 mb-4">
              <div>
                <Skeleton className="h-4 lg:h-5 w-32 mb-2" />
                <Skeleton className="h-3 lg:h-4 w-48" />
              </div>
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex flex-col gap-1">
                  <Skeleton className="h-2.5 w-8" />
                  <Skeleton className="h-8 w-[150px]" />
                </div>
              </div>
            </div>
            <Skeleton className="h-[300px] w-full rounded-md" />
          </Card>

          {/* Most Ordered Brands Skeleton */}
          <Card className="p-6">
            <div className="flex flex-row items-center justify-between flex-wrap gap-4 mb-4">
              <div>
                <Skeleton className="h-4 lg:h-5 w-32 mb-2" />
                <Skeleton className="h-3 lg:h-4 w-48" />
              </div>
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex flex-col gap-1">
                  <Skeleton className="h-2.5 w-8" />
                  <Skeleton className="h-8 w-[150px]" />
                </div>
              </div>
            </div>
            <Skeleton className="h-[300px] w-full rounded-md" />
          </Card>
        </div>

        {/* Right Column - Recent Activity Skeleton */}
        <div className="h-fit">
          <Card className="p-6">
            <div className="mb-4">
              <Skeleton className="h-4 lg:h-5 w-32 mb-2" />
              <Skeleton className="h-3 lg:h-4 w-40" />
            </div>
            <div className="space-y-4">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4 p-4">
                  <Skeleton className="w-2 h-2 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                  <Skeleton className="h-3 w-16" />
                </div>
              ))}
            </div>
            {/* Pagination Skeleton */}
            <div className="mt-6 flex justify-center gap-2">
              <Skeleton className="h-8 w-8 rounded-md" />
              <Skeleton className="h-8 w-8 rounded-md" />
              <Skeleton className="h-8 w-8 rounded-md" />
              <Skeleton className="h-8 w-8 rounded-md" />
              <Skeleton className="h-8 w-8 rounded-md" />
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
