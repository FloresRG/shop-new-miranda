import React, { useEffect, useState } from "react";
import LiquidacionGrid from "./LiquidacionGrid";

// 1. Interfaz COMPLETA basada en tu respuesta real de la API
export interface Liquidacion {
    id: number;
    foto_captura: string;
    fecha_inicio: string;
    fecha_fin: string;
    estado: string;
    precio_venta: string;
    stock: number;
    descripcion: string | null;
    producto_id: number; // <--- Crucial para eliminar el error ts(2551)
    created_at: string;
    updated_at: string;
    producto: {
        id: number;
        nombre: string;
        descripcion: string;
        precio: string;
        precio_descuento: string;
        stock: number;
        estado: number;
        estado_producto: string | null;
        fecha: string;
        id_cupo: number;
        id_tipo: number;
        id_categoria: number;
        id_marca: number;
        created_at: string;
        updated_at: string;
        user_id: number | null;
    };
}

interface ApiResponse {
    success: boolean;
    data: Liquidacion[];
    pagination: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}

const LiquidacionesContainer = () => {
    const [data, setData] = useState<ApiResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);

    // Astro variable de entorno
    const API_URL = import.meta.env.PUBLIC_API_URL;

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch a la API de importadoramiranda.com
                const res = await fetch(`${API_URL}/api/liquidaciones?page=${page}`);
                
                if (!res.ok) throw new Error("Error en la respuesta del servidor");
                
                const jsonData: ApiResponse = await res.json();
                setData(jsonData);
            } catch (error) {
                console.error("Error fetching liquidaciones:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [page, API_URL]);

    const handlePageChange = (newPage: number) => {
        window.scrollTo({ top: 0, behavior: "smooth" });
        setPage(newPage);
    };

    return (
        <section className="section py-8">
            <div className="container">
                <div className="mb-8 border-b border-gray-100 dark:border-darkmode-border pb-6">
                    <h1 className="h3 font-black text-dark dark:text-white uppercase tracking-tighter">
                        Liquidaciones
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">
                        Aprovecha nuestras ofertas especiales por tiempo limitado.
                    </p>
                </div>

                {/* Grid de productos pasando la data real */}
                <LiquidacionGrid products={data?.data || []} isLoading={loading} />

                {/* Controles de Paginación */}
                {!loading && data && data.pagination.last_page > 1 && (
                    <div className="flex justify-center mt-12 gap-3">
                        <button
                            onClick={() => handlePageChange(data.pagination.current_page - 1)}
                            disabled={data.pagination.current_page === 1}
                            className="px-6 py-2.5 rounded-xl border border-gray-200 dark:border-darkmode-border bg-white dark:bg-darkmode-light text-dark dark:text-white font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-primary hover:text-white hover:border-primary transition-all duration-300"
                        >
                            Anterior
                        </button>
                        
                        <div className="flex items-center px-4 bg-gray-50 dark:bg-darkmode-theme-light rounded-xl font-mono font-bold text-primary">
                            {data.pagination.current_page} / {data.pagination.last_page}
                        </div>

                        <button
                            onClick={() => handlePageChange(data.pagination.current_page + 1)}
                            disabled={data.pagination.current_page === data.pagination.last_page}
                            className="px-6 py-2.5 rounded-xl border border-gray-200 dark:border-darkmode-border bg-white dark:bg-darkmode-light text-dark dark:text-white font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-primary hover:text-white hover:border-primary transition-all duration-300"
                        >
                            Siguiente
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
};

export default LiquidacionesContainer;