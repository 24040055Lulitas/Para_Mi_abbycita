import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { restartFromGate } from '../Gate/restart';
import './SectionNav.css';

/* todas las secciones del sitio, en el orden en que se recorren */
const SECTIONS = [
  {
    to: '/',
    label: 'Tu lugar',
    hint: 'el inicio, con toda la música',
    color: 'var(--color-green)',
    icon: <path d="M4 11l8-7 8 7v9a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1z" />,
  },
  {
    to: '/cumpleanos',
    label: 'Feliz cumpleaños',
    hint: 'el pastel y tus velitas',
    color: '#c49bff',
    icon: (
      <>
        <path d="M4 21h16M5 21v-7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v7" />
        <path d="M5 16c2.3 1.4 4.7 1.4 7 0s4.7-1.4 7 0M12 12V8M12 5.5v-1" />
      </>
    ),
  },
  {
    to: '/carta',
    label: 'La carta',
    hint: 'lo que te quería decir',
    color: 'var(--color-red)',
    icon: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="M4 7l8 6 8-6" />
      </>
    ),
  },
  {
    to: '/nosotros',
    label: 'Nosotros',
    hint: 'fotos y la carta a los colores',
    color: 'var(--color-pink)',
    icon: (
      <path d="M12 20s-6.7-4.2-9-8C1.3 9.1 2.6 5.6 5.7 5c2.1-.4 3.9.6 4.9 2.2L12 9l1.4-1.8c1-1.6 2.8-2.6 4.9-2.2 3.1.6 4.4 4.1 2.7 7-2.3 3.8-9 8-9 8z" />
    ),
  },
  {
    to: '/quiz',
    label: 'El quiz',
    hint: 'burbujas y minijuegos',
    color: 'var(--color-blue)',
    icon: (
      <>
        <circle cx="9" cy="14" r="5" />
        <circle cx="16.5" cy="7.5" r="3.5" />
      </>
    ),
  },
  {
    to: '/tanjiro',
    label: 'Tu rincón Tanjiro',
    hint: 'galería y corte de demonios',
    color: '#2fbf7a',
    icon: <path d="M4 20L20 4M14 4h6v6M7 13l4 4" />,
  },
  {
    to: '/linea-de-tiempo',
    label: 'Línea del tiempo',
    hint: 'todo lo que hemos vivido',
    color: '#ffc14d',
    icon: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
  },
];

export default function SectionNav() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const firstRef = useRef(null);
  const toggleRef = useRef(null);

  /* al cambiar de página el menú se cierra solo */
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return undefined;
    firstRef.current?.focus({ preventScroll: true });
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setOpen(false);
        toggleRef.current?.focus({ preventScroll: true });
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  const go = (to) => {
    setOpen(false);
    if (to === pathname) window.scrollTo({ top: 0, behavior: 'smooth' });
    else navigate(to);
  };

  return (
    <div className={`section-nav${open ? ' is-open' : ''}${pathname === '/' ? ' section-nav--home' : ''}`}>
      <button
        ref={toggleRef}
        type="button"
        className="section-nav-toggle"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="sectionNavPanel"
        aria-label={open ? 'Cerrar menú de secciones' : 'Abrir menú de secciones'}
        title="Secciones"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path className="section-nav-bar section-nav-bar--1" d="M5 7h14" />
          <path className="section-nav-bar section-nav-bar--2" d="M5 12h14" />
          <path className="section-nav-bar section-nav-bar--3" d="M5 17h14" />
        </svg>
      </button>

      {open && <div className="section-nav-backdrop" onClick={() => setOpen(false)} aria-hidden="true" />}

      <nav id="sectionNavPanel" className="section-nav-panel" aria-label="Secciones" hidden={!open}>
        <p className="section-nav-kicker">ir a</p>
        <ul className="section-nav-list">
          {SECTIONS.map((s, i) => {
            const here = s.to === pathname;
            return (
              <li key={s.to} style={{ '--i': i, '--c': s.color }}>
                <button
                  ref={i === 0 ? firstRef : null}
                  type="button"
                  className={`section-nav-item${here ? ' is-here' : ''}`}
                  onClick={() => go(s.to)}
                  aria-current={here ? 'page' : undefined}
                >
                  <span className="section-nav-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24">{s.icon}</svg>
                  </span>
                  <span className="section-nav-text">
                    <b>{s.label}</b>
                    <span>{here ? 'estás aquí' : s.hint}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
        <button type="button" className="section-nav-restart" onClick={restartFromGate} style={{ '--i': SECTIONS.length }}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M3 12a9 9 0 1 0 2.6-6.4" />
            <path d="M3 4v5h5" />
          </svg>
          Vivirlo desde el principio
        </button>
      </nav>
    </div>
  );
}
