/* pequeño ecualizador animado — reemplaza el símbolo ♪ como indicador
   de "sonando ahora" en listas de canciones (TrackPanel, búsqueda,
   favoritas) */
export default function NowPlayingIcon() {
  return (
    <svg className="now-playing-icon" viewBox="0 0 16 16" aria-hidden="true">
      <rect x="1.5" y="6" width="3" height="8" rx="1" />
      <rect x="6.5" y="2" width="3" height="12" rx="1" />
      <rect x="11.5" y="8" width="3" height="6" rx="1" />
    </svg>
  );
}
