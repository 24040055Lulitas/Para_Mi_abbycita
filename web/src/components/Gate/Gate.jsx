import { useEffect, useRef, useState } from 'react';
import { usePlayer } from '../../context/PlayerContext';
import { resolveTrackRef } from '../../data/catalog';
import './Gate.css';

const SESSION_KEY = 'abby-gate-entered';

/* canción de entrada — "i love you" por ahora; cámbiala aquí
   (data/catalog.js tiene el catálogo completo) */
const ENTRANCE_TRACK = resolveTrackRef({ album: 'wwafawdwg', track: 12 });

const HEART_PATH =
  'M12 20s-6.7-4.2-9-8C1.3 9.1 2.6 5.6 5.7 5c2.1-.4 3.9.6 4.9 2.2L12 9l1.4-1.8c1-1.6 2.8-2.6 4.9-2.2 3.1.6 4.4 4.1 2.7 7-2.3 3.8-9 8-9 8z';

const SPARKLE_PATH =
  'M12 2c.6 4.8 2.2 7.4 10 10-7.8 2.6-9.4 5.2-10 10-.6-4.8-2.2-7.4-10-10 7.8-2.6 9.4-5.2 10-10z';

/* estrellitas decorativas: posición (%), tamaño (px), color, retraso */
const SPARKLES = [
  { x: 16, y: 19, s: 16, c: '#ffd6e8', d: 0 },
  { x: 83, y: 22, s: 10, c: '#cfe2ff', d: 1.2 },
  { x: 79, y: 78, s: 20, c: '#ffd6e8', d: 2.1 },
  { x: 21, y: 76, s: 12, c: '#ffffff', d: 0.6 },
  { x: 92, y: 50, s: 8, c: '#ffffff', d: 1.7 },
  { x: 7, y: 47, s: 9, c: '#cfe2ff', d: 2.6 },
];

/* Entrada sin contraseña, en forma de carta: primero un sobre cerrado
   con un sello de cera; al tocar el sello se abre la carta, y el botón
   "Entrar a tu lugar" pone a sonar la canción de entrada (de paso
   resuelve el autoplay: el navegador necesita un gesto para dejar
   sonar audio). */
export default function Gate({ children }) {
  const [entered, setEntered] = useState(() => {
    try {
      return sessionStorage.getItem(SESSION_KEY) === '1';
    } catch {
      return false;
    }
  });
  const [opened, setOpened] = useState(false);
  const enterBtnRef = useRef(null);
  const { playTrackRef } = usePlayer();

  useEffect(() => {
    if (opened) {
      /* espera a que termine la animación de la carta antes de mover el foco */
      const id = setTimeout(() => enterBtnRef.current?.focus({ preventScroll: true }), 700);
      return () => clearTimeout(id);
    }
    return undefined;
  }, [opened]);

  const handleEnter = () => {
    if (ENTRANCE_TRACK) playTrackRef(ENTRANCE_TRACK);
    setEntered(true);
    try {
      sessionStorage.setItem(SESSION_KEY, '1');
    } catch {
      /* almacenamiento no disponible, no pasa nada */
    }
  };

  return (
    <>
      {children}
      <div
        className={`gate${entered ? ' is-leaving' : ''}${opened ? ' is-opened' : ''}`}
        aria-hidden={entered}
        role="dialog"
        aria-modal="true"
        aria-label="Bienvenida"
      >
        <div className="gate-glow" aria-hidden="true" />
        {SPARKLES.map((p, i) => (
          <svg
            key={i}
            className="gate-sparkle"
            viewBox="0 0 24 24"
            aria-hidden="true"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.s,
              height: p.s,
              animationDelay: `${p.d}s`,
            }}
          >
            <path d={SPARKLE_PATH} fill={p.c} />
          </svg>
        ))}

        {/* ===== paso 1: el sobre ===== */}
        <div className="gate-step gate-step--envelope" aria-hidden={opened}>
          <p className="gate-eyebrow">hola, mi amor</p>
          <h1 className="gate-title">Tienes una carta</h1>

          <div className="gate-envelope">
            <svg className="gate-envelope-art" viewBox="0 0 460 300" aria-hidden="true">
              <rect x="0" y="0" width="460" height="300" rx="14" fill="#f3e4da" />
              <path d="M0 300 L230 150 L460 300" fill="#ead6ca" />
              <path d="M0 14 Q0 0 14 0 L446 0 Q460 0 460 14 L460 20 L230 172 L0 20 Z" fill="#e6cfc1" />
              <path d="M0 20 L230 172 L460 20" fill="none" stroke="rgba(120,70,80,0.18)" strokeWidth="1.5" />
            </svg>
            <button
              type="button"
              className="gate-seal"
              onClick={() => setOpened(true)}
              aria-label="Abrir la carta"
              tabIndex={opened ? -1 : 0}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d={HEART_PATH} />
              </svg>
            </button>
          </div>

          <p className="gate-hint">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M9 11V6a2 2 0 014 0v5M13 10a2 2 0 014 0v3a7 7 0 01-7 7h-.5A6.5 6.5 0 013 13.5V12a2 2 0 014 0" />
            </svg>
            Toca el sello para abrirla
          </p>
        </div>

        {/* ===== paso 2: la carta abierta ===== */}
        <div className="gate-step gate-step--letter" aria-hidden={!opened}>
          <article className="gate-letter">
            <p className="gate-letter-greeting">Mi amor:</p>
            <p>
              Hay canciones que llegan justo cuando no sabemos ponerle nombre a lo que
              sentimos. Billie fue eso para ti, y tú lo eres para mí.
            </p>
            <p>
              Hice este lugar para que, cada vez que lo abras, recuerdes que no estás
              sola: que te admiro, y que te quiero en tus días bonitos y también en los
              difíciles.
            </p>
            <p className="gate-letter-sign">Siempre tuyo</p>
          </article>

          <button
            ref={enterBtnRef}
            type="button"
            className="gate-enter"
            onClick={handleEnter}
            tabIndex={opened ? 0 : -1}
          >
            Entrar a tu lugar
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </button>
          <p className="gate-music-note">La música empieza al entrar</p>
        </div>
      </div>
    </>
  );
}
