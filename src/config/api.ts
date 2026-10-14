// Detecta automáticamente si Astro corre en desarrollo (astro dev) o en producción (astro build)
const defaultHost = import.meta.env.DEV
  ? "http://127.0.0.1:8000"
  : "https://importadoramiranda.com";

export const API_BASE_URL = import.meta.env.PUBLIC_API_URL || defaultHost;
export const STORAGE_BASE_URL =
  import.meta.env.PUBLIC_STORAGE_URL || `${API_BASE_URL}/storage`;
