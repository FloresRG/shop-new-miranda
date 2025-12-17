import React, { useEffect, useState } from 'react';
import { useStore } from '@nanostores/react';
import { cartItems, removeCartItem, updateQuantity, clearCart } from '../../store/cartStore';
import type { CartStore, CartItem } from '../../store/cartStore';
import { FaTrash, FaMinus, FaPlus, FaTimes } from 'react-icons/fa';

export default function CartModal() {
    const $cartItems = useStore(cartItems) as CartStore | undefined;
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const handleOpen = () => setIsOpen(true);
        window.addEventListener('open-cart', handleOpen);
        return () => window.removeEventListener('open-cart', handleOpen);
    }, []);

    const items: CartItem[] = $cartItems ? Object.values($cartItems) : [];

    // Parseo seguro de precios
    const total = items.reduce((sum, item) => {
        const price = parseFloat(item.precio) || 0;
        return sum + (price * item.quantity);
    }, 0);

    const tax = total * 0.15;
    const finalTotal = total + tax;

    const handleCheckout = () => {
        const confirm = window.confirm("¿Confirmar compra?");
        if (confirm) {
            alert("¡Compra realizada con éxito!");
            clearCart();
            setIsOpen(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                onClick={() => setIsOpen(false)}
            />

            <div className="relative w-full max-w-md bg-white dark:bg-darkmode-theme-dark h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-darkmode-theme-light">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        Carrito de Compras
                        <span className="text-sm font-normal text-gray-500">({items.length} items)</span>
                    </h2>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
                    >
                        <FaTimes />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {items.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-500">
                            <p>Tu carrito está vacío</p>
                            <button onClick={() => setIsOpen(false)} className="mt-4 text-primary underline">Volver a la tienda</button>
                        </div>
                    ) : (
                        items.map((item) => {
                            const price = parseFloat(item.precio) || 0;
                            const maxStock = item.inventario?.cantidad ?? 0;

                            return (
                                <div key={item.id} className="flex gap-4 p-3 bg-gray-50 dark:bg-darkmode-theme-light rounded-lg border border-gray-100 dark:border-gray-700">
                                    <img src={item.fotos[0]?.foto || 'https://placehold.co/100'} alt={item.nombre} className="w-20 h-20 object-cover rounded-md" />
                                    <div className="flex-1 flex flex-col justify-between">
                                        <div>
                                            <h4 className="font-semibold line-clamp-1 text-sm">{item.nombre}</h4>
                                            <p className="text-xs text-gray-500">{item.marca.marca}</p>
                                        </div>
                                        <div className="flex justify-between items-end mt-2">
                                            <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-md border dark:border-gray-600">
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                    className="px-2 py-1 text-xs hover:bg-gray-100 dark:hover:bg-gray-700"
                                                >
                                                    <FaMinus size={10} />
                                                </button>
                                                <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                    className="px-2 py-1 text-xs hover:bg-gray-100 dark:hover:bg-gray-700"
                                                    disabled={item.quantity >= maxStock}
                                                >
                                                    <FaPlus size={10} />
                                                </button>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-primary">${(price * item.quantity).toFixed(2)}</p>
                                                <button onClick={() => removeCartItem(item.id)} className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 justify-end mt-1">
                                                    <FaTrash size={10} /> Quitar
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {items.length > 0 && (
                    <div className="p-4 border-t dark:border-gray-700 bg-gray-50 dark:bg-darkmode-theme-light space-y-3">
                        <div className="flex justify-between text-sm">
                            <span>Subtotal</span>
                            <span>${total.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span>Impuestos (15%)</span>
                            <span>${tax.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-xl font-bold pt-2 border-t dark:border-gray-600">
                            <span>Total</span>
                            <span>${finalTotal.toFixed(2)}</span>
                        </div>

                        <button
                            onClick={handleCheckout}
                            className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all transform active:scale-95"
                        >
                            Finalizar Compra
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
