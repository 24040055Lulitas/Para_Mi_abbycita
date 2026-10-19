import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Reveal from '../../components/Reveal';
import {
  BIRTHDAY_BILLIE,
  BIRTHDAY_STICKERS,
  BIRTHDAY_TANJIRO,
  BIRTHDAY_WISHES,
} from '../../data/birthday';
import './Birthday.css';

const PARTY = ['#ff7eb6', '#ffd166', '#7cc6ff', '#3ddc84', '#c49bff', '#ff8a5c'];

/* confeti que cae todo el tiempo detrás de la página */
const CONFETTI = Array.from({ length: 28 }, (_, i) => ({
  x: (i * 37 + 11) % 100,
  w: 6 + (i % 4) * 2,
  h: i % 3 === 0 ? 6 + (i % 4) * 2 : 12 + (i % 3) * 3,
  dur: 7 + ((i * 7) % 7),
  delay: -((i * 1.37) % 12),
  spin: (i % 2 ? 1 : -1) * (300 + (i % 5) * 90),
  sway: ((i % 5) - 2) * 22,
  color: PARTY[i % PARTY.length],
}));

/* sus años: salen en la portada, en las velas y en el reto de los globos */
const AGE = 19;

/* globos de la portada: se revientan al tocarlos y vuelven a salir */
const BALLOONS = [
  [4, 10, 1],
  [86, 7, 1.1],
  [48, 4, 0.8],
  [27, 22, 0.9],
  [66, 20, 0.85],
  [12, 40, 0.95],
  [90, 33, 0.9],
  [40, 52, 0.75],
  [78, 50, 1],
  [5, 68, 0.85],
  [60, 66, 0.8],
  [92, 74, 0.75],
  [22, 84, 0.8],
  [72, 88, 0.9],
  [44, 92, 0.7],
].map(([x, y, s], i) => ({ x, y, s, color: PARTY[i % PARTY.length], d: (i * 0.53) % 2.4 }));
const BALLOON_BACK_MS = 3500;

/* velas con forma de número */
const CANDLES = String(AGE).split('');
const CANDLE_COLORS = ['#ff7eb6', '#7cc6ff'];

/* soplido: volumen (rms 0–1) que cuenta como soplar y cuánto tiempo
   seguido hay que soplar para apagar cada velita */
const BLOW_RMS = 0.2;
const BLOW_MS = 160;

/* explosión de confeti al apagar todas las velas */
const BURST = Array.from({ length: 64 }, (_, i) => {
  const angle = (i / 64) * Math.PI * 2 + (i % 3) * 0.3;
  const dist = 34 + ((i * 17) % 40);
  return {
    x: Math.cos(angle) * dist,
    y: Math.sin(angle) * dist * 0.8 - 18,
    r: (i % 2 ? 1 : -1) * (180 + (i % 7) * 60),
    w: 7 + (i % 3) * 3,
    h: i % 4 === 0 ? 7 : 14,
    delay: (i % 8) * 0.025,
    color: PARTY[i % PARTY.length],
  };
});

function Title() {
  const words = ['¡Feliz', 'cumpleaños,', 'Abby!'];
  let n = 0;
  return (
    <h1 className="bd-title" aria-label="¡Feliz cumpleaños, Abby!">
      {words.map((word, w) => (
        <span key={word} className={`bd-title-word${w === 2 ? ' bd-title-word--name' : ''}`} aria-hidden="true">
          {[...word].map((ch, i) => {
            n += 1;
            return (
              <span key={i} className="bd-letter" style={{ '--d': `${0.5 + n * 0.055}s`, '--w': n }}>
                {ch}
              </span>
            );
          })}
        </span>
      ))}
    </h1>
  );
}

