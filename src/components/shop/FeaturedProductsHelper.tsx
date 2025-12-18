import React, { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import Skeleton from "../ui/Skeleton";
import type { ApiResponse, Product } from "../../interfaces/product";

const FeaturedProductsHelper = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFeatured = async () => {
            try {
                // Fetch page 1 to get latest/featured products
                const res = await fetch("/api/productos?page=1");
                if (res.ok) {
                    const data: ApiResponse = await res.json();
                    // Limitar a 8 productos
                    setProducts(data.productos.slice(0, 8));
                }
            } catch (error) {
                console.error("Failed to fetch featured products:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchFeatured();
    }, []);

    if (loading) {
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
                <ProductCard key={product.id} product={product} />
            ))}
        </div>
    );
};

export default FeaturedProductsHelper;
