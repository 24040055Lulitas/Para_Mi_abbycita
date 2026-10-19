import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Reveal from '../../components/Reveal';
import { ENMU, LOWER_MOONS, TANJIRO_PHOTOS, UPPER_MOONS, VILLAGERS } from '../../data/tanjiro';
import './SlashGame.css';

/* =========================================================
   "Corte de demonios": minijuego tipo Fruit Ninja con las caras
   de los demonios. En modo difícil salen las Lunas Superiores,
   una por una, y hay que cortarlas muchas veces.
   ========================================================= */

const TAU = Math.PI * 2;
/* cuánto dura visible la estela de la espada, en ms */
const BLADE_LIFE = 160;
/* tiempo mínimo entre dos golpes a una Luna Superior, en ms */
const BOSS_HIT_GAP = 110;

/* cada modo ajusta la partida:
   speed      → qué tan rápido caen los demonios
   spawn      → multiplica el tiempo entre oleadas (menos = más seguido)
   villagers  → probabilidad extra de que salgan aldeanos
   timeItems  → multiplica cuántos relojes de arena salen
   bossHp / bossTime / bossSpeed → vida, segundos antes de escapar y
                velocidad de las Lunas Superiores
   firstBoss / bossGap → segundos hasta la primera y entre una y otra */
const BASE = {
  bosses: false,
  speed: 1,
  spawn: 1,
  villagers: 0,
  timeItems: 1,
  bossHp: 1,
  bossTime: 1,
  bossSpeed: 1,
  firstBoss: 5,
  bossGap: 3,
};

const MODES = {
  normal: {
    ...BASE,
    id: 'normal',
    label: 'Normal',
    seconds: 45,
    level: 1,
    hint: 'Lunas Inferiores',
    bestKey: 'abby-tanjiro-slash-best',
  },
  hard: {
    ...BASE,
    id: 'hard',
    label: 'Difícil',
    seconds: 90,
    level: 2,
    hint: 'Lunas Superiores, una por una',
    bestKey: 'abby-tanjiro-slash-hard-best',
    bosses: true,
  },
  pillar: {
    ...BASE,
    id: 'pillar',
    label: 'Pilar',
    seconds: 60,
    level: 3,
    hint: 'más rápido, lunas más duras',
    bestKey: 'abby-tanjiro-slash-pillar-best',
    bosses: true,
    speed: 1.2,
    spawn: 0.8,
    villagers: 0.06,
    timeItems: 0.8,
    bossHp: 1.15,
    bossTime: 0.75,
    bossSpeed: 1.2,
    firstBoss: 3,
    bossGap: 1.6,
  },
  castle: {
    ...BASE,
    id: 'castle',
    label: 'Castillo Infinito',
    seconds: 30,
    level: 4,
    hint: '30 s, sin respiro',
    bestKey: 'abby-tanjiro-slash-castle-best',
    bosses: true,
    speed: 1.4,
    spawn: 0.65,
    villagers: 0.12,
    timeItems: 0.5,
    bossHp: 1.25,
    bossTime: 0.6,
    bossSpeed: 1.45,
    firstBoss: 1.2,
    bossGap: 0.8,
  },
};
const MODE_LIST = Object.values(MODES);

const RING = {
  oni: '#ff5468',
  enmu: '#ffc14d',
  villager: '#2fbf7a',
  time: '#7fd6ff',
  boss: '#ffc14d',
};

/* las Lunas Superiores que salen en orden (Gyutaro aparece al vencer a Daki) */
const BOSS_ORDER = UPPER_MOONS.map((_, i) => i).filter((i) => !UPPER_MOONS[i].phase);
const BOSS_TOTAL = UPPER_MOONS.length;

function loadBest(key) {
  try {
    const v = Number(localStorage.getItem(key));
    return Number.isFinite(v) && v > 0 ? v : null;
  } catch {
    return null;
  }
}

function saveBest(key, value) {
  try {
    localStorage.setItem(key, String(value));
  } catch {
    /* almacenamiento no disponible, no pasa nada */
  }
}

function resultMessage(mode, score, defeated) {
  if (mode.id === 'castle') {
    if (defeated >= BOSS_TOTAL) return 'Saliste viva del Castillo Infinito con todas las Lunas vencidas. Leyenda.';
    if (defeated >= 3) return 'En 30 segundos y en el Castillo Infinito. Eso ya es de Pilar.';
    if (defeated >= 1) return 'Sobreviviste al Castillo Infinito y todavía cortaste Lunas. Increíble.';
    return 'El Castillo Infinito no perdona. Ni Tanjiro lo logró a la primera. ¿Otra?';
  }
  if (mode.bosses) {
    if (defeated >= BOSS_TOTAL) return 'Derrotaste a todas las Lunas Superiores. Ni Muzan se atrevería contigo.';
    if (defeated >= 4) return 'Varias Lunas Superiores cayeron por tu espada. Nivel Pilar, sin duda.';
    if (defeated >= 1) return 'Le ganaste a una Luna Superior. Eso no lo hace cualquiera.';
    return 'Las Lunas Superiores son durísimas; hasta los Pilares entrenan años. ¿Otra?';
  }
  if (score >= 120) return 'Nivel Pilar. Tanjiro estaría orgullosísimo de ti.';
  if (score >= 70) return 'Cazadora de demonios oficial. Nada se te escapa.';
  if (score >= 35) return 'Buenos cortes. Un poco más de entrenamiento y llegas a Pilar.';
  return 'Hasta Tanjiro empezó entrenando contra una roca. ¿Otra ronda?';
}

