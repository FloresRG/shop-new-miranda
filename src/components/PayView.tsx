import React, { useState, useEffect, useRef } from "react";
import {
  FaSpinner,
  FaCheckCircle,
  FaTimesCircle,
  FaBoxOpen,
  FaUser,
  FaUpload,
} from "react-icons/fa";

// Tipos
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

interface PedidoData {
  cuaderno: CuadernoData;
  productos: ProductoDetalle[];
}

const COLORS = {
  primary: "#F2275D",
  secondary: "#451773",
  accent: "#17BFBF",
  danger: "#F20505",
  success: "#10B981",
};

const PayView: React.FC = () => {
  const [pedido, setPedido] = useState<PedidoData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadSuccess, setUploadSuccess] = useState<boolean>(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cod = params.get("codigo");

    if (cod) {
      if (cod.length < 5) {
        setError("Código inválido. Debe contener al menos 5 dígitos.");
        setLoading(false);
        return;
      }

      // Los últimos 4 dígitos: 2 del CI + 2 del celular
      const last4 = cod.slice(-4);
      const ciShort = last4.substring(0, 2);
      const celularShort = last4.substring(2, 4);
      const id = cod.slice(0, -4); // Todo lo anterior es el ID

      // Validar que sean solo dígitos
      if (
        !/^\d+$/.test(id) ||
        !/^\d{2}$/.test(ciShort) ||
        !/^\d{2}$/.test(celularShort)
      ) {
        setError("Código inválido. Debe contener solo números.");
        setLoading(false);
        return;
      }

      fetchPedido(id, ciShort, celularShort);
    } else {
      setError("Código no proporcionado.");
      setLoading(false);
    }
  }, []);

  const fetchPedido = async (id: string, ci: string, celular: string) => {
    setLoading(true);
    setError(null);

    try {
      const url = `https://importadoramiranda.com/api/pay?id=${id}&ci=${encodeURIComponent(ci)}&celular=${encodeURIComponent(celular)}`;
      const res = await fetch(url);

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Pedido no encontrado.");
      }

      const data: PedidoData = await res.json();
      setPedido(data);
    } catch (err: any) {
      console.error("Error al cargar el pedido:", err);
      setError(err.message || "No se pudo cargar el pedido.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReceiptFile(file);
      if (file.type.startsWith("image/")) {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      } else {
        setPreviewUrl(null);
      }
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setReceiptFile(file);
      if (file.type.startsWith("image/")) {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      } else {
        setPreviewUrl(null);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleUploadReceipt = async () => {
    if (!receiptFile || !pedido) return;

    const formData = new FormData();
    formData.append("id", pedido.cuaderno.id.toString());
    formData.append("ci", pedido.cuaderno.ci || "");
    formData.append("celular", pedido.cuaderno.celular);
    formData.append("comprobante", receiptFile);

    setUploading(true);
    try {
      const res = await fetch(
        "https://importadoramiranda.com/api/pay/comprobante",
        {
          method: "POST",
          body: formData,
        },
      );

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Error al subir el comprobante.");
      }

      const responseData = await res.json();

      setUploadSuccess(true);

      if (responseData.whatsapp_connected === false) {
        const mensaje = `Hola, me pongo en contacto para informarles que mi pedido es el número: #${pedido.cuaderno.id}.\n\nAgradezco su atención y quedo atento(a) a su confirmación respecto a este pedido.`;
        window.open(
          `https://wa.me/59170621016?text=${encodeURIComponent(mensaje)}`,
          "_blank",
        );

        // ✅ DESCARGA AUTOMÁTICA DEL PDF
        const pdfBase64 = responseData.pdf_base64;
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
            link.download = `pedido_${pedido.cuaderno.id}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
          } catch (err) {
            console.error("Error al procesar el PDF:", err);
            alert("No se pudo generar el comprobante.");
          }
        } else {
          alert("Comprobante no disponible.");
        }
      }

      alert("✅ Comprobante subido exitosamente. ¡Gracias!");
    } catch (err: any) {
      console.error("Error:", err);
      alert("❌ " + (err.message || "No se pudo subir el comprobante."));
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen py-16">
        <FaSpinner
          className="text-4xl animate-spin mb-4"
          style={{ color: COLORS.accent }}
        />
        <p className="text-gray-600 font-medium">
          Cargando información del pedido...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center py-16">
        <div className="bg-red-50 dark:bg-red-900/10 p-8 rounded-2xl border border-red-100 dark:border-red-900/30 shadow-sm max-w-md w-full text-center">
          <FaTimesCircle
            className="text-5xl mx-auto mb-4"
            style={{ color: COLORS.danger }}
          />
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
            Error
          </h2>
          <p className="text-gray-600 dark:text-gray-300">{error}</p>
        </div>
      </div>
    );
  }

  if (!pedido) return null;

  const total = pedido.productos.reduce(
    (acc, item) => acc + Number(item.subtotal),
    0,
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
          Confirmación de Pago
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Revisa tu pedido y sube el comprobante de pago
        </p>
      </div>

      {/* ✅ LAYOUT PRINCIPAL: IZQUIERDA = DATOS | DERECHA = COMPROBANTE */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* 👈 LADO IZQUIERDO: CLIENTE + PRODUCTOS */}
        <div className="space-y-6">
          {/* Cliente */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <FaUser className="text-xl text-[#451773]" />
              </div>
              <h2 className="font-bold text-gray-800 dark:text-white text-lg">
                Cliente
              </h2>
            </div>
            <div className="space-y-3 text-sm">
              {[
                { label: "Nombre", value: pedido.cuaderno.nombre },
                { label: "Cédula (CI)", value: pedido.cuaderno.ci },
                { label: "Celular", value: pedido.cuaderno.celular },
                { label: "Departamento", value: pedido.cuaderno.departamento },
                { label: "Provincia", value: pedido.cuaderno.provincia },
              ].map((item, i) => (
                <div key={i} className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">
                    {item.label}
                  </span>
                  <span className="font-medium text-gray-800 dark:text-white text-right">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Productos */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                <FaBoxOpen className="text-xl text-indigo-600 dark:text-indigo-400" />
              </div>
              <h2 className="font-bold text-gray-800 dark:text-white text-lg">
                Productos
              </h2>
            </div>
            <div className="space-y-4">
              {pedido.productos.map((item, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-start p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50"
                >
                  <div className="flex items-start gap-3">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#451773] text-white text-xs font-bold">
                      {item.cantidad}
                    </span>
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
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-300 font-medium">
                Total a pagar
              </span>
              <span
                className="text-2xl font-bold"
                style={{ color: COLORS.primary }}
              >
                {total.toFixed(2)} Bs
              </span>
            </div>
          </div>
        </div>

        {/* 👉 LADO DERECHO: SUBIR COMPROBANTE */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <FaCheckCircle className="text-xl text-green-600 dark:text-green-400" />
            </div>
            <h2 className="font-bold text-gray-800 dark:text-white text-lg">
              Subir Comprobante
            </h2>
          </div>

          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Una vez realizado el pago, adjunta tu comprobante para confirmar la
            transacción.
          </p>

          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={handleClick}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${previewUrl
              ? "border-[#F2275D] bg-pink-50 dark:bg-pink-900/10"
              : "border-gray-300 dark:border-gray-600 hover:border-[#F2275D]"
              }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf"
              onChange={handleFileChange}
              className="hidden"
            />
            {previewUrl ? (
              <div className="space-y-3">
                <img
                  src={previewUrl}
                  alt="Vista previa"
                  className="max-h-48 mx-auto rounded-lg shadow object-contain"
                />
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate px-2">
                  {receiptFile?.name}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                  <FaUpload className="text-2xl text-gray-500 dark:text-gray-400" />
                </div>
                <p className="font-medium text-gray-800 dark:text-white">
                  Arrastra tu comprobante aquí
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  o{" "}
                  <span className="text-[#F2275D] font-semibold">
                    haz clic para buscar
                  </span>
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  JPG, PNG o PDF (máx. 5 MB)
                </p>
              </div>
            )}
          </div>

          {receiptFile && (
            <button
              onClick={handleUploadReceipt}
              disabled={uploading || uploadSuccess}
              className={`mt-6 w-full py-3 rounded-xl font-semibold text-white shadow-md transition-all ${uploadSuccess
                ? "bg-green-500"
                : uploading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-[#F2275D] to-[#F20505] hover:opacity-90"
                }`}
            >
              {uploading ? (
                <>
                  <FaSpinner className="inline-block animate-spin mr-2" />{" "}
                  Subiendo...
                </>
              ) : uploadSuccess ? (
                <>
                  <FaCheckCircle className="inline-block mr-2" /> ¡Subido con
                  éxito!
                </>
              ) : (
                "Confirmar Pago"
              )}
            </button>
          )}
        </div>
      </div>

      {/* Pie */}
      <div className="text-center mt-10">
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          ¿No has pagado aún? Escanea el QR que te enviamos por WhatsApp.
        </p>
        <button
          onClick={() => window.history.back()}
          className="px-6 py-3 rounded-full font-semibold text-white shadow-md"
          style={{
            background: `linear-gradient(135deg, ${COLORS.secondary} 0%, ${COLORS.primary} 100%)`,
          }}
        >
          Volver
        </button>
      </div>
    </div>
  );
};

export default PayView;
