import React, { useEffect, useState } from "react";
import type { Category, Product, ApiResponse } from "../../interfaces/product";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

// Simplified type for what we need
interface CategoryWithProduct {
  category: Category;
  product: Product;
}

const CategoryCarouselHelper = () => {
  const [items, setItems] = useState<CategoryWithProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const isWholesale = typeof window !== 'undefined' &&
    localStorage.getItem('wholesale_authenticated') === 'true' &&
    window.location.pathname.startsWith('/mayorista');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const queryParams = isWholesale ? '&includePrices=true' : '';
        // 1. Fetch categories
        const resCat = await fetch(`/api/productos?page=1${queryParams}`);
        if (!resCat.ok) return;
        const dataCat: ApiResponse = await resCat.json();
        const topCategories = dataCat.categorias.slice(0, 10);

        // 2. Fetch one product for each category (Parallel)
        const itemPromises = topCategories.map(async (cat) => {
          try {
            const resProd = await fetch(
              `/api/productos?categoria_id=${cat.id}&page=1${queryParams}`,
            );
            if (resProd.ok) {
              const dataProd: ApiResponse = await resProd.json();
              if (dataProd.productos.length > 0) {
                return { category: cat, product: dataProd.productos[0] };
              }
            }
          } catch (e) {
            console.error(e);
          }
          return null;
        });

        const results = await Promise.all(itemPromises);
        setItems(results.filter((i): i is CategoryWithProduct => i !== null));
      } catch (error) {
        console.error("Failed to fetch category carousel data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isWholesale]);

  if (loading) {
    return (
      <section className="section pt-0">
        <div className="container">
          <div className="mb-8 flex justify-between items-center">
            <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
          </div>
          <div className="flex gap-4 overflow-hidden">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="min-w-[280px] h-[350px] bg-gray-200 dark:bg-gray-700 animate-pulse rounded-2xl"
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (items.length === 0) return null;

  return (
    <section className="section pt-0 relative z-20">
      <div className="container">
        <div className="mb-10 flex flex-col sm:flex-row justify-between items-end gap-4">
          <div>
            <span className={`${isWholesale ? 'text-[#D4AF37]' : 'text-secondary dark:text-accent'} font-bold uppercase tracking-wider text-sm`}>
              Explora por Categoría {isWholesale && "Premium"}
            </span>
            <h2 className={`h2 mt-2 ${isWholesale ? 'text-white' : ''}`}>Encuentra tu Estilo</h2>
          </div>
          <a
            href={isWholesale ? "/mayorista/tienda" : "/tienda"}
            className={`${isWholesale ? 'text-[#D4AF37]' : 'text-primary'} font-bold hover:underline flex items-center gap-2`}
          >
            Ver Catálogo Completo
          </a>
        </div>

        <Swiper
          modules={[Autoplay, Pagination]}
          spaceBetween={24}
          slidesPerView={1}
          breakpoints={{
            640: { slidesPerView: 2 },
            768: { slidesPerView: 3 },
            1024: { slidesPerView: 4 },
          }}
          autoplay={{ delay: 3000, disableOnInteraction: false }}
          pagination={{ clickable: true, dynamicBullets: true }}
          className="pb-12"
        >
          {items.map(({ category, product }) => {
            const priceUnidad = product.precio_unidad || parseFloat(product.precio) || 0;
            const priceDocena = product.precio_docena || 0;

            return (
              <SwiperSlide key={category.id}>
                <a
                  href={`${isWholesale ? '/mayorista/tienda' : '/tienda'}?categoria_id=${category.id}`}
                  className={`group relative block h-[420px] rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border ${isWholesale ? 'border-[#D4AF37]/20 bg-[#1a1a1a]' : 'border-transparent'}`}
                >
                  {/* Imagen de fondo */}
                  <img
                    src={
                      product.fotos[0]?.foto
                        ? `${import.meta.env.PUBLIC_API_URL}/storage/${product.fotos[0].foto}`
                        : "https://placehold.co/400x600?text=Category"
                    }
                    alt={category.categoria}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />

                  {/* Overlay Gradiente */}
                  <div className={`absolute inset-0 bg-gradient-to-t ${isWholesale ? 'from-[#0c0c0c] via-[#0c0c0c]/40' : 'from-black/90 via-black/40'} to-transparent opacity-80 group-hover:opacity-70 transition-opacity`}></div>

                  {/* Contenido */}
                  <div className="absolute inset-0 p-6 flex flex-col justify-end text-white">
                    <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                      <span className={`inline-block px-3 py-1 ${isWholesale ? 'bg-[#D4AF37] text-black' : 'bg-primary/90 text-white'} text-xs font-bold rounded-full mb-3 shadow-lg backdrop-blur-sm uppercase tracking-tighter`}>
                        {isWholesale ? 'Catálogo VIP' : 'Tendencia'}
                      </span>
                      <h3 className="text-2xl font-bold mb-2 leading-tight">
                        {category.categoria}
                      </h3>

                      {isWholesale ? (
                        <div className="space-y-1 mb-4">
                          <p className="text-[#D4AF37] text-xs font-black uppercase">Desde Bs {priceDocena > 0 ? priceDocena.toFixed(2) : priceUnidad.toFixed(2)}</p>
                          <p className="text-gray-400 text-[10px] font-bold">PRECIO MAYORISTA</p>
                        </div>
                      ) : (
                        <p className="text-gray-300 text-sm line-clamp-2 mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                          {product.nombre}
                        </p>
                      )}

                      <div className={`flex items-center gap-2 text-sm font-bold ${isWholesale ? 'text-[#D4AF37]' : 'text-accent'}`}>
                        <span>Ver Colección</span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 transform group-hover:translate-x-1 transition-transform"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 8l4 4m0 0l-4 4m4-4H3"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </a>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>
    </section>
  );
};

export default CategoryCarouselHelper;
