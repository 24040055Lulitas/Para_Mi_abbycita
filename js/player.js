/* ============================================================
   BE PLAYER — lógica del reproductor
   Depende de ALBUMS / SINGLES / FAVORITES, definidos en data.js
   ============================================================ */

/* ---------------- estado: una sola cola de reproducción,
   la comparten los álbumes, favoritas y el buscador ---------------- */

const state = {
  queue: [],
  queueIndex: -1,
  isPlaying: false,
  isShuffle: false,
  isRepeat: false,
};

/* ---------------- DOM refs ---------------- */

const audioEl = document.getElementById("audioEl");

const searchBtn = document.getElementById("searchBtn");
const searchOverlay = document.getElementById("searchOverlay");
const searchInput = document.getElementById("searchInput");
const searchClose = document.getElementById("searchClose");
const searchResultsEl = document.getElementById("searchResults");

const albumGallery = document.getElementById("albumGallery");
const albumPanelBackdrop = document.getElementById("albumPanelBackdrop");
const albumPanelClose = document.getElementById("albumPanelClose");
const albumPrevBtn = document.getElementById("albumPrevBtn");
const albumNextBtn = document.getElementById("albumNextBtn");
const panelCoverWrap = document.getElementById("panelCoverWrap");
const panelCover = document.getElementById("panelCover");
const panelEyebrow = document.getElementById("panelEyebrow");
const panelTitle = document.getElementById("panelTitle");
const panelTracklist = document.getElementById("panelTracklist");

const lightboxBackdrop = document.getElementById("lightboxBackdrop");
const lightboxImg = document.getElementById("lightboxImg");
const lightboxClose = document.getElementById("lightboxClose");

const singlesOrbBtn = document.getElementById("singlesOrbBtn");
const singlesPanelBackdrop = document.getElementById("singlesPanelBackdrop");
const singlesPanelClose = document.getElementById("singlesPanelClose");
const singlesListEl = document.getElementById("singlesList");

const favoritesListEl = document.getElementById("favoritesList");

const queueBtn = document.getElementById("queueBtn");
const queuePanelBackdrop = document.getElementById("queuePanelBackdrop");
const queuePanelClose = document.getElementById("queuePanelClose");
const queueClearBtn = document.getElementById("queueClearBtn");
const queueListEl = document.getElementById("queueList");

const miniPlayer = document.getElementById("miniPlayer");
const miniCoverWrap = document.getElementById("miniCoverWrap");
const miniCover = document.getElementById("miniCover");
const miniTitle = document.getElementById("miniTitle");
const miniSubtitle = document.getElementById("miniSubtitle");
const assetHint = document.getElementById("assetHint");

const seekBar = document.getElementById("seekBar");
const currentTimeEl = document.getElementById("currentTime");
const durationEl = document.getElementById("duration");
const volumeBar = document.getElementById("volumeBar");

const playBtn = document.getElementById("playBtn");
const playIcon = document.getElementById("playIcon");
const pauseIcon = document.getElementById("pauseIcon");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const shuffleBtn = document.getElementById("shuffleBtn");
const repeatBtn = document.getElementById("repeatBtn");

/* ---------------- "me gusta" (persistido) y cola ---------------- */

const HEART_ICON =
  '<svg viewBox="0 0 24 24"><path d="M12 21s-6.7-4.35-9.33-8.2C1 10.63 1.4 7.4 4 5.8c2.1-1.3 4.6-.7 6 1.1L12 9l2-2.1c1.4-1.8 3.9-2.4 6-1.1 2.6 1.6 3 4.83 1.33 6.99C18.7 16.65 12 21 12 21z"/></svg>';
const QUEUE_ICON =
  '<svg viewBox="0 0 24 24"><path d="M3 6h11M3 12h11M3 18h6M17 13v7M13.5 16.5h7"/></svg>';

const LIKED_KEY = "beplayer-liked-tracks";

function loadLikedFiles() {
  try {
    return new Set(JSON.parse(localStorage.getItem(LIKED_KEY)) || []);
  } catch (e) {
    return new Set();
  }
}

const likedFiles = loadLikedFiles();

function saveLikedFiles() {
  try {
    localStorage.setItem(LIKED_KEY, JSON.stringify([...likedFiles]));
  } catch (e) {
    /* localStorage no disponible (modo privado, etc.) — no pasa nada grave */
  }
}

