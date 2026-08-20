# BE Player — para ABBY

Playlist-regalo con la discografía de Billie Eilish, hecha en HTML, CSS y JavaScript puro (sin build, funciona directo en GitHub Pages).

## Cómo abrir

Abre `html/index.html` en el navegador, o publícalo con GitHub Pages apuntando a la raíz del repo.

## La página (de arriba hacia abajo)

1. **Hero** — el nombre ABBY en grande, con foto de fondo.
2. **Dedicatoria** — una foto (`images/backgrounds/hthe/2.jpeg`) y un texto para Abby.
3. **Discografía** — tarjetas de los 3 álbumes; al hacer clic se abre un panel con su tracklist.
4. **Favoritas** — 4 canciones elegidas a mano (mezcla álbumes y sencillos sueltos).
5. **Cierre** — una cita y el crédito final.

Todo el tiempo hay un **mini-reproductor fijo abajo** (como Spotify) y una **lupa fija arriba a la derecha** que abre un buscador sobre todas las canciones — de cualquier álbum o de las favoritas.

## Estructura

```
html/index.html              → un único documento: hero, dedicatoria, álbumes, favoritas, cierre, buscador y mini-player
css/index.css                 → estilos (colores: azul, rosa, negro, verde, rojo)
js/data.js                    → álbumes, sencillos sueltos y favoritas (edita aquí para agregar/cambiar canciones)
js/player.js                  → lógica del reproductor, panel de álbum, buscador, favoritas e integración con el sistema
js/particles.js                → partículas flotantes decorativas (azul, rosa, verde, rojo)
images/covers/                 → portada oficial de cada álbum (solo se usa en la galería y el mini-player)
images/backgrounds/<álbum>/    → tus fotos: una para el hero, el resto sin usar todavía
music/wwafawdwg/               → audio del álbum "WHEN WE ALL FALL ASLEEP, WHERE DO WE GO?"
music/hthe/                    → audio del álbum "Happier Than Ever"
music/hmhas/                   → audio del álbum "HIT ME HARD AND SOFT"
music/singles/                 → audio de canciones sueltas (no pertenecen a ningún álbum)
```

**Por qué un solo HTML:** todo vive en `html/index.html`; `player.js` solo abre/cierra paneles con JS, nunca navega a otra página. Así el `<audio>` nunca se destruye, y la música sigue sonando al hacer scroll, abrir el buscador, cambiar de álbum, cambiar de pestaña del navegador o minimizar el celular.

**Controles nativos (Android/iOS):** el player usa la MediaSession API, así que la canción, el artista, la portada y los botones de play/pausa/siguiente/anterior aparecen en la pantalla de bloqueo y la notificación del celular, igual que Spotify.

**Cómo funciona la reproducción:** hay una sola "cola" de canciones en `player.js` (`state.queue`). Abrir un álbum, tocar una favorita o elegir un resultado del buscador simplemente arma una cola distinta — por eso siguiente/anterior/aleatorio funcionan igual sin importar de dónde vino la canción.

## Archivos de audio que faltan

El reproductor ya funciona (fondos, portadas, tracklists, buscador, favoritas, controles), pero necesita que agregues los .mp3 con estos nombres EXACTOS dentro de cada carpeta:

### music/wwafawdwg/
```
01-bang-bang.mp3
02-bad-guy.mp3
03-xanny.mp3
04-you-should-see-me-in-a-crown.mp3
05-all-the-good-girls-go-to-hell.mp3
06-wish-you-were-gay.mp3
07-when-the-partys-over.mp3
08-8.mp3
09-my-strange-addiction.mp3
10-bury-a-friend.mp3
11-ilomilo.mp3
12-listen-before-i-go.mp3
13-i-love-you.mp3
14-goodbye.mp3
```

### music/hthe/
```
01-getting-older.mp3
02-i-didnt-change-my-number.mp3
03-billie-bossa-nova.mp3
04-my-future.mp3
05-oxytocin.mp3
06-goldwing.mp3
07-lost-cause.mp3
08-halleys-comet.mp3
09-not-my-responsibility.mp3
10-overheated.mp3
11-everybody-dies.mp3
12-your-power.mp3
13-nda.mp3
14-therefore-i-am.mp3
15-happier-than-ever.mp3
16-male-fantasy.mp3
```

### music/hmhas/  ("HIT ME HARD AND SOFT")
```
01-skinny.mp3
02-lunch.mp3
03-chihiro.mp3
04-birds-of-a-feather.mp3
05-wildflower.mp3
06-the-greatest.mp3
07-lamour-de-ma-vie.mp3
08-the-diner.mp3
09-bittersuite.mp3
10-blue.mp3
```

### music/singles/  (canciones sueltas, usadas en "favoritas")
```
01-when-i-was-older.mp3
02-my-boy.mp3
```

Si un archivo falta, la canción simplemente muestra un aviso en rojo bajo los controles en vez de romper la página — puedes ir agregando los mp3 poco a poco.

## Imágenes

- `images/covers/wwafawdwg.webp`, `images/covers/hthe.jpg` y `images/covers/hit-me-hard-and-soft.webp` → portada oficial de cada álbum. Solo se usan en la galería, el panel de álbum y el mini-player.
- `images/backgrounds/wwafawdwg/2.jpeg` → foto de fondo del hero (arriba de todo).
- `images/backgrounds/hthe/2.jpeg` → foto de la sección de dedicatoria.
- El resto de tus fotos (`wwafawdwg/1.jpeg`, `3.jpeg`, `hthe/1.jpeg`, `3.jpeg`) quedan guardadas sin usar por ahora, para una futura sección.

Para cambiar cuál foto se usa en el hero o en la dedicatoria, edita la ruta en `.hero-bg` (`css/index.css`) o en el `<img>` de `.dedication-photo` (`html/index.html`).

**`images/backgrounds/hmhas/` está vacía a propósito** — "HIT ME HARD AND SOFT" todavía no tiene fotos propias. Cuando tengas, guárdalas ahí y agrégalas al arreglo `backgrounds` de `hmhas` en `js/data.js`.

## Favoritas y canciones sueltas

`js/data.js` tiene un arreglo `FAVORITES` con las 4 canciones destacadas (`WHEN I WAS OLDER`, `i love you`, `my boy`, `BLUE`). Dos de ellas (`WHEN I WAS OLDER` y `my boy`) no pertenecen a los 3 álbumes, así que están en `SINGLES` con su propio archivo de audio en `music/singles/`. Para cambiar las favoritas, edita el arreglo `FAVORITES`.

## Nota sobre derechos de autor

Este proyecto no incluye audio ni portadas oficiales de Billie Eilish (no se pueden distribuir). Si vas a subir el repo a GitHub como público, usa únicamente audio que tengas derecho a usar/compartir.
