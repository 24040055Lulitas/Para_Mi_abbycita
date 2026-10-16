import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const [answers, setAnswers] = useState({});
  const [openIndex, setOpenIndex] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [popping, setPopping] = useState(null);
  const [muted, setMuted] = useState(false);
  const bgAudioRef = useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0);
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
    <div className="aero-page">
      {/* ruta relativa al documento: funciona igual en GitHub Pages */}
      <div
        className="aero-sky"
        aria-hidden="true"
        style={{
          backgroundImage:
            'linear-gradient(180deg, rgba(255,255,255,0.18) 0%, rgba(0,110,220,0.08) 45%, rgba(0,45,110,0.5) 100%), url(./quiz/aero.jpg)',
        }}
      />
      <div className="aero-glare" aria-hidden="true" />
      <audio ref={bgAudioRef} src={BG_SONG} loop muted={muted} />
      <button
        type="button"
        className={`aero-bg-mute${muted ? ' is-muted' : ''}`}
        onClick={() => setMuted((m) => !m)}
        aria-label={muted ? 'Activar música de ambiente' : 'Silenciar música de ambiente'}
      >
        {muted ? (
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M11 5L6 9H3v6h3l5 4V5z" />
            <path d="M16 9l5 6M21 9l-5 6" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M11 5L6 9H3v6h3l5 4V5z" />
            <path d="M15.5 9a4 4 0 010 6M18 7a7.5 7.5 0 010 10" />
          </svg>
        )}
      </button>
      <div className="aero-ambient" aria-hidden="true">
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
