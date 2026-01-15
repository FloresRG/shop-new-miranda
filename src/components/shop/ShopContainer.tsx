import React, { useEffect, useState, useCallback } from "react";
import SidebarFilters from "./SidebarFilters";
import ProductGrid from "./ProductGrid";
import SearchBar from "./SearchBar";
import type { ApiResponse } from "../../interfaces/product";
import { FaFilter } from "react-icons/fa";

type SortOption = "default" | "price-asc" | "price-desc" | "name-asc" | "name-desc";

const ShopContainer = () => {
    const [data, setData] = useState<ApiResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        page: 1,
        search: "",
        categoria_id: null as number | null,
        marca_id: null as number | null,
        tipo_id: null as number | null
    });
    const [sort, setSort] = useState<SortOption>("default");
    const [initialized, setInitialized] = useState(false);
    const [showMobileFilters, setShowMobileFilters] = useState(false);

    // 1. Initialize from URL
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        setFilters({
            page: parseInt(params.get("page") || "1"),
            search: params.get("search") || "",
            categoria_id: params.get("categoria_id") ? parseInt(params.get("categoria_id")!) : null,
            marca_id: params.get("marca_id") ? parseInt(params.get("marca_id")!) : null,
            tipo_id: params.get("tipo_id") ? parseInt(params.get("tipo_id")!) : null,
        });
        setInitialized(true);
    }, []);

    // 2. Fetch Data
    useEffect(() => {
        if (!initialized) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams();
                params.set("page", filters.page.toString());
                if (filters.search) params.set("search", filters.search);
                if (filters.categoria_id) params.set("categoria_id", filters.categoria_id.toString());
                if (filters.marca_id) params.set("marca_id", filters.marca_id.toString());
                if (filters.tipo_id) params.set("tipo_id", filters.tipo_id.toString());

                const newUrl = `${window.location.pathname}?${params.toString()}`;
                window.history.replaceState(null, "", newUrl);

                const res = await fetch(`/api/productos?${params.toString()}`);
                if (!res.ok) throw new Error("Failed to fetch");
                const jsonData: ApiResponse = await res.json();

                setData(jsonData);
            } catch (error) {
                console.error("Error fetching products:", error);
            } finally {
                setLoading(false);
            }
        };

        const timer = setTimeout(fetchData, filters.search ? 300 : 0);
        return () => clearTimeout(timer);

    }, [filters, initialized]);

    const handleFilterChange = useCallback((key: string, value: number | null) => {
        setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
    }, []);

    const handleSearch = useCallback((query: string) => {
        setFilters(prev => ({ ...prev, search: query, page: 1 }));
    }, []);

    const handlePageChange = (newPage: number) => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setFilters(prev => ({ ...prev, page: newPage }));
    };

    const handleClearFilters = useCallback(() => {
        setFilters({
            page: 1,
            search: "",
            categoria_id: null,
            marca_id: null,
            tipo_id: null
        });
    }, []);

    // Sorting Logic (Client-Side for now as API support is unverified)
    const getSortedProducts = () => {
        if (!data?.productos) return [];
        const products = [...data.productos];

        switch (sort) {
            case "price-asc":
                return products.sort((a, b) => parseFloat(a.precio) - parseFloat(b.precio));
            case "price-desc":
                return products.sort((a, b) => parseFloat(b.precio) - parseFloat(a.precio));
            case "name-asc":
                return products.sort((a, b) => a.nombre.localeCompare(b.nombre));
            case "name-desc":
                return products.sort((a, b) => b.nombre.localeCompare(a.nombre));
            default:
                return products;
        }
    };

    const displayedProducts = getSortedProducts();

    return (
        <section className="section py-8">
            <div className="container">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar Filters - Hidden on mobile unless toggled */}
                    <div className={`lg:w-64 flex-shrink-0 transition-all duration-300 ${showMobileFilters ? "block" : "hidden lg:block"}`}>
                        <SidebarFilters
                            categories={data?.categorias || []}
                            brands={data?.marcas || []}
                            types={data?.tipos || []}
                            currentCategory={filters.categoria_id || undefined}
                            currentBrand={filters.marca_id || undefined}
                            currentType={filters.tipo_id || undefined}
                            onFilterChange={handleFilterChange}
                            onClearFilters={handleClearFilters}
                            isLoading={loading && !data}
                        />
                    </div>

                    {/* Main Content */}
                    <main className="flex-1">
                        <div className="mb-6 space-y-4">
                            {/* Mobile Header & Controls */}
                            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                                <h1 className="h3 font-bold text-dark dark:text-white self-start md:self-auto hidden md:block">
                                    Nuestros Productos
                                </h1>

                                {/* Controls: Search, Filter Toggle, Sort */}
                                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                                    <div className="flex-1 sm:w-80">
                                        <SearchBar onSearch={handleSearch} />
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setShowMobileFilters(!showMobileFilters)}
                                            className="lg:hidden px-4 py-2 rounded-lg bg-gray-100 dark:bg-darkmode-light border border-gray-200 dark:border-darkmode-border text-dark dark:text-white font-bold flex items-center justify-center gap-2 hover:bg-primary hover:text-white transition-colors"
                                        >
                                            <FaFilter />
                                            {showMobileFilters ? "Ocultar" : "Filtrar"}
                                        </button>

                                        <select
                                            className="select select-bordered flex-1 sm:flex-none bg-white dark:bg-darkmode-light dark:text-white dark:border-darkmode-border focus:border-primary focus:ring-primary rounded-lg"
                                            value={sort}
                                            onChange={(e) => setSort(e.target.value as SortOption)}
                                        >
                                            <option value="default">Relevancia</option>
                                            <option value="price-asc">Precio: Menor a Mayor</option>
                                            <option value="price-desc">Precio: Mayor a Menor</option>
                                            <option value="name-asc">Nombre: A-Z</option>
                                            <option value="name-desc">Nombre: Z-A</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <ProductGrid
                            products={displayedProducts}
                            isLoading={loading}
                        />

                        {/* Pagination */}
                        {!loading && data && data.pagination.last_page > 1 && (
                            <div className="flex justify-center mt-8 gap-2">
                                <button
                                    onClick={() => handlePageChange(data.pagination.current_page - 1)}
                                    disabled={!data.pagination.prev_page_url}
                                    className="px-4 py-2 rounded-lg border border-gray-200 dark:border-darkmode-border bg-white dark:bg-darkmode-light text-dark dark:text-white disabled:opacity-50 disabled:cursor-not-allowed hover:border-primary hover:text-primary transition-colors"
                                >
                                    Anterior
                                </button>
                                <span className="px-4 py-2 text-sm font-bold flex items-center text-dark dark:text-white">
                                    {data.pagination.current_page} / {data.pagination.last_page}
                                </span>
                                <button
                                    onClick={() => handlePageChange(data.pagination.current_page + 1)}
                                    disabled={!data.pagination.next_page_url}
                                    className="px-4 py-2 rounded-lg border border-gray-200 dark:border-darkmode-border bg-white dark:bg-darkmode-light text-dark dark:text-white disabled:opacity-50 disabled:cursor-not-allowed hover:border-primary hover:text-primary transition-colors"
                                >
                                    Siguiente
                                </button>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </section>
    );
};

export default ShopContainer;
