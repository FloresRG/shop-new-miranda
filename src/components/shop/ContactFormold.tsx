import React, { useState } from "react";
import axios from "axios";
import { jsPDF } from "jspdf";
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

const departamentoAbreviaturas: { [key: string]: string } = {
  "Santa Cruz": "SCZ",
  "La Paz": "LPZ",
  Cochabamba: "CBB",
  Potosí: "PTS",
  Oruro: "ORU",
  Chuquisaca: "CHU",
  Tarija: "TJA",
  Beni: "BEN",
  Pando: "PAN",
};

export default function ContactForm() {
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
  const [selectedDep, setSelectedDep] = useState<string>("");
  const [showModal, setShowModal] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    let processedValue = value;
    if (name === "nombre" || name === "ci") {
      processedValue = value.toUpperCase();
    }
    setFormData({ ...formData, [name]: processedValue });
  };

  const handleDepartamentoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setFormData({ ...formData, departamento: value, provincia: "" });
    setSelectedDep(value);
    setProvincias(departamentos[value as keyof typeof departamentos] || []);
    if (value === "La Paz") {
      setShowModal(true);
    }
  };

  const handleProvinciaClick = (provincia: string) => {
    const concatenado = `${selectedDep} - ${provincia}`;
    setFormData({
      ...formData,
      provincia,
      departamento: concatenado,
    });
  };

  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};
    if (!formData.nombre.trim()) errors.nombre = "Por favor, ingrese su nombre.";
    if (!formData.ci.trim()) errors.ci = "Por favor, ingrese su cédula de identidad.";
    if (!formData.celular.trim()) {
      errors.celular = "Por favor, ingrese su número de celular.";
    } else if (formData.celular.length !== 8) {
      errors.celular = "El número debe tener 8 dígitos.";
    } else if (!/^[67]/.test(formData.celular)) {
      errors.celular = "El número debe comenzar con 6 o 7.";
    }
    if (!formData.departamento.trim()) errors.departamento = "Por favor, seleccione un departamento.";
    if (!formData.provincia.trim()) errors.provincia = "Por favor, seleccione una provincia.";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      await sendContactToAPI();
    }
  };

  const sendContactToAPI = async () => {
    try {
      setIsSubmitting(true);
      const apiFormData = new FormData();
      apiFormData.append("nombre", formData.nombre);
      apiFormData.append("ci", formData.ci);
      apiFormData.append("celular", formData.celular);
      apiFormData.append("destino", formData.departamento); // Ya concatenado
      apiFormData.append("direccion", "Sin direccion");
      apiFormData.append("estado", "POR COBRAR");
      apiFormData.append("cantidad_productos", "0");
      apiFormData.append("detalle", "Sin Detalle");
      apiFormData.append("productos", JSON.stringify([]));
      apiFormData.append("monto_deposito", "0");
      apiFormData.append("monto_enviado_pagado", "0");
      apiFormData.append("id_usuario", "0");

      const apiResponse = await axios.post(
        "https://www.importadoramiranda.com/api/pedidos/lupenuevo",
        apiFormData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      const contactIdResponse = apiResponse.data.message;

      setContactId(contactIdResponse);
      generatePDF(contactIdResponse);
      handleRedirectToWhatsApp(contactIdResponse);
      setIsSubmitting(false);
      setIsSuccess(true);
    } catch (error) {
      console.error("Error al enviar el contacto:", error);
      setIsSubmitting(false);
      toast.error("Hubo un error al registrar tu pedido. Inténtalo nuevamente.");
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
    doc.text(`Destino: ${formData.departamento}`, 10, 110);

    doc.setFontSize(14);
    doc.setTextColor(128, 0, 128);
    doc.text(
      "Para confirmar completamente el pedido y saber más detalles,",
      10,
      130,
      { maxWidth: 190 }
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
    const enlaceWhatsApp = `https://wa.me/59170621016?text=${encodeURIComponent(mensaje)}`;
    window.location.href = enlaceWhatsApp;
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
              Ingresa el celular desde el que nos inscribiste
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
                  if (numericValue.length === 1 && !["6", "7"].includes(numericValue)) return;
                  const trimmed = numericValue.slice(0, 8);
                  setFormData({ ...formData, celular: trimmed });
                }}
                className="flex-1 min-w-0 px-4 py-3 border-2 border-gray-200 dark:border-darkmode-border rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all bg-gray-50 dark:bg-darkmode-body text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
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
              value={selectedDep}
              onChange={handleDepartamentoChange}
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

          {provincias.length > 0 && (
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
                    onClick={() => handleProvinciaClick(prov)}
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

        {/* Mostrar destino concatenado */}
        {formData.departamento.includes(" - ") && (
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-900 dark:text-white">
              Destino seleccionado:
            </label>
            <p className="px-4 py-3 bg-gray-100 dark:bg-darkmode-body rounded-xl text-gray-700 dark:text-gray-300">
              {formData.departamento}
            </p>
          </div>
        )}

        <div className="pt-6 border-t border-gray-200 dark:border-darkmode-border">
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-primary to-[#F20505] text-white py-4 px-6 rounded-xl font-bold text-lg shadow-xl shadow-primary/30 hover:shadow-2xl hover:shadow-primary/40 transition-all transform hover:-translate-y-1 active:translate-y-0 flex items-center justify-center gap-3"
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

      {showModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(20, 10, 40, 0.6)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "linear-gradient(135deg, #5a189a, #7b2cbf)",
              borderRadius: "1.5rem",
              padding: "2rem",
              color: "white",
              maxWidth: "400px",
              width: "90%",
              textAlign: "center",
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)",
              position: "relative",
              border: "2px solid rgba(255, 255, 255, 0.15)",
            }}
          >
            <button
              onClick={() => setShowModal(false)}
              style={{
                position: "absolute",
                top: "1rem",
                right: "1rem",
                background: "rgba(255, 255, 255, 0.2)",
                color: "white",
                border: "none",
                fontSize: "1.2rem",
                fontWeight: "bold",
                borderRadius: "50%",
                width: "2rem",
                height: "2rem",
                cursor: "pointer",
              }}
            >
              ×
            </button>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "1rem" }}>
              ¡ATENCIÓN!
            </h2>
            <p style={{ fontSize: "1rem", lineHeight: 1.6, marginBottom: "1rem" }}>
              Tienes <strong>5 días</strong> para recoger tu pedido.
              <br />
              En caso contrario, comunícate con el número:
            </p>
            <div
              style={{
                background: "rgba(255, 255, 255, 0.15)",
                padding: "0.6rem 1rem",
                borderRadius: "1rem",
                display: "inline-block",
                fontWeight: "bold",
                fontSize: "1.1rem",
                marginBottom: "1.5rem",
              }}
            >
              📞 +591 70621016
            </div>
            <div>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  background: "linear-gradient(135deg, #9d4edd, #c77dff)",
                  color: "white",
                  fontWeight: "bold",
                  border: "none",
                  borderRadius: "1rem",
                  padding: "0.75rem 1.5rem",
                  fontSize: "1rem",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                }}
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

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
              Su pedido <span className="font-bold text-primary">#{contactId}</span> ha sido registrado. <br />
              Se ha generado su comprobante y se redirigió a WhatsApp.
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
