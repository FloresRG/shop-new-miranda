import React, { useState } from 'react';
import { useStore } from '@nanostores/react';
import { cartItems, clearCart } from '../../store/cartStore';
import type { CartStore } from '../../store/cartStore';

export default function CheckoutForm() {
    const $cartItems = useStore(cartItems) as CartStore | undefined;
    const items = $cartItems ? Object.values($cartItems) : [];

    const total = items.reduce((sum, item) => {
        const price = parseFloat(item.precio) || 0;
        return sum + price * item.quantity;
    }, 0);

    const [formData, setFormData] = useState({
        nombre: '',
        ci: '',
        celular: '',
        direccion: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Simulando delay de API
        setTimeout(() => {
            clearCart();
            window.location.href = "/success";
        }, 1000);
    };

    if (items.length === 0) {
        return (
            <div className="text-center py-10">
                <p className="text-xl mb-4">Tu carrito está vacío.</p>
                <a href="/tienda" className="text-primary hover:underline">Volver a la tienda</a>
            </div>
        );
    }

    return (
        <div className="grid md:grid-cols-2 gap-8">
            {/* Resumen de Orden */}
            <div>
                <h3 className="text-xl font-bold mb-4">Resumen de Orden</h3>
                <div className="space-y-4 max-h-80 overflow-y-auto pr-2 custom-scrollbar border p-4 rounded-md dark:border-gray-700">
                    {items.map(item => (
                        <div key={item.id} className="flex gap-4 items-center">
                            <img
                                src={item.fotos[0]?.foto ? `${import.meta.env.PUBLIC_API_URL}/storage/${item.fotos[0].foto}` : 'https://placehold.co/100'}
                                className="w-16 h-16 object-cover rounded bg-gray-100"
                                alt={item.nombre}
                            />
                            <div className="flex-1">
                                <p className="text-sm font-bold line-clamp-1">{item.nombre}</p>
                                <p className="text-xs text-gray-500">Cantidad: {item.quantity}</p>
                            </div>
                            <p className="font-semibold text-primary">${(parseFloat(item.precio) * item.quantity).toFixed(2)}</p>
                        </div>
                    ))}
                </div>
                <div className="mt-4 pt-4 border-t dark:border-gray-700 space-y-2">
                    <div className="flex justify-between">
                        <span>Total Productos</span>
                        <span className="font-bold">${total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-500">
                        <span>Envío</span>
                        <span>Por calcular</span>
                    </div>
                    <div className="flex justify-between text-2xl font-bold text-primary pt-2">
                        <span>Total Aprox.</span>
                        <span>${total.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="text-xl font-bold mb-4">Datos de Envío</h3>

                <div>
                    <label className="block text-sm font-medium mb-1">Nombre Completo</label>
                    <input
                        required
                        type="text"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleChange}
                        className="w-full p-2 border rounded dark:bg-darkmode-body dark:border-gray-700"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Cedula de Identidad</label>
                    <input
                        required
                        type="text"
                        name="ci"
                        value={formData.ci}
                        onChange={handleChange}
                        className="w-full p-2 border rounded dark:bg-darkmode-body dark:border-gray-700"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Celular / WhatsApp</label>
                    <input
                        required
                        type="text"
                        name="celular"
                        value={formData.celular}
                        onChange={handleChange}
                        className="w-full p-2 border rounded dark:bg-darkmode-body dark:border-gray-700"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Dirección de Entrega</label>
                    <textarea
                        required
                        name="direccion"
                        value={formData.direccion}
                        onChange={handleChange}
                        className="w-full p-2 border rounded dark:bg-darkmode-body dark:border-gray-700 h-24"
                    ></textarea>
                </div>

                <button
                    type="submit"
                    className="w-full btn btn-primary py-3 rounded-lg font-bold mt-4 shadow-lg hover:shadow-xl transition-all"
                >
                    Confirmar Pedido
                </button>
            </form>
        </div>
    );
}
