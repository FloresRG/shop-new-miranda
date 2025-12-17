export interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  estado_producto: string;
  estado: number;
  fecha: string;
  id_tipo: number;
  categoria: {
    id: number;
    categoria: string;
  } | null;
  marca: {
    id: number;
    marca: string;
  } | null;
  tipo: {
    id: number;
    tipo: string;
  } | null;
  fotos: {
    id: number;
    foto: string;
  }[];
  inventario: {
    id_sucursal: number;
    cantidad: number;
    transfer_date: string;
  } | null;
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

export interface Categoria {
  id: number;
  categoria: string;
}

export interface Marca {
  id: number;
  marca: string;
}

export interface Tipo {
  id: number;
  tipo: string;
}

export interface ApiResponse {
  productos: Producto[];
  pagination: Pagination;
  categorias: Categoria[];
  marcas: Marca[];
  tipos: Tipo[];
}