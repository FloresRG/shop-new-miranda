import React, { useEffect, useState } from "react";
import type { ApiResponse, Brand } from "../../interfaces/product";

const BrandListHelper = () => {
    const [brands, setBrands] = useState<Brand[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBrands = async () => {
            try {
                const res = await fetch("/api/productos?page=1");
                if (res.ok) {
                    const data: ApiResponse = await res.json();
                    setBrands(data.marcas);
                }
            } catch (error) {
                console.error("Failed to fetch brands:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchBrands();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-wrap justify-center gap-4 lg:gap-8 items-center opacity-80">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="w-32 h-10 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse border-2 border-transparent" />
                ))}
            </div>
        )
    }

    return (
        <div className="flex flex-wrap justify-center gap-4 lg:gap-8 items-center opacity-80 hover:opacity-100 transition-opacity">
            {brands.map((brand) => (
                <a
                    key={brand.id}
                    href={`/tienda?marca_id=${brand.id}`}
                    className="px-6 py-3 rounded-full border-2 border-border dark:border-darkmode-border hover:border-primary hover:text-primary transition-all font-bold text-gray-500 dark:text-gray-400 text-sm lg:text-base uppercase tracking-widest"
                >
                    {brand.marca}
                </a>
            ))}
        </div>
    );
};

export default BrandListHelper;
