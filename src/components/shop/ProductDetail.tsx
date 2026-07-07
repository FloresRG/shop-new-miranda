import React, { useEffect, useState } from "react";
import type { Product } from "../../interfaces/product";
import { addCartItem } from "../../store/cartStore";
import { FaTag, FaFlag, FaBox, FaWhatsapp } from "react-icons/fa";
import ProductDetailSkeleton from "./ProductDetailSkeleton";

interface ProductDetailProps {
  product?: Product;
  productId?: number;
}

export default function ProductDetail({ product: initialProduct, productId }: ProductDetailProps) {
  const [product, setProduct] = useState<Product | null>(initialProduct || null);
  const [loading, setLoading] = useState(!initialProduct);
  const [error, setError] = useState(false);

  // Fetch client-side si no viene el producto completo
  useEffect(() => {
    if (!product && productId) {
      const fetchProduct = async () => {
        setLoading(true);
        try {
          const res = await fetch(`/api/productos/${productId}`);
          if (!res.ok) throw new Error("Product not found");
          const data = await res.json();
          setProduct(data);
        } catch (err) {
          console.error(err);
          setError(true);
        } finally {
          setLoading(false);
        }
      };
      fetchProduct();
    }
  }, [productId, product]);

  const defaultImage = "https://placehold.co/600x600?text=No+Image";

  // Estado para la imagen principal
  const [mainImage, setMainImage] = useState("");

  // Actualizar imagen principal cuando llega el producto
  useEffect(() => {
    if (product?.fotos?.[0]?.foto) {
      setMainImage(`${import.meta.env.PUBLIC_API_URL}/storage/${product.fotos[0].foto}`);
    } else {
      setMainImage(defaultImage);
    }
  }, [product]);

  if (loading) return <ProductDetailSkeleton />;
  if (error || !product) return <div className="text-center py-20 text-gray-500">Producto no encontrado</div>;

  const price = parseFloat(product.precio) || 0;
  const getStock = (p: any) => {
    if (!p) return 0;
    const inv = p.inventario || p.inventarios;
    if (inv) {
      if (Array.isArray(inv)) {
        return inv.reduce((sum: number, item: any) => sum + (item.cantidad ?? item.stock ?? 0), 0);
      } else {
        return inv.cantidad ?? inv.stock ?? 0;
      }
    }
    return p.stock ?? p.cantidad ?? 0;
  };

  const stock = getStock(product);

  // Función para cambiar imagen principal
  const handleImageClick = (img: string) => {
    setMainImage(`${import.meta.env.PUBLIC_API_URL}/storage/${img}`);
  };

  return (
    <div className="grid md:grid-cols-2 gap-8 lg:gap-12 animate-in slide-in-from-bottom duration-500">
      {/* Galería de Imágenes */}
      <div className="space-y-4">
        <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden border border-border dark:border-darkmode-border shadow-sm">
          <img
            src={mainImage}
            alt={product.nombre}
            className="w-full h-full object-contain hover:scale-105 transition-transform duration-500"
          />
        </div>

        {product.fotos.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {product.fotos.map((f, i) => (
              <button
                key={i}
                onClick={() => handleImageClick(f.foto)}
                className={`w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${mainImage.endsWith(f.foto)
                  ? "border-primary opacity-100"
                  : "border-transparent opacity-70 hover:opacity-100"
                  }`}
              >
                <img
                  src={
                    f.foto
                      ? `${import.meta.env.PUBLIC_API_URL}/storage/${f.foto}`
                      : "https://placehold.co/80x80?text=No+Image"
                  }
                  alt={`Imagen ${i + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Info del Producto */}
      <div className="flex flex-col h-full">
        <div className="mb-4">
          <span className="text-primary font-semibold uppercase tracking-wider text-sm">
            {product.categoria.categoria} / {product.marca.marca}
          </span>
          <h1 className="text-3xl lg:text-4xl font-bold mt-2 text-dark dark:text-white mb-2">
            {product.nombre}
          </h1>
          {stock > 0 && stock <= 5 && (
            <span className="text-orange-500 text-sm font-medium flex items-center gap-1">
              <FaFlag size={12} /> ¡Solo quedan {stock} unidades!
            </span>
          )}
        </div>

        <div className="text-4xl font-bold text-primary mb-6">
          {price > 0 ? `Bs ${price.toFixed(2)}` : "Consultar Precio"}
        </div>

        <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-300 mb-8 flex-grow">
          <p className="whitespace-pre-line">{product.descripcion}</p>
        </div>

        <div className="flex flex-col gap-4 mt-auto">
       <div className="flex items-center gap-4 text-sm text-accent dark:text-gray-400 p-4 bg-gray-50 dark:bg-darkmode-theme-light rounded-lg border dark:border-gray-700">
  <div className="flex items-center gap-2">
    <FaTag /> {product.tipo.tipo}
  </div>
  <div className="flex items-center gap-2">
    <FaBox /> {stock > 0 ? "Disponible" : "Agotado"}
  </div>
</div>
          <div className="flex gap-4">
            <button
              onClick={() => addCartItem(product!)}
              disabled={stock <= 0}
              className={`flex-1 py-4 px-6 rounded-lg font-bold text-lg shadow-lg hover:shadow-xl transition-all transform active:scale-95 text-white ${stock > 0
                ? "bg-primary hover:bg-primary/90"
                : "bg-gray-400 cursor-not-allowed"
                }`}
            >
              {stock > 0 ? "Añadir al Carrito" : "Sin Stock"}
            </button>

            <a
              href={`https://wa.me/59170621016?text=Hola,%20me%20interesa%20este%20producto:%20${product.nombre}`}
              target="_blank"
              className="bg-[#25D366] hover:bg-[#20bd5a] text-white p-4 rounded-lg flex items-center justify-center shadow-lg transition-colors w-16"
              title="Consultar por WhatsApp"
            >
              <FaWhatsapp size={24} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
