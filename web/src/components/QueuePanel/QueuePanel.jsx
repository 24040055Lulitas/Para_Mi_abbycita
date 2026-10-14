import { usePlayer } from '../../context/PlayerContext';
import '../TrackPanel/TrackPanel.css';

export default function QueuePanel({ isOpen, onClose }) {
  const { upcoming, queueIndex, playTrackRef, queue, clearQueue, removeFromQueue } = usePlayer();

  return (
    <div className={`panel-backdrop${isOpen ? ' is-open' : ''}`} onClick={onClose}>
      <div className="panel" onClick={(e) => e.stopPropagation()}>
        <button className="panel-close" onClick={onClose} aria-label="Cerrar">
          <svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18" /></svg>
        </button>

        <div className="panel-head" style={{ justifyContent: 'space-between' }}>
          <div className="panel-head-info">
            <p className="section-eyebrow">a continuación</p>
            <h3>Cola de reproducción</h3>
          </div>
          {upcoming.length > 0 && (
            <button
              onClick={clearQueue}
              style={{
                background: 'transparent',
                border: '1px solid var(--border)',
                borderRadius: 999,
                color: 'var(--text-dim)',
                fontSize: 12.5,
                padding: '7px 14px',
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              Vaciar
            </button>
          )}
        </div>

        {upcoming.length === 0 ? (
          <p style={{ color: 'var(--text-dim)', fontSize: 14, padding: '12px 8px' }}>
            No hay nada en cola todavía — agrega canciones desde un álbum o los sencillos.
          </p>
        ) : (
          <ol className="tracklist">
            {upcoming.map((track, i) => {
              const realIndex = queueIndex + 1 + i;
              return (
                <li
                  key={`${track.key}-${realIndex}`}
                  className="track-item"
                  onClick={() => playTrackRef(track, queue)}
                >
                  <span className="track-index">{i + 1}</span>
                  <span className="track-name">{track.title}</span>
                  <span className="track-dur">{track.subtitle}</span>
                  <button
                    className="like-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFromQueue(realIndex);
                    }}
                    aria-label="Quitar de la cola"
                  >
                    <svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18" /></svg>
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
