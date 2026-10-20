/* Sección "Nosotros": fotos del corazón y de las polaroids, cada una con
   un título corto y unas palabras que se muestran al abrirla.
   Las fotos salen de public/timeline/ (las mismas de la línea del tiempo);
   cambia src, title o words libremente. */

/* la canción que empieza a sonar al abrir "Nosotros" (por el reproductor
   principal, así se puede pausar desde la barra de abajo) */
export const NOSOTROS_SONG = {
  key: 'extra:congratulations',
  title: 'Congratulations',
  artist: 'nuestra canción',
  subtitle: 'para nosotros',
  file: './nosotros/congratulations.mp3',
  cover: './timeline/018.jpeg',
  dur: 227,
};

export const HEART_PHOTOS = [
  {
    src: './timeline/001.jpeg',
    title: 'el principio',
    words: 'Una de las primeras fotos juntos. Todavía no sabíamos todo lo que venía, pero ya se notaba.',
  },
  {
    src: './timeline/010.jpeg',
    title: 'noche de lago',
    words: 'Hacía frío, pero contigo hasta el frío se siente bonito.',
  },
  {
    src: './timeline/017.jpeg',
    title: 'el día de las rosas',
    words: 'Tus ojitos cerrados y las rosas en tus manos. Tu cara al verlas vale más que cualquier ramo del mundo.',
  },
  {
    src: './timeline/057.jpeg',
    title: 'leyendo juntos',
    words: 'Tú, yo y un papelito entre los dos. Lo que sea, si es contigo, me gusta.',
  },
  {
    src: './timeline/035.jpeg',
    title: 'así de cerquita',
    words: 'Mi lugar favorito del mundo es justo este: a tu lado, sin prisa.',
  },
  {
    src: './timeline/018.jpeg',
    title: 'los dos',
    words: 'Mi foto favorita siempre va a ser cualquiera en la que salgas tú.',
  },
  {
    src: './timeline/027.jpeg',
    title: 'con Neeko',
    words: 'Nosotros con nuestra hija Neeko. La familia más bonita que conozco.',
  },
  {
    src: './timeline/040.jpeg',
    title: 'caras chistosas',
    words: 'Las fotos que nadie más ve son las que más quiero.',
  },
  {
    src: './timeline/059.jpeg',
    title: 'bajo las luces',
    words: 'Contigo cualquier noche se vuelve de las que se recuerdan.',
  },
];

export const POLAROIDS = [
  {
    src: './timeline/019.jpeg',
    title: 'así eres de bonita',
    words: 'No necesitas filtro. Necesitas que alguien te lo diga más seguido, y aquí estoy.',
  },
  {
    src: './timeline/054.jpeg',
    title: 'los caracoles',
    words: 'Perdón por no pisar caracoles (eran piñones). Te ves siempre hermosa.',
  },
  {
    src: './timeline/036.jpeg',
    title: 'juntitos',
    words: 'Me gusta cómo cabemos el uno en el otro, como si siempre hubiera sido así.',
  },
  {
    src: './timeline/045.jpeg',
    title: 'tú y tu dinosaurio',
    words: 'Te emocionas con las cosas pequeñas, y eso hace que yo me emocione contigo.',
  },
  {
    src: './timeline/003.jpeg',
    title: 'nosotros',
    words: 'Dos personas, una misma canción sonando de fondo.',
  },
];

/* nuestros videos: viven en public/timeline/videos/ y su portada en
   videos/posters/ (un cuadro sacado del mismo video) */
const video = (n, title, words) => ({
  src: `./timeline/videos/0${n}.mp4`,
  poster: `./timeline/videos/posters/0${n}.jpg`,
  title,
  words,
});

export const VIDEOS = [
  video(1, 'el paseo en bote', 'Las luces temblando en el agua y un frío que no nos importó.'),
  video(4, 'las primeras flores', 'Tu estado con las primeras flores que te di, y Billie de fondo. Lo vi y no pude dejar de sonreír.'),
  video(3, 'las rosas', 'Tú, las rosas y esa foto con los ojitos cerrados que tanto me gusta.'),
  video(2, 'con Álvaro Díaz de fondo', 'Nosotros dos y una canción de Álvaro Díaz sonando. Así quiero que se sienta todo.'),
  video(6, 'tú y el dinosaurio', 'Me hizo feliz cuando viste el dinosaurio y te emocionaste. Me hiciste feliz con solo verte.'),
  video(5, 'una noche nuestra', 'Una noche cualquiera que terminó siendo de las que se recuerdan. Te ganeeee.'),
];

/* "Carta a tus colores": versos del poema; '' deja un espacio entre
   estrofas y { em: '...', c: 'blue'|'pink'|'black'|'green'|'red' } va
   resaltado en letra a mano, coloreado según el acento de esa estrofa */
export const COLOR_POEM = [
  'Azul como las noches que nos quedamos platicando,',
  'como el cielo que vimos esa noche en el lago,',
  { em: 'tan tranquilo como me siento contigo.', c: 'blue' },
  '',
  'Rosa como tu pelo cuando le pega el sol,',
  'rosa como tus mejillas cuando te ríes sin querer,',
  { em: 'imposible de no mirar.', c: 'pink' },
  '',
  'Negro como la calma de no necesitar palabras,',
  'como las canciones que nos enseñaron a sentir juntos,',
  { em: 'profundo, pero nunca vacío.', c: 'black' },
  '',
  'Verde como lo que ha ido creciendo entre nosotros,',
  'despacio, pero sin parar nunca,',
  { em: 'cada día un poco más.', c: 'green' },
  '',
  'Rojo como lo que siento cuando apareces,',
  'como el color que no se puede fingir,',
  { em: 'el que no se me quita ni queriendo.', c: 'red' },
  '',
  'Hay mil tonos en el mundo',
  'y ninguno se parece a los tuyos:',
  { em: 'los traes en el pelo, en la mirada, y en la forma de quererme.' },
  '',
  'Y cuando el día se pone gris,',
  'me basta con pensar en ti',
  'para que todo vuelva a tener color.',
  { em: 'Todos los colores, como tú.' },
];
