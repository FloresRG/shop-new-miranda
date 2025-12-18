import React from "react";
import ProductCard from "./ProductCard";
import Skeleton from "../ui/Skeleton";
import type { Product } from "../../interfaces/product";

interface ProductGridProps {
    products: Product[];
    isLoading?: boolean;
}

const ProductGrid: React.FC<ProductGridProps> = ({ products, isLoading = false }) => {
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <div key={i} className="bg-white dark:bg-darkmode-theme-light rounded-lg h-[400px] border border-border dark:border-darkmode-border overflow-hidden">
                        <Skeleton className="w-full h-[250px]" />
                        <div className="p-4 space-y-4">
                            <Skeleton className="w-2/3 h-6" />
                            <Skeleton className="w-full h-12" />
                            <div className="flex justify-between items-center">
                                <Skeleton className="w-20 h-8" />
                                <Skeleton className="w-24 h-10" />
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
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
            {products.length === 0 && (
                <div className="col-span-full py-20 text-center">
                    <h3 className="text-xl font-bold text-gray-500">
                        No se encontraron productos
                    </h3>
                    <p className="text-gray-400">
                        Intenta ajustar los filtros de búsqueda.
                    </p>
                </div>
            )}
        </>
    );
};

export default ProductGrid;
