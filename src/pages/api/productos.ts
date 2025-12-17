import type { APIRoute } from "astro";
import { getProducts } from "../../lib/products";

export const GET: APIRoute = async ({ url }) => {
    const page = parseInt(url.searchParams.get("page") || "1");
    const search = url.searchParams.get("search") || "";
    const categoriaId = url.searchParams.get("categoria_id") ? parseInt(url.searchParams.get("categoria_id")!) : undefined;
    const marcaId = url.searchParams.get("marca_id") ? parseInt(url.searchParams.get("marca_id")!) : undefined;
    const tipoId = url.searchParams.get("tipo_id") ? parseInt(url.searchParams.get("tipo_id")!) : undefined;

    const data = await getProducts({ page, search, categoriaId, marcaId, tipoId });

    // Rehidratar URLs de paginación (Opcional, ya que la API externa podría devolver urls locales)
    // Si la API externa devuelve URLs con 127.0.0.1:8000, tal vez queramos reemplazarlas por la URL actual del frontend
    // Pero por ahora mantenemos la lógica de reconstrucción simple
    if (data.pagination.current_page > 1) {
        const prev = new URL(url);
        prev.searchParams.set("page", (data.pagination.current_page - 1).toString());
        data.pagination.prev_page_url = prev.toString();
    }
    if (data.pagination.current_page < data.pagination.last_page) {
        const next = new URL(url);
        next.searchParams.set("page", (data.pagination.current_page + 1).toString());
        data.pagination.next_page_url = next.toString();
    }

    return new Response(JSON.stringify(data), {
        status: 200,
        headers: {
            "Content-Type": "application/json"
        }
    });
};
