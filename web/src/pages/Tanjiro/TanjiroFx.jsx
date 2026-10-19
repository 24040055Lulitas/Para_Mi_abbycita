import { useEffect, useRef } from 'react';

/* =========================================================
   Estela de espada: al deslizar el dedo (o arrastrar / mover
   rápido el mouse) queda un corte brillante. Agua casi siempre,
   y cada tercer corte sale en fuego (Hinokami Kagura).
   ========================================================= */

const BLADES = {
  water: { glow: 'rgba(70, 180, 255, 0.95)', body: 'rgba(110, 205, 255, 0.9)' },
  fire: { glow: 'rgba(255, 100, 40, 0.95)', body: 'rgba(255, 150, 70, 0.92)' },
};
/* cuánto vive cada punto del trazo, en ms */
const LIFE = 230;
/* velocidad (px/ms) a la que el mouse sin presionar ya "corta" */
const MOUSE_SLASH_SPEED = 0.9;

export function SwordTrail() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return undefined;
    const ctx = canvas.getContext('2d');
    let dpr = 1;
    let points = [];
    let raf = 0;
    let strokeId = 0;
    let blade = BLADES.water;
    let mouseDown = false;
    let mouseActive = false;
    let lastMouse = null;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(window.innerWidth * dpr);
      canvas.height = Math.round(window.innerHeight * dpr);
    };
    resize();

    const draw = () => {
      const now = performance.now();
      points = points.filter((p) => now - p.t < LIFE);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.lineCap = 'round';
      ctx.globalCompositeOperation = 'lighter';

      for (let i = 1; i < points.length; i++) {
        const a = points[i - 1];
        const b = points[i];
        if (a.stroke !== b.stroke) continue;
        /* 1 = recién trazado, 0 = a punto de desaparecer */
        const life = 1 - (now - b.t) / LIFE;
        ctx.globalAlpha = life;

        ctx.shadowBlur = 18;
        ctx.shadowColor = b.blade.glow;
        ctx.strokeStyle = b.blade.body;
        ctx.lineWidth = 2 + life * 10;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();

        ctx.shadowBlur = 0;
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1 + life * 3;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }

      ctx.globalAlpha = 1;
      raf = points.length ? requestAnimationFrame(draw) : 0;
    };

    const add = (x, y) => {
      points.push({ x, y, t: performance.now(), stroke: strokeId, blade });
      if (!raf) raf = requestAnimationFrame(draw);
    };

    const newStroke = () => {
      strokeId += 1;
      blade = strokeId % 3 === 0 ? BLADES.fire : BLADES.water;
    };

    /* mouse: corta al arrastrar, o con un movimiento rápido */
    const onPointerDown = (e) => {
      if (e.pointerType !== 'mouse') return;
      mouseDown = true;
      mouseActive = true;
      newStroke();
      add(e.clientX, e.clientY);
    };
    const onPointerUp = (e) => {
      if (e.pointerType === 'mouse') mouseDown = false;
    };
    const onPointerMove = (e) => {
      if (e.pointerType !== 'mouse') return;
      const t = performance.now();
      const fast =
        lastMouse &&
        Math.hypot(e.clientX - lastMouse.x, e.clientY - lastMouse.y) / Math.max(1, t - lastMouse.t) > MOUSE_SLASH_SPEED;
      if (mouseDown || fast) {
        if (!mouseActive) {
          newStroke();
          if (lastMouse) add(lastMouse.x, lastMouse.y);
        }
        mouseActive = true;
        add(e.clientX, e.clientY);
      } else {
        mouseActive = false;
      }
      lastMouse = { x: e.clientX, y: e.clientY, t };
    };

    /* touch: se usan eventos táctiles porque siguen llegando mientras
       la página hace scroll (los pointer events se cancelan) */
    const onTouchStart = (e) => {
      const p = e.touches[0];
      if (!p) return;
      newStroke();
      add(p.clientX, p.clientY);
    };
    const onTouchMove = (e) => {
      const p = e.touches[0];
      if (p) add(p.clientX, p.clientY);
    };

    window.addEventListener('resize', resize);
    window.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return <canvas ref={canvasRef} className="tj-trail" aria-hidden="true" />;
}

/* =========================================================
   Katana como barra de progreso: la hoja se llena de agua a
   fuego mientras bajas por la página.
   ========================================================= */

export function KatanaMeter() {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    let raf = 0;
    const update = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      el.style.setProperty('--p', p.toFixed(4));
      el.classList.toggle('is-full', p > 0.985);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="tj-katana" ref={ref} aria-hidden="true">
      <span className="tj-katana-blade">
        <span className="tj-katana-fill" />
        <span className="tj-katana-shine" />
      </span>
      <span className="tj-katana-guard" />
      <span className="tj-katana-hilt" />
    </div>
  );
}
