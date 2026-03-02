import type { ApiResponse, Producto } from '@/types/api.d.ts';

/**
 * Variables de entorno:
 * - PUBLIC_API_URL: URL base de la API (opcional, fallback a test.importadoramiranda.com)
 * - PUBLIC_STORAGE_URL: URL base del storage de imágenes (opcional, fallback a test.importadoramiranda.com/storage)
 */
const API_BASE_URL = import.meta.env.PUBLIC_API_URL || 'http://localhost:8000/storage';
const STORAGE_BASE_URL = import.meta.env.PUBLIC_STORAGE_URL || 'http://localhost:8000/storage';

/**
 * Clase de error personalizada para la API de productos
 */
export class ApiProductosError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'ApiProductosError';
  }
}

/**
 * Construye la URL completa de la imagen
 */
export const getImageUrl = (imagePath: string): string => {
  if (!imagePath) return ''; // Manejo de paths vacíos
  if (imagePath.startsWith('http')) {
    return imagePath; // Ya es URL completa
  }
  // Se asume que las imágenes están dentro de /fotos/ en el storage
  return `${STORAGE_BASE_URL}/fotos/${imagePath}`;
};

export interface ApiProductosParams {
  page?: number;
  per_page?: number;
  search?: string;
  categoria_id?: number;
  marca_id?: number;
  tipo_id?: number;
  estado?: number;
  estado_producto?: string;
  sucursal_id?: number;
  includePrices?: boolean;
}

export interface ApiProductos {
  fetchProductos(params?: ApiProductosParams): Promise<ApiResponse>;
  fetchProductoById(id: number, includePrices?: boolean): Promise<Producto>;
  searchProductos(searchTerm: string, params?: Omit<ApiProductosParams, 'search'>): Promise<ApiResponse>;
  fetchProductosByCategoria(categoriaId: number, params?: Omit<ApiProductosParams, 'categoria_id'>): Promise<ApiResponse>;
  fetchProductosByMarca(marcaId: number, params?: Omit<ApiProductosParams, 'marca_id'>): Promise<ApiResponse>;
}

export const apiProductos: ApiProductos = {
  /**
   * Obtener todos los productos con parámetros opcionales
   */
  async fetchProductos(params?: ApiProductosParams): Promise<ApiResponse> {
    const finalParams = { ...params };
    const baseUrl = params?.includePrices ? "/api/productos-con-precios" : "/api/productos";

    const url = new URL(baseUrl, window.location.origin);
    if (finalParams) {
      Object.entries(finalParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null && key !== 'includePrices') {
          url.searchParams.append(key, value.toString());
        }
      });
    }

    const response: Response = await fetch(url.toString());
    if (!response.ok) {
      throw new ApiProductosError(
        `Failed to fetch products: ${response.status} ${response.statusText}`,
        response.status
      );
    }

    const data: ApiResponse = await response.json();
    return data;
  },

  /**
   * Obtener un producto por ID
   */
  async fetchProductoById(id: number, includePrices: boolean = false): Promise<Producto> {
    const url = new URL(`/api/productos/${id}`, window.location.origin);
    if (includePrices) {
      url.searchParams.append("includePrices", "true");
    }
    const response: Response = await fetch(url.toString());
    if (!response.ok) {
      throw new ApiProductosError(
        `Failed to fetch product ${id}: ${response.status} ${response.statusText}`,
        response.status
      );
    }

    const data: Producto = await response.json();
    return data;
  },

  /**
   * Buscar productos por término
   */
  async searchProductos(
    searchTerm: string,
    params?: Omit<ApiProductosParams, 'search'>
  ): Promise<ApiResponse> {
    return this.fetchProductos({ ...params, search: searchTerm });
  },

  /**
   * Obtener productos por categoría
   */
  async fetchProductosByCategoria(
    categoriaId: number,
    params?: Omit<ApiProductosParams, 'categoria_id'>
  ): Promise<ApiResponse> {
    return this.fetchProductos({ ...params, categoria_id: categoriaId });
  },

  /**
   * Obtener productos por marca
   */
  async fetchProductosByMarca(
    marcaId: number,
    params?: Omit<ApiProductosParams, 'marca_id'>
  ): Promise<ApiResponse> {
    return this.fetchProductos({ ...params, marca_id: marcaId });
  },
};
