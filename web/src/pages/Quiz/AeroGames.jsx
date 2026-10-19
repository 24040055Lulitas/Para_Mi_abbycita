import { useCallback, useEffect, useRef, useState } from 'react';
import './AeroGames.css';

/* ---------- utilidades ---------- */

function loadBest(key) {
  try {
    const v = Number(localStorage.getItem(key));
    return Number.isFinite(v) && v > 0 ? v : null;
  } catch {
    return null;
  }
}

function saveBest(key, value) {
  try {
    localStorage.setItem(key, String(value));
  } catch {
    /* almacenamiento no disponible, no pasa nada */
  }
}

function shuffle(list) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 7l10 10M17 7L7 17" />
    </svg>
  );
}

const HEART = 'M12 21s-6.7-4.35-9.33-8.2C1 10.63 1.4 7.4 4 5.8c2.1-1.3 4.6-.7 6 1.1L12 9l2-2.1c1.4-1.8 3.9-2.4 6-1.1 2.6 1.6 3 4.83 1.33 6.99C18.7 16.65 12 21 12 21z';

/* =========================================================
   Juego 1: revienta burbujas
   ========================================================= */

const RUSH_SECONDS = 30;
const RUSH_BEST_KEY = 'abby-aero-rush-best';

function rushMessage(score) {
  if (score >= 45) return 'Reina absoluta de las burbujas. No quedó ni una.';
  if (score >= 30) return 'Qué rapidez. Así de rápido me ganaste a mí.';
  if (score >= 15) return 'Nada mal. Otra ronda y rompes tu récord.';
  return 'Las burbujas también se merecen un descanso. ¿Otra?';
}

