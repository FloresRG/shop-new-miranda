import React from "react";
import { useStore } from "@nanostores/react";
import { wishlistItems } from "../../store/wishlistStore";
import ProductGrid from "./ProductGrid";
import { FaHeart } from "react-icons/fa";

const WishlistContainer = () => {
    const wishlist = useStore(wishlistItems);
    const products = Object.values(wishlist);

    if (products.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-24 h-24 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-6">
                    <FaHeart className="w-10 h-10 text-red-500" />
                </div>
                <h2 className="text-2xl font-bold mb-2 text-dark dark:text-white">
                    Tu lista de deseos está vacía
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md">
                    Explora nuestra tienda y dale corazón a los productos que más te gusten para guardarlos aquí.
                </p>
                <a
                    href="/tienda"
                    className="btn btn-primary"
                >
                    Explorar Tienda
                </a>
            </div>
        );
    }

    return (
        <section className="section">
            <div className="container">
                <div className="mb-8">
                    <h1 className="h2 flex items-center gap-3">
                        <FaHeart className="text-red-500" />
                        Mis Deseos
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                        Tus productos favoritos guardados para más tarde.
                    </p>
                </div>

                <ProductGrid products={products} />
            </div>
        </section>
    );
};

export default WishlistContainer;
