import React, { useState } from "react";
import { useStore } from "@nanostores/react";
import { cartItems, clearCart } from "../../store/cartStore";
import type { CartStore } from "../../store/cartStore";
import axios from "axios";
import toast from "react-hot-toast";
import { jsPDF } from "jspdf";

export default function CheckoutForm() {
  const $cartItems = useStore(cartItems) as CartStore | undefined;
  const items = $cartItems ? Object.values($cartItems) : [];

  const total = items.reduce((sum, item) => {
    const price = parseFloat(item.precio) || 0;
    return sum + price * item.quantity;
  }, 0);

  const [isSuccess, setIsSuccess] = useState(false);
  const [contactId, setContactId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    nombre: "",
    ci: "",
    celular: "",
    departamento: "",
    provincia: "",
  });

  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
      errors.provincia = "Por favor, seleccione una provincia.";
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
      const data = {
        nombre: formData.nombre,
        ci: formData.ci,
        celular: formData.celular,
        departamento: formData.departamento,
        provincia: formData.provincia,
        tipo: "pedido",
        productos: items.map((item) => ({
          producto_id: item.id,
          cantidad: item.quantity,
          precio_venta: parseFloat(item.precio),
        })),
      };

      console.log('Sending data:', data);

      const apiResponse = await axios.post(
        "http://127.0.0.1:8000/api/shoppedidos",
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

      if (apiResponse.data.whatsapp_connected === false) {
        const mensaje = `Hola, me pongo en contacto para informarles que mi pedido es el número: #${pedidoId}.\n\nAgradezco su atención y quedo atento(a) a su confirmación respecto a este pedido.`;
        window.open(
          `https://wa.me/59170621016?text=${encodeURIComponent(mensaje)}`,
          "_blank",
        );
      }
    } catch (error: any) {
      console.error("Error al enviar el pedido:", error);
      console.log("Validation errors:", error?.response?.data?.errors);
      toast.error(
        error?.response?.data?.message ||
          "Hubo un error al registrar tu pedido. Inténtalo nuevamente.",
      );
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
    doc.text(`Provincia o Departamento: ${formData.departamento}`, 10, 110);

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

  const handleRedirectToWhatsApp = (pedidoMessage: string): void => {
    const mensaje = `Hola, soy ${formData.nombre} y mi número de pedido es ${pedidoMessage}, soy de: ${formData.departamento}. Me gustaría confirmar mi pedido y conocer más detalles.`;
    const enlaceWhatsApp = `https://wa.me/59170621016?text=${encodeURIComponent(
      mensaje,
    )}`;
    window.location.href = enlaceWhatsApp;
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-xl mb-4 text-gray-900 dark:text-white">
          Tu carrito está vacío.
        </p>
        <a href="/tienda" className="text-primary hover:underline">
          Volver a la tienda
        </a>
      </div>
    );
  }

  return (
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
            type="text"
            name="celular"
            value={formData.celular}
            onChange={handleChange}
            className="w-full p-2 border rounded dark:bg-darkmode-body dark:border-gray-700"
          />
          {formErrors.celular && (
            <p className="text-red-500 text-xs mt-1">{formErrors.celular}</p>
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
            <option value="La Paz">La Paz</option>
            <option value="Cochabamba">Cochabamba</option>
            <option value="Santa Cruz">Santa Cruz</option>
            <option value="Oruro">Oruro</option>
            <option value="Potosí">Potosí</option>
            <option value="Chuquisaca">Chuquisaca</option>
            <option value="Tarija">Tarija</option>
            <option value="Beni">Beni</option>
            <option value="Pando">Pando</option>
          </select>
          {formErrors.departamento && (
            <p className="text-red-500 text-xs mt-1">
              {formErrors.departamento}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">
            Provincia
          </label>
          <input
            required
            type="text"
            name="provincia"
            value={formData.provincia}
            onChange={handleChange}
            className="w-full p-2 border rounded dark:bg-darkmode-body dark:border-gray-700"
          />
          {formErrors.provincia && (
            <p className="text-red-500 text-xs mt-1">{formErrors.provincia}</p>
          )}
        </div>

        <button
          type="submit"
          className="w-full btn btn-primary py-3 rounded-lg font-bold mt-4 shadow-lg hover:shadow-xl transition-all"
        >
          Enviar Pedido
        </button>
      </form>

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
              sido registrado.
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
    </div>
  );
}
