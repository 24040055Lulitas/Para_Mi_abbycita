import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Reveal from '../../components/Reveal';
import { usePlayer } from '../../context/PlayerContext';
import { resolveTrackRef } from '../../data/catalog';
import { useScrollProgress } from '../../hooks/useScrollProgress';
import './Letter.css';

/* la canción que sonó al entrar ("i love you"); si la cambias en
   Gate.jsx, cámbiala también aquí para que la posdata tenga sentido */
const LETTER_SONG = resolveTrackRef({ album: 'wwafawdwg', track: 12 });

const HEART_PATH =
  'M12 20s-6.7-4.2-9-8C1.3 9.1 2.6 5.6 5.7 5c2.1-.4 3.9.6 4.9 2.2L12 9l1.4-1.8c1-1.6 2.8-2.6 4.9-2.2 3.1.6 4.4 4.1 2.7 7-2.3 3.8-9 8-9 8z';

/* garabatos hechos "a mano" para los márgenes */
function DoodleHeart({ className }) {
  return (
    <svg className={className} viewBox="0 0 48 44" aria-hidden="true">
      <path d="M24 40C14 32 4 25 4.5 14.5 5 7 12.5 3.5 18 6c3 1.4 5 4 6 6.5 1-2.6 3.2-5.3 6.4-6.6C36 3.6 43.5 7.4 43.5 15 43.6 25 33.5 32 24 40z" />
      <path d="M8 10c-2 3-2.5 6-1.5 9" />
    </svg>
  );
}

function DoodleStar({ className }) {
  return (
    <svg className={className} viewBox="0 0 40 40" aria-hidden="true">
      <path d="M20 3c1.3 9 4 12.5 16 17-12 4.4-14.7 8-16 17-1.3-9-4-12.6-16-17 12-4.5 14.7-8 16-17z" />
    </svg>
  );
}

function DoodleFlower({ className }) {
  return (
    <svg className={className} viewBox="0 0 60 80" aria-hidden="true">
      <circle cx="30" cy="22" r="5" />
      <path d="M30 17c-3-9 6-12 6-4M35 21c9-3 10 7 2 5.5M33 27c5 8-4 11-4.5 3M27 27c-6 7-12-1-4-3.5M25 20c-8-4-3-12 3-6" />
      <path d="M30 28c0 14-2 30 1 48M30 52c-8-6-14-4-16-1 5 3 11 4 16 1M31 62c7-6 13-5 15-2-5 3-10 4-15 2" />
    </svg>
  );
}

