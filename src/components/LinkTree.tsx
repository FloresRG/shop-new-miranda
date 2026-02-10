import React from "react";
import logoImage from "@/assets/logo.webp";
import bannerMobil from "@/assets/banner/Banner_mobil.webp";
import bannerPc from "@/assets/banner/Banner_pc.webp";
import ThemeSwitcher from "./ThemeSwitcher";

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
    url: "/about#map-section",
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
    <div className="min-h-screen relative flex flex-col items-center px-4 py-8 font-primary overflow-x-hidden transition-colors duration-500">
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
        {/* Responsive gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-white/20 to-white/70 dark:from-darkmode-body/70 dark:via-darkmode-body/30 dark:to-darkmode-body/80 transition-colors duration-500"></div>
      </div>

      <div className="relative z-10 w-full max-w-xl flex flex-col items-center">
        {/* Top Header Controls */}
        <div className="w-full flex justify-between items-center mb-10 px-2">
          <ThemeSwitcher className="!w-14 !h-8 p-1.5 shadow-2xl" />
          <button
            onClick={handleShare}
            className="bg-white/60 dark:bg-darkmode-light/60 backdrop-blur-md p-3 rounded-2xl shadow-xl border border-white/80 dark:border-darkmode-border hover:scale-110 active:scale-95 transition-all group hover:bg-white dark:hover:bg-darkmode-light/100"
          >
            <svg
              className="w-6 h-6 text-purple-700 dark:text-white drop-shadow-md transition-colors"
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
        <div className="flex flex-col items-center mb-8 animate-slideUp">
          <div className="w-24 h-24 rounded-[1.8rem] overflow-hidden shadow-2xl mb-4 flex items-center justify-center p-2 bg-white ring-8 ring-white/30 dark:ring-darkmode-light/30">
            <img
              src={logoImage.src}
              alt="Importadora Miranda Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <h1
            className="text-3xl sm:text-4xl font-black text-purple-950 dark:text-white text-center drop-shadow-sm dark:drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] mb-2 transition-colors uppercase tracking-tight leading-tight"
            style={{ fontFamily: "Outfit, sans-serif" }}
          >
            Importadora Miranda
          </h1>
          <p className="text-purple-900 dark:text-white/90 text-sm sm:text-base text-center max-w-xs sm:max-w-md font-semibold drop-shadow-none dark:drop-shadow-md opacity-90 transition-colors bg-white/10 dark:bg-black/10 backdrop-blur-sm px-4 py-1.5 rounded-full border border-white/20">
            A un click del producto que necesitas.
          </p>
        </div>
        {/* Social Icons Container */}
        <div className="flex justify-center gap-3 mb-10 animate-slideUp delay-100">
          {socialLinks.map((link) => (
            <a
              key={link.name}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 bg-white/80 dark:bg-darkmode-light/80 backdrop-blur-md rounded-xl text-purple-700 dark:text-white shadow-lg hover:scale-115 hover:-translate-y-1.5 hover:bg-purple-600 hover:text-white dark:hover:bg-primary dark:hover:text-white transition-all duration-300 border-2 border-white dark:border-darkmode-border"
              aria-label={link.name}
            >
              {link.icon}
            </a>
          ))}
        </div>

        {/* Main Links Container */}
        <div className="w-full flex flex-col gap-4 animate-slideUp delay-200 px-2">
          {mainLinks.map((link) => (
            <a
              key={link.title}
              href={link.url}
              className="group block w-full bg-white/70 dark:bg-darkmode-light/70 backdrop-blur-xl border-2 border-white dark:border-darkmode-border rounded-2xl p-5 transition-all duration-500 hover:scale-[1.02] hover:bg-white dark:hover:bg-darkmode-light/100 shadow-xl relative overflow-hidden"
            >
              <div className="flex justify-between items-center relative z-10">
                <div className="flex flex-col text-left">
                  <span className="text-xl sm:text-2xl font-black text-purple-950 dark:text-white group-hover:text-primary transition-colors uppercase tracking-tighter leading-none mb-0.5">
                    {link.title}
                  </span>
                  <span className="text-xs sm:text-sm font-semibold text-purple-900/60 dark:text-white/50 group-hover:text-purple-900 dark:group-hover:text-white transition-colors">
                    {link.subtitle}
                  </span>
                </div>
                <div className="bg-purple-100 dark:bg-white/10 p-3 rounded-xl text-purple-700 dark:text-white group-hover:bg-primary group-hover:text-white transition-all transform group-hover:rotate-12 group-hover:scale-105 shadow-inner">
                  <svg
                    className="w-6 h-6"
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
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/40 to-white/0 translate-x-[-150%] group-hover:translate-x-[150%] transition-transform duration-1000 ease-out"></div>
            </a>
          ))}
        </div>
        {/* Footer */}
        <div className="mt-20 py-8 text-purple-950/40 dark:text-white/30 text-xs font-black tracking-[0.3em] uppercase drop-shadow-none animate-fadeIn transition-colors border-t border-purple-900/10 dark:border-white/5 w-screen text-center bg-white/5 backdrop-blur-sm">
          © {new Date().getFullYear()} Importadora Miranda
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;900&display=swap');
        
        body {
          font-family: 'Outfit', sans-serif;
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .animate-slideUp {
          animation: slideUp 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .animate-fadeIn {
          animation: fadeIn 1.2s ease-out forwards;
        }

        .delay-100 { animation-delay: 0.2s; }
        .delay-200 { animation-delay: 0.4s; }
      `,
        }}
      />
    </div>
  );
}
