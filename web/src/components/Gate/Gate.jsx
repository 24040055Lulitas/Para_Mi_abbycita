import { useState } from 'react';
import AuraParticles from '../AuraParticles';
import { usePlayer } from '../../context/PlayerContext';
import { resolveTrackRef } from '../../data/catalog';
import './Gate.css';

const SESSION_KEY = 'abby-gate-entered';

/* canción de entrada — "i love you" por ahora, como placeholder: dime
   cuál quieres de verdad y la cambio en un segundo (data/catalog.js
   tiene el catálogo completo, o puede ser una nueva si me la pasas) */
const ENTRANCE_TRACK = resolveTrackRef({ album: 'wwafawdwg', track: 12 });

/* Primera de 8 secciones: un gate de bienvenida sin contraseña real —
   solo un lindo ritual de entrada que, al abrir, pone a sonar la
   canción de entrada (y de paso resuelve el autoplay: los navegadores
   necesitan un gesto del usuario para dejar sonar audio). */
export default function Gate({ children }) {
  const [entered, setEntered] = useState(() => {
    try {
      return sessionStorage.getItem(SESSION_KEY) === '1';
    } catch {
      return false;
    }
  });
  const { playTrackRef } = usePlayer();

  const handleEnter = () => {
    if (ENTRANCE_TRACK) playTrackRef(ENTRANCE_TRACK);
    setEntered(true);
    try {
      sessionStorage.setItem(SESSION_KEY, '1');
    } catch {
      /* almacenamiento no disponible, no pasa nada */
    }
  };

  return (
    <>
      {children}
      <div className={`gate${entered ? ' is-leaving' : ''}`} aria-hidden={entered}>
        <AuraParticles />
        <div className="gate-content">
          <div className="gate-icon">
            <span className="gate-icon-ring" />
            <span className="gate-icon-core">
              <svg viewBox="0 0 24 24"><path d="M12 21s-6.7-4.35-9.33-8.2C1 10.63 1.4 7.4 4 5.8c2.1-1.3 4.6-.7 6 1.1L12 9l2-2.1c1.4-1.8 3.9-2.4 6-1.1 2.6 1.6 3 4.83 1.33 6.99C18.7 16.65 12 21 12 21z" /></svg>
            </span>
          </div>
          <p className="gate-eyebrow">para ti</p>
          <h1 className="gate-title">Para mi amor</h1>
          <p className="gate-text">
            Esto es un espacio hecho para ti. No necesitas ninguna
            contraseña — solo entra cuando quieras, con música de fondo
            incluida.
          </p>
          <button className="gate-enter" onClick={handleEnter}>
            Entrar
            <svg className="gate-enter-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z" />
              <path d="M19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15z" />
            </svg>
          </button>
          <p className="gate-hint">hecho con cariño, para Abby</p>
        </div>
      </div>
    </>
  );
}
