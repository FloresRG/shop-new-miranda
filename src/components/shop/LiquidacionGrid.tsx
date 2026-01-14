import React from "react";
import LiquidacionCardV2 from "./LiquidacionCardV2";
import Skeleton from "../ui/Skeleton";
// Importamos la interfaz directamente desde el contenedor para mantener la coherencia
import type { Liquidacion } from "./LiquidacionesContainer";

interface LiquidacionGridProps {
  products: Liquidacion[];
  isLoading?: boolean;
}

const LiquidacionGrid: React.FC<LiquidacionGridProps> = ({ 
  products = [], 
  isLoading = false 
}) => {
  
  // 1. Estado de Carga (Skeletons)
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={`skeleton-${i}`}
            className="bg-white dark:bg-darkmode-theme-light rounded-3xl h-[480px] border border-gray-100 dark:border-darkmode-border overflow-hidden"
          >
            <Skeleton className="w-full h-[280px]" />
            <div className="p-6 space-y-4">
              <div className="flex justify-between">
                 <Skeleton className="w-16 h-5 rounded-md" />
                 <Skeleton className="w-20 h-5 rounded-md" />
              </div>
              <Skeleton className="w-full h-8 rounded-lg" />
              <div className="flex justify-between items-center pt-6">
                <div className="space-y-2">
                  <Skeleton className="w-12 h-4" />
                  <Skeleton className="w-24 h-8" />
                </div>
                <Skeleton className="w-12 h-12 rounded-2xl" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // 2. Estado Vacío (Sin productos)
  if (products.length === 0) {
    return (
      <div className="py-32 text-center bg-gray-50 dark:bg-darkmode-theme-light rounded-3xl border-2 border-dashed border-gray-200 dark:border-darkmode-border">
        <div className="mb-4 flex justify-center text-[#F2275D] opacity-20">
            <svg className="w-20 h-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
        </div>
        <h3 className="text-2xl font-bold text-dark dark:text-white">
          No hay ofertas activas
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-xs mx-auto">
          En este momento no tenemos productos en liquidación. ¡Vuelve pronto para aprovechar nuestros descuentos!
        </p>
      </div>
    );
  }

  // 3. Renderizado de Datos
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((item) => (
        <LiquidacionCardV2 
          key={`liquidacion-${item.id}`} 
          product={item} 
        />
      ))}
    </div>
  );
};

export default LiquidacionGrid;