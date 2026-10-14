import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import QueuePanel from '../QueuePanel/QueuePanel';
import { usePlayer } from '../../context/PlayerContext';
import './MiniPlayer.css';

const HEART_PATH =
  'M12 21s-6.7-4.35-9.33-8.2C1 10.63 1.4 7.4 4 5.8c2.1-1.3 4.6-.7 6 1.1L12 9l2-2.1c1.4-1.8 3.9-2.4 6-1.1 2.6 1.6 3 4.83 1.33 6.99C18.7 16.65 12 21 12 21z';

/* páginas que traen su propio control de audio y no quieren el
   mini-player global encima (por ahora, la carta) */
const HIDDEN_ON = ['/carta'];

export default function MiniPlayer() {
  const { pathname } = useLocation();
  const [queueOpen, setQueueOpen] = useState(false);
  const {
    current,
    isPlaying,
    currentTime,
    duration,
    volume,
    shuffle,
    repeatMode,
    upcoming,
    togglePlay,
    next,
    prev,
    seek,
    setVolume,
    toggleShuffle,
    cycleRepeat,
    toggleLike,
    isLiked,
    formatTime,
  } = usePlayer();

  const pct = duration ? Math.min(100, (currentTime / duration) * 100) : 0;
  const liked = current ? isLiked(current.file) : false;

  if (HIDDEN_ON.includes(pathname)) return null;

  /* la cola va FUERA del footer: el footer usa transform/backdrop-filter,
     que atraparían a un panel position:fixed dentro de su caja */
  return (
    <>
    <footer className={`mini-player${isPlaying ? ' is-playing' : ''}${current ? '' : ' is-empty'}`}>
      {/* barra de progreso fina en el borde superior (se puede arrastrar) */}
      <input
        type="range"
        className="mini-seek"
        min="0"
        max={duration || 0}
        value={currentTime}
        step="0.1"
        onChange={(e) => seek(Number(e.target.value))}
        aria-label="Progreso de la canción"
        style={{ '--pct': `${pct}%` }}
        disabled={!current}
      />

      <div className="mini-inner">
        <div className="mini-track">
          <div className="mini-cover">{current?.cover && <img src={current.cover} alt="" />}</div>
          <div className="mini-info">
            <p className="mini-title">{current?.title || 'Elige una canción'}</p>
            <p className="mini-subtitle">{current ? `Billie Eilish · ${current.subtitle}` : 'tu lugar está listo'}</p>
          </div>
          {current && (
            <button
              type="button"
              className={`ctrl-btn like-toggle${liked ? ' is-liked' : ''}`}
              onClick={() => toggleLike(current.file)}
              aria-label={liked ? 'Quitar de favoritas' : 'Agregar a favoritas'}
              aria-pressed={liked}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d={HEART_PATH} /></svg>
            </button>
          )}
        </div>

        <div className="mini-center">
          <div className="mini-buttons">
            <button
              type="button"
              className={`ctrl-btn hide-mobile${shuffle ? ' is-active' : ''}`}
              onClick={toggleShuffle}
              title="Aleatorio"
              aria-label="Aleatorio"
              aria-pressed={shuffle}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17 3l4 4-4 4M3 7h6l2 3M3 17h6l8-11M21 17h-6l-2.5-3.5" /></svg>
            </button>
            <button type="button" className="ctrl-btn hide-mobile" onClick={prev} title="Anterior" aria-label="Anterior">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path className="solid" d="M19 20L9 12l10-8v16z" /><path d="M5 19V5" /></svg>
            </button>
            <button
              type="button"
              className="ctrl-btn play-btn"
              onClick={togglePlay}
              title={isPlaying ? 'Pausa' : 'Reproducir'}
              aria-label={isPlaying ? 'Pausa' : 'Reproducir'}
            >
              {isPlaying ? (
                <svg viewBox="0 0 24 24" aria-hidden="true"><path className="solid" d="M6 5h4v14H6zM14 5h4v14h-4z" /></svg>
              ) : (
                <svg viewBox="0 0 24 24" aria-hidden="true"><path className="solid" d="M8 5v14l11-7z" /></svg>
              )}
            </button>
            <button type="button" className="ctrl-btn" onClick={next} title="Siguiente" aria-label="Siguiente">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path className="solid" d="M5 4l10 8-10 8V4z" /><path d="M19 5v14" /></svg>
            </button>
            <button
              type="button"
              className={`ctrl-btn hide-mobile${repeatMode !== 'off' ? ' is-active' : ''}`}
              onClick={cycleRepeat}
              title={repeatMode === 'one' ? 'Repetir una' : repeatMode === 'all' ? 'Repetir todo' : 'Repetir'}
              aria-label="Repetir"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17 1l4 4-4 4M3 11V9a4 4 0 014-4h14M7 23l-4-4 4-4M21 13v2a4 4 0 01-4 4H3" /></svg>
              {repeatMode === 'one' && <span className="repeat-one">1</span>}
            </button>
          </div>
          <p className="mini-time">
            {formatTime(currentTime)} / {formatTime(duration)}
          </p>
        </div>

        <div className="mini-right">
          <button
            type="button"
            className={`ctrl-btn${upcoming.length ? ' is-active' : ''}`}
            onClick={() => setQueueOpen(true)}
            title="Cola de reproducción"
            aria-label="Cola de reproducción"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h11M3 12h11M3 18h6M17 13v7M13.5 16.5h7" /></svg>
          </button>
          <div className="mini-volume">
            <svg className="vol-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M11 5L6 9H2v6h4l5 4V5zM19 9a5 5 0 010 6" /></svg>
            <input
              type="range"
              className="volume-bar"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              aria-label="Volumen"
              style={{ '--pct': `${volume * 100}%` }}
            />
          </div>
        </div>
      </div>
    </footer>
    <QueuePanel isOpen={queueOpen} onClose={() => setQueueOpen(false)} />
    </>
  );
}
