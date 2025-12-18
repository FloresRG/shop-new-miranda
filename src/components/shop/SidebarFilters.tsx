import React from "react";
import { FaShapes, FaTags, FaLayerGroup } from "react-icons/fa";
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
    // Skeleton Loader for Sidebar
    if (isLoading) {
        return (
            <aside className="w-full lg:w-64 flex-shrink-0 space-y-8">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white dark:bg-darkmode-theme-light p-6 rounded-lg shadow-sm border border-border dark:border-darkmode-border">
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

    return (
        <aside className="w-full lg:w-64 flex-shrink-0 space-y-8 text-left">
            {(currentCategory || currentBrand || currentType) && (
                <button
                    onClick={onClearFilters}
                    className="w-full mb-4 py-2 px-4 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors text-sm font-bold shadow-sm flex items-center justify-center gap-2"
                >
                    <FaTags /> Borrar Filtros
                </button>
            )}
            {/* Categories */}
            <div className="bg-white dark:bg-darkmode-theme-light p-6 rounded-lg shadow-sm border border-border dark:border-darkmode-border">
                <h3 className="font-bold text-lg mb-4 text-dark dark:text-darkmode-text flex items-center gap-2">
                    <FaShapes className="text-primary w-5 h-5" />
                    Categorías
                </h3>
                <ul className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                    <li>
                        <button
                            onClick={() => onFilterChange("categoria_id", null)}
                            className={`block w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${!currentCategory
                                ? "bg-primary/10 text-primary font-medium"
                                : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-darkmode-theme-dark"
                                }`}
                        >
                            Todas
                        </button>
                    </li>
                    {categories.map((cat) => (
                        <li key={cat.id}>
                            <button
                                onClick={() => onFilterChange("categoria_id", cat.id)}
                                className={`block w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${currentCategory === cat.id
                                    ? "bg-primary/10 text-primary font-medium"
                                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-darkmode-theme-dark"
                                    }`}
                            >
                                {cat.categoria}
                            </button>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Brands */}
            <div className="bg-white dark:bg-darkmode-theme-light p-6 rounded-lg shadow-sm border border-border dark:border-darkmode-border">
                <h3 className="font-bold text-lg mb-4 text-dark dark:text-darkmode-text flex items-center gap-2">
                    <FaTags className="text-primary w-5 h-5" />
                    Marcas
                </h3>
                <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                    <button
                        onClick={() => onFilterChange("marca_id", null)}
                        className={`px-3 py-1 rounded-full text-xs transition-colors border ${!currentBrand
                            ? "bg-primary text-white border-primary"
                            : "bg-transparent text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-primary"
                            }`}
                    >
                        Todas
                    </button>
                    {brands.map((brand) => (
                        <button
                            key={brand.id}
                            onClick={() => onFilterChange("marca_id", brand.id)}
                            className={`px-3 py-1 rounded-full text-xs transition-colors border ${currentBrand === brand.id
                                ? "bg-primary text-white border-primary"
                                : "bg-transparent text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-primary"
                                }`}
                        >
                            {brand.marca}
                        </button>
                    ))}
                </div>
            </div>

            {/* Types */}
            <div className="bg-white dark:bg-darkmode-theme-light p-6 rounded-lg shadow-sm border border-border dark:border-darkmode-border">
                <h3 className="font-bold text-lg mb-4 text-dark dark:text-darkmode-text flex items-center gap-2">
                    <FaLayerGroup className="text-primary w-5 h-5" />
                    Tipos
                </h3>
                <ul className="space-y-2">
                    <li>
                        <button
                            onClick={() => onFilterChange("tipo_id", null)}
                            className={`flex w-full text-left items-center gap-2 text-sm ${!currentType
                                ? "text-primary font-medium"
                                : "text-gray-600 dark:text-gray-300"
                                }`}
                        >
                            <div
                                className={`w-4 h-4 rounded-full border flex items-center justify-center ${!currentType ? "border-primary" : "border-gray-400"
                                    }`}
                            >
                                {!currentType && (
                                    <div className="w-2 h-2 rounded-full bg-primary" />
                                )}
                            </div>
                            Todos
                        </button>
                    </li>
                    {types.map((t) => (
                        <li key={t.id}>
                            <button
                                onClick={() => onFilterChange("tipo_id", t.id)}
                                className={`flex w-full text-left items-center gap-2 text-sm ${currentType === t.id
                                    ? "text-primary font-medium"
                                    : "text-gray-600 dark:text-gray-300"
                                    }`}
                            >
                                <div
                                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${currentType === t.id ? "border-primary" : "border-gray-400"
                                        }`}
                                >
                                    {currentType === t.id && (
                                        <div className="w-2 h-2 rounded-full bg-primary" />
                                    )}
                                </div>
                                {t.tipo}
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        </aside>
    );
};

export default SidebarFilters;