function BubbleRush() {
  const [phase, setPhase] = useState('ready');
  const [bubbles, setBubbles] = useState([]);
  const [pops, setPops] = useState([]);
  const [score, setScore] = useState(0);
  const [left, setLeft] = useState(RUSH_SECONDS);
  const [best, setBest] = useState(() => loadBest(RUSH_BEST_KEY));
  const [isRecord, setIsRecord] = useState(false);
  const arenaRef = useRef(null);
  const idRef = useRef(0);
  const scoreRef = useRef(0);
  const bestRef = useRef(best);

  const start = () => {
    scoreRef.current = 0;
    setScore(0);
    setBubbles([]);
    setPops([]);
    setLeft(RUSH_SECONDS);
    setIsRecord(false);
    setPhase('playing');
  };

  useEffect(() => {
    if (phase !== 'playing') return undefined;
    const endsAt = Date.now() + RUSH_SECONDS * 1000;

    const spawn = () => {
      const id = ++idRef.current;
      const r = Math.random();
      const kind = r < 0.12 ? 'heart' : r < 0.2 ? 'tiny' : 'normal';
      setBubbles((list) => [
        ...list,
        {
          id,
          kind,
          x: 6 + Math.random() * 82,
          size: kind === 'tiny' ? 38 : kind === 'heart' ? 66 : 52 + Math.random() * 30,
          dur: kind === 'tiny' ? 3.2 : 4.2 + Math.random() * 2.6,
          sway: (Math.random() - 0.5) * 60,
        },
      ]);
    };

    spawn();
    const spawner = setInterval(spawn, 480);
    const ticker = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((endsAt - Date.now()) / 1000));
      setLeft(remaining);
      if (remaining === 0) {
        clearInterval(spawner);
        clearInterval(ticker);
        setBubbles([]);
        setPhase('done');
        const final = scoreRef.current;
        if (final > 0 && (!bestRef.current || final > bestRef.current)) {
          bestRef.current = final;
          saveBest(RUSH_BEST_KEY, final);
          setBest(final);
          setIsRecord(true);
        }
      }
    }, 200);

    return () => {
      clearInterval(spawner);
      clearInterval(ticker);
    };
  }, [phase]);

  const pop = (e, b) => {
    e.preventDefault();
    const arena = arenaRef.current?.getBoundingClientRect();
    const rect = e.currentTarget.getBoundingClientRect();
    const points = b.kind === 'heart' ? 3 : b.kind === 'tiny' ? 2 : 1;
    scoreRef.current += points;
    setScore(scoreRef.current);
    setBubbles((list) => list.filter((x) => x.id !== b.id));
    if (arena) {
      const pid = b.id;
      setPops((list) => [
        ...list,
        {
          id: pid,
          x: rect.left - arena.left + rect.width / 2,
          y: rect.top - arena.top + rect.height / 2,
          size: rect.width,
          points,
          kind: b.kind,
        },
      ]);
      setTimeout(() => setPops((list) => list.filter((p) => p.id !== pid)), 650);
    }
  };

  const escaped = (id) => setBubbles((list) => list.filter((x) => x.id !== id));

  return (
    <div className="ag-rush">
      <div className="ag-hud">
        <span className="ag-chip">
          <b>{score}</b> puntos
        </span>
        <span className={`ag-chip${phase === 'playing' && left <= 5 ? ' is-hurry' : ''}`}>
          <b>{left}</b> s
        </span>
        <span className="ag-chip ag-chip--soft">récord {best ?? '—'}</span>
      </div>

      <div className="ag-arena" ref={arenaRef}>
        <div className="ag-arena-water" aria-hidden="true" />
        {bubbles.map((b) => (
          <button
            key={b.id}
            type="button"
            className={`ag-bubble ag-bubble--${b.kind}`}
            style={{
              left: `${b.x}%`,
              width: b.size,
              height: b.size,
              '--dur': `${b.dur}s`,
              '--sway': `${b.sway}px`,
            }}
            onPointerDown={(e) => pop(e, b)}
            onAnimationEnd={(e) => e.animationName === 'agRise' && escaped(b.id)}
            aria-label={b.kind === 'heart' ? 'Burbuja de corazón, tres puntos' : 'Burbuja'}
          >
            {b.kind === 'heart' && (
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d={HEART} />
              </svg>
            )}
          </button>
        ))}
        {pops.map((p) => (
          <span key={p.id} className={`ag-pop ag-pop--${p.kind}`} style={{ left: p.x, top: p.y, '--s': `${p.size}px` }}>
            <i />
            <em>+{p.points}</em>
          </span>
        ))}

        {phase === 'ready' && (
          <div className="ag-overlay">
            <p className="ag-overlay-title">Revienta todas las que puedas</p>
            <p className="ag-overlay-text">
              Tienes {RUSH_SECONDS} segundos. Las normales valen 1, las chiquitas 2 y las de corazón 3.
            </p>
            <button type="button" className="aero-btn aero-btn--green aero-btn--big" onClick={start}>
              Empezar
            </button>
          </div>
        )}

        {phase === 'done' && (
          <div className="ag-overlay">
            <p className="ag-overlay-kicker">{isRecord ? '¡nuevo récord!' : 'se acabó el tiempo'}</p>
            <p className="ag-overlay-score">{score}</p>
            <p className="ag-overlay-text">{rushMessage(score)}</p>
            <button type="button" className="aero-btn aero-btn--green aero-btn--big" onClick={start}>
              Otra vez
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   Juego 2: memoria con fotos de nosotros
   ========================================================= */

const MEMORY_PHOTOS = [
  './timeline/005.jpeg',
  './timeline/012.jpeg',
  './timeline/022.jpeg',
  './timeline/033.jpeg',
  './timeline/048.jpeg',
  './timeline/062.jpeg',
];
const MEMORY_BEST_KEY = 'abby-aero-memory-best';

function Memory() {
  const [cards, setCards] = useState([]);
  const [open, setOpen] = useState([]);
  const [matched, setMatched] = useState(() => new Set());
  const [moves, setMoves] = useState(0);
  const [phase, setPhase] = useState('ready');
  const [best, setBest] = useState(() => loadBest(MEMORY_BEST_KEY));
  const [isRecord, setIsRecord] = useState(false);
  const lockRef = useRef(false);

  const start = () => {
    setCards(shuffle(MEMORY_PHOTOS.flatMap((src, pair) => [
      { key: `${pair}a`, pair, src },
      { key: `${pair}b`, pair, src },
    ])));
    setOpen([]);
    setMatched(new Set());
    setMoves(0);
    setIsRecord(false);
    lockRef.current = false;
    setPhase('playing');
  };

  const flip = (i) => {
    if (lockRef.current || open.includes(i) || matched.has(cards[i].pair)) return;
    const next = [...open, i];
    setOpen(next);
    if (next.length < 2) return;

    const total = moves + 1;
    setMoves(total);
    const [a, b] = next;
    if (cards[a].pair === cards[b].pair) {
      const done = new Set(matched).add(cards[a].pair);
      setMatched(done);
      setOpen([]);
      if (done.size === MEMORY_PHOTOS.length) {
        setTimeout(() => {
          setPhase('done');
          if (!best || total < best) {
            saveBest(MEMORY_BEST_KEY, total);
            setBest(total);
            setIsRecord(true);
          }
        }, 700);
      }
    } else {
      lockRef.current = true;
      setTimeout(() => {
        setOpen([]);
        lockRef.current = false;
      }, 850);
    }
  };

  return (
    <div className="ag-memory">
      <div className="ag-hud">
        <span className="ag-chip">
          <b>{matched.size}</b> de {MEMORY_PHOTOS.length} parejas
        </span>
        <span className="ag-chip">
          <b>{moves}</b> intentos
        </span>
        <span className="ag-chip ag-chip--soft">récord {best ?? '—'}</span>
      </div>

      <div className="ag-board-wrap">
        <div className="ag-board">
          {cards.map((c, i) => {
            const shown = open.includes(i) || matched.has(c.pair);
            return (
              <button
                key={c.key}
                type="button"
                className={`ag-card${shown ? ' is-shown' : ''}${matched.has(c.pair) ? ' is-matched' : ''}`}
                style={{ '--i': i }}
                onClick={() => flip(i)}
                aria-label={shown ? 'Foto descubierta' : `Carta ${i + 1}, toca para voltear`}
                aria-pressed={shown}
              >
                <span className="ag-card-inner">
                  <span className="ag-card-face ag-card-back" aria-hidden="true">
                    <svg viewBox="0 0 24 24">
                      <path d={HEART} />
                    </svg>
                  </span>
                  <span className="ag-card-face ag-card-front" aria-hidden="true">
                    <img src={c.src} alt="" loading="lazy" />
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        {phase === 'ready' && (
          <div className="ag-overlay">
            <p className="ag-overlay-title">Encuentra nuestras parejas</p>
            <p className="ag-overlay-text">
              Doce cartas, seis fotos nuestras. Voltea dos a la vez y encuentra las que van juntas, como nosotros.
            </p>
            <button type="button" className="aero-btn aero-btn--green aero-btn--big" onClick={start}>
              Empezar
            </button>
          </div>
        )}

        {phase === 'done' && (
          <div className="ag-overlay">
            <p className="ag-overlay-kicker">{isRecord ? '¡nuevo récord!' : '¡las encontraste todas!'}</p>
            <p className="ag-overlay-score">{moves}</p>
            <p className="ag-overlay-text">
              intentos. Así como encontraste cada pareja, yo siempre te voy a encontrar a ti.
            </p>
            <button type="button" className="aero-btn aero-btn--green aero-btn--big" onClick={start}>
              Jugar otra vez
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   Sección con los dos juegos
   ========================================================= */

const GAMES = [
  {
    id: 'rush',
    title: 'Revienta burbujas',
    text: '30 segundos, todas las burbujas que puedas.',
    Component: BubbleRush,
  },
  {
    id: 'memory',
    title: 'Memoria',
    text: 'Encuentra las parejas de nuestras fotos.',
    Component: Memory,
  },
];

function GameModal({ game, onClose }) {
  const closeRef = useRef(null);

  useEffect(() => {
    closeRef.current?.focus({ preventScroll: true });
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    function onKey(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  const { Component } = game;
  return (
    <div className="aero-modal ag-modal" onClick={onClose}>
      <section
        className="aero-card ag-card-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="agTitle"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="aero-card-shine" aria-hidden="true" />
        <p className="aero-card-step">minijuego</p>
        <h2 id="agTitle" className="ag-modal-title">
          {game.title}
        </h2>
        <Component />
        <button ref={closeRef} type="button" className="aero-card-close" onClick={onClose} aria-label="Cerrar minijuego">
          <CloseIcon />
        </button>
      </section>
    </div>
  );
}

export default function AeroGames() {
  const [openId, setOpenId] = useState(null);
  const close = useCallback(() => setOpenId(null), []);
  const game = GAMES.find((g) => g.id === openId);

  return (
    <section className="ag-section" aria-labelledby="agSectionTitle">
      <div className="ag-section-glass">
        <span className="aero-card-shine" aria-hidden="true" />
        <p className="aero-kicker">para jugar un ratito</p>
        <h2 id="agSectionTitle" className="ag-section-title">
          Minijuegos
        </h2>
        <div className="ag-picks">
          {GAMES.map((g) => (
            <button key={g.id} type="button" className={`ag-pick ag-pick--${g.id}`} onClick={() => setOpenId(g.id)}>
              <span className="ag-pick-orb" aria-hidden="true">
                {g.id === 'rush' ? (
                  <svg viewBox="0 0 24 24">
                    <circle cx="9" cy="14" r="5" />
                    <circle cx="16.5" cy="7.5" r="3.5" />
                    <circle cx="18" cy="16" r="2" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24">
                    <rect x="3" y="4" width="8" height="10" rx="2" />
                    <rect x="13" y="10" width="8" height="10" rx="2" />
                  </svg>
                )}
              </span>
              <span className="ag-pick-text">
                <b>{g.title}</b>
                <span>{g.text}</span>
              </span>
            </button>
          ))}
        </div>
      </div>

      {game && <GameModal game={game} onClose={close} />}
    </section>
  );
}
