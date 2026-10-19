import { SESSION_KEY } from './Gate';

/* vuelve al gate desde cero, como si fuera la primera vez — una recarga
   completa es la forma más simple de reiniciar el estado del Gate sin
   acoplar a quien la llama con sus internals */
export function restartFromGate() {
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch {
    /* almacenamiento no disponible, no pasa nada */
  }
  window.location.hash = '/';
  window.location.reload();
}
