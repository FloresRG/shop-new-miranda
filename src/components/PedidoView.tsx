// src/components/PedidoView.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { FaCamera, FaImage, FaCheckCircle, FaTimesCircle, FaBoxOpen, FaTruck, FaUser, FaMapMarkerAlt, FaSpinner, FaArrowLeft } from 'react-icons/fa';

// Tipos
interface ProductoDetalle {
  id_producto: number;
  nombre: string;
  cantidad: number;
  precio: number;
  total: number;
  imagen?: string;
}

interface PedidoData {
  pedido: {
    id: number;
    nombre: string;
    ci: string;
    celular: string;
    destino: string;
    direccion: string;
    estado: string;
  };
  productos_detalles: ProductoDetalle[];
  envio: {
    estado: string;
  } | null;
}

// Colores Premium
const COLORS = {
  primary: '#F2275D', // Pink/Red
  secondary: '#451773', // Purple
  accent: '#17BFBF', // Teal
  danger: '#F20505', // Red
  success: '#10B981', // Emerald
};

const PedidoView: React.FC = () => {
  const [pedido, setPedido] = useState<PedidoData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'initial' | 'camera' | 'result'>('initial');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Leer parámetros de URL al montar
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    const ci = params.get('ci');
    const celular = params.get('celular');

    if (id && ci && celular) {
      fetchPedido(id, ci, celular);
    }
  }, []);

  const fetchPedido = async (id: string, ci: string, celular: string) => {
    setLoading(true);
    setError(null);
    setViewMode('result'); // Cambiar a vista de resultado (o carga)

    try {
      // API Localhost según requerimiento
      const API_BASE = 'http://localhost:8000/api';
      const url = `${API_BASE}/qrverificacion?id=${id}&ci=${encodeURIComponent(ci)}&celular=${encodeURIComponent(celular)}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error('Pedido no encontrado o credenciales incorrectas.');

      const data: PedidoData = await res.json();
      setPedido(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar el pedido.');
      setPedido(null);
    } finally {
      setLoading(false);
    }
  };

  // Manejar escaneo desde archivo
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const target = e.target;
    if (!target.files || target.files.length === 0) return;

    const file = target.files[0];
    // Usar un ID único o constante que seguro existe
    const elementId = "reader-hidden";

    try {
      setLoading(true);
      // Limpiar instancia previa si existe (aunque para scanFile no debería ser crítico, es mejor prevenir)
      // Nota: Html5Qrcode detecta si ya hay una instancia en el elemento.
      // Creamos una nueva instancia cada vez
      const html5QrCode = new Html5Qrcode(elementId);

      const decodedText = await html5QrCode.scanFile(file, true);
      // Limpiamos (clear) para liberar el elemento por si acaso
      await html5QrCode.clear();

      processScannedUrl(decodedText);
    } catch (err) {
      console.error("Error confirm scanning file", err);
      // Intentar limpiar si falló
      try { const temp = new Html5Qrcode(elementId); await temp.clear(); } catch (e) { }

      alert("No se pudo leer el código QR de la imagen. Intenta con una imagen más clara o recortada.");
      setLoading(false);
    }
  };

  // Manejar escaneo de cámara
  useEffect(() => {
    let html5QrcodeScanner: Html5Qrcode | null = null;
    let isMounted = true;

    if (viewMode === 'camera') {
      const startScanner = async () => {
        try {
          html5QrcodeScanner = new Html5Qrcode("reader-camera");
          await html5QrcodeScanner.start(
            { facingMode: "environment" },
            { fps: 10, qrbox: { width: 250, height: 250 } },
            (decodedText) => {
              if (isMounted) {
                html5QrcodeScanner?.stop().then(() => html5QrcodeScanner?.clear()).catch(console.error);
                processScannedUrl(decodedText);
              }
            },
            () => { }
          );
        } catch (err) {
          console.error("Error starting scanner", err);
          alert("Error al iniciar la cámara. Por favor, permite el acceso.");
          setViewMode('initial');
        }
      };

      startScanner();
    }

    return () => {
      isMounted = false;
      if (html5QrcodeScanner && html5QrcodeScanner.isScanning) {
        html5QrcodeScanner.stop().then(() => html5QrcodeScanner?.clear()).catch(() => { });
      }
    };
  }, [viewMode]);

  const processScannedUrl = (urlStr: string) => {
    try {
      const url = new URL(urlStr);
      const newId = url.searchParams.get('id');
      const newCi = url.searchParams.get('ci');
      const newCelular = url.searchParams.get('celular');

      if (newId && newCi && newCelular) {
        // Actualizar URL del navegador sin recargar
        const newBrowserUrl = `${window.location.origin}${window.location.pathname}?id=${newId}&ci=${encodeURIComponent(newCi)}&celular=${encodeURIComponent(newCelular)}`;
        window.history.pushState({}, '', newBrowserUrl);

        // Fetch
        fetchPedido(newId, newCi, newCelular);
      } else {
        alert('El QR escaneado no contiene los datos necesarios (id, ci, celular).');
        setLoading(false);
      }
    } catch (e) {
      alert('El contenido escaneado no es una URL válida: ' + urlStr);
      setLoading(false);
    }
  };

  const resetView = () => {
    window.history.pushState({}, '', window.location.pathname);
    setPedido(null);
    setError(null);
    setViewMode('initial');
  };

  // Renderizado condicional del contenido principal
  const renderMainContent = () => {
    // Vista de Resultado: Error
    if (error && viewMode === 'result') {
      return (
        <div className="text-center animate-fade-in-up pt-8">
          <div className="bg-red-50 p-6 rounded-2xl border border-red-100 shadow-sm inline-block max-w-sm w-full mx-auto">
            <FaTimesCircle className="text-5xl mx-auto mb-4" style={{ color: COLORS.danger }} />
            <h2 className="text-xl font-bold text-gray-800 mb-2">Error de Verificación</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={resetView}
              className="w-full py-3 rounded-xl font-bold text-white shadow-lg transform transition hover:-translate-y-1"
              style={{ background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.danger} 100%)` }}
            >
              Intentar Nuevamente
            </button>
          </div>
        </div>
      );
    }

    // Vista de Resultado: Éxito (Pedido Encontrado)
    if (pedido && viewMode === 'result') {
      return (
        <div className="space-y-6 animate-fade-in-up max-w-3xl mx-auto pt-4">
          {/* Header de Estado */}
          <div className="bg-white rounded-3xl p-6 shadow-xl border-t-8 relative overflow-hidden"
            style={{ borderColor: COLORS.success }}>
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <FaCheckCircle size={100} color={COLORS.success} />
            </div>

            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-full bg-green-100">
                <FaCheckCircle className="text-3xl text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 uppercase tracking-wide font-bold">Estado del Pedido</p>
                <h2 className="text-2xl font-bold text-gray-800">Verificado Exitosamente</h2>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mt-2">
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
                ID: #{pedido.pedido.id}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${pedido.envio?.estado === 'Entregado' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                {pedido.envio?.estado || 'Procesando'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tarjeta Cliente */}
            <div className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100">
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
                <FaUser style={{ color: COLORS.secondary }} className="text-xl" />
                <h3 className="font-bold text-gray-800 text-lg">Datos del Cliente</h3>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Nombre</span>
                  <span className="font-semibold text-gray-800 text-right">{pedido.pedido.nombre}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Cédula (CI)</span>
                  <span className="font-semibold text-gray-800 text-right">{pedido.pedido.ci}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Celular</span>
                  {/* Enlace a WhatsApp usando el nuevo color */}
                  <a href={`https://wa.me/591${pedido.pedido.celular}`} target="_blank" rel="noopener noreferrer" className="font-semibold text-right hover:underline" style={{ color: COLORS.accent }}>
                    {pedido.pedido.celular}
                  </a>
                </div>
              </div>
            </div>

            {/* Tarjeta Envío */}
            <div className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100">
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
                <FaMapMarkerAlt style={{ color: COLORS.primary }} className="text-xl" />
                <h3 className="font-bold text-gray-800 text-lg">Detalles de Entrega</h3>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Destino</span>
                  <span className="font-semibold text-gray-800 text-right">{pedido.pedido.destino}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-500 mb-1">Dirección</span>
                  <span className="font-semibold text-gray-800 bg-gray-50 p-2 rounded-lg">{pedido.pedido.direccion}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Lista de Productos */}
          <div className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <FaBoxOpen style={{ color: COLORS.secondary }} className="text-xl" />
              <h3 className="font-bold text-gray-800 text-lg">Productos Comprados</h3>
            </div>
            <div className="space-y-4">
              {pedido.productos_detalles.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center p-4 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    {item.imagen ? (
                      <img src={item.imagen} alt={item.nombre} className="w-12 h-12 rounded-lg object-cover border border-gray-200" />
                    ) : (
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs"
                        style={{ backgroundColor: COLORS.secondary }}>
                        {item.cantidad}x
                      </div>
                    )}
                    <span className="font-medium text-gray-800">{item.nombre}</span>
                  </div>
                  <span className="font-bold text-gray-900">{Number(item.total).toFixed(2)} Bs</span>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end items-center gap-2">
              <span className="text-gray-500 text-sm">Total Pedido</span>
              <span className="text-xl font-bold" style={{ color: COLORS.primary }}>
                {pedido.productos_detalles.reduce((acc, item) => acc + Number(item.total), 0).toFixed(2)} Bs
              </span>
            </div>
          </div>

          <div className="text-center pt-8">
            <button
              onClick={resetView}
              className="px-8 py-3 rounded-full font-bold text-white shadow-lg transform transition hover:-translate-y-1 hover:shadow-xl"
              style={{ background: `linear-gradient(135deg, ${COLORS.secondary} 0%, ${COLORS.primary} 100%)` }}
            >
              Verificar Otro Comprobante
            </button>
          </div>
        </div>
      );
    }

    // Vista Cámara
    if (viewMode === 'camera') {
      return (
        <div className="max-w-md mx-auto animate-fade-in pt-8">
          <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Escaneando QR</h2>
          <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-black aspect-square mb-6">
            <div id="reader-camera" className="w-full h-full"></div>
            <div className="absolute inset-0 border-2 border-white/30 pointer-events-none rounded-3xl"></div>
          </div>

          <button
            onClick={() => setViewMode('initial')}
            className="w-full py-4 bg-gray-100 text-gray-700 font-bold rounded-2xl hover:bg-gray-200 transition"
          >
            Cancelar Escaneo
          </button>
        </div>
      );
    }

    // Vista Inicial (Botones)
    return (
      <div className="max-w-md mx-auto space-y-6 py-8 animate-fade-in">
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto bg-gradient-to-tr from-[#F2275D] to-[#451773] rounded-3xl flex items-center justify-center shadow-lg transform rotate-3 mb-4">
            <FaTruck className="text-4xl text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Verificar Pedido</h2>
          <p className="text-gray-500">Escanea el código QR de tu comprobante digital</p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => setViewMode('camera')}
            className="w-full py-4 px-6 rounded-2xl shadow-lg border border-transparent flex items-center justify-between group transition-all hover:-translate-y-1"
            style={{ background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.secondary} 100%)` }}
          >
            <div className="text-left">
              <span className="block text-white font-bold text-lg">Usar Cámara</span>
              <span className="block text-white/80 text-sm">Escanea directamente</span>
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
              className="w-full py-4 px-6 rounded-2xl bg-white shadow-lg border border-gray-100 flex items-center justify-between group transition-all hover:bg-gray-50 hover:-translate-y-1"
            >
              <div className="text-left">
                <span className="block text-gray-800 font-bold text-lg">Subir Imagen</span>
                <span className="block text-gray-500 text-sm">Desde tu galería</span>
              </div>
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <FaImage style={{ color: COLORS.accent }} className="text-xl" />
              </div>
            </button>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-100 text-center">
          <p className="text-sm text-gray-400">Shop Nexus &copy; {new Date().getFullYear()}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="relative min-h-[50vh]">
      {/* Elemento oculto para escaneo de archivos - SIEMPRE RENDERIZADO y en posición fija fuera de pantalla */}
      <div id="reader-hidden" style={{ position: 'fixed', top: '-10000px', left: '-10000px', width: '300px', height: '300px' }}></div>

      {loading && (
        <div className="absolute inset-0 z-50 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center animate-fade-in rounded-3xl">
          <FaSpinner className="text-4xl animate-spin mb-4" style={{ color: COLORS.accent }} />
          <p className="text-gray-600 font-medium">Procesando...</p>
        </div>
      )}

      {/* Contenido Principal */}
      <div className={loading ? 'opacity-50 pointer-events-none' : ''}>
        {renderMainContent()}
      </div>
    </div>
  );
};

export default PedidoView;
