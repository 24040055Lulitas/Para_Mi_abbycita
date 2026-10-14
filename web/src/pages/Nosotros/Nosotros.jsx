import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Reveal from '../../components/Reveal';
import { COLOR_POEM, HEART_PHOTOS, POLAROIDS } from '../../data/nosotros';
import './Nosotros.css';

/* todas las fotos en un solo recorrido, para poder pasar de una a otra
   en el visor sin importar si vienen del corazón o de las polaroids */
const ALL_PHOTOS = [...HEART_PHOTOS, ...POLAROIDS];

/* corazón en coordenadas 0–1: se usa como recorte del collage y como contorno */
const HEART_D =
  'M0.5,0.96 C0.22,0.76 0.01,0.57 0.01,0.31 C0.01,0.13 0.14,0.02 0.29,0.02 C0.39,0.02 0.46,0.08 0.5,0.17 C0.54,0.08 0.61,0.02 0.71,0.02 C0.86,0.02 0.99,0.13 0.99,0.31 C0.99,0.57 0.78,0.76 0.5,0.96 Z';

const FLOATING_HEARTS = [
  { x: 6, d: 0, s: 14, t: 9 },
  { x: 18, d: 3.5, s: 10, t: 11 },
  { x: 82, d: 1.2, s: 16, t: 10 },
  { x: 93, d: 5, s: 11, t: 12 },
  { x: 50, d: 7, s: 9, t: 13 },
  { x: 32, d: 9, s: 12, t: 10 },
  { x: 70, d: 6, s: 10, t: 11 },
];

const SMALL_HEART =
  'M12 20s-6.7-4.2-9-8C1.3 9.1 2.6 5.6 5.7 5c2.1-.4 3.9.6 4.9 2.2L12 9l1.4-1.8c1-1.6 2.8-2.6 4.9-2.2 3.1.6 4.4 4.1 2.7 7-2.3 3.8-9 8-9 8z';

/* ---------- visor: foto completa con sus palabras abajo ---------- */
function PhotoViewer({ index, onClose, onStep }) {
  const closeRef = useRef(null);
  const touchX = useRef(null);
  const photo = index === null ? null : ALL_PHOTOS[index];

  useEffect(() => {
    if (index === null) return undefined;
    closeRef.current?.focus({ preventScroll: true });
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    function onKey(e) {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onStep(1);
      if (e.key === 'ArrowLeft') onStep(-1);
    }
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener('keydown', onKey);
    };
  }, [index, onClose, onStep]);

  return (
    <div
      className={`nos-viewer${photo ? ' is-open' : ''}`}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={photo ? photo.title : 'Visor de fotos'}
      aria-hidden={!photo}
      onTouchStart={(e) => {
        touchX.current = e.touches[0].clientX;
      }}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (Math.abs(dx) > 50) onStep(dx < 0 ? 1 : -1);
        touchX.current = null;
      }}
    >
      <button ref={closeRef} type="button" className="nos-viewer-close" onClick={onClose} aria-label="Cerrar">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
      </button>

      {photo && (
        <figure className="nos-viewer-card" key={index} onClick={(e) => e.stopPropagation()}>
          <div className="nos-viewer-photo">
            <img src={photo.src} alt={photo.title} />
          </div>
          <figcaption>
            <p className="nos-viewer-title">{photo.title}</p>
            <p className="nos-viewer-words">{photo.words}</p>
            <p className="nos-viewer-count">
              {index + 1} de {ALL_PHOTOS.length}
            </p>
          </figcaption>
        </figure>
      )}

      <button
        type="button"
        className="nos-viewer-nav nos-viewer-nav--prev"
        onClick={(e) => {
          e.stopPropagation();
          onStep(-1);
        }}
        aria-label="Foto anterior"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6l-6 6 6 6" /></svg>
      </button>
      <button
        type="button"
        className="nos-viewer-nav nos-viewer-nav--next"
        onClick={(e) => {
          e.stopPropagation();
          onStep(1);
        }}
        aria-label="Foto siguiente"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg>
      </button>
    </div>
  );
}

