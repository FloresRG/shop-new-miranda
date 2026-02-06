import React, { useState } from "react";
import logoImage from "@/assets/logo.webp";

export default function LiveQR() {
  const [step, setStep] = useState<"notification" | "qr">("notification");

  const handleContinue = () => {
    setStep("qr");
  };

  const handlePaymentDone = () => {
    window.location.href = "/live";
  };

  const handleDownloadQR = () => {
    // Simple and direct download approach
    fetch(logoImage.src)
      .then(response => response.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = 'QR-Miranda.webp';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      })
      .catch(() => alert('Error al descargar la imagen'));
  };

  if (step === "notification") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-white to-red-50 dark:from-darkmode-body dark:via-darkmode-light dark:to-darkmode-body flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white dark:bg-darkmode-light rounded-3xl shadow-2xl p-8 md:p-12 border border-gray-100 dark:border-darkmode-border">
          {/* Icon */}
          <div className="flex justify-center mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-primary to-red-600 rounded-full flex items-center justify-center shadow-lg">
              <svg
                className="w-12 h-12 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-center text-gray-900 dark:text-white mb-6">
            ¡Bienvenido a Miranda!
          </h1>

          {/* Instructions */}
          <div className="bg-gradient-to-r from-primary/5 to-red-50 dark:from-primary/10 dark:to-red-900/10 rounded-2xl p-6 mb-8 border border-primary/20">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <svg
                className="w-6 h-6 text-primary"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              Instrucciones para completar tu pedido:
            </h2>

            <ol className="space-y-4">
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold text-sm">
                  1
                </span>
                <p className="text-gray-700 dark:text-gray-300 pt-1">
                  <strong className="text-gray-900 dark:text-white">
                    Escanea el código QR
                  </strong>{" "}
                  que te mostraremos en la siguiente pantalla
                </p>
              </li>

              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold text-sm">
                  2
                </span>
                <p className="text-gray-700 dark:text-gray-300 pt-1">
                  <strong className="text-gray-900 dark:text-white">
                    Realiza tu pago
                  </strong>{" "}
                  utilizando el método de tu preferencia
                </p>
              </li>

              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold text-sm">
                  3
                </span>
                <p className="text-gray-700 dark:text-gray-300 pt-1">
                  <strong className="text-gray-900 dark:text-white">
                    Llena el formulario
                  </strong>{" "}
                  con tus datos y sube el comprobante de pago
                </p>
              </li>

              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold text-sm">
                  4
                </span>
                <p className="text-gray-700 dark:text-gray-300 pt-1">
                  <strong className="text-gray-900 dark:text-white">
                    Recibirás un PDF
                  </strong>{" "}
                  con la confirmación de tu pedido directamente en tu WhatsApp
                </p>
              </li>
            </ol>
          </div>

          {/* Alert */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-xl p-4 mb-8">
            <div className="flex gap-3">
              <svg
                className="w-6 h-6 text-yellow-600 dark:text-yellow-500 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>Importante:</strong> Asegúrate de tener tu comprobante
                de pago listo antes de llenar el formulario.
              </p>
            </div>
          </div>

          {/* Continue Button */}
          <button
            onClick={handleContinue}
            className="w-full bg-gradient-to-r from-primary to-red-600 text-white py-4 px-6 rounded-xl font-bold text-lg shadow-xl shadow-primary/30 hover:shadow-2xl hover:shadow-primary/40 transition-all transform hover:-translate-y-1 active:translate-y-0 flex items-center justify-center gap-3"
          >
            Continuar
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  // QR Step
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-white to-red-50 dark:from-darkmode-body dark:via-darkmode-light dark:to-darkmode-body flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white dark:bg-darkmode-light rounded-3xl shadow-2xl p-8 md:p-12 border border-gray-100 dark:border-darkmode-border">
        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-bold text-center text-gray-900 dark:text-white mb-2">
          Escanea el Código QR
        </h1>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-8">
          Realiza tu pago escaneando el siguiente código
        </p>

        {/* QR Code */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 mb-6 shadow-lg border-2 border-gray-200 dark:border-darkmode-border">
          <div className="aspect-square w-full max-w-md mx-auto rounded-xl overflow-hidden bg-white">
            <img
              src={logoImage.src}
              alt="Código QR para pago"
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* Download Button */}
        <button
          onClick={handleDownloadQR}
          className="w-full bg-white dark:bg-darkmode-body text-primary border-2 border-primary py-3 px-6 rounded-xl font-semibold text-lg hover:bg-primary hover:text-white transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-3 mb-4 shadow-md"
        >
          <svg
            className="w-6 h-6"
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
          Descargar QR
        </button>

        {/* Info */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-4 mb-6">
          <div className="flex gap-3">
            <svg
              className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <div className="text-sm text-blue-800 dark:text-blue-200">
              <p className="font-semibold mb-1">¿Ya realizaste tu pago?</p>
              <p>
                Una vez completado el pago, haz clic en "Pago Realizado" para
                continuar con el formulario.
              </p>
            </div>
          </div>
        </div>

        {/* Payment Done Button */}
        <button
          onClick={handlePaymentDone}
          className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 px-6 rounded-xl font-bold text-lg shadow-xl shadow-green-500/30 hover:shadow-2xl hover:shadow-green-500/40 transition-all transform hover:-translate-y-1 active:translate-y-0 flex items-center justify-center gap-3"
        >
          <svg
            className="w-6 h-6"
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
          Pago Realizado
        </button>

        {/* Back Button */}
        <button
          onClick={() => setStep("notification")}
          className="w-full mt-4 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white py-2 px-6 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
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
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Volver
        </button>
      </div>
    </div>
  );
}
