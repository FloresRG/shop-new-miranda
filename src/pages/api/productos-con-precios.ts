import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ url }) => {
    const page = url.searchParams.get("page") || "1";
    const search = url.searchParams.get("search") || "";
    const categoriaId = url.searchParams.get("categoria_id");
    const marcaId = url.searchParams.get("marca_id");

    // El backend real está en :8000
    const backendUrl = new URL("https://importadoramiranda.com/api/productos-con-precios");
    backendUrl.searchParams.append("page", page);
    backendUrl.searchParams.append("sucursal_id", "1");
    if (search) backendUrl.searchParams.append("search", search);
    if (categoriaId) backendUrl.searchParams.append("categoria_id", categoriaId);
    if (marcaId) backendUrl.searchParams.append("marca_id", marcaId);

    try {
        const res = await fetch(backendUrl.toString());
        if (!res.ok) {
            return new Response(JSON.stringify({ error: "Backend error" }), { status: res.status });
        }
        const data = await res.json();
        return new Response(JSON.stringify(data), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });
    } catch (e) {
        return new Response(JSON.stringify({ error: "Connection error" }), { status: 500 });
    }
};
