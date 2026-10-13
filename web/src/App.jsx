import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import Timeline from './pages/Timeline/Timeline';

/* HashRouter (en vez de BrowserRouter) porque GitHub Pages sirve
   archivos estáticos sin reescritura de rutas en el servidor — con
   hash (#/...) la navegación funciona siempre, sin configuración
   extra, sin importar bajo qué carpeta quede publicado el sitio. */
export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/linea-de-tiempo" replace />} />
        <Route path="/linea-de-tiempo" element={<Timeline />} />
      </Routes>
    </HashRouter>
  );
}
