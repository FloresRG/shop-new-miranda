import React from "react";
import logoImage from "@/assets/logo.webp";
import bannerMobil from "@/assets/banner/Banner_mobil.webp";
import bannerPc from "@/assets/banner/Banner_pc.webp";

const socialLinks = [
  {
    name: "TikTok",
    url: "https://www.tiktok.com/@importadoramirandalives",
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.03 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.9-.32-1.9-.39-2.81-.12-.9.24-1.72.76-2.29 1.53-.74 1-1 2.22-.71 3.4.26 1.15 1 2.16 2 2.76.99.63 2.21.75 3.32.31 1.09-.39 1.96-1.3 2.34-2.39.11-.26.16-.54.2-.82.02-2.99.01-5.97.01-8.96z" />
      </svg>
    ),
  },
  {
    name: "WhatsApp",
    url: "https://wa.me/59170621016",
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
    ),
  },
  {
    name: "Instagram",
    url: "#",
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.584.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.981 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
      </svg>
    ),
  },
  {
    name: "Facebook",
    url: "https://www.facebook.com/profile.php?id=100063558189871",
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
];

const mainLinks = [
  {
    title: "PAGO CON QR (LIVE)",
    url: "/liveqr",
    subtitle: "Realiza tu pago de forma segura",
  },
  {
    title: "TIENDA DE PRODUCTOS",
    url: "/tienda?page=1",
    subtitle: "Explora nuestro catálogo completo",
  },
  {
    title: "UBICACIÓN",
    url: "/about",
    subtitle: "Visítanos en nuestra sucursal",
  },
];

export default function LinkTree() {
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "Importadora Miranda",
        text: "Mira todos nuestros enlaces oficiales",
        url: window.location.href,
      });
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col items-center px-4 py-8 font-primary overflow-x-hidden">
      {/* Sharp Background Images */}
      <div className="fixed inset-0 z-0">
        <picture>
          <source media="(max-width: 640px)" srcSet={bannerMobil.src} />
          <img
            src={bannerPc.src}
            alt="Background"
            className="w-full h-full object-cover"
          />
        </picture>
        {/* Subtle gradient to ensure readability without blurring the image */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40"></div>
      </div>

      <div className="relative z-10 w-full max-w-xl flex flex-col items-center">
        {/* Top Header Controls */}
        <div className="w-full flex justify-between items-center mb-10">
          <div className="bg-white/20 backdrop-blur-sm p-3 rounded-2xl shadow-xl border border-white/40 group hover:bg-white/30 transition-all cursor-pointer">
            <svg
              className="w-6 h-6 text-white drop-shadow-md"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z"
              />
            </svg>
          </div>
          <button
            onClick={handleShare}
            className="bg-white/20 backdrop-blur-sm p-3 rounded-2xl shadow-xl border border-white/40 hover:scale-110 active:scale-95 transition-all group"
          >
            <svg
              className="w-6 h-6 text-white drop-shadow-md"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
              />
            </svg>
          </button>
        </div>

        {/* Profile Section */}
        <div className="flex flex-col items-center mb-10 animate-slideUp">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-[1.5rem] overflow-hidden shadow-xl mb-6 flex items-center justify-center">
            <img
              src={logoImage.src}
              alt="Importadora Miranda Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <h1
            className="text-4xl sm:text-5xl font-black text-white text-center drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] mb-3"
            style={{ fontFamily: "Outfit, sans-serif" }}
          >
            Importadora Miranda
          </h1>
          <p className="text-white text-lg text-center max-w-xs sm:max-w-md font-semibold drop-shadow-lg opacity-90">
            Todo lo que necesitas en un solo lugar. Canal oficial de ventas y
            atención.
          </p>
        </div>

        {/* Social Icons Container */}
        <div className="flex justify-center gap-5 mb-12 animate-slideUp delay-100">
          {socialLinks.map((link) => (
            <a
              key={link.name}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 bg-white/10 backdrop-blur-md rounded-2xl text-white shadow-xl hover:scale-125 hover:-translate-y-2 hover:bg-white hover:text-purple-600 transition-all duration-300 border-2 border-white/30"
              aria-label={link.name}
            >
              {link.icon}
            </a>
          ))}
        </div>

        {/* Main Links Container */}
        <div className="w-full flex flex-col gap-6 animate-slideUp delay-200">
          {mainLinks.map((link) => (
            <a
              key={link.title}
              href={link.url}
              className="group block w-full bg-white/10 backdrop-blur-lg border-2 border-white/40 rounded-3xl p-6 transition-all duration-500 hover:scale-[1.02] hover:bg-white hover:border-white shadow-2xl relative overflow-hidden"
            >
              <div className="flex justify-between items-center relative z-10">
                <div className="flex flex-col">
                  <span className="text-xl sm:text-2xl font-black text-white group-hover:text-purple-900 transition-colors uppercase tracking-tighter">
                    {link.title}
                  </span>
                  <span className="text-sm sm:text-base font-medium text-white/80 group-hover:text-purple-600 transition-colors">
                    {link.subtitle}
                  </span>
                </div>
                <div className="bg-white/20 p-3 rounded-2xl text-white group-hover:bg-purple-600 group-hover:text-white transition-all transform group-hover:rotate-12 shadow-inner">
                  <svg
                    className="w-7 h-7"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="3"
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </div>
              </div>
              {/* Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
            </a>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-20 text-white/70 text-sm font-bold tracking-widest uppercase drop-shadow-md animate-fadeIn">
          © {new Date().getFullYear()} Importadora Miranda • Premium
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;900&display=swap');
        
        body {
          font-family: 'Outfit', sans-serif;
          background: #000;
        }

        .shadow-premium {
          box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.5);
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes pulseSlow {
          0%, 100% { transform: scale(1); filter: drop-shadow(0 0 10px rgba(255,255,255,0.3)); }
          50% { transform: scale(1.05); filter: drop-shadow(0 0 25px rgba(255,255,255,0.6)); }
        }

        .animate-slideUp {
          animation: slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .animate-pulse-slow {
          animation: pulseSlow 4s ease-in-out infinite;
        }

        .delay-100 { animation-delay: 0.15s; }
        .delay-200 { animation-delay: 0.3s; }
      `,
        }}
      />
    </div>
  );
}
