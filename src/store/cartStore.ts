import { persistentMap } from '@nanostores/persistent';
import type { Product } from '../interfaces/product';

export interface CartItem extends Product {
    quantity: number;
}

export type CartStore = Record<string, CartItem>;

// El store persistirá en localStorage bajo la key 'cart'
export const cartItems = persistentMap<CartStore>('cart', {}, {
    encode: JSON.stringify,
    decode: JSON.parse
});

export const addCartItem = (product: Product) => {
    const currentStore = cartItems.get();
    const existingItem = currentStore[product.id];
    const maxStock = product.inventario?.cantidad ?? 0;

    if (existingItem) {
        const newQuantity = existingItem.quantity + 1;
        // Si no tiene stock (0) no debería agregar, pero si tiene inventario limitado se valida
        if (newQuantity <= maxStock) {
            cartItems.setKey(product.id.toString(), { ...existingItem, quantity: newQuantity });
        }
    } else {
        // Validar que haya al menos 1
        if (maxStock > 0) {
            cartItems.setKey(product.id.toString(), { ...product, quantity: 1 });
        }
    }
};

export const removeCartItem = (productId: number) => {
    cartItems.setKey(productId.toString(), undefined);
};

export const updateQuantity = (productId: number, quantity: number) => {
    const currentStore = cartItems.get();
    const item = currentStore[productId];
    const maxStock = item?.inventario?.cantidad ?? 0;

    if (item) {
        if (quantity <= 0) {
            cartItems.setKey(productId.toString(), undefined);
        } else if (quantity <= maxStock) {
            cartItems.setKey(productId.toString(), { ...item, quantity });
        }
    }
};

export const clearCart = () => {
    cartItems.set({});
};
