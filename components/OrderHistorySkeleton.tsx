import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export default function OrderHistorySkeleton() {
    return (
        <div className="grid gap-6">
            {[...Array(2)].map((_, i) => (
                <div key={i} className="bg-white border rounded-xl overflow-hidden shadow-sm">
                    {/* Order Header Skeleton */}
                    <div className="bg-gray-50/50 px-4 py-3 border-b flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <Skeleton className="h-5 w-16" />
                            <div className="flex items-center gap-1.5">
                                <Skeleton className="h-4 w-24" />
                            </div>
                        </div>
                        <Skeleton className="h-5 w-20 rounded-full" />
                    </div>

                    <div className="p-4 sm:p-6 space-y-6">
                        {/* Product Preview Section Skeleton */}
                        <div>
                            <Skeleton className="h-4 w-32 mb-4" />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 scale-[0.95] origin-top">
                                <div className="space-y-3">
                                    <Skeleton className="h-5 w-24 mx-auto" />
                                    <div className="aspect-square bg-gray-100 rounded-lg animate-pulse" />
                                </div>
                                <div className="space-y-3">
                                    <Skeleton className="h-5 w-24 mx-auto" />
                                    <div className="aspect-square bg-gray-100 rounded-lg animate-pulse" />
                                </div>
                            </div>
                        </div>

                        {/* Detailed Info Section Skeleton */}
                        <div className="space-y-4 pt-4 border-t border-gray-100">
                            <div className="flex flex-wrap items-center gap-3">
                                <Skeleton className="h-6 w-20" />
                                <Skeleton className="h-4 w-4 rounded-full" />
                                <Skeleton className="h-6 w-32" />
                                <Skeleton className="h-4 w-4 rounded-full" />
                                <Skeleton className="h-6 w-24" />
                            </div>

                            <div className="space-y-2">
                                <Skeleton className="h-4 w-32" />
                                <div className="flex flex-wrap gap-2">
                                    <Skeleton className="h-6 w-16 rounded-full" />
                                    <Skeleton className="h-6 w-20 rounded-full" />
                                    <Skeleton className="h-6 w-16 rounded-full" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
