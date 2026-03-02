import React, { useState, useRef } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export default function SolicitudTrabajo() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [responseData, setResponseData] = useState<any>(null);

  const [formData, setFormData] = useState({
    nombre: "",
    ci: "",
    celular: "",
  });

  const [cvFile, setCvFile] = useState<File | null>(null);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;

    let processedValue = value;
    if (name === "nombre") {
      processedValue = value
        .replace(/[^a-zA-ZÀ-ÿ\s]/g, "")
        .toUpperCase();
    } else if (name === "ci") {
      processedValue = value.toUpperCase();
    }

    setFormData({ ...formData, [name]: processedValue });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar que sea PDF
      if (file.type !== "application/pdf") {
        toast.error("Solo se aceptan archivos PDF");
        return;
      }

      setCvFile(file);
    }
  };

  const removeFile = () => {
    setCvFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
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

    // CV PDF es obligatorio
    if (!cvFile) {
      errors.cv_pdf = "Por favor, suba su Curriculum Vitae en PDF.";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      await sendToAPI();
    } else {
      const firstError = Object.values(formErrors)[0];
      toast.error(firstError || "Por favor, complete todos los campos requeridos.");
    }
  };

  const sendToAPI = async () => {
    try {
      setIsSubmitting(true);
      const apiFormData = new FormData();

      apiFormData.append("nombre", formData.nombre);
      apiFormData.append("ci", formData.ci);
      apiFormData.append("celular", formData.celular);

      if (cvFile) {
        apiFormData.append("cv_pdf", cvFile);
      }

      const response = await axios.post(
        "http://localhost:8000/api/solicitudes",
        apiFormData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      setResponseData(response.data);
      setIsSuccess(true);
      setIsSubmitting(false);

      // Reset form
      setFormData({ nombre: "", ci: "", celular: "" });
      setCvFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setFormErrors({});

    } catch (error: any) {
      console.error("Error al enviar la solicitud:", error);
      setIsSubmitting(false);
      toast.error(
        error?.response?.data?.message ||
        "Hubo un error al registrar tu solicitud. Inténtalo nuevamente."
      );
    }
  };

  return (
    <div className="bg-white dark:bg-darkmode-light rounded-2xl shadow-2xl p-4 md:p-8 border border-gray-100 dark:border-darkmode-border">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-primary to-[#F20505] rounded-full mb-4">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Trabaja con Nosotros
        </h3>
        <p className="text-gray-600 dark:text-gray-400 max-w-lg mx-auto">
          Completa tus datos y adjunta tu CV en formato PDF. ¡Únete a nuestro equipo!
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-xl mx-auto">
        {/* Nombre */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
            Nombre Completo <span className="text-red-500">*</span>
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
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {formErrors.nombre}
            </p>
          )}
        </div>

        {/* CI y Celular */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Cédula de Identidad <span className="text-red-500">*</span>
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
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {formErrors.ci}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
              </svg>
              Celular (WhatsApp) <span className="text-red-500">*</span>
            </label>
            <div className="w-full flex items-center border-2 border-gray-200 dark:border-darkmode-border rounded-xl focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all bg-gray-50 dark:bg-darkmode-body">
              <div className="flex-shrink-0 flex items-center px-3 py-3 border-r border-gray-300 dark:border-darkmode-border bg-gray-100 dark:bg-darkmode-light text-gray-700 dark:text-gray-300 whitespace-nowrap select-none">
                <img src="https://flagcdn.com/w20/bo.png" alt="Bolivia" className="w-5 h-4 mr-2" />
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
                className="flex-1 min-w-0 px-4 py-3 bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                placeholder="70123456"
              />
            </div>
            {formErrors.celular && (
              <p className="text-red-500 text-sm flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {formErrors.celular}
              </p>
            )}
          </div>
        </div>

        {/* Curriculum Vitae PDF */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Curriculum Vitae (PDF) <span className="text-red-500">*</span>
          </label>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Adjunta tu CV en formato PDF
          </p>

          {cvFile ? (
            <div className="relative flex items-center p-4 bg-gray-50 dark:bg-darkmode-body border-2 border-green-500/50 rounded-xl">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="flex-1 ml-4 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {cvFile.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {(cvFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
              <button
                type="button"
                onClick={removeFile}
                className="flex-shrink-0 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-full transition-colors"
                title="Eliminar archivo"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ) : (
            <div className="relative">
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                onChange={handleFileChange}
              />
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-darkmode-border rounded-xl p-8 text-center bg-gray-50 dark:bg-darkmode-body transition-colors hover:border-primary hover:bg-primary/5">
                <svg className="w-12 h-12 text-gray-400 dark:text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-base font-medium text-gray-700 dark:text-gray-300">
                  Arrastre su CV aquí o haga clic para seleccionar
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Solo archivos PDF
                </p>
              </div>
            </div>
          )}
          {formErrors.cv_pdf && (
            <p className="text-red-500 text-sm flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {formErrors.cv_pdf}
            </p>
          )}
        </div>

        <div className="pt-6">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-primary to-[#F20505] text-white py-4 px-6 rounded-xl font-bold text-lg shadow-xl shadow-primary/30 hover:shadow-2xl hover:shadow-primary/40 transition-all transform hover:-translate-y-1 active:translate-y-0 flex items-center justify-center gap-3 disabled:opacity-70"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
            Enviar Solicitud
          </button>
        </div>
      </form>

      {/* Loading Overlay */}
      {isSubmitting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-darkmode-light rounded-2xl shadow-2xl p-8 flex flex-col items-center max-w-sm w-full mx-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-800 dark:text-white font-semibold text-lg">Enviando solicitud...</p>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {isSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-darkmode-light rounded-2xl shadow-2xl p-8 flex flex-col items-center max-w-sm w-full mx-4 text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4 text-green-500 dark:text-green-400">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">¡Solicitud Enviada!</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Tu solicitud de trabajo ha sido registrada exitosamente. Nos pondremos en contacto contigo pronto.
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
