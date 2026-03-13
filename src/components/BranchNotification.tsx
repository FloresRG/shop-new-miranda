import React, { useEffect, useState, useRef } from 'react';
import './BranchNotification.css';

const BranchNotification = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const hasCheckedRef = useRef(false);

  useEffect(() => {
    // Evitar chequear/mostrar múltiples veces en StrictMode
    if (hasCheckedRef.current) return;
    hasCheckedRef.current = true;

    const lastTimeKey = 'branch-notification-last-time';
    const TEN_MINUTES = 5 * 60 * 1000;

    const shouldShowNotification = () => {
      const lastTime = localStorage.getItem(lastTimeKey);
      const now = Date.now();

      if (!lastTime) {
        return true;
      }

      const timeDiff = now - parseInt(lastTime);
      return timeDiff > TEN_MINUTES;
    };

    const playNotificationSound = () => {
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.type = 'sine';
        oscillator.frequency.value = 800;
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
      } catch (e) {
        // Silenciosamente ignorar errores de audio
      }
    };

    if (shouldShowNotification()) {
      setIsVisible(true);
      playNotificationSound();
      localStorage.setItem(lastTimeKey, Date.now().toString());

      // Auto-dismiss after 10 seconds
      timerRef.current = setTimeout(() => {
        handleClose();
      }, 10000);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const handleClose = () => {
    setIsClosing(true);
    // Wait for the exit animation to finish before removing from DOM
    setTimeout(() => {
      setIsVisible(false);
      setIsClosing(false);
    }, 400); // This should match the CSS animation duration
  };

  if (!isVisible) return null;

  return (
    <div className={`branch-notification-toast-sonner-custom ${isClosing ? 'exit' : ''}`}>
      <div className="branch-notification-sonner">
        <div className="sonner-icon-wrapper">
          <span>📍</span>
        </div>
        <div className="sonner-body">
          <div className="sonner-title">¿Tienes Dudas o Consultas?</div>
          <div className="sonner-description">
            Comunícate directamente con nuestro equipo de ventas sin salir de la página.
          </div>
          <div className="sonner-actions">
            <button
              onClick={() => {
                handleClose();
                if ((window as any).$chatwoot) {
                  (window as any).$chatwoot.toggle();
                }
              }}
              className="sonner-button-primary w-full max-w-none text-center justify-center bg-[#F2275D] hover:bg-[#F2275D]/90 text-white font-bold py-2 px-4 rounded-xl flex items-center transition-colors shadow-md"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Chatea con nosotros directamente
            </button>
          </div>
        </div>
        <button
          className="sonner-close"
          onClick={handleClose}
          aria-label="Cerrar notificación"
          title="Cerrar notificación"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        <div className="sonner-progress"></div>
      </div>
    </div>
  );
};

export default BranchNotification;
