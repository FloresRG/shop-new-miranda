import React, { useState } from "react";
import { FaShapes, FaTags, FaLayerGroup, FaSearch } from "react-icons/fa";
import type { Category, Brand, Type } from "../../interfaces/product";

interface SidebarFiltersProps {
    categories: Category[];
    brands: Brand[];
    types: Type[];
    currentCategory?: number;
    currentBrand?: number;
    currentType?: number;
    onFilterChange: (key: string, value: number | null) => void;
    onClearFilters: () => void;
    isLoading?: boolean;
}

const SidebarFilters: React.FC<SidebarFiltersProps> = ({
    categories,
    brands,
    types,
    currentCategory,
    currentBrand,
    currentType,
    onFilterChange,
    onClearFilters,
    isLoading = false,
}) => {
    const [catQuery, setCatQuery] = useState("");
    const [brandQuery, setBrandQuery] = useState("");

    // Skeleton Loader for Sidebar
    if (isLoading) {
        return (
            <aside className="w-full lg:w-64 flex-shrink-0 space-y-8">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white dark:bg-darkmode-light p-6 rounded-lg shadow-sm border border-border dark:border-darkmode-border">
                        <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 animate-pulse rounded mb-4" />
                        <div className="space-y-2">
                            {[1, 2, 3, 4, 5].map((j) => (
                                <div key={j} className="h-4 w-full bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
                            ))}
                        </div>
                    </div>
                ))}
            </aside>
        );
    }

    const filteredCategories = categories.filter(c => c.categoria.toLowerCase().includes(catQuery.toLowerCase()));
    const filteredBrands = brands.filter(b => b.marca.toLowerCase().includes(brandQuery.toLowerCase()));

    return (
        <aside className="w-full lg:w-64 flex-shrink-0 space-y-6 text-left">
            {(currentCategory || currentBrand || currentType) && (
                <button
                    onClick={onClearFilters}
                    className="w-full mb-4 py-2 px-4 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors text-sm font-bold shadow-sm flex items-center justify-center gap-2"
                >
                    <FaTags /> Borrar Filtros
                </button>
            )}

            {/* Categories */}
            <div className="bg-white dark:bg-darkmode-light p-5 rounded-xl shadow-sm border border-border dark:border-darkmode-border">
                <h3 className="font-bold text-lg mb-4 text-dark dark:text-white flex items-center gap-2">
                    <FaShapes className="text-primary w-4 h-4" />
                    Categorías
                </h3>

                {/* Search Categories */}
                <div className="relative mb-3">
                    <input
                        type="text"
                        placeholder="Buscar categoría..."
                        value={catQuery}
                        onChange={(e) => setCatQuery(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 text-xs bg-gray-50 dark:bg-darkmode-body border border-gray-200 dark:border-gray-700 rounded-lg focus:border-primary outline-none transition-colors"
                    />
                    <FaSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 w-3 h-3" />
                </div>

                <ul className="space-y-1 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                    <li>
                        <button
                            onClick={() => onFilterChange("categoria_id", null)}
                            className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${!currentCategory
                                ? "bg-primary/10 text-primary font-bold"
                                : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-darkmode-body hover:text-dark dark:hover:text-white"
                                }`}
                        >
                            Todas
                        </button>
                    </li>
                    {filteredCategories.map((cat) => (
                        <li key={cat.id}>
                            <button
                                onClick={() => onFilterChange("categoria_id", cat.id)}
                                className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${currentCategory === cat.id
                                    ? "bg-primary/10 text-primary font-bold"
                                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-darkmode-body hover:text-dark dark:hover:text-white"
                                    }`}
                            >
                                {cat.categoria}
                            </button>
                        </li>
                    ))}
                    {filteredCategories.length === 0 && (
                        <li className="text-xs text-center py-2 text-gray-400">No hay resultados</li>
                    )}
                </ul>
            </div>

            {/* Brands */}
            <div className="bg-white dark:bg-darkmode-light p-5 rounded-xl shadow-sm border border-border dark:border-darkmode-border">
                <h3 className="font-bold text-lg mb-4 text-dark dark:text-white flex items-center gap-2">
                    <FaTags className="text-primary w-4 h-4" />
                    Marcas
                </h3>

                {/* Search Brands */}
                <div className="relative mb-3">
                    <input
                        type="text"
                        placeholder="Buscar marca..."
                        value={brandQuery}
                        onChange={(e) => setBrandQuery(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 text-xs bg-gray-50 dark:bg-darkmode-body border border-gray-200 dark:border-gray-700 rounded-lg focus:border-primary outline-none transition-colors"
                    />
                    <FaSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 w-3 h-3" />
                </div>

                <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto custom-scrollbar">
                    <button
                        onClick={() => onFilterChange("marca_id", null)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${!currentBrand
                            ? "bg-primary text-white border-primary shadow-sm"
                            : "bg-transparent text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-primary hover:text-primary"
                            }`}
                    >
                        Todas
                    </button>
                    {filteredBrands.map((brand) => (
                        <button
                            key={brand.id}
                            onClick={() => onFilterChange("marca_id", brand.id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${currentBrand === brand.id
                                ? "bg-primary text-white border-primary shadow-sm"
                                : "bg-transparent text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-primary hover:text-primary"
                                }`}
                        >
                            {brand.marca}
                        </button>
                    ))}
                    {filteredBrands.length === 0 && (
                        <p className="text-xs text-center w-full py-2 text-gray-400">No hay resultados</p>
                    )}
                </div>
            </div>

           
        </aside>
    );
};

export default SidebarFilters;
