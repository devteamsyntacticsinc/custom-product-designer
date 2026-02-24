export default function ActivitySkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 10 }).map((_, index) => (
        <div key={index} className="flex items-center space-x-4">
          <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse"></div>
          <div className="flex-1">
            <div className="h-4 bg-gray-300 rounded w-3/4 mb-2 animate-pulse"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
          </div>
          <div className="h-3 bg-gray-200 rounded w-16 animate-pulse"></div>
        </div>
      ))}
    </div>
  )
}
