import type { ApiResponse, Product } from "../interfaces/product";

const API_URL = "https://importadoramiranda.com/api/liquidaciones";

interface LiquidationApiResponse {
    success: boolean;
    data: Array<{
        id: number;
        foto_captura: string;
        precio_venta: string;
        stock: number;
        producto: {
            id: number;
            nombre: string;
            descripcion: string;
            precio: string;
            id_tipo: number;
            id_categoria: number;
            id_marca: number;
            // Add other fields if needed
        };
        // Add categoria, marca, tipo if available, but for now assume not
    }>;
    pagination: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}

export const getLiquidaciones = async (params: {
    page?: number;
}): Promise<ApiResponse> => {
    const { page = 1 } = params;

    const url = new URL(API_URL);
    url.searchParams.append("page", page.toString());

    try {
        const res = await fetch(url.toString());

        if (!res.ok) {
            throw new Error(`API Error: ${res.statusText}`);
        }

        const apiData: LiquidationApiResponse = await res.json();

        // Map to ApiResponse format
        const productos: Product[] = apiData.data.map(item => ({
            id: item.producto.id,
            nombre: item.producto.nombre,
            descripcion: item.producto.descripcion,
            precio: item.precio_venta, // Use precio_venta
            estado_producto: null,
            estado: 1, // Assume active
            fecha: "", // Not provided
            id_tipo: item.producto.id_tipo,
            categoria: { id: item.producto.id_categoria, categoria: "" }, // Placeholder
            marca: { id: item.producto.id_marca, marca: "" }, // Placeholder
            tipo: { id: item.producto.id_tipo, tipo: "" }, // Placeholder
            fotos: [{ id: item.id, foto: `https://importadoramiranda.com/storage/${item.foto_captura}` }],
            inventario: { id_sucursal: 1, cantidad: item.stock, transfer_date: null }
        }));

        return {
            productos,
            pagination: {
                ...apiData.pagination,
                from: (apiData.pagination.current_page - 1) * apiData.pagination.per_page + 1,
                to: Math.min(apiData.pagination.current_page * apiData.pagination.per_page, apiData.pagination.total),
                prev_page_url: apiData.pagination.current_page > 1 ? `${url.pathname}?page=${apiData.pagination.current_page - 1}` : null,
                next_page_url: apiData.pagination.current_page < apiData.pagination.last_page ? `${url.pathname}?page=${apiData.pagination.current_page + 1}` : null
            },
            categorias: [],
            marcas: [],
            tipos: []
        };
    } catch (error) {
        console.error("Failed to fetch liquidaciones:", error);
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