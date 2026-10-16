import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlayer } from '../../context/PlayerContext';
import { QUIZ, QUIZ_RESULTS } from '../../data/quiz';
import './Quiz.css';

/* música de ambiente del quiz: suena sola, aparte del reproductor
   principal — "the world we should have gotten" (frutiger aero
   playlist, margaret) */
const BG_SONG = './quiz/frutiger-aero-bg.mp3';

/* posición y tamaño de cada burbuja en escritorio (% del escenario) */
const BUBBLE_LAYOUT = [
  { x: 9, y: 6, size: 168, float: 7.5, delay: 0 },
  { x: 40, y: 0, size: 150, float: 8.5, delay: 1.2 },
  { x: 72, y: 8, size: 176, float: 7, delay: 0.6 },
  { x: 20, y: 52, size: 152, float: 9, delay: 2 },
  { x: 46, y: 42, size: 180, float: 8, delay: 0.3 },
  { x: 76, y: 55, size: 156, float: 7.8, delay: 1.6 },
];

/* burbujitas decorativas que suben por toda la pantalla */
const AMBIENT_BUBBLES = Array.from({ length: 16 }, (_, i) => ({
  x: (i * 37) % 100,
  size: 10 + ((i * 13) % 34),
  dur: 11 + ((i * 7) % 10),
  delay: (i * 1.7) % 12,
}));

const LETTERS = ['A', 'B', 'C', 'D'];

/* ---------- el fondo con vida ---------- */

const CLOUDS = [
  { top: 6, w: 340, dur: 70, delay: -10, o: 0.55 },
  { top: 15, w: 230, dur: 95, delay: -50, o: 0.4 },
  { top: 2, w: 420, dur: 120, delay: -85, o: 0.35 },
];

/* peces que cruzan la parte de agua: dirección, altura, tamaño, color */
const FISH = [
  { dir: 1, top: 64, size: 96, dur: 26, delay: -4, body: '#ff9a3c', fin: '#ffd18a' },
  { dir: -1, top: 74, size: 74, dur: 32, delay: -18, body: '#39c6f4', fin: '#b9f0ff' },
  { dir: 1, top: 82, size: 60, dur: 22, delay: -11, body: '#b6f05a', fin: '#effcc4' },
  { dir: -1, top: 58, size: 52, dur: 38, delay: -27, body: '#ffd84a', fin: '#fff3b8' },
];

const SPARKLES = Array.from({ length: 12 }, (_, i) => ({
  x: (i * 53 + 11) % 96,
  y: (i * 29 + 7) % 55,
  s: 8 + ((i * 7) % 12),
  d: (i * 0.9) % 6,
}));

function Fish({ body, fin }) {
  return (
    <svg viewBox="0 0 100 60">
      <defs>
        <radialGradient id={`fg-${body.slice(1)}`} cx="38%" cy="32%" r="70%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.95" />
          <stop offset="30%" stopColor={fin} />
          <stop offset="100%" stopColor={body} />
        </radialGradient>
      </defs>
      <path className="aero-fish-tail" d="M74 30 L98 12 Q92 30 98 48 Z" fill={body} opacity="0.9" />
      <ellipse cx="44" cy="30" rx="36" ry="21" fill={`url(#fg-${body.slice(1)})`} />
      <path d="M36 10 Q48 0 60 11" fill={fin} opacity="0.85" />
      <path d="M38 50 Q46 58 56 49" fill={fin} opacity="0.85" />
      <circle cx="22" cy="25" r="4.5" fill="#0b3566" />
      <circle cx="20.6" cy="23.6" r="1.5" fill="#fff" />
      <ellipse cx="40" cy="18" rx="16" ry="5" fill="#fff" opacity="0.55" />
    </svg>
  );
}

/* todas las capas animadas; se mueven un poco con el mouse o el giro del
   celular (paralaje) para que se sienta como mirar por una ventana */