function toggleLike(file, btn) {
  if (likedFiles.has(file)) likedFiles.delete(file);
  else likedFiles.add(file);
  saveLikedFiles();
  if (btn) btn.classList.toggle("liked", likedFiles.has(file));
  /* las favoritas de Abby son, literalmente, las canciones con corazón */
  renderFavorites();
}

function addToQueue(track) {
  if (state.queue.length === 0) {
    playQueueAt([track], 0, true);
    showToast(`Reproduciendo "${track.title}"`);
    return;
  }
  state.queue = [...state.queue, track];
  showToast(`"${track.title}" se agregó a la cola`);
  if (queuePanelBackdrop.classList.contains("open")) renderQueueList();
}

function actionButtonsHTML(track) {
  const liked = likedFiles.has(track.file) ? " liked" : "";
  return `
    <span class="row-actions">
      <button class="action-btn like-btn${liked}" data-action="like" title="Agregar a favoritas" aria-label="Agregar a favoritas">${HEART_ICON}</button>
      <button class="action-btn queue-btn" data-action="queue" title="Agregar a la cola" aria-label="Agregar a la cola">${QUEUE_ICON}</button>
    </span>
  `;
}

function wireRowActions(row, track) {
  const likeBtn = row.querySelector(".like-btn");
  const queueBtn = row.querySelector(".queue-btn");
  likeBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleLike(track.file, likeBtn);
  });
  queueBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    addToQueue(track);
  });
}

function wireCoverLightbox(row, track) {
  const coverImg = row.querySelector(".favorite-cover img");
  if (!coverImg) return;
  coverImg.addEventListener("click", (e) => {
    e.stopPropagation();
    openLightbox(track.cover, track.title);
  });
}

let toastTimer = null;

