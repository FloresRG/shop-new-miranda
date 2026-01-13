import React, { useState } from "react";
import { useStore } from "@nanostores/react";
import { cartItems, clearCart } from "../../store/cartStore";
import type { CartStore } from "../../store/cartStore";
import axios from "axios";
import toast from "react-hot-toast";

// 🔹 AÑADIDO: Objeto de departamentos y provincias
const departamentos = {
  "Santa Cruz": ["Santa Cruz", "Montero", "Camiri", "Zona Norte"],
  "La Paz": [
    "Caranavi",
    "Recojo en tienda",
    "Palos blancos",
    "Mapiri",
    "Guanay",
    "Riveralta",
    "Coripata",
    "Asunta",
  ],
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

  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // 🔹 Estado para loader
  const [contactId, setContactId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    nombre: "",
    ci: "",
    celular: "",
    departamento: "",
    provincia: "",
  });

  // 🔹 AÑADIDO: Estado para provincias dinámicas
  const [provincias, setProvincias] = useState<string[]>([]);

  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  // 🔹 MODIFICADO: handleChange ahora maneja el cambio de departamento
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;

    let processedValue = value;

    if (name === "nombre") {
      // Solo letras, espacios, tildes y ñ (sin números ni símbolos)
      processedValue = value
        .replace(/[^a-zA-ZÀ-ÿ\s]/g, "") // Elimina caracteres no permitidos
        .toUpperCase(); // Convierte a mayúsculas
    } else if (name === "ci") {
      // Permite letras, números y guiones (común en CIs bolivianas)
      processedValue = value
        .replace(/[^a-zA-Z0-9\-]/g, "") // Solo alfanumérico y guion
        .toUpperCase(); // Asegura mayúsculas
    }

    setFormData((prev) => ({ ...prev, [name]: processedValue }));

    if (name === "departamento") {
      const nuevasProvincias =
        departamentos[value as keyof typeof departamentos] || [];
      setProvincias(nuevasProvincias);
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
      errors.provincia = "Por favor, seleccione una provincia.";
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
    setIsSubmitting(true); // 🔹 Activar loader
    try {
      const data = {
        nombre: formData.nombre,
        ci: formData.ci,
        celular: formData.celular,
        departamento: formData.departamento,
        provincia: formData.provincia,
        tipo: "pedido",
        estado: "liquidacion",
        productos: items.map((item) => ({
          producto_id: item.id,
          cantidad: item.quantity,
          precio_venta: parseFloat(item.precio),
        })),
      };

      const apiResponse = await axios.post(
        "https://importadoramiranda.com/api/shoppedidos",
        data,
        { headers: { "Content-Type": "application/json" } },
      );

      const pedidoId =
        apiResponse.data.pedido_id ||
        apiResponse.data.data?.id?.toString() ||
        "ID no disponible";
      setContactId(pedidoId);
      setIsSuccess(true);
      clearCart();

      // Descargar PDF si está disponible
      const pdfBase64 = apiResponse.data.pdf_base64;
      if (pdfBase64) {
        try {
          const byteString = atob(pdfBase64);
          const arrayBuffer = new ArrayBuffer(byteString.length);
          const uint8Array = new Uint8Array(arrayBuffer);
          for (let i = 0; i < byteString.length; i++) {
            uint8Array[i] = byteString.charCodeAt(i);
          }
          const blob = new Blob([uint8Array], { type: "application/pdf" });
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = `pedido_${pedidoId}.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        } catch (err) {
          console.error("Error al procesar el PDF:", err);
          toast.error("No se pudo generar el comprobante.");
        }
      }

      // WhatsApp
      const mensaje = `Hola, me pongo en contacto para informarles que mi pedido es el número: #${pedidoId}.\n\nAgradezco su atención y quedo atento(a) a su confirmación respecto a este pedido.`;
      window.open(
        `https://wa.me/59170621016?text=${encodeURIComponent(mensaje)}`,
        "_blank",
      );
    } catch (error: any) {
      console.error("Error al enviar el pedido:", error);
      toast.error(
        error?.response?.data?.message ||
          "Hubo un error al registrar tu pedido. Inténtalo nuevamente.",
      );
    } finally {
      setIsSubmitting(false); // 🔹 Siempre desactivar loader
    }
  };

  return (
    <>
      {isSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-darkmode-light rounded-2xl shadow-2xl p-8 flex flex-col items-center max-w-sm w-full mx-4 text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4 text-green-500 dark:text-green-400">
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              ¡Pedido Enviado!
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Su pedido{" "}
              <span className="font-bold text-primary">#{contactId}</span> ha
              sido registrado. Un encargado se comunicará con usted pronto para confirmar su pedido  se le enviar un QR al numero que ingreso para realizar el pago
            </p>
            <button
              onClick={() => setIsSuccess(false)}
              className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-red-700 transition-colors"
            >
              Aceptar
            </button>
          </div>
        </div>
      )}

      {items.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-xl mb-4 text-gray-900 dark:text-white">
            Tu carrito está vacío.
          </p>
          <a href="/tienda" className="text-primary hover:underline">
            Volver a la tienda
          </a>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-8">
          {/* Resumen de Orden */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
              Resumen de Orden
            </h3>
            <div className="space-y-4 max-h-80 overflow-y-auto pr-2 custom-scrollbar border p-4 rounded-md dark:bg-darkmode-theme-light dark:border-gray-700">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 items-center">
                  <img
                    src={
                      item.fotos[0]?.foto
                        ? item.fotos[0].foto.startsWith("http")
                          ? item.fotos[0].foto
                          : `${import.meta.env.PUBLIC_API_URL}/storage/${item.fotos[0].foto}`
                        : "https://placehold.co/100"
                    }
                    className="w-16 h-16 object-cover rounded bg-gray-100 dark:bg-gray-800"
                    alt={item.nombre}
                  />
                  <div className="flex-1">
                    <p className="text-sm font-bold line-clamp-1 text-gray-900 dark:text-white">
                      {item.nombre}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Cantidad: {item.quantity}
                    </p>
                  </div>
                  <p className="font-semibold text-primary">
                    Bs {(parseFloat(item.precio) * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t dark:border-gray-700 space-y-2">
              <div className="flex justify-between text-2xl font-bold text-primary pt-2">
                <span>Total</span>
                <span>Bs {total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
              Datos de Envío
            </h3>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">
                Nombre Completo
              </label>
              <input
                required
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                className="w-full p-2 border rounded dark:bg-darkmode-body dark:border-gray-700"
                placeholder="Ingrese su nombre completo"
              />
              {formErrors.nombre && (
                <p className="text-red-500 text-xs mt-1">{formErrors.nombre}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">
                Cedula de Identidad
              </label>
              <input
                required
                type="text"
                name="ci"
                value={formData.ci}
                onChange={handleChange}
                className="w-full p-2 border rounded dark:bg-darkmode-body dark:border-gray-700"
                placeholder="Ingrese su CI"
              />
              {formErrors.ci && (
                <p className="text-red-500 text-xs mt-1">{formErrors.ci}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">
                Celular / WhatsApp
              </label>
              <input
                required
                type="tel"
                inputMode="numeric"
                maxLength={8}
                value={formData.celular}
                onChange={(e) => {
                  let value = e.target.value.replace(/\D/g, "");
                  if (value.length > 8) value = value.slice(0, 8);
                  if (value.length === 1 && !["6", "7"].includes(value)) {
                    value = "";
                  }
                  setFormData((prev) => ({ ...prev, celular: value }));
                }}
                className="w-full p-2 border rounded dark:bg-darkmode-body dark:border-gray-700"
                placeholder="Ej. 70123456"
              />
              {formErrors.celular && (
                <p className="text-red-500 text-xs mt-1">
                  {formErrors.celular}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">
                Departamento
              </label>
              <select
                required
                name="departamento"
                value={formData.departamento}
                onChange={handleChange}
                className="w-full p-2 border rounded dark:bg-darkmode-body dark:border-gray-700"
              >
                <option value="">Seleccione un departamento</option>
                {Object.keys(departamentos).map((dep) => (
                  <option key={dep} value={dep}>
                    {dep}
                  </option>
                ))}
              </select>
              {formErrors.departamento && (
                <p className="text-red-500 text-xs mt-1">
                  {formErrors.departamento}
                </p>
              )}
            </div>

            {/* 🔹 Reemplazado: Provincia ahora es botones */}
            {formData.departamento && (
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-white">
                  Provincia o Ciudad
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {provincias.map((prov) => (
                    <button
                      key={prov}
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, provincia: prov })
                      }
                      className={`px-3 py-2 text-sm rounded border transition-all ${
                        formData.provincia === prov
                          ? "bg-gradient-to-r from-primary to-[#F20505] text-white border-primary"
                          : "bg-gray-100 dark:bg-darkmode-body border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 hover:border-primary"
                      }`}
                    >
                      {prov}
                    </button>
                  ))}
                </div>
                {formErrors.provincia && (
                  <p className="text-red-500 text-xs mt-1">
                    {formErrors.provincia}
                  </p>
                )}
              </div>
            )}

            {/* 🔹 Botón con loader */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 rounded-lg font-bold mt-4 shadow-lg transition-all ${
                isSubmitting
                  ? "bg-gray-400 cursor-not-allowed"
                  : "btn btn-primary hover:shadow-xl"
              }`}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Enviando...
                </span>
              ) : (
                "Enviar Pedido"
              )}
            </button>
          </form>
        </div>
      )}
    </>
  );
}
