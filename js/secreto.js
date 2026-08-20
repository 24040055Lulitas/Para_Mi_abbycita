/* ============================================================
   secreT — galería de Tanjiro + música de fondo.
   Página aparte del reproductor principal, sin cola ni
   MediaSession: solo un par de canciones sonando de fondo.
   ============================================================ */
(function () {
  "use strict";

  const TANJIRO_IMAGES = Array.from(
    { length: 10 },
    (_, i) => `../images/secret-tanjiro/tanj${i + 1}.png`
  );

  const AMBIENT_TRACKS = [
    "../music/wwafawdwg/11-ilomilo.mp3",
    "../music/hthe/08-halleys-comet.mp3",
    "../music/hthe/04-my-future.mp3",
    "../music/hmhas/05-wildflower.mp3",
  ];

  /* ---------------- galería ---------------- */

  const galleryEl = document.getElementById("secretoGallery");

  function probeImage(src) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = src;
    });
  }

  async function renderGallery() {
    const checks = await Promise.all(
      TANJIRO_IMAGES.map((src) => probeImage(src).then((ok) => ({ src, ok })))
    );
    const available = checks.filter((c) => c.ok);

    if (available.length === 0) {
      galleryEl.innerHTML = '<p class="secreto-empty">Todavía no hay imágenes aquí — pronto habrá más.</p>';
      return;
    }

    available.forEach(({ src }, i) => {
      const tile = document.createElement("div");
      tile.className = "secreto-tile";
      tile.style.animationDelay = `${i * 90}ms`;

      const img = document.createElement("img");
      img.src = src;
      img.alt = `Tanjiro ${i + 1}`;
      img.loading = "lazy";
      tile.appendChild(img);

      tile.addEventListener("click", () => openLightbox(src, img.alt));
      galleryEl.appendChild(tile);
    });
  }

  /* ---------------- visor de imagen ---------------- */

  const lightboxBackdrop = document.getElementById("lightboxBackdrop");
  const lightboxImg = document.getElementById("lightboxImg");
  const lightboxClose = document.getElementById("lightboxClose");

  function openLightbox(src, alt) {
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
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && lightboxBackdrop.classList.contains("open")) closeLightbox();
  });

  /* ---------------- música de fondo ---------------- */

  const ambientAudio = document.getElementById("ambientAudio");
  const ambientBtn = document.getElementById("ambientBtn");
  const ambientPlayIcon = document.getElementById("ambientPlayIcon");
  const ambientPauseIcon = document.getElementById("ambientPauseIcon");

  let ambientIndex = Math.floor(Math.random() * AMBIENT_TRACKS.length);
  ambientAudio.volume = 0.4;

  function loadAmbientTrack() {
    ambientAudio.src = AMBIENT_TRACKS[ambientIndex];
  }

  function playNextAmbient() {
    ambientIndex = (ambientIndex + 1) % AMBIENT_TRACKS.length;
    loadAmbientTrack();
    ambientAudio.play().catch(() => {});
  }

  function setAmbientUI(playing) {
    ambientBtn.classList.toggle("is-playing", playing);
    ambientPlayIcon.style.display = playing ? "none" : "";
    ambientPauseIcon.style.display = playing ? "" : "none";
  }

  ambientAudio.addEventListener("ended", playNextAmbient);
  ambientAudio.addEventListener("play", () => setAmbientUI(true));
  ambientAudio.addEventListener("pause", () => setAmbientUI(false));

  ambientBtn.addEventListener("click", () => {
    if (!ambientAudio.src) loadAmbientTrack();
    if (ambientAudio.paused) ambientAudio.play().catch(() => {});
    else ambientAudio.pause();
  });

  loadAmbientTrack();
  ambientAudio.play().catch(() => {
    /* el navegador bloqueó el autoplay sin interacción previa;
       el botón flotante sigue disponible para iniciarla a mano */
  });

  /* ---------------- init ---------------- */

  renderGallery();
})();
