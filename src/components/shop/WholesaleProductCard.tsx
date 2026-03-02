import type { Product } from "../../interfaces/product";
import { addCartItem } from "../../store/cartStore";
import { FaCartPlus, FaLayerGroup, FaTags } from "react-icons/fa";
import React, { useState } from "react";

interface WholesaleProductCardProps {
    product: Product;
}

export default function WholesaleProductCard({ product }: WholesaleProductCardProps) {
    const [imageLoaded, setImageLoaded] = useState(false);

    const priceUnidad = product.precio_unidad || parseFloat(product.precio) || 0;
    const priceDocena = product.precio_docena || (priceUnidad * 0.9); // Fallback if not provided

    const getStock = (p: any) => {
        if (!p) return 0;
        const inv = p.inventario || p.inventarios;
        if (inv) {
            if (Array.isArray(inv)) {
                const item = inv.find((i: any) => i.id_sucursal == 1 || i.sucursal_id == 1);
                if (item) return item.cantidad ?? item.stock ?? 0;
            } else {
                if (inv.id_sucursal != null || inv.sucursal_id != null) {
                    if (inv.id_sucursal == 1 || inv.sucursal_id == 1) return inv.cantidad ?? inv.stock ?? 0;
                    return 0;
                }
                return inv.cantidad ?? inv.stock ?? 0;
            }
        }
        return 0;
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
        <div className="group relative bg-[#1a1a1a] rounded-3xl overflow-hidden transition-all duration-500 border border-[#D4AF37]/20 hover:border-[#D4AF37]/60 shadow-[0_10px_30px_rgba(0,0,0,0.5)] hover:shadow-[#D4AF37]/10 flex flex-col h-full">

            {/* Badge Mayorista */}
            <div className="absolute top-4 left-4 z-30 pointer-events-none">
                <span className="bg-gradient-to-r from-[#C5A021] to-[#D4AF37] text-black text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-lg">
                    Mayorista
                </span>
            </div>

            {/* Imagen */}
            <div className="relative aspect-square overflow-hidden bg-[#0c0c0c]">
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
                <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0c] via-transparent to-transparent opacity-60"></div>
            </div>

            {/* Contenido */}
            <div className="p-5 flex flex-col flex-grow">
                <div className="mb-4">
                    <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-widest">{product.marca.marca}</span>
                    <h3 className="text-lg font-bold text-white line-clamp-2 mt-1 leading-tight group-hover:text-[#D4AF37] transition-colors">
                        {product.nombre}
                    </h3>
                </div>

                {/* Precios */}
                <div className="mt-auto space-y-3">
                    <div className="bg-[#222] p-3 rounded-2xl border border-[#D4AF37]/10">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-gray-400 text-[10px] font-bold uppercase tracking-tighter flex items-center gap-1">
                                <FaTags className="text-[#D4AF37]" /> Por Unidad
                            </span>
                            <span className="text-white font-bold">
                                {priceUnidad > 0 ? `Bs ${priceUnidad.toFixed(2)}` : "Precio aún no agregado"}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-[#D4AF37] text-[10px] font-bold uppercase tracking-tighter flex items-center gap-1">
                                <FaLayerGroup /> Por Docena
                            </span>
                            <span className="text-[#D4AF37] font-black text-xl">
                                {priceDocena > 0 ? `Bs ${priceDocena.toFixed(2)}` : "Precio aún no agregado"}
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <button
                            onClick={handleAddUnit}
                            disabled={!hasStock || priceUnidad === 0}
                            className={`py-3 rounded-xl font-bold text-xs transition-all duration-300 flex items-center justify-center gap-2 ${hasStock && priceUnidad > 0
                                ? "bg-white/5 text-white hover:bg-white/10 border border-white/10"
                                : "bg-gray-800 text-gray-500 cursor-not-allowed"}`}
                        >
                            <FaCartPlus /> (+1)
                        </button>
                        <button
                            onClick={handleAddDozen}
                            disabled={!hasStock || priceDocena === 0}
                            className={`py-3 rounded-xl font-black text-xs transition-all duration-300 flex items-center justify-center gap-2 shadow-lg ${hasStock && priceDocena > 0
                                ? "bg-gradient-to-r from-[#C5A021] to-[#D4AF37] text-black hover:scale-105 active:scale-95"
                                : "bg-gray-800 text-gray-400 cursor-not-allowed"}`}
                        >
                            <FaLayerGroup /> +1 Docena
                        </button>
                    </div>

                    <p className="text-[9px] text-center text-gray-500 font-medium">
                        Stock disponible: <span className={stock > 0 ? "text-green-500" : "text-red-500"}>{stock} units</span>
                    </p>
                </div>
            </div>
        </div>
    );
}
