/* Catálogo de álbumes, sencillos y favoritas.
   Las portadas, fondos y canciones NO se duplican en este proyecto —
   viven en el sitio estático (repo raíz) y ya están publicados en
   GitHub Pages, así que aquí solo apuntamos a esas URLs. Esto evita
   copiar ~370MB de música dos veces dentro del mismo repositorio. */

export const ASSET_BASE = 'https://24040055lulitas.github.io/Para_Mi_abbycita';

export const ALBUMS = {
  wwafawdwg: {
    name: 'WHEN WE ALL FALL ASLEEP, WHERE DO WE GO?',
    year: 2019,
    backgrounds: [
      `${ASSET_BASE}/images/backgrounds/wwafawdwg/1.jpeg`,
      `${ASSET_BASE}/images/backgrounds/wwafawdwg/2.jpeg`,
      `${ASSET_BASE}/images/backgrounds/wwafawdwg/3.jpeg`,
    ],
    cover: `${ASSET_BASE}/images/covers/wwafawdwg.webp`,
    tracks: [
      { title: '!!!!!!!', file: `${ASSET_BASE}/music/wwafawdwg/01-bang-bang.mp3`, dur: 13 },
      { title: 'bad guy', file: `${ASSET_BASE}/music/wwafawdwg/02-bad-guy.mp3`, dur: 194 },
      { title: 'xanny', file: `${ASSET_BASE}/music/wwafawdwg/03-xanny.mp3`, dur: 244 },
      { title: 'you should see me in a crown', file: `${ASSET_BASE}/music/wwafawdwg/04-you-should-see-me-in-a-crown.mp3`, dur: 181 },
      { title: 'all the good girls go to hell', file: `${ASSET_BASE}/music/wwafawdwg/05-all-the-good-girls-go-to-hell.mp3`, dur: 172 },
      { title: 'wish you were gay', file: `${ASSET_BASE}/music/wwafawdwg/06-wish-you-were-gay.mp3`, dur: 222 },
      { title: "when the party's over", file: `${ASSET_BASE}/music/wwafawdwg/07-when-the-partys-over.mp3`, dur: 196 },
      { title: '8', file: `${ASSET_BASE}/music/wwafawdwg/08-8.mp3`, dur: 177 },
      { title: 'my strange addiction', file: `${ASSET_BASE}/music/wwafawdwg/09-my-strange-addiction.mp3`, dur: 179 },
      { title: 'bury a friend', file: `${ASSET_BASE}/music/wwafawdwg/10-bury-a-friend.mp3`, dur: 176 },
      { title: 'ilomilo', file: `${ASSET_BASE}/music/wwafawdwg/11-ilomilo.mp3`, dur: 155 },
      { title: 'listen before i go', file: `${ASSET_BASE}/music/wwafawdwg/12-listen-before-i-go.mp3`, dur: 244 },
      { title: 'i love you', file: `${ASSET_BASE}/music/wwafawdwg/13-i-love-you.mp3`, dur: 271 },
      { title: 'goodbye', file: `${ASSET_BASE}/music/wwafawdwg/14-goodbye.mp3`, dur: 140 },
    ],
  },

  hthe: {
    name: 'Happier Than Ever',
    year: 2021,
    backgrounds: [
      `${ASSET_BASE}/images/backgrounds/hthe/1.jpeg`,
      `${ASSET_BASE}/images/backgrounds/hthe/2.jpeg`,
      `${ASSET_BASE}/images/backgrounds/hthe/3.jpeg`,
    ],
    cover: `${ASSET_BASE}/images/covers/hthe.jpg`,
    tracks: [
      { title: 'Getting Older', file: `${ASSET_BASE}/music/hthe/01-getting-older.mp3`, dur: 259 },
      { title: "I Didn't Change My Number", file: `${ASSET_BASE}/music/hthe/02-i-didnt-change-my-number.mp3`, dur: 183 },
      { title: 'Billie Bossa Nova', file: `${ASSET_BASE}/music/hthe/03-billie-bossa-nova.mp3`, dur: 195 },
      { title: 'my future', file: `${ASSET_BASE}/music/hthe/04-my-future.mp3`, dur: 255 },
      { title: 'Oxytocin', file: `${ASSET_BASE}/music/hthe/05-oxytocin.mp3`, dur: 213 },
      { title: 'GOLDWING', file: `${ASSET_BASE}/music/hthe/06-goldwing.mp3`, dur: 132 },
      { title: 'Lost Cause', file: `${ASSET_BASE}/music/hthe/07-lost-cause.mp3`, dur: 196 },
      { title: "Halley's Comet", file: `${ASSET_BASE}/music/hthe/08-halleys-comet.mp3`, dur: 212 },
      { title: 'Not My Responsibility', file: `${ASSET_BASE}/music/hthe/09-not-my-responsibility.mp3`, dur: 184 },
      { title: 'OverHeated', file: `${ASSET_BASE}/music/hthe/10-overheated.mp3`, dur: 253 },
      { title: 'Everybody Dies', file: `${ASSET_BASE}/music/hthe/11-everybody-dies.mp3`, dur: 184 },
      { title: 'Your Power', file: `${ASSET_BASE}/music/hthe/12-your-power.mp3`, dur: 246 },
      { title: 'NDA', file: `${ASSET_BASE}/music/hthe/13-nda.mp3`, dur: 216 },
      { title: 'Therefore I Am', file: `${ASSET_BASE}/music/hthe/14-therefore-i-am.mp3`, dur: 174 },
      { title: 'Happier Than Ever', file: `${ASSET_BASE}/music/hthe/15-happier-than-ever.mp3`, dur: 298 },
      { title: 'Male Fantasy', file: `${ASSET_BASE}/music/hthe/16-male-fantasy.mp3`, dur: 196 },
    ],
  },

  hmhas: {
    name: 'HIT ME HARD AND SOFT',
    year: 2024,
    backgrounds: [],
    cover: `${ASSET_BASE}/images/covers/hit-me-hard-and-soft.webp`,
    tracks: [
      { title: 'SKINNY', file: `${ASSET_BASE}/music/hmhas/01-skinny.mp3`, dur: 231 },
      { title: 'LUNCH', file: `${ASSET_BASE}/music/hmhas/02-lunch.mp3`, dur: 199 },
      { title: 'CHIHIRO', file: `${ASSET_BASE}/music/hmhas/03-chihiro.mp3`, dur: 305 },
      { title: 'BIRDS OF A FEATHER', file: `${ASSET_BASE}/music/hmhas/04-birds-of-a-feather.mp3`, dur: 210 },
      { title: 'WILDFLOWER', file: `${ASSET_BASE}/music/hmhas/05-wildflower.mp3`, dur: 260 },
      { title: 'THE GREATEST', file: `${ASSET_BASE}/music/hmhas/06-the-greatest.mp3`, dur: 292 },
      { title: "L'AMOUR DE MA VIE", file: `${ASSET_BASE}/music/hmhas/07-lamour-de-ma-vie.mp3`, dur: 324 },
      { title: 'THE DINER', file: `${ASSET_BASE}/music/hmhas/08-the-diner.mp3`, dur: 214 },
      { title: 'BITTERSUITE', file: `${ASSET_BASE}/music/hmhas/09-bittersuite.mp3`, dur: 260 },
      { title: 'BLUE', file: `${ASSET_BASE}/music/hmhas/10-blue.mp3`, dur: 324 },
    ],
  },
};

