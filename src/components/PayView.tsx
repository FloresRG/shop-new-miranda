import React, { useState, useEffect } from "react";
import {
  FaSpinner,
  FaCheckCircle,
  FaTimesCircle,
  FaBoxOpen,
  FaUser,
  FaMapMarkerAlt,
} from "react-icons/fa";

// Tipos basados en PedidoView
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

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cod = params.get("cod");

    if (cod) {
      // Asumir que cod es {id}-{ci}-{celular}
      const parts = cod.split("-");
      if (parts.length === 3) {
        const [id, ci, celular] = parts;
        fetchPedido(id, ci, celular);
      } else {
        setError("Código inválido. El formato esperado es id-ci-celular.");
        setLoading(false);
      }
    } else {
      setError("Código no proporcionado.");
      setLoading(false);
    }
  }, []);

  const fetchPedido = async (id: string, ci: string, celular: string) => {
    setLoading(true);
    setError(null);

    try {
      const API_BASE = "https://importadoramiranda.com/api";
      const url = `${API_BASE}/pay?id=${id}&ci=${encodeURIComponent(ci)}&celular=${encodeURIComponent(celular)}`;

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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
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
      <div className="text-center py-16">
        <div className="bg-red-50 dark:bg-red-900/10 p-6 rounded-2xl border border-red-100 dark:border-red-900/30 shadow-sm inline-block max-w-sm w-full mx-auto">
          <FaTimesCircle
            className="text-5xl mx-auto mb-4"
            style={{ color: COLORS.danger }}
          />
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
            Error
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">{error}</p>
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
    <div className="max-w-4xl mx-auto space-y-6 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
          Información del Pedido
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Detalles para proceder con el pago
        </p>
      </div>

      <div className="bg-white dark:bg-darkmode-light p-6 rounded-3xl shadow-lg border border-gray-100 dark:border-darkmode-border">
        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100 dark:border-darkmode-border">
          <FaUser style={{ color: COLORS.secondary }} className="text-xl" />
          <h3 className="font-bold text-gray-800 dark:text-white text-lg">
            Datos del Cliente
          </h3>
        </div>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">Nombre</span>
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
            <span className="text-gray-500 dark:text-gray-400">Celular</span>
            <span className="font-semibold text-gray-800 dark:text-white text-right">
              {pedido.cuaderno.celular}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">
              Departamento
            </span>
            <span className="font-semibold text-gray-800 dark:text-white text-right">
              {pedido.cuaderno.departamento}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">Provincia</span>
            <span className="font-semibold text-gray-800 dark:text-white text-right">
              {pedido.cuaderno.provincia}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-darkmode-light p-6 rounded-3xl shadow-lg border border-gray-100 dark:border-darkmode-border">
        <div className="flex items-center gap-3 mb-6">
          <FaBoxOpen style={{ color: COLORS.secondary }} className="text-xl" />
          <h3 className="font-bold text-gray-800 dark:text-white text-lg">
            Productos
          </h3>
        </div>
        <div className="space-y-4">
          {pedido.productos.map((item, idx) => (
            <div
              key={idx}
              className="flex justify-between items-center p-4 rounded-2xl bg-gray-50 dark:bg-darkmode-body"
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
            Total a Pagar
          </span>
          <span className="text-xl font-bold" style={{ color: COLORS.primary }}>
            {total.toFixed(2)} Bs
          </span>
        </div>
      </div>

      <div className="text-center">
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Escanea el QR enviado a tu WhatsApp para realizar el pago.
        </p>
        <button
          onClick={() => window.history.back()}
          className="px-8 py-3 rounded-full font-bold text-white shadow-lg"
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
