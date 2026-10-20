import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Reveal from '../../components/Reveal';
import SaveButton from '../../components/SaveButton/SaveButton';
import { restartFromGate } from '../../components/Gate/restart';
import { usePlayer } from '../../context/PlayerContext';
import IntroVideo from '../../components/IntroVideo/IntroVideo';
import {
  TANJIRO_GALLERY,
  TANJIRO_PHOTOS,
  TANJIRO_SONG,
  TANJIRO_TRAITS,
  TANJIRO_VIDEO,
  TANJIRO_VIDEO_POSTER,
} from '../../data/tanjiro';
import SlashGame from './SlashGame';
import { KatanaMeter, SwordTrail } from './TanjiroFx';
import './Tanjiro.css';

const INTRO_SEEN_KEY = 'abby-tanjiro-intro-seen';

/* brasas que suben desde abajo, en rojo, naranja y amarillo */
const EMBERS = Array.from({ length: 26 }, (_, i) => ({
  x: (i * 41 + 7) % 100,
  size: 3 + ((i * 7) % 6),
  dur: 7 + ((i * 5) % 8),
  delay: (i * 0.73) % 9,
  drift: ((i % 5) - 2) * 18,
  hue: ['#ff5468', '#ff8a3d', '#ffc14d'][i % 3],
}));

/* olas tradicionales (seigaiha) dibujadas con círculos concéntricos */
function WavePattern({ id }) {
  return (
    <svg className="tj-waves" aria-hidden="true">
      <defs>
        <pattern id={id} width="80" height="40" patternUnits="userSpaceOnUse">
          {[0, 40, 80].map((cx) =>
            [36, 28, 20, 12].map((r) => (
              <circle key={`${cx}-${r}`} cx={cx} cy="40" r={r} />
            ))
          )}
          {[20, 60].map((cx) =>
            [36, 28, 20, 12].map((r) => (
              <circle key={`b${cx}-${r}`} cx={cx} cy="20" r={r} />
            ))
          )}
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}

/* ---------- tarjeta que se voltea ---------- */
function TraitCard({ trait, index }) {
  /* se cuentan las vueltas para que el tajo se repita en cada una */
  const [flips, setFlips] = useState(0);
  const flipped = flips % 2 === 1;
  return (
    <button
      type="button"
      className={`tj-trait${flipped ? ' is-flipped' : ''}`}
      style={{ '--i': index }}
      onClick={() => setFlips((f) => f + 1)}
      aria-pressed={flipped}
      aria-label={`${trait.title}. ${flipped ? trait.back : trait.front} Toca para voltear.`}
    >
      {flips > 0 && <span key={flips} className={`tj-trait-cut${flipped ? ' is-fire' : ''}`} aria-hidden="true" />}
      <span className="tj-trait-inner">
        <span className="tj-trait-face tj-trait-front" aria-hidden="true">
          <span className="tj-trait-photo">
            <img src={trait.image} alt="" loading="lazy" />
          </span>
          <span className="tj-trait-num">0{index + 1}</span>
          <span className="tj-trait-title">{trait.title}</span>
          <span className="tj-trait-text">{trait.front}</span>
          <span className="tj-trait-hint">
            toca para ver
            <svg viewBox="0 0 24 24"><path d="M4 12a8 8 0 0 1 14-5.3M20 12a8 8 0 0 1-14 5.3M18 3v4h-4M6 21v-4h4" /></svg>
          </span>
        </span>
        <span className="tj-trait-face tj-trait-back" aria-hidden="true">
          <span className="tj-trait-and">y tú…</span>
          <span className="tj-trait-text">{trait.back}</span>
        </span>
      </span>
    </button>
  );
}

/* ---------- visor de una imagen ---------- */
function Viewer({ index, onClose, onStep }) {
  const closeRef = useRef(null);
  const item = index === null ? null : TANJIRO_GALLERY[index];

  useEffect(() => {
    if (index === null) return undefined;
    closeRef.current?.focus({ preventScroll: true });
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    function onKey(e) {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onStep(1);
      if (e.key === 'ArrowLeft') onStep(-1);
    }
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
    };
  }, [index, onClose, onStep]);

  if (!item) return null;
  return (
    <div className="tj-viewer" onClick={onClose} role="dialog" aria-modal="true" aria-label={item.title}>
      <button ref={closeRef} type="button" className="tj-viewer-btn tj-viewer-close" onClick={onClose} aria-label="Cerrar">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
      </button>
      <figure className="tj-viewer-card" key={index} onClick={(e) => e.stopPropagation()}>
        <div className="tj-viewer-frame">
          <img src={item.src} alt={item.title} />
          <span className="tj-viewer-cut" aria-hidden="true" />
        </div>
        <figcaption>
          <p className="tj-viewer-title">{item.title}</p>
          <p className="tj-viewer-words">{item.words}</p>
          <p className="tj-viewer-count">
            {index + 1} de {TANJIRO_GALLERY.length}
          </p>
          <SaveButton src={item.src} label="Descargar imagen" />
        </figcaption>
      </figure>
      <button
        type="button"
        className="tj-viewer-btn tj-viewer-prev"
        onClick={(e) => {
          e.stopPropagation();
          onStep(-1);
        }}
        aria-label="Anterior"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6l-6 6 6 6" /></svg>
      </button>
      <button
        type="button"
        className="tj-viewer-btn tj-viewer-next"
        onClick={(e) => {
          e.stopPropagation();
          onStep(1);
        }}
        aria-label="Siguiente"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg>
      </button>
    </div>
  );
}

