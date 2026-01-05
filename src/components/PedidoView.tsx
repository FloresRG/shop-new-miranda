// src/components/PedidoView.tsx
import { useState, useEffect } from 'preact/hooks';
import type { FunctionalComponent } from 'preact';

// Tipos
interface ProductoDetalle {
  id_producto: number;
  nombre: string;
  cantidad: number;
  precio: number;
  total: number;
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

const PedidoView: FunctionalComponent = () => {
  const [pedido, setPedido] = useState<PedidoData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [scanning, setScanning] = useState<boolean>(false);

  // Leer parámetros de URL (solo en cliente)
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
    try {
      const API_BASE = 'https://shop.miracode.tech/api';
      const url = `${API_BASE}/pedido?id=${id}&ci=${encodeURIComponent(ci)}&celular=${encodeURIComponent(celular)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Pedido no encontrado o credenciales incorrectas.');
      const data: PedidoData = await res.json();
      setPedido(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar el pedido.');
    } finally {
      setLoading(false);
    }
  };

  // Escáner QR
  useEffect(() => {
    let html5QrcodeScanner: any = null;

    if (scanning) {
      import('html5-qrcode').then(({ Html5Qrcode }) => {
        const config = { fps: 10, qrbox: { width: 250, height: 250 } };
        html5QrcodeScanner = new Html5Qrcode('reader');
        html5QrcodeScanner.start(
          { facingMode: 'environment' },
          config,
          (decodedText: string) => {
            try {
              const url = new URL(decodedText);
              const newId = url.searchParams.get('id');
              const newCi = url.searchParams.get('ci');
              const newCelular = url.searchParams.get('celular');

              if (newId && newCi && newCelular) {
                const newUrl = `${window.location.origin}${window.location.pathname}?id=${newId}&ci=${encodeURIComponent(newCi)}&celular=${encodeURIComponent(newCelular)}`;
                window.history.replaceState({}, '', newUrl);
                fetchPedido(newId, newCi, newCelular);
                setScanning(false);
              } else {
                alert('El QR no contiene los parámetros válidos (id, ci, celular).');
              }
            } catch (e) {
              alert('Contenido del QR no es una URL válida.');
            }
          },
          (errorMessage: string) => {
            console.warn('QR scan error:', errorMessage);
          }
        );
      });
    }

    return () => {
      if (html5QrcodeScanner) {
        html5QrcodeScanner.stop().catch(() => {});
      }
    };
  }, [scanning]);

  const startScan = () => setScanning(true);

  const resetView = () => {
    window.history.replaceState({}, '', window.location.pathname);
    setPedido(null);
    setError(null);
    setScanning(false);
  };

  // Render
  if (loading) {
    return <div className="text-center py-8 text-lg">Cargando datos del pedido...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-100 text-red-700 p-4 rounded text-center">
        ❌ {error}
        <br />
        <br />
        <button onClick={resetView} className="text-red-600 underline">
          Volver
        </button>
      </div>
    );
  }

  if (pedido) {
    return (
      <div className="space-y-6">
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <h2 className="text-xl font-bold text-green-800">✅ Pedido Verificado</h2>
          <p className="text-gray-700">
            ID: <strong>{pedido.pedido.id}</strong>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold text-gray-800">Cliente</h3>
            <p>{pedido.pedido.nombre}</p>
            <p>CI: {pedido.pedido.ci}</p>
            <p>Celular: {pedido.pedido.celular}</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">Envío</h3>
            <p>Destino: {pedido.pedido.destino}</p>
            <p>Dirección: {pedido.pedido.direccion}</p>
            <p>
              Estado: <span className="font-medium">{pedido.envio?.estado || 'N/A'}</span>
            </p>
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-2 text-gray-800">Productos</h3>
          <ul className="space-y-2">
            {pedido.productos_detalles.map((item, idx) => (
              <li key={idx} className="flex justify-between bg-gray-100 p-2 rounded">
                <span>
                  {item.cantidad}x {item.nombre}
                </span>
                <span>{Number(item.total).toFixed(2)} Bs</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="text-center">
          <button
            onClick={resetView}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
          >
            Verificar Otro Pedido
          </button>
        </div>
      </div>
    );
  }

  if (scanning) {
    return (
      <div className="text-center">
        <h2 className="text-lg font-medium mb-4">Escanee el código QR del comprobante</h2>
        <div id="reader" className="mx-auto"></div>
        <button onClick={() => setScanning(false)} className="mt-4 text-red-600 font-medium">
          Cancelar
        </button>
      </div>
    );
  }

  return (
    <div className="text-center space-y-6">
      <p className="text-gray-700 max-w-md mx-auto">
        Escanee el QR de su comprobante para verificar su pedido.
      </p>
      <button
        onClick={startScan}
        className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 shadow"
      >
        📷 Abrir Cámara y Escanear QR
      </button>

      <div className="mt-6">
        <p className="text-sm text-gray-500 mb-2">¿No tiene el QR? Pruebe con este de ejemplo:</p>
        <img
          src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https%3A%2F%2Fshop.miracode.tech%2Fqr%3Fid%3D123%26ci%3D8547123%26celular%3D70621016"
          alt="QR de ejemplo"
          className="mx-auto border p-1 rounded"
        />
      </div>
    </div>
  );
};

export default PedidoView;
