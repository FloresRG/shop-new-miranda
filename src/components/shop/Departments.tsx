import React from "react";
import {
  FaTruck,
  FaMapMarkerAlt,
  FaGlobeAmericas,
  FaArrowRight,
} from "react-icons/fa";

const departments = [
  {
    name: "La Paz",
    provinces: [
      "Murillo",
      "Omasuyos",
      "Pacajes",
      "Larecaja",
      "Ingavi",
      "Sud Yungas",
      "Nor Yungas",
      "Inquisivi",
    ],
    color: "from-green-500 to-green-700",
  },
  {
    name: "Santa Cruz",
    provinces: [
      "Andrés Ibáñez",
      "Warnes",
      "Velasco",
      "Ichilo",
      "Chiquitos",
      "Sara",
      "Cordillera",
      "Vallegrande",
    ],
    color: "from-green-400 to-green-600",
  },
  {
    name: "Cochabamba",
    provinces: [
      "Cercado",
      "Campero",
      "Ayopaya",
      "Esteban Arce",
      "Arani",
      "Arque",
      "Capinota",
      "Germán Jordán",
    ],
    color: "from-red-500 to-red-700",
  },
  {
    name: "Oruro",
    provinces: [
      "Cercado",
      "Abaroa",
      "Carangas",
      "Sajama",
      "Litoral",
      "Poopó",
      "Pantaleón Dalence",
    ],
    color: "from-yellow-500 to-yellow-700",
  },
  {
    name: "Potosí",
    provinces: [
      "Tomás Frías",
      "Rafael Bustillo",
      "Cornelio Saavedra",
      "Chayanta",
      "Linares",
      "Quijarro",
    ],
    color: "from-red-600 to-red-800",
  },
  {
    name: "Chuquisaca",
    provinces: [
      "Oropeza",
      "Azurduy",
      "Zudáñez",
      "Tomina",
      "Hernando Siles",
      "Yamparáez",
    ],
    color: "from-red-400 to-red-600",
  },
  {
    name: "Tarija",
    provinces: [
      "Cercado",
      "Arce",
      "Gran Chaco",
      "Avilés",
      "Méndez",
      "Burnet O'Connor",
    ],
    color: "from-red-500 to-red-700",
  },
  {
    name: "Beni",
    provinces: [
      "Cercado",
      "Vaca Díez",
      "General José Ballivián",
      "Yacuma",
      "Moxos",
      "Marbán",
    ],
    color: "from-green-500 to-green-700",
  },
  {
    name: "Pando",
    provinces: [
      "Nicolás Suárez",
      "Abuná",
      "Federico Román",
      "Madre de Dios",
      "Manuripi",
    ],
    color: "from-green-400 to-green-600",
  },
];

const Departments = () => {
  return (
    <section
      id="departments-section"
      className="py-20 bg-[#0a0a0a] relative overflow-hidden"
    >
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-[#17BFBF]/20 rounded-full blur-[120px]"></div>
      </div>

      <div className="container relative z-10">
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-primary text-sm font-bold uppercase tracking-wider backdrop-blur-sm">
            <FaGlobeAmericas className="animate-spin-slow" />
            Envíos a todo el país
          </div>
          <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tight">
            Nuestra <span className="text-primary italic">Cobertura</span>
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto text-lg">
            Llegamos a cada rincón de Bolivia. Realizamos envíos garantizados a
            todos los departamentos y sus provincias principales.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map((dept, idx) => (
            <div
              key={dept.name}
              className="group relative bg-white/5 hover:bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl p-6 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/10 overflow-hidden"
            >
              <div
                className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${dept.color} opacity-10 group-hover:opacity-20 transition-opacity blur-2xl -mr-10 -mt-10 rounded-full`}
              ></div>

              <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-center gap-4 mb-6">
                  <div
                    className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${dept.color} flex items-center justify-center p-3 text-white shadow-lg`}
                  >
                    <FaMapMarkerAlt className="w-full h-full" />
                  </div>
                  <h3 className="text-2xl font-black text-white uppercase tracking-tight">
                    {dept.name}
                  </h3>
                </div>

                <div className="flex-1">
                  <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-4">
                    Provincias & Destinos
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {dept.provinces.map((prov) => (
                      <span
                        key={prov}
                        className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/70 text-xs font-medium group-hover:bg-white/10 group-hover:text-white transition-colors"
                      >
                        {prov}
                      </span>
                    ))}
                    <span className="px-3 py-1 rounded-full bg-primary/20 border border-primary/30 text-primary text-xs font-bold">
                      + Más ciudades
                    </span>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-white/10 flex justify-between items-center">
                  <div className="flex items-center gap-2 text-white/50 text-xs font-medium">
                    <FaTruck className="text-primary" />
                    Entrega en 24-48h
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/30 group-hover:text-primary group-hover:bg-primary/10 transition-all">
                    <FaArrowRight className="w-3 h-3" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Call to action */}
        <div className="mt-20 bg-gradient-to-r from-primary/10 via-[#F2275D]/5 to-transparent backdrop-blur-md border border-white/10 rounded-[40px] p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 text-center md:text-left">
            <h3 className="text-3xl font-black text-white uppercase tracking-tight">
              ¿No encuentras tu{" "}
              <span className="text-primary italic">ubicación</span>?
            </h3>
            <p className="text-white/60">
              Contáctanos directamente para coordinar envíos especiales a zonas
              rurales o fronterizas.
            </p>
          </div>
          <a
            href="https://wa.me/59170621016"
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-4 bg-primary hover:bg-primary/90 text-white rounded-2xl font-bold transition-all hover:scale-105 active:scale-95 shadow-xl shadow-primary/25 flex items-center gap-3 whitespace-nowrap"
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
