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
            <div className="flex flex-wrap justify-center gap-4 lg:gap-6 items-center w-full">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="px-6 py-3 rounded-full bg-gray-100 dark:bg-darkmode-light animate-pulse w-32 h-12" />
                ))}
            </div>
        )
    }

    return (
        <div className="flex flex-wrap justify-center gap-3 lg:gap-4 items-center">
            {brands.map((brand) => (
                <a
                    key={brand.id}
                    href={`/tienda?marca_id=${brand.id}`}
                    className="px-6 py-3 rounded-xl bg-white dark:bg-darkmode-light border border-gray-200 dark:border-darkmode-border text-gray-700 dark:text-white font-bold text-sm tracking-wide transition-all duration-300 hover:border-primary hover:text-white hover:bg-primary hover:shadow-lg hover:-translate-y-1 shadow-sm"
                >
                    {brand.marca}
                </a>
            ))}
        </div>
    );
};

export default BrandListHelper;
