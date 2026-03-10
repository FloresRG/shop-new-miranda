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
          <div className="sonner-title">Sucursal en La Paz únicamente</div>
          <div className="sonner-description">
            El <strong>70621016</strong> no esta disponible. Para pedidos y envíos a toda Bolivia comunícate al nuevo número.
          </div>
          <div className="sonner-actions">
            <a
              href="https://wa.me/59164629503"
              target="_blank"
              rel="noopener noreferrer"
              className="sonner-button-primary"
            >
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
              64629503
            </a>
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
