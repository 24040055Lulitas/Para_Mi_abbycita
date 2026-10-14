import { useEffect, useRef, useState } from 'react';
import NowPlayingIcon from '../icons/NowPlayingIcon';
import { usePlayer } from '../../context/PlayerContext';
import { searchTracks } from '../../data/catalog';
import './SearchOverlay.css';

export default function SearchOverlay() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);
  const { current, playTrackRef, toggleLike, isLiked } = usePlayer();

  const results = searchTracks(query);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    } else {
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === 'Escape') setIsOpen(false);
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <>
      <button className="search-btn" onClick={() => setIsOpen(true)} title="Buscar canción" aria-label="Buscar canción">
        <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>
      </button>

      <div className={`search-overlay${isOpen ? ' is-open' : ''}`} onClick={() => setIsOpen(false)}>
        <div className="search-box" onClick={(e) => e.stopPropagation()}>
          <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>
          <input
            ref={inputRef}
            type="text"
            placeholder="Busca una canción de Billie…"
            autoComplete="off"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button onClick={() => setIsOpen(false)} aria-label="Cerrar búsqueda">
            <svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        </div>

        {query.trim() && (
          results.length === 0 ? (
            <p className="search-empty">No encontré nada con &ldquo;{query}&rdquo;.</p>
          ) : (
            <ol className="search-results" onClick={(e) => e.stopPropagation()}>
              {results.map((track) => {
                const playing = current?.key === track.key;
                return (
                  <li
                    key={track.key}
                    className={`track-item${playing ? ' playing' : ''}`}
                    onClick={() => {
                      playTrackRef(track, results);
                      setIsOpen(false);
                    }}
                  >
                    <span className="track-index">{playing ? <NowPlayingIcon /> : ''}</span>
                    <span className="track-name">{track.title}</span>
                    <span className="track-dur">{track.subtitle}</span>
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
          )
        )}
      </div>
    </>
  );
}
