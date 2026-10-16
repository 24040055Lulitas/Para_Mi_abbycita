import { HashRouter, Route, Routes } from 'react-router-dom';
import Gate from './components/Gate/Gate';
import MiniPlayer from './components/MiniPlayer/MiniPlayer';
import SearchOverlay from './components/SearchOverlay/SearchOverlay';
import { PlayerProvider } from './context/PlayerContext';
import Home from './pages/Home/Home';
import Letter from './pages/Letter/Letter';
import Nosotros from './pages/Nosotros/Nosotros';
import Quiz from './pages/Quiz/Quiz';
import Secret from './pages/Secret/Secret';
import Timeline from './pages/Timeline/Timeline';

/* HashRouter (en vez de BrowserRouter) porque GitHub Pages sirve
   archivos estáticos sin reescritura de rutas en el servidor — con
   hash (#/...) la navegación funciona siempre, sin configuración
   extra, sin importar bajo qué carpeta quede publicado el sitio.

   PlayerProvider y MiniPlayer viven fuera de <Routes>, al mismo nivel
   que el router, para que el <audio> y la barra de reproducción
   persistan (sin cortarse) al navegar entre el inicio y la línea del
   tiempo — el mismo principio del reproductor original de una sola
   página, aplicado ahora a un sitio con varias rutas. */
export default function App() {
  return (
    <PlayerProvider>
      <HashRouter>
        <Gate>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/carta" element={<Letter />} />
            <Route path="/nosotros" element={<Nosotros />} />
            <Route path="/quiz" element={<Quiz />} />
            <Route path="/linea-de-tiempo" element={<Timeline />} />
            <Route path="/secreto" element={<Secret />} />
          </Routes>
          <SearchOverlay />
          <MiniPlayer />
        </Gate>
      </HashRouter>
    </PlayerProvider>
  );
}
