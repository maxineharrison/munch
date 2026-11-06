/* munch — sound effects synthesised live with the Web Audio API (no audio files, no licences).
   Audio only starts after a user gesture, and a mute toggle is remembered. */
(function () {
  let ctx = null, master = null;
  let muted = false;
  try { muted = localStorage.getItem('munch.muted') === '1'; } catch (e) { /* ignore */ }

  function ensure() {
    if (muted) return null;
    // browsers keep audio suspended until the user has interacted; don't queue sounds that would replay late
    if (navigator.userActivation && !navigator.userActivation.hasBeenActive) return null;
    if (!ctx) {
      try {
        ctx = new (window.AudioContext || window.webkitAudioContext)();
        master = ctx.createGain(); master.gain.value = 0.55; master.connect(ctx.destination);
      } catch (e) { return null; }
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  const noiseBuf = (dur) => {
    const len = Math.max(1, Math.floor(ctx.sampleRate * dur));
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    return buf;
  };
  function crunch(t, freq, q, vol) {
    const src = ctx.createBufferSource(); src.buffer = noiseBuf(0.14);
    const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = freq; bp.Q.value = q;
    const g = ctx.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.11);
    src.connect(bp); bp.connect(g); g.connect(master); src.start(t); src.stop(t + 0.14);
  }
  function tone(t, freq, dur, type, vol, endFreq) {
    const o = ctx.createOscillator(); o.type = type || 'sine'; o.frequency.setValueAtTime(freq, t);
    if (endFreq) o.frequency.exponentialRampToValueAtTime(endFreq, t + dur);
    const g = ctx.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0008, t + dur);
    o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + 0.02);
  }

  const api = {
    munch() { // three crunchy bites
      const c = ensure(); if (!c) return; const t = c.currentTime;
      [0, 0.12, 0.25].forEach((o, i) => {
        crunch(t + o, 1300 + i * 450 + Math.random() * 350, 1.1, 0.9);
        crunch(t + o + 0.03, 3200 + Math.random() * 800, 2, 0.35);
        tone(t + o, 150, 0.09, 'sine', 0.5, 55);
      });
    },
    clink() { // two glasses meeting
      const c = ensure(); if (!c) return; const t = c.currentTime;
      [[0, 2350], [0.015, 3100]].forEach(([o, base]) => {
        [1, 1.51, 2.32, 3.1].forEach((m, i) => tone(t + o, base * m, 0.9 - i * 0.15, 'sine', 0.16 / (i + 1)));
      });
      crunch(t, 6000, 3, 0.25);
    },
    pop() { const c = ensure(); if (!c) return; tone(c.currentTime, 420, 0.1, 'sine', 0.35, 900); },
    tick() { const c = ensure(); if (!c) return; tone(c.currentTime, 1200, 0.04, 'triangle', 0.12); },
    star(rating) { // higher rating = higher note
      const c = ensure(); if (!c) return; const t = c.currentTime;
      const f = 440 * Math.pow(2, ((rating || 1) * 2 - 1) / 12 * 1.5);
      tone(t, f, 0.25, 'triangle', 0.3); tone(t + 0.07, f * 1.5, 0.3, 'sine', 0.18);
    },
    coin() {
      const c = ensure(); if (!c) return; const t = c.currentTime;
      tone(t, 988, 0.12, 'square', 0.12); tone(t + 0.09, 1319, 0.35, 'square', 0.12);
    },
    fanfare() {
      const c = ensure(); if (!c) return; const t = c.currentTime;
      [523, 659, 784, 1047].forEach((f, i) => tone(t + i * 0.09, f, 0.35, 'triangle', 0.25));
    },
    isMuted: () => muted,
    setMuted(m) {
      muted = !!m;
      try { localStorage.setItem('munch.muted', muted ? '1' : '0'); } catch (e) { /* ignore */ }
    },
  };
  window.Sound = api;
})();
