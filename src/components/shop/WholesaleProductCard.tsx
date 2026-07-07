import type { Product } from "../../interfaces/product";
import { addCartItem } from "../../store/cartStore";
import { FaCartPlus, FaLayerGroup, FaTags } from "react-icons/fa";
import React, { useState } from "react";

interface WholesaleProductCardProps {
    product: Product;
}

export default function WholesaleProductCard({ product }: WholesaleProductCardProps) {
    const [imageLoaded, setImageLoaded] = useState(false);

    const priceUnidad = Number(product.precio_unidad || parseFloat(product.precio) || 0);
    const priceDocena = Number(product.precio_docena || (priceUnidad * 0.9));

    const getStock = (p: any) => {
        if (!p) return 0;
        const inv = p.inventario || p.inventarios;
        if (inv) {
            if (Array.isArray(inv)) {
                return inv.reduce((sum: number, item: any) => sum + (item.cantidad ?? item.stock ?? 0), 0);
            } else {
                return inv.cantidad ?? inv.stock ?? 0;
            }
        }
        return p.stock ?? p.cantidad ?? 0;
    };

    const stock = getStock(product);
    const hasStock = stock > 0;

    const handleAddUnit = (e: React.MouseEvent) => {
        e.preventDefault(); e.stopPropagation();
        if (hasStock) addCartItem(product, 1, true);
    };

    const handleAddDozen = (e: React.MouseEvent) => {
        e.preventDefault(); e.stopPropagation();
        if (stock >= 12) addCartItem(product, 12, true);
        else if (hasStock) addCartItem(product, stock, true);
    };

    const imageUrl = product.fotos[0]?.foto
        ? `${import.meta.env.PUBLIC_API_URL}/storage/${product.fotos[0].foto}`
        : "https://placehold.co/400x300?text=No+Image";

    return (
        <div className="group relative bg-white dark:bg-[#1a1a1a] rounded-3xl overflow-hidden transition-all duration-500 border border-[#D4AF37]/20 hover:border-[#D4AF37]/60 shadow-lg hover:shadow-[#D4AF37]/10 flex flex-col h-full transition-colors">

            {/* Badge Mayorista */}
            <div className="absolute top-3 left-3 z-30 pointer-events-none">
                <span className="bg-gradient-to-r from-[#C5A021] to-[#D4AF37] text-black text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full shadow-lg">
                    VIP
                </span>
            </div>

            {/* Imagen */}
            <a href={`/mayorista/tienda/${product.id}`} className="block relative aspect-square overflow-hidden bg-gray-100 dark:bg-[#0c0c0c]">
                {!imageLoaded && (
                    <div className="absolute inset-0 bg-gray-800 animate-pulse"></div>
                )}
                <img
                    src={imageUrl}
                    alt={product.nombre}
                    onLoad={() => setImageLoaded(true)}
                    className={`w-full h-full object-cover transition-transform duration-700 ${imageLoaded ? "opacity-100 group-hover:scale-110" : "opacity-0"}`}
                    loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 dark:from-[#0c0c0c] via-transparent to-transparent opacity-60"></div>
            </a>

            {/* Contenido */}
            <div className="p-4 sm:p-5 flex flex-col flex-grow">
                <div className="mb-3">
                    <span className="text-[9px] font-bold text-[#C5A021] dark:text-[#D4AF37] uppercase tracking-widest">{product.marca.marca}</span>
                    <a href={`/mayorista/tienda/${product.id}`} className="block">
                        <h3 className="text-base sm:text-lg font-bold text-dark dark:text-white line-clamp-2 mt-1 leading-tight group-hover:text-[#D4AF37] transition-colors min-h-[2.5rem]">
                            {product.nombre}
                        </h3>
                    </a>
                </div>

                {/* Precios */}
                <div className="mt-auto space-y-3">
                    <div className="bg-gray-50 dark:bg-[#222] p-3 rounded-2xl border border-gray-100 dark:border-[#D4AF37]/10">
                        <div className="flex justify-between items-center mb-1 gap-2">
                            <span className="text-gray-500 dark:text-gray-400 text-[9px] font-bold uppercase tracking-tighter flex items-center gap-1 shrink-0">
                                <FaTags className="text-[#C5A021] dark:text-[#D4AF37]" /> UNIDAD
                            </span>
                            <span className="text-dark dark:text-white font-bold text-sm truncate">
                                {priceUnidad > 0 ? `Bs ${priceUnidad.toFixed(2)}` : "P. Pendiente"}
                            </span>
                        </div>
                        <div className="flex justify-between items-center gap-2">
                            <span className="text-[#C5A021] dark:text-[#D4AF37] text-[9px] font-bold uppercase tracking-tighter flex items-center gap-1 shrink-0">
                                <FaLayerGroup /> DOCENA
                            </span>
                            <span className="text-[#C5A021] dark:text-[#D4AF37] font-black text-lg">
                                {priceDocena > 0 ? `Bs ${priceDocena.toFixed(2)}` : "P. Pendiente"}
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5">
                        <button
                            onClick={handleAddUnit}
                            disabled={!hasStock || priceUnidad === 0}
                            className={`py-2.5 rounded-xl font-bold text-[10px] transition-all duration-300 flex items-center justify-center gap-1 ${hasStock && priceUnidad > 0
                                ? "bg-white/5 text-white hover:bg-white/10 border border-white/10"
                                : "bg-gray-800 text-gray-500 cursor-not-allowed"}`}
                        >
                            <FaCartPlus size={12} /> +1
                        </button>
                        <button
                            onClick={handleAddDozen}
                            disabled={!hasStock || priceDocena === 0}
                            className={`py-2.5 rounded-xl font-black text-[10px] transition-all duration-300 flex items-center justify-center gap-1 shadow-lg ${hasStock && priceDocena > 0
                                ? "bg-gradient-to-r from-[#C5A021] to-[#D4AF37] text-black hover:scale-105 active:scale-95"
                                : "bg-gray-800 text-gray-400 cursor-not-allowed"}`}
                        >
                            <FaLayerGroup size={12} /> +12
                        </button>
                    </div>

                    <p className="text-[8px] text-center text-gray-500 font-medium">
                        Stock: <span className={stock > 0 ? "text-green-500" : "text-red-500"}>{stock} units</span>
                    </p>
                </div>
            </div>
        </div>
    );
}
