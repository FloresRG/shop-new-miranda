import React, { useState } from "react";
import axios from "axios";
import { jsPDF } from "jspdf";

const departamentos = {
  "Santa Cruz": ["Santa Cruz", "Montero", "Camiri", "Zona Norte"],
  "La Paz": [
    "Caranavi",
    "Recojo en tienda",
    "Caranavi",
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

export default function ContactForm() {
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
    setFormData({ ...formData, [name]: value });

    if (name === "departamento") {
      setProvincias(departamentos[value as keyof typeof departamentos] || []);
      setFormData((prev) => ({ ...prev, provincia: "" })); // Reset provincia
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
      errors.provincia = "Por favor, seleccione una provincia.";
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
      const apiFormData = new FormData();
      apiFormData.append("nombre", formData.nombre);
      apiFormData.append("ci", formData.ci);
      apiFormData.append("celular", formData.celular);
      apiFormData.append("destino", formData.departamento);
      apiFormData.append("direccion", "Sin direccion");
      apiFormData.append("estado", "POR COBRAR");
      apiFormData.append("cantidad_productos", "0");
      apiFormData.append("detalle", "Sin Detalle");
      apiFormData.append("productos", JSON.stringify([]));
      apiFormData.append("monto_deposito", "0");
      apiFormData.append("monto_enviado_pagado", "0");
      apiFormData.append("id_usuario", "0");

      const apiResponse = await axios.post(
        "https://test.importadoramiranda.com/api/pedidos/lupenuevo",
        apiFormData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );

      const contactId = apiResponse.data.message;
      generatePDF(contactId);
      handleRedirectToWhatsApp(contactId);
    } catch (error) {
      console.error("Error al enviar el contacto:", error);
    }
  };

  const generatePDF = (contactId: string): void => {
    const date = new Date().toLocaleString();
    const doc = new jsPDF();

    doc.setFillColor(128, 0, 128);
    doc.rect(10, 10, 190, 15, "F");
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.text("CONFIRMACIÓN DE CONTACTO", 105, 20, { align: "center" });

    doc.setFontSize(12);
    doc.setTextColor(80, 80, 80);
    doc.text(`Fecha y Hora: ${date}`, 10, 30);

    doc.setFillColor(230, 230, 250);
    doc.rect(10, 35, 190, 10, "F");
    doc.setFontSize(12);
    doc.setTextColor(75, 0, 130);
    doc.text("DETALLES DEL CONTACTO", 105, 42, { align: "center" });

    doc.setTextColor(50, 50, 50);
    doc.text(`Número de Pedido: ${contactId}`, 10, 50);
    doc.text(`Nombre: ${formData.nombre}`, 10, 60);
    doc.text(`CI: ${formData.ci}`, 10, 70);
    doc.text(`Celular: ${formData.celular}`, 10, 80);

    doc.setFontSize(14);
    doc.setTextColor(128, 0, 128);
    doc.text(
      "Para más detalles, envíe un mensaje a nuestro WhatsApp.",
      10,
      130,
      { maxWidth: 190 },
    );

    doc.setFontSize(16);
    doc.setTextColor(75, 0, 130);
    doc.text("WhatsApp: +591 70621016", 105, 155, { align: "center" });

    doc.save(`Confirmación_de_Contacto_${contactId}.pdf`);
  };

  const handleRedirectToWhatsApp = (contactId: string): void => {
    const mensaje = `Hola, soy ${formData.nombre} y mi número de pedido es ${contactId}, soy de: ${formData.departamento}. Me gustaría confirmar mi pedido y conocer más detalles.`;
    const enlaceWhatsApp = `https://wa.me/59170621016?text=${encodeURIComponent(
      mensaje,
    )}`;
    window.location.href = enlaceWhatsApp;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
          <p className="text-red-500 text-xs mt-1">{formErrors.departamento}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">
          Provincia
        </label>
        <select
          required
          name="provincia"
          value={formData.provincia}
          onChange={handleChange}
          className="w-full p-2 border rounded dark:bg-darkmode-body dark:border-gray-700"
        >
          <option value="">Seleccione una provincia</option>
          {provincias.map((prov) => (
            <option key={prov} value={prov}>
              {prov}
            </option>
          ))}
        </select>
        {formErrors.provincia && (
          <p className="text-red-500 text-xs mt-1">{formErrors.provincia}</p>
        )}
      </div>

      <button
        type="submit"
        className="w-full btn btn-primary py-3 rounded-lg font-bold mt-4 shadow-lg hover:shadow-xl transition-all"
      >
        Enviar Mensaje
      </button>
    </form>
  );
}
