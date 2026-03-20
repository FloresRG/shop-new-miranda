import React, { useState, useRef } from "react";
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
    "Coroico",
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

type Product = {
  file: File;
  quantity: number;
};

export default function ExpressForm() {
  const [isAgreedModalOpen, setIsAgreedModalOpen] = useState(true);
  const [isAgreed, setIsAgreed] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [contactId, setContactId] = useState<string | null>(null);
  const [pdfData, setPdfData] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    nombre: "",
    ci: "",
    celular: "",
    departamento: "La Paz",
    provincia: "Recojo en tienda",
    horaRecojo: "",
    estado: "express",
    tipo: "express",
  });

  const [productos, setProductos] = useState<Product[]>([]);
  const [comprobanteFile, setComprobanteFile] = useState<File | null>(null);
  const [provincias, setProvincias] = useState<string[]>(departamentos["La Paz"]);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  const [selectedLocation, setSelectedLocation] = useState({
    departamento: "",
    provincia: "",
  });

  const productosFileInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;

    let processedValue = value;
    if (name === "nombre") {
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

  const handleProductosFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const newFiles = Array.from(e.target.files || []);
    const newProducts = newFiles.map((file) => ({ file, quantity: 1 }));
    setProductos((prev) => [...prev, ...newProducts]);
    if (e.target) e.target.value = "";
  };

  const removeProducto = (index: number) => {
    setProductos((prev) => prev.filter((_, i) => i !== index));
  };

  const updateQuantity = (index: number, value: number) => {
    setProductos((prev) => {
      const newProductos = [...prev];
      newProductos[index].quantity = Math.max(1, value);
      return newProductos;
    });
  };

  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};
    if (!formData.nombre.trim())
      errors.nombre = "Por favor, ingrese su nombre.";
    else if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(formData.nombre.trim()))
      errors.nombre = "El nombre solo puede contener letras y espacios.";
    if (!formData.ci.trim())
      errors.ci = "Por favor, ingrese su cédula de identidad.";
    if (!formData.celular.trim())
      errors.celular = "Por favor, ingrese su número de celular.";
    else if (formData.celular.length !== 8)
      errors.celular = "El número debe tener 8 dígitos.";
    else if (!/^[67]/.test(formData.celular))
      errors.celular = "El número debe comenzar con 6 o 7.";
    if (!formData.horaRecojo.trim())
      errors.horaRecojo = "Por favor, ingrese la hora estimada de recojo.";
    if (!formData.departamento.trim())
      errors.departamento = "Por favor, seleccione un departamento.";
    if (!formData.provincia.trim())
      errors.provincia = "Por favor, seleccione una provincia.";
    if (productos.length === 0)
      errors.productos =
        "Por favor, suba al menos una imagen de los productos.";
    if (!comprobanteFile)
      errors.comprobante = "Por favor, suba el comprobante de pago.";

    // Validar cantidades mínimas
    productos.forEach((prod, index) => {
      if (prod.quantity < 1) {
        updateQuantity(index, 1);
      }
    });

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      await sendContactToAPI();
    } else {
      const firstError = Object.values(formErrors)[0];
      toast.error(
        firstError || "Por favor, complete todos los campos requeridos.",
      );
    }
  };

  const sendContactToAPI = async () => {
    try {
      setIsSubmitting(true);
      const apiFormData = new FormData();

      apiFormData.append("nombre", formData.nombre);
      apiFormData.append("ci", formData.ci);
      apiFormData.append("celular", formData.celular);
      apiFormData.append("departamento", formData.departamento);
      apiFormData.append("provincia", formData.provincia);
      apiFormData.append("estado", formData.estado);
      apiFormData.append("tipo", formData.tipo);
      apiFormData.append("detalle", formData.horaRecojo);

      productos.forEach((prod) => {
        apiFormData.append("imagenes[]", prod.file);
        apiFormData.append("tipos_imagenes[]", "producto");
        apiFormData.append("cantidades_imagenes[]", prod.quantity.toString());
      });

      if (comprobanteFile) {
        apiFormData.append("imagenes[]", comprobanteFile);
        apiFormData.append("tipos_imagenes[]", "comprobante");
      }

      const response = await axios.post(
        "http://127.0.0.1:8000/api/shoppedidos",
        apiFormData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );

      const pedidoId =
        response.data.pedido_id ||
        response.data.data?.id?.toString() ||
        "ID no disponible";
      setContactId(pedidoId);
      setSelectedLocation({
        departamento: formData.departamento,
        provincia: formData.provincia,
      });
      setIsSuccess(true);
      setIsSubmitting(false);

      /* SI EL WHATSAPP ESTABA DESCONECTADO (COMENTADO PARA NO REDIRIGIR AUTOMÁTICAMENTE)
      if (response.data.whatsapp_connected === false) {
        const mensaje = encodeURIComponent(
          `Hola, me pongo en contacto para informarles que mi pedido es el número: #${pedidoId}.\n\n` +
            `Agradezco su atención y quedo atento(a) a su confirmación respecto a este pedido.`,
        );
        window.open(`https://wa.me/59170621016?text=${mensaje}`, "_blank");
      } */

      // El PDF se sigue descargando si está presente
      const pdfBase64 = response.data.pdf_base64;
      if (pdfBase64) {
        // Guardar el PDF en el estado para poder descargarlo manualmente
        setPdfData(pdfBase64);

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

      // Reset
      setFormData({
        nombre: "",
        ci: "",
        celular: "",
        departamento: "La Paz",
        provincia: "Recojo en tienda",
        horaRecojo: "",
        estado: "express",
        tipo: "express",
      });
      setProductos([]);
      setComprobanteFile(null);
      setProvincias(departamentos["La Paz"]);
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

  const handleDownloadPDF = () => {
    if (!pdfData || !contactId) return;

    try {
      const byteString = atob(pdfData);
      const arrayBuffer = new ArrayBuffer(byteString.length);
      const uint8Array = new Uint8Array(arrayBuffer);
      for (let i = 0; i < byteString.length; i++) {
        uint8Array[i] = byteString.charCodeAt(i);
      }
      const blob = new Blob([uint8Array], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `pedido_${contactId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error al descargar el PDF:", err);
      toast.error("No se pudo descargar el PDF.");
    }
  };

  if (isAgreedModalOpen) {
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]">
        <div className="relative max-w-lg w-full bg-white dark:bg-darkmode-light rounded-2xl shadow-2xl p-5 sm:p-8 border-2 border-primary/20 dark:border-primary/30 max-h-[90vh] overflow-y-auto transition-colors duration-500">
          
          <div className="text-center mb-5">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-[#FF0040] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/40">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-[#FF0040] mb-2 uppercase tracking-tighter">
              ¡AVISO IMPORTANTE!
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm font-semibold italic">
              Por favor lee con atención antes de continuar con tu envío express
            </p>
          </div>

          <div className="bg-gradient-to-r from-primary/5 to-red-500/5 dark:from-primary/10 dark:to-red-900/10 rounded-xl p-4 sm:p-5 mb-6 border border-primary/10 dark:border-primary/20">
            <div className="space-y-4 text-gray-800 dark:text-gray-100 font-medium text-sm sm:text-base leading-relaxed text-justify">
              <p className="flex items-start gap-2">
                <span className="text-primary flex-shrink-0 mt-1">●</span>
                <span>Al elegir pedido Express, tu pedido se reserva y <strong className="underline decoration-red-500 decoration-2 text-red-600">DEBE SER RECOGIDO HOY MISMO</strong> en horario de tienda.</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-primary flex-shrink-0 mt-1">●</span>
                <span>En caso de no recoger tu pedido el día de hoy, se generará un cargo de <strong className="text-red-500 font-bold underline">10 Bs por cada día adicional</strong> de almacenaje.</span>
              </p>
              <p className="flex items-start gap-2 text-red-700 dark:text-orange-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-100 dark:border-red-900/30">
                <span className="flex-shrink-0">⚠️</span>
                <span><strong>STOCK LIMITADO:</strong> Si no recoges tu producto a tiempo y existe alta demanda del producto. <strong className="uppercase underline">NO SE ACEPTARÁN RECLAMOS POSTERIORES</strong> si el producto se agota.</span>
              </p>
            </div>
          </div>
          
          <div className="space-y-5">
            <label className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-darkmode-body border-2 border-transparent hover:border-primary transition-all cursor-pointer group shadow-sm">
              <div className="relative flex items-center justify-center">
                <input
                  type="checkbox"
                  className="peer sr-only"
                  checked={isAgreed}
                  onChange={(e) => setIsAgreed(e.target.checked)}
                />
                <div className="w-8 h-8 border-2 border-gray-300 dark:border-gray-600 rounded-full bg-white dark:bg-gray-800 peer-checked:bg-primary/10 peer-checked:border-primary transition-all flex items-center justify-center relative shadow-inner overflow-visible">
                  {/* El círculo que se llena (opcional para estilo similar) */}
                  <div className="absolute inset-0.5 rounded-full bg-primary transform scale-0 peer-checked:scale-100 transition-transform duration-300"></div>
                  {/* El Check Prominente */}
                  <svg 
                    className="w-5 h-5 text-gray-400 peer-checked:text-white transition-all transform scale-110 relative z-10" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor" 
                    strokeWidth="4"
                    style={{ strokeDasharray: 50, strokeDashoffset: isAgreed ? 0 : 50 }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <span className="text-sm sm:text-base font-bold text-gray-700 dark:text-gray-200 group-hover:text-primary transition-colors select-none">
                Confirmo que he leído y acepto las condiciones de Miranda Express.
              </span>
            </label>

            <button
              onClick={() => {
                if (isAgreed) setIsAgreedModalOpen(false);
              }}
              disabled={!isAgreed}
              className="w-full bg-linear-to-r from-primary to-[#FF0040] text-white py-4 px-6 rounded-xl font-black text-lg shadow-xl shadow-primary/30 active:scale-95 disabled:opacity-30 disabled:active:scale-100 flex items-center justify-center gap-2 uppercase tracking-wider transition-all"
            >
              Confirmar y Continuar
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

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
        {/* Nombre */}
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

        {/* CI y Celular */}
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
                  src="https://flagcdn.com/w20/bo.png"
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
                  )
                    return;
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

        {/* Departamento y Provincia (Bloqueados) */}
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
            <div className="w-full px-4 py-3 border-2 border-gray-100 dark:border-darkmode-border rounded-xl bg-gray-100/50 dark:bg-darkmode-body/50 text-gray-500 dark:text-gray-400 font-medium flex items-center justify-between cursor-not-allowed">
              <span>{formData.departamento}</span>
              <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
            </div>
          </div>

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
            <div className="w-full px-4 py-3 border-2 border-primary/20 rounded-xl bg-primary/5 text-primary font-bold flex items-center justify-between cursor-not-allowed shadow-sm shadow-primary/5">
              <span>{formData.provincia}</span>
              <span className="text-[10px] uppercase bg-primary text-white px-2 py-0.5 rounded-full">Fijo</span>
            </div>
          </div>
        </div>

        {/* Hora estimada de recojo */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <svg
              className="w-4 h-4 text-primary"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                clipRule="evenodd"
              />
            </svg>
            Hora estimada de recojo
          </label>
          <input
            required
            type="text"
            name="horaRecojo"
            value={formData.horaRecojo}
            onChange={(e) => setFormData({ ...formData, horaRecojo: e.target.value })}
            className="w-full px-4 py-3 border-2 border-gray-200 dark:border-darkmode-border rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all bg-gray-50 dark:bg-darkmode-body text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            placeholder="Ej: 15:30 o Entre las 4 y 5 PM"
          />
          {formErrors.horaRecojo && (
            <p className="text-red-500 text-sm flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              {formErrors.horaRecojo}
            </p>
          )}
        </div>

        {/* Productos solicitados */}
        <div className="space-y-4">
          <label className="block text-sm font-semibold text-gray-900 dark:text-white flex items-center justify-center gap-2">
            <svg
              className="w-4 h-4 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Capturas de productos
          </label>

          <p className="text-xl text-red-700 dark:text-red-400 text-center">
            Sube las Capturas y ajusta la cantidad de cada producto
          </p>

          <input
            ref={productosFileInputRef}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={handleProductosFileChange}
          />

          {productos.length === 0 ? (
            <div
              className="cursor-pointer"
              onClick={() => productosFileInputRef.current?.click()}
            >
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-darkmode-border rounded-xl p-10 text-center hover:border-primary hover:bg-primary/5 transition-colors">
                <svg
                  className="w-12 h-12 text-gray-400 dark:text-gray-500 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <p className="text-base font-medium text-gray-700 dark:text-gray-300">
                  Toca para subir
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {productos.map((prod, index) => (
                <div
                  key={index}
                  className="relative flex flex-col items-center p-2 bg-gray-50 dark:bg-darkmode-body border border-gray-200 dark:border-darkmode-border rounded-xl"
                >
                  <button
                    type="button"
                    onClick={() => removeProducto(index)}
                    className="absolute top-2 right-2 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-full transition-colors"
                    title="Eliminar"
                  >
                    <svg
                      className="w-14 h-14"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>

                  <div className="">
                    <div className="aspect-[4/5] overflow-hidden rounded-lg border border-gray-300 dark:border-darkmode-border bg-white dark:bg-gray-800 shadow-sm">
                      <img
                        src={URL.createObjectURL(prod.file)}
                        alt={`producto-${index}`}
                        className="w-full h-full object-contain"
                        onLoad={(e) =>
                          URL.revokeObjectURL(
                            (e.target as HTMLImageElement).src,
                          )
                        }
                      />
                    </div>
                  </div>

                  <div className="flex flex-col items-center w-full">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Cantidad de este producto
                    </label>
                    <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-darkmode-border shadow-sm px-2 py-1.5">
                      <button
                        type="button"
                        onClick={() => updateQuantity(index, prod.quantity - 1)}
                        disabled={prod.quantity <= 1}
                        className={`w-10 h-10 flex items-center justify-center text-xl font-bold rounded-full transition-colors ${
                          prod.quantity <= 1
                            ? "text-gray-400 cursor-not-allowed"
                            : "text-red-600 hover:text-red-800 hover:bg-red-100 dark:hover:bg-red-900/30"
                        }`}
                      >
                        −
                      </button>

                      <input
                        type="number"
                        min="1"
                        value={prod.quantity || ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          const num = val === "" ? 0 : parseInt(val, 10);
                          if (val === "" || (!isNaN(num) && num >= 0)) {
                            setProductos((prev) => {
                              const newProductos = [...prev];
                              newProductos[index].quantity =
                                val === "" ? 0 : num;
                              return newProductos;
                            });
                          }
                        }}
                        onBlur={() => {
                          if (prod.quantity === 0) {
                            updateQuantity(index, 1);
                          }
                        }}
                        onFocus={(e) => e.target.select()}
                        className="w-16 text-center text-2xl font-bold border-none focus:outline-none bg-transparent text-gray-900 dark:text-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />

                      <button
                        type="button"
                        onClick={() => updateQuantity(index, prod.quantity + 1)}
                        className="w-10 h-10 flex items-center justify-center text-xl font-bold text-green-600 hover:text-green-800 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-full transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={() => productosFileInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-primary/60 text-primary hover:border-primary hover:bg-primary/5 rounded-xl transition-colors font-medium"
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
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Agregar más
              </button>
            </div>
          )}

          {formErrors.productos && (
            <p className="text-red-500 text-sm text-center flex items-center justify-center gap-1 mt-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              {formErrors.productos}
            </p>
          )}
        </div>

        {/* Comprobante */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <svg
              className="w-4 h-4 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Suba la Captura de su Comprobante de Pago
          </label>

          {comprobanteFile ? (
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                onChange={(e) =>
                  setComprobanteFile(e.target.files?.[0] || null)
                }
              />
              <div className="flex flex-col items-center">
                <div className="relative w-full aspect-video max-w-xs rounded-xl overflow-hidden border-2 border-gray-300 dark:border-darkmode-border">
                  <img
                    src={URL.createObjectURL(comprobanteFile)}
                    alt="comprobante"
                    className="w-full h-full object-contain bg-white dark:bg-darkmode-body"
                    onLoad={(e) =>
                      URL.revokeObjectURL((e.target as HTMLImageElement).src)
                    }
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setComprobanteFile(null)}
                  className="mt-2 text-xs text-red-500 hover:text-red-700 font-medium"
                >
                  Cambiar imagen
                </button>
              </div>
            </div>
          ) : (
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                onChange={(e) =>
                  setComprobanteFile(e.target.files?.[0] || null)
                }
              />
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-darkmode-border rounded-xl p-6 text-center bg-gray-50 dark:bg-darkmode-body transition-colors hover:border-primary">
                <svg
                  className="w-8 h-8 text-gray-400 dark:text-gray-500 mb-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Arrastre aquí o haga clic
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Solo una imagen (PNG, JPG)
                </p>
              </div>
            </div>
          )}
          {formErrors.comprobante && (
            <p className="text-red-500 text-sm flex items-center gap-1 mt-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              {formErrors.comprobante}
            </p>
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
          <div
            ref={modalRef}
            className="bg-white dark:bg-darkmode-light rounded-2xl shadow-2xl p-8 flex flex-col items-center max-w-sm w-full mx-4 text-center border border-gray-100 dark:border-darkmode-border"
          >
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
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Su pedido numero {" "}
              <span className="font-bold text-primary">{contactId}</span> ha
              sido registrado.
            </p>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl mb-6 text-sm text-blue-800 dark:text-blue-300 border border-blue-100 dark:border-blue-900/30 w-full">
              {selectedLocation.departamento === "La Paz" &&
              selectedLocation.provincia === "Recojo en tienda" ? (
                <p className="font-medium">
                  Información: Puede recojer su pedido el dia de hoy o en los
                  proximos 3 dias.
                </p>
              ) : (
                <p className="font-medium">
                  Información: Su pedido se enviará en los siguientes 3 a 5 días
                  hábiles.
                </p>
              )}
            </div>

            <div className="flex flex-col gap-3 w-full mb-6">
              <div className="bg-amber-50 dark:bg-amber-900/10 p-3 rounded-lg border border-amber-100 dark:border-amber-900/20 flex items-start gap-3">
                <span className="text-amber-500 text-lg">📸</span>
                <p className="text-xs text-amber-800 dark:text-amber-200 text-left font-medium">
                  Por favor, saque una captura de pantalla a este mensaje para
                  tener su numero de pedido a mano o descargue el PDF.
                </p>
              </div>

              {selectedLocation.provincia === "Recojo en tienda" && (
                <a
                  href="/about#map-section"
                  className="w-full flex items-center justify-center bg-accent/10 text-accent py-3 rounded-xl font-bold hover:bg-accent hover:text-white transition-colors text-sm border border-accent/20"
                >
                  Ver ubicación
                </a>
              )}

              {pdfData && (
                <button
                  onClick={handleDownloadPDF}
                  className="w-full flex items-center justify-center gap-2 bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700 transition-colors text-lg shadow-lg shadow-red-600/20"
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
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Descargar PDF
                </button>
              )}
            </div>

            <button
              onClick={() => setIsSuccess(false)}
              className="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition-colors shadow-lg shadow-green-600/20"
            >
              Aceptar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
