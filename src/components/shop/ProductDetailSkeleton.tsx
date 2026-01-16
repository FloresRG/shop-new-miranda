import React from "react";
import Skeleton from "../ui/Skeleton";

const ProductDetailSkeleton = () => {
    return (
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 animate-pulse">
            {/* Gallery Skeleton */}
            <div className="space-y-4">
                <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-xl w-full"></div>
                <div className="flex gap-2 pb-2">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                    ))}
                </div>
            </div>

            {/* Info Skeleton */}
            <div className="flex flex-col h-full space-y-6">
                <div>
                    <Skeleton className="w-1/3 h-4 mb-3" />
                    <Skeleton className="w-3/4 h-10 mb-2" />
                    <Skeleton className="w-1/2 h-6" />
                </div>

                <Skeleton className="w-1/3 h-10" />

                <div className="space-y-2 grow">
                    <Skeleton className="w-full h-4" />
                    <Skeleton className="w-full h-4" />
                    <Skeleton className="w-5/6 h-4" />
                    <Skeleton className="w-4/5 h-4" />
                </div>

                <div className="flex flex-col gap-4 mt-auto">
                    <Skeleton className="w-full h-16 rounded-lg" />
                    <div className="flex gap-4">
                        <Skeleton className="flex-1 h-14 rounded-lg" />
                        <Skeleton className="w-16 h-14 rounded-lg" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailSkeleton;
