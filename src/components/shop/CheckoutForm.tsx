import React, { useState } from "react";
import { useStore } from "@nanostores/react";
import { cartItems, clearCart, updateQuantity, removeCartItem } from "../../store/cartStore";
import type { CartStore } from "../../store/cartStore";
import axios from "axios";
import { jsPDF } from "jspdf";
import { FaUser, FaIdCard, FaPhone, FaMapMarkerAlt, FaMinus, FaPlus, FaTrash, FaCheckCircle, FaShoppingCart, FaCity } from "react-icons/fa";

const departamentos = {
  "Santa Cruz": ["Santa Cruz", "Montero", "Camiri", "Zona Norte"],

  Cochabamba: ["Cochabamba", "Quillacollo", "Beijing", "Sacaba", "Zona Norte"],
  Potosí: ["Potosi", "Tupiza", "Villazón", "Uyuni", "Llallagua"],
  Oruro: ["Oruro"],
  Chuquisaca: ["Sucre"],
  Tarija: ["Tarija", "Yacuiba", "Villa Montes", "Bermejo", "Camargo"],
  Beni: [
    "Trinidad",
    "Riberalta",
    "Guayaramerín",
    "San Borja",
    "Santa Rosa",
    "Santa Ana del Yacuma",
    "Rurrenabaque",
  ],
  Pando: ["Cobija", "Puerto Rosa", "Puerto Cena", "Puerto Rico"],
};

