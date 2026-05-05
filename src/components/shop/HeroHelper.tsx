import React, { useEffect, useState, useRef } from "react";
import { FaArrowRight } from "react-icons/fa";
import gsap from "gsap";
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
  const [isLoading, setIsLoading] = useState(true);
  const linksContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".hero-link-item",
        { x: -50, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.4,
          stagger: 0.08,
          ease: "power3.out",
          delay: 0.1,
        },
      );
    }, linksContainerRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const fetchFloating = async () => {
      try {
        const res = await fetch(
          "https://importadoramiranda.com/api/liquidaciones?page=1",
        );
        if (res.ok) {
          const data = await res.json();
          if (data && data.data && Array.isArray(data.data)) {
            const products = data.data.map((item: any) => ({
              ...item.producto,
              precio: item.precio_venta,
              fotos: [{ id: item.id, foto: item.foto_captura }],
            }));
            setFloatingProducts(products.slice(0, 10));
          }
        }
      } catch (error) {
        console.error("Failed to fetch clearance products", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFloating();
  }, []);

  return (
    <section
      className={` xl:pt-16  relative min-h-[600px] lg:min-h-[700px] flex items-center overflow-hidden bg-cover bg-center bg-no-repeat ${
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
        <div className="flex flex-col lg:flex-row items-center">
          {/* Contenido Principal - Lado Izquierdo */}
          <div className="flex-1 text-white space-y-8 pt-24 pb-12 lg:py-0 flex flex-col items-start text-left w-full px-4 sm:px-0">
            <div className="w-full max-w-lg space-y-4" ref={linksContainerRef}>
              {[
                {
                  title: "CHATEA CON NOSOTROS",
                  url: "#",
                  subtitle: "Si ingresa podremos hablar directamente con el equipo de pedidos.",
                  onClick: (e: React.MouseEvent) => {
                    e.preventDefault();
                    if ((window as any).$chatwoot) {
                      (window as any).$chatwoot.toggle();
                    }
                  }
                },
                {
                  title: "PAGO CON QR (LIVE)",
                  url: "/liveqr",
                  subtitle: "Realiza tu pago de forma segura",
                },
                {
                  title: "VERIFICAR TU PEDIDO",
                  url: "/qr",
                  subtitle: "Verifica el estado de tu pedido",
                },
                {
                  title: "ENVÍOS A TODO EL PAÍS",
                  url: "/departamentos",
                  subtitle: "Mira nuestra cobertura nacional",
                },
                {
                  title: "UBICACIÓN",
                  url: "/about#map-section",
                  subtitle: "Visítanos en nuestra sucursal",
                },
                {
                  title: "AGREGA TU SUGERENCIA DE SUCURSAL",
                  url: "/sucursal",
                  subtitle: "Aqui agrega tu sugerencia de sucursal para que estemos ahi",
                },
                {
                  title: "INGRESE A NUESTRO GRUPO DE DIFUCION",
                  url: "https://whatsapp.com/channel/0029Vb8NgBe2kNFn3YppK125",
                  subtitle: "Únete a nuestro grupo para novedades y ofertas",
                },
              ].map((link, i) => (
                <a
                  key={link.title}
                  href={link.url}
                  onClick={link.onClick}
                  className="hero-link-item group block w-full bg-white/10 dark:bg-black/20 hover:bg-white/20 dark:hover:bg-white/10 backdrop-blur-md border border-white/20 dark:border-white/10 rounded-2xl p-5 transition-all duration-300 hover:scale-[1.02] hover:border-secondary/50 dark:hover:border-accent/50 shadow-[0_8px_32px_rgba(0,0,0,0.3)] relative overflow-hidden opacity-0"
                >
                  <div className="flex justify-between items-center relative z-10">
                    <div className="flex flex-col text-left">
                      <span className="text-lg md:text-xl font-bold text-secondary dark:text-white group-hover:text-white transition-colors uppercase tracking-tight leading-none mb-1">
                        {link.title}
                      </span>
                      <span className="text-xs md:text-sm font-medium text-secondary/90 dark:text-white/80 group-hover:text-white transition-colors">
                        {link.subtitle}
                      </span>
                    </div>
                    <div className="bg-secondary/10 dark:bg-white/10 p-3 rounded-xl text-secondary dark:text-white group-hover:bg-secondary group-hover:text-white transition-all shadow-lg">
                      <FaArrowRight className="w-5 h-5 group-hover:rotate-0 -rotate-45 transition-transform" />
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                </a>
              ))}
            </div>
          </div>

          {/* Carrusel de Productos en Liquidación o Logo */}
          <div className="w-full lg:flex-1 flex flex-col items-center justify-center gap-4 mt-12 lg:mt-24 animate-in fade-in slide-in-from-right-full duration-1000 delay-500 ease-out fill-mode-backwards z-20">
            {!isLoading && floatingProducts.length > 0 ? (
              <div className="relative w-full h-[320px] lg:h-[550px] overflow-hidden flex items-center">
                <div className="absolute left-0 flex gap-4 lg:gap-10 animate-carousel-x hover:[animation-play-state:paused] transition-all">
                  {[
                    ...floatingProducts,
                    ...floatingProducts,
                    ...floatingProducts,
                  ].map((product, idx) => (
                    <a
                      href="/liquidaciones"
                      key={`${product.id}-${idx}`}
                      className="relative w-40 h-56 lg:w-64 lg:h-80 flex-shrink-0 group overflow-hidden rounded-3xl shadow-2xl border border-white/10 block"
                    >
                      <div className="absolute top-2 left-2 z-20">
                        <span className="bg-[#F2275D] text-[9px] lg:text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider animate-pulse text-white">
                          Liquidación
                        </span>
                      </div>

                      <div className="absolute inset-0 bg-gradient-to-br from-[#F2275D]/20 to-[#451773]/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>

                      <div className="relative w-full h-full bg-white/5 backdrop-blur-md transition-all duration-500 group-hover:scale-110">
                        <img
                          src={
                            product.fotos[0]?.foto
                              ? `https://importadoramiranda.com/storage/${product.fotos[0].foto}`
                              : "https://placehold.co/200x200?text=Product"
                          }
                          alt={product.nombre}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />

                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all flex flex-col justify-end p-4">
                          <p className="text-xs lg:text-sm font-bold text-white mb-1 line-clamp-2">
                            {product.nombre}
                          </p>
                          <p className="text-[#17BFBF] font-black text-sm lg:text-base">
                            Bs.{" "}
                            {parseFloat(product.precio).toLocaleString(
                              "es-BO",
                              {
                                minimumFractionDigits: 2,
                              },
                            )}
                          </p>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            ) : !isLoading && floatingProducts.length === 0 ? (
              <div className="relative w-full h-[320px] lg:h-[550px] flex items-center justify-center">
                {logo && (
                  <img
                    src={logo}
                    alt="Importadora Miranda"
                    className="w-64 lg:w-96 h-auto object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500"
                  />
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-body dark:from-darkmode-body to-transparent"></div>
    </section>
  );
};

export default HeroHelper;