export default function Nosotros() {
  const navigate = useNavigate();
  const [openIndex, setOpenIndex] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const close = useCallback(() => setOpenIndex(null), []);
  const step = useCallback(
    (dir) => setOpenIndex((i) => (i === null ? i : (i + dir + ALL_PHOTOS.length) % ALL_PHOTOS.length)),
    []
  );

  return (
    <div className="nos-page">
      {/* recorte en forma de corazón para el collage */}
      <svg width="0" height="0" aria-hidden="true" style={{ position: 'absolute' }}>
        <defs>
          <clipPath id="nosHeartClip" clipPathUnits="objectBoundingBox">
            <path d={HEART_D} />
          </clipPath>
        </defs>
      </svg>

      <header className="nos-topbar">
        <p>lo que somos cuando estamos juntos</p>
      </header>

      {/* ===== hero ===== */}
      <section className="nos-hero">
        <p className="nos-eyebrow">dos mitades de la misma canción</p>
        <h1 className="nos-title">Nosotros</h1>
        <p className="nos-subtitle">Toca cada foto para verla de cerca, mi amor</p>
      </section>

      {/* ===== collage en forma de corazón ===== */}
      <Reveal as="section" className="nos-heart-section">
        <div className="nos-floating" aria-hidden="true">
          {FLOATING_HEARTS.map((h, i) => (
            <svg
              key={i}
              viewBox="0 0 24 24"
              style={{
                left: `${h.x}%`,
                width: h.s,
                height: h.s,
                animationDelay: `${h.d}s`,
                animationDuration: `${h.t}s`,
              }}
            >
              <path d={SMALL_HEART} />
            </svg>
          ))}
        </div>

        <div className="nos-heart">
          <div className="nos-heart-grid">
            {HEART_PHOTOS.map((p, i) => (
              <button
                key={p.src}
                type="button"
                className="nos-tile"
                style={{ '--i': i }}
                onClick={() => setOpenIndex(i)}
                aria-label={`Ver foto: ${p.title}`}
              >
                <img src={p.src} alt="" loading="lazy" />
              </button>
            ))}
          </div>
          <svg className="nos-heart-outline" viewBox="0 0 1 1" preserveAspectRatio="none" aria-hidden="true">
            <path d={HEART_D} pathLength={1} />
          </svg>
        </div>
        <p className="nos-heart-hint">nueve momentos, un solo corazón</p>
      </Reveal>

      {/* ===== polaroids ===== */}
      <Reveal as="section" className="nos-polaroids-section">
        <h2 className="nos-section-title">las que guardo en la cabeza</h2>
        <div className="nos-polaroids">
          {POLAROIDS.map((p, i) => (
            <button
              key={p.src}
              type="button"
              className="nos-polaroid"
              style={{ '--i': i, '--r': `${[-5, 3, -2, 4, -3][i % 5]}deg` }}
              onClick={() => setOpenIndex(HEART_PHOTOS.length + i)}
              aria-label={`Ver foto: ${p.title}`}
            >
              <span className="nos-polaroid-pin" aria-hidden="true" />
              <img src={p.src} alt="" loading="lazy" />
              <span className="nos-polaroid-label">{p.title}</span>
            </button>
          ))}
        </div>
      </Reveal>

      {/* ===== carta a los colores ===== */}
      <Reveal as="section" className="nos-poem">
        <p className="nos-eyebrow">para ti y tus colores</p>
        <h2 className="nos-poem-title">
          Carta a <em>tus colores</em>
        </h2>
        <ul className="nos-poem-verses">
          {COLOR_POEM.map((v, i) => (
            <li
              key={i}
              className={`nos-verse${v === '' ? ' is-blank' : ''}`}
              style={{ '--i': i }}
            >
              {typeof v === 'object' ? <em className={v.c ? `c-${v.c}` : undefined}>{v.em}</em> : v}
            </li>
          ))}
        </ul>
        <div className="nos-poem-divider" aria-hidden="true">
          <svg viewBox="0 0 24 24"><path d={SMALL_HEART} /></svg>
        </div>
        <p className="nos-poem-sign">para ti, en todos tus colores</p>
      </Reveal>

      {/* ===== salida ===== */}
      <div className="nos-cta">
        <p className="nos-cta-whisper">Y esto apenas es el principio de todo lo que quiero guardar contigo.</p>
        <button type="button" className="nos-enter" onClick={() => navigate('/')}>
          Ahora sí, entra a tu lugar
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </button>
        <button type="button" className="nos-back" onClick={() => navigate('/carta')}>
          volver a la carta
        </button>
      </div>

      <PhotoViewer index={openIndex} onClose={close} onStep={step} />
    </div>
  );
}