export default function Tanjiro() {
  const navigate = useNavigate();
  const [openIndex, setOpenIndex] = useState(null);
  const { playTrackRef, current, isPlaying, togglePlay } = usePlayer();
  const songOn = current?.key === TANJIRO_SONG.key;

  /* el video de entrada sale una vez por visita; mientras suena, la
     música se pausa, y al terminar empieza la canción de Tanjiro */
  const [intro, setIntro] = useState(() => {
    try {
      return sessionStorage.getItem(INTRO_SEEN_KEY) !== '1';
    } catch {
      return true;
    }
  });
  const pausedForIntro = useRef(false);

  useEffect(() => {
    if (intro && isPlaying && !pausedForIntro.current) {
      pausedForIntro.current = true;
      togglePlay();
    }
  }, [intro, isPlaying, togglePlay]);

  const afterIntro = useCallback(() => {
    setIntro(false);
    try {
      sessionStorage.setItem(INTRO_SEEN_KEY, '1');
    } catch {
      /* sin almacenamiento, el video saldrá otra vez la próxima */
    }
    playTrackRef(TANJIRO_SONG);
  }, [playTrackRef]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const close = useCallback(() => setOpenIndex(null), []);
  const step = useCallback(
    (d) => setOpenIndex((i) => (i === null ? i : (i + d + TANJIRO_GALLERY.length) % TANJIRO_GALLERY.length)),
    []
  );

  const onSong = () => {
    if (songOn) togglePlay();
    else playTrackRef(TANJIRO_SONG);
  };

  return (
    <div className="tj-page">
      <SwordTrail />
      <KatanaMeter />
      <div className="tj-embers" aria-hidden="true">
        {EMBERS.map((e, i) => (
          <span
            key={i}
            style={{
              left: `${e.x}%`,
              width: e.size,
              height: e.size,
              background: e.hue,
              boxShadow: `0 0 ${e.size * 3}px ${e.hue}`,
              animationDuration: `${e.dur}s`,
              animationDelay: `${e.delay}s`,
              '--drift': `${e.drift}px`,
            }}
          />
        ))}
      </div>

      {/* ===== portada ===== */}
      <header className="tj-hero">
        <div className="tj-checker tj-checker--band" aria-hidden="true" />
        <WavePattern id="tjWavesHero" />
        <p className="tj-kanji" aria-hidden="true">竈門炭治郎</p>
        <img className="tj-hero-sticker" src={TANJIRO_PHOTOS.face} alt="" aria-hidden="true" />
        <div className="tj-hero-content">
          <div className="tj-hero-portrait">
            <img src={TANJIRO_PHOTOS.hero} alt="Tanjiro sonriendo" />
            <span className="tj-hero-portrait-cut" aria-hidden="true" />
          </div>
          <p className="tj-eyebrow">un rincón solo para ti</p>
          <h1 className="tj-title">
            <span className="tj-title-line">Tanjiro</span>
            <span className="tj-title-slash" aria-hidden="true" />
          </h1>
          <p className="tj-sub">Porque tu personaje favorito también merecía su lugar aquí.</p>
          <button type="button" className={`tj-song${songOn && isPlaying ? ' is-on' : ''}`} onClick={onSong}>
            <span className="tj-song-icon" aria-hidden="true">
              {songOn && isPlaying ? (
                <svg viewBox="0 0 24 24"><path d="M6 5h4v14H6zM14 5h4v14h-4z" /></svg>
              ) : (
                <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
              )}
            </span>
            <span>
              <span className="tj-song-label">{songOn && isPlaying ? 'sonando' : 'escuchar su canción'}</span>
              <span className="tj-song-title">{TANJIRO_SONG.title}</span>
            </span>
          </button>
          <p className="tj-swipe-hint">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20L20 4M14 4h6v6" /></svg>
            desliza el dedo o arrastra el mouse para blandir la espada
          </p>
        </div>
        <div className="tj-scroll-hint" aria-hidden="true">
          <span />
        </div>
      </header>

      {/* ===== el video de la entrada, para volver a verlo ===== */}
      <Reveal as="section" className="tj-video-section">
        <p className="tj-eyebrow">una canción para ti</p>
        <h2 className="tj-h2">Tanjiro también te canta</h2>
        <div className="tj-video">
          <video
            src={TANJIRO_VIDEO}
            poster={TANJIRO_VIDEO_POSTER}
            controls
            playsInline
            preload="none"
            onPlay={() => {
              if (isPlaying) togglePlay();
            }}
          />
        </div>
        <SaveButton src={TANJIRO_VIDEO} label="Descargar video" />
      </Reveal>

      {/* ===== lo que tienen en común ===== */}
      <Reveal as="section" className="tj-traits-section">
        <span className="tj-cut" aria-hidden="true" />
        <p className="tj-eyebrow">lo que tienen en común</p>
        <h2 className="tj-h2">Tanjiro y tú</h2>
        <p className="tj-lead">Toca cada tarjeta. Por un lado está él; por el otro, tú.</p>
        <div className="tj-traits">
          {TANJIRO_TRAITS.map((t, i) => (
            <TraitCard key={t.title} trait={t} index={i} />
          ))}
        </div>
      </Reveal>

      {/* ===== galería ===== */}
      <Reveal as="section" className="tj-gallery-section">
        <WavePattern id="tjWavesGallery" />
        <span className="tj-cut tj-cut--reverse" aria-hidden="true" />
        <p className="tj-eyebrow">tu galería</p>
        <h2 className="tj-h2">Los Tanjiros que guardas</h2>
        <div className="tj-gallery">
          {TANJIRO_GALLERY.map((g, i) => (
            <button
              key={g.src}
              type="button"
              className="tj-tile"
              style={{ '--i': i }}
              onClick={() => setOpenIndex(i)}
              aria-label={`Ver imagen: ${g.title}`}
            >
              <span className="tj-tile-frame">
                <img src={g.src} alt="" loading="lazy" />
              </span>
              <span className="tj-tile-label">{g.title}</span>
            </button>
          ))}
        </div>
      </Reveal>

      {/* ===== minijuego ===== */}
      <SlashGame />

      {/* ===== cierre con fuego ===== */}
      <Reveal as="section" className="tj-fire">
        <div className="tj-fire-glow" aria-hidden="true" />
        <span className="tj-cut tj-cut--fire" aria-hidden="true" />
        <div className="tj-polaroids" aria-hidden="true">
          <figure className="tj-polaroid tj-polaroid--left">
            <img src={TANJIRO_PHOTOS.together} alt="" loading="lazy" />
            <figcaption>entre flores</figcaption>
          </figure>
          <figure className="tj-polaroid tj-polaroid--right">
            <img src={TANJIRO_PHOTOS.couple} alt="" loading="lazy" />
            <figcaption>como ellos dos</figcaption>
          </figure>
        </div>
        <p className="tj-eyebrow tj-eyebrow--warm">como una danza de fuego</p>
        <blockquote className="tj-quote">
          Dicen que su fuego nunca se apaga, aunque el camino se ponga difícil.
          <em> Lo que siento por ti se parece mucho a eso.</em>
        </blockquote>
        <p className="tj-sign">para mi fan favorita de Demon Slayer</p>
      </Reveal>

      <div className="tj-cta">
        <button type="button" className="tj-enter" onClick={() => navigate('/')}>
          Ahora sí, entra a tu lugar
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
        </button>
        <button type="button" className="tj-back" onClick={restartFromGate}>
          vivirlo desde el principio
        </button>
      </div>

      <Viewer index={openIndex} onClose={close} onStep={step} />
      {intro && <IntroVideo src={TANJIRO_VIDEO} label="Video de Tanjiro" onDone={afterIntro} />}
    </div>
  );
}
