import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import AuraParticles from '../../components/AuraParticles';
import Lightbox from '../../components/Lightbox/Lightbox';
import { AMBIENT_TRACK, ICONS, TANJIRO_IMAGES } from '../../data/assets';
import './Secret.css';

const FLOAT_ICONS = [
  { src: ICONS.flowerPink, x: '8%', y: '16%', dur: '16s', delay: '0s' },
  { src: ICONS.sun, x: '88%', y: '12%', dur: '19s', delay: '1.5s' },
  { src: ICONS.flowerRed, x: '92%', y: '62%', dur: '15s', delay: '0.6s' },
  { src: ICONS.tileSunrise, x: '4%', y: '70%', dur: '20s', delay: '2.2s' },
  { src: ICONS.tileWave, x: '50%', y: '88%', dur: '17s', delay: '1s' },
];

const FALLBACK_ACCENTS = [
  [63, 169, 255],
  [255, 94, 168],
  [61, 220, 132],
  [255, 59, 59],
];

function probeImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

/* color promedio de la imagen, para teñir la "cinta" de la polaroid;
   si el navegador bloquea la lectura del canvas (CORS u otra razón),
   se usa un color de la paleta como respaldo */
function averageColor(img) {
  try {
    const size = 16;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, size, size);
    const data = ctx.getImageData(0, 0, size, size).data;
    let r = 0, g = 0, b = 0, count = 0;
    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] < 180) continue;
      r += data[i];
      g += data[i + 1];
      b += data[i + 2];
      count++;
    }
    if (count === 0) return null;
    return [Math.round(r / count), Math.round(g / count), Math.round(b / count)];
  } catch {
    return null;
  }
}

export default function Secret() {
  const [photos, setPhotos] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [lightboxImage, setLightboxImage] = useState(null);

  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.4);

  useEffect(() => {
    let cancelled = false;

    Promise.all(TANJIRO_IMAGES.map((src) => probeImage(src).then((img) => ({ src, img })))).then(
      (entries) => {
        if (cancelled) return;
        const available = entries
          .filter((e) => e.img)
          .map((entry, i) => {
            const tilt = (i % 2 === 0 ? -1 : 1) * (3 + (i % 3) * 2);
            const [fr, fg, fb] = FALLBACK_ACCENTS[i % FALLBACK_ACCENTS.length];
            const rgb = averageColor(entry.img) || [fr, fg, fb];
            return { src: entry.src, tilt, rgb, delay: i * 90 };
          });
        setPhotos(available);
        setLoaded(true);
      }
    );

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.loop = true;
    audio.volume = volume;
    audio.play().then(() => setIsPlaying(true)).catch(() => {
      /* el navegador bloqueó el autoplay sin interacción previa;
         el botón flotante sigue disponible para iniciarla a mano */
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleAmbient = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      audio.play().catch(() => {});
      setIsPlaying(true);
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  };

  const onVolumeChange = (v) => {
    setVolume(v);
    if (audioRef.current) audioRef.current.volume = v;
  };

  return (
    <div className="secreto-page">
      <AuraParticles />

      <div className="secreto-float" aria-hidden="true">
        {FLOAT_ICONS.map((icon, i) => (
          <img
            key={i}
            className="secreto-float-icon"
            src={icon.src}
            alt=""
            style={{ '--x': icon.x, '--y': icon.y, '--dur': icon.dur, '--delay': icon.delay }}
          />
        ))}
      </div>

      <Link className="secreto-back" to="/" aria-label="Volver a la playlist">
        <svg viewBox="0 0 24 24"><path d="M15 6l-6 6 6 6" /></svg>
        <span>volver</span>
      </Link>

      <main className="secreto-main">
        <header className="secreto-hero">
          <p className="section-eyebrow">un secreto para ti</p>
          <h1 className="secreto-title">Tanjiro Kamado</h1>
          <p className="secreto-subtitle">un rincón aparte, solo porque tú también amas Demon Slayer.</p>
        </header>

        <section className="secreto-note">
          <p>
            Sé que Tanjiro es de tus personajes favoritos — esa manera suya de
            seguir siendo amable incluso cuando todo se pone difícil, de
            proteger a los que quiere sin perder la ternura en el intento. Me
            recordó un poco a ti, así que le hice un rincón propio aquí, aparte
            de los álbumes, solo para nosotros.
          </p>
          <p className="secreto-note-quote">Levantarse una vez más, por los que quieres — así es él.</p>
        </section>

        <div className="secreto-gallery">
          {loaded && photos.length === 0 && (
            <p className="secreto-empty">Todavía no hay imágenes aquí — pronto habrá más.</p>
          )}
          {photos.map((photo, i) => (
            <div
              key={photo.src}
              className="polaroid"
              style={{
                '--tilt': `${photo.tilt}deg`,
                '--accent-r': photo.rgb[0],
                '--accent-g': photo.rgb[1],
                '--accent-b': photo.rgb[2],
                animationDelay: `${photo.delay}ms`,
              }}
              onClick={() => setLightboxImage({ src: photo.src, alt: `Tanjiro ${i + 1}` })}
            >
              <div className="polaroid-photo">
                <img src={photo.src} alt={`Tanjiro ${i + 1}`} loading="lazy" />
              </div>
              <p className="polaroid-caption">Tanjiro</p>
            </div>
          ))}
        </div>
      </main>

      <div className="ambient-widget">
        <button className={`ambient-btn${isPlaying ? ' is-playing' : ''}`} onClick={toggleAmbient} aria-label="Música de fondo">
          {isPlaying ? (
            <svg viewBox="0 0 24 24"><path d="M6 5h4v14H6zM14 5h4v14h-4z" /></svg>
          ) : (
            <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
          )}
        </button>
        <input
          type="range"
          className="ambient-volume"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={(e) => onVolumeChange(Number(e.target.value))}
          aria-label="Volumen de la música de fondo"
        />
      </div>

      <Lightbox image={lightboxImage} onClose={() => setLightboxImage(null)} />
      <audio ref={audioRef} src={AMBIENT_TRACK} preload="none" />
    </div>
  );
}
