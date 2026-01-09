import React, { useEffect, useState } from "react";
import ProductGrid from "./ProductGrid";
import type { ApiResponse } from "../../interfaces/product";

const LiquidacionesContainer = () => {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/liquidaciones?page=${page}`);
        if (!res.ok) throw new Error("Failed to fetch");
        const jsonData: ApiResponse = await res.json();
        setData(jsonData);
      } catch (error) {
        console.error("Error fetching liquidaciones:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [page]);

  const handlePageChange = (newPage: number) => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setPage(newPage);
  };

  return (
    <section className="section py-8">
      <div className="container">
        <div className="mb-6">
          <h1 className="h3 font-bold text-dark dark:text-white">
            Liquidaciones
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Productos en oferta especial
          </p>
        </div>

        <ProductGrid products={data?.productos || []} isLoading={loading} />

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
      </div>
    </section>
  );
};

export default LiquidacionesContainer;