/* canciones que no pertenecen a ninguno de los 3 álbumes de arriba
   (sencillos / soundtrack), usadas también en la sección de favoritas */
export const SINGLES = {
  'when-i-was-older': {
    title: 'WHEN I WAS OLDER',
    subtitle: 'sencillo · 2019',
    file: `${ASSET_BASE}/music/singles/01-when-i-was-older.mp3`,
    cover: `${ASSET_BASE}/images/covers/when-i-was-older.jpg`,
    dur: 182,
  },
  'my-boy': {
    title: 'my boy',
    subtitle: 'sencillo · 2017',
    file: `${ASSET_BASE}/music/singles/02-my-boy.mp3`,
    cover: `${ASSET_BASE}/images/covers/my-boy.jpg`,
    dur: 187,
  },
};

/* favoritas de Abby, en orden — mezcla álbumes y sencillos */
export const FAVORITES = [
  { single: 'when-i-was-older' },
  { album: 'wwafawdwg', track: 12 }, // i love you
  { single: 'my-boy' },
  { album: 'hmhas', track: 9 }, // BLUE
];

/* convierte cualquier referencia { album, track } o { single } en un
   objeto plano y uniforme que el reproductor y la UI pueden usar igual */
export function resolveTrackRef(ref) {
  if (ref.single) {
    const s = SINGLES[ref.single];
    if (!s) return null;
    return {
      key: `single:${ref.single}`,
      title: s.title,
      subtitle: s.subtitle,
      file: s.file,
      cover: s.cover,
      dur: s.dur,
    };
  }
  const album = ALBUMS[ref.album];
  const track = album?.tracks?.[ref.track];
  if (!album || !track) return null;
  return {
    key: `album:${ref.album}:${ref.track}`,
    title: track.title,
    subtitle: album.name,
    file: track.file,
    cover: album.cover,
    dur: track.dur,
  };
}

export function albumTrackRefs(albumKey) {
  const album = ALBUMS[albumKey];
  if (!album) return [];
  return album.tracks.map((_, i) => resolveTrackRef({ album: albumKey, track: i }));
}

export function singlesTrackRefs() {
  return Object.keys(SINGLES).map((key) => resolveTrackRef({ single: key }));
}

export function favoritesTrackRefs() {
  return FAVORITES.map(resolveTrackRef).filter(Boolean);
}

/* índice plano de TODAS las canciones (álbumes + sencillos), usado para
   resolver "me gusta" guardados por archivo sin importar de dónde vengan */
export function allTrackRefs() {
  const refs = [];
  Object.keys(ALBUMS).forEach((albumKey) => refs.push(...albumTrackRefs(albumKey)));
  refs.push(...singlesTrackRefs());
  return refs;
}

export const ALBUM_KEYS = Object.keys(ALBUMS);

/* búsqueda simple por substring, sin distinguir mayúsculas/acentos,
   sobre título y álbum/subtítulo de cada canción */
function normalize(str) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

export function searchTracks(query) {
  const q = normalize(query.trim());
  if (!q) return [];
  return allTrackRefs().filter(
    (track) => normalize(track.title).includes(q) || normalize(track.subtitle).includes(q)
  );
}
