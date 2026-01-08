import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

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

export default function ContactFormold() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [contactId, setContactId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    nombre: "",
    ci: "",
    celular: "",
    departamento: "",
    provincia: "",
  });

  const [provincias, setProvincias] = useState<string[]>([]);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;

    let processedValue = value;
    if (name === "nombre") {
      // Permitir solo letras, espacios y tildes/ñ (pero convertir a mayúsculas)
      processedValue = value.replace(/[^a-zA-ZÀ-ÿ\s]/g, "").toUpperCase();
    } else if (name === "ci") {
      processedValue = value.toUpperCase();
    }

    setFormData({ ...formData, [name]: processedValue });

    if (name === "departamento") {
      setProvincias(departamentos[value as keyof typeof departamentos] || []);
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

    if (!formData.ci.trim()) {
      errors.ci = "Por favor, ingrese su cédula de identidad.";
    }

    if (!formData.celular.trim()) {
      errors.celular = "Por favor, ingrese su número de celular.";
    } else if (formData.celular.length !== 8) {
      errors.celular = "El número debe tener 8 dígitos.";
    } else if (!/^[67]/.test(formData.celular)) {
      errors.celular = "El número debe comenzar con 6 o 7.";
    }

    if (!formData.departamento.trim()) {
      errors.departamento = "Por favor, seleccione un departamento.";
    }

    if (!formData.provincia.trim()) {
      errors.provincia = "Por favor, seleccione una provincia.";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      await sendContactToAPI();
    } else {
      const firstError = Object.values(formErrors)[0];
      if (firstError) {
        toast.error(firstError);
      } else {
        toast.error("Por favor, complete todos los campos requeridos.");
      }
    }
  };

  const sendContactToAPI = async () => {
    try {
      setIsSubmitting(true);

      const payload = {
        nombre: formData.nombre,
        ci: formData.ci,
        celular: formData.celular,
        departamento: formData.departamento,
        provincia: formData.provincia,
        tipo: "pedido",
      };

      const response = await axios.post(
        //"http://localhost:8000/api/shoppedidos",
        "https://importadoramiranda.com/api/shoppedidos",
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      const pedidoId =
        response.data.pedido_id ||
        response.data.data?.id?.toString() ||
        "ID no disponible";
      setContactId(pedidoId);
      setIsSuccess(true);
      setIsSubmitting(false);

      if (response.data.whatsapp_connected === false) {
        const mensaje = encodeURIComponent(
          `Nuevo pedido recibido: #${pedidoId}\n\n¡Gracias por su compra!`,
        );
        window.open(`https://wa.me/59170621016?text=  ${mensaje}`, "_blank");

        // ✅ DESCARGA AUTOMÁTICA DEL PDF
        const pdfBase64 = response.data.pdf_base64;
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
        } else {
          toast.error("Comprobante no disponible.");
        }
      }

      // Resetear formulario
      setFormData({
        nombre: "",
        ci: "",
        celular: "",
        departamento: "",
        provincia: "",
      });
      setProvincias([]);
      setFormErrors({});
    } catch (error: any) {
      console.error("Error al enviar el pedido:", error);
      setIsSubmitting(false);
      toast.error(
        error?.response?.data?.message ||
          "Hubo un error al registrar tu pedido. Inténtalo nuevamente.",
      );
    }
  };

  return (
    <div className="bg-white dark:bg-darkmode-light rounded-2xl shadow-2xl p-4 border border-gray-100 dark:border-darkmode-border">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Información Personal
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Complete sus datos para procesar su pedido
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <svg
              className="w-4 h-4 text-primary"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                clipRule="evenodd"
              />
            </svg>
            Nombre Completo
          </label>
          <input
            required
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            className="w-full px-4 py-3 border-2 border-gray-200 dark:border-darkmode-border rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all bg-gray-50 dark:bg-darkmode-body text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 uppercase-input"
            placeholder="Ingrese su nombre completo"
          />
          {formErrors.nombre && (
            <p className="text-red-500 text-sm flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              {formErrors.nombre}
            </p>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Cédula de Identidad */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <svg
                className="w-4 h-4 text-primary"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              Cédula de Identidad
            </label>
            <input
              required
              type="text"
              name="ci"
              value={formData.ci}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-200 dark:border-darkmode-border rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all bg-gray-50 dark:bg-darkmode-body text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 uppercase-input"
              placeholder="Ingrese su CI"
            />
            {formErrors.ci && (
              <p className="text-red-500 text-sm flex items-center gap-1">
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                {formErrors.ci}
              </p>
            )}
          </div>

          {/* Celular */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <svg
                className="w-4 h-4 text-primary"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
              </svg>
              Celular (WhatsApp)
            </label>
            <div className="w-full flex items-center border-2 border-gray-200 dark:border-darkmode-border rounded-xl focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all bg-gray-50 dark:bg-darkmode-body">
              <div className="flex-shrink-0 flex items-center px-3 py-3 border-r border-gray-300 dark:border-darkmode-border bg-gray-100 dark:bg-darkmode-light text-gray-700 dark:text-gray-300 whitespace-nowrap select-none">
                <img
                  src="https://flagcdn.com/w20/bo.png  "
                  alt="Bolivia"
                  className="w-5 h-4 mr-2"
                />
                <span>+591</span>
              </div>
              <input
                required
                type="tel"
                inputMode="numeric"
                maxLength={8}
                value={formData.celular}
                onChange={(e) => {
                  const value = e.target.value;
                  const numericValue = value.replace(/\D/g, "");
                  if (
                    numericValue.length === 1 &&
                    !["6", "7"].includes(numericValue)
                  ) {
                    return;
                  }
                  const trimmed = numericValue.slice(0, 8);
                  setFormData({ ...formData, celular: trimmed });
                }}
                className="flex-1 min-w-0 px-4 py-3 bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                placeholder="70123456"
              />
            </div>
            {formErrors.celular && (
              <p className="text-red-500 text-sm flex items-center gap-1">
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                {formErrors.celular}
              </p>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <svg
                className="w-4 h-4 text-primary"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                  clipRule="evenodd"
                />
              </svg>
              Departamento
            </label>
            <select
              required
              name="departamento"
              value={formData.departamento}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-200 dark:border-darkmode-border rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all bg-gray-50 dark:bg-darkmode-body text-gray-900 dark:text-white"
            >
              <option value="">Seleccione un departamento</option>
              {Object.keys(departamentos).map((dep) => (
                <option key={dep} value={dep}>
                  {dep}
                </option>
              ))}
            </select>
            {formErrors.departamento && (
              <p className="text-red-500 text-sm flex items-center gap-1">
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                {formErrors.departamento}
              </p>
            )}
          </div>

          {formData.departamento && (
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <svg
                  className="w-4 h-4 text-primary"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"
                    clipRule="evenodd"
                  />
                </svg>
                Provincia o Ciudad
              </label>
              <div className="grid grid-cols-2 gap-3">
                {provincias.map((prov) => (
                  <button
                    key={prov}
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, provincia: prov })
                    }
                    className={`px-4 py-3 border-2 rounded-xl text-sm font-medium transition-all transform hover:scale-105 ${
                      formData.provincia === prov
                        ? "bg-gradient-to-r from-primary to-[#F20505] text-white border-primary shadow-lg shadow-primary/25"
                        : "bg-gray-50 dark:bg-darkmode-body border-gray-200 dark:border-darkmode-border text-gray-700 dark:text-gray-300 hover:border-primary hover:bg-primary/5"
                    }`}
                  >
                    {prov}
                  </button>
                ))}
              </div>
              {formErrors.provincia && (
                <p className="text-red-500 text-sm flex items-center gap-1">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {formErrors.provincia}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="pt-6 border-t border-gray-200 dark:border-darkmode-border">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-primary to-[#F20505] text-white py-4 px-6 rounded-xl font-bold text-lg shadow-xl shadow-primary/30 hover:shadow-2xl hover:shadow-primary/40 transition-all transform hover:-translate-y-1 active:translate-y-0 flex items-center justify-center gap-3 disabled:opacity-70"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
            Enviar Pedido
          </button>
        </div>
      </form>

      {isSubmitting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-darkmode-light rounded-2xl shadow-2xl p-8 flex flex-col items-center max-w-sm w-full mx-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-800 dark:text-white font-semibold text-lg">
              Procesando pedido...
            </p>
          </div>
        </div>
      )}

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
