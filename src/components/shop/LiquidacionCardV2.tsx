import React, { useState } from "react";
import { useStore } from "@nanostores/react";
import { FaCartPlus, FaHeart, FaRegHeart, FaTag, FaPercentage } from "react-icons/fa";
import { addCartItem } from "../../store/cartStore";
import { toggleWishlist, wishlistItems } from "../../store/wishlistStore";
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
  const precioOriginal = parseFloat(product.producto.precio) || 0;
  const stockDisponible = product.stock; 
  const hasStock = stockDisponible > 0;

  // Wishlist Store - Usamos el ID del producto base
  const $wishlist = useStore(wishlistItems);
  const isWishlisted = !!$wishlist[product.producto.id];

  // Handlers de interacción
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (hasStock) {
      // Enviamos al carrito un objeto compatible con lo que espera tu Store
      addCartItem({
        ...product.producto,
        precio: product.precio_venta, // Precio de oferta
        foto_principal: product.foto_captura 
      } as any);
    }
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.producto as any);
  };

  // URL de imagen: Prioriza la captura de liquidación, si no, usa un placeholder
  const imageUrl = product.foto_captura 
    ? `${API_URL}/storage/${product.foto_captura}`
    : "https://placehold.co/400x400?text=Sin+Imagen";

  return (
    <div className="group relative bg-white dark:bg-darkmode-theme-light rounded-3xl overflow-hidden transition-all duration-500 hover:shadow-[0_20px_50px_rgba(242,39,93,0.15)] dark:hover:shadow-[0_20px_50px_rgba(242,39,93,0.3)] border border-gray-100 dark:border-darkmode-border flex flex-col h-full">

      {/* Badge Flotante de Oferta */}
      <div className="absolute top-4 left-4 z-30 pointer-events-none">
        <div className="bg-gradient-to-r from-[#F2275D] to-[#FF4D8D] text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-lg flex items-center gap-2 animate-pulse">
          <FaPercentage />
          LIQUIDACIÓN
        </div>
      </div>

      {/* Área de Imagen */}
      <a
        href={`/tienda/${product.producto_id}`}
        className="relative block w-full overflow-hidden bg-gray-50 dark:bg-darkmode-light p-4 flex items-center justify-center group-hover:bg-white dark:group-hover:bg-darkmode-theme-light transition-colors duration-500"
        style={{ minHeight: "280px" }}
      >
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
        )}

        <img
          src={imageUrl}
          alt={product.producto.nombre}
          onLoad={() => setImageLoaded(true)}
          className={`max-w-full max-h-128 object-contain transition-all duration-700 ${
            imageLoaded ? "opacity-100 group-hover:scale-105" : "opacity-0"
          }`}
          loading="lazy"
        />

        {/* Wishlist Button */}
        <button
          onClick={handleWishlist}
          className={`absolute top-4 right-4 z-30 w-10 h-10 rounded-full backdrop-blur-md flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg ${
            isWishlisted
              ? "bg-[#F2275D] text-white"
              : "bg-white/80 dark:bg-black/50 text-gray-600 dark:text-gray-300 hover:text-[#F2275D]"
          }`}
        >
          {isWishlisted ? <FaHeart /> : <FaRegHeart />}
        </button>
      </a>

      {/* Bloque de Texto e Información */}
      <div className="px-6 flex flex-col flex-grow bg-white dark:bg-darkmode-theme-light relative z-20">

        <a href={`/tienda/${product.producto_id}`} className="block flex-grow ">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-2 group-hover:text-[#F2275D] transition-colors leading-tight">
            {product.producto.nombre}
          </h3>
        </a>

        {/* Precios y Carrito */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-2xl font-black text-[#F2275D] leading-none">
              Bs {precioLiquidacion.toLocaleString("es-BO", { minimumFractionDigits: 2 })}
            </span>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={!hasStock}
            className={`flex items-center justify-center h-12 w-12 rounded-2xl transition-all duration-300 shadow-lg ${
              hasStock
                ? "bg-gradient-to-br from-[#F2275D] to-[#451773] text-white hover:scale-110 hover:shadow-[#F2275D]/40"
                : "bg-gray-200 dark:bg-gray-800 text-gray-400 cursor-not-allowed"
            }`}
            title={hasStock ? "Añadir al carrito" : "Sin stock"}
          >
            <FaCartPlus className="text-xl" />
          </button>
        </div>
      </div>

      {/* Efecto visual de borde al pasar el mouse */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-0 border-2 border-[#F2275D]/20 rounded-3xl"></div>
    </div>
  );
}