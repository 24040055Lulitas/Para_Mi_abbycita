/* ============================================================
   PARTICLES.JS — partículas flotantes decorativas
   ============================================================ */
(function () {
  "use strict";

  const container = document.getElementById("particles");
  if (!container) return;

  const PARTICLE_COUNT = 26;
  const COLORS = ["#3fa9ff", "#ff5ea8", "#3ddc84", "#ff3b3b"];

  function randomBetween(a, b) {
    return a + Math.random() * (b - a);
  }

  function createParticle() {
    const el = document.createElement("div");
    el.className = "particle";

    const size = randomBetween(2, 5);
    const left = randomBetween(0, 100);
    const duration = randomBetween(14, 30);
    const delay = randomBetween(0, 22);
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];

    el.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      left: ${left}%;
      background: ${color};
      animation-duration: ${duration}s;
      animation-delay: ${delay}s;
      box-shadow: 0 0 ${size * 2.5}px ${color};
    `;

    return el;
  }

  const fragment = document.createDocumentFragment();
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    fragment.appendChild(createParticle());
  }
  container.appendChild(fragment);
})();
