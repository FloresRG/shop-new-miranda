import React from "react";
import WholesaleProductCard from "./WholesaleProductCard";
import Skeleton from "../ui/Skeleton";
import type { Product } from "../../interfaces/product";

interface WholesaleProductGridProps {
    products: Product[];
    isLoading?: boolean;
}

const WholesaleProductGrid: React.FC<WholesaleProductGridProps> = ({ products, isLoading = false }) => {
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <div key={i} className="bg-[#1a1a1a] rounded-3xl h-[450px] border border-white/5 overflow-hidden">
                        <Skeleton className="w-full h-[280px] bg-white/5" />
                        <div className="p-4 space-y-4">
                            <Skeleton className="w-2/3 h-6 bg-white/5" />
                            <Skeleton className="w-full h-12 bg-white/5" />
                            <div className="grid grid-cols-2 gap-2 mt-4">
                                <Skeleton className="h-10 bg-white/5" />
                                <Skeleton className="h-10 bg-white/5" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => (
                    <WholesaleProductCard key={product.id} product={product} />
                ))}
            </div>
            {products.length === 0 && (
                <div className="col-span-full py-20 text-center">
                    <h3 className="text-xl font-bold text-gray-400">
                        No se encontraron productos exclusivos
                    </h3>
                    <p className="text-gray-500">
                        Intenta ajustar los filtros de búsqueda VIP.
                    </p>
                </div>
            )}
        </>
    );
};

export default WholesaleProductGrid;