/* las caras se cargan una sola vez y se reutilizan */
const imageCache = new Map();
function getImage(src) {
  let im = imageCache.get(src);
  if (!im) {
    im = new Image();
    im.src = src;
    imageCache.set(src, im);
  }
  return im;
}

const pick = (list) => list[Math.floor(Math.random() * list.length)];

/* ---------- dibujos (canvas) ---------- */

/* cara recortada en círculo con un aro de color */
function drawFace(ctx, image, r, ring, ringWidth = 0.12) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, TAU);
  ctx.clip();
  if (image && image.complete && image.naturalWidth) ctx.drawImage(image, -r, -r, r * 2, r * 2);
  else {
    ctx.fillStyle = '#1b1b22';
    ctx.fillRect(-r, -r, r * 2, r * 2);
  }
  ctx.restore();
  ctx.lineWidth = r * ringWidth;
  ctx.strokeStyle = ring;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, TAU);
  ctx.stroke();
}

/* reloj de arena: da segundos extra */
function drawTime(ctx, r) {
  ctx.fillStyle = 'rgba(127, 214, 255, 0.22)';
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = RING.time;
  ctx.lineWidth = r * 0.08;
  ctx.stroke();
  ctx.fillStyle = '#e8f7ff';
  ctx.beginPath();
  ctx.moveTo(-r * 0.4, -r * 0.6);
  ctx.lineTo(r * 0.4, -r * 0.6);
  ctx.lineTo(0, 0);
  ctx.lineTo(r * 0.4, r * 0.6);
  ctx.lineTo(-r * 0.4, r * 0.6);
  ctx.lineTo(0, 0);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#ffc14d';
  ctx.beginPath();
  ctx.moveTo(-r * 0.22, -r * 0.3);
  ctx.lineTo(r * 0.22, -r * 0.3);
  ctx.lineTo(0, -r * 0.05);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-r * 0.36, r * 0.6);
  ctx.lineTo(r * 0.36, r * 0.6);
  ctx.lineTo(0, r * 0.3);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#ffd27a';
  ctx.lineWidth = r * 0.12;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-r * 0.5, -r * 0.68);
  ctx.lineTo(r * 0.5, -r * 0.68);
  ctx.moveTo(-r * 0.5, r * 0.68);
  ctx.lineTo(r * 0.5, r * 0.68);
  ctx.stroke();
}

function drawItem(ctx, it, r) {
  if (it.kind === 'time') {
    drawTime(ctx, r);
    return;
  }
  drawFace(ctx, it.img, r, RING[it.kind], it.kind === 'boss' ? 0.09 : 0.12);
  /* a los aldeanos se les marca con un escudito verde: a ellos se les protege */
  if (it.kind === 'villager') {
    ctx.save();
    ctx.translate(r * 0.68, r * 0.68);
    ctx.fillStyle = '#2fbf7a';
    ctx.strokeStyle = '#0b0b0e';
    ctx.lineWidth = r * 0.06;
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.32);
    ctx.lineTo(r * 0.27, -r * 0.2);
    ctx.lineTo(r * 0.22, r * 0.12);
    ctx.lineTo(0, r * 0.3);
    ctx.lineTo(-r * 0.22, r * 0.12);
    ctx.lineTo(-r * 0.27, -r * 0.2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }
}

/* distancia de un punto a un segmento: así se detecta si el corte pasó
   por encima de un objeto aunque el dedo vaya muy rápido */
function segmentDistance(px, py, ax, ay, bx, by) {
  const dx = bx - ax;
  const dy = by - ay;
  const len2 = dx * dx + dy * dy || 1;
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / len2));
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}

/* ---------- leyenda ---------- */

function HourglassIcon() {
  return (
    <svg viewBox="0 0 24 24" className="sg-legend-svg" aria-hidden="true">
      <circle cx="12" cy="12" r="11" fill="rgba(127,214,255,0.2)" stroke="#7fd6ff" strokeWidth="1.2" />
      <path d="M7 5h10M7 19h10" stroke="#ffd27a" strokeWidth="2" strokeLinecap="round" />
      <path d="M8 6h8l-4 6 4 6H8l4-6z" fill="#e8f7ff" />
      <path d="M10 8.5h4l-2 2.5zM9 18l3-3 3 3z" fill="#ffc14d" />
    </svg>
  );
}

