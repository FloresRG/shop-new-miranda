import type { Product } from "../../interfaces/product";
import { addCartItem } from "../../store/cartStore";
import { toggleWishlist, wishlistItems } from "../../store/wishlistStore";
import { useStore } from "@nanostores/react";
import { FaCartPlus, FaHeart, FaRegHeart, FaTag } from "react-icons/fa";
import React, { useState } from "react";

interface LiquidacionCardProps {
  product: Product;
}

export default function LiquidacionCard({ product }: LiquidacionCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);

  const price = parseFloat(product.precio) || 0;
  const stock = product.inventario?.cantidad ?? 0;
  const hasStock = stock > 0;

  const $wishlist = useStore(wishlistItems);
  const isWishlisted = !!$wishlist[product.id];

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (hasStock) addCartItem(product);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  const imageUrl =
    product.fotos[0]?.foto || "https://placehold.co/400x300?text=No+Image";

  return (
    <div className="group relative bg-white dark:bg-darkmode-light rounded-2xl overflow-hidden transition-all duration-500 hover:-translate-y-0 md:hover:-translate-y-2 border border-gray-100 dark:border-darkmode-border hover:border-[#F2275D]/30 dark:hover:border-[#F2275D]/50 flex flex-row md:flex-col h-32 md:h-full shadow-md hover:shadow-2xl">
      {/* Glow hover */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-[#F2275D]/0 via-[#451773]/0 to-[#17BFBF]/0 
        group-hover:from-[#F2275D]/5 group-hover:via-[#451773]/5 group-hover:to-[#17BFBF]/5 
        transition-all duration-500 pointer-events-none rounded-2xl z-0"
      ></div>

      {/* Imagen */}
      <a
        href={`/tienda/${product.id}`}
        className="relative block w-32 md:w-full h-full md:h-auto md:aspect-square shrink-0 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900 z-10"
      >
        {!imageLoaded && (
          <div className="absolute inset-0  from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 animate-pulse"></div>
        )}

        <img
          src={imageUrl}
          alt={product.nombre}
          onLoad={() => setImageLoaded(true)}
          className={`w-full h-full object-cover transition-all duration-700 ${
            imageLoaded ? "opacity-100 group-hover:scale-110" : ""
          }`}
          loading="lazy"
        />

        {/* Overlay (Desktop Only) */}
        <div
          className="absolute inset-0 bg-gradient-to-t from-[#4b0082]/80 via-[#9370db]/40 to-transparent 
          opacity-0 md:group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-10 hidden md:block"
        ></div>

        {/* BOTÓN WISHLIST */}
        <div className="absolute top-2 left-2 md:top-3 md:right-3 md:left-auto z-30">
          <button
            onClick={handleWishlist}
            className={`w-8 h-8 md:w-10 md:h-10 rounded-full backdrop-blur-md flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg ${
              isWishlisted
                ? "bg-red-500 text-white"
                : "bg-white/90 dark:bg-black/70 text-gray-600 dark:text-gray-300 hover:text-red-500"
            }`}
            title={isWishlisted ? "Quitar de favoritos" : "Añadir a favoritos"}
          >
            {isWishlisted ? (
              <FaHeart className="text-xs md:text-base" />
            ) : (
              <FaRegHeart className="text-xs md:text-base" />
            )}
          </button>
        </div>

        {/* MARCA Y CATEGORÍA — Desktop Only Animation */}
        <div
          className="absolute bottom-0 inset-x-0 p-4 transform translate-y-full 
          group-hover:translate-y-0 transition-transform duration-500 z-20 hidden md:block"
        >
          <div className="flex items-center justify-between gap-2">
            {/* Marca */}
            <div className="flex items-center gap-2 px-3 py-2 bg-white/95 dark:bg-black/90 backdrop-blur-md rounded-xl shadow-xl">
              <div className="w-1.5 h-1.5 rounded-full bg-[#F2275D] animate-pulse"></div>
              <span className="text-xs font-bold text-[#451773] dark:text-[#a855f7] uppercase tracking-wider">
                {product.marca.marca}
              </span>
            </div>

            {/* Categoría */}
            <div className="flex items-center gap-2 px-3 py-2 bg-white/95 dark:bg-black/90 backdrop-blur-md rounded-xl shadow-xl">
              <FaTag className="w-3 h-3 text-gray-600 dark:text-gray-400" />
              <span className="text-[10px] font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                {product.categoria.categoria}
              </span>
            </div>
          </div>
        </div>
      </a>

      {/* Contenido */}
      <div className="relative p-3 md:p-4 flex flex-col flex-grow z-10 justify-between">
        <div>
          {/* Mobile Brand Label */}
          <div className="flex md:hidden items-center gap-2 text-[10px] text-gray-500 dark:text-gray-400 mb-1">
            <span className="uppercase font-bold text-primary">
              {product.marca.marca}
            </span>
          </div>

          <a href={`/tienda/${product.id}`} className="block mb-1 md:mb-4">
            <h3 className="text-sm md:text-lg font-bold text-gray-900 dark:text-white line-clamp-2 hover:text-[#F2275D] transition-colors leading-tight">
              {product.nombre}
            </h3>
          </a>
        </div>

        <div className="flex items-center justify-between mt-auto gap-2 md:gap-3">
          <div>
            <span className="text-lg md:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#F2275D] to-[#451773]">
              Bs {price.toLocaleString("es-BO", { minimumFractionDigits: 2 })}
            </span>
          </div>
          <button
            onClick={handleAddToCart}
            disabled={!hasStock}
            className={`p-2 md:px-5 md:py-3 rounded-xl font-bold text-sm transition-all duration-300 shadow-lg flex-shrink-0 ${
              hasStock
                ? "bg-gradient-to-r from-[#F2275D] to-[#F20505] text-white hover:scale-105"
                : "bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed"
            }`}
          >
            <FaCartPlus className="text-sm md:text-base" />
          </button>
        </div>
      </div>
    </div>
  );
}
