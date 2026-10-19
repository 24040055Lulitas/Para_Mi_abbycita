import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Reveal from '../../components/Reveal';
import './SlashGame.css';

/* =========================================================
   "Corte de demonios": minijuego tipo Fruit Ninja. Los objetos
   saltan desde abajo y se cortan deslizando el dedo o el mouse.
   ========================================================= */

const GAME_SECONDS = 45;
const BEST_KEY = 'abby-tanjiro-slash-best';
const TAU = Math.PI * 2;
/* cuánto dura visible la estela de la espada, en ms */
const BLADE_LIFE = 160;

const KINDS = {
  oni: { points: 1, color: '#ff5468' },
  gold: { points: 5, color: '#ffc14d' },
  box: { points: -5, color: '#c08a4a' },
  time: { seconds: 4, color: '#7fd6ff' },
};

function loadBest() {
  try {
    const v = Number(localStorage.getItem(BEST_KEY));
    return Number.isFinite(v) && v > 0 ? v : null;
  } catch {
    return null;
  }
}

function saveBest(value) {
  try {
    localStorage.setItem(BEST_KEY, String(value));
  } catch {
    /* almacenamiento no disponible, no pasa nada */
  }
}

function slashMessage(score) {
  if (score >= 120) return 'Nivel Pilar. Tanjiro estaría orgullosísimo de ti.';
  if (score >= 70) return 'Cazadora de demonios oficial. Nada se te escapa.';
  if (score >= 35) return 'Buenos cortes. Un poco más de entrenamiento y llegas a Pilar.';
  return 'Hasta Tanjiro empezó entrenando contra una roca. ¿Otra ronda?';
}

/* ---------- dibujos (canvas) ---------- */

function roundRectPath(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawOni(ctx, r, gold) {
  /* cuernos */
  ctx.fillStyle = gold ? '#fff3c4' : '#f1e6d6';
  for (const s of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(s * r * 0.3, -r * 0.8);
    ctx.lineTo(s * r * 0.72, -r * 1.42);
    ctx.lineTo(s * r * 0.74, -r * 0.55);
    ctx.closePath();
    ctx.fill();
  }
  /* cabeza */
  const g = ctx.createRadialGradient(-r * 0.3, -r * 0.35, r * 0.1, 0, 0, r);
  g.addColorStop(0, gold ? '#fff1a8' : '#ff8a92');
  g.addColorStop(0.55, gold ? '#f2b705' : '#d1374b');
  g.addColorStop(1, gold ? '#9a6200' : '#6e1020');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, TAU);
  ctx.fill();
  /* marca en la frente */
  ctx.strokeStyle = gold ? '#9a6200' : '#4a0a14';
  ctx.lineWidth = r * 0.08;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0, -r * 0.74);
  ctx.lineTo(0, -r * 0.46);
  ctx.stroke();
  /* ojos enojados */
  ctx.fillStyle = gold ? '#c4122f' : '#ffd84a';
  for (const s of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(s * r * 0.12, -r * 0.08);
    ctx.lineTo(s * r * 0.58, -r * 0.32);
    ctx.lineTo(s * r * 0.5, -r * 0.02);
    ctx.closePath();
    ctx.fill();
  }
  /* boca con colmillos */
  ctx.fillStyle = '#2a0509';
  ctx.beginPath();
  ctx.ellipse(0, r * 0.42, r * 0.45, r * 0.2, 0, 0, TAU);
  ctx.fill();
  ctx.fillStyle = '#fff';
  for (const s of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(s * r * 0.32, r * 0.27);
    ctx.lineTo(s * r * 0.16, r * 0.27);
    ctx.lineTo(s * r * 0.24, r * 0.52);
    ctx.closePath();
    ctx.fill();
  }
}

