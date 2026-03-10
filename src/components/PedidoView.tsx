// src/components/PedidoView.tsx
import React, { useState, useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import {
  FaCamera,
  FaImage,
  FaCheckCircle,
  FaTimesCircle,
  FaBoxOpen,
  FaTruck,
  FaUser,
  FaMapMarkerAlt,
  FaSpinner,
} from "react-icons/fa";

// Tipos actualizados
interface ProductoDetalle {
  producto_id: number;
  nombre: string;
  cantidad: number;
  precio_venta: number;
  subtotal: number;
}

interface CuadernoData {
  id: number;
  nombre: string;
  ci: string;
  celular: string;
  departamento: string;
  provincia: string;
  tipo: string | null;
  estado: string | null;
  detalle: string | null;
  la_paz: boolean;
  enviado: boolean;
  p_listo: boolean;
  p_pendiente: boolean;
  created_at: string;
}

interface ImagenesData {
  producto: string[];
  comprobante: string[];
  guia: string[];
  guia_base64?: string[]; // ← Añadido para descarga directa
}

interface PedidoData {
  cuaderno: CuadernoData;
  productos: ProductoDetalle[];
  imagenes: ImagenesData; // ← Añadido
}

// Colores Premium
const COLORS = {
  primary: "#F2275D",
  secondary: "#451773",
  accent: "#17BFBF",
  danger: "#F20505",
  success: "#10B981",
};

const PedidoView: React.FC = () => {
  const [pedido, setPedido] = useState<PedidoData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<
    "selection" | "initial" | "camera" | "result" | "manual"
  >("selection");
  const [manualId, setManualId] = useState("");
  const [manualCi, setManualCi] = useState("");
  const [manualCelular, setManualCelular] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    const ci = params.get("ci");
    const celular = params.get("celular");

    if (id && ci && celular) {
      fetchPedido(id, ci, celular);
    }
  }, []);

  const fetchPedido = async (id: string, ci: string, celular: string) => {
    setLoading(true);
    setError(null);
    setViewMode("result");

    try {
      const API_BASE = "https://importadoramiranda.com/api"; // ✅ Sin espacios
      const url = `${API_BASE}/qrverificacion?id=${id}&ci=${encodeURIComponent(ci)}&celular=${encodeURIComponent(celular)}`;

      const res = await fetch(url);
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            "Pedido no encontrado o credenciales incorrectas.",
        );
      }

      const data: PedidoData = await res.json();
      setPedido(data);
    } catch (err: any) {
      setError(err.message || "Error al cargar el pedido.");
      setPedido(null);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const target = e.target;
    if (!target.files || target.files.length === 0) return;

    const file = target.files[0];
    const elementId = "reader-hidden";

    try {
      setLoading(true);
      const html5QrCode = new Html5Qrcode(elementId);
      const decodedText = await html5QrCode.scanFile(file, true);
      await html5QrCode.clear();
      processScannedUrl(decodedText);
    } catch (err) {
      console.error("Error scanning file", err);
      try {
        const temp = new Html5Qrcode(elementId);
        await temp.clear();
      } catch (e) {}
      alert("No se pudo leer el código QR. Intenta con una imagen más clara.");
      setLoading(false);
    }
  };

  useEffect(() => {
    let html5QrcodeScanner: Html5Qrcode | null = null;
    let isMounted = true;

    if (viewMode === "camera") {
      const startScanner = async () => {
        try {
          html5QrcodeScanner = new Html5Qrcode("reader-camera");
          await html5QrcodeScanner.start(
            { facingMode: "environment" },
            { fps: 10, qrbox: { width: 250, height: 250 } },
            (decodedText) => {
              if (isMounted) {
                html5QrcodeScanner
                  ?.stop()
                  .then(() => html5QrcodeScanner?.clear())
                  .catch(console.error);
                processScannedUrl(decodedText);
              }
            },
            () => {},
          );
        } catch (err) {
          console.error("Error starting camera", err);
          alert("Error al iniciar la cámara. Asegúrate de permitir el acceso.");
          setViewMode("initial");
        }
      };
      startScanner();
    }

    return () => {
      isMounted = false;
      if (html5QrcodeScanner && html5QrcodeScanner.isScanning) {
        html5QrcodeScanner
          .stop()
          .then(() => html5QrcodeScanner?.clear())
          .catch(() => {});
      }
    };
  }, [viewMode]);

  const processScannedUrl = (urlStr: string) => {
    try {
      const url = new URL(urlStr);
      const newId = url.searchParams.get("id");
      const newCi = url.searchParams.get("ci");
      const newCelular = url.searchParams.get("celular");

      if (newId && newCi && newCelular) {
        const newBrowserUrl = `${window.location.origin}${window.location.pathname}?id=${newId}&ci=${encodeURIComponent(newCi)}&celular=${encodeURIComponent(newCelular)}`;
        window.history.pushState({}, "", newBrowserUrl);
        fetchPedido(newId, newCi, newCelular);
      } else {
        alert("El QR no contiene los parámetros necesarios (id, ci, celular).");
        setLoading(false);
      }
    } catch (e) {
      alert("El contenido escaneado no es una URL válida.");
      setLoading(false);
    }
  };

  const resetView = () => {
    window.history.pushState({}, "", window.location.pathname);
    setPedido(null);
    setError(null);
    setViewMode("selection");
    setManualId("");
    setManualCi("");
    setManualCelular("");
  };

  const downloadImage = async (
    data: string,
    fileName: string,
    isBase64: boolean = false,
  ) => {
    try {
      let downloadUrl = data;

      if (isBase64) {
        // Lógica similar al PDF: procesar Base64 directamente
        const byteString = atob(data);
        const arrayBuffer = new ArrayBuffer(byteString.length);
        const uint8Array = new Uint8Array(arrayBuffer);
        for (let i = 0; i < byteString.length; i++) {
          uint8Array[i] = byteString.charCodeAt(i);
        }
        const blob = new Blob([uint8Array], { type: "image/png" });
        downloadUrl = URL.createObjectURL(blob);
      } else {
        // Intento de fetch convencional
        const response = await fetch(data);
        const blob = await response.blob();
        downloadUrl = URL.createObjectURL(blob);
      }

      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setTimeout(() => URL.revokeObjectURL(downloadUrl), 100);
    } catch (error) {
      console.error("Error downloading image:", error);
      // Fallback: abrir en nueva pestaña
      const fallbackUrl = data.startsWith("http")
        ? data
        : `https://importadoramiranda.com/storage/${data}`;
      window.open(fallbackUrl, "_blank");
    }
  };

  const renderMainContent = () => {
    if (error && viewMode === "result") {
      return (
        <div className="text-center animate-fade-in-up pt-2">
          <div className="bg-red-50 dark:bg-red-900/10 p-6 rounded-2xl border border-red-100 dark:border-red-900/30 shadow-sm inline-block max-w-sm w-full mx-auto">
            <FaTimesCircle
              className="text-5xl mx-auto mb-4"
              style={{ color: COLORS.danger }}
            />
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
              Registro no encontrado, por favor verifique los datos.
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">{error}</p>
            <button
              onClick={resetView}
              className="w-full py-3 rounded-xl font-bold text-white shadow-lg transform transition hover:-translate-y-1"
              style={{
                background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.danger} 100%)`,
              }}
            >
              Intentar Nuevamente
            </button>
          </div>
        </div>
      );
    }

    if (pedido && viewMode === "result") {
      const total = pedido.productos.reduce(
        (acc, item) => acc + Number(item.subtotal),
        0,
      );
      const estadoLabel =
        pedido.cuaderno.estado ||
        (pedido.cuaderno.enviado ? "Enviado" : "Pendiente");
      const estadoClass = pedido.cuaderno.enviado
        ? "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400"
        : "bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400";

      return (
        <div className="space-y-6 animate-fade-in-up max-w-3xl mx-auto pt-2">
          {/* Encabezado de verificación */}
          <div
            className="bg-white dark:bg-darkmode-light rounded-3xl p-6 shadow-xl border-t-8 border-gray-100 dark:border-darkmode-border relative overflow-hidden"
            style={{ borderColor: COLORS.success }}
          >
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <FaCheckCircle size={100} color={COLORS.success} />
            </div>
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/20">
                <FaCheckCircle className="text-3xl text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wide font-bold">
                  Estado del Pedido
                </p>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                  Verificado Exitosamente
                </h2>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 dark:bg-darkmode-body text-gray-700 dark:text-gray-300">
                ID: #{pedido.cuaderno.id}
              </span>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${estadoClass}`}
              >
                {estadoLabel}
              </span>
            </div>
          </div>

          {/* Datos del cliente y ubicación */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-darkmode-light p-6 rounded-3xl shadow-lg border border-gray-100 dark:border-darkmode-border">
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100 dark:border-darkmode-border">
                <FaUser
                  style={{ color: COLORS.secondary }}
                  className="text-xl"
                />
                <h3 className="font-bold text-gray-800 dark:text-white text-lg">
                  Datos del Cliente
                </h3>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">
                    Nombre
                  </span>
                  <span className="font-semibold text-gray-800 dark:text-white text-right">
                    {pedido.cuaderno.nombre}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">
                    Cédula (CI)
                  </span>
                  <span className="font-semibold text-gray-800 dark:text-white text-right">
                    {pedido.cuaderno.ci}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">
                    Celular
                  </span>
                  <a
                    href={`https://wa.me/591${pedido.cuaderno.celular.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-right hover:underline"
                    style={{ color: COLORS.accent }}
                  >
                    {pedido.cuaderno.celular}
                  </a>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-darkmode-light p-6 rounded-3xl shadow-lg border border-gray-100 dark:border-darkmode-border">
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100 dark:border-darkmode-border">
                <FaMapMarkerAlt
                  style={{ color: COLORS.primary }}
                  className="text-xl"
                />
                <h3 className="font-bold text-gray-800 dark:text-white text-lg">
                  Ubicación
                </h3>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">
                    Departamento
                  </span>
                  <span className="font-semibold text-gray-800 dark:text-white text-right">
                    {pedido.cuaderno.departamento}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">
                    Provincia
                  </span>
                  <span className="font-semibold text-gray-800 dark:text-white text-right">
                    {pedido.cuaderno.provincia}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Productos */}
          {/* <div className="bg-white dark:bg-darkmode-light p-6 rounded-3xl shadow-lg border border-gray-100 dark:border-darkmode-border">
            <div className="flex items-center gap-3 mb-6">
              <FaBoxOpen
                style={{ color: COLORS.secondary }}
                className="text-xl"
              />
              <h3 className="font-bold text-gray-800 dark:text-white text-lg">
                Productos
              </h3>
            </div>
            <div className="space-y-4">
              {pedido.productos.map((item, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center p-4 rounded-2xl bg-gray-50 dark:bg-darkmode-body hover:bg-gray-100 dark:hover:bg-darkmode-border transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs"
                      style={{ backgroundColor: COLORS.secondary }}
                    >
                      {item.cantidad}x
                    </div>
                    <span className="font-medium text-gray-800 dark:text-white">
                      {item.nombre}
                    </span>
                  </div>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {Number(item.subtotal).toFixed(2)} Bs
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t border-gray-100 dark:border-darkmode-border flex justify-end items-center gap-2">
              <span className="text-gray-500 dark:text-gray-400 text-sm">
                Total Pedido
              </span>
              <span
                className="text-xl font-bold"
                style={{ color: COLORS.primary }}
              >
                {total.toFixed(2)} Bs
              </span>
            </div>
          </div> */}

          {/* Imágenes */}
          {pedido.imagenes && (
            <>
              {(pedido.imagenes.producto.length > 0 ||
                pedido.imagenes.comprobante.length > 0 ||
                (pedido.imagenes.guia && pedido.imagenes.guia.length > 0)) && (
                <div className="bg-white dark:bg-darkmode-light p-6 rounded-3xl shadow-lg border border-gray-100 dark:border-darkmode-border">
                  <div className="flex items-center gap-3 mb-6">
                    <FaTruck
                      style={{ color: COLORS.primary }}
                      className="text-xl"
                    />
                    <h3 className="font-bold text-gray-800 dark:text-white text-lg">
                      Seguimiento del Envío
                    </h3>
                  </div>

                  {pedido.imagenes.producto.length > 0 && (
                    <div className="mb-6">
                      <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                        Fotos de tus Productos
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {pedido.imagenes.producto.map((img, idx) => (
                          <a
                            key={`prod-${idx}`}
                            href={`https://importadoramiranda.com/storage/${img}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block aspect-square rounded-xl overflow-hidden border border-gray-200 dark:border-darkmode-border hover:opacity-90 transition"
                          >
                            <img
                              src={`https://importadoramiranda.com/storage/${img}`}
                              alt={`Producto ${idx + 1}`}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {pedido.imagenes.comprobante.length > 0 && (
                    <div className="mb-8">
                      <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                        Tus Comprobantes
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {pedido.imagenes.comprobante.map((img, idx) => (
                          <a
                            key={`comp-${idx}`}
                            href={`https://importadoramiranda.com/storage/${img}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block aspect-square rounded-xl overflow-hidden border border-gray-200 dark:border-darkmode-border hover:opacity-90 transition"
                          >
                            <img
                              src={`https://importadoramiranda.com/storage/${img}`}
                              alt={`Comprobante ${idx + 1}`}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Sección de Guía - Ahora debajo de Comprobantes */}
                  <div className="mt-8 p-6 rounded-3xl bg-gray-50 dark:bg-darkmode-body border-2 border-dashed border-gray-200 dark:border-darkmode-border">
                    {pedido.imagenes.guia && pedido.imagenes.guia.length > 0 ? (
                      <div className="text-center flex flex-col items-center">
                        <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 mb-4">
                          <FaCheckCircle size={32} />
                        </div>
                        <h4 className="text-xl font-black text-gray-800 dark:text-white mb-2">
                          ¡Felicidades! Tu pedido se envió
                        </h4>
                        <p className="text-gray-500 dark:text-gray-400 mb-6 font-medium">
                          Esta es tu guía de despacho oficial:
                        </p>

                        <div className="w-full max-w-sm mx-auto space-y-4">
                          {pedido.imagenes.guia.map((img, idx) => (
                            <div
                              key={`guia-cont-${idx}`}
                              className="flex flex-col items-center gap-3"
                            >
                              <a
                                href={`https://importadoramiranda.com/storage/${img}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block w-full rounded-2xl overflow-hidden border-2 border-white dark:border-darkmode-light shadow-2xl hover:scale-[1.02] transition-transform duration-300"
                              >
                                <img
                                  src={`https://importadoramiranda.com/storage/${img}`}
                                  alt={`Guía de Envío ${idx + 1}`}
                                  className="w-full h-auto object-cover"
                                  loading="lazy"
                                />
                              </a>
                              <button
                                onClick={() => {
                                  if (
                                    pedido.imagenes.guia_base64 &&
                                    pedido.imagenes.guia_base64[idx]
                                  ) {
                                    downloadImage(
                                      pedido.imagenes.guia_base64[idx],
                                      `guia-envio-${pedido.cuaderno.id}.png`,
                                      true,
                                    );
                                  } else {
                                    downloadImage(
                                      `https://importadoramiranda.com/storage/${img}`,
                                      `guia-envio-${pedido.cuaderno.id}.png`,
                                      false,
                                    );
                                  }
                                }}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-[#F2275D] text-white font-bold rounded-xl shadow-lg hover:bg-[#D11F4E] transition-all transform active:scale-95 border-none"
                              >
                                <FaTruck />
                                Descargar Guía
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                          <FaSpinner className="text-amber-600 animate-spin text-2xl" />
                        </div>
                        <p className="font-bold text-gray-800 dark:text-white text-lg">
                          Pronto estará listo para enviar
                        </p>
                        <p className="text-gray-500 dark:text-gray-400">
                          Estamos procesando tu despacho. Vuelve a consultar
                          pronto.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Botón final */}
          <div className="text-center pt-8">
            <button
              onClick={resetView}
              className="px-8 py-3 rounded-full font-bold text-white shadow-lg transform transition hover:-translate-y-1 hover:shadow-xl"
              style={{
                background: `linear-gradient(135deg, ${COLORS.secondary} 0%, ${COLORS.primary} 100%)`,
              }}
            >
              Verificar Otro Comprobante
            </button>
          </div>
        </div>
      );
    }

    if (viewMode === "camera") {
      return (
        <div className="max-w-md mx-auto animate-fade-in pt-8">
          <h2 className="text-2xl font-bold text-center mb-6 text-gray-800 dark:text-white">
            Escaneando QR
          </h2>
          <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-black aspect-square mb-6">
            <div id="reader-camera" className="w-full h-full"></div>
            <div className="absolute inset-0 border-2 border-white/30 pointer-events-none rounded-3xl"></div>
          </div>
          <button
            onClick={() => setViewMode("initial")}
            className="w-full py-4 bg-gray-100 dark:bg-darkmode-light text-gray-700 dark:text-white font-bold rounded-2xl hover:bg-gray-200 dark:hover:bg-darkmode-border transition"
          >
            Cancelar Escaneo
          </button>
        </div>
      );
    }

    if (viewMode === "selection") {
      return (
        <div className="max-w-md mx-auto space-y-6 py-2 animate-fade-in">
          <div className="text-center mb-10">
            <div className="w-20 h-20 mx-auto bg-gradient-to-tr from-[#F2275D] to-[#451773] rounded-3xl flex items-center justify-center shadow-lg transform rotate-3 mb-6">
              <FaBoxOpen className="text-4xl text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-3">
              Verifica tu Pedido
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              Selecciona una opción para continuar
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <button
              onClick={() => setViewMode("initial")}
              className="group relative overflow-hidden p-6 rounded-3xl bg-white dark:bg-darkmode-light shadow-xl border border-gray-100 dark:border-darkmode-border transition-all hover:-translate-y-2 hover:shadow-2xl text-left"
            >
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#17BFBF] to-[#451773] flex items-center justify-center text-white shadow-inner">
                  <FaCamera size={26} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 dark:text-white text-xl">
                    Verificar por QR
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Usa tu cámara o sube una imagen
                  </p>
                </div>
              </div>
            </button>

            <button
              onClick={() => setViewMode("manual")}
              className="group relative overflow-hidden p-6 rounded-3xl bg-white dark:bg-darkmode-light shadow-xl border border-gray-100 dark:border-darkmode-border transition-all hover:-translate-y-2 hover:shadow-2xl text-left"
            >
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#F2275D] to-[#451773] flex items-center justify-center text-white shadow-inner">
                  <FaUser size={26} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 dark:text-white text-xl">
                    Verificar con mis datos
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Número de pedido, CI y celular
                  </p>
                </div>
              </div>
            </button>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-100 dark:border-darkmode-border text-center">
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Shop Importadora Miranda &copy; {new Date().getFullYear()}
            </p>
          </div>
        </div>
      );
    }

    if (viewMode === "manual") {
      return (
        <div className="max-w-md mx-auto animate-fade-in pt-2">
          <div className="bg-white dark:bg-darkmode-light p-8 rounded-[2.5rem] shadow-2xl border border-gray-50 dark:border-darkmode-border relative overflow-hidden">
            {/* Fondo decorativo */}
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-gradient-to-br from-[#F2275D]/10 to-[#451773]/10 rounded-full blur-2xl"></div>

            <button
              onClick={() => setViewMode("selection")}
              className="mb-6 flex items-center text-sm font-bold text-gray-400 hover:text-[#F2275D] transition-colors"
            >
              <FaTimesCircle className="mr-2" /> Volver atrás
            </button>

            <h2 className="text-2xl font-black text-gray-800 dark:text-white mb-6 flex items-center gap-3">
              <span className="w-2 h-8 bg-gradient-to-b from-[#F2275D] to-[#451773] rounded-full"></span>
              Datos del Pedido
            </h2>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (manualId && manualCi && manualCelular) {
                  fetchPedido(manualId, manualCi, manualCelular);
                } else {
                  alert("Por favor, completa todos los campos.");
                }
              }}
              className="space-y-5"
            >
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">
                  Numero de tu Pedido
                </label>
                <input
                  type="text"
                  placeholder="Ingresa tu número de pedido"
                  value={manualId}
                  onChange={(e) => setManualId(e.target.value)}
                  className="w-full px-5 py-4 bg-gray-50 dark:bg-darkmode-body border-2 border-transparent focus:border-[#F2275D] dark:focus:border-[#F2275D] rounded-2xl outline-none transition-all font-semibold text-gray-800 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">
                  Cédula de Identidad (CI)
                </label>
                <input
                  type="text"
                  placeholder="Tu número de carnet"
                  value={manualCi}
                  onChange={(e) => setManualCi(e.target.value)}
                  className="w-full px-5 py-4 bg-gray-50 dark:bg-darkmode-body border-2 border-transparent focus:border-[#F2275D] dark:focus:border-[#F2275D] rounded-2xl outline-none transition-all font-semibold text-gray-800 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">
                  Número de Celular
                </label>
                <input
                  type="tel"
                  placeholder="Ingresa tu número de celular"
                  value={manualCelular}
                  onChange={(e) => setManualCelular(e.target.value)}
                  className="w-full px-5 py-4 bg-gray-50 dark:bg-darkmode-body border-2 border-transparent focus:border-[#F2275D] dark:focus:border-[#F2275D] rounded-2xl outline-none transition-all font-semibold text-gray-800 dark:text-white"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-5 mt-4 rounded-2xl font-black text-white shadow-xl transform transition hover:-translate-y-1 hover:shadow-2xl active:scale-95"
                style={{
                  background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.secondary} 100%)`,
                }}
              >
                VERIFICAR AHORA
              </button>
            </form>
          </div>
        </div>
      );
    }

    if (viewMode === "camera") {
      return (
        <div className="max-w-md mx-auto animate-fade-in pt-8">
          <button
            onClick={() => setViewMode("initial")}
            className="mb-6 flex items-center text-sm font-bold text-gray-400 hover:text-[#F2275D] transition-colors"
          >
            <FaTimesCircle className="mr-2" /> Cancelar escaneo
          </button>

          <h2 className="text-2xl font-bold text-center mb-6 text-gray-800 dark:text-white">
            Escaneando QR
          </h2>
          <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-black aspect-square mb-6">
            <div id="reader-camera" className="w-full h-full"></div>
            <div className="absolute inset-0 border-2 border-white/30 pointer-events-none rounded-3xl"></div>
          </div>
        </div>
      );
    }

    return (
      <div className="max-w-md mx-auto space-y-6 py-2 animate-fade-in">
        <div className="text-center mb-8">
          <button
            onClick={() => setViewMode("selection")}
            className="mb-6 flex items-center text-sm font-bold text-gray-400 hover:text-[#F2275D] transition-colors mx-auto"
          >
            <FaTimesCircle className="mr-2" /> Volver al menú principal
          </button>

          <div className="w-20 h-20 mx-auto bg-gradient-to-tr from-[#F2275D] to-[#451773] rounded-3xl flex items-center justify-center shadow-lg transform rotate-3 mb-4">
            <FaCamera className="text-4xl text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
            Verificar por QR
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            Escanea el código QR de tu comprobante digital
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => setViewMode("camera")}
            className="w-full py-4 px-6 rounded-2xl shadow-lg border border-transparent flex items-center justify-between group transition-all hover:-translate-y-1"
            style={{
              background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.secondary} 100%)`,
            }}
          >
            <div className="text-left">
              <span className="block text-white font-bold text-lg">
                Usar Cámara
              </span>
              <span className="block text-white/80 text-sm">
                Escanea directamente
              </span>
            </div>
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <FaCamera className="text-white text-xl" />
            </div>
          </button>

          <div className="relative">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-4 px-6 rounded-2xl bg-white dark:bg-darkmode-light shadow-lg border border-gray-100 dark:border-darkmode-border flex items-center justify-between group transition-all hover:bg-gray-50 dark:hover:bg-darkmode-body hover:-translate-y-1"
            >
              <div className="text-left">
                <span className="block text-gray-800 dark:text-white font-bold text-lg">
                  Subir Imagen
                </span>
                <span className="block text-gray-500 dark:text-gray-400 text-sm">
                  Desde tu galería
                </span>
              </div>
              <div className="w-10 h-10 bg-gray-100 dark:bg-darkmode-body rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <FaImage style={{ color: COLORS.accent }} className="text-xl" />
              </div>
            </button>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-100 dark:border-darkmode-border text-center">
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Shop Importadora Miranda &copy; {new Date().getFullYear()}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="relative min-h-[50vh]">
      <div
        id="reader-hidden"
        style={{
          position: "fixed",
          top: "-10000px",
          left: "-10000px",
          width: "300px",
          height: "300px",
        }}
      ></div>

      {loading && (
        <div className="absolute inset-0 z-50 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center animate-fade-in rounded-3xl">
          <FaSpinner
            className="text-4xl animate-spin mb-4"
            style={{ color: COLORS.accent }}
          />
          <p className="text-gray-600 font-medium">Procesando...</p>
        </div>
      )}

      <div className={loading ? "opacity-50 pointer-events-none" : ""}>
        {renderMainContent()}
      </div>
    </div>
  );
};

export default PedidoView;
