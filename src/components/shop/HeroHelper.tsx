import React, { useEffect, useState } from "react";
import { FaArrowRight } from "react-icons/fa";
import type { Product, ApiResponse } from "../../interfaces/product";

interface HeroHelperProps {
  bannerImages?: {
    mobile: string;
    pc: string;
  };
  logo?: string;
}

const HeroHelper = ({ bannerImages, logo }: HeroHelperProps) => {
  const [floatingProducts, setFloatingProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchFloating = async () => {
      try {
        const res = await fetch("/api/productos?page=1");
        if (res.ok) {
          const data: ApiResponse = await res.json();
          // Tomar 6 productos aleatorios o los primeros 6
          setFloatingProducts(data.productos.slice(0, 6));
        }
      } catch (error) {
        console.error("Failed to fetch floating products", error);
      }
    };
    fetchFloating();
  }, []);

  return (
    <section
      className={`relative min-h-[600px] lg:min-h-[700px] flex items-center overflow-hidden bg-cover bg-center bg-no-repeat ${
        bannerImages
          ? "bg-[image:var(--hero-bg-mobile)] md:bg-[image:var(--hero-bg-desktop)]"
          : "bg-[#0a0a0a]"
      }`}
      style={
        bannerImages
          ? ({
              "--hero-bg-mobile": `url('${bannerImages.mobile}')`,
              "--hero-bg-desktop": `url('${bannerImages.pc}')`,
            } as React.CSSProperties)
          : undefined
      }
    >
      {/* Efectos de fondo con blur y gradientes */}
      <div className="absolute inset-0 opacity-40">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[#F2275D] rounded-full blur-[180px] opacity-30 animate-pulse"></div>
        <div
          className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-[#451773] rounded-full blur-[200px] opacity-25 animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/3 w-[400px] h-[400px] bg-[#17BFBF] rounded-full blur-[160px] opacity-20 animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      <div className="container relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          {/* Contenido Principal - Lado Izquierdo (Adaptado de LinkTree) */}
          <div className="flex-1 text-white space-y-6 py-12 lg:py-0 flex flex-col items-start text-left animate-in fade-in slide-in-from-bottom-8 duration-700 w-full px-4 sm:px-0">
            {/* Perfil / Logo */}
            <div className="flex flex-col items-start space-y-4 animate-in fade-in slide-in-from-left-8 duration-700">
              <div className="space-y-2">
                <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white/90 to-gray-400">
                    IMPORTADORA MIRANDA
                  </span>
                </h1>
                <p className="text-lg">
                  A un click del producto que necesitas.
                </p>
              </div>
            </div>

            {/* Iconos Sociales */}
            <div className="flex gap-3 animate-in fade-in slide-in-from-left-8 duration-700 delay-100">
              {[
                {
                  name: "TikTok",
                  url: "https://www.tiktok.com/@importadoramirandalives",
                  icon: (
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.03 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.9-.32-1.9-.39-2.81-.12-.9.24-1.72.76-2.29 1.53-.74 1-1 2.22-.71 3.4.26 1.15 1 2.16 2 2.76.99.63 2.21.75 3.32.31 1.09-.39 1.96-1.3 2.34-2.39.11-.26.16-.54.2-.82.02-2.99.01-5.97.01-8.96z" />
                    </svg>
                  ),
                },
                {
                  name: "WhatsApp",
                  url: "https://wa.me/59170621016",
                  icon: (
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                  ),
                },
                {
                  name: "Instagram",
                  url: "#",
                  icon: (
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.584.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.981 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                    </svg>
                  ),
                },
                {
                  name: "Facebook",
                  url: "https://www.facebook.com/profile.php?id=100063558189871",
                  icon: (
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  ),
                },
              ].map((link) => (
                <a
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20 rounded-xl text-white transition-all transform hover:-translate-y-1"
                  aria-label={link.name}
                >
                  {link.icon}
                </a>
              ))}
            </div>

            {/* Links Principales (Adaptado de LinkTree) */}
            <div className="w-full max-w-lg space-y-3 animate-in fade-in slide-in-from-left-8 duration-700 delay-200">
              {[
                {
                  title: "PAGO CON QR (LIVE)",
                  url: "/liveqr",
                  subtitle: "Realiza tu pago de forma segura",
                },
                {
                  title: "TIENDA DE PRODUCTOS",
                  url: "/tienda?page=1",
                  subtitle: "Explora nuestro catálogo completo",
                },
                {
                  title: "UBICACIÓN",
                  url: "/about#map-section",
                  subtitle: "Visítanos en nuestra sucursal",
                },
              ].map((link) => (
                <a
                  key={link.title}
                  href={link.url}
                  className="group block w-full bg-white/5 hover:bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-4 transition-all duration-300 hover:scale-[1.01] hover:border-white/20 shadow-lg relative overflow-hidden"
                >
                  <div className="flex justify-between items-center relative z-10">
                    <div className="flex flex-col text-left">
                      <span className="text-lg md:text-xl font-bold text-white group-hover:text-primary transition-colors uppercase tracking-tight leading-none mb-1">
                        {link.title}
                      </span>
                      <span className="text-xs md:text-sm font-medium text-white/50 group-hover:text-white/80 transition-colors">
                        {link.subtitle}
                      </span>
                    </div>
                    <div className="bg-white/10 p-2 rounded-lg text-white group-hover:bg-[#F2275D] transition-colors">
                      <FaArrowRight className="w-4 h-4 group-hover:rotate-0 -rotate-45 transition-transform" />
                    </div>
                  </div>
                  {/* Efecto de brillo al pasar el mouse */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                </a>
              ))}
            </div>
          </div>

          {/* Productos Flotantes - Lado Derecho */}
          <div className="flex-1 relative hidden lg:block h-[600px] w-full">
            {floatingProducts.map((product, idx) => {
              const positions = [
                { top: "5%", right: "10%", delay: "0s", duration: "20s" },
                { top: "25%", right: "25%", delay: "2s", duration: "25s" },
                { top: "45%", right: "5%", delay: "4s", duration: "22s" },
                { top: "15%", right: "40%", delay: "1s", duration: "24s" },
                { top: "60%", right: "30%", delay: "3s", duration: "23s" },
                { top: "70%", right: "15%", delay: "5s", duration: "21s" },
              ];
              const pos = positions[idx % positions.length];

              return (
                <div
                  key={product.id}
                  className="absolute w-32 h-32 animate-float-product opacity-0"
                  style={{
                    top: pos.top,
                    right: pos.right,
                    animationDelay: pos.delay,
                    animationDuration: pos.duration,
                  }}
                >
                  <div className="relative w-full h-full group">
                    {/* Glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#F2275D]/20 to-[#451773]/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all"></div>

                    {/* Card del producto */}
                    <div className="relative w-full h-full bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-2 shadow-2xl hover:scale-110 transition-transform duration-500">
                      <img
                        src={
                          product.fotos[0]?.foto
                            ? `https://importadoramiranda.com/storage/${product.fotos[0].foto}`
                            : "https://placehold.co/200x200?text=Product"
                        }
                        alt={product.nombre}
                        className="w-full h-full object-cover rounded-xl"
                        loading="lazy"
                      />

                      {/* Overlay con info */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-end p-3">
                        <div className="text-white">
                          <p className="text-xs text-gray-300">
                            Bs.{" "}
                            {parseFloat(product.precio).toLocaleString(
                              "es-BO",
                              { minimumFractionDigits: 2 },
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            {/* Elementos decorativos adicionales */}
            <div className="absolute top-1/4 right-1/4 w-2 h-2 bg-white rounded-full animate-ping opacity-50"></div>
            <div
              className="absolute top-2/3 right-1/3 w-1 h-1 bg-[#17BFBF] rounded-full animate-ping opacity-40"
              style={{ animationDelay: "1s" }}
            ></div>
            <div
              className="absolute top-1/2 right-1/2 w-3 h-3 bg-[#F2275D] rounded-full animate-ping opacity-30"
              style={{ animationDelay: "2s" }}
            ></div>
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-body dark:from-darkmode-body to-transparent"></div>
    </section>
  );
};

export default HeroHelper;
