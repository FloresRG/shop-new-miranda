import React, { useEffect, useState } from "react";
import WholesaleProductCard from "./WholesaleProductCard";
import Skeleton from "../ui/Skeleton";
import type { ApiResponse, Product } from "../../interfaces/product";
import { apiProductos } from "../../lib/apiProductos";

const WholesaleProductsHelper = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);

    const fetchWholesale = async (pageNumber = 1) => {
        setLoading(true);
        try {
            const data: ApiResponse = await apiProductos.fetchProductos({
                page: pageNumber,
                includePrices: true,
                per_page: 20
            });

            if (pageNumber === 1) {
                setProducts(data.productos);
            } else {
                setProducts(prev => [...prev, ...data.productos]);
            }

            setLastPage(data.pagination.last_page);
            setPage(data.pagination.current_page);
        } catch (error) {
            console.error("Failed to fetch wholesale products:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWholesale(1);
    }, []);

    const loadMore = () => {
        if (page < lastPage) {
            fetchWholesale(page + 1);
        }
    };

    if (loading && page === 1) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <div key={i} className="bg-[#1a1a1a] rounded-3xl h-[450px] border border-[#D4AF37]/10 overflow-hidden">
                        <Skeleton className="w-full h-[280px]" />
                        <div className="p-5 space-y-4">
                            <Skeleton className="w-2/3 h-6" />
                            <Skeleton className="w-full h-12" />
                            <Skeleton className="w-full h-20" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {products.map((product) => (
                    <WholesaleProductCard key={`${product.id}-${page}`} product={product} />
                ))}
            </div>

            {page < lastPage && (
                <div className="text-center pb-10">
                    <button
                        onClick={loadMore}
                        disabled={loading}
                        className="px-8 py-4 bg-white/5 text-[#D4AF37] border-2 border-[#D4AF37]/30 rounded-2xl font-black hover:bg-[#D4AF37] hover:text-black transition-all uppercase tracking-widest"
                    >
                        {loading ? "Cargando..." : "Cargar Más Productos"}
                    </button>
                </div>
            )}
        </div>
    );
};

export default WholesaleProductsHelper;
