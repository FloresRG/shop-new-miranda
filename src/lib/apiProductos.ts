import type { ApiResponse, Producto } from '@/types/api.d.ts';

/**
 * Variables de entorno:
 * - PUBLIC_API_URL: URL base de la API (opcional, fallback a test.importadoramiranda.com)
 * - PUBLIC_STORAGE_URL: URL base del storage de imágenes (opcional, fallback a test.importadoramiranda.com/storage)
 */
const API_BASE_URL = import.meta.env.PUBLIC_API_URL || 'https://importadoramiranda.com/storage';
const STORAGE_BASE_URL = import.meta.env.PUBLIC_STORAGE_URL || 'https://importadoramiranda.com/storage';

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

export const apiProductos = {
  /**
   * Obtener todos los productos con parámetros opcionales
   */
  async fetchProductos(params?: {
    page?: number;
    per_page?: number;
    search?: string;
    categoria_id?: number;
    marca_id?: number;
    tipo_id?: number;
    estado?: number;
    estado_producto?: string;
    sucursal_id?: number;
  }): Promise<ApiResponse> {
    const url = new URL(API_BASE_URL);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
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
  async fetchProductoById(id: number): Promise<Producto> {
    const url = `${API_BASE_URL}/${id}`;
    const response: Response = await fetch(url);
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
    params?: Omit<Parameters<typeof apiProductos.fetchProductos>[0], 'search'>
  ): Promise<ApiResponse> {
    return this.fetchProductos({ ...params, search: searchTerm });
  },

  /**
   * Obtener productos por categoría
   */
  async fetchProductosByCategoria(
    categoriaId: number,
    params?: Omit<Parameters<typeof apiProductos.fetchProductos>[0], 'categoria_id'>
  ): Promise<ApiResponse> {
    return this.fetchProductos({ ...params, categoria_id: categoriaId });
  },

  /**
   * Obtener productos por marca
   */
  async fetchProductosByMarca(
    marcaId: number,
    params?: Omit<Parameters<typeof apiProductos.fetchProductos>[0], 'marca_id'>
  ): Promise<ApiResponse> {
    return this.fetchProductos({ ...params, marca_id: marcaId });
  },
};
