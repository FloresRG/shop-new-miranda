import React, { useState, useRef } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import html2canvas from "html2canvas";
import {
  FaCamera,
  FaShareAlt,
  FaFilePdf,
  FaUser,
  FaIdCard,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaQrcode,
  FaSpinner,
} from "react-icons/fa";

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

export default function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [contactId, setContactId] = useState<string | null>(null);
  const [pdfData, setPdfData] = useState<string | null>(null);
  const [qrData, setQrData] = useState<string | null>(null);
  const [orderSummary, setOrderSummary] = useState<{
    nombre: string;
    ci: string;
    celular: string;
    departamento: string;
    provincia: string;
    fecha: string;
  } | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  const [formData, setFormData] = useState({
    nombre: "",
    ci: "",
    celular: "",
    departamento: "",
    provincia: "",
  });

  const [productos, setProductos] = useState<Product[]>([]);
  const [comprobanteFile, setComprobanteFile] = useState<File | null>(null);
  const [provincias, setProvincias] = useState<string[]>([]);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  const [selectedLocation, setSelectedLocation] = useState({
    departamento: "",
    provincia: "",
  });

  const productosFileInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const ticketRef = useRef<HTMLDivElement>(null);

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
        "https://importadoramiranda.com/api/shoppedidos",
        apiFormData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );

      const pedidoId =
        response.data.pedido_id ||
        response.data.data?.id?.toString() ||
        "ID no disponible";

      // 1. Anticipar el QR en base64 recibido de la API (con fallback preventivo)
      const rawQr =
        response.data.qr_base64 ||
        response.data.qr ||
        response.data.data?.qr_base64 ||
        null;

      let formattedQr: string | null = null;
      if (rawQr) {
        formattedQr = rawQr.startsWith("data:")
          ? rawQr
          : `data:image/png;base64,${rawQr}`;
      } else {
        // Fallback preventivo mientras el backend añade el campo en la respuesta
        formattedQr = "/api/qr-proxy";
      }
      setQrData(formattedQr);

      // 2. Guardar resumen inmutable de los datos antes de resetear el formulario
      const now = new Date();
      const formattedDate = `${now.toLocaleDateString("es-BO")} ${now.toLocaleTimeString("es-BO", { hour: "2-digit", minute: "2-digit" })}`;

      setOrderSummary({
        nombre: formData.nombre,
        ci: formData.ci,
        celular: formData.celular,
        departamento: formData.departamento,
        provincia: formData.provincia,
        fecha: formattedDate,
      });

      setContactId(pedidoId);
      setSelectedLocation({
        departamento: formData.departamento,
        provincia: formData.provincia,
      });
      setIsSuccess(true);
      setIsSubmitting(false);

      // Guardar PDF en estado si la API lo envía
      const pdfBase64 = response.data.pdf_base64;
      if (pdfBase64) {
        setPdfData(pdfBase64);
      }

      // Reset de campos del formulario
      setFormData({
        nombre: "",
        ci: "",
        celular: "",
        departamento: "",
        provincia: "",
      });
      setProductos([]);
      setComprobanteFile(null);
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

  // Acción 1: Descargar Comprobante en PDF
  const handleDownloadPDF = () => {
    if (!pdfData || !contactId) {
      toast.error("El PDF no está disponible en este momento.");
      return;
    }

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
      toast.success("PDF descargado correctamente.");
    } catch (err) {
      console.error("Error al descargar el PDF:", err);
      toast.error("No se pudo descargar el PDF.");
    }
  };

  // Acción 2: Sacar Captura del Comprobante (Descarga de imagen PNG)
  const handleCaptureTicket = async () => {
    if (!ticketRef.current) return;
    try {
      setIsCapturing(true);
      const canvas = await html2canvas(ticketRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });
      const image = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = image;
      link.download = `comprobante_pedido_${contactId || "miranda"}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("¡Captura guardada en tu dispositivo!");
    } catch (error) {
      console.error("Error al capturar comprobante:", error);
      toast.error("No se pudo generar la captura.");
    } finally {
      setIsCapturing(false);
    }
  };

  // Acción 3: Compartir Comprobante (Web Share API o WhatsApp directo)
  const handleShareTicket = async () => {
    if (!ticketRef.current || !contactId) return;

    setIsSharing(true);
    const shareText =
      `*IMPORTADORA MIRANDA - PEDIDO #${contactId}*\n\n` +
      `👤 *Cliente:* ${orderSummary?.nombre || ""}\n` +
      `🆔 *CI:* ${orderSummary?.ci || ""}\n` +
      `📱 *Celular:* +591 ${orderSummary?.celular || ""}\n` +
      `📍 *Destino:* ${orderSummary?.departamento || ""} - ${orderSummary?.provincia || ""}\n` +
      `📅 *Fecha:* ${orderSummary?.fecha || ""}\n\n` +
      `Adjunto mi comprobante de pedido con QR para confirmación.`;

    try {
      const canvas = await html2canvas(ticketRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });

      let sharedWithFile = false;
      if (navigator.share) {
        try {
          const blob = await new Promise<Blob | null>((resolve) =>
            canvas.toBlob(resolve, "image/png"),
          );
          if (blob) {
            const file = new File(
              [blob],
              `comprobante_pedido_${contactId}.png`,
              { type: "image/png" },
            );
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
              await navigator.share({
                title: `Pedido #${contactId} - Importadora Miranda`,
                text: shareText,
                files: [file],
              });
              sharedWithFile = true;
              toast.success("¡Comprobante compartido!");
            }
          }
        } catch (shareErr: any) {
          if (shareErr.name === "AbortError") {
            setIsSharing(false);
            return;
          }
        }
      }

      // Si no se compartió por WebShare con archivo, descargamos la imagen y abrimos WhatsApp
      if (!sharedWithFile) {
        const image = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = image;
        link.download = `comprobante_pedido_${contactId}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        const whatsappUrl = `https://wa.me/59170621016?text=${encodeURIComponent(shareText)}`;
        window.open(whatsappUrl, "_blank");
        toast.success("Captura descargada. Abriendo WhatsApp...");
      }
    } catch (err) {
      console.error("Error al compartir:", err);
      const fallbackUrl = `https://wa.me/59170621016?text=${encodeURIComponent(shareText)}`;
      window.open(fallbackUrl, "_blank");
    } finally {
      setIsSharing(false);
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

        {/* Departamento y Provincia */}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-3 sm:p-4 overflow-y-auto">
          <div
            ref={modalRef}
            className="bg-white dark:bg-darkmode-light rounded-3xl shadow-2xl max-w-md w-full my-auto overflow-hidden border border-gray-100 dark:border-darkmode-border flex flex-col"
          >
            {/* Cabecera del Modal */}
            <div className="px-5 pt-5 pb-3 flex items-center justify-between border-b border-gray-100 dark:border-darkmode-border">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center text-sm font-bold">
                  ✓
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white leading-tight">
                    ¡Pedido Registrado!
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Comprobante generado correctamente
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSuccess(false)}
                className="w-8 h-8 rounded-full bg-gray-100 dark:bg-darkmode-body text-gray-400 hover:text-gray-700 dark:hover:text-white flex items-center justify-center text-sm transition-colors"
                title="Cerrar"
              >
                ✕
              </button>
            </div>

            {/* Contenido con Scroll */}
            <div className="p-4 sm:p-5 overflow-y-auto max-h-[80vh] space-y-4">
              {/* TICKET / VOUCHER DIGITAL A CAPTURAR (ref={ticketRef}) */}
              <div
                ref={ticketRef}
                className="bg-white text-gray-900 rounded-2xl p-5 border-2 border-gray-200 shadow-sm relative overflow-hidden"
                style={{ backgroundColor: "#ffffff", color: "#111827" }}
              >
                {/* Header del Ticket */}
                <div className="flex items-center justify-between pb-3 border-b-2 border-dashed border-gray-200">
                  <div>
                    <span className="text-[10px] font-black tracking-widest text-[#F2275D] uppercase block">
                      IMPORTADORA MIRANDA
                    </span>
                    <h4 className="text-base font-extrabold text-gray-900 tracking-tight">
                      Ticket de Pedido
                    </h4>
                  </div>
                  <div className="bg-red-50 border border-[#F2275D]/30 px-3 py-1.5 rounded-xl text-right">
                    <span className="text-[9px] block font-bold text-gray-400 uppercase leading-none">
                      Nº DE PEDIDO
                    </span>
                    <span className="text-sm font-black text-[#F2275D]">
                      #{contactId}
                    </span>
                  </div>
                </div>

                {/* Datos del Cliente */}
                <div className="py-3 space-y-2 border-b-2 border-dashed border-gray-200 text-xs">
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-gray-500 flex items-center gap-1.5 font-medium shrink-0">
                      <FaUser className="text-[#F2275D] text-[10px]" /> Cliente:
                    </span>
                    <span className="font-bold text-gray-900 text-right uppercase truncate">
                      {orderSummary?.nombre}
                    </span>
                  </div>

                  <div className="flex justify-between items-center gap-2">
                    <span className="text-gray-500 flex items-center gap-1.5 font-medium shrink-0">
                      <FaIdCard className="text-[#F2275D] text-[10px]" /> C.I.:
                    </span>
                    <span className="font-bold text-gray-900 text-right">
                      {orderSummary?.ci}
                    </span>
                  </div>

                  <div className="flex justify-between items-center gap-2">
                    <span className="text-gray-500 flex items-center gap-1.5 font-medium shrink-0">
                      <FaPhoneAlt className="text-[#F2275D] text-[10px]" /> Celular:
                    </span>
                    <span className="font-bold text-gray-900 text-right">
                      +591 {orderSummary?.celular}
                    </span>
                  </div>

                  <div className="flex justify-between items-center gap-2">
                    <span className="text-gray-500 flex items-center gap-1.5 font-medium shrink-0">
                      <FaMapMarkerAlt className="text-[#F2275D] text-[10px]" /> Destino:
                    </span>
                    <span className="font-bold text-gray-900 text-right">
                      {orderSummary?.departamento} - {orderSummary?.provincia}
                    </span>
                  </div>

                  <div className="flex justify-between items-center gap-2">
                    <span className="text-gray-500 flex items-center gap-1.5 font-medium shrink-0">
                      <FaCalendarAlt className="text-[#F2275D] text-[10px]" /> Fecha:
                    </span>
                    <span className="font-medium text-gray-600 text-right">
                      {orderSummary?.fecha}
                    </span>
                  </div>
                </div>

                {/* SECCIÓN DEL CÓDIGO QR */}
                <div className="pt-3.5 pb-2 flex flex-col items-center text-center">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 rounded-full text-[11px] font-bold text-gray-700 mb-2.5">
                    <FaQrcode className="text-[#F2275D]" />
                    <span>Código QR de Pago</span>
                  </div>

                  {/* Recuadro del QR */}
                  <div className="p-2.5 bg-white border-2 border-gray-200 rounded-2xl shadow-inner mb-2 max-w-[190px] w-full aspect-square flex items-center justify-center">
                    {qrData ? (
                      <img
                        src={qrData}
                        alt="Código QR de Pago"
                        crossOrigin="anonymous"
                        className="w-full h-full object-contain rounded-lg"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-gray-400 p-2">
                        <FaQrcode className="w-10 h-10 mb-1 text-gray-300" />
                        <span className="text-[10px] font-medium">QR no disponible</span>
                      </div>
                    )}
                  </div>

                  <p className="text-[10px] text-gray-600 max-w-[240px] leading-tight">
                    Escanea con tu aplicación bancaria con QR Simple para completar el pago de tu pedido.
                  </p>
                </div>

                {/* Nota de Entrega */}
                <div className="mt-2.5 p-2 rounded-xl text-center text-[10px] font-medium bg-blue-50 text-blue-900 border border-blue-100">
                  {selectedLocation.departamento === "La Paz" &&
                  selectedLocation.provincia === "Recojo en tienda" ? (
                    <span>📍 Puedes recoger tu pedido hoy o en los próximos 3 días hábiles.</span>
                  ) : (
                    <span>🚚 Tu pedido será despachado en los siguientes 3 a 5 días hábiles.</span>
                  )}
                </div>

                {/* Pie del ticket */}
                <div className="mt-2.5 pt-2 border-t border-dashed border-gray-200 text-center text-[9px] text-gray-400">
                  Guarda este comprobante como respaldo de tu compra.
                </div>
              </div>

              {/* BOTONES DE ACCIÓN (Fuera del ticket para no incluirse en la captura) */}
              <div className="space-y-2 pt-1">
                <p className="text-[11px] font-bold text-center text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Acciones Rápidas
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {/* Botón 1: Sacar Captura */}
                  <button
                    type="button"
                    onClick={handleCaptureTicket}
                    disabled={isCapturing}
                    className="w-full flex items-center justify-center gap-1.5 py-3 px-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold text-xs shadow-md transition-all transform active:scale-95 disabled:opacity-50"
                    title="Descargar imagen del comprobante"
                  >
                    {isCapturing ? (
                      <FaSpinner className="animate-spin text-sm" />
                    ) : (
                      <FaCamera className="text-sm text-cyan-400" />
                    )}
                    <span>{isCapturing ? "Guardando..." : "Sacar Captura"}</span>
                  </button>

                  {/* Botón 2: Compartir */}
                  <button
                    type="button"
                    onClick={handleShareTicket}
                    disabled={isSharing}
                    className="w-full flex items-center justify-center gap-1.5 py-3 px-2 bg-[#25D366] hover:bg-[#20ba59] text-white rounded-xl font-bold text-xs shadow-md shadow-green-600/20 transition-all transform active:scale-95 disabled:opacity-50"
                    title="Compartir por WhatsApp"
                  >
                    {isSharing ? (
                      <FaSpinner className="animate-spin text-sm" />
                    ) : (
                      <FaShareAlt className="text-sm" />
                    )}
                    <span>{isSharing ? "Enviando..." : "Compartir"}</span>
                  </button>

                  {/* Botón 3: Descargar PDF */}
                  <button
                    type="button"
                    onClick={handleDownloadPDF}
                    className="w-full flex items-center justify-center gap-1.5 py-3 px-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs shadow-md shadow-red-600/20 transition-all transform active:scale-95"
                    title="Descargar comprobante en PDF"
                  >
                    <FaFilePdf className="text-sm" />
                    <span>Descargar PDF</span>
                  </button>
                </div>

                {/* Botón de ubicación si es recojo en tienda */}
                {selectedLocation.provincia === "Recojo en tienda" && (
                  <a
                    href="/about#map-section"
                    className="w-full flex items-center justify-center bg-accent/10 text-accent py-2.5 rounded-xl font-bold hover:bg-accent hover:text-white transition-colors text-xs border border-accent/20"
                  >
                    Ver ubicación de la tienda
                  </a>
                )}

                {/* Botón de cierre */}
                <button
                  type="button"
                  onClick={() => setIsSuccess(false)}
                  className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-darkmode-body dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-semibold text-xs transition-colors mt-1"
                >
                  Cerrar y continuar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
