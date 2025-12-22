import React, { useEffect, useState } from "react";
import { useStore } from "@nanostores/react";
import {
  cartItems,
  removeCartItem,
  updateQuantity,
} from "../../store/cartStore";
import type { CartStore, CartItem } from "../../store/cartStore";
import {
  FaTrash,
  FaMinus,
  FaPlus,
  FaTimes,
  FaArrowRight,
} from "react-icons/fa";

export default function CartModal() {
  const $cartItems = useStore(cartItems) as CartStore | undefined;
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener("open-cart", handleOpen);
    return () => window.removeEventListener("open-cart", handleOpen);
  }, []);

  const items: CartItem[] = $cartItems ? Object.values($cartItems) : [];

  const total = items.reduce((sum, item) => {
    const price = parseFloat(item.precio) || 0;
    return sum + price * item.quantity;
  }, 0);

  const handleCheckout = () => {
    setIsOpen(false);
    window.location.href = "/checkout";
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-[2px] transition-opacity"
        onClick={() => setIsOpen(false)}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-md bg-white dark:bg-black h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 border-l border-border dark:border-gray-700">
        <div className="p-5 border-b border-border dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800">
          <h2 className="text-xl font-bold flex items-center gap-2 text-dark dark:text-white font-secondary">
            Tu Carrito
            <span className="text-xs bg-primary text-white px-2 py-1 rounded-full">
              {items.length}
            </span>
          </h2>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-500 dark:text-gray-400"
          >
            <FaTimes size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-4xl">
                🛒
              </div>
              <div>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  Tu carrito está vacío
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  ¿No sabes qué comprar? ¡Mira nuestras novedades!
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="btn btn-primary px-6 rounded-full"
              >
                Seguir comprando
              </button>
            </div>
          ) : (
            items.map((item) => {
              const price = parseFloat(item.precio) || 0;
              return (
                <div
                  key={item.id}
                  className="flex gap-4 p-3 bg-white dark:bg-gray-900 rounded-xl border border-border dark:border-gray-700 hover:border-primary transition-colors group shadow-sm"
                >
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    <img
                      src={
                        item.fotos[0]?.foto
                          ? `${import.meta.env.PUBLIC_API_URL}/storage/${item.fotos[0].foto}`
                          : "https://placehold.co/100"
                      }
                      alt={item.nombre}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-sm text-dark dark:text-white line-clamp-1 pr-2">
                          {item.nombre}
                        </h4>
                        <button
                          onClick={() => removeCartItem(item.id)}
                          className="text-gray-400 hover:text-danger"
                        >
                          <FaTrash size={14} />
                        </button>
                      </div>
                      <p className="text-xs text-primary font-semibold uppercase tracking-wider mt-1">
                        {item.marca.marca}
                      </p>
                    </div>

                    <div className="flex justify-between items-end">
                      <div className="flex items-center gap-3 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                          className="w-6 h-6 flex items-center justify-center bg-white dark:bg-gray-700 rounded shadow-sm text-xs hover:text-primary"
                        >
                          <FaMinus />
                        </button>
                        <span className="text-sm font-bold w-4 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                          className="w-6 h-6 flex items-center justify-center bg-white dark:bg-gray-700 rounded shadow-sm text-xs hover:text-primary"
                        >
                          <FaPlus />
                        </button>
                      </div>
                      <p className="font-bold text-lg text-dark dark:text-white">
                        ${(price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {items.length > 0 && (
          <div className="p-6 border-t border-border dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-gray-500 dark:text-gray-400 text-sm">
                <span>Subtotal</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xl font-bold text-gray-900 dark:text-white">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full btn btn-primary py-4 rounded-xl font-bold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all flex items-center justify-center gap-2 group"
            >
              Proceder al Pago{" "}
              <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
