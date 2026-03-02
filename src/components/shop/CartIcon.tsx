// components/shop/CartIcon.tsx
import { useStore } from '@nanostores/react';
import { cartItems, wholesaleCartItems } from '../../store/cartStore';
import type { CartStore, CartItem } from '../../store/cartStore';
import { FaShoppingCart } from 'react-icons/fa';
import React from 'react';

export default function CartIcon() {
  const [mounted, setMounted] = React.useState(false);
  const $cartItems = useStore(cartItems) as CartStore | undefined;
  const $wholesaleCartItems = useStore(wholesaleCartItems) as CartStore | undefined;

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const isWholesale = typeof window !== 'undefined' && window.location.pathname.startsWith('/mayorista');
  const activeItems = isWholesale ? $wholesaleCartItems : $cartItems;

  // Calcular el contador solo si el store está disponible
  const count = activeItems
    ? Object.values(activeItems).reduce((acc: number, item: CartItem) => acc + item.quantity, 0)
    : 0;

  return (
    <button
      onClick={() => window.dispatchEvent(new CustomEvent('open-cart'))}
      className="relative p-2 text-gray-600 hover:text-primary dark:text-gray-300 transition-colors"
      aria-label="Abrir carrito"
    >
      <FaShoppingCart size={24} />
      {mounted && count > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
          {count}
        </span>
      )}
    </button>
  );
}