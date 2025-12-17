import type { Product } from "../../interfaces/product";
import { addCartItem } from "../../store/cartStore";
import { toggleWishlist, wishlistItems } from "../../store/wishlistStore";
import { useStore } from '@nanostores/react';
import { FaCartPlus, FaHeart, FaRegHeart } from "react-icons/fa";
import React from "react";

interface ProductCardProps {
    product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
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
        addCartItem(product);
    };

    const handleWishlist = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        toggleWishlist(product);
    };

    return (
        <div className="bg-white dark:bg-darkmode-theme-light rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden group flex flex-col h-full border border-border dark:border-darkmode-border relative">

            {/* Wishlist Button Absolute */}
            <button
                onClick={handleWishlist}
                className="absolute top-3 left-3 z-10 w-9 h-9 rounded-full bg-white/80 dark:bg-black/50 backdrop-blur-sm flex items-center justify-center text-red-500 hover:scale-110 transition-transform shadow-sm"
                title="Añadir a lista de deseos"
            >
                {isWishlisted ? <FaHeart /> : <FaRegHeart />}
            </button>

            <a href={`/tienda/${product.id}`} className="block relative aspect-[4/3] overflow-hidden bg-gray-100">
                <img
                    src={product.fotos[0]?.foto || 'https://placehold.co/400x300?text=No+Image'}
                    alt={product.nombre}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                />
                {(stock === 0) && (
                    <span className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full uppercase font-bold shadow-sm">
                        Agotado
                    </span>
                )}
                {stock > 0 && product.tipo.tipo === "nuevo" && (
                    <span className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full uppercase font-bold shadow-sm">
                        Nuevo
                    </span>
                )}
            </a>

            <div className="p-4 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-semibold text-primary uppercase tracking-wider">{product.marca.marca}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{product.categoria.categoria}</span>
                </div>

                <a href={`/tienda/${product.id}`} className="block mb-2">
                    <h3 className="text-lg font-bold text-dark dark:text-darkmode-text line-clamp-2 hover:text-primary transition-colors" title={product.nombre}>
                        {product.nombre}
                    </h3>
                </a>

                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2 flex-grow">
                    {product.descripcion}
                </p>

                <div className="flex items-center justify-between mt-auto">
                    <span className="text-xl font-bold text-primary">
                        {price > 0 ? `$${price.toFixed(2)}` : 'Consultar'}
                    </span>

                    <button
                        onClick={handleAddToCart}
                        disabled={!hasStock}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white transition-colors text-sm font-medium
              ${hasStock
                                ? 'bg-primary hover:bg-primary/90'
                                : 'bg-gray-400 cursor-not-allowed'}`}
                    >
                        <FaCartPlus />
                        {hasStock ? 'Agregar' : 'Agotado'}
                    </button>
                </div>
            </div>
        </div>
    );
}
