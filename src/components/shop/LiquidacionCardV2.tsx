import React, { useState } from "react";
import { useStore } from "@nanostores/react";
import { FaCartPlus, FaHeart, FaRegHeart, FaTag, FaPercentage } from "react-icons/fa";
import { addCartItem } from "../../store/cartStore";
import { toggleWishlist, wishlistItems } from "../../store/wishlistStore";
import { toast } from "react-hot-toast";
// Importamos el tipo desde el contenedor para que sean idénticos
import type { Liquidacion } from "./LiquidacionesContainer";

interface LiquidacionCardProps {
    product: Liquidacion;
}

export default function LiquidacionCardV2({ product }: LiquidacionCardProps) {
    const [imageLoaded, setImageLoaded] = useState(false);

    // Accedemos a la variable de entorno de Astro
    const API_URL = import.meta.env.PUBLIC_API_URL;

    // Extraemos datos del JSON anidado
    const precioLiquidacion = parseFloat(product.precio_venta) || 0;
    const precioOriginal = parseFloat(product?.producto?.precio || "0") || 0;
    const stockDisponible = product.stock || 0;
    // const hasStock = stockDisponible > 0;
    const hasStock = true; // Se permite añadir al carrito aunque no haya stock (pedido explícito)

    // Wishlist Store - Usamos el ID del producto base
    const $wishlist = useStore(wishlistItems);
    const isWishlisted = !!product?.producto?.id && !!$wishlist[product.producto.id];

    // Handlers de interacción
    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (hasStock && product.producto) {
            // CONSTRUIMOS EL OBJETO COMPLETO para que el carrito no aparezca vacío
            addCartItem({
                ...product.producto,
                precio: product.precio_venta,
                inventario: { cantidad: product.stock },
                fotos: [{ foto: product.foto_captura }],
                marca: { marca: 'Importadora Miranda' }, // Nombre formal por defecto
                ignoreStock: true // Bypasses stock check
            } as any);

            // Animación/Notificación de éxito
            toast.success(`${product.producto.nombre} añadido al carrito`, {
                duration: 3000,
                style: {
                    borderRadius: '12px',
                    background: '#121212',
                    color: '#fff',
                    fontWeight: 'bold',
                    fontSize: '14px',
                    border: '1px solid rgba(242,39,93,0.5)',
                    padding: '12px 20px',
                },
            });
        }
    };

    const handleWishlist = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (product.producto) {
            toggleWishlist(product.producto as any);
        }

        if (!isWishlisted) {
            toast.success('Favorito guardado', {
                icon: '❤️',
                style: {
                    borderRadius: '12px',
                    background: '#451773',
                    color: '#fff',
                    fontWeight: 'bold',
                    fontSize: '14px',
                }
            });
        }
    };

    // URL de imagen: Prioriza la captura de liquidación, si no, usa un placeholder
    const imageUrl = product.foto_captura
        ? `${API_URL}/storage/${product.foto_captura}`
        : "https://placehold.co/400x400?text=Sin+Imagen";

    return (
        /* Borde principal reforzado: border-gray-200 (claro) y border-gray-700 (oscuro) */
        <div className="group relative bg-white dark:bg-darkmode-light rounded-[32px] overflow-hidden transition-all duration-500 hover:shadow-[0_20px_60px_rgba(242,39,93,0.2)] dark:hover:shadow-[0_20px_60px_rgba(242,39,93,0.35)] border border-gray-200 dark:border-gray-700 flex flex-col h-full shadow-lg">

            {/* Badge Flotante de Oferta - Premium Look */}
            <div className="absolute top-5 left-5 z-10 pointer-events-none">
                <div className="bg-gradient-to-r from-[#F2275D] to-[#FF4D8D] text-white px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-[0_8px_20px_rgba(242,39,93,0.4)] flex items-center gap-2 animate-pulse border border-white/20">
                    <FaPercentage className="text-xs" />
                    LIQUIDACIÓN
                </div>
            </div>

            {/* Área de Imagen - Borde inferior más claro y definido */}
            <div
                className="relative block w-full overflow-hidden bg-gray-50/50 dark:bg-darkmode-body/50 p-6 flex items-center justify-center group-hover:bg-white dark:group-hover:bg-darkmode-light transition-colors duration-500 border-b border-gray-200 dark:border-gray-700"
                style={{ minHeight: "300px" }}
            >
                {!imageLoaded && (
                    <div className="absolute inset-0 bg-gray-200 dark:bg-gray-800 animate-pulse"></div>
                )}

                <img
                    src={imageUrl}
                    alt={product?.producto?.nombre || "Producto en Liquidación"}
                    onLoad={() => setImageLoaded(true)}
                    className={`max-w-[90%] max-h-128 object-contain transition-all duration-700 ${imageLoaded ? "opacity-100 group-hover:scale-[1.08]" : "opacity-0"
                        }`}
                    loading="lazy"
                />

                {/* Wishlist Button - Borde reforzado */}
                <button
                    onClick={handleWishlist}
                    className={`absolute top-5 right-5 z-10 w-11 h-11 rounded-2xl backdrop-blur-xl flex items-center justify-center transition-all duration-500 hover:scale-110 shadow-xl border border-gray-200 dark:border-gray-600 ${isWishlisted
                        ? "bg-[#F2275D] text-white border-transparent"
                        : "bg-white/90 dark:bg-black/40 text-gray-600 dark:text-gray-300 hover:text-[#F2275D]"
                        }`}
                >
                    {isWishlisted ? <FaHeart size={18} /> : <FaRegHeart size={18} />}
                </button>
            </div>

            {/* Bloque de Texto e Información */}
            <div className="px-7 pb-6 flex flex-col flex-grow bg-white dark:bg-darkmode-light relative z-20 pt-6">

                <div className="flex-grow">
                    <h3 className="text-[19px] font-black text-gray-900 dark:text-white line-clamp-2 group-hover:text-[#F2275D] transition-colors leading-[1.2]">
                        {product?.producto?.nombre || "Cargando nombre..."}
                    </h3>
                </div>

                {/* Separador visual antes del footer - Más definido */}
                <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent mb-6 opacity-80"></div>

                {/* Footer: Precios y Carrito */}
                <div className="flex items-center justify-between mt-auto gap-4">
                    <div className="flex flex-col gap-0.5">
                        {precioOriginal > precioLiquidacion && (
                            <span className="text-[11px] text-gray-400 dark:text-gray-500 line-through font-bold">
                                Bs {precioOriginal.toLocaleString("es-BO", { minimumFractionDigits: 2 })}
                            </span>
                        )}
                        <span className="text-[26px] font-black text-[#F2275D] leading-none tracking-tight">
                            Bs {precioLiquidacion.toLocaleString("es-BO", { minimumFractionDigits: 2 })}
                        </span>
                    </div>

                    <button
                        onClick={handleAddToCart}
                        disabled={!hasStock}
                        className={`flex items-center justify-center h-[54px] w-[54px] rounded-2xl transition-all duration-500 shadow-[0_10px_25px_rgba(242,39,93,0.3)] hover:shadow-[0_15px_30px_rgba(242,39,93,0.5)] border border-white/10 ${hasStock
                            ? "bg-gradient-to-br from-[#F2275D] to-[#451773] text-white hover:scale-110 active:scale-95"
                            : "bg-gray-200 dark:bg-gray-800 text-gray-400 cursor-not-allowed"
                            }`}
                        title={hasStock ? "Añadir al carrito" : "Sin stock"}
                    >
                        <FaCartPlus className="text-xl" />
                    </button>
                </div>
            </div>

            {/* Efecto visual de borde premium al pasar el mouse */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-700 pointer-events-none z-0 border-[3px] border-[#F2275D]/30 dark:border-[#F2275D]/40 rounded-[32px] scale-[1.02]"></div>
        </div>
    );
}