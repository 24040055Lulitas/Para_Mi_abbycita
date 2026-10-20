import { useCallback, useEffect, useRef } from 'react';
import { usePlayer } from '../context/PlayerContext';

/* para videos y música propia de una sección: hold() pausa la canción
   de fondo y release() la reanuda donde se quedó. Si el componente se
   desmonta con la pausa puesta, se suelta sola. */
export function useMusicHold() {
  const { interrupt } = usePlayer();
  const releaseRef = useRef(null);

  const hold = useCallback(() => {
    if (!releaseRef.current) releaseRef.current = interrupt();
  }, [interrupt]);

  const release = useCallback((fallback) => {
    const r = releaseRef.current;
    releaseRef.current = null;
    r?.(fallback);
  }, []);

  useEffect(
    () => () => {
      releaseRef.current?.();
      releaseRef.current = null;
    },
    []
  );

  return { hold, release };
}
