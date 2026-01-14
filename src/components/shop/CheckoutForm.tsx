import React, { useState } from "react";
import { useStore } from "@nanostores/react";
import { cartItems, clearCart, updateQuantity, removeCartItem } from "../../store/cartStore";
import type { CartStore } from "../../store/cartStore";
import axios from "axios";
import { jsPDF } from "jspdf";
import { FaUser, FaIdCard, FaPhone, FaMapMarkerAlt, FaMinus, FaPlus, FaTrash, FaCheckCircle, FaShoppingCart, FaCity } from "react-icons/fa";
import toast from "react-hot-toast";

// 🔹 AÑADIDO: Objeto de departamentos y provincias
const departamentos = {
  "Santa Cruz": ["Santa Cruz", "Montero", "Camiri", "Zona Norte"],
  "La Paz": [
    "La Paz (Ciudad)",
    "El Alto",
    "Viacha",
    "Caranavi",
    "Achacachi",
    "Recojo en tienda"
  ],
  Cochabamba: ["Cochabamba", "Quillacollo", "Sacaba", "Zona Norte"],
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

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [pedidoId, setPedidoId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    nombre: "",
    ci: "",
    celular: "",
    departamento: "",
    provincia: "",
  });

  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  // 🔹 MODIFICADO: handleChange ahora maneja el cambio de departamento
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
    if (!formData.nombre.trim()) {
      errors.nombre = "Por favor, ingrese su nombre.";
    } else if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(formData.nombre.trim())) {
      errors.nombre = "El nombre solo puede contener letras y espacios.";
    }
    if (!formData.ci.trim())
      errors.ci = "Por favor, ingrese su cédula de identidad.";
    if (!formData.celular.trim()) {
      errors.celular = "Por favor, ingrese su número de celular.";
    } else if (formData.celular.length !== 8) {
      errors.celular = "El número debe tener 8 dígitos.";
    } else if (!/^[67]/.test(formData.celular)) {
      errors.celular = "El número debe comenzar con 6 o 7.";
    }
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
    } else {
      const firstError = Object.values(formErrors)[0];
      toast.error(firstError || "Complete todos los campos requeridos.");
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
        "https://importadoramiranda.com/api/shoppedidos",
        apiFormData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );

      const pedidoNumero = apiResponse.data.pedido_id || apiResponse.data.message || "Pedido Registrado";
      setPedidoId(pedidoNumero);

      // WhatsApp (como solicitó el usuario en su última instrucción funcional antes del merge)
      const mensaje = `Hola, me pongo en contacto para informarles que mi pedido es el número: #${pedidoNumero}.\n\nAgradezco su atención y quedo atento(a) a su confirmación respecto a este pedido.`;
      window.open(
        `https://wa.me/59170621016?text=${encodeURIComponent(mensaje)}`,
        "_blank",
      );

      setIsSubmitting(false);
      setIsSuccess(true);
      clearCart();
    } catch (error) {
      console.error("Error al enviar el pedido:", error);
      setIsSubmitting(false);
      toast.error("Hubo un error al procesar su pedido. Por favor intente nuevamente.");
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 w-full max-w-full overflow-hidden">
      {/* Resumen de Orden */}
      <div className="w-full lg:w-5/12 order-1 flex flex-col">
        <div className="bg-white dark:bg-darkmode-light rounded-2xl shadow-xl border-2 border-primary/10 dark:border-primary/5 overflow-hidden">
          <div className="p-6 border-b-2 border-primary/20 bg-primary/5 dark:bg-primary/10">
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
                        ? (item.fotos[0].foto.startsWith("http") ? item.fotos[0].foto : `${import.meta.env.PUBLIC_API_URL}/storage/${item.fotos[0].foto}`)
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

                    <div className="flex-1 w-full ml-4">
                      <p className="font-black text-primary text-sm whitespace-nowrap">
                        Bs {(parseFloat(item.precio) * item.quantity).toFixed(2)}
                      </p>
                    </div>
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

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="w-full lg:w-7/12 order-2 flex flex-col space-y-6">
        <div className="bg-white dark:bg-darkmode-light rounded-2xl shadow-xl border-2 border-gray-100/80 dark:border-darkmode-border/30 p-5 md:p-8">
          <div className="text-center mb-8 border-b-2 border-primary/10 pb-6">
            <h3 className="text-2xl font-black text-gray-900 dark:text-white flex items-center justify-center gap-3">
              <FaCheckCircle className="text-primary" />
              Datos de Envío
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Complete sus datos para procesar su orden de compra</p>
          </div>

          <div className="flex flex-col space-y-6">
            <div className="w-full">
              <label className="text-base md:text-sm font-black text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                <FaUser className="text-primary text-xs" />
                NOMBRE COMPLETO
              </label>
              <input
                required
                type="text"
                name="nombre"
                placeholder="EJ: JUAN PEREZ"
                value={formData.nombre}
                onChange={handleChange}
                className="w-full px-4 py-4 md:py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all bg-white dark:bg-darkmode-body text-base md:text-sm text-gray-900 dark:text-white placeholder-gray-400 font-medium"
              />
              {formErrors.nombre && (
                <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                  <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                  {formErrors.nombre}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-6">
              <div>
                <label className="text-base md:text-sm font-black text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  <FaIdCard className="text-primary text-xs" />
                  NRO. CARNET (C.I.)
                </label>
                <input
                  required
                  type="text"
                  name="ci"
                  placeholder="EJ: 1234567 LP"
                  value={formData.ci}
                  onChange={handleChange}
                  className="w-full px-4 py-4 md:py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all bg-white dark:bg-darkmode-body text-base md:text-sm text-gray-900 dark:text-white font-medium"
                />
                {formErrors.ci && (
                  <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                    <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                    {formErrors.ci}
                  </p>
                )}
              </div>

              <div>
                <label className="text-base md:text-sm font-black text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  <FaPhone className="text-primary text-xs" />
                  CELULAR / WHATSAPP
                </label>
                <input
                  required
                  type="tel"
                  name="celular"
                  placeholder="EJ: 70621016"
                  value={formData.celular}
                  onChange={(e) => {
                    let value = e.target.value.replace(/\D/g, "");
                    if (value.length > 8) value = value.slice(0, 8);
                    if (value.length === 1 && !["6", "7"].includes(value)) {
                      value = "";
                    }
                    setFormData((prev) => ({ ...prev, celular: value }));
                  }}
                  className="w-full px-4 py-4 md:py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all bg-white dark:bg-darkmode-body text-base md:text-sm text-gray-900 dark:text-white font-medium"
                />
                {formErrors.celular && (
                  <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                    <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                    {formErrors.celular}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <div>
                <label className="text-base md:text-sm font-black text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  <FaMapMarkerAlt className="text-primary text-xs" />
                  DEPARTAMENTO
                </label>
                <select
                  required
                  name="departamento"
                  value={formData.departamento}
                  onChange={handleChange}
                  className="w-full px-4 py-4 md:py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all bg-white dark:bg-darkmode-body text-base md:text-sm text-gray-900 dark:text-white appearance-none cursor-pointer font-medium"
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
                <div className="flex-1 w-full">
                  <label className="text-base md:text-sm font-black text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                    <FaCity className="text-primary text-xs" />
                    PROVINCIA / CIUDAD
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {(departamentos[formData.departamento as keyof typeof departamentos] || []).map((prov) => (
                      <button
                        key={prov}
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, provincia: prov })
                        }
                        className={`flex-1 min-w-[140px] px-4 py-4 border-2 rounded-xl text-xs md:text-[11px] font-black transition-all transform hover:scale-[1.03] active:scale-95 flex items-center justify-center text-center leading-tight ${formData.provincia === prov
                          ? "bg-linear-to-r from-primary to-[#F20505] text-white border-transparent shadow-lg"
                          : "bg-white dark:bg-darkmode-body border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-primary/50"
                          }`}
                      >
                        {prov.toUpperCase()}
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
                Al confirmar, nuestro encargado verificará la disponibilidad física de los productos y se contactará con usted.
              </p>
            </div>
          </div>
        </div>
      </form>

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
