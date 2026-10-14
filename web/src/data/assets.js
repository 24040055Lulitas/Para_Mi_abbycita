import { ASSET_BASE } from './catalog';

/* imágenes sueltas que usan las secciones del home (no son parte del
   catálogo de álbumes/canciones) — mismos archivos ya publicados en el
   sitio estático, ver nota de ASSET_BASE en catalog.js */
export const DEDICATION_PHOTO = `${ASSET_BASE}/images/backgrounds/hthe/2.jpeg`;
export const CHAT_STICKER = `${ASSET_BASE}/images/backgrounds/hthe/3.jpeg`;
export const SINGLES_ORB_PHOTO = `${ASSET_BASE}/images/backgrounds/wwafawdwg/1.jpeg`;
export const SECRET_PAGE_URL = `${ASSET_BASE}/html/secreto.html`;

export const MEANING_BACKGROUNDS = [
  `${ASSET_BASE}/images/backgrounds/meaning/1.jpg`,
  `${ASSET_BASE}/images/backgrounds/meaning/2.jpg`,
  `${ASSET_BASE}/images/backgrounds/meaning/3.jpg`,
  `${ASSET_BASE}/images/backgrounds/meaning/4.jpg`,
];

export const ICONS = {
  flowerPink: `${ASSET_BASE}/images/icons/flower-pink.png`,
  flowerRed: `${ASSET_BASE}/images/icons/flower-red.png`,
  sun: `${ASSET_BASE}/images/icons/sun.png`,
  tileSakura: `${ASSET_BASE}/images/icons/tile-sakura.png`,
  tileWave: `${ASSET_BASE}/images/icons/tile-wave.png`,
  tileHaori: `${ASSET_BASE}/images/icons/tile-haori.png`,
  tileSunrise: `${ASSET_BASE}/images/icons/tile-sunrise.png`,
};

/* galería secreta de Tanjiro */
export const TANJIRO_IMAGES = Array.from(
  { length: 9 },
  (_, i) => `${ASSET_BASE}/images/secret-tanjiro/tanj${i + 1}.png`
);

export const AMBIENT_TRACK = `${ASSET_BASE}/music/secreto/kamado-tanjiro-no-uta.mp3`;