function Legend({ hard = false }) {
  return (
    <ul className="sg-legend">
      <li>
        <img className="sg-legend-face" src={LOWER_MOONS[0].src} alt="" />
        <span>Lunas Inferiores +1</span>
      </li>
      <li>
        <img className="sg-legend-face sg-legend-face--gold" src={ENMU.src} alt="" />
        <span>Enmu +5</span>
      </li>
      <li>
        <HourglassIcon />
        <span>+4 s</span>
      </li>
      <li>
        <img className="sg-legend-face sg-legend-face--safe" src={VILLAGERS[0].src} alt="" />
        <span>aldeanos −5, ¡no los cortes!</span>
      </li>
      {hard && (
        <li>
          <img className="sg-legend-face sg-legend-face--boss" src={UPPER_MOONS[4].src} alt="" />
          <span>Lunas Superiores: córtalas muchas veces antes de que escapen</span>
        </li>
      )}
    </ul>
  );
}

/* ---------- la arena a pantalla completa ---------- */

function SlashArena({ bests, onBest, onClose }) {
  const canvasRef = useRef(null);
  const gameRef = useRef(null);
  const closeRef = useRef(null);
  const bestsRef = useRef(bests);
  const onBestRef = useRef(onBest);
  const [phase, setPhase] = useState('ready');
  const [modeId, setModeId] = useState('normal');
  const [score, setScore] = useState(0);
  const [left, setLeft] = useState(MODES.normal.seconds);
  const [defeated, setDefeated] = useState(0);
  const [isRecord, setIsRecord] = useState(false);

  useEffect(() => {
    closeRef.current?.focus({ preventScroll: true });
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    [...LOWER_MOONS, ENMU, ...VILLAGERS, ...UPPER_MOONS].forEach((f) => getImage(f.src));

    const g = {
      mode: MODES.normal,
      w: 0,
      h: 0,
      dpr: 1,
      size: 40,
      playing: false,
      timeLeft: 0,
      shownLeft: 0,
      elapsed: 0,
      spawnIn: 0.5,
      score: 0,
      items: [],
      queue: [],
      halves: [],
      sparks: [],
      popups: [],
      blade: [],
      down: false,
      strokeHits: 0,
      flash: 0,
      flashColor: '255, 60, 80',
      shake: 0,
      boss: null,
      bossQueue: [],
      bossTimer: 0,
      pendingBoss: null,
      banner: null,
      defeated: 0,
      allClear: false,
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      g.dpr = Math.min(window.devicePixelRatio || 1, 2);
      g.w = rect.width;
      g.h = rect.height;
      canvas.width = Math.round(g.w * g.dpr);
      canvas.height = Math.round(g.h * g.dpr);
      g.size = Math.max(32, Math.min(58, Math.min(g.w, g.h) * 0.085));
    };
    resize();

    const popup = (x, y, text, color, life = 0.9, big = false) =>
      g.popups.push({ x, y, text, color, life, max: life, big });

    const burst = (x, y, color, n, power = 1) => {
      for (let i = 0; i < n; i++) {
        const a = Math.random() * TAU;
        const sp = (120 + Math.random() * 320) * power;
        g.sparks.push({
          x,
          y,
          vx: Math.cos(a) * sp,
          vy: Math.sin(a) * sp,
          life: 0.4 + Math.random() * 0.4,
          max: 0.8,
          color,
          size: 2 + Math.random() * 3 * power,
        });
      }
    };

    /* dificultad: de 0 (inicio) a 1 (final de la partida) */
    const progress = () => Math.min(1, g.elapsed / g.mode.seconds);

    const launch = (kind) => {
      const p = progress();
      /* gravedad × velocidad² hace que todo el vuelo sea "speed" veces más rápido */
      const grav = g.h * (1.45 + p * 0.6) * g.mode.speed * g.mode.speed;
      const r = kind === 'enmu' ? g.size * 0.85 : kind === 'time' ? g.size * 0.78 : g.size;
      const x = g.w * (0.12 + Math.random() * 0.76);
      const peak = g.h * (0.5 + Math.random() * 0.32);
      const vy = -Math.sqrt(2 * grav * peak) * (kind === 'enmu' ? 1.06 : 1);
      const air = (-2 * vy) / grav;
      const targetX = g.w * (0.2 + Math.random() * 0.6);
      const who = kind === 'oni' ? pick(LOWER_MOONS) : kind === 'enmu' ? ENMU : kind === 'villager' ? pick(VILLAGERS) : null;
      g.items.push({
        kind,
        img: who ? getImage(who.src) : null,
        r,
        x,
        y: g.h + r * 1.5,
        vx: (targetX - x) / air,
        vy,
        grav,
        rot: (Math.random() - 0.5) * 0.6,
        vr: (Math.random() - 0.5) * 1.6,
        dead: false,
      });
    };

    const spawnWave = () => {
      const p = progress();
      /* con una Luna Superior en pantalla salen menos demonios normales */
      const calm = g.boss ? 0.45 : 1;
      const count = 1 + Math.floor(Math.random() * (1.4 + p * 3.2) * calm);
      for (let i = 0; i < count; i++) {
        const r = Math.random();
        const v = 0.1 + p * 0.12 + g.mode.villagers;
        let kind = 'oni';
        if (r < v) kind = 'villager';
        else if (r < v + 0.07) kind = 'enmu';
        else if (r < v + 0.07 + 0.04 * g.mode.timeItems && g.elapsed > Math.min(8, g.mode.seconds * 0.25)) kind = 'time';
        g.queue.push({ at: g.elapsed + i * (0.18 - p * 0.08), kind });
      }
    };

    /* parte un objeto (o a una Luna Superior vencida) en dos mitades */
    const splitInTwo = (it, ang, push = 150) => {
      const nx = -Math.sin(ang);
      const ny = Math.cos(ang);
      for (const side of [-1, 1]) {
        g.halves.push({
          kind: it.kind,
          img: it.img,
          r: it.r,
          x: it.x,
          y: it.y,
          rot: it.rot || 0,
          ang,
          side,
          spin: 0,
          vx: (it.vx || 0) * 0.6 + nx * side * push,
          vy: Math.min(it.vy || 0, 0) * 0.35 + ny * side * push - 60,
          vr: (it.vr || 0) + side * 3,
          grav: it.grav || g.h * 1.6,
          life: 1.4,
        });
      }
    };

    const slice = (it, ax, ay, bx, by) => {
      it.dead = true;
      splitInTwo(it, Math.atan2(by - ay, bx - ax));
      burst(it.x, it.y, RING[it.kind], 14);
      if (it.kind === 'villager') {
        g.score = Math.max(0, g.score - 5);
        g.flash = 1;
        g.flashColor = '255, 60, 80';
        g.shake = 0.35;
        g.strokeHits = 0;
        popup(it.x, it.y, '−5 ¡era un aldeano!', '#ff5468', 1.1);
      } else if (it.kind === 'time') {
        g.timeLeft += 4;
        g.strokeHits += 1;
        popup(it.x, it.y, '+4 s', '#7fd6ff');
      } else {
        const points = it.kind === 'enmu' ? 5 : 1;
        g.score += points;
        g.strokeHits += 1;
        popup(it.x, it.y, `+${points}`, it.kind === 'enmu' ? '#ffc14d' : '#ffffff');
      }
      setScore(g.score);
    };

    /* ---------- Lunas Superiores ---------- */

    const spawnBoss = (index, at = null) => {
      const def = UPPER_MOONS[index];
      const r = Math.max(56, Math.min(98, Math.min(g.w, g.h) * 0.14));
      const hp = Math.round(def.hp * g.mode.bossHp);
      g.boss = {
        def,
        kind: 'boss',
        img: getImage(def.src),
        r,
        hp,
        max: hp,
        time: def.time * g.mode.bossTime,
        x: at ? at.x : g.w / 2,
        y: at ? at.y : g.h + r * 1.6,
        homeY: g.h * 0.36,
        state: at ? 'fight' : 'enter',
        t: 0,
        life: def.time * g.mode.bossTime,
        lastHit: 0,
        hitFlash: 0,
        kx: 0,
        ky: 0,
        cuts: [],
      };
      g.banner = { kanji: def.kanji, title: def.name, sub: `Luna Superior ${def.rank}`, life: 1.9, max: 1.9 };
    };

    const defeatBoss = (b, ang) => {
      b.state = 'dead';
      splitInTwo({ ...b, x: b.x + b.kx, y: b.y + b.ky }, ang, 220);
      burst(b.x, b.y, '#ffc14d', 26, 1.4);
      burst(b.x, b.y, '#ff5468', 18, 1.2);
      g.flash = 0.9;
      g.flashColor = '255, 230, 170';
      g.shake = 0.4;
      g.score += b.def.points;
      g.defeated += 1;
      setScore(g.score);
      setDefeated(g.defeated);
      popup(b.x, b.y - b.r * 0.4, `¡${b.def.name} derrotado! +${b.def.points}`, '#ffc14d', 1.7, true);
      g.boss = null;
      if (b.def.then != null) {
        g.pendingBoss = { index: b.def.then, at: { x: b.x, y: b.y }, delay: 0.8 };
      } else if (!g.bossQueue.length && !g.allClear) {
        g.allClear = true;
        g.score += 50;
        setScore(g.score);
        popup(g.w / 2, g.h * 0.5, '¡Todas las Lunas Superiores! +50', '#7fd6ff', 2.2, true);
      } else {
        g.bossTimer = g.mode.bossGap;
      }
    };

    const hitBoss = (b, ax, ay, bx, by, now) => {
      b.lastHit = now;
      b.hp -= 1;
      b.hitFlash = 1;
      const ang = Math.atan2(by - ay, bx - ax);
      b.kx += Math.cos(ang) * 16;
      b.ky += Math.sin(ang) * 16;
      b.cuts.push({ ang, off: (Math.random() - 0.5) * b.r * 0.9, life: 0.35 });
      burst(b.x + b.kx, b.y + b.ky, Math.random() < 0.5 ? '#ffffff' : '#ff5468', 8, 0.8);
      g.shake = Math.max(g.shake, 0.12);
      if (b.hp <= 0) defeatBoss(b, ang);
    };

    const updateBoss = (dt) => {
      if (g.pendingBoss) {
        g.pendingBoss.delay -= dt;
        if (g.pendingBoss.delay <= 0) {
          spawnBoss(g.pendingBoss.index, g.pendingBoss.at);
          g.pendingBoss = null;
        }
      } else if (g.playing && g.mode.bosses && !g.boss && g.bossQueue.length) {
        g.bossTimer -= dt;
        if (g.bossTimer <= 0) spawnBoss(g.bossQueue.shift());
      }

      const b = g.boss;
      if (!b) return;
      b.hitFlash = Math.max(0, b.hitFlash - dt * 4);
      const decay = Math.pow(0.004, dt);
      b.kx *= decay;
      b.ky *= decay;
      for (const c of b.cuts) c.life -= dt;
      b.cuts = b.cuts.filter((c) => c.life > 0);

      if (b.state === 'enter') {
        b.y += (b.homeY - b.y) * Math.min(1, dt * 3.2);
        if (Math.abs(b.y - b.homeY) < 3) b.state = 'fight';
      } else if (b.state === 'fight') {
        b.t += dt;
        if (g.playing) b.life -= dt;
        /* con poca vida se mueve más rápido */
        const rage = b.hp / b.max < 0.4 ? 1.45 : 1;
        const sp = b.def.speed * g.mode.bossSpeed * rage;
        const tx = g.w / 2 + Math.sin(b.t * 0.95 * sp) * g.w * 0.3;
        const ty = b.homeY + Math.sin(b.t * 1.7 * sp) * g.h * 0.11;
        b.x += (tx - b.x) * Math.min(1, dt * 5);
        b.y += (ty - b.y) * Math.min(1, dt * 5);
        if (b.life <= 0 || !g.playing) {
          b.state = 'escape';
          if (g.playing) popup(b.x, b.y, `${b.def.name} escapó…`, '#b7aea6', 1.4, true);
        }
      } else if (b.state === 'escape') {
        b.y -= g.h * 1.3 * dt;
        if (b.y < -b.r * 2.5) {
          g.boss = null;
          g.bossTimer = g.mode.bossGap;
        }
      }
    };

    const drawBoss = (now) => {
      const b = g.boss;
      if (!b) return;
      const x = b.x + b.kx;
      const y = b.y + b.ky;
      const rage = b.hp / b.max < 0.4;

      ctx.save();
      ctx.translate(x, y);
      const pulse = 1 + Math.sin(now / 170) * 0.035;
      ctx.shadowBlur = 34;
      ctx.shadowColor = rage ? '#ff3b3b' : '#ffc14d';
      drawFace(ctx, b.img, b.r * pulse, rage ? '#ff5468' : RING.boss, 0.09);
      ctx.shadowBlur = 0;

      /* golpe: destello blanco y marcas de corte sobre la cara */
      ctx.save();
      ctx.beginPath();
      ctx.arc(0, 0, b.r * pulse, 0, TAU);
      ctx.clip();
      if (b.hitFlash > 0) {
        ctx.fillStyle = `rgba(255, 255, 255, ${b.hitFlash * 0.45})`;
        ctx.fillRect(-b.r, -b.r, b.r * 2, b.r * 2);
      }
      for (const c of b.cuts) {
        ctx.save();
        ctx.rotate(c.ang);
        ctx.globalAlpha = c.life / 0.35;
        ctx.strokeStyle = '#ffffff';
        ctx.shadowBlur = 12;
        ctx.shadowColor = '#7fd6ff';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(-b.r, c.off);
        ctx.lineTo(b.r, c.off);
        ctx.stroke();
        ctx.restore();
      }
      ctx.restore();

      /* cuánto le queda antes de escapar */
      if (b.state === 'fight') {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, b.r + 9, -Math.PI / 2, -Math.PI / 2 + TAU * Math.max(0, b.life / b.time));
        ctx.stroke();
      }

      /* kanji del rango debajo */
      ctx.font = `700 ${Math.round(b.r * 0.26)}px "Yu Mincho", "Hiragino Mincho ProN", "Noto Serif JP", serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const kw = ctx.measureText(b.def.kanji).width + 16;
      ctx.fillStyle = 'rgba(11, 11, 14, 0.85)';
      ctx.fillRect(-kw / 2, b.r + 12, kw, b.r * 0.36);
      ctx.fillStyle = '#ffc14d';
      ctx.fillText(b.def.kanji, 0, b.r + 12 + b.r * 0.18);
      ctx.restore();

      /* barra de vida y nombre */
      const bw = Math.max(120, b.r * 2.3);
      const bx = x - bw / 2;
      const by = y - b.r - 26;
      ctx.fillStyle = 'rgba(11, 11, 14, 0.8)';
      ctx.fillRect(bx - 2, by - 2, bw + 4, 12);
      const hpGrad = ctx.createLinearGradient(bx, 0, bx + bw, 0);
      hpGrad.addColorStop(0, '#ff3b3b');
      hpGrad.addColorStop(1, '#ffc14d');
      ctx.fillStyle = hpGrad;
      ctx.fillRect(bx, by, bw * Math.max(0, b.hp / b.max), 8);
      ctx.font = '800 14px Manrope, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.lineWidth = 4;
      ctx.strokeStyle = 'rgba(10, 10, 14, 0.9)';
      const label = `${b.def.name} · ${Math.max(0, b.hp)}/${b.max}`;
      ctx.strokeText(label, x, by - 4);
      ctx.fillStyle = '#f6efe6';
      ctx.fillText(label, x, by - 4);
    };

    const drawBanner = () => {
      const bn = g.banner;
      if (!bn) return;
      const t = bn.life / bn.max;
      const a = Math.min(1, t * 3, (1 - t) * 6);
      ctx.save();
      ctx.globalAlpha = a;
      ctx.fillStyle = 'rgba(11, 11, 14, 0.55)';
      ctx.fillRect(0, g.h * 0.5 - 70, g.w, 140);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = `700 ${Math.round(Math.min(56, g.w * 0.11))}px "Yu Mincho", "Hiragino Mincho ProN", "Noto Serif JP", serif`;
      ctx.fillStyle = '#ffc14d';
      ctx.shadowBlur = 24;
      ctx.shadowColor = '#ff5468';
      ctx.fillText(bn.kanji, g.w / 2, g.h * 0.5 - 22);
      ctx.shadowBlur = 0;
      ctx.font = '800 20px Manrope, sans-serif';
      ctx.fillStyle = '#f6efe6';
      ctx.fillText(`${bn.sub} · ${bn.title}`, g.w / 2, g.h * 0.5 + 30);
      ctx.restore();
    };

    /* cortar 3 o más de un solo tajo da puntos extra */
    const endStroke = () => {
      if (g.playing && g.strokeHits >= 3) {
        const bonus = g.strokeHits;
        g.score += bonus;
        setScore(g.score);
        const last = g.blade[g.blade.length - 1];
        popup(last ? last.x : g.w / 2, (last ? last.y : g.h / 2) - 34, `¡Combo x${g.strokeHits}! +${bonus}`, '#ff8a3d', 1.3);
      }
      g.strokeHits = 0;
      g.down = false;
    };

    const finish = () => {
      g.playing = false;
      g.down = false;
      g.items = [];
      g.queue = [];
      g.pendingBoss = null;
      setLeft(0);
      const key = g.mode.id;
      if (g.score > 0 && (!bestsRef.current[key] || g.score > bestsRef.current[key])) {
        bestsRef.current = { ...bestsRef.current, [key]: g.score };
        saveBest(g.mode.bestKey, g.score);
        onBestRef.current(key, g.score);
        setIsRecord(true);
      }
      setPhase('done');
    };

    const start = (id) => {
      const mode = MODES[id];
      Object.assign(g, {
        mode,
        playing: true,
        timeLeft: mode.seconds,
        shownLeft: mode.seconds,
        elapsed: 0,
        spawnIn: 0.4,
        score: 0,
        items: [],
        queue: [],
        halves: [],
        popups: [],
        strokeHits: 0,
        boss: null,
        bossQueue: mode.bosses ? [...BOSS_ORDER] : [],
        bossTimer: mode.firstBoss,
        pendingBoss: null,
        banner: null,
        defeated: 0,
        allClear: false,
      });
      setModeId(id);
      setScore(0);
      setDefeated(0);
      setLeft(mode.seconds);
      setIsRecord(false);
      setPhase('playing');
    };
    gameRef.current = { start };

    const render = (now) => {
      ctx.setTransform(g.dpr, 0, 0, g.dpr, 0, 0);
      ctx.clearRect(0, 0, g.w, g.h);
      ctx.save();
      if (g.shake > 0) {
        const m = (g.shake / 0.35) * 8;
        ctx.translate((Math.random() - 0.5) * m * 2, (Math.random() - 0.5) * m * 2);
      }

      drawBoss(now);

      for (const it of g.items) {
        ctx.save();
        ctx.translate(it.x, it.y);
        ctx.rotate(it.rot);
        if (it.kind === 'enmu' || it.kind === 'time') {
          ctx.shadowBlur = 22;
          ctx.shadowColor = RING[it.kind];
        }
        drawItem(ctx, it, it.r);
        ctx.restore();
      }

      /* mitades: se dibuja el objeto completo recortado a un lado del corte */
      for (const h of g.halves) {
        ctx.save();
        ctx.globalAlpha = Math.min(1, h.life / 0.4);
        ctx.translate(h.x, h.y);
        ctx.rotate(h.spin + h.ang);
        const R = h.r * 1.4;
        ctx.beginPath();
        if (h.side < 0) ctx.rect(-R, -R, 2 * R, R);
        else ctx.rect(-R, 0, 2 * R, R);
        ctx.clip();
        ctx.rotate(h.rot - h.ang);
        drawItem(ctx, h, h.r);
        ctx.restore();
      }

      for (const s of g.sparks) {
        ctx.globalAlpha = Math.max(0, s.life / s.max);
        ctx.fillStyle = s.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = s.color;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, TAU);
        ctx.fill();
      }
      ctx.shadowBlur = 0;

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.lineJoin = 'round';
      for (const p of g.popups) {
        ctx.globalAlpha = Math.max(0, p.life / p.max);
        ctx.font = `900 ${p.big ? 24 : 21}px Manrope, sans-serif`;
        ctx.lineWidth = 5;
        ctx.strokeStyle = 'rgba(10, 10, 14, 0.85)';
        ctx.strokeText(p.text, p.x, p.y);
        ctx.fillStyle = p.color;
        ctx.fillText(p.text, p.x, p.y);
      }

      g.blade = g.blade.filter((b) => now - b.t < BLADE_LIFE);
      if (g.blade.length > 1) {
        const fire = g.strokeHits >= 3;
        ctx.lineCap = 'round';
        for (let i = 1; i < g.blade.length; i++) {
          const a = g.blade[i - 1];
          const b = g.blade[i];
          const life = 1 - (now - b.t) / BLADE_LIFE;
          ctx.globalAlpha = life;
          ctx.shadowBlur = 18;
          ctx.shadowColor = fire ? '#ff6428' : '#46b4ff';
          ctx.strokeStyle = fire ? '#ff9a50' : '#7fd6ff';
          ctx.lineWidth = 3 + life * 10;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
          ctx.shadowBlur = 0;
          ctx.strokeStyle = '#fff';
          ctx.lineWidth = 1 + life * 3;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;
      ctx.restore();

      drawBanner();

      if (g.flash > 0) {
        ctx.fillStyle = `rgba(${g.flashColor}, ${g.flash * 0.35})`;
        ctx.fillRect(0, 0, g.w, g.h);
      }
    };

    let raf = 0;
    let last = performance.now();
    const frame = (now) => {
      const dt = Math.min(0.033, (now - last) / 1000);
      last = now;

      if (g.playing) {
        g.elapsed += dt;
        g.timeLeft -= dt;
        g.spawnIn -= dt;
        if (g.spawnIn <= 0) {
          spawnWave();
          g.spawnIn = (1.2 - progress() * 0.65 + Math.random() * 0.25) * (g.boss ? 1.6 : 1) * g.mode.spawn;
        }
        while (g.queue.length && g.queue[0].at <= g.elapsed) launch(g.queue.shift().kind);
        const shown = Math.max(0, Math.ceil(g.timeLeft));
        if (shown !== g.shownLeft) {
          g.shownLeft = shown;
          setLeft(shown);
        }
        if (g.timeLeft <= 0) finish();
      }

      updateBoss(dt);
      if (g.banner) {
        g.banner.life -= dt;
        if (g.banner.life <= 0) g.banner = null;
      }

      for (const it of g.items) {
        it.vy += it.grav * dt;
        it.x += it.vx * dt;
        it.y += it.vy * dt;
        it.rot += it.vr * dt;
      }
      g.items = g.items.filter((it) => !it.dead && !(it.vy > 0 && it.y > g.h + it.r * 2));
      for (const h of g.halves) {
        h.vy += h.grav * dt;
        h.x += h.vx * dt;
        h.y += h.vy * dt;
        h.spin += h.vr * dt;
        h.life -= dt;
      }
      g.halves = g.halves.filter((h) => h.life > 0 && h.y < g.h + h.r * 3);
      for (const s of g.sparks) {
        s.vy += 600 * dt;
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        s.life -= dt;
      }
      g.sparks = g.sparks.filter((s) => s.life > 0);
      for (const p of g.popups) {
        p.y -= 40 * dt;
        p.life -= dt;
      }
      g.popups = g.popups.filter((p) => p.life > 0);
      g.flash = Math.max(0, g.flash - dt * 2.5);
      g.shake = Math.max(0, g.shake - dt);

      render(now);
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    const pos = (e) => {
      const rect = canvas.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top, t: performance.now() };
    };
    const onDown = (e) => {
      if (!g.playing) return;
      canvas.setPointerCapture?.(e.pointerId);
      g.down = true;
      g.strokeHits = 0;
      g.blade = [pos(e)];
    };
    const onMove = (e) => {
      if (!g.down || !g.playing) return;
      const p = pos(e);
      const prev = g.blade[g.blade.length - 1];
      g.blade.push(p);
      if (!prev) return;
      for (const it of g.items) {
        if (!it.dead && segmentDistance(it.x, it.y, prev.x, prev.y, p.x, p.y) < it.r * 1.05) {
          slice(it, prev.x, prev.y, p.x, p.y);
        }
      }
      const b = g.boss;
      if (
        b &&
        b.state === 'fight' &&
        p.t - b.lastHit > BOSS_HIT_GAP &&
        segmentDistance(b.x + b.kx, b.y + b.ky, prev.x, prev.y, p.x, p.y) < b.r
      ) {
        hitBoss(b, prev.x, prev.y, p.x, p.y, p.t);
      }
    };
    const onUp = () => {
      if (g.down) endStroke();
    };

    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);
    window.addEventListener('resize', resize);
    return () => {
      cancelAnimationFrame(raf);
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointercancel', onUp);
      window.removeEventListener('resize', resize);
    };
  }, []);

  const mode = MODES[modeId];
  const startGame = (id) => gameRef.current?.start(id);

  return (
    <div className="sg-overlay" role="dialog" aria-modal="true" aria-label="Corte de demonios">
      <div className="sg-bg" aria-hidden="true" />
      <canvas ref={canvasRef} className="sg-canvas" />

      <div className="sg-hud">
        <span className="sg-chip">
          <b>{score}</b> puntos
        </span>
        <span className={`sg-chip${phase === 'playing' && left <= 10 ? ' is-hurry' : ''}`}>
          <b>{left}</b> s
        </span>
        {mode.bosses && phase !== 'ready' && (
          <span className="sg-chip sg-chip--gold">
            Lunas <b>{defeated}</b>/{BOSS_TOTAL}
          </span>
        )}
        <span className="sg-chip sg-chip--soft">récord {bests[modeId] ?? '—'}</span>
      </div>

      <button ref={closeRef} type="button" className="sg-close" onClick={onClose} aria-label="Cerrar minijuego">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>

      {phase === 'ready' && (
        <div className="sg-panel">
          <p className="sg-kicker">respiración del agua · primera forma</p>
          <h3 className="sg-title">Corta a los demonios</h3>
          <p className="sg-text">
            Desliza el dedo (o arrastra el mouse) para cortar. Corta 3 o más de un solo tajo para hacer combo.
          </p>
          <Legend hard />
          <div className="sg-modes">
            {MODE_LIST.map((m) => (
              <button
                key={m.id}
                type="button"
                className={`sg-mode sg-mode--${m.id}`}
                onClick={() => startGame(m.id)}
                aria-label={`${m.label}: ${m.seconds} segundos, ${m.hint}. Dificultad ${m.level} de 4`}
              >
                <span className="sg-mode-level" aria-hidden="true">
                  {Array.from({ length: 4 }, (_, i) => (
                    <svg key={i} viewBox="0 0 24 24" className={i < m.level ? 'is-on' : ''}>
                      <path d="M12 2c1 4 6 6 6 12a6 6 0 0 1-12 0c0-3 2-5 3-7 0 3 2 4 3 4-1-3-1-6 0-9z" />
                    </svg>
                  ))}
                </span>
                <b>{m.label}</b>
                <span>
                  {m.seconds} s · {m.hint}
                </span>
                {bests[m.id] != null && <span className="sg-mode-best">récord {bests[m.id]}</span>}
              </button>
            ))}
          </div>
        </div>
      )}

      {phase === 'done' && (
        <div className="sg-panel">
          <img className="sg-panel-sticker" src={TANJIRO_PHOTOS.face} alt="" />
          <p className="sg-kicker">{isRecord ? '¡nuevo récord!' : `se acabó el tiempo · ${mode.label}`}</p>
          <p className="sg-score">{score}</p>
          {mode.bosses && (
            <p className="sg-defeated">
              Lunas Superiores vencidas: <b>{defeated}</b> de {BOSS_TOTAL}
            </p>
          )}
          <p className="sg-text">{resultMessage(mode, score, defeated)}</p>
          <div className="sg-actions">
            <button type="button" className="sg-btn" onClick={() => startGame(modeId)}>
              Otra ronda
            </button>
            <button type="button" className="sg-btn sg-btn--ghost" onClick={() => setPhase('ready')}>
              Cambiar modo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- la sección en la página ---------- */

export default function SlashGame() {
  const [open, setOpen] = useState(false);
  const [bests, setBests] = useState(() => Object.fromEntries(MODE_LIST.map((m) => [m.id, loadBest(m.bestKey)])));
  const close = useCallback(() => setOpen(false), []);
  const onBest = useCallback((id, value) => setBests((b) => ({ ...b, [id]: value })), []);

  return (
    <Reveal as="section" className="sg-section">
      <span className="tj-cut tj-cut--fire" aria-hidden="true" />
      <p className="tj-eyebrow tj-eyebrow--warm">minijuego</p>
      <h2 className="tj-h2">Corte de demonios</h2>
      <p className="tj-lead">Como Tanjiro: corta a los demonios, pero nunca a los aldeanos.</p>

      <div className="sg-launch">
        <div className="sg-banner">
          <img src={TANJIRO_PHOTOS.sword} alt="Tanjiro desenvainando su espada" loading="lazy" />
          <img className="sg-banner-chibi" src={TANJIRO_PHOTOS.chibi} alt="" loading="lazy" />
        </div>

        <p className="sg-row-label">Lunas Superiores · Difícil, Pilar y Castillo Infinito</p>
        <ul className="sg-moons">
          {UPPER_MOONS.map((u) => (
            <li key={u.name} style={{ '--rank': u.rank }}>
              <img src={u.src} alt="" loading="lazy" />
              <span className="sg-moons-name">{u.name}</span>
              <span className="sg-moons-hp">{u.hp} cortes</span>
            </li>
          ))}
        </ul>

        <Legend />
        <button type="button" className="sg-btn sg-btn--big" onClick={() => setOpen(true)}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 20L20 4M14 4h6v6M7 13l4 4" />
          </svg>
          Jugar
        </button>
        <ul className="sg-launch-records">
          {MODE_LIST.map((m) => (
            <li key={m.id}>
              <span>{m.label}</span>
              <b>{bests[m.id] ?? '—'}</b>
            </li>
          ))}
        </ul>
      </div>

      {/* portal: Reveal usa transform, que atraparía a un position:fixed */}
      {open && createPortal(<SlashArena bests={bests} onBest={onBest} onClose={close} />, document.body)}
    </Reveal>
  );
}
