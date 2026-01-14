import React from "react";
import LiquidacionCardV2 from "./LiquidacionCardV2";
import type { Liquidacion } from "./LiquidacionesContainer";

interface LiquidacionGridProps {
    products: Liquidacion[];
    isLoading?: boolean;
}

const LiquidacionGrid: React.FC<LiquidacionGridProps> = ({
    products,
    isLoading = false,
}) => {
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <div
                        key={i}
                        className="bg-white dark:bg-darkmode-light rounded-[32px] h-[500px] border border-gray-100 dark:border-gray-800 overflow-hidden shadow-lg animate-pulse"
                    >
                        <div className="w-full h-72 bg-gray-200 dark:bg-gray-800 p-6 flex items-center justify-center">
                            <div className="w-48 h-48 bg-gray-300 dark:bg-gray-700 rounded-2xl"></div>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded-full w-3/4"></div>
                            <div className="h-px bg-gray-100 dark:bg-gray-800 w-full"></div>
                            <div className="flex justify-between items-center pt-2">
                                <div className="space-y-2">
                                    <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded-full w-12"></div>
                                    <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded-full w-24"></div>
                                </div>
                                <div className="h-14 w-14 bg-gray-300 dark:bg-gray-700 rounded-2xl"></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {products.map((product) => (
                    <LiquidacionCardV2 key={product.id} product={product} />
                ))}
            </div>
            {products.length === 0 && (
                <div className="col-span-full py-20 text-center">
                    <h3 className="text-xl font-bold text-gray-500">
                        No se encontraron liquidaciones
                    </h3>
                    <p className="text-gray-400">Intenta más tarde.</p>
                </div>
            )}
        </>
    );
};

export default LiquidacionGrid;
