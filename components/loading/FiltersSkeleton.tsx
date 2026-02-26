export default function FiltersSkeleton() {
  return (
    <div className="flex items-center gap-2 w-full mt-4 overflow-y-auto p-2">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex flex-col gap-1 min-w-[150px]">
          <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        </div>
      ))}
      <div className="ml-auto mt-auto">
        <div className="h-10 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
      </div>
    </div>
  );
}