function AeroLife() {
  const worldRef = useRef(null);

  useEffect(() => {
    const el = worldRef.current;
    if (!el || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return undefined;
    let raf = 0;
    let tx = 0;
    let ty = 0;
    const set = (x, y) => {
      tx = x;
      ty = y;
      if (!raf) {
        raf = requestAnimationFrame(() => {
          el.style.setProperty('--px', tx.toFixed(3));
          el.style.setProperty('--py', ty.toFixed(3));
          raf = 0;
        });
      }
    };
    const onMove = (e) => set(e.clientX / window.innerWidth - 0.5, e.clientY / window.innerHeight - 0.5);
    const onTilt = (e) => {
      if (e.gamma == null) return;
      set(Math.max(-0.5, Math.min(0.5, e.gamma / 60)), Math.max(-0.5, Math.min(0.5, (e.beta - 45) / 60)));
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('deviceorientation', onTilt);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('deviceorientation', onTilt);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="aero-world" ref={worldRef} aria-hidden="true">
      {/* ruta relativa al documento: funciona igual en GitHub Pages */}
      <div
        className="aero-sky aero-layer"
        style={{
          '--depth': 14,
          backgroundImage:
            'linear-gradient(180deg, rgba(255,255,255,0.18) 0%, rgba(0,110,220,0.06) 45%, rgba(0,45,110,0.45) 100%), url(./quiz/aero.jpg)',
        }}
      />
      <div className="aero-rays aero-layer" style={{ '--depth': 6 }} />
      <div className="aero-clouds aero-layer" style={{ '--depth': 22 }}>
        {CLOUDS.map((c, i) => (
          <span
            key={i}
            style={{
              top: `${c.top}%`,
              width: c.w,
              height: c.w * 0.38,
              opacity: c.o,
              animationDuration: `${c.dur}s`,
              animationDelay: `${c.delay}s`,
            }}
          />
        ))}
      </div>
      <div className="aero-caustics aero-layer" style={{ '--depth': 18 }} />
      <svg className="aero-wave aero-layer" style={{ '--depth': 20 }} viewBox="0 0 1200 40" preserveAspectRatio="none">
        <path d="M0 20 Q75 4 150 20 T300 20 T450 20 T600 20 T750 20 T900 20 T1050 20 T1200 20 T1350 20 T1500 20 T1650 20 T1800 20 T1950 20 T2100 20 T2250 20 T2400 20 V40 H0 Z" />
      </svg>
      <div className="aero-fishes aero-layer" style={{ '--depth': 34 }}>
        {FISH.map((f, i) => (
          <span
            key={i}
            className={`aero-fish${f.dir < 0 ? ' is-left' : ''}`}
            style={{
              top: `${f.top}%`,
              width: f.size,
              animationDuration: `${f.dur}s`,
              animationDelay: `${f.delay}s`,
            }}
          >
            <span className="aero-fish-bob" style={{ animationDelay: `${i * 0.4}s` }}>
              <Fish body={f.body} fin={f.fin} />
            </span>
          </span>
        ))}
      </div>
      <div className="aero-sparkles aero-layer" style={{ '--depth': 10 }}>
        {SPARKLES.map((p, i) => (
          <svg
            key={i}
            viewBox="0 0 24 24"
            style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.s, height: p.s, animationDelay: `${p.d}s` }}
          >
            <path d="M12 1c.7 6 3.6 9.6 11 11-7.4 1.4-10.3 5-11 11-.7-6-3.6-9.6-11-11 7.4-1.4 10.3-5 11-11z" />
          </svg>
        ))}
      </div>
      <div className="aero-glare" />
      <div className="aero-ambient">
        {AMBIENT_BUBBLES.map((b, i) => (
          <span
            key={i}
            style={{
              left: `${b.x}%`,
              width: b.size,
              height: b.size,
              animationDuration: `${b.dur}s`,
              animationDelay: `${b.delay}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

/* ---------- botón para silenciar o volver a poner la música de ambiente ---------- */

function MusicToggle({ muted, onToggle }) {
  return (
    <div className={`aero-music${muted ? '' : ' is-on'}`}>
      <span className="aero-music-label" aria-hidden="true">
        {!muted && (
          <span className="aero-music-eq">
            <i />
            <i />
            <i />
          </span>
        )}
        {muted ? 'música en silencio' : 'the world we should have gotten'}
      </span>
      <button
        type="button"
        className="aero-music-btn"
        onClick={onToggle}
        aria-label={muted ? 'Poner la música' : 'Silenciar la música'}
        aria-pressed={muted}
        title={muted ? 'Poner música' : 'Silenciar'}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path className="solid" d="M4 9h4l5-4v14l-5-4H4z" />
          {muted ? (
            <path d="M16 9.5l5 5M21 9.5l-5 5" />
          ) : (
            <>
              <path className="aero-music-wave1" d="M16.5 9a4 4 0 010 6" />
              <path className="aero-music-wave2" d="M19 6.5a7.5 7.5 0 010 11" />
            </>
          )}
        </svg>
      </button>
    </div>
  );
}

/* ---------- burbujas al tocar el fondo ---------- */
let burstId = 0;

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  );
}

function CrossIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 7l10 10M17 7L7 17" />
    </svg>
  );
}

/* ---------- tarjeta de una pregunta ---------- */
function QuestionCard({ index, picked, onPick, onClose }) {
  const q = QUIZ[index];
  const answered = picked !== undefined;
  const correct = answered && picked === q.answer;
  const firstRef = useRef(null);
  const nextRef = useRef(null);

  useEffect(() => {
    (answered ? nextRef : firstRef).current?.focus({ preventScroll: true });
  }, [answered]);

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="aero-modal" onClick={onClose}>
      <section
        className={`aero-card${answered ? (correct ? ' is-correct' : ' is-wrong') : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="aeroQuestion"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="aero-card-shine" aria-hidden="true" />
        <p className="aero-card-step">
          Burbuja {index + 1} de {QUIZ.length} · {q.topic}
        </p>
        <h2 id="aeroQuestion" className="aero-card-question">
          {q.question}
        </h2>

        <div className="aero-options">
          {q.options.map((opt, i) => {
            const state = !answered
              ? ''
              : i === q.answer
                ? ' is-answer'
                : i === picked
                  ? ' is-picked-wrong'
                  : ' is-dim';
            return (
              <button
                key={opt}
                ref={i === 0 ? firstRef : null}
                type="button"
                className={`aero-option${state}`}
                onClick={() => !answered && onPick(index, i)}
                aria-disabled={answered}
                style={{ '--i': i }}
              >
                <span className="aero-option-letter">{LETTERS[i]}</span>
                <span className="aero-option-text">{opt}</span>
                {answered && i === q.answer && (
                  <span className="aero-option-mark aero-option-mark--ok">
                    <CheckIcon />
                  </span>
                )}
                {answered && i === picked && i !== q.answer && (
                  <span className="aero-option-mark aero-option-mark--no">
                    <CrossIcon />
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {answered && (
          <div className="aero-feedback" aria-live="polite">
            <p className="aero-feedback-title">{correct ? '¡Esa es!' : 'Casi…'}</p>
            <p className="aero-feedback-note">{q.note}</p>
            <button ref={nextRef} type="button" className="aero-btn aero-btn--green" onClick={onClose}>
              Seguir reventando burbujas
            </button>
          </div>
        )}

        <button type="button" className="aero-card-close" onClick={onClose} aria-label="Cerrar pregunta">
          <CrossIcon />
        </button>
      </section>
    </div>
  );
}

/* ---------- resultado ---------- */
function ResultCard({ score, onRetry, onNext }) {
  const result = QUIZ_RESULTS.find((r) => score >= r.min) || QUIZ_RESULTS[QUIZ_RESULTS.length - 1];
  const nextRef = useRef(null);

  useEffect(() => {
    nextRef.current?.focus({ preventScroll: true });
  }, []);

  return (
    <div className="aero-modal aero-modal--result">
      <section className="aero-card aero-result" role="dialog" aria-modal="true" aria-labelledby="aeroResult">
        <span className="aero-card-shine" aria-hidden="true" />
        <p className="aero-card-step">tu resultado</p>
        <div className="aero-score-orb" aria-hidden="true">
          <span className="aero-score-num">{score}</span>
          <span className="aero-score-of">de {QUIZ.length}</span>
        </div>
        <h2 id="aeroResult" className="aero-result-title">
          {result.title}
        </h2>
        <p className="aero-result-text">{result.text}</p>
        <p className="sr-only">
          Acertaste {score} de {QUIZ.length}.
        </p>
        <div className="aero-result-actions">
          <button ref={nextRef} type="button" className="aero-btn aero-btn--green aero-btn--big" onClick={onNext}>
            Ahora sí, entra a tu lugar
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </button>
          <button type="button" className="aero-btn aero-btn--glass" onClick={onRetry}>
            Volver a jugar
          </button>
        </div>
      </section>
    </div>
  );
}

export default function Quiz() {
  const navigate = useNavigate();
  const { isPlaying: mainIsPlaying, togglePlay: toggleMainPlay } = usePlayer();
  const [answers, setAnswers] = useState({});
  const [openIndex, setOpenIndex] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [popping, setPopping] = useState(null);
  const [muted, setMuted] = useState(false);
  const bgAudioRef = useRef(null);
  const [bursts, setBursts] = useState([]);

  /* tocar el agua o el cielo suelta un puñito de burbujas */
  const onSceneTap = (e) => {
    if (e.target.closest('button, a, .aero-header-glass, .aero-modal')) return;
    const id = ++burstId;
    setBursts((b) => [...b.slice(-6), { id, x: e.clientX, y: e.clientY }]);
    setTimeout(() => setBursts((b) => b.filter((x) => x.id !== id)), 1800);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  /* si venías con una canción sonando en el reproductor principal, se
     pausa al entrar (la barra está oculta aquí, así que no se puede
     controlar) para que no suenen las dos a la vez */
  useEffect(() => {
    if (mainIsPlaying) toggleMainPlay();
    // solo al entrar al quiz, no cada vez que cambie isPlaying
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* la música de ambiente suena sola al entrar, en volumen bajo, y se
     detiene al salir del quiz */
  useEffect(() => {
    const audio = bgAudioRef.current;
    if (!audio) return undefined;
    audio.volume = 0.35;
    audio.play().catch(() => {
      /* el navegador bloqueó el autoplay; seguirá silenciosa hasta un gesto */
    });
    return () => audio.pause();
  }, []);

  const answeredCount = Object.keys(answers).length;
  const score = useMemo(
    () => QUIZ.reduce((n, q, i) => n + (answers[i] === q.answer ? 1 : 0), 0),
    [answers]
  );

  const pick = useCallback((qi, oi) => {
    setAnswers((a) => ({ ...a, [qi]: oi }));
  }, []);

  /* al cerrar una pregunta contestada, la burbuja "revienta" y, si ya
     estaban todas, aparece el resultado */
  const close = useCallback(() => {
    const i = openIndex;
    setOpenIndex(null);
    if (i === null || answers[i] === undefined) return;
    setPopping(i);
    setTimeout(() => setPopping(null), 700);
    if (Object.keys(answers).length === QUIZ.length) {
      setTimeout(() => setShowResult(true), 650);
    }
  }, [openIndex, answers]);

  const retry = () => {
    setAnswers({});
    setShowResult(false);
  };

  return (
    <div className="aero-page" onPointerDown={onSceneTap}>
      <AeroLife />
      <audio ref={bgAudioRef} src={BG_SONG} loop muted={muted} />
      <MusicToggle muted={muted} onToggle={() => setMuted((m) => !m)} />

      <div className="aero-bursts" aria-hidden="true">
        {bursts.map((b) => (
          <span key={b.id} className="aero-burst" style={{ left: b.x, top: b.y }}>
            {[0, 1, 2, 3, 4, 5, 6].map((k) => (
              <i key={k} style={{ '--k': k }} />
            ))}
          </span>
        ))}
      </div>

      <header className="aero-header">
        <div className="aero-header-glass">
          <p className="aero-kicker">un pequeño quiz sobre nosotros</p>
          <h1 className="aero-title">¿Cuánto te acuerdas de nosotros?</h1>
          <p className="aero-sub">Toca las burbujas en el orden que quieras. Son seis.</p>
          <div className="aero-progress" role="img" aria-label={`${answeredCount} de ${QUIZ.length} contestadas`}>
            {QUIZ.map((_, i) => (
              <span
                key={i}
                className={`aero-progress-dot${
                  answers[i] === undefined ? '' : answers[i] === QUIZ[i].answer ? ' is-ok' : ' is-no'
                }`}
              />
            ))}
          </div>
        </div>
      </header>

      <main className="aero-stage">
        {QUIZ.map((q, i) => {
          const L = BUBBLE_LAYOUT[i];
          const done = answers[i] !== undefined;
          const ok = done && answers[i] === q.answer;
          return (
            <button
              key={q.topic}
              type="button"
              className={`aero-bubble${done ? (ok ? ' is-ok' : ' is-no') : ''}${popping === i ? ' is-popping' : ''}`}
              style={{
                '--x': `${L.x}%`,
                '--y': `${L.y}%`,
                '--size': `${L.size}px`,
                '--float': `${L.float}s`,
                '--delay': `${L.delay}s`,
                '--n': i,
              }}
              onClick={() => setOpenIndex(i)}
              aria-label={`Pregunta ${i + 1}: ${q.topic}${done ? (ok ? ', acertada' : ', fallada') : ''}`}
            >
              <span className="aero-bubble-inner">
                <span className="aero-bubble-num">{i + 1}</span>
                <span className="aero-bubble-topic">{q.topic}</span>
                {done && <span className="aero-bubble-mark">{ok ? <CheckIcon /> : <CrossIcon />}</span>}
              </span>
            </button>
          );
        })}
      </main>

      {answeredCount === QUIZ.length && !showResult && openIndex === null && (
        <div className="aero-see-result">
          <button type="button" className="aero-btn aero-btn--green aero-btn--big" onClick={() => setShowResult(true)}>
            Ver mi resultado
          </button>
        </div>
      )}

      {openIndex !== null && (
        <QuestionCard index={openIndex} picked={answers[openIndex]} onPick={pick} onClose={close} />
      )}

      {showResult && <ResultCard score={score} onRetry={retry} onNext={() => navigate('/')} />}
    </div>
  );
}