/* la caja de madera de Nezuko, con su moño rosa: no se corta */
function drawBox(ctx, r) {
  const w = r * 1.5;
  const h = r * 1.8;
  const g = ctx.createLinearGradient(-w / 2, 0, w / 2, 0);
  g.addColorStop(0, '#8a5a2b');
  g.addColorStop(0.5, '#c08a4a');
  g.addColorStop(1, '#7a4a1c');
  ctx.fillStyle = g;
  roundRectPath(ctx, -w / 2, -h / 2, w, h, r * 0.12);
  ctx.fill();
  ctx.strokeStyle = '#3d2208';
  ctx.lineWidth = r * 0.09;
  ctx.stroke();
  ctx.lineWidth = r * 0.05;
  for (const y of [-h * 0.18, h * 0.18]) {
    ctx.beginPath();
    ctx.moveTo(-w / 2, y);
    ctx.lineTo(w / 2, y);
    ctx.stroke();
  }
  ctx.fillStyle = '#ff8fb8';
  for (const s of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(0, -h / 2);
    ctx.lineTo(s * r * 0.48, -h / 2 - r * 0.3);
    ctx.lineTo(s * r * 0.48, -h / 2 + r * 0.3);
    ctx.closePath();
    ctx.fill();
  }
  ctx.fillStyle = '#ff5e9c';
  ctx.beginPath();
  ctx.arc(0, -h / 2, r * 0.12, 0, TAU);
  ctx.fill();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
  ctx.font = `900 ${Math.round(r * 0.8)}px Manrope, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('!', 0, r * 0.06);
}

/* reloj de arena: da segundos extra */
function drawTime(ctx, r) {
  ctx.fillStyle = 'rgba(127, 214, 255, 0.22)';
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = '#7fd6ff';
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

function drawItem(ctx, kind, r) {
  if (kind === 'box') drawBox(ctx, r);
  else if (kind === 'time') drawTime(ctx, r);
  else drawOni(ctx, r, kind === 'gold');
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

/* iconito de la leyenda, dibujado con las mismas funciones del juego */
function LegendIcon({ kind }) {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = 44 * dpr;
    canvas.height = 44 * dpr;
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.translate(22, 24);
    drawItem(ctx, kind, kind === 'box' ? 11 : 13);
  }, [kind]);
  return <canvas ref={ref} className="sg-legend-icon" aria-hidden="true" />;
}

const LEGEND = [
  { kind: 'oni', text: '+1' },
  { kind: 'gold', text: '+5' },
  { kind: 'time', text: '+4 s' },
  { kind: 'box', text: '−5, ¡no la cortes!' },
];

function Legend() {
  return (
    <ul className="sg-legend">
      {LEGEND.map((l) => (
        <li key={l.kind}>
          <LegendIcon kind={l.kind} />
          <span>{l.text}</span>
        </li>
      ))}
    </ul>
  );
}

/* ---------- la arena a pantalla completa ---------- */

function SlashArena({ best, onBest, onClose }) {
  const canvasRef = useRef(null);
  const gameRef = useRef(null);
  const closeRef = useRef(null);
  const bestRef = useRef(best);
  const onBestRef = useRef(onBest);
  const [phase, setPhase] = useState('ready');
  const [score, setScore] = useState(0);
  const [left, setLeft] = useState(GAME_SECONDS);
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
    const g = {
      w: 0,
      h: 0,
      dpr: 1,
      size: 40,
      playing: false,
      timeLeft: GAME_SECONDS,
      shownLeft: GAME_SECONDS,
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
      shake: 0,
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      g.dpr = Math.min(window.devicePixelRatio || 1, 2);
      g.w = rect.width;
      g.h = rect.height;
      canvas.width = Math.round(g.w * g.dpr);
      canvas.height = Math.round(g.h * g.dpr);
      g.size = Math.max(30, Math.min(56, Math.min(g.w, g.h) * 0.08));
    };
    resize();

    const popup = (x, y, text, color, life = 0.9) => g.popups.push({ x, y, text, color, life, max: life });

    /* dificultad: de 0 (inicio) a 1 (final de la partida) */
    const progress = () => Math.min(1, g.elapsed / GAME_SECONDS);

    const launch = (kind) => {
      const p = progress();
      const grav = g.h * (1.45 + p * 0.6);
      const r = kind === 'gold' ? g.size * 0.82 : kind === 'time' ? g.size * 0.8 : g.size;
      const x = g.w * (0.12 + Math.random() * 0.76);
      const peak = g.h * (0.5 + Math.random() * 0.32);
      const vy = -Math.sqrt(2 * grav * peak) * (kind === 'gold' ? 1.06 : 1);
      const air = (-2 * vy) / grav;
      const targetX = g.w * (0.2 + Math.random() * 0.6);
      g.items.push({
        kind,
        r,
        x,
        y: g.h + r * 1.5,
        vx: (targetX - x) / air,
        vy,
        grav,
        rot: Math.random() * TAU,
        vr: (Math.random() - 0.5) * 5,
        dead: false,
      });
    };

    const spawnWave = () => {
      const p = progress();
      const count = 1 + Math.floor(Math.random() * (1.4 + p * 3.2));
      for (let i = 0; i < count; i++) {
        const r = Math.random();
        let kind = 'oni';
        if (r < 0.1 + p * 0.12) kind = 'box';
        else if (r < 0.17 + p * 0.12) kind = 'gold';
        else if (r < 0.21 + p * 0.12 && g.elapsed > 8) kind = 'time';
        g.queue.push({ at: g.elapsed + i * (0.18 - p * 0.08), kind });
      }
    };

    const slice = (it, ax, ay, bx, by) => {
      it.dead = true;
      const ang = Math.atan2(by - ay, bx - ax);
      const nx = -Math.sin(ang);
      const ny = Math.cos(ang);
      for (const side of [-1, 1]) {
        g.halves.push({
          kind: it.kind,
          r: it.r,
          x: it.x,
          y: it.y,
          rot: it.rot,
          ang,
          side,
          spin: 0,
          vx: it.vx * 0.6 + nx * side * 150,
          vy: Math.min(it.vy, 0) * 0.35 + ny * side * 150 - 60,
          vr: it.vr + side * 3,
          grav: it.grav,
          life: 1.4,
        });
      }
      const k = KINDS[it.kind];
      for (let i = 0; i < 14; i++) {
        const a = Math.random() * TAU;
        const sp = 120 + Math.random() * 320;
        g.sparks.push({
          x: it.x,
          y: it.y,
          vx: Math.cos(a) * sp,
          vy: Math.sin(a) * sp,
          life: 0.4 + Math.random() * 0.4,
          max: 0.8,
          color: k.color,
          size: 2 + Math.random() * 3,
        });
      }
      if (it.kind === 'box') {
        g.score = Math.max(0, g.score - 5);
        g.flash = 1;
        g.shake = 0.35;
        g.strokeHits = 0;
        popup(it.x, it.y, '−5', '#ff5468');
      } else if (it.kind === 'time') {
        g.timeLeft += k.seconds;
        g.strokeHits += 1;
        popup(it.x, it.y, `+${k.seconds} s`, '#7fd6ff');
      } else {
        g.score += k.points;
        g.strokeHits += 1;
        popup(it.x, it.y, `+${k.points}`, it.kind === 'gold' ? '#ffc14d' : '#ffffff');
      }
      setScore(g.score);
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
      setLeft(0);
      if (g.score > 0 && (!bestRef.current || g.score > bestRef.current)) {
        bestRef.current = g.score;
        saveBest(g.score);
        onBestRef.current(g.score);
        setIsRecord(true);
      }
      setPhase('done');
    };

    const start = () => {
      Object.assign(g, {
        playing: true,
        timeLeft: GAME_SECONDS,
        shownLeft: GAME_SECONDS,
        elapsed: 0,
        spawnIn: 0.4,
        score: 0,
        items: [],
        queue: [],
        halves: [],
        popups: [],
        strokeHits: 0,
      });
      setScore(0);
      setLeft(GAME_SECONDS);
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

      for (const it of g.items) {
        ctx.save();
        ctx.translate(it.x, it.y);
        ctx.rotate(it.rot);
        if (it.kind === 'gold' || it.kind === 'time') {
          ctx.shadowBlur = 24;
          ctx.shadowColor = KINDS[it.kind].color;
        }
        drawItem(ctx, it.kind, it.r);
        ctx.restore();
      }

      /* mitades: se dibuja el objeto completo recortado a un lado del corte */
      for (const h of g.halves) {
        ctx.save();
        ctx.globalAlpha = Math.min(1, h.life / 0.4);
        ctx.translate(h.x, h.y);
        ctx.rotate(h.spin + h.ang);
        const R = h.r * 1.6;
        ctx.beginPath();
        if (h.side < 0) ctx.rect(-R, -R, 2 * R, R);
        else ctx.rect(-R, 0, 2 * R, R);
        ctx.clip();
        ctx.rotate(h.rot - h.ang);
        drawItem(ctx, h.kind, h.r);
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
        ctx.font = `900 ${p.max > 1 ? 26 : 22}px Manrope, sans-serif`;
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

      if (g.flash > 0) {
        ctx.fillStyle = `rgba(255, 60, 80, ${g.flash * 0.35})`;
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
          g.spawnIn = 1.2 - progress() * 0.65 + Math.random() * 0.25;
        }
        while (g.queue.length && g.queue[0].at <= g.elapsed) launch(g.queue.shift().kind);
        const shown = Math.max(0, Math.ceil(g.timeLeft));
        if (shown !== g.shownLeft) {
          g.shownLeft = shown;
          setLeft(shown);
        }
        if (g.timeLeft <= 0) finish();
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

  const startGame = () => gameRef.current?.start();

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
        <span className="sg-chip sg-chip--soft">récord {best ?? '—'}</span>
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
            Desliza el dedo (o arrastra el mouse) para cortar. Tienes {GAME_SECONDS} segundos y cada vez saltan más
            rápido. Corta 3 o más de un solo tajo para hacer combo.
          </p>
          <Legend />
          <button type="button" className="sg-btn" onClick={startGame}>
            Desenvainar
          </button>
        </div>
      )}

      {phase === 'done' && (
        <div className="sg-panel">
          <p className="sg-kicker">{isRecord ? '¡nuevo récord!' : 'se acabó el tiempo'}</p>
          <p className="sg-score">{score}</p>
          <p className="sg-text">{slashMessage(score)}</p>
          <div className="sg-actions">
            <button type="button" className="sg-btn" onClick={startGame}>
              Otra ronda
            </button>
            <button type="button" className="sg-btn sg-btn--ghost" onClick={onClose}>
              Volver
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
  const [best, setBest] = useState(loadBest);
  const close = useCallback(() => setOpen(false), []);

  return (
    <Reveal as="section" className="sg-section">
      <span className="tj-cut tj-cut--fire" aria-hidden="true" />
      <p className="tj-eyebrow tj-eyebrow--warm">minijuego</p>
      <h2 className="tj-h2">Corte de demonios</h2>
      <p className="tj-lead">Como Tanjiro: corta a los demonios, pero nunca la caja de Nezuko.</p>

      <div className="sg-launch">
        <Legend />
        <button type="button" className="sg-btn sg-btn--big" onClick={() => setOpen(true)}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 20L20 4M14 4h6v6M7 13l4 4" />
          </svg>
          Jugar
        </button>
        <p className="sg-launch-best">{best ? `tu récord: ${best} puntos` : 'todavía no hay récord'}</p>
      </div>

      {/* portal: Reveal usa transform, que atraparía a un position:fixed */}
      {open && createPortal(<SlashArena best={best} onBest={setBest} onClose={close} />, document.body)}
    </Reveal>
  );
}
