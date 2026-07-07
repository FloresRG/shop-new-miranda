import React, { useEffect, useState } from "react";
import type { Product } from "../../interfaces/product";
import { addCartItem } from "../../store/cartStore";
import { FaTag, FaFlag, FaBox, FaWhatsapp, FaCartPlus, FaLayerGroup, FaGem } from "react-icons/fa";
import ProductDetailSkeleton from "./ProductDetailSkeleton";

interface WholesaleProductDetailProps {
    product?: Product;
    productId?: number;
}

export default function WholesaleProductDetail({ product: initialProduct, productId }: WholesaleProductDetailProps) {
    const [product, setProduct] = useState<Product | null>(initialProduct || null);
    const [loading, setLoading] = useState(!initialProduct);
    const [error, setError] = useState(false);
    const isWholesaleMode = typeof window !== 'undefined' && window.location.pathname.startsWith('/mayorista');

    useEffect(() => {
        if (!product && productId) {
            const fetchProduct = async () => {
                setLoading(true);
                try {
                    // Strategy 1: Try the local API route which fetches from backend with prices
                    const res = await fetch(`/api/productos/${productId}?includePrices=true`);
                    if (res.ok) {
                        const data = await res.json();
                        // API may return the product directly or nested under a key
                        const prod = data?.producto || data;
                        if (prod && prod.id) {
                            setProduct(prod);
                            return;
                        }
                    }

                    // Strategy 2: Fetch directly from backend prices endpoint
                    const pricesRes = await fetch(`https://importadoramiranda.com/api/productos-con-precios?search=${productId}&sucursal_id=1`);
                    if (pricesRes.ok) {
                        const pricesData = await pricesRes.json();
                        const found = pricesData?.productos?.find((p: any) => p.id === productId || p.id === Number(productId));
                        if (found) {
                            setProduct(found);
                            return;
                        }
                    }

                    // Strategy 3: Fallback to basic product endpoint
                    const basicRes = await fetch(`https://importadoramiranda.com/api/producto/${productId}?sucursal_id=1`);
                    if (basicRes.ok) {
                        const basicData = await basicRes.json();
                        const prod = basicData?.producto || basicData;
                        if (prod && prod.id) {
                            setProduct(prod);
                            return;
                        }
                    }

                    throw new Error("Product not found in any endpoint");
                } catch (err) {
                    console.error("Error fetching wholesale product:", err);
                    setError(true);
                } finally {
                    setLoading(false);
                }
            };
            fetchProduct();
        }
    }, [productId]);

    const defaultImage = "https://placehold.co/600x600?text=No+Image";
    const [mainImage, setMainImage] = useState("");

    useEffect(() => {
        if (product?.fotos?.[0]?.foto) {
            setMainImage(`${import.meta.env.PUBLIC_API_URL}/storage/${product.fotos[0].foto}`);
        } else {
            setMainImage(defaultImage);
        }
    }, [product]);

    if (loading) return <ProductDetailSkeleton />;

    if (error || !product) {
        if (!isWholesaleMode) {
            return <div className="text-center py-20 text-gray-400 font-bold">Inicie sesión para ver este producto exclusivo</div>;
        }
        return <div className="text-center py-20 text-gray-400 font-bold">Producto no encontrado o error de conexión</div>;
    }

    const priceUnidad = Number(product.precio_unidad || parseFloat(product.precio) || 0);
    const priceDocena = Number(product.precio_docena || (priceUnidad * 0.9));

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
    const hasStock = stock > 0;

    const handleImageClick = (img: string) => {
        setMainImage(`${import.meta.env.PUBLIC_API_URL}/storage/${img}`);
    };

    const handleAddUnit = () => {
        if (product) addCartItem(product, 1, true);
    };

    const handleAddDozen = () => {
        if (product) addCartItem(product, 12, true);
    };

    return (
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 animate-in fade-in slide-in-from-bottom-5 duration-700 bg-white dark:bg-[#0c0c0c] text-dark dark:text-white transition-colors">
            {/* Galería de Imágenes */}
            <div className="space-y-4">
                <div className="aspect-square bg-white/5 rounded-3xl overflow-hidden border border-[#D4AF37]/20 shadow-2xl relative group">
                    <div className="absolute top-4 left-4 z-10 bg-[#D4AF37] text-black px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
                        VIP MAYORISTA
                    </div>
                    <img
                        src={mainImage}
                        alt={product.nombre}
                        className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700"
                    />
                </div>

                {product.fotos.length > 1 && (
                    <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
                        {product.fotos.map((f, i) => (
                            <button
                                key={i}
                                onClick={() => handleImageClick(f.foto)}
                                className={`w-20 h-20 flex-shrink-0 rounded-2xl overflow-hidden border-2 transition-all ${mainImage.endsWith(f.foto)
                                    ? "border-[#D4AF37] scale-95"
                                    : "border-white/10 opacity-50 hover:opacity-100"
                                    }`}
                            >
                                <img
                                    src={`${import.meta.env.PUBLIC_API_URL}/storage/${f.foto}`}
                                    alt={`Imagen ${i + 1}`}
                                    className="w-full h-full object-cover"
                                />
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Info del Producto */}
            <div className="flex flex-col h-full py-2">
                <div className="mb-6">
                    <div className="flex items-center gap-2 text-[#D4AF37] font-black uppercase tracking-[0.2em] text-[10px] mb-3">
                        <FaGem size={12} /> {product.categoria.categoria} / {product.marca.marca}
                    </div>
                    <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-dark dark:text-white mb-4 leading-tight">
                        {product.nombre}
                    </h1>
                    <div className="flex items-center gap-4">
                        <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${hasStock ? 'bg-green-500/10 text-green-500 border-green-500/30' : 'bg-red-500/10 text-red-500 border-red-500/30'}`}>
                            {hasStock ? `EN STOCK: ${stock}` : 'AGOTADO'}
                        </span>
                        {product.tipo && (
                            <span className="bg-white/5 text-gray-400 px-4 py-1 rounded-full text-[10px] font-black border border-white/10 uppercase tracking-widest">
                                {product.tipo.tipo}
                            </span>
                        )}
                    </div>
                </div>

                {/* Panel de Precios Mayoristas */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                    <div className="bg-gray-50 dark:bg-[#1a1a1a] p-5 rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm">
                        <p className="text-gray-500 dark:text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1">Precio x Unidad</p>
                        <p className="text-3xl font-black text-dark dark:text-white">
                            {priceUnidad > 0 ? `Bs ${priceUnidad.toFixed(2)}` : "No disponible"}
                        </p>
                        <p className="text-[#C5A021] dark:text-[#D4AF37] text-[10px] font-black mt-2 uppercase">Margen Minorista Sugerido</p>
                    </div>
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-[#1a1a1a] dark:to-[#222] p-5 rounded-3xl border border-[#D4AF37]/30 shadow-md">
                        <p className="text-[#C5A021] dark:text-[#D4AF37] text-[10px] font-bold uppercase tracking-widest mb-1">Precio x Docena ($)</p>
                        <p className="text-4xl font-black text-[#C5A021] dark:text-[#D4AF37]">
                            {priceDocena > 0 ? `Bs ${priceDocena.toFixed(2)}` : "No disponible"}
                        </p>
                        <p className="text-gray-500 dark:text-gray-400 text-[10px] font-bold mt-2 uppercase">Ahorro máximo por volumen</p>
                    </div>
                </div>

                <div className="prose prose-invert max-w-none text-gray-400 mb-10 flex-grow text-sm leading-relaxed">
                    <p className="whitespace-pre-line">{product.descripcion}</p>
                </div>

                {/* Acciones Mayoristas */}
                <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <button
                            onClick={handleAddUnit}
                            disabled={!hasStock || priceUnidad === 0}
                            className={`flex items-center justify-center gap-3 py-5 px-6 rounded-2xl font-black text-xs uppercase tracking-widest transition-all disabled:opacity-30 disabled:cursor-not-allowed transform active:scale-95 ${isWholesaleMode
                                ? 'bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-dark dark:text-white hover:bg-gray-200 dark:hover:bg-white/10'
                                : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'
                                }`}
                        >
                            <FaCartPlus size={20} /> Añadir x Unidad
                        </button>
                        <button
                            onClick={handleAddDozen}
                            disabled={!hasStock || priceDocena === 0}
                            className="flex items-center justify-center gap-3 py-5 px-6 bg-gradient-to-r from-[#C5A021] to-[#D4AF37] text-black rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-[1.02] transition-all shadow-xl shadow-[#D4AF37]/20 disabled:opacity-30 disabled:cursor-not-allowed transform active:scale-95"
                        >
                            <FaLayerGroup size={20} /> Añadir x Docena
                        </button>
                    </div>

                    <a
                        href={`https://wa.me/59170621016?text=Hola,%20soy%20mayorista%20y%20me%20interesa%20compra%20masiva%20de:%20${product.nombre}`}
                        target="_blank"
                        className="flex items-center justify-center gap-3 py-4 bg-[#25D366]/10 border border-[#25D366]/30 text-[#25D366] rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-[#25D366]/20 transition-all"
                    >
                        <FaWhatsapp size={18} /> Consultar Asesor VIP
                    </a>
                </div>
            </div>
        </div>
    );
}
