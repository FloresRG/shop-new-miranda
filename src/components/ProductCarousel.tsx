import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay, EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-fade";
import type { Producto } from "@/types/api.d.ts";
import { useFetchProductos } from "@/hooks/useFetchProductos";
import { getImageUrl } from "@/lib/apiProductos";

const ProductCarousel: React.FC = () => {
  const { productos, loading, error } = useFetchProductos();

  // --- Estado de Carga Profesional (Skeleton) ---
  if (loading) {
    return (
      <div className="container mx-auto py-16 animate-pulse">
        <div className="bg-light dark:bg-darkmode-light rounded-3xl h-[500px] w-full shadow-inner"></div>
      </div>
    );
  }

  // --- Estado de Error Elegante ---
  if (error) {
    return (
      <div className="container mx-auto py-16 text-center">
        <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-2xl p-12 inline-block">
          <h3 className="text-[#F20505] text-xl font-bold mb-2">
            Error de Conexión
          </h3>
          <p className="text-text-light">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <section className="bg-gradient min-h-screen flex items-center justify-center py-16">
      <div className="max-w-7xl mx-auto relative group w-full px-4 lg:px-8">
        {/* Botones de navegación personalizados */}
        <button className="swiper-button-prev !hidden lg:!flex !-left-16 !top-1/2 !w-12 !h-12 !bg-white dark:!bg-darkmode-light !text-[#451773] dark:!text-[#17BFBF] !rounded-full !shadow-xl hover:!bg-[#F2275D] hover:!text-white transition-all duration-300 border border-border/50 after:!text-lg"></button>

        <button className="swiper-button-next !hidden lg:!flex !-right-16 !top-1/2 !w-12 !h-12 !bg-white dark:!bg-darkmode-light !text-[#451773] dark:!text-[#17BFBF] !rounded-full !shadow-xl hover:!bg-[#F2275D] hover:!text-white transition-all duration-300 border border-border/50 after:!text-lg"></button>

        <Swiper
          modules={[Navigation, Pagination, Autoplay, EffectFade]}
          effect="fade" // Cambio suave de imagen
          spaceBetween={0}
          slidesPerView={1}
          navigation={{
            nextEl: ".swiper-button-next",
            prevEl: ".swiper-button-prev",
          }}
          pagination={{
            el: ".custom-pagination",
            clickable: true,
          }}
          autoplay={{ delay: 7000, disableOnInteraction: false }}
          loop={true}
          className="rounded-3xl shadow-2xl overflow-hidden border border-border/30 bg-body dark:bg-darkmode-body"
        >
          {productos.map((producto) => (
            <SwiperSlide key={producto.id}>
              <div className="grid lg:grid-cols-12 gap-0 min-h-[500px]">
                {/* Contenido Izquierdo: Información */}
                <div className="lg:col-span-7 p-8 lg:p-16 flex flex-col justify-center order-2 lg:order-1 bg-white dark:bg-darkmode-body">
                  <div className="space-y-6">
                    <div>
                      <span className="text-[#17BFBF] font-bold text-sm tracking-widest uppercase mb-2 block">
                        Colección Premium
                      </span>
                      <h3 className="text-3xl lg:text-5xl font-bold text-[#451773] dark:text-white leading-tight">
                        {producto.nombre}
                      </h3>
                      <p className="mt-4 text-text-light dark:text-darkmode-text text-lg leading-relaxed max-w-lg">
                        {producto.descripcion}
                      </p>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-4xl font-extrabold text-[#F2275D]">
                        Bs {producto.precio}
                      </div>

                      {producto.inventario && (
                        <div
                          className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider ${(() => {
                              const inv = producto.inventario;
                              const item = Array.isArray(inv)
                                ? inv.find((i: any) => i.id_sucursal == 1 || i.sucursal_id == 1)
                                : ((inv.id_sucursal == 1 || inv.sucursal_id == 1) ? inv : null);

                              if (item && item.cantidad > 10) return "bg-[#17BFBF]/10 text-[#17BFBF] border border-[#17BFBF]/20";
                              if (item && item.cantidad > 0) return "bg-yellow-400/10 text-yellow-600 border border-yellow-400/20";
                              return "bg-red-500/10 text-red-600 border border-red-500/20";
                            })()
                            }`}
                        >
                          Disponibles: {(() => {
                            const inv = producto.inventario;
                            const item = Array.isArray(inv)
                              ? inv.find((i: any) => i.id_sucursal == 1 || i.sucursal_id == 1)
                              : ((inv.id_sucursal == 1 || inv.sucursal_id == 1) ? inv : null);
                            return item ? item.cantidad : 0;
                          })()}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 pt-6">
                      <button className="bg-gradient-to-r from-[#F2275D] to-[#451773] text-white px-10 py-4 rounded-xl font-bold text-lg shadow-lg shadow-[#F2275D]/20 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 active:scale-95">
                        Añadir al Carrito
                      </button>
                      <button className="border-2 border-border dark:border-darkmode-border text-[#451773] dark:text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-light dark:hover:bg-darkmode-light transition-all duration-300">
                        Detalles Técnicos
                      </button>
                    </div>
                  </div>
                </div>

                {/* Lado Derecho: Imagen con máscara de gradiente */}
                <div className="lg:col-span-5 relative h-64 lg:h-auto order-1 lg:order-2">
                  {producto.fotos.length > 0 ? (
                    <div className="h-full w-full relative">
                      <img
                        src={getImageUrl(producto.fotos[0].foto)}
                        alt={producto.nombre}
                        className="w-full h-full object-cover"
                      />
                      {/* Overlay decorativo */}
                      <div className="absolute inset-0 bg-gradient-to-r from-white dark:from-darkmode-body via-transparent to-transparent lg:block hidden"></div>

                      <div className="absolute top-6 right-6 bg-[#451773] text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg uppercase tracking-tighter">
                        Exclusivo
                      </div>
                    </div>
                  ) : (
                    <div className="h-full w-full bg-light dark:bg-darkmode-light flex items-center justify-center">
                      <span className="text-border">Sin Imagen</span>
                    </div>
                  )}
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Paginación Refinada */}
        <div className="custom-pagination flex justify-center mt-10 gap-3"></div>
      </div>

      {/* Estilos específicos para Swiper que no se pueden hacer fácilmente con @apply */}
      <style>{`
        .custom-pagination .swiper-pagination-bullet {
          width: 12px;
          height: 12px;
          background: #eaeaea;
          opacity: 1;
          transition: all 0.3s ease;
          border-radius: 50%;
        }
        .custom-pagination .swiper-pagination-bullet-active {
          width: 35px;
          background: #F2275D !important;
          border-radius: 10px;
        }
        .dark .custom-pagination .swiper-pagination-bullet {
          background: #3E3E3E;
        }
        .dark .custom-pagination .swiper-pagination-bullet-active {
          background: #17BFBF !important;
        }
      `}</style>
    </section>
  );
};

export default ProductCarousel;
