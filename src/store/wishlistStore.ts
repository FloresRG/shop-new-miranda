import { persistentMap } from '@nanostores/persistent';
import type { Product } from '../interfaces/product';

// Guardamos items completos para evitar refetching, aunque solo el ID sería más ligero.
// Para simplicidad y rendimiento en UI, guardamos el objeto producto mínimo necesario o completo.
export const wishlistItems = persistentMap<Record<string, Product>>('wishlist', {}, {
    encode: JSON.stringify,
    decode: JSON.parse
});

export const toggleWishlist = (product: Product) => {
    const current = wishlistItems.get();
    if (current[product.id]) {
        // Remove
        wishlistItems.setKey(product.id.toString(), undefined);
    } else {
        // Add
        wishlistItems.setKey(product.id.toString(), product);
    }
};

export const isInWishlist = (productId: number) => {
    const current = wishlistItems.get();
    return !!current[productId];
};
