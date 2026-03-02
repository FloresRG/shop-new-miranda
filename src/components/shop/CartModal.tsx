import React, { useEffect, useState } from "react";
import { useStore } from "@nanostores/react";
import {
  cartItems,
  wholesaleCartItems,
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

interface CartModalProps {
  bannerImages?: {
    mobile: string;
    pc: string;
  };
}

export default function CartModal({ bannerImages }: CartModalProps) {
  const $cartItems = useStore(cartItems) as CartStore | undefined;
  const $wholesaleItems = useStore(wholesaleCartItems) as CartStore | undefined;
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener("open-cart", handleOpen);
    return () => window.removeEventListener("open-cart", handleOpen);
  }, []);

  const isWholesaleMode = typeof window !== 'undefined' && window.location.pathname.startsWith('/mayorista');
  const activeItemsStore = isWholesaleMode ? $wholesaleItems : $cartItems;
  const items: CartItem[] = activeItemsStore ? Object.values(activeItemsStore) : [];

  const calculateItemPrice = (item: CartItem) => {
    const q = item.quantity;
    if (item.isWholesale) {
      if (q >= 12 && item.precio_docena) return item.precio_docena;
      if (item.precio_unidad) return item.precio_unidad;
    }
    return parseFloat(item.precio) || 0;
  };

  const total = items.reduce((sum, item) => {
    const price = calculateItemPrice(item);
    return sum + price * item.quantity;
  }, 0);

  const handleCheckout = () => {
    setIsOpen(false);
    const isWholesalePath = typeof window !== 'undefined' && window.location.pathname.startsWith('/mayorista');
    window.location.href = isWholesalePath ? "/mayorista/checkout" : "/checkout";
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
      <div
        className={`relative w-full max-w-md h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 border-l ${isWholesaleMode ? 'border-[#D4AF37]/30 bg-[#0c0c0c] text-white' : 'border-border dark:border-gray-700 bg-white dark:bg-darkmode-body'} ${bannerImages
          ? "bg-[image:var(--bg-mobile)] md:bg-[image:var(--bg-desktop)] bg-cover bg-center bg-no-repeat"
          : ""
          }`}
        style={bannerImages ? ({
          '--bg-mobile': `url('${bannerImages.mobile}')`,
          '--bg-desktop': `url('${bannerImages.pc}')`
        } as React.CSSProperties) : undefined}
      >
        {/* Helper for specific transparency if needed, currently keeping structure */}
        <div className={`p-5 border-b flex justify-between items-center ${isWholesaleMode ? 'border-[#D4AF37]/20 bg-[#111]' : 'border-border dark:border-gray-700 bg-gray-50 dark:bg-gray-800'}`}>
          <h2 className={`text-xl font-bold flex items-center gap-2 font-secondary ${isWholesaleMode ? 'text-[#D4AF37]' : 'text-dark dark:text-white'}`}>
            {isWholesaleMode ? 'Tu Carrito VIP' : 'Tu Carrito'}
            <span className={`text-xs px-2 py-1 rounded-full text-white ${isWholesaleMode ? 'bg-[#D4AF37] text-black' : 'bg-primary'}`}>
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
                  className={`flex gap-4 p-3 rounded-xl border transition-colors group shadow-sm ${isWholesaleMode
                      ? 'bg-[#1a1a1a] border-[#D4AF37]/10 hover:border-[#D4AF37]'
                      : 'bg-white dark:bg-darkmode-light border-border dark:border-gray-700 hover:border-primary'
                    }`}
                >
                  <div className={`w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 ${isWholesaleMode ? 'bg-[#222]' : 'bg-gray-100'}`}>
                    <img
                      src={
                        item.fotos[0]?.foto
                          ? (item.fotos[0].foto.startsWith('http') ? item.fotos[0].foto : `${import.meta.env.PUBLIC_API_URL}/storage/${item.fotos[0].foto}`)
                          : "https://placehold.co/100"
                      }
                      alt={item.nombre}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <h4 className={`font-bold text-sm line-clamp-1 pr-2 ${isWholesaleMode ? 'text-white' : 'text-dark dark:text-white'}`}>
                          {item.nombre}
                        </h4>
                        <button
                          onClick={() => removeCartItem(item.id)}
                          className="text-gray-400 hover:text-danger"
                        >
                          <FaTrash size={14} />
                        </button>
                      </div>
                      <p className={`text-xs font-semibold uppercase tracking-wider mt-1 ${isWholesaleMode ? 'text-[#D4AF37]' : 'text-primary'}`}>
                        {item.marca.marca}
                      </p>
                    </div>

                    <div className="flex justify-between items-end">
                      <div className={`flex items-center gap-3 rounded-lg p-1 ${isWholesaleMode ? 'bg-[#222]' : 'bg-gray-100 dark:bg-gray-800'}`}>
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                          className={`w-6 h-6 flex items-center justify-center rounded shadow-sm text-xs transition-colors ${isWholesaleMode
                              ? 'bg-[#333] text-gray-400 hover:text-[#D4AF37]'
                              : 'bg-white dark:bg-gray-700 hover:text-primary'
                            }`}
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
                          className={`w-6 h-6 flex items-center justify-center rounded shadow-sm text-xs transition-colors ${isWholesaleMode
                              ? 'bg-[#333] text-gray-400 hover:text-[#D4AF37]'
                              : 'bg-white dark:bg-gray-700 hover:text-primary'
                            }`}
                        >
                          <FaPlus />
                        </button>
                      </div>
                      <p className={`font-bold text-lg ${isWholesaleMode ? 'text-[#D4AF37]' : 'text-dark dark:text-white'}`}>
                        Bs{(calculateItemPrice(item) * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {items.length > 0 && (
          <div className={`p-6 border-t ${isWholesaleMode ? 'border-[#D4AF37]/20 bg-[#111]' : 'border-border dark:border-gray-700 bg-gray-50 dark:bg-gray-800'}`}>
            <div className="space-y-2 mb-4">
              <div className={`flex justify-between text-sm ${isWholesaleMode ? 'text-gray-400' : 'text-gray-500 dark:text-gray-400'}`}>
                <span>Subtotal</span>
                <span>Bs{total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xl font-bold">
                <span className={isWholesaleMode ? 'text-white' : 'text-gray-900 dark:text-white'}>Total</span>
                <span className={isWholesaleMode ? 'text-[#D4AF37]' : 'text-gray-900 dark:text-white'}>Bs{total.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              className={`w-full py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 group ${isWholesaleMode
                  ? 'bg-[#D4AF37] text-black shadow-lg shadow-[#D4AF37]/20 hover:scale-[1.02] active:scale-95'
                  : 'btn btn-primary shadow-lg shadow-primary/25 hover:shadow-primary/40'
                }`}
            >
              {isWholesaleMode ? 'Confirmar Pedido VIP' : 'Proceder al Pedido'}{" "}
              <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
