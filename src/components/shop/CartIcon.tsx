import { useStore } from '@nanostores/react';
import { cartItems } from '../../store/cartStore';
import type { CartStore, CartItem } from '../../store/cartStore';
import { FaShoppingCart } from 'react-icons/fa';
import React, { useState, useEffect } from 'react';

export default function CartIcon() {
    const $cartItems = useStore(cartItems) as CartStore | undefined;
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const count = $cartItems
        ? Object.values($cartItems).reduce((acc: number, item: CartItem) => acc + item.quantity, 0)
        : 0;

    if (!isMounted) return null;

    return (
        <button
            onClick={() => window.dispatchEvent(new CustomEvent('open-cart'))}
            className="relative p-2 text-gray-600 hover:text-primary dark:text-gray-300 transition-colors"
            aria-label="Abrir carrito"
        >
            <FaShoppingCart size={24} />
            {count > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-bounce">
                    {count}
                </span>
            )}
        </button>
    );
}
