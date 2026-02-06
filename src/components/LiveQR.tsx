import React, { useState } from "react";
import logoImage from "@/assets/logo.webp";

export default function LiveQR() {
  const [showModal, setShowModal] = useState(true);

  const handleContinue = () => {
    setShowModal(false);
  };

  const handlePaymentDone = () => {
    window.location.href = "/live";
  };

  const handleDownloadQR = () => {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-white to-red-50 dark:from-darkmode-body dark:via-darkmode-light dark:to-darkmode-body flex items-center justify-center p-4">
      {/* Main QR Content - Always visible but blurred when modal is open */}
      <div className={`max-w-2xl w-full bg-white dark:bg-darkmode-light rounded-3xl shadow-2xl p-6 sm:p-8 md:p-12 border border-gray-100 dark:border-darkmode-border transition-all duration-500 ${showModal ? 'blur-sm scale-95' : 'blur-0 scale-100'}`}>
        {/* Title */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-gray-900 dark:text-white mb-2">
          Escanea el Código QR
        </h1>
        <p className="text-center text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6 sm:mb-8">
          Realiza tu pago escaneando el siguiente código
        </p>

        {/* QR Code */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6 shadow-lg border-2 border-gray-200 dark:border-darkmode-border">
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
          disabled={showModal}
          className="w-full bg-white dark:bg-darkmode-body text-primary border-2 border-primary py-3 px-4 sm:px-6 rounded-xl font-semibold text-base sm:text-lg hover:bg-primary hover:text-white transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg
            className="w-5 h-5 sm:w-6 sm:h-6"
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
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="flex gap-2 sm:gap-3">
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <div className="text-xs sm:text-sm text-blue-800 dark:text-blue-200">
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
          disabled={showModal}
          className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 sm:py-4 px-4 sm:px-6 rounded-xl font-bold text-base sm:text-lg shadow-xl shadow-green-500/30 hover:shadow-2xl hover:shadow-green-500/40 transition-all transform hover:-translate-y-1 active:translate-y-0 flex items-center justify-center gap-2 sm:gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg
            className="w-5 h-5 sm:w-6 sm:h-6"
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
      </div>

      {/* Modal Overlay - Instructions */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="max-w-2xl w-full bg-white dark:bg-darkmode-light rounded-3xl shadow-2xl p-6 sm:p-8 md:p-12 border border-gray-100 dark:border-darkmode-border max-h-[90vh] overflow-y-auto animate-slideUp">

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-gray-900 dark:text-white mb-4 sm:mb-6">
              ¡IMPORTANTE!
            </h1>

            {/* Instructions */}
            <div className="bg-gradient-to-r from-primary/5 to-red-50 dark:from-primary/10 dark:to-red-900/10 rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 border border-primary/20">

              <ol className="space-y-3 sm:space-y-4">
                <li className="flex items-start gap-2 sm:gap-3">
                  <span className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold text-xs sm:text-sm">
                    1
                  </span>
                  <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 pt-0.5 sm:pt-1">
                    <strong className="text-gray-900 dark:text-white">
                      Escanea el código QR
                    </strong>{" "}
                    que verás al cerrar este mensaje
                  </p>
                </li>

                <li className="flex items-start gap-2 sm:gap-3">
                  <span className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold text-xs sm:text-sm">
                    2
                  </span>
                  <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 pt-0.5 sm:pt-1">
                    <strong className="text-gray-900 dark:text-white">
                      Realiza tu pago
                    </strong>{" "}
                    utilizando el método de tu preferencia
                  </p>
                </li>

                <li className="flex items-start gap-2 sm:gap-3">
                  <span className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold text-xs sm:text-sm">
                    3
                  </span>
                  <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 pt-0.5 sm:pt-1">
                    <strong className="text-gray-900 dark:text-white">
                      Llena el formulario
                    </strong>{" "}
                    con tus datos y sube las capturas de tus productos y el comprobante de pago
                  </p>
                </li>
              </ol>
            </div>
            {/* Continue Button */}
            <button
              onClick={handleContinue}
              className="w-full bg-gradient-to-r from-primary to-red-600 text-white py-3 sm:py-4 px-4 sm:px-6 rounded-xl font-bold text-base sm:text-lg shadow-xl shadow-primary/30 hover:shadow-2xl hover:shadow-primary/40 transition-all transform hover:-translate-y-1 active:translate-y-0 flex items-center justify-center gap-2 sm:gap-3"
            >
              Continuar
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6"
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
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.4s ease-out;
        }
      `}</style>
    </div>
  );
}
