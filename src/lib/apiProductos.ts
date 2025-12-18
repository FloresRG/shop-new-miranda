import type { ApiResponse, Producto } from '@/types/api.d.ts';

const API_BASE_URL = import.meta.env.PUBLIC_API_URL || 'https://test.importadoramiranda.com/api/productos';
const STORAGE_BASE_URL = API_BASE_URL.replace('/api/productos', '/storage');

export class ApiProductosError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'ApiProductosError';
  }
}

/**
 * Build full image URL from storage path
 */
export const getImageUrl = (imagePath: string): string => {
  if (imagePath.startsWith('http')) {
    return imagePath; // Already a full URL
  }
  return `${STORAGE_BASE_URL}/${imagePath}`;
};

export const apiProductos = {
  /**
   * Fetch all products with optional query parameters
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
   * Fetch a single product by ID (if the API supports it)
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
   * Search products by term
   */
  async searchProductos(searchTerm: string, params?: Omit<Parameters<typeof apiProductos.fetchProductos>[0], 'search'>): Promise<ApiResponse> {
    return this.fetchProductos({ ...params, search: searchTerm });
  },

  /**
   * Fetch products by category
   */
  async fetchProductosByCategoria(categoriaId: number, params?: Omit<Parameters<typeof apiProductos.fetchProductos>[0], 'categoria_id'>): Promise<ApiResponse> {
    return this.fetchProductos({ ...params, categoria_id: categoriaId });
  },

  /**
   * Fetch products by brand
   */
  async fetchProductosByMarca(marcaId: number, params?: Omit<Parameters<typeof apiProductos.fetchProductos>[0], 'marca_id'>): Promise<ApiResponse> {
    return this.fetchProductos({ ...params, marca_id: marcaId });
  },
};