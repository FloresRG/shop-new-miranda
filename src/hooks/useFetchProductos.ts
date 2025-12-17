import { useEffect, useState, useCallback } from 'react';
import type { ApiResponse, Producto } from '@/types/api.d.ts';
import { apiProductos, ApiProductosError } from '@/lib/apiProductos';

interface UseFetchProductosReturn {
  productos: Producto[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useFetchProductos = (params?: Parameters<typeof apiProductos.fetchProductos>[0]): UseFetchProductosReturn => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProductos = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const data: ApiResponse = await apiProductos.fetchProductos(params);
      setProductos(data.productos);
    } catch (err: unknown) {
      const errorMessage: string = err instanceof ApiProductosError || err instanceof Error
        ? err.message
        : 'Unknown error occurred';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchProductos();
  }, [fetchProductos]);

  return {
    productos,
    loading,
    error,
    refetch: fetchProductos,
  };
};