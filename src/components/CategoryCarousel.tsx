import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, EffectCoverflow } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/effect-coverflow";

import type { Category, Product } from "@/interfaces/product";

interface CategoryProduct {
  category: Category;
  product: Product;
}

interface CategoryCarouselProps {
  categoryProducts: CategoryProduct[];
}

const CategoryCarousel: React.FC<CategoryCarouselProps> = ({
  categoryProducts,
}) => {
  if (!categoryProducts || categoryProducts.length === 0) {
    return (
      <div className="container mx-auto py-16 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <span className="text-lg font-semibold text-gray-600 dark:text-gray-400">
            No hay categorías disponibles
          </span>
        </div>
      </div>
    );
  }

  const API_URL = import.meta.env.PUBLIC_API_URL;

  return (
    <section className="relative py-20 bg-gradient-to-b from-white to-gray-50 dark:from-darkmode-body dark:to-[#0a0a0a] overflow-hidden">
      
      {/* Efectos de fondo decorativos */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#F2275D]/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#451773]/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4">
        
        {/* Header de la sección */}
        <div className="text-center mb-12 space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-[#F2275D]/10 to-[#451773]/10 rounded-full border border-[#F2275D]/20">
            <svg className="w-4 h-4 text-[#F2275D]" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
            </svg>
            <span className="text-xs font-bold uppercase tracking-wider text-[#451773] dark:text-[#a855f7]">
              Explora por Categorías
            </span>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white">
            Encuentra lo que <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F2275D] to-[#451773]">necesitas</span>
          </h2>
          
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Navega por nuestras categorías más populares y descubre productos increíbles
          </p>
        </div>

        {/* Carousel */}
        <div className="relative">
          
          {/* Gradientes laterales para efecto fade */}
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-white dark:from-darkmode-body to-transparent z-10 pointer-events-none"></div>
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white dark:from-darkmode-body to-transparent z-10 pointer-events-none"></div>

          <Swiper
            modules={[Autoplay, Navigation]}
            spaceBetween={24}
            slidesPerView={6}
            autoplay={{
              delay: 3000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            navigation={{
              prevEl: '.swiper-button-prev-custom',
              nextEl: '.swiper-button-next-custom',
            }}
            loop={true}
            speed={800}
            breakpoints={{
              320: { slidesPerView: 1.5, spaceBetween: 16 },
              480: { slidesPerView: 2.5, spaceBetween: 16 },
              640: { slidesPerView: 3, spaceBetween: 20 },
              768: { slidesPerView: 4, spaceBetween: 20 },
              1024: { slidesPerView: 5, spaceBetween: 24 },
              1280: { slidesPerView: 6, spaceBetween: 24 },
            }}
            className="!pb-4"
          >
            {categoryProducts.map(({ category, product }) => {
              const imageUrl = product.fotos?.[0]?.foto
                ? `${API_URL}/storage/${product.fotos[0].foto}`
                : "https://placehold.co/300x200?text=No+Image";

              return (
                <SwiperSlide key={`${category.id}-${product.id}`}>
                  <a 
                    href={`/tienda?categoria=${category.id}`}
                    className="group block"
                  >
                    <div className="relative bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 dark:border-gray-800 hover:border-[#F2275D]/30 dark:hover:border-[#F2275D]/50 hover:-translate-y-2">
                      
                      {/* Glow effect on hover */}
                      <div className="absolute inset-0 bg-gradient-to-br from-[#F2275D]/0 to-[#451773]/0 group-hover:from-[#F2275D]/10 group-hover:to-[#451773]/10 transition-all duration-500"></div>
                      
                      {/* Imagen del producto */}
                      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900">
                        <img
                          src={imageUrl}
                          alt={product.nombre}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                          loading="lazy"
                        />
                        
                        {/* Overlay gradiente */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        
                        {/* Badge de categoría */}
                        <div className="absolute top-3 right-3 px-2.5 py-1 bg-white/90 dark:bg-black/70 backdrop-blur-md rounded-full opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-500">
                          <span className="text-[10px] font-bold text-[#451773] dark:text-[#a855f7] uppercase tracking-wide">
                            Ver más
                          </span>
                        </div>
                      </div>

                      {/* Contenido */}
                      <div className="relative p-4 space-y-2">
                        
                        {/* Nombre de categoría */}
                        <div className="flex items-center gap-2">
                          <div className="w-1 h-1 rounded-full bg-[#F2275D] animate-pulse"></div>
                          <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate group-hover:text-[#F2275D] transition-colors">
                            {category.categoria}
                          </h4>
                        </div>

                        {/* Nombre de producto ejemplo */}
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate leading-relaxed">
                          {product.nombre}
                        </p>

                        {/* Precio (si existe) */}
                        {product.precio && (
                          <div className="flex items-center gap-1.5 pt-1">
                            <span className="text-xs text-gray-400 dark:text-gray-500">Desde</span>
                            <span className="text-sm font-bold text-[#451773] dark:text-[#a855f7]">
                              ${parseFloat(product.precio).toFixed(2)}
                            </span>
                          </div>
                        )}

                        {/* Indicador de acción */}
                        <div className="flex items-center gap-1 text-[#F2275D] opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-500 pt-1">
                          <span className="text-xs font-semibold">Explorar</span>
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>

                      {/* Shine effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out pointer-events-none"></div>
                    </div>
                  </a>
                </SwiperSlide>
              );
            })}
          </Swiper>

          {/* Botones de navegación personalizados */}
          <button className="swiper-button-prev-custom absolute left-0 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white dark:bg-[#1a1a1a] border-2 border-gray-200 dark:border-gray-700 rounded-full shadow-xl hover:shadow-2xl hover:border-[#F2275D] dark:hover:border-[#F2275D] transition-all duration-300 flex items-center justify-center group hover:scale-110 -translate-x-6 hover:translate-x-0">
            <svg className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-[#F2275D] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button className="swiper-button-next-custom absolute right-0 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white dark:bg-[#1a1a1a] border-2 border-gray-200 dark:border-gray-700 rounded-full shadow-xl hover:shadow-2xl hover:border-[#F2275D] dark:hover:border-[#F2275D] transition-all duration-300 flex items-center justify-center group hover:scale-110 translate-x-6 hover:translate-x-0">
            <svg className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-[#F2275D] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* CTA adicional */}
        <div className="text-center mt-10">
          <a 
            href="/tienda" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#F2275D] to-[#451773] text-white rounded-full font-semibold shadow-lg hover:shadow-xl hover:shadow-[#F2275D]/30 transition-all duration-300 hover:scale-105 group"
          >
            <span>Ver todas las categorías</span>
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
};

export default CategoryCarousel;