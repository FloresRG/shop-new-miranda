import React, { useEffect, useState, useCallback } from "react";
import SidebarFilters from "./SidebarFilters";
import ProductGrid from "./ProductGrid";
import SearchBar from "./SearchBar";
import type { ApiResponse } from "../../interfaces/product";

type SortOption = "default" | "price-asc" | "price-desc" | "name-asc" | "name-desc";

const ShopContainer = () => {
    const [data, setData] = useState<ApiResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        page: 1,
        search: "",
        categoriaId: null as number | null,
        marcaId: null as number | null,
        tipoId: null as number | null
    });
    const [sort, setSort] = useState<SortOption>("default");
    const [initialized, setInitialized] = useState(false);

    // 1. Initialize from URL
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        setFilters({
            page: parseInt(params.get("page") || "1"),
            search: params.get("search") || "",
            categoriaId: params.get("categoria_id") ? parseInt(params.get("categoria_id")!) : null,
            marcaId: params.get("marca_id") ? parseInt(params.get("marca_id")!) : null,
            tipoId: params.get("tipo_id") ? parseInt(params.get("tipo_id")!) : null,
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
                if (filters.categoriaId) params.set("categoria_id", filters.categoriaId.toString());
                if (filters.marcaId) params.set("marca_id", filters.marcaId.toString());
                if (filters.tipoId) params.set("tipo_id", filters.tipoId.toString());

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
            categoriaId: null,
            marcaId: null,
            tipoId: null
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
        <section className="section">
            <div className="container">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar */}
                    <SidebarFilters
                        categories={data?.categorias || []}
                        brands={data?.marcas || []}
                        types={data?.tipos || []}
                        currentCategory={filters.categoriaId || undefined}
                        currentBrand={filters.marcaId || undefined}
                        currentType={filters.tipoId || undefined}
                        onFilterChange={handleFilterChange}
                        onClearFilters={handleClearFilters}
                        isLoading={loading && !data}
                    />

                    {/* Main Content */}
                    <main className="flex-1">
                        <div className="mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
                            <h1 className="h3">Nuestros Productos</h1>

                            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                                <SearchBar onSearch={handleSearch} />

                                <select
                                    className="select select-bordered w-full sm:w-auto dark:bg-darkmode-theme-light dark:text-white dark:border-gray-600"
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
                                    className="btn btn-outline-primary btn-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Anterior
                                </button>
                                <span className="px-4 py-2 text-sm font-medium flex items-center">
                                    Página {data.pagination.current_page} de {data.pagination.last_page}
                                </span>
                                <button
                                    onClick={() => handlePageChange(data.pagination.current_page + 1)}
                                    disabled={!data.pagination.next_page_url}
                                    className="btn btn-outline-primary btn-sm disabled:opacity-50 disabled:cursor-not-allowed"
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