function Balloons({ count, onPop }) {
  const [popped, setPopped] = useState({});
  const timers = useRef([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const pop = (i) => {
    if (popped[i]) return;
    setPopped((p) => ({ ...p, [i]: true }));
    onPop();
    timers.current.push(
      setTimeout(() => setPopped((p) => ({ ...p, [i]: false })), BALLOON_BACK_MS)
    );
  };

  return (
    <div className="bd-balloons">
      {count >= AGE && <Burst />}
      {BALLOONS.map((b, i) => (
        <button
          key={i}
          type="button"
          className={`bd-balloon${popped[i] ? ' is-popped' : ''}`}
          style={{ left: `${b.x}%`, top: `${b.y}%`, '--s': b.s, '--c': b.color, animationDelay: `${b.d}s` }}
          onClick={() => pop(i)}
          tabIndex={-1}
          aria-hidden="true"
        >
          <svg viewBox="0 0 60 100">
            <path className="bd-balloon-body" d="M30 4C14 4 4 17 4 32c0 18 14 32 26 36 12-4 26-18 26-36C56 17 46 4 30 4z" />
            <path className="bd-balloon-shine" d="M17 18c3-5 8-7 12-7" />
            <path className="bd-balloon-knot" d="M26 68h8l-4 6z" />
            <path className="bd-balloon-string" d="M30 74c-5 6 5 10 0 16s4 8 0 10" />
          </svg>
          <span className="bd-pop" aria-hidden="true">
            {[0, 1, 2, 3, 4, 5, 6, 7].map((k) => (
              <i key={k} style={{ '--a': `${k * 45}deg` }} />
            ))}
          </span>
        </button>
      ))}
    </div>
  );
}

function Burst() {
  return (
    <div className="bd-burst" aria-hidden="true">
      {BURST.map((p, i) => (
        <i
          key={i}
          style={{
            '--x': `${p.x}vmin`,
            '--y': `${p.y}vmin`,
            '--r': `${p.r}deg`,
            width: p.w,
            height: p.h,
            background: p.color,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

/* el micrófono solo funciona en https (o localhost) */
const CAN_LISTEN =
  typeof window !== 'undefined' &&
  window.isSecureContext &&
  !!navigator.mediaDevices?.getUserMedia &&
  !!(window.AudioContext || window.webkitAudioContext);

function Cake() {
  const [lit, setLit] = useState(() => CANDLES.map(() => true));
  const [wished, setWished] = useState(false);
  const [burst, setBurst] = useState(0);
  const [mic, setMic] = useState('off'); // off | asking | on | denied
  const micRef = useRef(null);
  const blowRef = useRef(null);
  const out = lit.filter((l) => !l).length;

  const stopMic = useCallback(() => {
    const m = micRef.current;
    if (!m) return;
    cancelAnimationFrame(m.raf);
    m.stream.getTracks().forEach((t) => t.stop());
    m.ctx.close().catch(() => {});
    micRef.current = null;
  }, []);

  useEffect(() => stopMic, [stopMic]);

  const blowOut = (i) => {
    if (!lit[i]) return;
    const next = lit.map((l, j) => (j === i ? false : l));
    setLit(next);
    if (next.every((l) => !l)) {
      setWished(true);
      setBurst((b) => b + 1);
      stopMic();
      setMic('off');
      navigator.vibrate?.(60);
    }
  };

  /* el bucle del micrófono apaga una velita encendida al azar */
  const blowRandom = () => {
    const on = lit.flatMap((l, i) => (l ? [i] : []));
    if (on.length) blowOut(on[Math.floor(Math.random() * on.length)]);
  };

  useEffect(() => {
    blowRef.current = blowRandom;
  });

  const relight = () => {
    setLit(CANDLES.map(() => true));
    setWished(false);
  };

  const listen = async () => {
    if (mic === 'on') {
      stopMic();
      setMic('off');
      return;
    }
    setMic('asking');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
      });
      const Ctx = window.AudioContext || window.webkitAudioContext;
      const ctx = new Ctx();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 1024;
      ctx.createMediaStreamSource(stream).connect(analyser);
      const buf = new Uint8Array(analyser.fftSize);
      const m = { stream, ctx, raf: 0, blow: 0, last: performance.now() };
      micRef.current = m;
      setMic('on');
      const tick = (now) => {
        const dt = Math.min(100, now - m.last);
        m.last = now;
        analyser.getByteTimeDomainData(buf);
        let sum = 0;
        for (let k = 0; k < buf.length; k += 1) {
          const v = (buf[k] - 128) / 128;
          sum += v * v;
        }
        if (Math.sqrt(sum / buf.length) > BLOW_RMS) {
          m.blow += dt;
          if (m.blow >= BLOW_MS) {
            m.blow = 0;
            blowRef.current?.();
          }
        } else {
          m.blow = Math.max(0, m.blow - dt * 0.5);
        }
        m.raf = requestAnimationFrame(tick);
      };
      m.raf = requestAnimationFrame(tick);
    } catch {
      setMic('denied');
    }
  };

  let hint = `Pide un deseo y toca el ${CANDLES.join(' y el ')} para apagarlos.`;
  if (mic === 'on') hint = 'Te escucho: sopla fuerte cerca del micrófono.';
  else if (mic === 'asking') hint = 'Dale permiso al micrófono para soplar de verdad.';
  else if (mic === 'denied') hint = 'Sin micrófono no pasa nada: toca cada vela.';
  if (out > 0 && !wished) hint = '¡Ya casi! Falta una.';

  return (
    <div className={`bd-cake-wrap${wished ? ' is-wished' : ''}`}>
      <div className="bd-cake">
        <div className="bd-candles">
          {lit.map((on, i) => (
            <button
              key={i}
              type="button"
              className={`bd-candle${on ? ' is-lit' : ' is-out'}`}
              style={{ '--c': CANDLE_COLORS[i % CANDLE_COLORS.length], '--i': i }}
              onClick={() => blowOut(i)}
              disabled={!on}
              aria-label={on ? `Apagar la vela del ${CANDLES[i]}` : `Vela del ${CANDLES[i]} apagada`}
            >
              <span className="bd-flame" aria-hidden="true" />
              <span className="bd-smoke" aria-hidden="true" />
              <span className="bd-num" aria-hidden="true">
                {CANDLES[i]}
              </span>
            </button>
          ))}
        </div>
        <div className="bd-tier bd-tier--top" aria-hidden="true" />
        <div className="bd-tier bd-tier--bottom" aria-hidden="true">
          <span className="bd-cake-name">Abby</span>
        </div>
        <div className="bd-plate" aria-hidden="true" />
      </div>

      <p className="bd-cake-hint" aria-live="polite">
        {wished ? 'Deseo pedido. No me lo cuentes, que si no, no se cumple.' : hint}
      </p>

      <div className="bd-cake-actions">
        {wished ? (
          <button type="button" className="bd-chip" onClick={relight}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 12a9 9 0 1 0 2.6-6.4M3 4v5h5" /></svg>
            Volver a encenderlas
          </button>
        ) : (
          CAN_LISTEN &&
          mic !== 'denied' && (
            <button
              type="button"
              className={`bd-chip${mic === 'on' ? ' is-on' : ''}`}
              onClick={listen}
              disabled={mic === 'asking'}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <rect x="9" y="3" width="6" height="11" rx="3" />
                <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
              </svg>
              {mic === 'on' ? 'Dejar de escuchar' : 'Soplar de verdad (micrófono)'}
            </button>
          )
        )}
      </div>

      {burst > 0 && <Burst key={burst} />}
    </div>
  );
}

export default function Birthday() {
  const navigate = useNavigate();
  const [pops, setPops] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const onPop = () => {
    setPops((n) => n + 1);
    if (pops + 1 === AGE) navigator.vibrate?.(80);
  };

  let balloonHint = 'toca los globos';
  if (pops > 0 && pops < AGE) balloonHint = `${pops} de ${AGE} globos`;
  else if (pops >= AGE) balloonHint = `¡${AGE} globos para tus ${AGE} años!`;

  return (
    <div className="bd-page">
      <div className="bd-confetti" aria-hidden="true">
        {CONFETTI.map((c, i) => (
          <i
            key={i}
            style={{
              left: `${c.x}%`,
              width: c.w,
              height: c.h,
              background: c.color,
              animationDuration: `${c.dur}s`,
              animationDelay: `${c.delay}s`,
              '--spin': `${c.spin}deg`,
              '--sway': `${c.sway}px`,
            }}
          />
        ))}
      </div>

      {/* ===== portada ===== */}
      <header className="bd-hero">
        <Balloons count={pops} onPop={onPop} />
        <div className="bd-hero-content">
          <p className="bd-eyebrow">hoy cumples {AGE}</p>
          <Title />
          <p className="bd-sub">
            Antes de la carta y de todo lo demás, hoy se celebra lo más importante:{' '}
            <em>que existes.</em>
          </p>
          <div className="bd-hero-stickers" aria-hidden="true">
            <img className="bd-hero-sticker bd-hero-sticker--billie" src={BIRTHDAY_STICKERS.billie} alt="" />
            <img className="bd-hero-sticker bd-hero-sticker--tanjiro" src={BIRTHDAY_STICKERS.tanjiro} alt="" />
          </div>
          <p className={`bd-hero-hint${pops >= AGE ? ' is-done' : ''}`} aria-live="polite">
            {balloonHint}
          </p>
        </div>
        <div className="bd-scroll-hint" aria-hidden="true">
          <span />
        </div>
      </header>

      {/* ===== el pastel ===== */}
      <Reveal as="section" className="bd-section bd-cake-section">
        <p className="bd-eyebrow">pide un deseo</p>
        <h2 className="bd-h2">Sopla las velitas</h2>
        <Cake />
      </Reveal>

      {/* ===== Billie ===== */}
      <section className="bd-section bd-billie">
        <Reveal className="bd-section-head">
          <p className="bd-eyebrow">invitada especial</p>
          <h2 className="bd-h2">Billie vino a felicitarte</h2>
          <img className="bd-billie-sticker" src={BIRTHDAY_STICKERS.billieTongue} alt="" aria-hidden="true" loading="lazy" />
        </Reveal>
        <Reveal className="bd-billie-grid">
          {BIRTHDAY_BILLIE.map((p, i) => (
            <figure key={p.src} className={`bd-photo${p.tall ? ' bd-photo--tall' : ''}`} style={{ '--i': i }}>
              <span className="bd-tape" aria-hidden="true" />
              <img src={p.src} alt={p.caption} loading="lazy" />
              <figcaption>{p.caption}</figcaption>
            </figure>
          ))}
        </Reveal>
      </section>

      {/* ===== Tanjiro ===== */}
      <section className="bd-section bd-tanjiro">
        <Reveal className="bd-section-head">
          <p className="bd-eyebrow bd-eyebrow--green">tampoco se lo quiso perder</p>
          <h2 className="bd-h2">Y Tanjiro también</h2>
        </Reveal>
        <Reveal className="bd-tanjiro-grid">
          {BIRTHDAY_TANJIRO.map((p, i) => (
            <figure key={p.src} className="bd-photo bd-photo--tj" style={{ '--i': i }}>
              <img src={p.src} alt={p.caption} loading="lazy" />
              <figcaption>{p.caption}</figcaption>
            </figure>
          ))}
          <figure className="bd-photo bd-photo--sticker" style={{ '--i': BIRTHDAY_TANJIRO.length }}>
            <img src={BIRTHDAY_STICKERS.tanjiro} alt="Tanjiro con gorrito de fiesta" loading="lazy" />
            <figcaption>con gorrito y todo</figcaption>
          </figure>
        </Reveal>
      </section>

      {/* ===== deseos ===== */}
      <Reveal as="section" className="bd-section bd-wishes">
        <p className="bd-eyebrow">lo que te deseo</p>
        <h2 className="bd-h2">Para tus {AGE}</h2>
        <ol className="bd-wish-list">
          {BIRTHDAY_WISHES.map((w, i) => (
            <li key={w} style={{ '--i': i, '--c': PARTY[i % PARTY.length] }}>
              {w}
            </li>
          ))}
        </ol>
      </Reveal>

      <div className="bd-cta">
        <p>Y ahora sí…</p>
        <button type="button" className="bd-next" onClick={() => navigate('/carta')}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <path d="M4 7l8 6 8-6" />
          </svg>
          Tengo una carta para ti
        </button>
        <button type="button" className="bd-skip" onClick={() => navigate('/')}>
          ir directo a tu lugar
        </button>
      </div>
    </div>
  );
}
