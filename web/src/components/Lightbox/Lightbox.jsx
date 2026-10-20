import { useEffect } from 'react';
import SaveButton from '../SaveButton/SaveButton';
import './Lightbox.css';

/* visor de imagen reutilizable: pásale { src, alt } o null para cerrarlo */
export default function Lightbox({ image, onClose }) {
  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <div className={`lightbox-backdrop${image ? ' is-open' : ''}`} onClick={onClose}>
      <button className="lightbox-close" onClick={onClose} aria-label="Cerrar">
        <svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18" /></svg>
      </button>
      {image && <img className="lightbox-img" src={image.src} alt={image.alt || ''} onClick={(e) => e.stopPropagation()} />}
      {image && <SaveButton src={image.src} label="Descargar imagen" className="lightbox-save" />}
    </div>
  );
}
