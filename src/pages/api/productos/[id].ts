import type { APIRoute } from "astro";
import { getProductById } from "../../../lib/products";

export const GET: APIRoute = async ({ params, url }) => {
    const { id } = params;
    const includePrices = url.searchParams.get("includePrices") === "true";

    if (!id) {
        return new Response(JSON.stringify({ error: "Product ID is required" }), {
            status: 400,
            headers: { "Content-Type": "application/json" }
        });
    }

    try {
        const product = await getProductById(parseInt(id), includePrices);

        if (!product) {
            return new Response(JSON.stringify({ error: "Product not found" }), {
                status: 404,
                headers: { "Content-Type": "application/json" }
            });
        }

        return new Response(JSON.stringify(product), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });
    } catch (error) {
        console.error(`Error fetching product ${id}:`, error);
        return new Response(JSON.stringify({ error: "Internal Server Error" }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
};
