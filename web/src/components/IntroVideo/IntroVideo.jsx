import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import './IntroVideo.css';

/* video a pantalla completa con fondo negro, antes de entrar a una
   sección. Suena con su audio; si el navegador no deja empezar con
   sonido, arranca en silencio y ofrece un botón para escucharlo.
   Al terminar (o con "Saltar") llama a onDone. */
export default function IntroVideo({ src, label, onDone }) {
  const videoRef = useRef(null);
  const doneRef = useRef(false);
  const [needsTap, setNeedsTap] = useState(false);

  const finish = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    videoRef.current?.pause();
    onDone();
  }, [onDone]);

  /* se intenta reproducir en cuanto aparece, todavía dentro del toque */
  useLayoutEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = false;
    v.play()?.catch(() => {
      v.muted = true;
      v.play()?.catch(() => {});
      setNeedsTap(true);
    });
  }, []);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => {
      if (e.key === 'Escape') finish();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
    };
  }, [finish]);

  const unmute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = false;
    v.currentTime = 0;
    v.play()?.catch(() => {});
    setNeedsTap(false);
  };

  return createPortal(
    <div className="intro-video" role="dialog" aria-modal="true" aria-label={label}>
      <video ref={videoRef} src={src} playsInline preload="auto" onEnded={finish} onError={finish} />
      {needsTap && (
        <button type="button" className="intro-video-sound" onClick={unmute}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 9v6h4l5 4V5L8 9H4zM16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11" />
          </svg>
          Toca para escucharlo
        </button>
      )}
      <button type="button" className="intro-video-skip" onClick={finish}>
        Saltar
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5l7 7-7 7M13 5l7 7-7 7" /></svg>
      </button>
    </div>,
    document.body
  );
}