export default function Letter() {
  const navigate = useNavigate();
  const progress = useScrollProgress();
  const { playTrackRef, current, isPlaying } = usePlayer();
  const songIsPlaying = isPlaying && current?.key === LETTER_SONG?.key;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="letter-page">
      <div className="letter-progress" aria-hidden="true">
        <span style={{ transform: `scaleX(${progress / 100})` }} />
      </div>

      <header className="letter-topbar">
        <p>una carta, escrita despacio</p>
      </header>

      <main className="letter-desk">
        <article className="letter-paper" aria-label="Carta para Abby">
          <DoodleStar className="doodle doodle--star-a" />
          <DoodleFlower className="doodle doodle--flower" />

          <p className="letter-date">Octubre de 2026 · de noche</p>

          <h1 className="letter-greeting">Mi amor, Abby:</h1>

          <Reveal as="p">
            Te escribo esto con calma, de noche, con una canción de Billie sonando bajito,
            porque así es como imagino que lo vas a leer tú. Y porque hay cosas que no caben
            en un mensaje, por más largos que me salgan.{' '}
            <em className="hl">Esta carta es todo lo que no he sabido decirte en voz alta.</em>
          </Reveal>

          <Reveal as="p">
            Todo empezó con un match. Una de esas casualidades que uno no se toma en serio… y
            mírame ahora, escribiéndote cartas y haciéndote una página a mano, línea por
            línea. A veces me da risa pensar que lo más bonito que me ha pasado empezó
            deslizando un dedo en una pantalla.
          </Reveal>

          <figure className="letter-polaroid letter-polaroid--right">
            <span className="letter-tape" aria-hidden="true" />
            <img src="./timeline/017.jpeg" alt="Nosotros el día de las primeras flores" loading="lazy" />
            <figcaption>el día de las primeras flores</figcaption>
          </figure>

          <Reveal as="p">
            Me acuerdo de todo. Del paseo en bote de noche, con las luces temblando en el agua,
            la rana de peluche de copiloto y un frío que no nos importó. De las primeras
            flores, el 30 de agosto, y de cómo me las describiste tú. Del té de burbujas el 13
            de septiembre: tu Ferrero, mi Taro, y tu nombre escrito en el vaso como si fuera
            cualquier cosa, cuando para mí no lo es.
          </Reveal>

          <Reveal as="p">
            De la cena con lluvia y las luces reflejadas en la banqueta. De las luciérnagas. De
            la catedral iluminada en aquel pueblo mágico. De tus caras chistosas en el sillón
            que nadie más ve, y de los calcetines disparejos.{' '}
            <em className="hl">No son fechas: son los lugares donde aprendí a quererte.</em>
          </Reveal>

          <Reveal as="div" className="letter-aside">
            <DoodleHeart className="letter-aside-heart" />
            <p>
              Una vez me contaste que en un momento muy difícil no sabías ni qué sentías, y
              que encontraste en la música de Billie las palabras que te faltaban. Que su voz
              tranquila, en las noches, fue como un abracito. Que era, simplemente,{' '}
              <strong>tu lugar</strong>.
            </p>
          </Reveal>

          <Reveal as="p">
            Desde ese día entendí algo: no necesitas que alguien te arregle, porque no hay
            nada roto en ti. Necesitas un lugar donde descansar.{' '}
            <em className="hl">Yo quiero ser eso para ti.</em> No el ruido; la calma. La
            persona a la que le puedes decir "hoy no estoy bien" sin tener que explicar nada
            más.
          </Reveal>

          <Reveal as="p">
            Quiero que sepas que te admiro. Por lo fuerte que eres, aunque tú no lo veas. Por
            cómo cuidas a los que quieres. Por tu pelo rosa, tus lentes redondos y esa forma
            tuya de reírte que me cambia el día. Por cómo te emocionas con un peluche de
            dinosaurio en medio del mall. Por cómo existes.
          </Reveal>

          <figure className="letter-polaroid letter-polaroid--left">
            <span className="letter-tape letter-tape--pink" aria-hidden="true" />
            <img src="./timeline/026.jpeg" alt="Dos tés de burbujas con nuestros nombres" loading="lazy" />
            <figcaption>Ferrero para ti, Taro para mí</figcaption>
          </figure>

          <Reveal as="div" className="letter-promises">
            <p className="letter-promises-title">Lo que te prometo</p>
            <ol>
              <li>No días perfectos, pero sí estar en los difíciles, aunque sea en silencio.</li>
              <li>Poner play y quedarme contigo cuando no puedas dormir.</li>
              <li>Seguir aprendiendo cómo quererte mejor, todos los días.</li>
              <li>Escucharte de verdad, sin querer arreglarlo todo.</li>
              <li>Que la puerta de tu lugar nunca va a tener contraseña.</li>
            </ol>
          </Reveal>

          <Reveal as="p">
            Así que cuando el mundo pese, cuando no sepas qué sientes, cuando la noche se haga
            larga, vuelve aquí. Pon la canción que quieras. Y acuérdate de que hay alguien que
            te quiere con una calma que a veces ni yo me explico.
          </Reveal>

          <Reveal as="p" className="letter-last">
            <em className="hl hl--big">Gracias por dejarme quererte.</em>
          </Reveal>

          <div className="letter-signoff">
            <p className="letter-signoff-label">Siempre tuyo,</p>
            <p className="letter-signature">el que te hizo esto</p>
            <DoodleHeart className="letter-signature-heart" />
          </div>

          <div className="letter-ps">
            <p>
              <span className="ps-label">P.D.</span> Ya sé que vas a decir que soy un cursi.
              Tienes razón, y no pienso cambiar.
            </p>
            {LETTER_SONG && (
              <p>
                <span className="ps-label">P.P.D.</span> La canción con la que entraste no fue
                casualidad.{' '}
                <button
                  type="button"
                  className="ps-play"
                  onClick={() => playTrackRef(LETTER_SONG)}
                  disabled={songIsPlaying}
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    {songIsPlaying ? <path d="M6 5h4v14H6zM14 5h4v14h-4z" /> : <path d="M8 5v14l11-7z" />}
                  </svg>
                  {songIsPlaying ? `sonando «${LETTER_SONG.title}»` : `escuchar «${LETTER_SONG.title}»`}
                </button>
              </p>
            )}
          </div>

          <div className="letter-seal" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <path d={HEART_PATH} />
            </svg>
          </div>
          <DoodleStar className="doodle doodle--star-b" />
        </article>

        <div className="letter-cta">
          <button type="button" className="letter-enter" onClick={() => navigate('/')}>
            Ahora sí, entra a tu lugar
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </button>
          <p>Esta carta se queda guardada aquí, por si algún día la necesitas otra vez.</p>
        </div>
      </main>
    </div>
  );
}
