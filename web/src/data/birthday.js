/* Sección "Feliz cumpleaños": va justo después de la entrada y antes
   de la carta. Las imágenes viven en public/cumple/. Cambia textos
   libremente. */

const pic = (name, ext = 'jpg') => `./cumple/${name}.${ext}`;

/* stickers sin fondo (los de la portada y los que flotan en las fotos) */
export const BIRTHDAY_STICKERS = {
  billie: pic('billie-gorrito', 'webp'),
  billieTongue: pic('billie-lengua', 'webp'),
  tanjiro: pic('tanjiro-gorrito', 'webp'),
};

/* Billie, la invitada especial */
export const BIRTHDAY_BILLIE = [
  { src: pic('billie-pastel'), caption: 'y te trajo pastel (y un gatito)', tall: true },
  { src: pic('billie-happy-birthday'), caption: 'un mensaje de Billie' },
  { src: pic('billie-rosa'), caption: 'una rosa para ti' },
];

/* Tanjiro tampoco se lo quiso perder */
export const BIRTHDAY_TANJIRO = [
  { src: pic('tanjiro-dorado'), caption: 'de gala para tu día' },
  { src: pic('tanjiro-pastel'), caption: 'te hizo un pastel' },
  { src: pic('tanjiro-rosa'), caption: 'modo fiesta activado' },
  { src: pic('tanjiro-pastel-bosque'), caption: 'esperando a que soples' },
  { src: pic('tanjiro-sigma'), caption: 'con moñito y todo' },
];

/* lo que le deseo */
export const BIRTHDAY_WISHES = [
  'Que este año te trate con la misma ternura con la que tú tratas a todos.',
  'Que tengas noches tranquilas y canciones que te abracen cuando haga falta.',
  'Que te rías mucho, de esas risas tuyas que me cambian el día.',
  'Y que me dejes estar ahí para verlo, este año y todos los que vengan.',
];
