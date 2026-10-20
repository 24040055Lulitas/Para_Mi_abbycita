/* Sonidos del "Corte de demonios", suaves y tipo ASMR: soplos de aire,
   cortes finitos, campanitas y golpes sordos. Todo se genera aquí con
   Web Audio (no hay archivos) y pasa por un filtro y un eco leve para
   que nada suene chillón. */

const MUTE_KEY = 'abby-tanjiro-slash-muted';

export function loadMuted() {
  try {
    return localStorage.getItem(MUTE_KEY) === '1';
  } catch {
    return false;
  }
}

export function saveMuted(muted) {
  try {
    localStorage.setItem(MUTE_KEY, muted ? '1' : '0');
  } catch {
    /* sin almacenamiento, no pasa nada */
  }
}

export function createSlashSounds() {
  let ctx = null;
  let out = null;
  let noise = null;
  let muted = loadMuted();
  let lastSwish = 0;

  /* el audio se crea con el primer toque (los navegadores lo exigen) */
  const ready = () => {
    if (muted) return null;
    try {
      if (!ctx) {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        if (!Ctx) return null;
        ctx = new Ctx();
        const master = ctx.createGain();
        master.gain.value = 0.55;
        const soft = ctx.createBiquadFilter();
        soft.type = 'lowpass';
        soft.frequency.value = 5200;
        /* eco muy leve: le da aire, como en una habitación tranquila */
        const delay = ctx.createDelay();
        delay.delayTime.value = 0.11;
        const feedback = ctx.createGain();
        feedback.gain.value = 0.22;
        const wet = ctx.createGain();
        wet.gain.value = 0.18;
        master.connect(soft);
        soft.connect(ctx.destination);
        soft.connect(delay);
        delay.connect(feedback);
        feedback.connect(delay);
        delay.connect(wet);
        wet.connect(ctx.destination);
        out = master;

        const len = ctx.sampleRate;
        noise = ctx.createBuffer(1, len, ctx.sampleRate);
        const d = noise.getChannelData(0);
        for (let i = 0; i < len; i += 1) d[i] = Math.random() * 2 - 1;
      }
      if (ctx.state === 'suspended') ctx.resume().catch(() => {});
      return ctx;
    } catch {
      return null;
    }
  };

  /* ruido filtrado: soplos y cortes */
  const air = ({ at = 0, dur, from, to = from, q = 1.2, gain, type = 'bandpass' }) => {
    const t = ctx.currentTime + at;
    const src = ctx.createBufferSource();
    src.buffer = noise;
    const f = ctx.createBiquadFilter();
    f.type = type;
    f.Q.value = q;
    f.frequency.setValueAtTime(from, t);
    f.frequency.exponentialRampToValueAtTime(to, t + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + Math.min(0.03, dur * 0.3));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f).connect(g).connect(out);
    src.start(t, Math.random() * 0.5);
    src.stop(t + dur + 0.05);
  };

  /* tono suave: campanitas y golpes */
  const tone = ({ at = 0, freq, to = freq, dur, gain, type = 'sine', attack = 0.006 }) => {
    const t = ctx.currentTime + at;
    const o = ctx.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    if (to !== freq) o.frequency.exponentialRampToValueAtTime(to, t + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(out);
    o.start(t);
    o.stop(t + dur + 0.05);
  };

  const vary = (n, amount = 0.08) => n * (1 + (Math.random() - 0.5) * amount * 2);

  return {
    get muted() {
      return muted;
    },
    setMuted(value) {
      muted = value;
      saveMuted(value);
      if (muted && ctx) ctx.suspend().catch(() => {});
      if (!muted) ready();
    },
    /* para "despertar" el audio dentro de un toque */
    unlock() {
      ready();
    },
    /* soplo de la espada al mover rápido el dedo */
    swish(speed = 1) {
      const now = performance.now();
      if (now - lastSwish < 150 || !ready()) return;
      lastSwish = now;
      const s = Math.min(1.4, speed);
      air({ dur: 0.2, from: vary(2600), to: 700, q: 0.9, gain: 0.05 * s });
    },
    /* corte limpio a un demonio */
    slice() {
      if (!ready()) return;
      air({ dur: 0.07, from: vary(4200), to: 2400, q: 1.6, gain: 0.09 });
      tone({ freq: vary(1150), to: 820, dur: 0.09, gain: 0.025, type: 'triangle' });
    },
    /* Enmu: corte con una campanita */
    enmu() {
      if (!ready()) return;
      this.slice();
      tone({ at: 0.03, freq: 1318, dur: 0.6, gain: 0.03 });
      tone({ at: 0.09, freq: 1760, dur: 0.7, gain: 0.022 });
    },
    /* reloj de arena: dos notas como de cristal */
    time() {
      if (!ready()) return;
      tone({ freq: 988, dur: 0.7, gain: 0.035 });
      tone({ at: 0.08, freq: 1480, dur: 0.9, gain: 0.025 });
    },
    /* aldeano: golpe sordo y grave, sin estridencias */
    villager() {
      if (!ready()) return;
      tone({ freq: 240, to: 120, dur: 0.32, gain: 0.09, type: 'triangle' });
      air({ dur: 0.18, from: 600, to: 250, q: 0.7, gain: 0.04, type: 'lowpass' });
      tone({ at: 0.12, freq: 196, to: 150, dur: 0.3, gain: 0.04 });
    },
    /* golpe a una Luna Superior: "tok" amortiguado */
    bossHit() {
      if (!ready()) return;
      tone({ freq: vary(190, 0.12), to: 95, dur: 0.14, gain: 0.07 });
      air({ dur: 0.06, from: vary(3400), to: 1800, q: 1.4, gain: 0.05 });
    },
    /* Luna Superior vencida: arpegio suave */
    bossDown() {
      if (!ready()) return;
      [523, 659, 784, 1046].forEach((f, i) => tone({ at: i * 0.07, freq: f, dur: 0.9, gain: 0.03 }));
      air({ dur: 0.5, from: 3000, to: 600, q: 0.8, gain: 0.04 });
    },
    /* combo: dos notitas que suben */
    combo(n = 3) {
      if (!ready()) return;
      const base = 660 + Math.min(6, n) * 40;
      tone({ freq: base, dur: 0.35, gain: 0.025 });
      tone({ at: 0.06, freq: base * 1.5, dur: 0.45, gain: 0.02 });
    },
    /* llega Muzan (o cambia de forma): un zumbido grave que crece despacio */
    muzan() {
      if (!ready()) return;
      tone({ freq: 55, dur: 2.6, gain: 0.09, attack: 0.7 });
      tone({ freq: 82.4, dur: 2.4, gain: 0.05, attack: 0.9 });
      air({ dur: 2, from: 400, to: 120, q: 0.6, gain: 0.03, type: 'lowpass' });
    },
    /* fin de la partida: campanitas que bajan */
    end() {
      if (!ready()) return;
      [784, 659, 523].forEach((f, i) => tone({ at: i * 0.12, freq: f, dur: 0.9, gain: 0.028 }));
    },
    close() {
      if (ctx) ctx.close().catch(() => {});
      ctx = null;
    },
  };
}