function showToast(message) {
  let toast = document.getElementById("toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast";
    toast.className = "toast";
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
}

/* ---------------- helpers de datos ---------------- */

function formatTime(seconds) {
  if (!isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function guessMimeType(path) {
  const ext = path.split(".").pop().toLowerCase();
  if (ext === "jpg" || ext === "jpeg") return "image/jpeg";
  if (ext === "png") return "image/png";
  if (ext === "webp") return "image/webp";
  return "image/jpeg";
}

/* Convierte cualquier canción (de álbum o sencillo) en una referencia
   uniforme que el reproductor puede cargar sin importar su origen. */
function albumTrackRef(albumKey, trackIndex) {
  const album = ALBUMS[albumKey];
  const track = album.tracks[trackIndex];
  return {
    title: track.title,
    file: track.file,
    cover: album.cover,
    subtitle: `${album.name} · ${album.year}`,
    dur: track.dur,
    albumKey,
    trackIndex,
  };
}

/* si algún sencillo no tiene portada propia, usamos una de las que ya
   tenemos en vez de dejar el círculo vacío */
const FALLBACK_COVER = ALBUMS.wwafawdwg.cover;

function singleTrackRef(singleKey) {
  const single = SINGLES[singleKey];
  return {
    title: single.title,
    file: single.file,
    cover: single.cover || FALLBACK_COVER,
    subtitle: single.subtitle,
    dur: single.dur,
    singleKey,
  };
}

function resolveFavorite(entry) {
  return entry.single ? singleTrackRef(entry.single) : albumTrackRef(entry.album, entry.track);
}

const FAVORITE_REFS = FAVORITES.map(resolveFavorite);

/* la primera vez que se abre el sitio, las favoritas elegidas a mano
   en data.js empiezan ya marcadas con corazón */
const LIKED_SEEDED_KEY = "beplayer-liked-seeded";
(function seedDefaultLikes() {
  let alreadySeeded = false;
  try {
    alreadySeeded = !!localStorage.getItem(LIKED_SEEDED_KEY);
  } catch (e) {
    alreadySeeded = false;
  }
  if (alreadySeeded) return;
  FAVORITE_REFS.forEach((track) => likedFiles.add(track.file));
  saveLikedFiles();
  try {
    localStorage.setItem(LIKED_SEEDED_KEY, "1");
  } catch (e) {
    /* localStorage no disponible; se reintentará en la próxima carga */
  }
})();

/* índice plano de TODAS las canciones (álbumes + sencillos), para el buscador */
const SEARCH_INDEX = [
  ...Object.keys(ALBUMS).flatMap((key) =>
    ALBUMS[key].tracks.map((_, i) => albumTrackRef(key, i))
  ),
  ...Object.keys(SINGLES).map((key) => singleTrackRef(key)),
];

/* ---------------- reproducción ---------------- */

function currentTrack() {
  return state.queue[state.queueIndex] || null;
}

function isCurrentFile(file) {
  const track = currentTrack();
  return !!track && track.file === file;
}

function playQueueAt(queue, index, autoplay) {
  state.queue = queue;
  state.queueIndex = index;
  loadCurrentTrack(autoplay);
}

function loadCurrentTrack(autoplay) {
  const track = currentTrack();
  if (!track) return;

  audioEl.src = track.file;
  assetHint.textContent = "";

  miniTitle.textContent = track.title;
  miniSubtitle.textContent = track.subtitle;

  if (track.cover) {
    const img = new Image();
    img.onload = () => (miniCover.src = track.cover);
    img.onerror = () => miniCover.removeAttribute("src");
    img.src = track.cover;
  } else {
    miniCover.removeAttribute("src");
  }

  refreshActiveHighlights();
  updateMediaSessionMetadata(track);

  if (autoplay) {
    audioEl.play().catch(() => {
      /* el navegador bloqueó el autoplay o falta el archivo; onerror lo maneja */
    });
  }
}

function refreshActiveHighlights() {
  const track = currentTrack();
  const file = track ? track.file : null;

  document.querySelectorAll(".track-item[data-file]").forEach((el) => {
    el.classList.toggle("playing", el.dataset.file === file);
  });
  document.querySelectorAll(".favorite-item[data-file]").forEach((el) => {
    el.classList.toggle("playing", el.dataset.file === file);
  });
  updatePanelCoverSpin();
  if (queuePanelBackdrop.classList.contains("open")) renderQueueList();
}

/* la portada del panel solo gira si lo que suena es de ESE álbum,
   y solo mientras esté en modo vinilo (después de haberle hecho clic) */
function isCurrentAlbumTrack() {
  const track = currentTrack();
  return !!(openAlbumKey && track && track.albumKey === openAlbumKey);
}

function updatePanelCoverSpin() {
  if (!panelCoverWrap.classList.contains("vinyl-mode")) return;
  if (isCurrentAlbumTrack() && state.isPlaying) {
    startDiscAutoSpin();
  } else {
    stopDiscAutoSpin();
  }
}

function setPlayingUI(isPlaying) {
  state.isPlaying = isPlaying;
  playIcon.style.display = isPlaying ? "none" : "block";
  pauseIcon.style.display = isPlaying ? "block" : "none";
  playBtn.title = isPlaying ? "Pausar" : "Reproducir";
  miniCoverWrap.classList.toggle("is-playing", isPlaying);
  miniPlayer.classList.toggle("is-playing", isPlaying);
  updatePanelCoverSpin();
  if ("mediaSession" in navigator) {
    navigator.mediaSession.playbackState = isPlaying ? "playing" : "paused";
  }
}

function togglePlay() {
  if (!currentTrack()) return;
  if (audioEl.paused) {
    audioEl.play().catch(() => {});
  } else {
    audioEl.pause();
  }
}

function playNext() {
  if (state.queue.length === 0) return;
  let nextIndex;
  if (state.isShuffle) {
    do {
      nextIndex = Math.floor(Math.random() * state.queue.length);
    } while (nextIndex === state.queueIndex && state.queue.length > 1);
  } else {
    nextIndex = (state.queueIndex + 1) % state.queue.length;
  }
  playQueueAt(state.queue, nextIndex, true);
}

function playPrev() {
  if (state.queue.length === 0) return;
  if (audioEl.currentTime > 3) {
    audioEl.currentTime = 0;
    return;
  }
  const prevIndex = (state.queueIndex - 1 + state.queue.length) % state.queue.length;
  playQueueAt(state.queue, prevIndex, true);
}

/* ---------------- integración con el sistema (Android / iOS / escritorio) ---------------- */

function updateMediaSessionMetadata(track) {
  if (!("mediaSession" in navigator)) return;
  navigator.mediaSession.metadata = new MediaMetadata({
    title: track.title,
    artist: "Billie Eilish",
    album: track.subtitle,
    artwork: track.cover
      ? [{ src: track.cover, sizes: "512x512", type: guessMimeType(track.cover) }]
      : [],
  });
  /* iOS a veces "olvida" que anuló los saltos de 10s al cambiar de
     metadata; se vuelve a afirmar en cada canción por seguridad */
  setupMediaSessionHandlers();
}

function setupMediaSessionHandlers() {
  if (!("mediaSession" in navigator)) return;
  navigator.mediaSession.setActionHandler("play", () => audioEl.play().catch(() => {}));
  navigator.mediaSession.setActionHandler("pause", () => audioEl.pause());
  navigator.mediaSession.setActionHandler("previoustrack", playPrev);
  navigator.mediaSession.setActionHandler("nexttrack", playNext);
  navigator.mediaSession.setActionHandler("seekto", (details) => {
    if (details.fastSeek && "fastSeek" in audioEl) {
      audioEl.fastSeek(details.seekTime);
      return;
    }
    if (details.seekTime !== undefined) audioEl.currentTime = details.seekTime;
  });
  /* anula los saltos de 10s de iOS/Android para que el bloqueo de
     pantalla muestre siempre anterior/siguiente en vez de +10/-10 */
  try {
    navigator.mediaSession.setActionHandler("seekbackward", null);
    navigator.mediaSession.setActionHandler("seekforward", null);
  } catch (e) {
    /* algunos navegadores no reconocen estas acciones; se ignora */
  }
}

/* ---------------- fondo rotativo de "lo que significa para ti" ---------------- */

const MEANING_BACKGROUNDS = [
  "../images/backgrounds/meaning/1.jpg",
  "../images/backgrounds/meaning/2.jpg",
  "../images/backgrounds/meaning/3.jpg",
  "../images/backgrounds/meaning/4.jpg",
];

function setupMeaningBackgroundRotation() {
  const layerA = document.getElementById("meaningBgA");
  const layerB = document.getElementById("meaningBgB");
  if (!layerA || !layerB || MEANING_BACKGROUNDS.length === 0) return;

  let index = 0;
  let showingA = true;
  layerA.style.backgroundImage = `url("${MEANING_BACKGROUNDS[0]}")`;
  layerA.classList.add("is-visible");

  if (MEANING_BACKGROUNDS.length < 2) return;

  setInterval(() => {
    index = (index + 1) % MEANING_BACKGROUNDS.length;
    const next = showingA ? layerB : layerA;
    const current = showingA ? layerA : layerB;
    next.style.backgroundImage = `url("${MEANING_BACKGROUNDS[index]}")`;
    next.classList.add("is-visible");
    current.classList.remove("is-visible");
    showingA = !showingA;
  }, 25000);
}

/* ---------------- visor de imagen (lightbox) ---------------- */

function openLightbox(src, alt) {
  if (!src) return;
  lightboxImg.src = src;
  lightboxImg.alt = alt || "";
  lightboxBackdrop.classList.add("open");
}

function closeLightbox() {
  lightboxBackdrop.classList.remove("open");
}

lightboxClose.addEventListener("click", closeLightbox);
lightboxBackdrop.addEventListener("click", (e) => {
  if (e.target === lightboxBackdrop) closeLightbox();
});

/* ---------------- galería de álbumes + panel de canciones ---------------- */

function renderAlbumGallery() {
  albumGallery.innerHTML = "";
  Object.entries(ALBUMS).forEach(([key, album]) => {
    const card = document.createElement("button");
    card.className = "album-card";
    card.innerHTML = `
      <div class="album-card-cover"><img src="${album.cover}" alt="${album.name}" /></div>
      <p class="album-card-name">${album.name}</p>
      <p class="album-card-meta">${album.year} · ${album.tracks.length} canciones</p>
    `;
    card.addEventListener("click", () => openAlbumPanel(key));
    albumGallery.appendChild(card);
  });
}

function renderPanelTracklist(albumKey) {
  const album = ALBUMS[albumKey];
  panelTracklist.innerHTML = "";

  album.tracks.forEach((track, i) => {
    const ref = albumTrackRef(albumKey, i);
    const li = document.createElement("li");
    li.className = "track-item";
    li.dataset.file = track.file;
    li.innerHTML = `
      <span class="track-num">${i + 1}</span>
      <span class="track-name">${track.title}</span>
      <span class="track-duration">${formatTime(track.dur)}</span>
      ${actionButtonsHTML(ref)}
    `;
    li.addEventListener("click", () => {
      const queue = album.tracks.map((_, idx) => albumTrackRef(albumKey, idx));
      playQueueAt(queue, i, true);
      /* el panel se queda abierto para que se vea girar el vinilo */
    });
    wireRowActions(li, ref);
    panelTracklist.appendChild(li);
  });

  refreshActiveHighlights();
}

let openAlbumKey = null;

function openAlbumPanel(albumKey) {
  const album = ALBUMS[albumKey];
  openAlbumKey = albumKey;
  panelCover.src = album.cover;
  panelEyebrow.textContent = `${album.year} · ${album.tracks.length} canciones`;
  panelTitle.textContent = album.name;
  renderPanelTracklist(albumKey);
  resetDiscToCover();
  albumPanelBackdrop.classList.add("open");
}

function closeAlbumPanel() {
  albumPanelBackdrop.classList.remove("open");
  openAlbumKey = null;
  resetDiscToCover();
}

albumPanelClose.addEventListener("click", closeAlbumPanel);

/* ---------------- flechas para saltar de álbum en álbum sin cerrar el panel ---------------- */

const ALBUM_KEYS = Object.keys(ALBUMS);

function goToAdjacentAlbum(step) {
  if (!openAlbumKey) return;
  const idx = ALBUM_KEYS.indexOf(openAlbumKey);
  const nextIdx = (idx + step + ALBUM_KEYS.length) % ALBUM_KEYS.length;
  openAlbumPanel(ALBUM_KEYS[nextIdx]);
}

albumPrevBtn.addEventListener("click", () => goToAdjacentAlbum(-1));
albumNextBtn.addEventListener("click", () => goToAdjacentAlbum(1));

/* ---------------- panel de sencillos ---------------- */

const SINGLE_REFS = Object.keys(SINGLES).map((key) => singleTrackRef(key));

function renderSinglesPanel() {
  singlesListEl.innerHTML = "";

  SINGLE_REFS.forEach((track, i) => {
    const li = document.createElement("li");
    li.className = "favorite-item";
    li.dataset.file = track.file;
    li.innerHTML = `
      <span class="favorite-cover">${track.cover ? `<img src="${track.cover}" alt="" />` : ""}</span>
      <span class="favorite-info">
        <span class="favorite-title">${track.title}</span>
        <span class="favorite-subtitle">${track.subtitle}</span>
      </span>
      <span class="track-duration">${formatTime(track.dur)}</span>
      ${actionButtonsHTML(track)}
    `;
    li.addEventListener("click", () => playQueueAt(SINGLE_REFS, i, true));
    wireRowActions(li, track);
    wireCoverLightbox(li, track);
    singlesListEl.appendChild(li);
  });

  refreshActiveHighlights();
}

function openSinglesPanel() {
  renderSinglesPanel();
  singlesPanelBackdrop.classList.add("open");
}

function closeSinglesPanel() {
  singlesPanelBackdrop.classList.remove("open");
}

singlesOrbBtn.addEventListener("click", openSinglesPanel);
singlesPanelClose.addEventListener("click", closeSinglesPanel);
singlesPanelBackdrop.addEventListener("click", (e) => {
  if (e.target === singlesPanelBackdrop) closeSinglesPanel();
});

/* ---------------- portada del panel: tocadiscos interactivo ----------------
   Un clic la convierte en vinilo (y otro clic la regresa a portada normal).
   Ya en modo vinilo, arrastrarla la gira a mano — como un DJ, hacia
   adelante adelanta la canción y hacia atrás la rebobina. */

const SCRATCH_SECONDS_PER_DEGREE = 0.045;

let discAngle = 0;
let discSpinRAF = null;
let discDrag = null;

function setDiscTransform() {
  panelCoverWrap.style.transform = `rotate(${discAngle}deg)`;
}

function startDiscAutoSpin() {
  if (discSpinRAF) return;
  const step = () => {
    discAngle = (discAngle + 0.7) % 360;
    setDiscTransform();
    discSpinRAF = requestAnimationFrame(step);
  };
  discSpinRAF = requestAnimationFrame(step);
}

function stopDiscAutoSpin() {
  if (discSpinRAF) cancelAnimationFrame(discSpinRAF);
  discSpinRAF = null;
}

function resetDiscToCover() {
  stopDiscAutoSpin();
  discAngle = 0;
  panelCoverWrap.classList.remove("vinyl-mode", "dragging");
  panelCoverWrap.style.transform = "";
}

function angleFromPointer(e) {
  const rect = panelCoverWrap.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  return Math.atan2(e.clientY - cy, e.clientX - cx) * (180 / Math.PI);
}

panelCoverWrap.addEventListener("pointerdown", (e) => {
  panelCoverWrap.setPointerCapture(e.pointerId);
  discDrag = {
    startX: e.clientX,
    startY: e.clientY,
    moved: false,
    prevAngle: angleFromPointer(e),
  };
  if (panelCoverWrap.classList.contains("vinyl-mode")) {
    stopDiscAutoSpin();
    panelCoverWrap.classList.add("dragging");
  }
});

panelCoverWrap.addEventListener("pointermove", (e) => {
  if (!discDrag) return;

  if (!discDrag.moved) {
    const dx = e.clientX - discDrag.startX;
    const dy = e.clientY - discDrag.startY;
    if (Math.hypot(dx, dy) > 4) discDrag.moved = true;
  }

  if (!panelCoverWrap.classList.contains("vinyl-mode")) return;

  const angleNow = angleFromPointer(e);
  let delta = angleNow - discDrag.prevAngle;
  if (delta > 180) delta -= 360;
  if (delta < -180) delta += 360;
  discDrag.prevAngle = angleNow;

  discAngle = (discAngle + delta + 360) % 360;
  setDiscTransform();

  if (isCurrentAlbumTrack() && isFinite(audioEl.duration)) {
    const next = audioEl.currentTime + delta * SCRATCH_SECONDS_PER_DEGREE;
    audioEl.currentTime = Math.min(Math.max(next, 0), audioEl.duration);
  }
});

function endDiscDrag() {
  if (!discDrag) return;
  const wasVinyl = panelCoverWrap.classList.contains("vinyl-mode");
  const moved = discDrag.moved;
  discDrag = null;
  panelCoverWrap.classList.remove("dragging");

  if (moved) {
    if (wasVinyl && isCurrentAlbumTrack() && state.isPlaying) startDiscAutoSpin();
    return;
  }

  /* fue un clic simple, sin arrastre: alterna entre portada y vinilo */
  if (wasVinyl) {
    resetDiscToCover();
  } else {
    panelCoverWrap.classList.add("vinyl-mode");
    discAngle = 0;
    setDiscTransform();
    if (isCurrentAlbumTrack() && state.isPlaying) startDiscAutoSpin();
  }
}

panelCoverWrap.addEventListener("pointerup", endDiscDrag);
panelCoverWrap.addEventListener("pointercancel", endDiscDrag);
albumPanelBackdrop.addEventListener("click", (e) => {
  if (e.target === albumPanelBackdrop) closeAlbumPanel();
});

/* ---------------- cola de reproducción ---------------- */

const IDLE_COVER = "../images/backgrounds/wwafawdwg/3.jpeg";

function clearNowPlayingUI() {
  miniTitle.textContent = "Elige una canción";
  miniSubtitle.textContent = "para Abby";
  miniCover.src = IDLE_COVER;
  audioEl.pause();
  audioEl.removeAttribute("src");
  setPlayingUI(false);
}

function renderQueueList() {
  queueListEl.innerHTML = "";

  if (state.queue.length === 0) {
    queueListEl.innerHTML = `<li class="search-empty">La cola está vacía — elige una canción para empezar.</li>`;
    return;
  }

  state.queue.forEach((track, i) => {
    const li = document.createElement("li");
    li.className = "track-item" + (i === state.queueIndex ? " playing" : "");
    li.innerHTML = `
      <span class="track-num">${i + 1}</span>
      <span class="track-name">${track.title}</span>
      <span class="track-duration">${formatTime(track.dur)}</span>
      <button class="action-btn" data-action="remove" title="Quitar de la cola" aria-label="Quitar de la cola">
        <svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>
      </button>
    `;
    li.addEventListener("click", () => playQueueAt(state.queue, i, true));
    li.querySelector('[data-action="remove"]').addEventListener("click", (e) => {
      e.stopPropagation();
      removeFromQueue(i);
    });
    queueListEl.appendChild(li);
  });
}

function removeFromQueue(index) {
  const wasCurrent = index === state.queueIndex;
  state.queue = state.queue.filter((_, i) => i !== index);

  if (state.queue.length === 0) {
    state.queueIndex = -1;
    clearNowPlayingUI();
  } else if (wasCurrent) {
    state.queueIndex = Math.min(state.queueIndex, state.queue.length - 1);
    loadCurrentTrack(state.isPlaying);
  } else if (index < state.queueIndex) {
    state.queueIndex -= 1;
  }

  refreshActiveHighlights();
  renderQueueList();
}

function openQueuePanel() {
  renderQueueList();
  queuePanelBackdrop.classList.add("open");
}

function closeQueuePanel() {
  queuePanelBackdrop.classList.remove("open");
}

queueBtn.addEventListener("click", openQueuePanel);
queuePanelClose.addEventListener("click", closeQueuePanel);
queuePanelBackdrop.addEventListener("click", (e) => {
  if (e.target === queuePanelBackdrop) closeQueuePanel();
});

queueClearBtn.addEventListener("click", () => {
  state.queue = [];
  state.queueIndex = -1;
  clearNowPlayingUI();
  refreshActiveHighlights();
  renderQueueList();
});

/* ---------------- favoritas ---------------- */

/* referencias completas de todo lo que tiene corazón, en el orden
   en que se fue marcando (los sembrados por defecto van primero) */
function likedTrackRefs() {
  return [...likedFiles]
    .map((file) => SEARCH_INDEX.find((t) => t.file === file))
    .filter(Boolean);
}

function renderFavorites() {
  favoritesListEl.innerHTML = "";
  const tracks = likedTrackRefs();

  if (tracks.length === 0) {
    favoritesListEl.innerHTML =
      '<li class="search-empty">Toca el corazón de una canción para agregarla aquí.</li>';
    return;
  }

  tracks.forEach((track, i) => {
    const li = document.createElement("li");
    li.className = "favorite-item";
    li.dataset.file = track.file;
    li.innerHTML = `
      <span class="favorite-num">${i + 1}</span>
      <span class="favorite-cover">${track.cover ? `<img src="${track.cover}" alt="" />` : ""}</span>
      <span class="favorite-info">
        <span class="favorite-title">${track.title}</span>
        <span class="favorite-subtitle">${track.subtitle}</span>
      </span>
      <span class="track-duration">${formatTime(track.dur)}</span>
      ${actionButtonsHTML(track)}
    `;
    li.addEventListener("click", () => playQueueAt(tracks, i, true));
    wireRowActions(li, track);
    wireCoverLightbox(li, track);
    favoritesListEl.appendChild(li);
  });

  refreshActiveHighlights();
}

/* ---------------- buscador ---------------- */

function renderSearchResults(list) {
  searchResultsEl.innerHTML = "";

  if (searchInput.value.trim() && list.length === 0) {
    searchResultsEl.innerHTML = `<li class="search-empty">Sin resultados para "${searchInput.value}"</li>`;
    return;
  }

  list.forEach((track, i) => {
    const li = document.createElement("li");
    li.className = "favorite-item";
    li.dataset.file = track.file;
    li.innerHTML = `
      <span class="favorite-cover">${track.cover ? `<img src="${track.cover}" alt="" />` : ""}</span>
      <span class="favorite-info">
        <span class="favorite-title">${track.title}</span>
        <span class="favorite-subtitle">${track.subtitle}</span>
      </span>
      <span class="track-duration">${formatTime(track.dur)}</span>
      ${actionButtonsHTML(track)}
    `;
    li.addEventListener("click", () => {
      playQueueAt(list, i, true);
      closeSearch();
    });
    wireRowActions(li, track);
    wireCoverLightbox(li, track);
    searchResultsEl.appendChild(li);
  });

  refreshActiveHighlights();
}

function filterSearch() {
  const q = searchInput.value.trim().toLowerCase();
  if (!q) {
    renderSearchResults(SEARCH_INDEX);
    return;
  }
  const results = SEARCH_INDEX.filter(
    (t) => t.title.toLowerCase().includes(q) || t.subtitle.toLowerCase().includes(q)
  );
  renderSearchResults(results);
}

function openSearch() {
  searchOverlay.classList.add("open");
  searchInput.value = "";
  filterSearch();
  setTimeout(() => searchInput.focus(), 50);
}

function closeSearch() {
  searchOverlay.classList.remove("open");
}

searchBtn.addEventListener("click", openSearch);
searchClose.addEventListener("click", closeSearch);
searchInput.addEventListener("input", filterSearch);
searchOverlay.addEventListener("click", (e) => {
  if (e.target === searchOverlay) closeSearch();
});

document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  if (lightboxBackdrop.classList.contains("open")) closeLightbox();
  else if (searchOverlay.classList.contains("open")) closeSearch();
  else if (albumPanelBackdrop.classList.contains("open")) closeAlbumPanel();
  else if (queuePanelBackdrop.classList.contains("open")) closeQueuePanel();
  else if (singlesPanelBackdrop.classList.contains("open")) closeSinglesPanel();
});

const dedicationPhotoImg = document.querySelector(".dedication-photo img");
if (dedicationPhotoImg) {
  dedicationPhotoImg.addEventListener("click", () =>
    openLightbox(dedicationPhotoImg.src, dedicationPhotoImg.alt)
  );
}

const chatStickerImg = document.querySelector(".chat-sticker");
if (chatStickerImg) {
  chatStickerImg.addEventListener("click", () => openLightbox(chatStickerImg.src, ""));
}

/* ---------------- controles del mini-reproductor ---------------- */

playBtn.addEventListener("click", togglePlay);
nextBtn.addEventListener("click", playNext);
prevBtn.addEventListener("click", playPrev);

miniCoverWrap.addEventListener("click", () => {
  if (miniCover.getAttribute("src")) openLightbox(miniCover.src, miniTitle.textContent);
});

shuffleBtn.addEventListener("click", () => {
  state.isShuffle = !state.isShuffle;
  shuffleBtn.classList.toggle("active", state.isShuffle);
});

repeatBtn.addEventListener("click", () => {
  state.isRepeat = !state.isRepeat;
  repeatBtn.classList.toggle("active", state.isRepeat);
});

audioEl.addEventListener("play", () => setPlayingUI(true));
audioEl.addEventListener("pause", () => setPlayingUI(false));

audioEl.addEventListener("timeupdate", () => {
  if (!audioEl.duration) return;
  const pct = (audioEl.currentTime / audioEl.duration) * 100;
  seekBar.value = pct;
  seekBar.style.background = `linear-gradient(90deg, var(--color-blue), var(--color-pink)) 0/${pct}% 100% no-repeat, rgba(255,255,255,0.15)`;
  currentTimeEl.textContent = formatTime(audioEl.currentTime);

  if ("mediaSession" in navigator && "setPositionState" in navigator.mediaSession) {
    try {
      navigator.mediaSession.setPositionState({
        duration: audioEl.duration,
        playbackRate: audioEl.playbackRate,
        position: audioEl.currentTime,
      });
    } catch (e) {
      /* algunos navegadores lanzan si la duración todavía no es válida */
    }
  }
});

audioEl.addEventListener("loadedmetadata", () => {
  durationEl.textContent = formatTime(audioEl.duration);
});

audioEl.addEventListener("ended", () => {
  if (state.isRepeat) {
    audioEl.currentTime = 0;
    audioEl.play();
  } else {
    playNext();
  }
});

audioEl.addEventListener("error", () => {
  const track = currentTrack();
  if (!track) return;
  assetHint.textContent = `No se encontró el archivo: ${track.file.replace("../", "")}`;
  setPlayingUI(false);
});

seekBar.addEventListener("input", () => {
  if (!audioEl.duration) return;
  audioEl.currentTime = (seekBar.value / 100) * audioEl.duration;
});

volumeBar.addEventListener("input", () => {
  audioEl.volume = volumeBar.value;
  volumeBar.style.background = `linear-gradient(90deg, var(--color-green), var(--color-red)) 0/${volumeBar.value * 100}% 100% no-repeat, rgba(255,255,255,0.15)`;
});

/* ---------------- animación de entrada al hacer scroll ---------------- */

function setupScrollReveal(selector, staggerMs) {
  const els = document.querySelectorAll(selector);
  if (!els.length) return;

  if (!("IntersectionObserver" in window)) {
    els.forEach((el) => el.classList.add("in-view"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, i) => {
        if (!entry.isIntersecting) return;
        const delay = staggerMs ? i * staggerMs : 0;
        setTimeout(() => entry.target.classList.add("in-view"), delay);
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.15 }
  );

  els.forEach((el) => {
    el.classList.add("reveal");
    observer.observe(el);
  });
}

/* ---------------- init ---------------- */

audioEl.volume = Number(volumeBar.value);
setupMediaSessionHandlers();
renderAlbumGallery();
renderFavorites();
setupMeaningBackgroundRotation();
setupScrollReveal(".album-card", 90);
setupScrollReveal(".singles-orb, .singles-orb-label", 100);
setupScrollReveal(".favorite-item", 70);
setupScrollReveal(".dedication-photo, .dedication-text", 120);
setupScrollReveal(".chat-bubble", 180);
setupScrollReveal(".closing-quote, .closing-credit, .closing-note", 100);
