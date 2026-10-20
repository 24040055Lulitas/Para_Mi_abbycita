/* Sección "Tu rincón Tanjiro": textos, fotos y el minijuego.
   Las imágenes viven en public/tanjiro/ (las de la galería secreta se
   quedan solo en /secreto). Cambia títulos y palabras libremente. */
import { AMBIENT_TRACK } from './assets';

const img = (n) => `./tanjiro/tanjiro-${String(n).padStart(2, '0')}.jpg`;

/* fotos sueltas que usa la página fuera de la galería */
export const TANJIRO_PHOTOS = {
  hero: img(1),
  sword: img(7),
  together: img(12),
  couple: img(5),
  chibi: './tanjiro/tanjiro-chibi.webp',
  face: './tanjiro/tanjiro-cara.webp',
};

/* lo que Tanjiro y ella tienen en común: al tocar la tarjeta se voltea */
export const TANJIRO_TRAITS = [
  {
    title: 'Amable con todos',
    image: img(10),
    front: 'Trata con cariño hasta a quien parece no merecerlo.',
    back: 'Tú también. Tienes una ternura que no se te acaba, ni siquiera en los días pesados.',
  },
  {
    title: 'Nunca se rinde',
    image: img(6),
    front: 'Se cae, se levanta y lo vuelve a intentar.',
    back: 'Como tú en esas noches difíciles: aunque no supieras qué sentías, seguiste. Eso es ser fuerte.',
  },
  {
    title: 'Protege a los suyos',
    image: img(2),
    front: 'Todo lo que hace es por las personas que quiere.',
    back: 'Tú cuidas a los tuyos igual. Y yo quiero cuidarte a ti de la misma forma.',
  },
  {
    title: 'Ve lo bueno en los demás',
    image: img(3),
    front: 'Siempre encuentra algo bonito, hasta en quien nadie mira.',
    back: 'Así me miras tú a mí. Gracias por verme con esos ojos.',
  },
];

export const TANJIRO_GALLERY = [
  [1, 'esa sonrisa', 'Así de contento se pone. Así me pongo yo cuando te veo.'],
  [10, 'hola', 'Un guiño y un saludo. Así quiero empezar cada uno de tus días.'],
  [7, 'la espada', 'Listo para cortar cualquier cosa que te ponga triste.'],
  [5, 'Tanjiro y Kanao', 'Juntitos y con un corazón arriba. Así me imagino a nosotros.'],
  [2, 'echándote porras', 'Puños arriba y una sonrisa enorme. Así te echo porras en todo lo que haces.'],
  [6, 'determinación', 'Esa mirada de que nada lo detiene. Así te veo cuando algo te importa.'],
  [3, 'paz', 'Un guiño y la paz. Lo que quiero darte todos los días.'],
  [4, 'corazoncitos', 'Corazones y brillitos por todos lados. Así me pongo cada vez que pienso en ti.'],
  [8, 'aprobado', 'Pulgar arriba de Tanjiro: eres la mejor.'],
  [9, 'esa carita', 'Una sonrisita pícara y un brillito. Esa cara pones cuando me vas a molestar, y me encanta.'],
  [11, 'chiquito', 'Chiquito, tierno y con su haori. Imposible no quererlo.'],
  [12, 'entre flores', 'Tanjiro y Kanao entre flores. Un día tranquilo, como los que quiero contigo.'],
  [13, 'ojitos brillantes', 'Esos ojos enormes de emoción. Así te brillan a ti cuando algo te encanta.'],
  [14, 'primavera', 'Pétalos de cerezo y la boca abierta de felicidad. Puro día bonito.'],
  [15, '¡yo!', 'Mano arriba, la paz y la sonrisa más grande. Siempre listo para estar contigo.'],
].map(([n, title, words]) => ({ src: img(n), title, words }));

/* video que se abre al entrar a la sección (una vez por visita) y que
   también queda dentro de la página */
export const TANJIRO_VIDEO = './tanjiro/intro-tanjiro.mp4';
export const TANJIRO_VIDEO_POSTER = './tanjiro/intro-tanjiro.jpg';

/* su canción, para sonar desde el reproductor principal */
export const TANJIRO_SONG = {
  key: 'extra:kamado-tanjiro-no-uta',
  title: 'Kamado Tanjirō no Uta',
  artist: 'Demon Slayer',
  subtitle: 'banda sonora',
  file: AMBIENT_TRACK,
  cover: img(1),
  dur: 0,
};

/* ---------- minijuego "Corte de demonios" ---------- */

/* música de la partida: el tema de Tengen Uzui suena normal y, cuando
   aparece Muzan, cambia a la pelea final contra Gyutaro */
export const SLASH_MUSIC = {
  normal: './canciones/tengen-uzui-theme.mp3',
  boss: './canciones/tengen-vs-gyutaro.mp3',
};

const face = (name) => `./tanjiro/faces/${name}.jpg`;

/* Lunas Inferiores: los demonios normales que saltan */
export const LOWER_MOONS = [
  { name: 'Rui', src: face('rui') },
  { name: 'Kamanue', src: face('kamanue') },
  { name: 'Mukago', src: face('mukago') },
  { name: 'Wakuraba', src: face('wakuraba') },
  { name: 'Rokuro', src: face('rokuro') },
];

/* Enmu, Luna Inferior 1: más rápido y vale más */
export const ENMU = { name: 'Enmu', src: face('enmu') };

/* los herreros de la aldea: a ellos no se les corta */
export const VILLAGERS = [
  { name: 'Haganezuka', src: face('aldeano1') },
  { name: 'Kotetsu', src: face('aldeano2') },
];

/* Lunas Superiores (modo difícil): salen de una en una, de la más débil
   a la más fuerte. hp = cortes que aguantan, según su poder; time =
   segundos antes de escapar. Daki y Gyutaro son la Sexta: al vencer a
   Daki aparece su hermano. */
export const UPPER_MOONS = [
  { name: 'Daki', rank: 6, hp: 6, time: 9, points: 10, speed: 0.8, src: face('daki'), then: 1 },
  { name: 'Gyutaro', rank: 6, hp: 9, time: 9, points: 20, speed: 1, src: face('gyutaro'), phase: true },
  { name: 'Gyokko', rank: 5, hp: 11, time: 10, points: 25, speed: 1.05, src: face('gyokko') },
  { name: 'Hantengu', rank: 4, hp: 13, time: 10, points: 30, speed: 1.15, src: face('hantengu') },
  { name: 'Akaza', rank: 3, hp: 16, time: 11, points: 40, speed: 1.3, src: face('akaza') },
  { name: 'Doma', rank: 2, hp: 19, time: 12, points: 50, speed: 1.4, src: face('doma') },
  { name: 'Kokushibo', rank: 1, hp: 24, time: 13, points: 70, speed: 1.55, src: face('kokushibo') },
];

/* jefe final: solo aparece si vences a todas las Lunas Superiores sin
   que ninguna escape. A la mitad de su vida pasa a su forma final;
   si dejas de cortarlo, se regenera. */
export const MUZAN = {
  name: 'Muzan Kibutsuji',
  title: 'el Rey de los Demonios',
  hp: 40,
  time: 24,
  points: 150,
  speed: 1.35,
  src: face('muzan'),
  finalSrc: face('muzan-final'),
};
