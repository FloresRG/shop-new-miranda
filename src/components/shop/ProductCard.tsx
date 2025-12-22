import type { Product } from "../../interfaces/product";
import { addCartItem } from "../../store/cartStore";
import { toggleWishlist, wishlistItems } from "../../store/wishlistStore";
import { useStore } from "@nanostores/react";
import { FaCartPlus, FaHeart, FaRegHeart, FaEye, FaTag } from "react-icons/fa";
import React, { useState } from "react";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);

  // Manejo seguro de datos
  const price = parseFloat(product.precio) || 0;
  const stock = product.inventario?.cantidad ?? 0;
  const hasStock = stock > 0;

  // Wishlist Logic
  const $wishlist = useStore(wishlistItems);
  const isWishlisted = !!$wishlist[product.id];

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (hasStock) {
      addCartItem(product);
    }
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  const imageUrl = product.fotos[0]?.foto
    ? `${import.meta.env.PUBLIC_API_URL}/storage/${product.fotos[0].foto}`
    : "https://placehold.co/400x300?text=No+Image";

  return (
    <div className="group relative bg-white dark:bg-[#1a1a1a] rounded-2xl overflow-hidden transition-all duration-500 hover:-translate-y-2 border border-gray-100 dark:border-gray-800 hover:border-[#F2275D]/30 dark:hover:border-[#F2275D]/50 h-full flex flex-col shadow-md hover:shadow-2xl">
      {/* Glow effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#F2275D]/0 via-[#451773]/0 to-[#17BFBF]/0 group-hover:from-[#F2275D]/5 group-hover:via-[#451773]/5 group-hover:to-[#17BFBF]/5 transition-all duration-500 pointer-events-none rounded-2xl"></div>

      {/* Imagen del producto */}
      <a
        href={`/tienda/${product.id}`}
        className="block relative aspect-square overflow-hidden bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900"
      >
        {/* Skeleton loader */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 animate-pulse"></div>
        )}

        <img
          src={imageUrl}
          alt={product.nombre}
          onLoad={() => setImageLoaded(true)}
          className={`w-full h-full object-cover transition-all duration-700 ${
            imageLoaded ? "opacity-100 group-hover:scale-110" : "opacity-0"
          }`}
          loading="lazy"
        />

      <div className="absolute inset-0 bg-gradient-to-t from-[#4b0082]/80 via-[#9370db]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        {/* Badges superiores */}
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between z-10">
          {/* Wishlist button */}
          <button
            onClick={handleWishlist}
            className={`w-10 h-10 rounded-full backdrop-blur-md flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg ${
              isWishlisted
                ? "bg-red-500 text-white"
                : "bg-white/90 dark:bg-black/70 text-gray-600 dark:text-gray-300 hover:text-red-500"
            }`}
            title={isWishlisted ? "Quitar de favoritos" : "Añadir a favoritos"}
          >
            {isWishlisted ? (
              <FaHeart className="w-4 h-4" />
            ) : (
              <FaRegHeart className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Marca y Categoría - Aparecen en hover desde arriba */}
        <div className="absolute top-0 inset-x-0 p-4 transform -translate-y-full group-hover:translate-y-0 transition-transform duration-500 z-20">
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

      {/* Contenido de la card */}
      <div className="relative p-2 flex flex-col flex-grow">
        {/* Título del producto */}
        <a href={`/tienda/${product.id}`} className="block mb-4 group/title">
          <h3
            className="text-lg font-bold text-gray-900 dark:text-white line-clamp-2 group-hover/title:text-[#F2275D] transition-colors leading-tight "
            title={product.nombre}
          >
            {product.nombre}
          </h3>
        </a>

        {/* Footer: Precio y Acción */}
        <div className="flex items-center justify-between gap-3 mt-auto">
          {/* Precio */}
          <div className="flex flex-col">
            {price > 0 ? (
              <>
                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">
                  Precio
                </span>
                <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#F2275D] to-[#451773]">
                  Bs{" "}
                  {price.toLocaleString("es-BO", { minimumFractionDigits: 2 })}
                </span>
              </>
            ) : (
              <span className="text-lg font-bold text-gray-600 dark:text-gray-400">
                Consultar
              </span>
            )}
          </div>

          {/* Botón de agregar */}
          <button
            onClick={handleAddToCart}
            disabled={!hasStock}
            className={`relative flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all duration-300 shadow-lg overflow-hidden group/btn ${
              hasStock
                ? "bg-gradient-to-r from-[#F2275D] to-[#F20505] text-white hover:shadow-[#F2275D]/50 hover:scale-105 active:scale-95"
                : "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-500 cursor-not-allowed"
            }`}
            title={hasStock ? "Añadir al carrito" : "Producto agotado"}
          >
            {hasStock && (
              <div className="absolute inset-0 bg-gradient-to-r from-[#d91648] to-[#c70404] opacity-0 group-hover/btn:opacity-100 transition-opacity"></div>
            )}
            <FaCartPlus className="w-4 h-4 relative z-10" />
            <span className="relative z-10 hidden sm:inline">
              {hasStock ? "Agregar" : "Agotado"}
            </span>
          </button>
        </div>

        {/* Stock indicator */}
        {hasStock && stock <= 5 && (
          <div className="mt-3 flex items-center gap-2 text-xs text-orange-600 dark:text-orange-400">
            <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></div>
            <span className="font-semibold">
              ¡Solo quedan {stock} unidades!
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
