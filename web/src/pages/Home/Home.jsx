import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AuraParticles from '../../components/AuraParticles';
import ScrollMeter from '../../components/ScrollMeter';
import Reveal from '../../components/Reveal';
import TrackPanel from '../../components/TrackPanel/TrackPanel';
import { usePlayer } from '../../context/PlayerContext';
import {
  ALBUM_KEYS,
  ALBUMS,
  albumTrackRefs,
  singlesTrackRefs,
} from '../../data/catalog';
import {
  CHAT_STICKER,
  DEDICATION_PHOTO,
  ICONS,
  MEANING_BACKGROUNDS,
  SINGLES_ORB_PHOTO,
} from '../../data/assets';
import './Home.css';

export default function Home() {
  const [openAlbumIndex, setOpenAlbumIndex] = useState(null);
  const [singlesOpen, setSinglesOpen] = useState(false);
  const { likedTrackRefs, toggleLike, playTrackRef, current, isPlaying } = usePlayer();

  const openAlbum = useCallback((key) => {
    setOpenAlbumIndex(ALBUM_KEYS.indexOf(key));
  }, []);

  const goAdjacentAlbum = useCallback((step) => {
    setOpenAlbumIndex((i) => {
      if (i === null) return i;
      return (i + step + ALBUM_KEYS.length) % ALBUM_KEYS.length;
    });
  }, []);

  const openAlbumKey = openAlbumIndex === null ? null : ALBUM_KEYS[openAlbumIndex];
  const openAlbumData = openAlbumKey ? ALBUMS[openAlbumKey] : null;

  return (
    <div className="home-page">
      <AuraParticles />
      <ScrollMeter />

      {/* ===== hero ===== */}
      <section className="hero">
        <div className="hero-overlay" />
        <div className="hero-content">
          <p className="section-eyebrow">una playlist especial para</p>
          <h1 className="hero-name">ABBY</h1>
          <p className="hero-of">de la música de</p>
          <p className="hero-artist">Billie Eilish</p>
          <p className="hero-quote">&ldquo;Suave como sus canciones.&rdquo;</p>
          <a href="#albums" className="hero-cta">
            Explorar álbumes
            <svg viewBox="0 0 24 24"><path d="M12 5v14M5 12l7 7 7-7" /></svg>
          </a>
        </div>
      </section>

      {/* ===== dedicatoria ===== */}
      <Reveal as="section" className="dedication">
        <figure className="dedication-photo">
          <img src={DEDICATION_PHOTO} alt="Foto para Abby" loading="lazy" />
          <figcaption>Me cagué de risa cuando vi esta foto JAJAJA nunca la había visto.</figcaption>
        </figure>
        <div className="dedication-text">
          <p className="section-eyebrow">para ti, abby</p>
          <h2 className="section-title">
            Esto es para ti
            <img className="deco-icon" src={ICONS.flowerPink} alt="" />
          </h2>
          <p>
            Hice esto pensando en ti. Sé que la música de Billie te acompaña en muchos
            momentos, así que quise juntar sus álbumes en un solo lugar, hecho a mano,
            para que los tengas siempre cerca.
          </p>
          <p>
            No es gran cosa, pero está hecho con cariño — cada color, cada botón, cada
            canción elegida pensando en ti. Espero que cada vez que aprietes play te
            acuerdes de que hay alguien que te quiere y te desea siempre lo mejor.
          </p>
          <Link to="/linea-de-tiempo" className="timeline-link">
            Ver nuestra línea del tiempo
            <svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </Link>
        </div>
      </Reveal>

      {/* ===== discografía ===== */}
      <Reveal as="section" className="albums" id="albums">
        <p className="section-eyebrow">discografía</p>
        <h2 className="section-title">
          Los álbumes
          <img className="deco-icon" src={ICONS.sun} alt="" />
        </h2>
        <div className="album-gallery">
          {ALBUM_KEYS.map((key, i) => (
            <button
              key={key}
              className="album-card"
              style={{ '--accent-i': i % 4 }}
              onClick={() => openAlbum(key)}
            >
              <span className="album-card-cover">
                <img src={ALBUMS[key].cover} alt="" loading="lazy" />
              </span>
              <span className="album-card-name">{ALBUMS[key].name}</span>
              <span className="album-card-year">{ALBUMS[key].year}</span>
            </button>
          ))}
        </div>
      </Reveal>

      {/* ===== sencillos ===== */}
      <Reveal as="section" className="singles">
        <p className="section-eyebrow">fuera del álbum</p>
        <h2 className="section-title">
          Sencillos
          <img className="deco-icon" src={ICONS.flowerRed} alt="" />
        </h2>
        <button className="singles-orb" onClick={() => setSinglesOpen(true)} aria-label="Ver sencillos">
          <span className="singles-orb-ring" />
          <span className="singles-orb-photo">
            <img src={SINGLES_ORB_PHOTO} alt="" loading="lazy" />
          </span>
        </button>
        <p className="singles-orb-label">Sencillos</p>
      </Reveal>

      {/* ===== lo que significa para ti ===== */}
      <MeaningSection />

      {/* ===== secreto ===== */}
      <Reveal as="section" className="secret">
        <Link className="secret-btn" to="/secreto" aria-label="Abrir secreto">
          <span className="secret-btn-text">secreT</span>
        </Link>
      </Reveal>

      {/* ===== favoritas ===== */}
      <Reveal as="section" className="favorites">
        <p className="section-eyebrow">Tus favoritas</p>
        <h2 className="section-title">
          Para Abby
          <img className="deco-icon" src={ICONS.tileWave} alt="" />
        </h2>
        {likedTrackRefs.length === 0 ? (
          <p className="favorites-empty">Dale al corazón en cualquier canción para que aparezca aquí.</p>
        ) : (
          <ol className="favorites-list">
            {likedTrackRefs.map((track) => {
              const playing = current?.key === track.key;
              return (
                <li
                  key={track.key}
                  className={`favorite-item${playing ? ' playing' : ''}`}
                  onClick={() => playTrackRef(track, likedTrackRefs)}
                >
                  <span className="favorite-cover">
                    <img src={track.cover} alt="" loading="lazy" />
                  </span>
                  <span className="favorite-info">
                    <span className="favorite-title">{track.title}</span>
                    <span className="favorite-subtitle">{track.subtitle}</span>
                  </span>
                  <span className="favorite-index">{playing && isPlaying ? '♪' : ''}</span>
                  <button
                    className="like-btn liked"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleLike(track.file);
                    }}
                    aria-label="Quitar de favoritas"
                  >
                    <svg viewBox="0 0 24 24"><path d="M12 21s-6.7-4.35-9.33-8.2C1 10.63 1.4 7.4 4 5.8c2.1-1.3 4.6-.7 6 1.1L12 9l2-2.1c1.4-1.8 3.9-2.4 6-1.1 2.6 1.6 3 4.83 1.33 6.99C18.7 16.65 12 21 12 21z" /></svg>
                  </button>
                </li>
              );
            })}
          </ol>
        )}
      </Reveal>

      {/* ===== cita de cierre ===== */}
      <Reveal as="section" className="closing">
        <img className="deco-icon deco-icon--closing" src={ICONS.tileHaori} alt="" />
        <blockquote className="closing-quote">
          &ldquo;Ojalá cada canción te recuerde que mereces ternura, incluso en los días difíciles.&rdquo;
        </blockquote>
        <p className="closing-credit">hecho para <strong>Abby</strong></p>
        <p className="closing-note">
          Toda la música pertenece a Billie Eilish y sus respectivos sellos — este
          sitio es un regalo personal, sin fines de lucro.
        </p>
      </Reveal>

      <TrackPanel
        isOpen={openAlbumIndex !== null}
        onClose={() => setOpenAlbumIndex(null)}
        eyebrow="Álbum"
        title={openAlbumData?.name || ''}
        cover={openAlbumData?.cover}
        tracks={openAlbumKey ? albumTrackRefs(openAlbumKey) : []}
        showNav
        onPrev={() => goAdjacentAlbum(-1)}
        onNext={() => goAdjacentAlbum(1)}
      />

      <TrackPanel
        isOpen={singlesOpen}
        onClose={() => setSinglesOpen(false)}
        eyebrow="fuera del álbum"
        title="Sencillos"
        tracks={singlesTrackRefs()}
      />
    </div>
  );
}

