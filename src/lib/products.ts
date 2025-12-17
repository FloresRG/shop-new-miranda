import type { ApiResponse, Product } from "../interfaces/product";

const API_URL = "http://127.0.0.1:8000/api/productos";

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
// NOTA: Si la API no tiene endpoint individual, filtramos de la lista (ineficiente pero funcional para demos)
// O ajustamos si la API soporta /api/productos/1
export const getProductById = async (id: number): Promise<Product | null> => {
    // Intenta endpoint específico
    try {
        const res = await fetch(`${API_URL}/${id}`); // Asumiendo que existe
        if (res.ok) {
            // Algunas APIs devuelven { producto: ... } o directo el objeto
            const data = await res.json();
            return data.producto || data;
        }
    } catch (e) {
        // Fallback a buscar en la lista general si falla endpoint específico
    }

    // Fallback: Fetch a lista (limitada) y buscar
    // Esto es muy ineficiente en prod, pero útil si la API es simple
    try {
        const all = await getProducts({ page: 1 }); // Solo busca en página 1 como ejemplo
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
