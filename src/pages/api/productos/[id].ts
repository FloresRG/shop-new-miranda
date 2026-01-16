import type { APIRoute } from "astro";
import { getProductById } from "../../../lib/products";

export const GET: APIRoute = async ({ params }) => {
    const { id } = params;

    if (!id) {
        return new Response(JSON.stringify({ error: "Product ID is required" }), {
            status: 400,
            headers: { "Content-Type": "application/json" }
        });
    }

    try {
        const product = await getProductById(parseInt(id));

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
