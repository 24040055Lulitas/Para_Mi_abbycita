/* ============================================================
   secreT — galería de Tanjiro + música de fondo.
   Página aparte del reproductor principal, sin cola ni
   MediaSession: una sola canción en loop, con su propio control
   de reproducción y volumen.
   ============================================================ */
(function () {
  "use strict";

  const TANJIRO_IMAGES = Array.from(
    { length: 9 },
    (_, i) => `../images/secret-tanjiro/tanj${i + 1}.png`
  );

  const AMBIENT_TRACK = "../music/secreto/kamado-tanjiro-no-uta.mp3";

  /* ---------------- galería tipo polaroid ---------------- */

  const galleryEl = document.getElementById("secretoGallery");

  const FALLBACK_ACCENTS = [
    [63, 169, 255], // azul
    [255, 94, 168], // rosa
    [61, 220, 132], // verde
    [255, 59, 59], // rojo
  ];

  function probeImage(src) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = src;
    });
  }

  /* color promedio de la imagen, para teñir la "cinta" de la polaroid;
     si el navegador bloquea la lectura del canvas (típico al abrir el
     sitio como archivo local), se usa un color de la paleta como respaldo */
  function averageColor(img) {
    try {
      const size = 16;
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, size, size);
      const data = ctx.getImageData(0, 0, size, size).data;
      let r = 0, g = 0, b = 0, count = 0;
      for (let i = 0; i < data.length; i += 4) {
        if (data[i + 3] < 180) continue;
        r += data[i];
        g += data[i + 1];
        b += data[i + 2];
        count++;
      }
      if (count === 0) return null;
      return [Math.round(r / count), Math.round(g / count), Math.round(b / count)];
    } catch (e) {
      return null;
    }
  }

  async function renderGallery() {
    const loaded = await Promise.all(
      TANJIRO_IMAGES.map((src) => probeImage(src).then((img) => ({ src, img })))
    );
    const available = loaded.filter((entry) => entry.img);

    if (available.length === 0) {
      galleryEl.innerHTML = '<p class="secreto-empty">Todavía no hay imágenes aquí — pronto habrá más.</p>';
      return;
    }

    available.forEach(({ src, img: loadedImg }, i) => {
      const tilt = (i % 2 === 0 ? -1 : 1) * (3 + (i % 3) * 2);
      const [fr, fg, fb] = FALLBACK_ACCENTS[i % FALLBACK_ACCENTS.length];

      const tile = document.createElement("div");
      tile.className = "polaroid";
      tile.style.setProperty("--tilt", `${tilt}deg`);
      tile.style.setProperty("--accent-r", fr);
      tile.style.setProperty("--accent-g", fg);
      tile.style.setProperty("--accent-b", fb);
      tile.style.animationDelay = `${i * 90}ms`;

      const photo = document.createElement("div");
      photo.className = "polaroid-photo";
      const img = document.createElement("img");
      img.src = src;
      img.alt = `Tanjiro ${i + 1}`;
      img.loading = "lazy";
      photo.appendChild(img);

      const caption = document.createElement("p");
      caption.className = "polaroid-caption";
      caption.textContent = "Tanjiro";

      tile.appendChild(photo);
      tile.appendChild(caption);
      tile.addEventListener("click", () => openLightbox(src, img.alt));
      galleryEl.appendChild(tile);

      const rgb = averageColor(loadedImg);
      if (rgb) {
        tile.style.setProperty("--accent-r", rgb[0]);
        tile.style.setProperty("--accent-g", rgb[1]);
        tile.style.setProperty("--accent-b", rgb[2]);
      }
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
  const ambientVolume = document.getElementById("ambientVolume");

  ambientAudio.loop = true;
  ambientAudio.volume = Number(ambientVolume.value);
  ambientAudio.src = AMBIENT_TRACK;

  function setAmbientUI(playing) {
    ambientBtn.classList.toggle("is-playing", playing);
    ambientPlayIcon.style.display = playing ? "none" : "";
    ambientPauseIcon.style.display = playing ? "" : "none";
  }

  ambientAudio.addEventListener("play", () => setAmbientUI(true));
  ambientAudio.addEventListener("pause", () => setAmbientUI(false));

  ambientBtn.addEventListener("click", () => {
    if (ambientAudio.paused) ambientAudio.play().catch(() => {});
    else ambientAudio.pause();
  });

  ambientVolume.addEventListener("input", () => {
    ambientAudio.volume = Number(ambientVolume.value);
  });

  ambientAudio.play().catch(() => {
    /* el navegador bloqueó el autoplay sin interacción previa;
       el botón flotante sigue disponible para iniciarla a mano */
  });

  /* ---------------- init ---------------- */

  renderGallery();
})();
