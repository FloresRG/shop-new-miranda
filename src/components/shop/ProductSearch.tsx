import React, { useState, useEffect, useRef } from "react";
import { IoSearch } from "react-icons/io5";
import { getProducts } from "../../lib/products";
import type { Product } from "../../interfaces/product";

export default function ProductSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Debounce logic
  useEffect(() => {
    const timeOutId = setTimeout(async () => {
      if (query.length > 2) {
        setLoading(true);
        try {
          // Llama a la API buscando por término
          const data = await getProducts({ search: query, page: 1 });
          setResults(data.productos.slice(0, 5)); // Top 5 resultados
          setIsOpen(true);
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
        }
      } else {
        setResults([]);
        setIsOpen(false);
      }
    }, 300); // 300ms delay

    return () => clearTimeout(timeOutId);
  }, [query]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  return (
    <div ref={wrapperRef} className="relative w-full max-w-xs lg:max-w-md z-50">
      <div className="relative">
        <input
          type="text"
          placeholder="Buscar productos..."
          className="w-full bg-gray-100 dark:bg-darkmode-theme-light border border-transparent focus:border-primary focus:bg-white dark:focus:bg-darkmode-body rounded-full py-2 pl-4 pr-10 outline-none transition-all text-sm"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length > 2 && setIsOpen(true)}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
          {loading ? (
            <span className="block w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
          ) : (
            <IoSearch />
          )}
        </div>
      </div>

      {/* Sugerencias Dropdown */}
      {isOpen && results.length > 0 && (
        <div className="absolute top-full mt-2 w-full bg-white dark:bg-darkmode-light rounded-xl shadow-2xl border border-border dark:border-gray-700 overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
          <ul>
            {results.map((product) => (
              <li key={product.id}>
                <a
                  href={`/tienda/${product.id}`}
                  data-astro-prefetch
                  className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-darkmode-theme-light transition-colors border-b border-gray-100 dark:border-gray-800 last:border-0 cursor-pointer block"
                  onClick={() => {
                    setIsOpen(false);
                    // Force navigation just in case
                    window.location.href = `/tienda/${product.id}`;
                  }}
                >
                  <img
                    src={
                      product.fotos[0]?.foto
                        ? `https://importadoramiranda.com/storage/${product.fotos[0].foto}`
                        : "https://placehold.co/50"
                    }
                    alt={product.nombre}
                    className="w-10 h-10 object-cover rounded bg-gray-200"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-dark dark:text-white truncate">
                      {product.nombre}
                    </p>
                    <p className="text-xs text-primary">
                      {product.marca.marca}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-primary">
                    {parseFloat(product.precio) > 0
                      ? `Bs ${parseFloat(product.precio).toLocaleString("es-BO", { minimumFractionDigits: 2 })}`
                      : "Consultar"}
                  </span>
                </a>
              </li>
            ))}
          </ul>
          <a
            href={`/tienda?search=${query}`}
            className="block text-center text-xs py-2 bg-gray-50 dark:bg-darkmode-theme-light text-primary hover:underline font-bold"
          >
            Ver todos los resultados
          </a>
        </div>
      )}
    </div>
  );
}
