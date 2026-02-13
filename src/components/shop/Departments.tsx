import React from "react";
import {
  FaTruck,
  FaMapMarkerAlt,
  FaGlobeAmericas,
  FaArrowRight,
} from "react-icons/fa";

const badgeColors = [
  "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700",
  "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700",
  "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700",
  "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700",
  "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-700",
  "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-700",
  "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-900/30 dark:text-teal-300 dark:border-teal-700",
  "bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-300 dark:border-cyan-700",
  "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200 dark:bg-fuchsia-900/30 dark:text-fuchsia-300 dark:border-fuchsia-700",
  "bg-lime-50 text-lime-700 border-lime-200 dark:bg-lime-900/30 dark:text-lime-300 dark:border-lime-700",
];

const departments = [
  {
    name: "Santa Cruz",
    provinces: ["Santa Cruz", "Montero", "Camiri", "Zona Norte"],
    color: "from-green-400 to-green-600",
  },
  {
    name: "Cochabamba",
    provinces: ["Cochabamba", "Quillacollo", "Sacaba", "Zona Norte"],
    color: "from-red-500 to-red-700",
  },
  {
    name: "Potosí",
    provinces: ["Potosi", "Tupiza", "Villazón", "Uyuni", "Llallagua"],
    color: "from-red-600 to-red-800",
  },
  {
    name: "Oruro",
    provinces: ["Oruro"],
    color: "from-yellow-500 to-yellow-700",
  },
  {
    name: "Chuquisaca",
    provinces: ["Sucre"],
    color: "from-red-400 to-red-600",
  },
  {
    name: "Tarija",
    provinces: ["Tarija", "Yacuiba", "Villa Montes", "Bermejo", "Camargo"],
    color: "from-red-500 to-red-700",
  },
  {
    name: "Beni",
    provinces: [
      "Trinidad",
      "Riberalta",
      "Guayaramerín",
      "San Borja",
      "Santa Rosa",
      "Santa Ana del Yacuma",
      "Rurrenabaque",
    ],
    color: "from-green-500 to-green-700",
  },
  {
    name: "Pando",
    provinces: ["Cobija", "Puerto Rosa", "Puerto Cena", "Puerto Rico"],
    color: "from-green-400 to-green-600",
  },
];

const Departments = () => {
  return (
    <section
      id="departments-section"
      className="section py-20 bg-body dark:bg-darkmode-body relative overflow-hidden"
    >
      <div className="container relative z-10">
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-bold uppercase tracking-wider">
            <FaGlobeAmericas className="animate-spin-slow" />
            Envíos a todo el país
          </div>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg font-medium">
            Llegamos a cada rincón de Bolivia. Realizamos envíos garantizados a
            todos los departamentos y sus provincias principales.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map((dept, idx) => (
            <div
              key={dept.name}
              className="group relative bg-white dark:bg-darkmode-light border border-gray-100 dark:border-darkmode-border rounded-3xl p-6 transition-all duration-500 hover:-translate-y-2 shadow-xl shadow-gray-200/50 dark:shadow-none overflow-hidden"
            >
              <div
                className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${dept.color} opacity-5 group-hover:opacity-10 transition-opacity blur-2xl -mr-10 -mt-10 rounded-full`}
              ></div>

              <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-center gap-4 mb-6">
                  <div
                    className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${dept.color} flex items-center justify-center p-3 text-white shadow-lg shadow-gray-300 dark:shadow-none`}
                  >
                    <FaMapMarkerAlt className="w-full h-full" />
                  </div>
                  <h3 className="text-2xl font-black text-dark dark:text-white uppercase tracking-tight">
                    {dept.name}
                  </h3>
                </div>

                <div className="flex-1">
                  <p className="text-gray-400 dark:text-white/40 text-xs font-bold uppercase tracking-widest mb-4">
                    Provincias & Destinos
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {dept.provinces.map((prov, i) => (
                      <span
                        key={prov}
                        className={`px-3 py-1 rounded-full border text-xs font-semibold transition-all ${badgeColors[i % badgeColors.length]}`}
                      >
                        {prov}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-100 dark:border-white/10 flex justify-between items-center">
                  <div className="flex items-center gap-2 text-gray-500 dark:text-white/50 text-xs font-bold">
                    <FaTruck className="text-primary" />
                    Entrega en 72h+
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center text-gray-400 dark:text-white/30 group-hover:text-primary group-hover:bg-primary/10 transition-all">
                    <FaArrowRight className="w-3 h-3" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Call to action */}
        <div className="mt-20 bg-white dark:bg-darkmode-light border border-gray-100 dark:border-darkmode-border shadow-2xl shadow-gray-200/50 dark:shadow-none rounded-[40px] p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-3xl -mr-32 -mt-32 rounded-full"></div>
          <div className="space-y-4 text-center md:text-left relative z-10">
            <h3 className="text-3xl font-black text-dark dark:text-white uppercase tracking-tight leading-none">
              ¿No encuentras tu{" "}
              <span className="text-primary italic">ubicación</span>?
            </h3>
            <p className="text-gray-500 dark:text-gray-400 font-medium">
              Contáctanos directamente para coordinar envíos especiales a zonas
              rurales o fronterizas.
            </p>
          </div>
          <a
            href="https://wa.me/59170621016"
            target="_blank"
            rel="noopener noreferrer"
            className="relative z-10 px-8 py-4 bg-primary hover:bg-primary/90 text-white rounded-2xl font-bold transition-all hover:scale-105 active:scale-95 shadow-xl shadow-primary/25 flex items-center gap-3 whitespace-nowrap"
          >
            Consultar Destino
            <FaArrowRight />
          </a>
        </div>
      </div>
    </section>
  );
};

export default Departments;
