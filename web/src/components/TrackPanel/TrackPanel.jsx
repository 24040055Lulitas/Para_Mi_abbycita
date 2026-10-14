import { usePlayer } from '../../context/PlayerContext';
import './TrackPanel.css';

/* panel deslizable con una lista de canciones — se usa tanto para un
   álbum (con flechas prev/next y portada grande) como para sencillos
   o favoritas (sin flechas, pasando showNav={false}) */
export default function TrackPanel({
  isOpen,
  onClose,
  eyebrow,
  title,
  cover,
  tracks,
  onPrev,
  onNext,
  showNav = false,
  emptyMessage,
}) {
  const { current, isPlaying, playTrackRef, toggleLike, isLiked, addToQueue } = usePlayer();

  return (
    <div className={`panel-backdrop${isOpen ? ' is-open' : ''}`} onClick={onClose}>
      <div className="panel" onClick={(e) => e.stopPropagation()}>
        <button className="panel-close" onClick={onClose} aria-label="Cerrar">
          <svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18" /></svg>
        </button>

        <div className="panel-head">
          {showNav && (
            <button className="album-nav-btn" onClick={onPrev} title="Anterior" aria-label="Álbum anterior">
              <svg viewBox="0 0 24 24"><path d="M15 6l-6 6 6 6" /></svg>
            </button>
          )}
          {cover && (
            <div className="panel-cover">
              <img src={cover} alt="" />
            </div>
          )}
          <div className="panel-head-info">
            <p className="section-eyebrow">{eyebrow}</p>
            <h3>{title}</h3>
          </div>
          {showNav && (
            <button className="album-nav-btn" onClick={onNext} title="Siguiente" aria-label="Álbum siguiente">
              <svg viewBox="0 0 24 24"><path d="M9 6l6 6-6 6" /></svg>
            </button>
          )}
        </div>

        {tracks.length === 0 && emptyMessage ? (
          <p style={{ color: 'var(--text-dim)', fontSize: 14, padding: '12px 8px' }}>{emptyMessage}</p>
        ) : (
          <ol className="tracklist">
            {tracks.map((track, i) => {
              const playing = current?.key === track.key;
              return (
                <li
                  key={track.key}
                  className={`track-item${playing ? ' playing' : ''}`}
                  onClick={() => playTrackRef(track, tracks)}
                >
                  <span className="track-index">{playing && isPlaying ? '♪' : i + 1}</span>
                  <span className="track-name">{track.title}</span>
                  <span className="track-dur">
                    {Math.floor(track.dur / 60)}:{String(track.dur % 60).padStart(2, '0')}
                  </span>
                  <button
                    className="like-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      addToQueue(track);
                    }}
                    title="Agregar a la cola"
                    aria-label="Agregar a la cola"
                  >
                    <svg viewBox="0 0 24 24"><path d="M3 6h11M3 12h11M3 18h6M17 13v7M13.5 16.5h7" /></svg>
                  </button>
                  <button
                    className={`like-btn${isLiked(track.file) ? ' liked' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleLike(track.file);
                    }}
                    aria-label="Me gusta"
                  >
                    <svg viewBox="0 0 24 24"><path d="M12 21s-6.7-4.35-9.33-8.2C1 10.63 1.4 7.4 4 5.8c2.1-1.3 4.6-.7 6 1.1L12 9l2-2.1c1.4-1.8 3.9-2.4 6-1.1 2.6 1.6 3 4.83 1.33 6.99C18.7 16.65 12 21 12 21z" /></svg>
                  </button>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </div>
  );
}
