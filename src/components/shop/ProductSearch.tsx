import React, { useState, useEffect, useRef } from "react";
import { IoSearch } from "react-icons/io5";
import { apiProductos } from "../../lib/apiProductos";
import type { Product } from "../../interfaces/product";

export default function ProductSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isWholesaleMode = typeof window !== 'undefined' && window.location.pathname.startsWith('/mayorista');

  // Handle View Transitions - reinitialize on page change
  useEffect(() => {
    const handlePageLoad = () => {
      // Reset state on page navigation
      setQuery("");
      setResults([]);
      setIsOpen(false);
      setLoading(false);
    };

    // Listen for Astro view transition events
    document.addEventListener("astro:page-load", handlePageLoad);

    return () => {
      document.removeEventListener("astro:page-load", handlePageLoad);
    };
  }, []);

  // Debounce logic
  useEffect(() => {
    const timeOutId = setTimeout(async () => {
      if (query.length > 2) {
        setLoading(true);
        try {
          // Llama a la API buscando por término, incluyendo precios si es mayorista
          const data = await apiProductos.fetchProductos({
            search: query,
            page: 1,
            includePrices: isWholesaleMode
          });
          setResults(data.productos as any as Product[]); // Cast para manejar diferencia de tipos en precio
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
  }, [query, isWholesaleMode]);

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

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div ref={wrapperRef} className="relative w-full max-w-xs lg:max-w-md z-50">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          placeholder={isWholesaleMode ? "Buscar en catálogo VIP..." : "Buscar productos..."}
          className={`w-full border border-transparent rounded-full py-2 pl-4 pr-10 outline-none transition-all text-sm ${isWholesaleMode
            ? 'bg-[#1a1a1a] text-white focus:border-[#D4AF37] placeholder-gray-500'
            : 'bg-gray-100 dark:bg-darkmode-theme-light focus:border-primary focus:bg-white dark:focus:bg-darkmode-body text-dark dark:text-white dark:placeholder-gray-400'
            }`}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length > 2 && setIsOpen(true)}
          onKeyDown={handleKeyDown}
        />
        <div className={`absolute right-3 top-1/2 -translate-y-1/2 ${isWholesaleMode ? 'text-[#D4AF37]' : 'text-gray-400'}`}>
          {loading ? (
            <span className={`block w-4 h-4 border-2 border-t-transparent rounded-full animate-spin ${isWholesaleMode ? 'border-[#D4AF37]' : 'border-primary'}`}></span>
          ) : (
            <IoSearch />
          )}
        </div>
      </div>

      {/* Sugerencias Dropdown */}
      {isOpen && results.length > 0 && (
        <div className={`absolute top-full mt-2 w-full rounded-xl shadow-2xl border overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2 duration-200 ${isWholesaleMode
          ? 'bg-[#111] border-[#D4AF37]/20'
          : 'bg-white dark:bg-darkmode-light border-border dark:border-gray-700'
          }`}>
          <ul>
            {results.map((product) => {
              const productUrl = isWholesaleMode ? `/mayorista/tienda/${product.id}` : `/tienda/${product.id}`;
              const price = isWholesaleMode ? (product.precio_docena || product.precio_unidad || 0) : parseFloat(product.precio);

              return (
                <li key={product.id}>
                  <a
                    href={productUrl}
                    data-astro-prefetch
                    className={`flex items-center gap-3 p-3 transition-colors border-b last:border-0 cursor-pointer block ${isWholesaleMode
                      ? 'hover:bg-[#1a1a1a] border-[#D4AF37]/10'
                      : 'hover:bg-gray-50 dark:hover:bg-darkmode-theme-light border-gray-100 dark:border-gray-800'
                      }`}
                    onClick={() => {
                      setIsOpen(false);
                      window.location.href = productUrl;
                    }}
                  >
                    <img
                      src={
                        product.fotos[0]?.foto
                          ? (product.fotos[0].foto.startsWith('http') ? product.fotos[0].foto : `${import.meta.env.PUBLIC_API_URL}/storage/${product.fotos[0].foto}`)
                          : "https://placehold.co/50"
                      }
                      alt={product.nombre}
                      className="w-10 h-10 object-cover rounded bg-gray-200"
                    />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-bold truncate ${isWholesaleMode ? 'text-white' : 'text-dark dark:text-white'}`}>
                        {product.nombre}
                      </p>
                      <p className={`text-xs font-bold ${isWholesaleMode ? 'text-[#D4AF37]' : 'text-primary'}`}>
                        {product.marca.marca}
                      </p>
                    </div>
                    <span className={`text-sm font-bold ${isWholesaleMode ? 'text-[#D4AF37]' : 'text-primary'}`}>
                      {price > 0
                        ? `Bs ${price.toLocaleString("es-BO", { minimumFractionDigits: 2 })}`
                        : "Consultar"}
                    </span>
                  </a>
                </li>
              );
            })}
          </ul>
          <a
            href={isWholesaleMode ? `/mayorista/tienda?search=${query}` : `/tienda?search=${query}`}
            className={`block text-center text-xs py-2 font-bold hover:underline ${isWholesaleMode
              ? 'bg-[#0a0a0a] text-[#D4AF37]'
              : 'bg-gray-50 dark:bg-darkmode-theme-light text-primary'
              }`}
          >
            Ver todos los resultados
          </a>
        </div>
      )}
    </div>
  );
}