export default function CheckoutForm() {
  const $cartItems = useStore(cartItems) as CartStore | undefined;
  const items = $cartItems ? Object.values($cartItems) : [];

  const total = items.reduce((sum, item) => {
    const price = parseFloat(item.precio) || 0;
    return sum + price * item.quantity;
  }, 0);

  const [formData, setFormData] = useState({
    nombre: "",
    ci: "",
    celular: "",
    departamento: "",
    provincia: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [pedidoId, setPedidoId] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    let { name, value } = e.target;

    if (name === "nombre") value = value.toUpperCase();
    if (name === "ci") value = value.toUpperCase();

    setFormData({ ...formData, [name]: value });

    if (name === "departamento") {
      setFormData((prev) => ({ ...prev, provincia: "" }));
    }
  };

  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};
    if (!formData.nombre.trim())
      errors.nombre = "Por favor, ingrese su nombre.";
    if (!formData.ci.trim())
      errors.ci = "Por favor, ingrese su cédula de identidad.";
    if (!formData.celular.trim())
      errors.celular = "Por favor, ingrese su número de celular.";
    if (!formData.departamento.trim())
      errors.departamento = "Por favor, seleccione un departamento.";
    if (!formData.provincia.trim())
      errors.provincia = "Por favor, seleccione una provincia o ciudad.";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      await sendOrderToAPI();
    }
  };

  const sendOrderToAPI = async () => {
    try {
      setIsSubmitting(true);
      const apiFormData = new FormData();
      apiFormData.append("nombre", formData.nombre);
      apiFormData.append("ci", formData.ci);
      apiFormData.append("celular", formData.celular);
      apiFormData.append("destino", `${formData.departamento} - ${formData.provincia}`);
      apiFormData.append("direccion", "Sin direccion");
      apiFormData.append("estado", "POR COBRAR");
      apiFormData.append("cantidad_productos", items.length.toString());
      apiFormData.append("detalle", "Pedido desde Checkout Web (Premium)");
      apiFormData.append("productos", JSON.stringify(items.map(i => ({ id: i.id, quantity: i.quantity }))));
      apiFormData.append("monto_deposito", "0");
      apiFormData.append("monto_enviado_pagado", total.toString());
      apiFormData.append("id_usuario", "0");

      const apiResponse = await axios.post(
        "https://test.importadoramiranda.com/api/pedidos/lupenuevo",
        apiFormData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );

      const pedidoNumero = apiResponse.data.message;
      setPedidoId(pedidoNumero);
      generatePDF(pedidoNumero);
      // Eliminar redirección a WhatsApp a petición del usuario
      // handleRedirectToWhatsApp(pedidoNumero);

      setIsSubmitting(false);
      setIsSuccess(true);
      clearCart();
    } catch (error) {
      console.error("Error al enviar el pedido:", error);
      setIsSubmitting(false);
      alert("Hubo un error al procesar su pedido. Por favor intente nuevamente.");
    }
  };

  const generatePDF = (pedidoMessage: string): void => {
    const date = new Date().toLocaleString();
    const doc = new jsPDF();

    doc.setFillColor(128, 0, 128);
    doc.rect(10, 10, 190, 15, "F");
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.text("CONFIRMACIÓN DE COMPRA", 105, 20, { align: "center" });

    doc.setFontSize(12);
    doc.setTextColor(80, 80, 80);
    doc.text(`Fecha y Hora: ${date}`, 10, 30);

    doc.setFillColor(230, 230, 250);
    doc.rect(10, 35, 190, 10, "F");
    doc.setFontSize(12);
    doc.setTextColor(75, 0, 130);
    doc.text("DETALLES DEL CLIENTE", 105, 42, { align: "center" });

    doc.setTextColor(50, 50, 50);
    doc.text(`Número de Pedido: ${pedidoMessage}`, 10, 50);
    doc.text(`Nombre: ${formData.nombre}`, 10, 60);
    doc.text(`CI: ${formData.ci}`, 10, 70);
    doc.text(`Celular: ${formData.celular}`, 10, 80);

    doc.setFillColor(230, 230, 250);
    doc.rect(10, 95, 190, 10, "F");
    doc.setFontSize(12);
    doc.setTextColor(75, 0, 130);
    doc.text("INFORMACIÓN DE ENVÍO", 105, 102, { align: "center" });

    doc.setTextColor(50, 50, 50);
    doc.text(`Destino: ${formData.departamento} - ${formData.provincia}`, 10, 110);

    doc.setFontSize(14);
    doc.setTextColor(128, 0, 128);
    doc.text(
      "Para confirmar completamente el pedido y saber más detalles,",
      10,
      130,
      { maxWidth: 190 },
    );
    doc.text("envíe un mensaje a nuestro WhatsApp.", 10, 140, {
      maxWidth: 190,
    });

    doc.setFontSize(16);
    doc.setTextColor(75, 0, 130);
    doc.text("WhatsApp: +591 70621016", 105, 155, { align: "center" });

    doc.save(`Confirmación_de_Compra_${pedidoMessage}.pdf`);
  };

  if (items.length === 0 && !isSuccess) {
    return (
      <div className="text-center py-20 bg-white dark:bg-darkmode-light rounded-3xl border border-gray-100 dark:border-darkmode-border shadow-xl">
        <div className="w-20 h-20 bg-gray-100 dark:bg-darkmode-body rounded-full flex items-center justify-center mx-auto mb-6">
          <FaShoppingCart className="text-3xl text-gray-400" />
        </div>
        <p className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
          Tu carrito está vacío.
        </p>
        <p className="text-gray-500 dark:text-gray-400 mb-8">¿No sabes qué comprar? ¡Mira nuestras novedades!</p>
        <a href="/tienda" className="btn btn-primary px-8 py-3 rounded-xl font-bold">
          Volver a la tienda
        </a>
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">
      {/* Resumen de Orden - Now naturally first in DOM, so first on mobile */}
      <div className="lg:col-span-5 order-1">
        <div className="bg-white dark:bg-darkmode-light rounded-2xl shadow-xl border border-gray-100 dark:border-darkmode-border overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-darkmode-border bg-gray-50 dark:bg-darkmode-body">
            <h3 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
              <FaShoppingCart className="text-primary" />
              Resumen de Orden
            </h3>
          </div>

          <div className="p-6 space-y-6 max-h-[500px] overflow-y-auto custom-scrollbar">
            {items.map((item) => (
              <div key={item.id} className="flex gap-4 items-center group">
                <div className="relative w-20 h-20 shrink-0">
                  <img
                    src={
                      item.fotos?.[0]?.foto
                        ? `${import.meta.env.PUBLIC_API_URL}/storage/${item.fotos[0].foto}`
                        : (item as any).foto_principal
                          ? `${import.meta.env.PUBLIC_API_URL}/storage/${(item as any).foto_principal}`
                          : "https://placehold.co/100"
                    }
                    className="w-full h-full object-cover rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-100 dark:border-darkmode-border group-hover:scale-105 transition-transform duration-300"
                    alt={item.nombre}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 dark:text-white line-clamp-2 leading-tight mb-2">
                    {item.nombre}
                  </p>

                  <div className="flex items-center justify-between">
                    {/* Controles de Cantidad */}
                    <div className="flex items-center gap-3 bg-gray-50 dark:bg-darkmode-body rounded-lg p-1 border border-gray-100 dark:border-darkmode-border">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-6 h-6 flex items-center justify-center bg-white dark:bg-gray-700 rounded-md shadow-sm text-[10px] hover:text-primary transition-colors border border-gray-100 dark:border-gray-600"
                      >
                        <FaMinus />
                      </button>
                      <span className="text-xs font-bold w-5 text-center text-gray-900 dark:text-white">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-6 h-6 flex items-center justify-center bg-white dark:bg-gray-700 rounded-md shadow-sm text-[10px] hover:text-primary transition-colors border border-gray-100 dark:border-gray-600"
                      >
                        <FaPlus />
                      </button>
                    </div>

                    <p className="font-black text-primary text-sm whitespace-nowrap">
                      Bs {(parseFloat(item.precio) * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => removeCartItem(item.id)}
                  className="p-2 text-gray-300 hover:text-red-500 transition-colors shadow-none"
                  title="Eliminar item"
                >
                  <FaTrash size={14} />
                </button>
              </div>
            ))}
          </div>

          <div className="p-6 bg-gray-50 dark:bg-darkmode-body border-t border-gray-100 dark:border-darkmode-border space-y-3">
            <div className="flex justify-between items-center text-gray-500 dark:text-gray-400">
              <span className="text-sm font-medium">Subtotal</span>
              <span className="text-sm font-bold">Bs {total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-2xl font-black text-primary pt-2">
              <span>Total</span>
              <span>Bs {total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Formulario - Now naturally second in DOM, so second on mobile */}
      <form onSubmit={handleSubmit} className="lg:col-span-7 order-2 space-y-6">
        <div className="bg-white dark:bg-darkmode-light rounded-2xl shadow-xl border border-gray-100 dark:border-darkmode-border p-5 md:p-8">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-black text-gray-900 dark:text-white flex items-center justify-center gap-3">
              <FaCheckCircle className="text-primary" />
              Datos de Envío
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Complete sus datos para procesar su orden de compra</p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="text-sm font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                <FaUser className="text-primary text-xs" />
                Nombre Completo
              </label>
              <input
                required
                type="text"
                name="nombre"
                placeholder="EJ: JUAN PEREZ"
                value={formData.nombre}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-100 dark:border-darkmode-border rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all bg-gray-50 dark:bg-darkmode-body text-gray-900 dark:text-white placeholder-gray-400"
              />
              {formErrors.nombre && (
                <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                  <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                  {formErrors.nombre}
                </p>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  <FaIdCard className="text-primary text-xs" />
                  Cédula de Identidad
                </label>
                <input
                  required
                  type="text"
                  name="ci"
                  placeholder="EJ: 1234567 LP"
                  value={formData.ci}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-100 dark:border-darkmode-border rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all bg-gray-50 dark:bg-darkmode-body text-gray-900 dark:text-white"
                />
                {formErrors.ci && (
                  <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                    <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                    {formErrors.ci}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  <FaPhone className="text-primary text-xs" />
                  Celular / WhatsApp
                </label>
                <input
                  required
                  type="tel"
                  name="celular"
                  placeholder="EJ: 70621016"
                  value={formData.celular}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-100 dark:border-darkmode-border rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all bg-gray-50 dark:bg-darkmode-body text-gray-900 dark:text-white"
                />
                {formErrors.celular && (
                  <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                    <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                    {formErrors.celular}
                  </p>
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  <FaMapMarkerAlt className="text-primary text-xs" />
                  Departamento
                </label>
                <select
                  required
                  name="departamento"
                  value={formData.departamento}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-100 dark:border-darkmode-border rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all bg-gray-50 dark:bg-darkmode-body text-gray-900 dark:text-white appearance-none cursor-pointer"
                >
                  <option value="">Seleccione...</option>
                  {Object.keys(departamentos).map((dep) => (
                    <option key={dep} value={dep}>
                      {dep}
                    </option>
                  ))}
                </select>
                {formErrors.departamento && (
                  <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                    <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                    {formErrors.departamento}
                  </p>
                )}
              </div>

              {formData.departamento && (
                <div>
                  <label className="text-sm font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                    <FaCity className="text-primary text-xs" />
                    Provincia / Ciudad
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(departamentos[formData.departamento as keyof typeof departamentos] || []).map((prov) => (
                      <button
                        key={prov}
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, provincia: prov })
                        }
                        className={`px-3 py-2 border-2 rounded-xl text-xs font-bold transition-all transform hover:scale-[1.03] active:scale-95 ${formData.provincia === prov
                            ? "bg-linear-to-r from-primary to-[#F20505] text-white border-transparent shadow-md"
                            : "bg-gray-50 dark:bg-darkmode-body border-gray-100 dark:border-darkmode-border text-gray-600 dark:text-gray-400 hover:border-primary/30"
                          }`}
                      >
                        {prov}
                      </button>
                    ))}
                  </div>
                  {formErrors.provincia && (
                    <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                      <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                      {formErrors.provincia}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-linear-to-r from-primary to-[#FF0040] text-white py-4 rounded-xl font-black text-lg shadow-xl shadow-primary/30 hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all transform flex items-center justify-center gap-3 uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Procesando Pedido..." : "Confirmar y Finalizar Pedido"}
              </button>
              <p className="text-[10px] text-center text-gray-400 mt-4 px-4">
                Al confirmar, se generará su comprobante digital y nuestro personal verificará la disponibilidad física de los productos.
              </p>
            </div>
          </div>
        </div>
      </form>

      {/* Modal de Carga */}
      {isSubmitting && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <div className="bg-white dark:bg-darkmode-light rounded-3xl shadow-2xl p-10 flex flex-col items-center max-w-sm w-full mx-4 border border-white/20">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-6"></div>
            <p className="text-gray-900 dark:text-white font-black text-xl text-center">
              Procesando su Pedido
            </p>
            <p className="text-gray-500 dark:text-gray-400 text-sm text-center mt-2">
              Estamos registrando su información en nuestro sistema...
            </p>
          </div>
        </div>
      )}

      {/* Modal de Éxito */}
      {isSuccess && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <div className="bg-white dark:bg-darkmode-light rounded-3xl shadow-2xl p-10 flex flex-col items-center max-w-md w-full mx-4 text-center border border-white/20">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6 text-green-500 dark:text-green-400 animate-bounce">
              <FaCheckCircle size={40} />
            </div>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2 uppercase">
              ¡Pedido Registrado!
            </h3>
            <p className="text-primary font-black text-lg mb-4">
              Orden: #{pedidoId}
            </p>
            <div className="space-y-4 mb-8">
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                Su pedido ha sido enviado con éxito a nuestro centro de logística.
              </p>
              <div className="bg-gray-50 dark:bg-darkmode-body p-4 rounded-2xl border border-gray-100 dark:border-darkmode-border">
                <p className="text-xs font-bold text-gray-700 dark:text-gray-200">
                  <span className="text-primary">IMPORTANTE:</span> Nuestro encargado de pedidos verificará físicamente si todos tus productos están disponibles.
                  <strong> Por favor, espera nuestra confirmación antes de realizar el pago.</strong>
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setIsSuccess(false);
                window.location.href = "/";
              }}
              className="w-full bg-primary text-white py-4 rounded-xl font-black text-lg shadow-lg hover:shadow-xl transition-all uppercase tracking-widest"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
