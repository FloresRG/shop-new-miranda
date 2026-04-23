import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  try {
    // Recibimos los datos como FormData desde el cliente
    const formData = await request.formData();

    // Reenviamos el FormData exacto a la API externa
    // No establecemos 'Content-Type' manualmente para que fetch genere el boundary correcto
    const response = await fetch('https://importadoramiranda.com/api/sugerencias-sucursales', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
      },
      body: formData,
    });

    const data = await response.json().catch(() => null);

    return new Response(JSON.stringify(data || { success: response.ok }), {
      status: response.status,
      headers: {
        'Content-Type': 'application/json'
      }
    });

  } catch (error: any) {
    console.error('Proxy Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};
