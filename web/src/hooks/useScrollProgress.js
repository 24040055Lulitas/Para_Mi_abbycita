import { useEffect, useState } from 'react';

/* porcentaje de scroll recorrido en toda la página (0-100),
   inspirado en el medidor de perdon.js pero reescrito para React */
export function useScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let ticking = false;

    function update() {
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight || 1;
      const pct = Math.min(100, Math.max(0, Math.round((window.scrollY / max) * 100)));
      setProgress(pct);
      ticking = false;
    }

    function onScroll() {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    }

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return progress;
}
