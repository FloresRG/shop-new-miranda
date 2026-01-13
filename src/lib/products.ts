import type { ApiResponse, Product } from "../interfaces/product";

const API_URL = "https://importadoramiranda.com/api/productos";

export const getProducts = async (params: {
    page?: number;
    search?: string;
    categoriaId?: number;
    marcaId?: number;
    tipoId?: number;
}): Promise<ApiResponse> => {
    const { page = 1, search = "", categoriaId, marcaId, tipoId } = params;

    const url = new URL(API_URL);
    url.searchParams.append("page", page.toString());

    if (search) url.searchParams.append("search", search);
    if (categoriaId) url.searchParams.append("categoria_id", categoriaId.toString());
    if (marcaId) url.searchParams.append("marca_id", marcaId.toString());
    if (tipoId) url.searchParams.append("tipo_id", tipoId.toString());

    try {
        const res = await fetch(url.toString());

        if (!res.ok) {
            throw new Error(`API Error: ${res.statusText}`);
        }

        const data: ApiResponse = await res.json();
        return data;
    } catch (error) {
        console.error("Failed to fetch products:", error);
        return {
            productos: [],
            pagination: {
                current_page: 1,
                last_page: 1,
                per_page: 20,
                total: 0,
                from: 0,
                to: 0,
                prev_page_url: null,
                next_page_url: null
            },
            categorias: [],
            marcas: [],
            tipos: []
        };
    }
};

// Obtener un solo producto por ID
export const getProductById = async (id: number): Promise<Product | null> => {
    // 1. Intenta Endpoint Especifico (Standard REST)
    try {
        // La API usa 'producto' (singular) para obtener un solo item
        const res = await fetch(`${API_URL.replace("productos", "producto")}/${id}`);
        if (res.ok) {
            const data = await res.json();
            return data.producto || data;
        }
    } catch (e) {
        // Ignorar falla de endpoint especifico
    }

    // 2. Fallback: Search param trick (Si la API soporta ?search=ID o similar)
    // Intentamos buscar exactamente por el string del ID o nombre si tuvieramos
    try {
        // Muchas APIs Laravel permiten buscar por ID si el search busca en todos los campos
        const searchData = await getProducts({ search: id.toString(), page: 1 });
        const exactMatch = searchData.productos.find(p => p.id === id);
        if (exactMatch) return exactMatch;
    } catch (e) {
        // Fallo search
    }

    // 3. Fallback final: Buscar en lista general (página 1)
    // Esto es lo último que podemos hacer sin iterar todas las páginas
    try {
        const all = await getProducts({ page: 1 });
        return all.productos.find(p => p.id === id) || null;
    } catch (e) {
        return null;
    }
};

export const getFeaturedProducts = async (limit: number = 8): Promise<Product[]> => {
    const data = await getProducts({ page: 1 });
    // Retornar los primeros 'limit' productos o aleatorios
    return data.productos.slice(0, limit);
};
