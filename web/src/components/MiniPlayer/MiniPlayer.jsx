import { usePlayer } from '../../context/PlayerContext';
import './MiniPlayer.css';

export default function MiniPlayer() {
  const {
    current,
    isPlaying,
    currentTime,
    duration,
    volume,
    shuffle,
    repeatMode,
    togglePlay,
    next,
    prev,
    seek,
    setVolume,
    toggleShuffle,
    cycleRepeat,
    formatTime,
  } = usePlayer();

  return (
    <footer className={`mini-player${isPlaying ? ' is-playing' : ''}`}>
      <div className="mini-track">
        <div className="mini-cover">
          {current?.cover && <img src={current.cover} alt="" />}
        </div>
        <div className="mini-info">
          <p className="mini-title">{current?.title || 'Elige una canción'}</p>
          <p className="mini-subtitle">{current?.subtitle || 'para Abby'}</p>
        </div>
      </div>

      <div className="mini-center">
        <div className="mini-buttons">
          <button
            className={`ctrl-btn${shuffle ? ' is-active' : ''}`}
            onClick={toggleShuffle}
            title="Aleatorio"
            aria-label="Aleatorio"
          >
            <svg viewBox="0 0 24 24"><path d="M17 3l4 4-4 4M3 7h6l2 3M3 17h6l8-11M21 17h-6l-2.5-3.5" /></svg>
          </button>
          <button className="ctrl-btn" onClick={prev} title="Anterior" aria-label="Anterior">
            <svg viewBox="0 0 24 24"><path d="M19 20L9 12l10-8v16zM5 19V5" /></svg>
          </button>
          <button className="ctrl-btn play-btn" onClick={togglePlay} title="Reproducir" aria-label="Reproducir">
            {isPlaying ? (
              <svg viewBox="0 0 24 24"><path d="M6 5h4v14H6zM14 5h4v14h-4z" /></svg>
            ) : (
              <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
            )}
          </button>
          <button className="ctrl-btn" onClick={next} title="Siguiente" aria-label="Siguiente">
            <svg viewBox="0 0 24 24"><path d="M5 4l10 8-10 8V4zM19 5v14" /></svg>
          </button>
          <button
            className={`ctrl-btn${repeatMode !== 'off' ? ' is-active' : ''}`}
            onClick={cycleRepeat}
            title={repeatMode === 'one' ? 'Repetir una' : repeatMode === 'all' ? 'Repetir todo' : 'Repetir'}
            aria-label="Repetir"
          >
            <svg viewBox="0 0 24 24"><path d="M17 1l4 4-4 4M3 11V9a4 4 0 014-4h14M7 23l-4-4 4-4M21 13v2a4 4 0 01-4 4H3" /></svg>
          </button>
        </div>
        <div className="mini-progress">
          <span className="time">{formatTime(currentTime)}</span>
          <input
            type="range"
            className="seek-bar"
            min="0"
            max={duration || 0}
            value={currentTime}
            step="0.1"
            onChange={(e) => seek(Number(e.target.value))}
            aria-label="Progreso"
          />
          <span className="time">{formatTime(duration)}</span>
        </div>
      </div>

      <div className="mini-volume">
        <svg className="vol-icon" viewBox="0 0 24 24"><path d="M11 5L6 9H2v6h4l5 4V5zM19 9a5 5 0 010 6M22 6a9 9 0 010 12" /></svg>
        <input
          type="range"
          className="volume-bar"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={(e) => setVolume(Number(e.target.value))}
          aria-label="Volumen"
        />
      </div>
    </footer>
  );
}
