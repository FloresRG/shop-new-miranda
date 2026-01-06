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
            className={`relative min-h-[600px] lg:min-h-[700px] flex items-center overflow-hidden bg-cover bg-center bg-no-repeat ${bannerImages
                ? "bg-[image:var(--hero-bg-mobile)] md:bg-[image:var(--hero-bg-desktop)]"
                : "bg-[#0a0a0a]"
                }`}
            style={bannerImages ? ({
                '--hero-bg-mobile': `url('${bannerImages.mobile}')`,
                '--hero-bg-desktop': `url('${bannerImages.pc}')`
            } as React.CSSProperties) : undefined}
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
                <div className="flex flex-col lg:flex-row items-center ">
                    {/* Contenido Principal - Lado Izquierdo */}
                    <div className="flex-1 text-white space-y-8 py-12 lg:py-0 flex flex-col items-center text-center animate-in fade-in slide-in-from-bottom-8 duration-700">
                        {/* Logo */}
                        {logo && (
                            <div className="relative group perspective-1000">
                                <div className="absolute -inset-4 bg-gradient-to-r from-[#F2275D] to-[#451773] rounded-full blur-xl opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                                <img
                                    src={logo}
                                    alt="Importadora Miranda"
                                    className="relative w-64 md:w-60 lg:w-60 h-auto object-contain drop-shadow-2xl transform transition duration-500 hover:scale-105 hover:rotate-1"
                                />
                            </div>
                        )}

                        {/* Título Principal / Slogan */}
                        <div className="space-y-4">
                            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black leading-tight tracking-tight drop-shadow-lg">
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-100 to-gray-300">
                                    A un Click del Producto que Necesita!!
                                </span>
                            </h1>


                        </div>

                        {/* Botones de acción */}
                        <div className="flex flex-col sm:flex-row gap-4 pt-4 w-full justify-center">
                            <a
                                href="/tienda"
                                className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-[#F2275D] to-[#F20505] rounded-full font-bold text-white shadow-[0_0_40px_rgba(242,39,93,0.4)] hover:shadow-[0_0_60px_rgba(242,39,93,0.6)] transition-all duration-300 hover:scale-[1.02] overflow-hidden w-full sm:w-auto"
                            >
                                <span className="relative z-10 flex items-center gap-2">
                                    Explorar Tienda
                                    <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                                </span>
                                <div className="absolute inset-0 bg-gradient-to-r from-[#d91648] to-[#c70404] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            </a>

                            <a
                                href="/about"
                                className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/5 hover:bg-white/10 backdrop-blur-xl border border-white/10 hover:border-white/20 rounded-full font-semibold text-white transition-all duration-300 w-full sm:w-auto"
                            >
                                Conócenos
                                <svg
                                    className="w-5 h-5 group-hover:rotate-45 transition-transform"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M9 5l7 7-7 7"
                                    ></path>
                                </svg>
                            </a>
                        </div>

                        {/* Stats o badges informativos */}
                        <div className="flex flex-wrap gap-6 pt-4 text-sm justify-center">
                            <div className="flex items-center gap-2 text-gray-300">
                                <svg className="w-5 h-5 text-[#17BFBF]" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"></path>
                                </svg>
                                <span><strong className="text-white">+10,000</strong> Clientes</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-300">
                                <svg className="w-5 h-5 text-[#F2275D]" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                                </svg>
                                <span><strong className="text-white">4.9/5</strong> Valoración</span>
                            </div>
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
                                        animationDuration: pos.duration
                                    }}
                                >
                                    <div className="relative w-full h-full group">
                                        {/* Glow effect */}
                                        <div className="absolute inset-0 bg-gradient-to-br from-[#F2275D]/20 to-[#451773]/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all"></div>

                                        {/* Card del producto */}
                                        <div className="relative w-full h-full bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-2 shadow-2xl hover:scale-110 transition-transform duration-500">
                                            <img
                                                src={product.fotos[0]?.foto ? `https://test.importadoramiranda.com/storage/${product.fotos[0].foto}` : "https://placehold.co/200x200?text=Product"}
                                                alt={product.nombre}
                                                className="w-full h-full object-cover rounded-xl"
                                                loading="lazy"
                                            />

                                            {/* Overlay con info */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-end p-3">
                                                <div className="text-white">
                                                    <p className="text-xs text-gray-300">
                                                        Bs. {parseFloat(product.precio).toLocaleString('es-BO', { minimumFractionDigits: 2 })}
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
                        <div className="absolute top-2/3 right-1/3 w-1 h-1 bg-[#17BFBF] rounded-full animate-ping opacity-40" style={{ animationDelay: "1s" }}></div>
                        <div className="absolute top-1/2 right-1/2 w-3 h-3 bg-[#F2275D] rounded-full animate-ping opacity-30" style={{ animationDelay: "2s" }}></div>
                    </div>
                </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-body dark:from-darkmode-body to-transparent"></div>
        </section>
    );
};

export default HeroHelper;
