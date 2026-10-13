import { useScrollProgress } from '../hooks/useScrollProgress';
import './ScrollMeter.css';

const RADIUS = 28;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/* medidor circular fijo que sube de 0 a 100 según el avance del
   scroll — idea tomada de la página de referencia, con el degradado
   azul-rosa de esta web en vez de su verde psíquico */
export default function ScrollMeter() {
  const pct = useScrollProgress();
  const offset = CIRCUMFERENCE - (CIRCUMFERENCE * pct) / 100;

  return (
    <div className="scroll-meter" aria-hidden="true">
      <svg className="scroll-meter-ring" viewBox="0 0 64 64">
        <defs>
          <linearGradient id="scrollMeterGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--color-blue)" />
            <stop offset="100%" stopColor="var(--color-pink)" />
          </linearGradient>
        </defs>
        <circle className="scroll-meter-track" cx="32" cy="32" r={RADIUS} />
        <circle
          className="scroll-meter-fill"
          cx="32"
          cy="32"
          r={RADIUS}
          style={{
            strokeDasharray: CIRCUMFERENCE,
            strokeDashoffset: offset,
          }}
        />
      </svg>
      <span className="scroll-meter-num">{pct}</span>
      <span className="scroll-meter-pct">%</span>
    </div>
  );
}
