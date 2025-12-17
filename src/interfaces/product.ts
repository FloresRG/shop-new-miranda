export interface Category {
    id: number;
    categoria: string;
}

export interface Brand {
    id: number;
    marca: string;
}

export interface Type {
    id: number;
    tipo: string;
}

export interface Photo {
    id: number;
    foto: string;
}

export interface Inventory {
    id_sucursal: number;
    cantidad: number;
    transfer_date: string | null;
}

export interface Product {
    id: number;
    nombre: string;
    descripcion: string;
    precio: string; // El API devuelve string
    estado_producto: string | null;
    estado: number;
    fecha: string;
    id_tipo: number;
    categoria: Category;
    marca: Brand;
    tipo: Type;
    fotos: Photo[];
    inventario: Inventory | null; // Puede ser null
}

export interface Pagination {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
    prev_page_url: string | null;
    next_page_url: string | null;
}

export interface ApiResponse {
    productos: Product[];
    pagination: Pagination;
    categorias: Category[];
    marcas: Brand[];
    tipos: Type[];
}
