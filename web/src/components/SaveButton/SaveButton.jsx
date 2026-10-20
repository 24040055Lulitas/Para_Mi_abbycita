import { useState } from 'react';
import './SaveButton.css';

/* descarga un archivo (foto o video) con su nombre; si el navegador no
   deja descargarlo, lo abre en otra pestaña para guardarlo desde ahí */
async function downloadFile(url, name) {
  const fileName = name || `abby-${decodeURIComponent(url.split('/').pop().split('?')[0])}`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(String(res.status));
    const href = URL.createObjectURL(await res.blob());
    const a = document.createElement('a');
    a.href = href;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(href), 15000);
  } catch {
    window.open(url, '_blank', 'noopener');
  }
}

/* variant="pill": botón con texto (en los visores)
   variant="corner": botoncito redondo en la esquina de una foto */
export default function SaveButton({ src, name, label = 'Descargar', variant = 'pill', className = '' }) {
  const [busy, setBusy] = useState(false);

  const onClick = async (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    await downloadFile(src, name);
    setBusy(false);
  };

  return (
    <button
      type="button"
      className={`save-btn save-btn--${variant}${busy ? ' is-busy' : ''}${className ? ` ${className}` : ''}`}
      onClick={onClick}
      aria-label={label}
      title={label}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 4v11M7 10l5 5 5-5M5 20h14" />
      </svg>
      {variant === 'pill' && <span>{busy ? 'Descargando…' : label}</span>}
    </button>
  );
}
