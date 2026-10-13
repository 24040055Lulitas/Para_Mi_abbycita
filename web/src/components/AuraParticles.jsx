import { useMemo } from 'react';
import './AuraParticles.css';

const COLORS = ['#3fa9ff', '#ff5ea8', '#3ddc84', '#ff3b3b'];

/* partículas ascendentes de fondo, con los 4 colores de la marca
   en vez del verde psíquico único de la página de referencia */
export default function AuraParticles({ count = 24 }) {
  const dots = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const size = Math.random() * 3 + 2;
        const color = COLORS[Math.floor(Math.random() * COLORS.length)];
        return {
          id: i,
          left: Math.random() * 100,
          size,
          color,
          duration: Math.random() * 10 + 10,
          delay: Math.random() * 14,
        };
      }),
    [count]
  );

  return (
    <div className="aura-field" aria-hidden="true">
      {dots.map((d) => (
        <span
          key={d.id}
          className="aura-dot"
          style={{
            left: `${d.left}vw`,
            width: d.size,
            height: d.size,
            background: d.color,
            boxShadow: `0 0 ${d.size * 2.5}px ${d.color}`,
            animationDuration: `${d.duration}s`,
            animationDelay: `${d.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
