import type { APIRoute } from "astro";
import { getLiquidaciones } from "../../lib/liquidaciones";

export const GET: APIRoute = async ({ url }) => {
    const page = parseInt(url.searchParams.get("page") || "1");

    const data = await getLiquidaciones({ page });

    // Rehidratar URLs de paginación
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