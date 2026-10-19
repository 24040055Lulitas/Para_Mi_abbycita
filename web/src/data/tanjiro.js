/* Sección "Tu rincón Tanjiro": textos y fotos.
   Las imágenes son las mismas de la galería secreta (TANJIRO_IMAGES);
   cambia títulos y palabras libremente. */
import { AMBIENT_TRACK, TANJIRO_IMAGES } from './assets';

/* lo que Tanjiro y ella tienen en común: al tocar la tarjeta se voltea */
export const TANJIRO_TRAITS = [
  {
    title: 'Amable con todos',
    front: 'Trata con cariño hasta a quien parece no merecerlo.',
    back: 'Tú también. Tienes una ternura que no se te acaba, ni siquiera en los días pesados.',
  },
  {
    title: 'Nunca se rinde',
    front: 'Se cae, se levanta y lo vuelve a intentar.',
    back: 'Como tú en esas noches difíciles: aunque no supieras qué sentías, seguiste. Eso es ser fuerte.',
  },
  {
    title: 'Protege a los suyos',
    front: 'Todo lo que hace es por las personas que quiere.',
    back: 'Tú cuidas a los tuyos igual. Y yo quiero cuidarte a ti de la misma forma.',
  },
  {
    title: 'Ve lo bueno en los demás',
    front: 'Siempre encuentra algo bonito, hasta en quien nadie mira.',
    back: 'Así me miras tú a mí. Gracias por verme con esos ojos.',
  },
];

const CAPTIONS = [
  ['esa carita', 'Así de tierno. Así de tierna te pones tú cuando te ríes.'],
  ['pura travesura', 'Esa cara de travieso me recuerda a alguien que conozco muy bien.'],
  ['lentes y todo', 'Hasta Tanjiro con lentes. Como nosotros dos.'],
  ['la familia completa', 'Todos juntos, como debe ser.'],
  ['atardecer', 'Un campo de flores y una sonrisa tranquila. Así quiero que se sientan tus días.'],
  ['modo emoción', 'Esa emoción cuando sale algo nuevo de Demon Slayer. Ya sé que pones la misma cara.'],
  ['verde y negro', 'Verde, negro y corazones: tus colores.'],
  ['la rana', 'Diadema de rana y cara de enojado. Imposible no quererlo.'],
  ['pensativo', 'Seguro está pensando en algo bonito. Como yo, en ti.'],
];

export const TANJIRO_GALLERY = TANJIRO_IMAGES.map((src, i) => ({
  src,
  title: CAPTIONS[i]?.[0] || 'Tanjiro',
  words: CAPTIONS[i]?.[1] || '',
}));

/* su canción, para sonar desde el reproductor principal */
export const TANJIRO_SONG = {
  key: 'extra:kamado-tanjiro-no-uta',
  title: 'Kamado Tanjirō no Uta',
  artist: 'Demon Slayer',
  subtitle: 'banda sonora',
  file: AMBIENT_TRACK,
  cover: TANJIRO_IMAGES[4],
  dur: 0,
};
