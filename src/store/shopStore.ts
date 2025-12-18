import { atom } from "nanostores";
import type { Product, Brand, ApiResponse } from "../interfaces/product";

// Store definition
export const featuredProductsStore = atom<Product[]>([]);
export const homeBrandsStore = atom<Brand[]>([]);
export const isHomeDataLoaded = atom<boolean>(false);

// Actions
export const fetchHomeData = async () => {
    // If already loaded, skipping fetch
    if (isHomeDataLoaded.get()) return;

    try {
        const res = await fetch("/api/productos?page=1");
        if (res.ok) {
            const data: ApiResponse = await res.json();

            // Start caching
            featuredProductsStore.set(data.productos.slice(0, 8));
            homeBrandsStore.set(data.marcas);
            isHomeDataLoaded.set(true);
        }
    } catch (error) {
        console.error("Failed to fetch home data:", error);
    }
};