function MeaningSection() {
  const [bgIndex, setBgIndex] = useState(0);
  useEffect(() => {
    const id = setInterval(() => {
      setBgIndex((i) => (i + 1) % MEANING_BACKGROUNDS.length);
    }, 25000);
    return () => clearInterval(id);
  }, []);

  return (
    <Reveal as="section" className="meaning">
      {MEANING_BACKGROUNDS.map((src, i) => (
        <div
          key={src}
          className={`meaning-bg${i === bgIndex ? ' is-visible' : ''}`}
          style={{ backgroundImage: `url(${src})` }}
        />
      ))}
      <div className="meaning-overlay" />
      <div className="meaning-content">
        <p className="section-eyebrow">lo que significa para ti</p>
        <h2 className="section-title">
          Tu lugar
          <img className="deco-icon" src={ICONS.tileSakura} alt="" />
        </h2>

        <div className="chat-mock">
          <div className="chat-group chat-group--her">
            <img className="chat-sticker" src={CHAT_STICKER} alt="" loading="lazy" />
            <div className="chat-group-bubbles">
              <div className="chat-bubble chat-bubble--her">
                <p>
                  Ella es como un pilar para mí, la quiero mucho. En un momento muy
                  difícil no sabía cómo expresar lo que sentía, ni siquiera sabía lo
                  que realmente sentía — encontré en su música canciones que
                  expresaban exactamente eso. Fue muy lindo, porque su canto, en
                  lugar de ser puro desmadre, fue como un abracito. Su tono
                  tranquilo, tantas veces en las noches, me ayudó a dormir.
                </p>
                <svg className="chat-heart" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 21s-6.7-4.35-9.33-8.2C1 10.63 1.4 7.4 4 5.8c2.1-1.3 4.6-.7 6 1.1L12 9l2-2.1c1.4-1.8 3.9-2.4 6-1.1 2.6 1.6 3 4.83 1.33 6.99C18.7 16.65 12 21 12 21z" /></svg>
              </div>
              <div className="chat-bubble chat-bubble--her chat-bubble--small">
                <p>Es simplemente</p>
              </div>
              <div className="chat-bubble chat-bubble--her chat-bubble--small">
                <p>Mi lugar</p>
              </div>
            </div>
          </div>

          <div className="chat-bubble chat-bubble--reply">
            <p>
              Leer esto me llegó profundo. Que su música haya sido ese
              abracito en las noches difíciles dice mucho de lo fuerte que
              eres — y de lo bonito que es encontrar algo que te entienda así.
              Por eso hice esto: para que tu lugar siempre esté aquí, a un
              clic, cuando lo necesites.
            </p>
          </div>
        </div>
      </div>
    </Reveal>
  );
}
