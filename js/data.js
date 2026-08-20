/* ============================================================
   BE PLAYER — datos de los álbumes
   Para agregar tus archivos de audio, revisa README.md
   "dur" es la duración en segundos (solo para mostrarla en la lista;
   la real la toma el reproductor del archivo de audio).
   ============================================================ */

const ALBUMS = {
  wwafawdwg: {
    name: "WHEN WE ALL FALL ASLEEP, WHERE DO WE GO?",
    year: 2019,
    backgrounds: [
      "../images/backgrounds/wwafawdwg/1.jpeg",
      "../images/backgrounds/wwafawdwg/2.jpeg",
      "../images/backgrounds/wwafawdwg/3.jpeg",
    ],
    cover: "../images/covers/wwafawdwg.webp",
    tracks: [
      { title: "!!!!!!!", file: "../music/wwafawdwg/01-bang-bang.mp3", dur: 13 },
      { title: "bad guy", file: "../music/wwafawdwg/02-bad-guy.mp3", dur: 194 },
      { title: "xanny", file: "../music/wwafawdwg/03-xanny.mp3", dur: 244 },
      { title: "you should see me in a crown", file: "../music/wwafawdwg/04-you-should-see-me-in-a-crown.mp3", dur: 181 },
      { title: "all the good girls go to hell", file: "../music/wwafawdwg/05-all-the-good-girls-go-to-hell.mp3", dur: 172 },
      { title: "wish you were gay", file: "../music/wwafawdwg/06-wish-you-were-gay.mp3", dur: 222 },
      { title: "when the party's over", file: "../music/wwafawdwg/07-when-the-partys-over.mp3", dur: 196 },
      { title: "8", file: "../music/wwafawdwg/08-8.mp3", dur: 177 },
      { title: "my strange addiction", file: "../music/wwafawdwg/09-my-strange-addiction.mp3", dur: 179 },
      { title: "bury a friend", file: "../music/wwafawdwg/10-bury-a-friend.mp3", dur: 176 },
      { title: "ilomilo", file: "../music/wwafawdwg/11-ilomilo.mp3", dur: 155 },
      { title: "listen before i go", file: "../music/wwafawdwg/12-listen-before-i-go.mp3", dur: 244 },
      { title: "i love you", file: "../music/wwafawdwg/13-i-love-you.mp3", dur: 271 },
      { title: "goodbye", file: "../music/wwafawdwg/14-goodbye.mp3", dur: 140 },
    ],
  },

  hthe: {
    name: "Happier Than Ever",
    year: 2021,
    backgrounds: [
      "../images/backgrounds/hthe/1.jpeg",
      "../images/backgrounds/hthe/2.jpeg",
      "../images/backgrounds/hthe/3.jpeg",
    ],
    cover: "../images/covers/hthe.jpg",
    tracks: [
      { title: "Getting Older", file: "../music/hthe/01-getting-older.mp3", dur: 259 },
      { title: "I Didn't Change My Number", file: "../music/hthe/02-i-didnt-change-my-number.mp3", dur: 183 },
      { title: "Billie Bossa Nova", file: "../music/hthe/03-billie-bossa-nova.mp3", dur: 195 },
      { title: "my future", file: "../music/hthe/04-my-future.mp3", dur: 255 },
      { title: "Oxytocin", file: "../music/hthe/05-oxytocin.mp3", dur: 213 },
      { title: "GOLDWING", file: "../music/hthe/06-goldwing.mp3", dur: 132 },
      { title: "Lost Cause", file: "../music/hthe/07-lost-cause.mp3", dur: 196 },
      { title: "Halley's Comet", file: "../music/hthe/08-halleys-comet.mp3", dur: 212 },
      { title: "Not My Responsibility", file: "../music/hthe/09-not-my-responsibility.mp3", dur: 184 },
      { title: "OverHeated", file: "../music/hthe/10-overheated.mp3", dur: 253 },
      { title: "Everybody Dies", file: "../music/hthe/11-everybody-dies.mp3", dur: 184 },
      { title: "Your Power", file: "../music/hthe/12-your-power.mp3", dur: 246 },
      { title: "NDA", file: "../music/hthe/13-nda.mp3", dur: 216 },
      { title: "Therefore I Am", file: "../music/hthe/14-therefore-i-am.mp3", dur: 174 },
      { title: "Happier Than Ever", file: "../music/hthe/15-happier-than-ever.mp3", dur: 298 },
      { title: "Male Fantasy", file: "../music/hthe/16-male-fantasy.mp3", dur: 196 },
    ],
  },

  hmhas: {
    name: "HIT ME HARD AND SOFT",
    year: 2024,
    // sin fotos propias todavía: cuando las tengas, agrégalas en
    // images/backgrounds/hmhas/ y ponlas aquí (ver README.md)
    backgrounds: [],
    cover: "../images/covers/hit-me-hard-and-soft.webp",
    tracks: [
      { title: "SKINNY", file: "../music/hmhas/01-skinny.mp3", dur: 231 },
      { title: "LUNCH", file: "../music/hmhas/02-lunch.mp3", dur: 199 },
      { title: "CHIHIRO", file: "../music/hmhas/03-chihiro.mp3", dur: 305 },
      { title: "BIRDS OF A FEATHER", file: "../music/hmhas/04-birds-of-a-feather.mp3", dur: 210 },
      { title: "WILDFLOWER", file: "../music/hmhas/05-wildflower.mp3", dur: 260 },
      { title: "THE GREATEST", file: "../music/hmhas/06-the-greatest.mp3", dur: 292 },
      { title: "L'AMOUR DE MA VIE", file: "../music/hmhas/07-lamour-de-ma-vie.mp3", dur: 324 },
      { title: "THE DINER", file: "../music/hmhas/08-the-diner.mp3", dur: 214 },
      { title: "BITTERSUITE", file: "../music/hmhas/09-bittersuite.mp3", dur: 260 },
      { title: "BLUE", file: "../music/hmhas/10-blue.mp3", dur: 324 },
    ],
  },
};

/* canciones que no pertenecen a ninguno de los 3 álbumes de arriba
   (sencillos / soundtrack), usadas en la sección de favoritas */
const SINGLES = {
  "when-i-was-older": {
    title: "WHEN I WAS OLDER",
    subtitle: "sencillo · 2019",
    file: "../music/singles/01-when-i-was-older.mp3",
    cover: "../images/covers/when-i-was-older.jpg",
    dur: 182,
  },
  "my-boy": {
    title: "my boy",
    subtitle: "sencillo · 2017",
    file: "../music/singles/02-my-boy.mp3",
    cover: "../images/covers/my-boy.jpg",
    dur: 187,
  },
};

/* favoritas de Abby, en orden — mezcla álbumes y sencillos.
   "album"/"track" apunta a ALBUMS[album].tracks[track] */
const FAVORITES = [
  { single: "when-i-was-older" },
  { album: "wwafawdwg", track: 12 }, // i love you
  { single: "my-boy" },
  { album: "hmhas", track: 9 }, // BLUE
];
