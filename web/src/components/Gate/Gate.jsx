import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlayer } from '../../context/PlayerContext';
import { BIRTHDAY_VIDEO } from '../../data/birthday';
import { resolveTrackRef } from '../../data/catalog';
import { useMusicHold } from '../../hooks/useMusicHold';
import IntroVideo from '../IntroVideo/IntroVideo';
import './Gate.css';

export const SESSION_KEY = 'abby-gate-entered';

/* canción de entrada — "we fell in love in october" de girl in red;
   cámbiala aquí (data/catalog.js tiene el catálogo completo) */
const ENTRANCE_TRACK = resolveTrackRef({ single: 'we-fell-in-love-in-october' });

const HEART_PATH =
  'M12 20s-6.7-4.2-9-8C1.3 9.1 2.6 5.6 5.7 5c2.1-.4 3.9.6 4.9 2.2L12 9l1.4-1.8c1-1.6 2.8-2.6 4.9-2.2 3.1.6 4.4 4.1 2.7 7-2.3 3.8-9 8-9 8z';

const SPARKLE_PATH =
  'M12 2c.6 4.8 2.2 7.4 10 10-7.8 2.6-9.4 5.2-10 10-.6-4.8-2.2-7.4-10-10 7.8-2.6 9.4-5.2 10-10z';

/* palabras de inicio: aparecen una tras otra después de abrir la carta */
const INTRO_TITLE = ['Hola,', 'Abby.'];
const INTRO_PHRASES = [
  'Aquí no hay prisa.',
  'Aquí suenan las canciones que te abrazan.',
  'Y aquí, siempre, alguien te quiere.',
];
/* tiempos en segundos (deben coincidir con Gate.css) */
const INTRO_FIRST_PHRASE_AT = 2.4;
const INTRO_PHRASE_EVERY = 2.6;
/* cuándo aparece el botón para ir a la carta (tras la última frase) */
const INTRO_CTA_AT = INTRO_FIRST_PHRASE_AT + INTRO_PHRASE_EVERY * (INTRO_PHRASES.length - 1) + 1.4;

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
  const [intro, setIntro] = useState(false);
  const [birthdayVideo, setBirthdayVideo] = useState(false);
  const enterBtnRef = useRef(null);
  const skipBtnRef = useRef(null);
  const { playTrackRef } = usePlayer();
  const { hold: holdMusic, release: releaseMusic } = useMusicHold();
  const navigate = useNavigate();

  useEffect(() => {
    if (opened) {
      /* espera a que termine la animación de la carta antes de mover el foco */
      const id = setTimeout(() => enterBtnRef.current?.focus({ preventScroll: true }), 700);
      return () => clearTimeout(id);
    }
    return undefined;
  }, [opened]);

  const finish = useCallback(() => {
    setEntered(true);
    try {
      sessionStorage.setItem(SESSION_KEY, '1');
    } catch {
      /* almacenamiento no disponible, no pasa nada */
    }
  }, []);

  /* al entrar: suena la canción y empiezan las palabras de inicio */
  const handleEnter = () => {
    if (ENTRANCE_TRACK) playTrackRef(ENTRANCE_TRACK);
    setIntro(true);
  };

  /* "Hoy es un día especial": primero el video de cumpleaños a pantalla
     completa (con la música en pausa para que se escuche), y al terminar
     abre el cumpleaños y la canción de entrada sigue donde se quedó */
  const goToBirthday = () => {
    holdMusic();
    setBirthdayVideo(true);
  };

  const afterBirthdayVideo = useCallback(() => {
    setBirthdayVideo(false);
    navigate('/cumpleanos');
    finish();
    releaseMusic(ENTRANCE_TRACK);
  }, [finish, navigate, releaseMusic]);

  /* "Saltar": directo al inicio, sin carta */
  const skipToHome = () => {
    navigate('/');
    finish();
  };

  useEffect(() => {
    if (intro && !entered) skipBtnRef.current?.focus({ preventScroll: true });
  }, [intro, entered]);

  return (
    <>
      {children}
      {birthdayVideo && (
        <IntroVideo src={BIRTHDAY_VIDEO} label="Video de cumpleaños" onDone={afterBirthdayVideo} />
      )}
      <div
        className={`gate${entered ? ' is-leaving' : ''}${opened ? ' is-opened' : ''}${intro ? ' is-intro' : ''}`}
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
        <div className="gate-step gate-step--letter" aria-hidden={!opened || intro}>
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
            tabIndex={opened && !intro ? 0 : -1}
          >
            Entrar a tu lugar
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </button>
          <p className="gate-music-note">La música empieza al entrar</p>
        </div>

        {/* ===== paso 3: palabras de inicio ===== */}
        {intro && (
          <div className="gate-step gate-step--intro" aria-live="polite">
            <p className="gate-intro-eyebrow">bienvenida a tu lugar</p>
            <h2 className="gate-intro-title">
              {INTRO_TITLE.map((word, i) => (
                <span key={word} className="gate-intro-word" style={{ animationDelay: `${0.5 + i * 0.45}s` }}>
                  {word}
                </span>
              ))}
            </h2>
            <span className="gate-intro-divider" aria-hidden="true" />
            <div className="gate-intro-phrases">
              {INTRO_PHRASES.map((phrase, i) => (
                <p
                  key={phrase}
                  className={`gate-intro-phrase${i === INTRO_PHRASES.length - 1 ? ' is-last' : ''}`}
                  style={{ animationDelay: `${INTRO_FIRST_PHRASE_AT + i * INTRO_PHRASE_EVERY}s` }}
                >
                  {phrase}
                </p>
              ))}
            </div>
            <button
              type="button"
              className="gate-intro-next"
              onClick={goToBirthday}
              style={{ animationDelay: `${INTRO_CTA_AT}s` }}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <rect x="3" y="10" width="18" height="11" rx="1.5" />
                <path d="M2 7h20v3H2zM12 7v14M12 7c-1.5-3-5-4.5-6-2.5S8.5 7 12 7c3.5 0 7-.5 6-2.5S13.5 4 12 7z" />
              </svg>
              Hoy es un día especial
            </button>
            <button ref={skipBtnRef} type="button" className="gate-intro-skip" onClick={skipToHome}>
              Saltar
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5l7 7-7 7M13 5l7 7-7 7" /></svg>
            </button>
          </div>
        )}
      </div>
    </>
  );
}
