/* Pizza Emergency at the Techno — a very slow, very old school easter egg.
   160x144 canvas, hand-made 5x7 bitmap font, procedural pixel art and a tiny
   WebAudio chiptune synth. The story is one async script (say / menu / wait)
   running on top of a fixed 60 Hz update loop. */
(() => {
  "use strict";

  const W = 160, H = 144;
  const cv = document.getElementById("screen");
  const g = cv.getContext("2d");
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const C = {
    out: "#0a080c", ink: "#17141a", ink2: "#26222b", night: "#1d1b3a", navy: "#1d2b53",
    purp: "#4b3a63", plum: "#3a2f4a", gray: "#8f87a0", lgray: "#c9c3d3", cream: "#fff8e6",
    yellow: "#fcff6f", gold: "#f2c14e", orange: "#f29b38", coral: "#e9566f", dcoral: "#a13448",
    red: "#c8302f", cyan: "#20c9e6", dcyan: "#137a8f", basil: "#45c47f", dbasil: "#23744a",
    brown: "#8a5a3b", dbrown: "#5c3a24", tan: "#d9a066", dough: "#efd3a0",
    skin1: "#f2c9a0", skin2: "#c98b5a", skin3: "#7a4b2e"
  };

  // ---------------------------------------------------------------- font
  // 5x7 glyphs, rows separated by spaces. ` is the menu cursor, | the "more" arrow,
  // ~ a heart, ^ a music note, @ a star.
  const FONT_SRC = [
    ["A", ".###. #...# #...# ##### #...# #...# #...#"], ["B", "####. #...# #...# ####. #...# #...# ####."],
    ["C", ".###. #...# #.... #.... #.... #...# .###."], ["D", "####. #...# #...# #...# #...# #...# ####."],
    ["E", "##### #.... #.... ####. #.... #.... #####"], ["F", "##### #.... #.... ####. #.... #.... #...."],
    ["G", ".###. #...# #.... #.### #...# #...# .####"], ["H", "#...# #...# #...# ##### #...# #...# #...#"],
    ["I", ".###. ..#.. ..#.. ..#.. ..#.. ..#.. .###."], ["J", "..### ...#. ...#. ...#. ...#. #..#. .##.."],
    ["K", "#...# #..#. #.#.. ##... #.#.. #..#. #...#"], ["L", "#.... #.... #.... #.... #.... #.... #####"],
    ["M", "#...# ##.## #.#.# #.#.# #...# #...# #...#"], ["N", "#...# #...# ##..# #.#.# #..## #...# #...#"],
    ["O", ".###. #...# #...# #...# #...# #...# .###."], ["P", "####. #...# #...# ####. #.... #.... #...."],
    ["Q", ".###. #...# #...# #...# #.#.# #..#. .##.#"], ["R", "####. #...# #...# ####. #.#.. #..#. #...#"],
    ["S", ".#### #.... #.... .###. ....# ....# ####."], ["T", "##### ..#.. ..#.. ..#.. ..#.. ..#.. ..#.."],
    ["U", "#...# #...# #...# #...# #...# #...# .###."], ["V", "#...# #...# #...# #...# #...# .#.#. ..#.."],
    ["W", "#...# #...# #...# #.#.# #.#.# #.#.# .#.#."], ["X", "#...# #...# .#.#. ..#.. .#.#. #...# #...#"],
    ["Y", "#...# #...# .#.#. ..#.. ..#.. ..#.. ..#.."], ["Z", "##### ....# ...#. ..#.. .#... #.... #####"],
    ["0", ".###. #...# #..## #.#.# ##..# #...# .###."], ["1", "..#.. .##.. ..#.. ..#.. ..#.. ..#.. .###."],
    ["2", ".###. #...# ....# ...#. ..#.. .#... #####"], ["3", "####. ....# ....# .###. ....# ....# ####."],
    ["4", "...#. ..##. .#.#. #..#. ##### ...#. ...#."], ["5", "##### #.... ####. ....# ....# #...# .###."],
    ["6", "..##. .#... #.... ####. #...# #...# .###."], ["7", "##### ....# ...#. ..#.. .#... .#... .#..."],
    ["8", ".###. #...# #...# .###. #...# #...# .###."], ["9", ".###. #...# #...# .#### ....# ...#. .##.."],
    [".", "..... ..... ..... ..... ..... .##.. .##.."], [",", "..... ..... ..... ..... .##.. ..#.. .#..."],
    ["!", "..#.. ..#.. ..#.. ..#.. ..#.. ..... ..#.."], ["?", ".###. #...# ....# ...#. ..#.. ..... ..#.."],
    ["'", "..#.. ..#.. .#... ..... ..... ..... ....."], ["\"", ".#.#. .#.#. ..... ..... ..... ..... ....."],
    [":", "..... .##.. .##.. ..... .##.. .##.. ....."], [";", "..... .##.. .##.. ..... .##.. ..#.. .#..."],
    ["-", "..... ..... ..... .###. ..... ..... ....."], ["+", "..... ..#.. ..#.. ##### ..#.. ..#.. ....."],
    ["=", "..... ..... ##### ..... ##### ..... ....."], ["/", "....# ...#. ...#. ..#.. .#... .#... #...."],
    ["(", "...#. ..#.. .#... .#... .#... ..#.. ...#."], [")", ".#... ..#.. ...#. ...#. ...#. ..#.. .#..."],
    ["*", "..... ..#.. #.#.# .###. #.#.# ..#.. ....."], ["#", ".#.#. .#.#. ##### .#.#. ##### .#.#. .#.#."],
    ["&", ".##.. #..#. #.#.. .#... #.#.# #..#. .##.#"], ["%", "##..# ##..# ...#. ..#.. .#... #..## #..##"],
    ["<", "...#. ..#.. .#... #.... .#... ..#.. ...#."], [">", ".#... ..#.. ...#. ....# ...#. ..#.. .#..."],
    ["$", "..#.. .#### #.#.. .###. ..#.# ####. ..#.."], ["_", "..... ..... ..... ..... ..... ..... #####"],
    ["^", "..##. ..#.# ..#.. ..#.. ###.. ###.. ....."], ["~", "..... .#.#. ##### ##### .###. ..#.. ....."],
    ["@", "..#.. ..#.. ##### .###. .#.#. #...# ....."], ["`", "#.... ##... ###.. ####. ###.. ##... #...."],
    ["|", "..... ..... ##### .###. ..#.. ..... ....."]
  ];
  const FONT = {};
  FONT_SRC.forEach(([ch, src]) => {
    const pts = [];
    src.split(" ").forEach((row, y) => { for (let x = 0; x < 5; x++) if (row[x] === "#") pts.push(x, y); });
    FONT[ch] = pts;
  });

  function text(str, x, y, col, s = 1) {
    g.fillStyle = col;
    str = String(str).toUpperCase();
    for (let i = 0; i < str.length; i++) {
      const pts = FONT[str[i]];
      if (pts) for (let k = 0; k < pts.length; k += 2) g.fillRect(x + pts[k] * s, y + pts[k + 1] * s, s, s);
      x += 6 * s;
    }
  }
  const textW = (str, s = 1) => str.length * 6 * s - s;
  const textC = (str, y, col, s = 1, cx = W / 2) => text(str, Math.round(cx - textW(str, s) / 2), y, col, s);
  function textShadow(str, y, col, s, sh = C.out) { textC(str, y + s, sh, s); textC(str, y, col, s); }

  function wrap(str, max) {
    const out = [];
    String(str).split("\n").forEach((para) => {
      let line = "";
      para.split(" ").forEach((word) => {
        if (!line) line = word;
        else if ((line + " " + word).length <= max) line += " " + word;
        else { out.push(line); line = word; }
      });
      out.push(line);
    });
    return out;
  }

  // ---------------------------------------------------------------- drawing helpers
  function R(x, y, w, h, c) { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); }
  function circ(cx, cy, r, c, sy = 1) {
    g.fillStyle = c;
    const rr = Math.round(r * sy);
    for (let dy = -rr; dy <= rr; dy++) {
      const dx = Math.floor(Math.sqrt(Math.max(0, r * r - (dy / sy) * (dy / sy))));
      g.fillRect(Math.round(cx - dx), Math.round(cy + dy), dx * 2 + 1, 1);
    }
  }
  function tri(x, y, w, h, c) { // upward triangle, apex centered
    g.fillStyle = c;
    for (let i = 0; i < h; i++) { const hw = Math.round((w / 2) * (i / h)); g.fillRect(Math.round(x + w / 2 - hw), y + i, hw * 2, 1); }
  }
  function box(x, y, w, h, fill = C.cream, line = C.ink) {
    R(x, y, w, h, line);
    R(x + 1, y + 1, w - 2, h - 2, fill);
    R(x + 2, y + 2, w - 4, 1, line); R(x + 2, y + h - 3, w - 4, 1, line);
    R(x + 2, y + 2, 1, h - 4, line); R(x + w - 3, y + 2, 1, h - 4, line);
  }
  function seeded(seed) {
    return () => {
      seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const STARS = (() => { const r = seeded(7); return Array.from({ length: 46 }, () => [Math.floor(r() * W), Math.floor(r() * 90), r()]); })();
  function stars(t, maxY = 90) {
    STARS.forEach(([x, y, p]) => { if (y < maxY) R(x, y, 1, 1, Math.sin(t / 40 + p * 9) > 0.6 ? C.gray : C.cream); });
  }

  // ---------------------------------------------------------------- sprites
  // 16x16 people, palette-swapped. H hair/cap, S skin, E eyes, T shirt, P pants, F shoes.
  const BODY = {
    down: ["................", ".....HHHHHH.....", "....HHHHHHHH....", "....HHHHHHHH....", "....HSSSSSSH....",
      "....SSESSESS....", "....SSSSSSSS....", ".....SSSSSS.....", "....TTTTTTTT....", "...TTTTTTTTTT...",
      "...STTTTTTTTS...", "...STTTTTTTTS...", "....PPPPPPPP...."],
    up: ["................", ".....HHHHHH.....", "....HHHHHHHH....", "....HHHHHHHH....", "....HHHHHHHH....",
      "....HHHHHHHH....", "....SHHHHHHS....", ".....SSSSSS.....", "....TTTTTTTT....", "...TTTTTTTTTT...",
      "...STTTTTTTTS...", "...STTTTTTTTS...", "....PPPPPPPP...."],
    side: ["................", ".....HHHHH......", "....HHHHHHH.....", "....HHHHHHHH....", "....HHHSSSSS....",
      "....HHSSSESS....", "....HSSSSSSSS...", ".....SSSSSS.....", ".....TTTTTT.....", "....TTTTTTTT....",
      "....TTTTSTTT....", "....TTTTSTTT....", ".....PPPPPP....."]
  };
  const CAP = { // the hero wears a backwards-ish pizza cap
    down: { 3: "...HHHHHHHHHH...", 4: "....SSSSSSSS...." },
    side: { 3: "....HHHHHHHHHHH.", 4: "....HHSSSSSS...." }
  };
  const LEGS = {
    front: [["....PPP..PPP....", "....PPP..PPP....", "....FFF..FFF...."],
      ["....PPP..PPP....", "....FFF..PPP....", ".........FFF...."],
      ["....PPP..PPP....", "....PPP..FFF....", "....FFF........."]],
    side: [[".....PPPPPP.....", ".....PP..PP.....", ".....FF..FF....."],
      [".....PPPPPP.....", "....PP....PP....", "...FF......FF..."],
      [".....PPPPPP.....", "......PPPP......", "......FFFF......"]]
  };
  const PAL = {
    hero: { H: C.coral, S: C.skin1, E: C.ink, T: C.cream, P: C.navy, F: C.ink, cap: true },
    boss: { H: C.lgray, S: C.skin2, E: C.ink, T: C.cream, P: C.dbrown, F: C.ink, stache: true },
    bouncer: { H: C.skin3, S: C.skin3, E: C.ink, T: C.plum, P: C.ink2, F: C.ink },
    bar: { H: C.purp, S: C.skin1, E: C.ink, T: C.coral, P: C.ink2, F: C.ink },
    dj: { H: C.yellow, S: C.skin2, E: C.ink, T: C.cyan, P: C.ink2, F: C.ink, phones: true },
    dancer: { H: C.coral, S: C.skin3, E: C.ink, T: C.yellow, P: C.dcyan, F: C.ink },
    raver: { H: C.tan, S: C.skin1, E: C.ink, T: C.basil, P: C.navy, F: C.ink },
    glow: { H: C.ink, S: C.skin2, E: C.ink, T: C.purp, P: C.ink2, F: C.cyan, glow: true },
    old: { H: C.lgray, S: C.skin1, E: C.ink, T: C.dcoral, P: C.brown, F: C.ink },
    promo: { H: C.brown, S: C.skin2, E: C.ink, T: C.cream, P: C.ink, F: C.ink },
    crowdA: { H: C.cyan, S: C.skin2, E: C.ink, T: C.coral, P: C.ink2, F: C.ink },
    crowdB: { H: C.yellow, S: C.skin3, E: C.ink, T: C.purp, P: C.navy, F: C.ink },
    crowdC: { H: C.dbrown, S: C.skin1, E: C.ink, T: C.cyan, P: C.ink2, F: C.ink }
  };
  const spriteCache = {};
  function sprite(palName, dir, frame) {
    const key = palName + dir + frame;
    if (spriteCache[key]) return spriteCache[key];
    const pal = PAL[palName];
    const base = dir === "left" || dir === "right" ? "side" : dir;
    const rows = BODY[base].slice();
    if (pal.cap && CAP[base]) Object.entries(CAP[base]).forEach(([i, r]) => { rows[i] = r; });
    rows.push(...LEGS[base === "side" ? "side" : "front"][frame]);
    const c = document.createElement("canvas");
    c.width = c.height = 16;
    const x = c.getContext("2d");
    const on = (i, j) => i >= 0 && j >= 0 && i < 16 && j < 16 && rows[j][i] !== ".";
    for (let j = 0; j < 16; j++) for (let i = 0; i < 16; i++) {
      if (on(i, j)) { x.fillStyle = pal[rows[j][i]]; x.fillRect(i, j, 1, 1); }
      else if (on(i - 1, j) || on(i + 1, j) || on(i, j - 1) || on(i, j + 1)) { x.fillStyle = C.out; x.fillRect(i, j, 1, 1); }
    }
    if (pal.stache && base === "down") { x.fillStyle = C.lgray; x.fillRect(5, 6, 6, 1); }
    if (pal.phones && base !== "up") { x.fillStyle = C.ink; x.fillRect(base === "side" ? 6 : 3, 4, 2, 3); if (base !== "side") x.fillRect(11, 4, 2, 3); }
    if (pal.glow) { x.fillStyle = C.basil; x.fillRect(2, 6, 1, 5); x.fillStyle = C.yellow; x.fillRect(13, 6, 1, 5); }
    spriteCache[key] = c;
    return c;
  }
  function drawPerson(pal, dir, frame, x, y) {
    const s = sprite(pal, dir, frame);
    x = Math.round(x); y = Math.round(y);
    if (dir === "left") { g.save(); g.translate(x + 16, y); g.scale(-1, 1); g.drawImage(s, 0, 0); g.restore(); }
    else g.drawImage(s, x, y);
  }

  // ---------------------------------------------------------------- audio
  const AU = { ctx: null, out: null, lp: null, noise: null, on: true, song: null, step: 0, next: 0 };
  try { AU.on = localStorage.getItem("pt-emergency-sound") !== "off"; } catch (e) { /* private mode */ }
  const midi = (m) => 440 * Math.pow(2, (m - 69) / 12);

  function audioInit() {
    if (AU.ctx) { if (AU.ctx.state === "suspended") AU.ctx.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    const ctx = (AU.ctx = new AC());
    AU.out = ctx.createGain();
    AU.out.gain.value = AU.on ? 0.32 : 0;
    AU.lp = ctx.createBiquadFilter();
    AU.lp.type = "lowpass";
    AU.lp.frequency.value = 18000;
    AU.out.connect(AU.lp);
    AU.lp.connect(ctx.destination);
    AU.noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const d = AU.noise.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    setInterval(schedule, 25);
  }
  function osc(type, f, t, dur, vol, f2) {
    const ctx = AU.ctx, o = ctx.createOscillator(), a = ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f, t);
    if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + dur);
    a.gain.setValueAtTime(vol, t);
    a.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(a); a.connect(AU.out);
    o.start(t); o.stop(t + dur + 0.02);
  }
  function nz(t, dur, vol, freq, type = "highpass") {
    const ctx = AU.ctx, s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), a = ctx.createGain();
    s.buffer = AU.noise;
    f.type = type; f.frequency.value = freq;
    a.gain.setValueAtTime(vol, t);
    a.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(a); a.connect(AU.out);
    s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.02);
  }
  const kick = (t) => osc("sine", 150, t, 0.28, 0.9, 38);
  const hat = (t) => nz(t, 0.04, 0.18, 7000);
  const clap = (t) => nz(t, 0.14, 0.3, 1400, "bandpass");

  const n = null;
  const SONGS = {
    title: { bpm: 76, len: 32, play(s, t) {
      const arp = [57, 60, 64, 67, 57, 60, 64, 69, 55, 59, 62, 67, 53, 57, 60, 65];
      if (s % 2 === 0) osc("triangle", midi(arp[(s / 2) % 16] - 12), t, 0.3, 0.25);
      const mel = [76, n, n, n, 74, n, 72, n, 71, n, n, n, 67, n, n, n, 69, n, n, n, 71, n, 72, n, 74, n, n, n, n, n, n, n];
      if (mel[s]) osc("square", midi(mel[s]), t, 0.5, 0.05);
    } },
    club: { bpm: 122, len: 64, play(s, t) {
      if (s % 4 === 0) kick(t);
      if (s % 4 === 2) hat(t);
      if (s % 8 === 4) clap(t);
      const bass = [45, n, 45, 45, n, 45, 57, n, 45, n, 45, 48, n, 45, 55, n];
      const root = [0, 0, 3, -2][Math.floor(s / 16)];
      if (bass[s % 16]) osc("sawtooth", midi(bass[s % 16] + root - 12), t, 0.11, 0.12);
      if (s % 32 === 6) [69, 72, 76].forEach((m) => osc("square", midi(m + root), t, 0.18, 0.03));
    } },
    alarm: { bpm: 96, len: 16, play(s, t) {
      if (s % 8 === 0) osc("triangle", 620, t, 0.6, 0.22, 980);
      if (s % 8 === 4) osc("triangle", 980, t, 0.6, 0.22, 620);
      if (s % 4 === 0) osc("sine", 80, t, 0.25, 0.4, 40);
    } },
    run: { bpm: 138, len: 32, play(s, t) {
      if (s % 4 === 0) kick(t);
      if (s % 2 === 1) hat(t);
      const b = [45, 57, 45, 57, 48, 60, 48, 60, 43, 55, 43, 55, 50, 62, 52, 64];
      osc("square", midi(b[s % 16] - 12), t, 0.09, 0.07);
      const mel = [69, n, n, 72, n, n, 76, n, 74, n, 72, n, 71, n, 67, n, 69, n, n, 72, n, n, 76, n, 79, n, 76, n, 74, n, n, n];
      if (mel[s]) osc("square", midi(mel[s]), t, 0.2, 0.045);
    } },
    kitchen: { bpm: 104, len: 32, play(s, t) {
      const mel = [69, n, 72, n, 76, n, 72, n, 69, n, 72, n, 76, n, n, n, 71, n, 74, n, 77, n, 74, n, 71, n, 74, n, 76, n, n, n];
      if (mel[s]) osc("square", midi(mel[s]), t, 0.16, 0.05);
      const bass = [45, n, n, n, 52, n, n, n, 45, n, n, n, 52, n, n, n, 47, n, n, n, 52, n, n, n, 45, n, n, n, 52, n, n, n];
      if (bass[s]) osc("triangle", midi(bass[s] - 12), t, 0.25, 0.3);
      if (s % 4 === 2) nz(t, 0.03, 0.08, 8000);
    } },
    end: { bpm: 84, len: 32, play(s, t) {
      const mel = [72, n, 72, n, 72, n, 76, n, 79, n, n, n, 76, n, 79, n, 84, n, n, n, n, n, n, n, 83, n, 79, n, 76, n, 77, n];
      if (mel[s]) osc("square", midi(mel[s]), t, 0.3, 0.05);
      if (s % 4 === 0) osc("triangle", midi([48, 48, 53, 55, 48, 48, 53, 55][Math.floor(s / 4)] - 12), t, 0.5, 0.3);
    } }
  };
  function schedule() {
    const ctx = AU.ctx;
    if (!ctx || !AU.song) return;
    const song = SONGS[AU.song];
    while (AU.next < ctx.currentTime + 0.12) {
      if (AU.next < ctx.currentTime - 0.2) AU.next = ctx.currentTime; // tab was asleep
      song.play(AU.step, AU.next);
      AU.step = (AU.step + 1) % song.len;
      AU.next += 60 / song.bpm / 4;
    }
  }
  function music(name, muffled = false) {
    if (AU.lp) AU.lp.frequency.setTargetAtTime(muffled ? 520 : 18000, AU.ctx.currentTime, 0.2);
    if (AU.song === name) return;
    AU.song = name;
    AU.step = 0;
    if (AU.ctx) AU.next = AU.ctx.currentTime + 0.05;
  }
  function sfx(name) {
    const ctx = AU.ctx;
    if (!ctx || !AU.on) return;
    const t = ctx.currentTime + 0.005;
    switch (name) {
      case "blip": osc("square", 740, t, 0.03, 0.035); break;
      case "cursor": osc("square", 620, t, 0.05, 0.06); break;
      case "select": osc("square", 880, t, 0.06, 0.07); osc("square", 1320, t + 0.06, 0.08, 0.07); break;
      case "bump": osc("square", 90, t, 0.07, 0.12); break;
      case "ding": osc("triangle", 1568, t, 0.5, 0.25); osc("triangle", 1568, t + 0.25, 0.6, 0.25); break;
      case "scratch": nz(t, 0.45, 0.6, 900, "bandpass"); osc("sawtooth", 400, t, 0.4, 0.15, 60); break;
      case "squish": osc("sine", 220, t, 0.12, 0.3, 120); break;
      case "plop": osc("square", 520, t, 0.05, 0.06, 900); break;
      case "good": [72, 76, 79, 84].forEach((m, i) => osc("square", midi(m), t + i * 0.08, 0.12, 0.06)); break;
      case "ok": [72, 76].forEach((m, i) => osc("square", midi(m), t + i * 0.1, 0.12, 0.06)); break;
      case "bad": [64, 60, 55].forEach((m, i) => osc("square", midi(m), t + i * 0.12, 0.14, 0.06)); break;
      case "cheer": nz(t, 1.6, 0.35, 1800, "bandpass"); break;
      case "drop": osc("sine", 120, t, 0.9, 1, 30); nz(t, 0.6, 0.3, 400, "lowpass"); break;
    }
  }
  function toggleSound() {
    audioInit();
    AU.on = !AU.on;
    try { localStorage.setItem("pt-emergency-sound", AU.on ? "on" : "off"); } catch (e) { /* ignore */ }
    if (AU.out) AU.out.gain.value = AU.on ? 0.32 : 0;
    G.toast = { text: AU.on ? "^ SOUND ON" : "SOUND OFF", until: G.t + 90 };
  }
  document.addEventListener("visibilitychange", () => {
    if (!AU.ctx) return;
    if (document.hidden) AU.ctx.suspend(); else AU.ctx.resume();
  });

  // ---------------------------------------------------------------- input
  const held = {}, pressed = {};
  let dirStack = [];
  const DIRS = ["up", "down", "left", "right"];
  function press(k) {
    audioInit();
    if (!held[k]) pressed[k] = true;
    held[k] = true;
    if (DIRS.includes(k)) { dirStack = dirStack.filter((d) => d !== k); dirStack.push(k); }
    if (k === "select") toggleSound();
  }
  function release(k) { held[k] = false; dirStack = dirStack.filter((d) => d !== k); }
  const KEYS = {
    ArrowUp: "up", KeyW: "up", ArrowDown: "down", KeyS: "down", ArrowLeft: "left", KeyA: "left", ArrowRight: "right", KeyD: "right",
    KeyZ: "a", Space: "a", KeyJ: "a", KeyX: "b", Escape: "b", KeyK: "b", Backspace: "b", Enter: "start", KeyM: "select"
  };
  addEventListener("keydown", (e) => {
    const k = KEYS[e.code];
    if (!k || e.metaKey || e.ctrlKey || e.altKey) return;
    e.preventDefault();
    if (!e.repeat) press(k);
  });
  addEventListener("keyup", (e) => { const k = KEYS[e.code]; if (k) release(k); });
  addEventListener("blur", () => Object.keys(held).forEach(release));

  document.querySelectorAll("[data-key]").forEach((btn) => {
    const k = btn.getAttribute("data-key");
    btn.addEventListener("pointerdown", (e) => { e.preventDefault(); btn.setPointerCapture(e.pointerId); btn.setAttribute("data-on", ""); press(k); });
    const up = () => { btn.removeAttribute("data-on"); release(k); };
    btn.addEventListener("pointerup", up);
    btn.addEventListener("pointercancel", up);
    btn.addEventListener("contextmenu", (e) => e.preventDefault());
  });
  const pad = document.querySelector("[data-dpad]");
  if (pad) {
    let cur = null;
    const setDir = (d) => {
      if (d === cur) return;
      if (cur) { release(cur); pad.querySelector(".dpad__" + cur[0]).removeAttribute("data-on"); }
      cur = d;
      if (d) { press(d); pad.querySelector(".dpad__" + d[0]).setAttribute("data-on", ""); }
    };
    const fromEvent = (e) => {
      const r = pad.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
      if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return null;
      return Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : (dy > 0 ? "down" : "up");
    };
    pad.addEventListener("pointerdown", (e) => { e.preventDefault(); pad.setPointerCapture(e.pointerId); setDir(fromEvent(e)); });
    pad.addEventListener("pointermove", (e) => { if (cur) setDir(fromEvent(e)); });
    pad.addEventListener("pointerup", () => setDir(null));
    pad.addEventListener("pointercancel", () => setDir(null));
  }
  // tapping the screen = A (or picks the tapped menu option)
  cv.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    audioInit();
    const r = cv.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * W, y = ((e.clientY - r.top) / r.height) * H;
    const ui = G.ui;
    if (ui && ui.kind === "menu" && ui.rects) {
      const hit = ui.rects.findIndex((o) => x >= o.x && x < o.x + o.w && y >= o.y && y < o.y + o.h);
      if (hit >= 0) { ui.sel = hit; pressed.a = true; return; }
    }
    pressed.a = true;
  });

  // ---------------------------------------------------------------- game state + script primitives
  const G = { t: 0, scene: null, ui: null, fade: 1, letterbox: 0, waits: [], tweens: [], shake: 0, alarm: 0, skipping: false, toast: null, busy: false, mode: "cut" };
  const TYPE = 4; // ticks per letter: slow, on purpose

  function wait(sec) {
    if (G.skipping) return Promise.resolve();
    return new Promise((res) => G.waits.push({ at: G.t + Math.round(sec * 60), res }));
  }
  function tween(key, to, sec) {
    if (G.skipping || sec <= 0) { G[key] = to; return Promise.resolve(); }
    return new Promise((res) => G.tweens.push({ key, from: G[key], to, t0: G.t, dur: sec * 60, res }));
  }
  const fadeOut = (s = 1) => tween("fade", 1, s);
  const fadeIn = (s = 1) => tween("fade", 0, s);

  function say(str, name) {
    const lines = wrap(str, 24);
    const pages = [];
    for (let i = 0; i < lines.length; i += 3) pages.push(lines.slice(i, i + 3));
    return new Promise((res) => { G.ui = { kind: "say", name, pages, page: 0, shown: 0, res }; });
  }
  function menu(question, opts, name) {
    return new Promise((res) => { G.ui = { kind: "menu", q: question ? wrap(question, 24).slice(0, 3) : null, name, opts, sel: 0, res, t0: G.t }; });
  }
  function caption(str, hold = 2.5, where = "bottom") {
    if (G.skipping) return Promise.resolve();
    return new Promise((res) => { G.ui = { kind: "cap", lines: wrap(str, 24), shown: 0, hold: hold * 60, idle: 0, where, res }; });
  }
  function waitA() { return new Promise((res) => { G.ui = { kind: "press", res }; }); }
  function closeUI(v) { const ui = G.ui; G.ui = null; ui.res(v); }
  const pageLen = (p) => p.reduce((a, l) => a + l.length, 0);

  function updateUI() {
    const ui = G.ui;
    if (!ui) return;
    const go = pressed.a || pressed.b;
    if (ui.kind === "say") {
      const total = pageLen(ui.pages[ui.page]);
      if (ui.shown < total) {
        if (go) ui.shown = total;
        else if (G.t % TYPE === 0) { ui.shown++; if (ui.shown % 2) sfx("blip"); }
      } else if (go) {
        sfx("cursor");
        ui.page++; ui.shown = 0;
        if (ui.page >= ui.pages.length) closeUI();
      }
    } else if (ui.kind === "cap") {
      const total = pageLen(ui.lines);
      if (G.skipping) return closeUI();
      if (ui.shown < total) { if (go) ui.shown = total; else if (G.t % TYPE === 0) ui.shown++; }
      else if (go || ++ui.idle > ui.hold) closeUI();
    } else if (ui.kind === "menu") {
      if (G.t - ui.t0 < 8) return;
      if (pressed.up) { ui.sel = (ui.sel + ui.opts.length - 1) % ui.opts.length; sfx("cursor"); }
      if (pressed.down) { ui.sel = (ui.sel + 1) % ui.opts.length; sfx("cursor"); }
      if (pressed.a || pressed.start) { sfx("select"); closeUI(ui.sel); }
    } else if (ui.kind === "press") {
      if (pressed.a || pressed.start) { sfx("select"); closeUI(); }
    } else if (ui.update) ui.update();
  }

  function typed(lines, shown) {
    let left = shown;
    return lines.map((l) => { const s = l.slice(0, Math.max(0, left)); left -= l.length; return s; });
  }
  function drawDialog(lines, name, done) {
    const y = H - 40;
    box(2, y, W - 4, 38);
    lines.forEach((l, i) => text(l, 8, y + 6 + i * 10, C.ink));
    if (name) {
      const w = textW(name) + 10;
      R(6, y - 11, w, 12, C.ink);
      text(name, 11, y - 8, C.yellow);
    }
    if (done && Math.floor(G.t / 24) % 2) text("|", W - 14, y + 29, C.coral);
  }
  function drawUI() {
    const ui = G.ui;
    if (!ui) return;
    if (ui.kind === "say") {
      const p = ui.pages[ui.page];
      drawDialog(typed(p, ui.shown), ui.name, ui.shown >= pageLen(p));
    } else if (ui.kind === "cap") {
      const lines = typed(ui.lines, ui.shown);
      if (ui.where === "top") {
        box(2, 2, W - 4, ui.lines.length * 10 + 8, C.ink, C.cream);
        lines.forEach((l, i) => text(l, 8, 7 + i * 10, C.cream));
      } else lines.forEach((l, i) => textC(l, H - 33 + i * 10, C.cream));
    } else if (ui.kind === "menu") {
      if (ui.q) drawDialog(ui.q, ui.name, false);
      const w = Math.max(...ui.opts.map((o) => o.length)) * 6 + 20;
      const h = ui.opts.length * 11 + 8;
      const x = W - 2 - w, y = ui.q ? H - 42 - h : H - 4 - h;
      box(x, y, w, h);
      ui.rects = ui.opts.map((o, i) => {
        text(o, x + 14, y + 6 + i * 11, C.ink);
        return { x, y: y + 3 + i * 11, w, h: 11 };
      });
      if (Math.floor(G.t / 20) % 4) text("`", x + 6, y + 6 + ui.sel * 11, C.coral);
    } else if (ui.draw) ui.draw();
  }

  // ---------------------------------------------------------------- shared scenery
  function sky(t, top = C.night, bottom = C.purp) {
    R(0, 0, W, H, top);
    for (let i = 0; i < 5; i++) R(0, 60 + i * 8, W, 8, i < 2 ? C.navy : bottom); // banded, no gradients
    stars(t, 60);
  }
  function moon(x, y) { circ(x, y, 8, C.cream); circ(x + 3, y - 2, 7, C.night); }

  const SKYLINE = (() => {
    const r = seeded(17), out = [];
    let x = -10;
    while (x < 420) { const w = 8 + Math.floor(r() * 14); out.push({ x, w, h: 18 + Math.floor(r() * 40), lit: Math.floor(r() * 1000) }); x += w + Math.floor(r() * 3); }
    return out;
  })();
  function skyline(off, base, t) {
    SKYLINE.forEach((b) => {
      const x = ((b.x - off) % 430 + 430) % 430 - 10;
      if (x > W || x + b.w < 0) return;
      R(x, base - b.h, b.w, b.h, C.ink2);
      for (let wy = base - b.h + 3; wy < base - 3; wy += 4) for (let wx = x + 2; wx < x + b.w - 2; wx += 3) {
        if ((b.lit + wx * 7 + wy * 13) % 5 === 0) R(wx, wy, 1, 2, (Math.floor(t / 90) + wx) % 11 ? C.gold : C.ink2);
      }
    });
    // the pyramid, because San Francisco
    const px = ((210 - off) % 430 + 430) % 430 - 10;
    tri(px, base - 64, 18, 64, C.plum);
    R(px + 8, base - 70, 2, 7, C.plum);
    if (Math.floor(t / 30) % 2) R(px + 8, base - 71, 2, 1, C.coral);
  }
  function fog(t, y) {
    g.globalAlpha = 0.18;
    for (let i = 0; i < 4; i++) R(((t * (0.15 + i * 0.05) + i * 70) % 260) - 100, y + i * 5, 90, 4, C.lgray);
    g.globalAlpha = 1;
  }

  function pizzeriaFront(x, ground, t) {
    R(x, ground - 70, 90, 70, C.dcoral);
    for (let y = ground - 66; y < ground; y += 5) for (let bx = x + ((y / 5) % 2) * 4; bx < x + 88; bx += 8) R(bx, y, 7, 1, C.coral);
    R(x - 2, ground - 72, 94, 3, C.ink2);
    // neon sign
    const flick = Math.floor(t / 7) % 23 === 0;
    box(x + 18, ground - 66, 54, 13, C.ink, C.ink);
    text("PIZZA", x + 31, ground - 63, flick ? C.dbrown : C.yellow);
    // striped awning
    for (let i = 0; i < 9; i++) R(x + 4 + i * 9, ground - 50, 9, 7, i % 2 ? C.cream : C.coral);
    for (let i = 0; i < 9; i++) R(x + 4 + i * 9, ground - 43, 9, 2, i % 2 ? C.lgray : C.dcoral);
    // warm window + door
    R(x + 6, ground - 38, 50, 30, C.gold);
    R(x + 8, ground - 36, 46, 26, C.orange);
    circ(x + 40, ground - 16, 8, C.dbrown);
    circ(x + 40, ground - 13, 4, Math.floor(t / 10) % 2 ? C.yellow : C.gold);
    R(x + 6, ground - 24, 50, 1, C.dcoral);
    R(x + 64, ground - 38, 18, 38, C.ink2);
    R(x + 66, ground - 36, 14, 34, C.dbrown);
    R(x + 77, ground - 20, 2, 2, C.gold);
  }
  function technoFront(x, ground, t, people = true) {
    const beat = Math.floor(t / 29);
    R(x, ground - 84, 100, 84, C.plum);
    R(x, ground - 84, 100, 3, C.purp);
    for (let i = 0; i < 4; i++) R(x + 10 + i * 22, ground - 60, 12, 10, [C.coral, C.cyan, C.yellow, C.basil][(beat + i) % 4]);
    box(x + 12, ground - 79, 76, 15, C.ink, C.ink);
    text("THE TECHNO", x + 21, ground - 75, Math.floor(t / 5) % 31 === 0 ? C.dcyan : C.cyan);
    R(x + 38, ground - 34, 24, 34, C.ink);
    R(x + 40, ground - 32, 20, 32, beat % 2 ? C.purp : C.coral);
    R(x + 36, ground - 38, 28, 3, C.cyan);
    if (people) ["crowdA", "crowdB", "raver", "crowdC"].forEach((p, i) =>
      drawPerson(p, "right", 0, x - 8 + i * 12, ground - 16 - (beat % 2 && i % 2 ? 1 : 0)));
  }
  function street(ground) {
    R(0, ground, W, H - ground, C.ink2);
    R(0, ground, W, 2, C.gray);
    for (let x = 0; x < W; x += 24) R(x + 4, ground + 14, 12, 1, C.gray);
  }

  // pizzeria interior (side view)
  function pizzeriaInside(t) {
    R(0, 0, W, 96, C.dcoral);
    for (let y = 2; y < 96; y += 6) for (let x = ((y / 6) % 2) * 6 - 6; x < W; x += 12) R(x, y, 11, 5, C.coral);
    // window
    box(8, 14, 44, 36, C.night, C.cream);
    for (let i = 0; i < 6; i++) R(12 + ((i * 17) % 36), 18 + ((i * 11) % 26), 1, 1, C.cream);
    circ(40, 24, 4, C.cream); circ(42, 23, 4, C.night);
    R(29, 15, 2, 34, C.cream);
    // sign
    box(60, 12, 50, 22, C.ink, C.ink);
    text("PIZZA", 70, 15, Math.floor(t / 9) % 29 ? C.yellow : C.dbrown);
    text("&TECHNO", 64, 24, C.cyan);
    // oven
    circ(134, 66, 24, C.gray);
    R(110, 66, 48, 30, C.gray);
    for (let y = 46; y < 96; y += 5) for (let x = 112 + ((y / 5) % 2) * 4; x < 156; x += 8) R(x, y, 1, 5, C.lgray);
    circ(134, 82, 12, C.out);
    R(122, 82, 25, 14, C.out);
    const f = Math.floor(t / 6) % 3;
    tri(126 + f, 80, 10, 14, C.orange); tri(132 - f, 84, 8, 10, C.yellow); tri(137, 82, 8, 12, C.orange);
    // floor
    for (let y = 96; y < H; y += 8) for (let x = 0; x < W; x += 8) R(x, y, 8, 8, ((x + y) / 8) % 2 ? C.cream : C.lgray);
  }
  function counter() {
    R(30, 84, 76, 4, C.tan);
    R(30, 88, 76, 16, C.brown);
    R(30, 103, 76, 1, C.dbrown);
    for (let x = 36; x < 106; x += 14) R(x, 90, 1, 12, C.dbrown);
  }

  // ---------------------------------------------------------------- the Techno (explorable)
  const MAP = [
    "#bb#nnnnnnnn##p#",
    "b.=.SS....SS...#",
    "b.=.SSDDDDSS...#",
    "b.=.ffffffff..c#",
    "b.=.ffffffff..c#",
    "b.=.ffffffff..c#",
    "b.=.ffffffff...#",
    "b.=.ffffffff...#",
    "#P...........P.#",
    "#..............#",
    "#..............#",
    "#######dd#######"
  ];
  const MW = 16, MH = 12;
  const tileAt = (x, y) => (x < 0 || y < 0 || x >= MW || y >= MH ? "#" : MAP[y][x]);
  const DX = { up: 0, down: 0, left: -1, right: 1 }, DY = { up: -1, down: 1, left: 0, right: 0 };
  const OPP = { up: "down", down: "up", left: "right", right: "left" };

  function mkEnt(id, pal, x, y, dir, name) { return { id, pal, x, y, tx: x, ty: y, prog: 0, moving: false, dir, name, step: 0, dance: false }; }
  const hero = mkEnt("hero", "hero", 7, 10, "up");
  let npcs = [];
  function resetClub() {
    hero.x = hero.tx = 7; hero.y = hero.ty = 10; hero.dir = "up"; hero.moving = false;
    npcs = [
      mkEnt("bouncer", "bouncer", 9, 10, "left", "BOUNCER"),
      mkEnt("bar", "bar", 1, 4, "right", "MIX"),
      mkEnt("dj", "dj", 7, 1, "down", "DJ WILLAA"),
      mkEnt("dancer", "dancer", 5, 4, "down", "DANCER"),
      mkEnt("raver", "raver", 10, 5, "left", "RAVER"),
      mkEnt("glow", "glow", 6, 7, "up", "GLOWSTICK GUY"),
      mkEnt("old", "old", 14, 4, "left", "OLD-TIMER"),
      mkEnt("promo", "promo", 13, 1, "down", "PROMOTER")
    ];
    ["dancer", "raver", "glow", "dj"].forEach((id) => { npc(id).dance = true; });
    npc("promo").pace = [[13, 1], [14, 1]];
  }
  const npc = (id) => npcs.find((e) => e.id === id);
  const occupied = (x, y, self) => [hero, ...npcs].some((e) => e !== self && ((e.x === x && e.y === y) || (e.tx === x && e.ty === y)));
  const npcAt = (x, y) => npcs.find((e) => (e.x === x && e.y === y) || (e.tx === x && e.ty === y));
  const walkable = (x, y) => tileAt(x, y) === "." || tileAt(x, y) === "f";
  const entPos = (e) => [(e.x + (e.tx - e.x) * (e.prog / 16)) * 16, (e.y + (e.ty - e.y) * (e.prog / 16)) * 16];

  function stepEnt(e, speed) {
    if (!e.moving) return;
    e.prog += speed;
    if (e.prog >= 16) { e.x = e.tx; e.y = e.ty; e.prog = 0; e.moving = false; e.step++; }
  }
  function tryMove(e, dir) {
    e.dir = dir;
    const nx = e.x + DX[dir], ny = e.y + DY[dir];
    if (walkable(nx, ny) && !occupied(nx, ny, e)) { e.tx = nx; e.ty = ny; e.moving = true; e.prog = 0; return true; }
    return false;
  }

  const club = { lights: true, frozen: false, crowd: false, cam: [0, 0] };
  function updateClub() {
    const beat = Math.floor(G.t / 29);
    if (G.mode === "explore" && !G.ui && !G.busy) {
      if (!hero.moving) {
        const d = dirStack[dirStack.length - 1];
        if (d) { if (!tryMove(hero, d) && G.t - (hero.bumped || 0) > 30) { sfx("bump"); hero.bumped = G.t; } }
        else if (pressed.a) interact();
      }
    }
    stepEnt(hero, 0.7);
    npcs.forEach((e) => {
      stepEnt(e, 0.5);
      if (e.pace && !G.busy && !G.ui && !e.moving && G.t % 150 === 0) {
        const [a, b] = e.pace, at = e.x === a[0] && e.y === a[1], to = at ? b : a;
        const dir = to[0] !== e.x ? (to[0] > e.x ? "right" : "left") : (to[1] > e.y ? "down" : "up");
        if (!tryMove(e, dir)) e.dir = dir;
      }
      if (e.dance && !club.frozen && !e.talking && G.t % 58 === 0) e.dir = beat % 4 < 2 ? "left" : "right";
      if (e.id === "dj" && !e.talking) e.dir = "down";
    });
  }
  function camFor(px, py, roomForBox) {
    const viewH = roomForBox ? H - 40 : H;
    return [Math.max(0, Math.min(MW * 16 - W, Math.round(px + 8 - W / 2))), Math.max(0, Math.min(MH * 16 - H, Math.round(py + 8 - viewH / 2)))];
  }
  function drawTile(ch, x, y, tx, ty, beat) {
    switch (ch) {
      case ".": R(x, y, 16, 16, C.ink2); if ((tx + ty) % 2) R(x + 7, y + 7, 1, 1, C.plum); break;
      case "f": {
        const cols = [C.coral, C.cyan, C.yellow, C.purp];
        const lit = club.lights ? cols[(tx * 3 + ty * 5 + beat) % 4] : C.plum;
        R(x, y, 16, 16, C.out);
        R(x + 1, y + 1, 14, 14, lit);
        if (club.lights) R(x + 2, y + 2, 4, 1, C.cream);
        break;
      }
      case "#": case "n": case "p":
        R(x, y, 16, 16, C.plum);
        for (let j = 3; j < 16; j += 5) R(x, y + j, 16, 1, C.ink2);
        R(x + ((ty % 2) ? 4 : 11), y, 1, 16, C.ink2);
        if (ch === "n") { R(x, y + 12, 16, 1, club.lights ? C.coral : C.dcoral); }
        if (ch === "p") { R(x + 3, y + 2, 10, 12, C.yellow); tri(x + 5, y + 4, 6, 7, C.orange); R(x + 7, y + 7, 2, 1, C.red); R(x + 4, y + 12, 8, 1, C.ink); }
        break;
      case "b":
        R(x, y, 16, 16, C.dbrown);
        R(x, y + 7, 16, 1, C.tan); R(x, y + 15, 16, 1, C.tan);
        [C.basil, C.cyan, C.coral, C.lgray].forEach((c, i) => { R(x + 1 + i * 4, y + 2, 2, 5, c); R(x + 2 + i * 4, y + 10, 2, 5, [C.cyan, C.lgray, C.basil, C.coral][i]); });
        break;
      case "=": R(x, y, 16, 16, C.brown); R(x, y, 16, 3, C.tan); R(x + 2, y + 6, 12, 1, C.dbrown); R(x + 2, y + 11, 12, 1, C.dbrown); break;
      case "S": {
        R(x, y, 16, 16, C.out); R(x + 1, y + 1, 14, 14, C.ink);
        const pulse = club.lights && G.t % 29 < 5 ? 1 : 0;
        circ(x + 8, y + 8, 5 + pulse, C.ink2); circ(x + 8, y + 8, 2, C.gray);
        break;
      }
      case "D":
        R(x, y, 16, 16, C.ink); R(x, y, 16, 4, C.gray); R(x, y + 4, 16, 1, C.lgray);
        if (tx === 6 || tx === 9) { circ(x + 8, y + 9, 4, C.out); R(x + 8, y + 9, 1, 1, C.coral); }
        else { R(x + 2, y + 7, 12, 6, C.ink2); R(x + 4 + ((beat + tx) % 3) * 3, y + 8, 1, 1, C.basil); R(x + 5, y + 11, 6, 1, C.cyan); }
        break;
      case "c": R(x, y, 16, 16, C.ink2); R(x + 1, y + 1, 15, 14, C.dcoral); R(x + 3, y + 3, 12, 10, C.coral); break;
      case "P": R(x, y, 16, 16, C.ink2); R(x + 4, y + 10, 8, 6, C.brown); circ(x + 8, y + 6, 5, C.dbasil); circ(x + 7, y + 5, 3, C.basil); break;
      case "d": R(x, y, 16, 16, C.ink); R(x + 1, y, 14, 16, C.ink2); R(x, y, 16, 2, C.gray); if (tx === 7) R(x + 12, y + 8, 2, 2, C.gold); break;
    }
  }
  function drawClub(cam) {
    const [cx, cy] = cam, beat = Math.floor(G.t / 29);
    R(0, 0, W, H, C.out);
    for (let ty = Math.floor(cy / 16); ty <= Math.floor((cy + H) / 16) && ty < MH; ty++)
      for (let tx = Math.floor(cx / 16); tx <= Math.floor((cx + W) / 16) && tx < MW; tx++)
        drawTile(MAP[ty][tx], tx * 16 - cx, ty * 16 - cy, tx, ty, beat);
    // the neon over the decks
    text("THE TECHNO", 98 - cx - 30, 3 - cy, !club.lights ? C.dcyan : Math.floor(G.t / 6) % 37 === 0 ? C.dcyan : C.cyan);
    const ents = [hero, ...npcs].concat(club.extras || []).sort((a, b) => entPos(a)[1] - entPos(b)[1]);
    ents.forEach((e) => {
      const [px, py] = entPos(e);
      let frame = 0;
      if (e.moving) frame = e.prog < 8 ? 1 + (e.step % 2) : 0;
      let bob = 0;
      if (e.dance && !club.frozen && !e.talking) bob = beat % 2 ? -1 : 0;
      if (club.crowd && e.jump) bob = (beat + e.jump) % 2 ? -3 : 0;
      drawPerson(e.pal, e.dir, frame, px - cx, py - cy - 4 + bob);
    });
  }
  const clubScene = {
    update: updateClub,
    draw() { const [px, py] = entPos(hero); club.cam = camFor(px, py, !!G.ui); drawClub(club.cam); }
  };

  // ---------------------------------------------------------------- the Techno: talking + looking
  const talked = new Set();
  const counts = {};
  let clubDone = null, emergency = false;
  const LOOK = {
    S: "The speakers are so loud your pants are flapping.",
    D: "The DJ booth. Two decks, one mixer, zero pizza.",
    "=": "The bar. It is sticky.",
    b: "Shelves of bottles. Mostly water. This is a responsible rave.",
    p: "A flyer: PIZZA AND TECHNO. FREE PIZZA AT 1AM! (while supplies last)",
    c: "A couch. It has seen things.",
    P: "A potted plant. It is vibing.",
    d: "The night is young. You're not leaving yet.",
    "#": "The wall is thumping.", n: "The wall is thumping. The neon hums."
  };
  async function interact() {
    G.busy = true;
    let fx = hero.x + DX[hero.dir], fy = hero.y + DY[hero.dir];
    let who = npcAt(fx, fy);
    const ch = tileAt(fx, fy);
    if (!who && (ch === "=" || ch === "D")) who = npcAt(fx + DX[hero.dir], fy + DY[hero.dir]);
    if (who) {
      const before = who.dir;
      who.talking = true;
      if (who.id !== "dj") who.dir = OPP[hero.dir];
      const n = (counts[who.id] = (counts[who.id] || 0) + 1);
      await TALK[who.id](n, who);
      if (who.id !== "promo") talked.add(who.id);
      who.talking = false;
      if (!emergency) who.dir = before;
    } else if (LOOK[ch]) await say(LOOK[ch]);
    G.busy = false;
  }
  const TALK = {
    async bouncer(n, e) {
      if (emergency) return say("Go! I'll hold the door!", e.name);
      await say(n === 1 ? "No outside pizza. House rules." : "I'm watching the door. The door is watching me.", e.name);
    },
    async bar(n, e) {
      if (n === 1) await say("Water's free. Hydrate or die-drate.", e.name);
      const c = await menu("Want something?", ["WATER", "A SODA", "NOTHING"], e.name);
      if (c === 0) await say("You drink a water. You feel responsible.");
      if (c === 1) await say("Out of soda. Have a water. You feel responsible anyway.");
      if (c === 2) await say("Suit yourself, champ.", e.name);
      await say("The promoter's been pacing in the back corner all night. Something about a delivery.", e.name);
    },
    async dj(n, e) {
      await say(["Can't talk. Building the drop.", "Still building.", "...still building."][Math.min(n, 3) - 1], e.name);
    },
    async dancer(n, e) {
      await say(n === 1 ? "This DJ is cooking. Speaking of cooking... I could eat. I could REALLY eat." : "Unts. Unts. Unts. (Their stomach growls on the off-beat.)", e.name);
    },
    async raver(n, e) {
      await say(n === 1 ? "The flyer said free pizza at 1am. It is 12:58. I am counting." : "12:59. I am still counting.", e.name);
    },
    async glow(n, e) {
      await say("I have been waving these for six hours. My arms are noodles. I need carbs.", e.name);
    },
    async old(n, e) {
      await say(n === 1 ? "I've been coming here since 2017. Never seen the pizza this late." : "Back in my day the pizza came out of a van in the park.", e.name);
    },
    async promo(n, e) {
      if (talked.size < 2) {
        await say("The promoter is yelling into a phone.");
        await say("WHAT DO YOU MEAN, TOWED?!", e.name);
        await say("...Better look around and give them a minute.");
        return;
      }
      await say("Wait. That shirt. That smell. Are you from the pizzeria?!", e.name);
      const c = await menu(null, ["YES", "NO", "I SMELL LIKE GARLIC"]);
      if (c === 1) await say("You're covered in flour. Nice try.", e.name);
      if (c === 2) await say("You smell AMAZING. That's how I knew.", e.name);
      await say("Thank goodness! We promised the whole crowd FREE PIZZA at 1am.", e.name);
      await say("But the delivery van just got TOWED. With the pizzas IN IT.", e.name);
      await theEmergency(e);
    }
  };

  async function theEmergency(promo) {
    emergency = true;
    sfx("scratch");
    music(null);
    club.lights = false;
    club.frozen = true;
    G.shake = reduceMotion ? 0 : 20;
    await wait(1.2);
    npcs.forEach((e) => { if (e.id !== "promo") e.dir = e.id === "dj" ? "down" : "right"; });
    music("alarm");
    G.alarm = 1;
    G.banner = "PIZZA EMERGENCY!";
    await wait(3.5);
    G.banner = null;
    await say("The crowd stops dancing.");
    await say("...It's 1:00.", "RAVER");
    await say("If these ravers don't eat, the vibes will COLLAPSE. You have to help us!", promo.name);
    for (;;) {
      const c = await menu("What do you do?", ["RUN TO THE PIZZERIA!", "KEEP DANCING", "PANIC"]);
      if (c === 0) break;
      if (c === 1) await say("You dance alone in total silence. Everyone stares.");
      if (c === 2) await say("You panic. It is not very effective.");
    }
    await say("GO! GO! GO!", promo.name);
    await say("PIZ-ZA! PIZ-ZA! PIZ-ZA!", "THE CROWD");
    clubDone();
  }

  // ---------------------------------------------------------------- the streets (side-scrolling cutscenes)
  function streetScene(opts) {
    const s = { wx: 0, speed: opts.speed, endX: opts.endX, stopped: false, car: null, run: opts.run, dest: opts.dest };
    const hill = (x) => {
      const f = Math.max(0, Math.min(1, (s.endX - 20 - x) / 140));
      return 112 - f * (10 * Math.sin(x / 70) + 6 * Math.sin(x / 31) + 8);
    };
    s.ground = hill;
    s.update = () => {
      if (!s.stopped) { s.wx += s.speed; if (s.wx >= s.endX - 40) { s.wx = s.endX - 40; s.stopped = true; } }
      if (s.car) s.car.x -= 1.4;
    };
    s.draw = () => {
      const t = G.t;
      sky(t);
      moon(130, 18);
      skyline(s.wx * 0.15, 88, t);
      fog(t, 70);
      // painted ladies along the hill
      for (let hx = Math.floor(s.wx / 34) * 34 - 34; hx < s.wx + W + 34; hx += 34) {
        if (hx > s.endX - 120) break;
        const x = hx - s.wx, base = hill(hx + 12);
        const col = [C.cyan, C.yellow, C.coral, C.basil, C.lgray][((hx / 34) % 5 + 5) % 5];
        R(x, base - 30, 26, 30, col);
        tri(x - 1, base - 42, 28, 12, col);
        R(x + 4, base - 24, 6, 8, C.gold); R(x + 16, base - 24, 6, 8, C.gold);
        R(x + 10, base - 12, 6, 12, C.dbrown);
        R(x, base - 31, 26, 1, C.cream);
      }
      if (s.dest) s.dest(s.endX + 10 - s.wx, hill(s.endX), t);
      // the hill itself
      for (let x = 0; x < W; x++) { const y = Math.round(hill(s.wx + x)); R(x, y, 1, H - y, C.ink2); R(x, y, 1, 2, C.gray); }
      for (let lx = Math.floor(s.wx / 70) * 70; lx < s.wx + W; lx += 70) {
        if (lx > s.endX - 60) break;
        const x = lx - s.wx + 30, b = Math.round(hill(lx + 30));
        R(x, b - 30, 1, 30, C.gray); R(x - 2, b - 32, 5, 2, C.yellow);
      }
      if (s.car) {
        const x = s.car.x, b = hill(s.wx + x + 20);
        R(x, b - 22, 44, 18, C.dcoral); R(x, b - 24, 44, 3, C.cream); R(x + 21, b - 34, 1, 10, C.gray);
        for (let i = 0; i < 5; i++) R(x + 3 + i * 8, b - 18, 6, 6, C.gold);
        R(x, b - 6, 44, 2, C.dbrown); circ(x + 8, b - 3, 2, C.ink); circ(x + 36, b - 3, 2, C.ink);
      }
      const px = 56, gy = hill(s.wx + px + 8);
      const frame = s.stopped ? 0 : 1 + (Math.floor(t / (s.run ? 6 : 11)) % 2);
      drawPerson("hero", "right", frame, px, gy - 16 - (s.run && frame === 1 ? 1 : 0));
    };
    return s;
  }
  const untilStopped = (s) => new Promise((res) => { const iv = setInterval(() => { if (s.stopped) { clearInterval(iv); res(); } }, 100); });

  // ---------------------------------------------------------------- pizza
  const TOPPINGS = ["PEPPERONI", "MUSHROOM", "PINEAPPLE", "ANCHOVIES"];
  function drawPizza(cx, cy, pz, scale = 1) {
    if (!pz.dough) return;
    const r = pz.r * scale, rnd = seeded(pz.seed);
    circ(cx, cy, r, C.tan);
    circ(cx, cy, r - 2 * scale, C.dough);
    if (pz.sauce > 0) {
      const sr = (r - 4 * scale) * pz.sauce;
      if (pz.sauceQ === 0) for (let i = 0; i < 5; i++) circ(cx + (rnd() - 0.5) * sr, cy + (rnd() - 0.5) * sr, sr * 0.45, C.red);
      else circ(cx, cy, sr * (pz.sauceQ === 1 ? 0.85 : 1), C.red);
    }
    const blobs = Math.round(16 * pz.cheese * (pz.cheeseQ === 0 ? 0.4 : pz.cheeseQ === 1 ? 0.75 : 1));
    for (let i = 0; i < 16; i++) {
      const a = rnd() * Math.PI * 2, d = Math.sqrt(rnd()) * (r - 7 * scale);
      if (i < blobs) { circ(cx + Math.cos(a) * d, cy + Math.sin(a) * d, 3 * scale, C.gold); R(cx + Math.cos(a) * d - 1, cy + Math.sin(a) * d - 1, scale, scale, C.yellow); }
    }
    for (let i = 0; i < pz.tops; i++) {
      const a = (i / 7) * Math.PI * 2 + 0.4, d = (i % 2 ? 0.55 : 0.3) * r, x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d;
      if (pz.top === 0) { circ(x, y, 3 * scale, C.dcoral); R(x - 1, y - 1, scale, scale, C.coral); }
      if (pz.top === 1) { circ(x, y, 2.5 * scale, C.lgray); R(x - scale / 2, y, scale, 3 * scale, C.cream); }
      if (pz.top === 2) R(x - 2 * scale, y - 2 * scale, 4 * scale, 4 * scale, C.yellow);
      if (pz.top === 3) R(x - 3 * scale, y, 6 * scale, scale, C.gray);
    }
    if (pz.bake > 0) {
      const b = pz.bake;
      g.globalAlpha = Math.min(0.75, b < 0.6 ? b * 0.25 : b < 0.85 ? 0.15 + (b - 0.6) * 1.2 : 0.45 + (b - 0.85) * 1.5);
      circ(cx, cy, r, b < 0.85 ? C.brown : C.out);
      g.globalAlpha = 1;
      for (let i = 0; i < 10 && b > 0.4; i++) { const a = i * 0.63; R(cx + Math.cos(a) * (r - 1), cy + Math.sin(a) * (r - 1), scale, scale, C.dbrown); }
    }
  }
  function prepScene(state) {
    return {
      draw() {
        R(0, 0, W, H, C.brown);
        const r = seeded(3);
        for (let i = 0; i < 26; i++) R(Math.floor(r() * W), Math.floor(r() * H), 12 + Math.floor(r() * 30), 1, C.dbrown);
        for (let i = 0; i < 20; i++) R(Math.floor(r() * W), Math.floor(r() * 90) + 20, 1, 1, C.dough);
        // ticket
        R(0, 0, W, 3, C.lgray);
        box(4, 3, 72, 23, C.cream, C.ink);
        text("TICKET " + (state.i + 1) + "/3", 9, 7, C.coral);
        text(TOPPINGS[state.order], 9, 16, C.ink);
        // finished boxes
        for (let i = 0; i < state.done; i++) { R(126, 22 - i * 7, 30, 6, C.cream); R(126, 27 - i * 7, 30, 1, C.lgray); R(139, 23 - i * 7, 4, 3, C.coral); }
        if (state.pz) drawPizza(80, 60, state.pz);
        if (state.flash && G.t < state.flash.until) textShadow(state.flash.text, 86, state.flash.col, 1);
      }
    };
  }
  function ovenScene(state) {
    return {
      draw() {
        const t = G.t;
        R(0, 0, W, H, C.plum);
        for (let y = 0; y < H; y += 6) for (let x = ((y / 6) % 2) * 6 - 6; x < W; x += 12) R(x, y, 11, 5, C.gray);
        circ(80, 96, 64, C.ink2);
        circ(80, 96, 56, C.out);
        R(16, 96, 128, 50, C.ink2);
        R(24, 96, 112, 50, C.out);
        const f = Math.floor(t / 5) % 3;
        for (let i = 0; i < 5; i++) tri(28 + i * 22 + f, 60 + (i % 2) * 6, 16, 30, i % 2 ? C.orange : C.red);
        for (let i = 0; i < 4; i++) tri(36 + i * 24 - f, 70, 10, 18, C.yellow);
        drawPizza(80, 104, state.pz, 0.9);
        if (state.pz.bake > 1) for (let i = 0; i < 3; i++) circ(70 + i * 10, 80 - ((t / 2 + i * 13) % 30), 4, C.gray);
      }
    };
  }
  // a back-and-forth timing bar; resolves 2 (sweet spot), 1 (close) or 0
  function meter(y, label) {
    const zone = 20 + Math.floor(Math.random() * 70);
    return new Promise((res) => {
      let x = 0, v = 1, done = -1, hold = 0;
      G.ui = {
        kind: "meter", res,
        update() {
          if (done >= 0) { if (++hold > 50) closeUI(done); return; }
          x += v * 0.9;
          if (x >= 119 || x <= 0) v = -v;
          if (pressed.a) {
            const c = x + 1;
            done = c >= zone && c <= zone + 18 ? 2 : c >= zone - 10 && c <= zone + 28 ? 1 : 0;
            sfx(["bad", "ok", "good"][done]);
          }
        },
        draw() {
          box(2, H - 40, W - 4, 38);
          text(label, 8, H - 34, C.ink);
          text(done < 0 ? "PRESS A IN THE GREEN!" : ["OOPS.", "NOT BAD.", "PERFECT!"][done], 8, H - 24, done === 2 ? C.dbasil : done === 1 ? C.dbrown : done === 0 ? C.dcoral : C.gray);
          R(19, y - 1, 122, 8, C.ink);
          R(20, y, 120, 6, C.lgray);
          R(20 + zone - 10, y, 38, 6, C.gold);
          R(20 + zone, y, 18, 6, C.basil);
          R(20 + Math.round(x), y - 3, 2, 12, C.coral);
          R(20 + Math.round(x), y - 3, 2, 1, C.out);
        }
      };
    });
  }
  function bakeMeter(state) {
    return new Promise((res) => {
      let x = 0, done = -1, hold = 0;
      const BANDS = [[0, 45, C.dough], [45, 58, C.gold], [58, 76, C.orange], [76, 92, C.brown], [92, 120, C.out]];
      G.ui = {
        kind: "meter", res,
        update() {
          if (done >= 0) { if (++hold > 60) closeUI(done); return; }
          x += 0.24;
          state.pz.bake = x / 92;
          if (pressed.a || x >= 120) {
            done = x >= 58 && x < 76 ? 2 : x >= 45 && x < 92 ? 1 : 0;
            sfx(["bad", "ok", "good"][done]);
          }
        },
        draw() {
          box(2, 2, W - 4, 26, C.ink, C.cream);
          text(done < 0 ? "PULL IT WHEN IT'S GOLDEN" : x >= 92 ? "BURNT. OOF." : x < 45 ? "STILL DOUGHY..." : done === 2 ? "GOLDEN. PERFECT!" : "A LITTLE OFF.", 8, 7, C.cream);
          BANDS.forEach(([a, b, c]) => R(20 + a, 18, b - a, 5, c));
          R(20 + Math.round(x), 15, 2, 11, C.coral);
        }
      };
    });
  }
  function knead(state) {
    return new Promise((res) => {
      let n = 0, hold = 0;
      G.ui = {
        kind: "knead", res,
        update() {
          if (n >= 8) { if (++hold > 40) closeUI(); return; }
          if (pressed.a) { n++; sfx("squish"); state.pz.r = 8 + n * 2.6; G.shake = reduceMotion ? 0 : 3; }
        },
        draw() {
          box(2, H - 40, W - 4, 38);
          text(n >= 8 ? "NICE AND STRETCHY." : "TAP A TO KNEAD THE DOUGH!", 8, H - 34, C.ink);
          for (let i = 0; i < 8; i++) circ(14 + i * 9, H - 18, 3, i < n ? C.coral : C.lgray);
        }
      };
    });
  }

  async function makePizza(i, order, stats) {
    const state = { i, order, done: i, pz: null, flash: null };
    G.scene = prepScene(state);
    await fadeIn(0.6);
    await say(["Ticket one. The classic.", "Ticket two. The earthy one.", "Ticket three. The controversial one. Pineapple. (Fight us.)"][i], "BOSS");
    state.pz = { dough: 1, r: 8, sauce: 0, cheese: 0, tops: 0, top: -1, bake: 0, seed: 40 + i };
    await knead(state);
    state.pz.sauceQ = await meter(96, "SAUCE! SPIRAL IT ON.");
    for (let k = 0; k <= 20; k++) { state.pz.sauce = k / 20; await wait(1 / 30); }
    state.pz.cheeseQ = await meter(96, "CHEESE! DON'T BE SHY.");
    for (let k = 0; k <= 16; k++) { state.pz.cheese = k / 16; if (k % 3 === 0) sfx("plop"); await wait(0.06); }
    const top = await menu("What goes on top?", TOPPINGS);
    state.pz.top = top;
    for (let k = 1; k <= 7; k++) { state.pz.tops = k; sfx("plop"); await wait(0.22); }
    const right = top === order;
    if (!right) await say(top === 3 ? "...Anchovies. Bold. They'll eat it. Probably." : "That's not what the ticket says. They'll eat it. Probably.", "BOSS");
    await say("Into the oven she goes.", "BOSS");
    await fadeOut(0.5);
    G.scene = ovenScene(state);
    await fadeIn(0.5);
    const bakeQ = await bakeMeter(state);
    await fadeOut(0.5);
    G.scene = prepScene(state);
    await fadeIn(0.5);
    const score = state.pz.sauceQ + state.pz.cheeseQ + (right ? 2 : 0) + bakeQ;
    stats.score += score;
    if (right && top === 2) stats.pineapple = true;
    state.flash = { text: "@".repeat(Math.max(1, Math.round(score / 2))) + "  " + score + "/8", col: C.yellow, until: G.t + 9999 };
    await say(score >= 7 ? "Now THAT is a pie. Box it." : score >= 4 ? "Good enough for the Techno. Box it." : "It's... a pizza. Technically. Box it.", "BOSS");
    state.flash = null;
    state.pz = null;
    state.done = i + 1;
    sfx("plop");
    await wait(0.8);
    await fadeOut(0.6);
  }

  // ---------------------------------------------------------------- scenes
  const scenes = {
    title: {
      draw() {
        const t = G.t;
        R(0, 0, W, H, C.night);
        stars(t, 100);
        for (let i = 0; i < 10; i++) R(i * 16, 116, 16, 14, [C.coral, C.cyan, C.yellow, C.purp][(i + Math.floor(t / 29)) % 4]);
        for (let i = 0; i <= 10; i++) R(i * 16, 116, 1, 14, C.out);
        R(0, 116, W, 1, C.out); R(0, 130, W, 14, C.out);
        // big slice
        const bob = Math.round(Math.sin(t / 40) * 2);
        g.save(); g.translate(80, 66 + bob);
        for (let i = 0; i < 26; i++) { const hw = Math.round(i * 0.75); R(-hw, -14 + i, hw * 2 + 1, 1, i > 22 ? C.tan : C.gold); }
        R(-20, 9, 41, 4, C.tan); R(-20, 9, 41, 1, C.dough);
        [[-6, 2], [5, 4], [0, -6], [-1, 6]].forEach(([x, y]) => circ(x, y, 2, C.dcoral));
        g.restore();
        textShadow("PIZZA", 10, C.yellow, 3);
        textShadow("EMERGENCY", 36, C.coral, 2);
        textShadow("AT THE TECHNO", 92, C.cyan, 1);
        if (Math.floor(t / 40) % 2) textShadow("PRESS START", 104, C.cream, 1);
        textC("@ 2026 PIZZA AND TECHNO", 134, C.gray, 1);
      }
    },
    black: { draw() { R(0, 0, W, H, C.out); stars(G.t, 110); } },
    skyline: { draw() { const t = G.t; sky(t); moon(124, 20); skyline(t * 0.05, 120, t); fog(t, 100); R(0, 120, W, 24, C.ink2); } },
    pizzeriaOut: { draw() { const t = G.t; sky(t); moon(20, 18); skyline(40, 110, t); street(110); pizzeriaFront(36, 110, t); R(146, 74, 1, 36, C.gray); R(144, 72, 5, 2, C.yellow); } },
    technoOut: {
      draw() {
        const t = G.t, shake = !reduceMotion && t % 29 < 3 ? 1 : 0;
        sky(t); skyline(300, 110, t); street(110);
        g.save(); g.translate(0, shake); technoFront(34, 110, t); g.restore();
      }
    },
    inside: {
      draw() {
        pizzeriaInside(G.t);
        drawPerson("boss", "down", 0, 52, 70);
        counter();
        const sweep = Math.floor(G.t / 30) % 2;
        drawPerson("hero", sweep ? "left" : "right", 0, 88, 100);
        R(sweep ? 84 : 102, 104, 1, 12, C.tan); R(sweep ? 81 : 100, 116, 6, 2, C.gold);
      }
    },
    home: {
      draw() {
        pizzeriaInside(G.t);
        drawPerson("boss", "down", 0, 52, 70);
        counter();
        drawPerson("hero", G.heroDir || "up", 0, 88, 100);
      }
    },
    finale: {
      draw() {
        drawClub([40, 40]);
        if (G.hearts) G.hearts.forEach((h) => {
          const age = G.t - h.t0;
          if (age > 0 && age < 160) text(h.ch, h.x + Math.round(Math.sin(age / 12) * 3), h.y - age / 3, h.c);
        });
      }
    },
    end: {
      draw() {
        const t = G.t;
        R(0, 0, W, H, C.night);
        stars(t, 140);
        textShadow("THE END", 12, C.yellow, 3);
        textC("MUSIC TO FEED YOUR SOUL", 40, C.cyan);
        const s = G.stats;
        if (s) {
          textC("PIZZAS SAVED: 3", 56, C.cream);
          textC("STARS: " + s.score + "/24", 66, C.cream);
          textC("RANK: " + rank(s.score), 78, C.coral);
        }
      }
    }
  };
  const rank = (s) => (s >= 22 ? "SAUCE BOSS" : s >= 16 ? "MOZZARELLA FELLA" : s >= 10 ? "DOUGH NOT DISTURB" : "SOGGY BOTTOM");

  // ---------------------------------------------------------------- the story
  async function titleScreen() {
    G.scene = scenes.title;
    music("title");
    await fadeIn(1.2);
    await waitA();
    await fadeOut(1);
  }

  async function intro() {
    G.mode = "intro";
    G.letterbox = 1;
    music("title");
    const shot = async (scene, lines, muffled) => {
      if (G.skipping) return;
      G.scene = scene;
      if (muffled !== undefined) music(muffled ? "club" : "title", muffled);
      await fadeIn(1.2);
      for (const l of lines) { await caption(l, 2.2); await wait(0.4); }
      await fadeOut(1.2);
    };
    await shot(scenes.black, ["SAN FRANCISCO.", "SATURDAY NIGHT. 11:47 PM."]);
    await shot(scenes.skyline, ["The fog rolls in off the bay. The city hums."]);
    await shot(scenes.pizzeriaOut, ["On a quiet corner, a little pizzeria keeps its oven warm."]);
    await shot(scenes.technoOut, ["Across town, the TECHNO is packed.", "Four on the floor. All night long."], true);
    await shot(scenes.inside, ["And you? You just finished your shift."], false);
    G.skipping = false;
    G.letterbox = 0;
    G.mode = "cut";
  }

  async function atThePizzeria() {
    G.scene = scenes.home;
    G.heroDir = "up";
    music("kitchen");
    await fadeIn(1);
    await say("Nice work tonight, kid. Oven's still hot if anybody needs it.", "BOSS");
    await say("Go on, get outta here. Have some fun.", "BOSS");
    let slices = 0;
    for (;;) {
      const c = await menu("What will you do?", ["GO TO THE TECHNO", "CHECK THE OVEN", "EAT A SLICE", "TAKE A NAP"]);
      if (c === 0) break;
      if (c === 1) await say("The oven glows. 900 degrees of pure potential.");
      if (c === 2) await say(++slices === 1 ? "You eat a slice. HP fully restored! (It was already full.)" : "You eat another slice. The boss gives you a look.");
      if (c === 3) { await say("You curl up on a sack of flour..."); await fadeOut(1.5); await wait(1); await fadeIn(1); await say("...a distant kick drum wakes you. UNTS. UNTS. UNTS."); }
    }
    await say("Say hi to the Techno for me.", "BOSS");
    const how = await menu("How will you get there?", ["WALK", "SKATEBOARD", "CABLE CAR"]);
    await fadeOut(1);

    const s = streetScene({ speed: 0.45, endX: 420, run: false, dest: (x, gy, t) => technoFront(x, gy, t, false) });
    G.scene = s;
    music("club", true);
    await fadeIn(1);
    if (how === 0) { await caption("You walk. Slowly. It is uphill both ways.", 2.5, "top"); }
    if (how === 1) { await caption("You kickflip off the curb...", 2, "top"); await caption("...and eat it on the first hill. You walk the rest.", 2.5, "top"); }
    if (how === 2) { s.car = { x: 160 }; sfx("ding"); await caption("A cable car! You hop on. DING DING!", 2.2, "top"); await caption("It's full of tourists. You hop off and walk the rest.", 2.5, "top"); }
    await caption("The bass gets louder...", 2.5, "top");
    await untilStopped(s);
    await caption("THE TECHNO.", 2, "top");
    await fadeOut(1);
  }

  async function theTechno() {
    resetClub();
    talked.clear();
    Object.keys(counts).forEach((k) => delete counts[k]);
    emergency = false;
    Object.assign(club, { lights: true, frozen: false, crowd: false, extras: null });
    G.scene = clubScene;
    music("club");
    await fadeIn(1);
    G.busy = true;
    const b = npc("bouncer");
    b.talking = true;
    await say("Hold up. Name?", b.name);
    const c = await menu(null, ["I'M ON THE LIST", "I WORK AT THE PIZZERIA", "UNTS UNTS UNTS"]);
    if (c === 0) await say("...Yeah, you're on it. Everybody's on it. Go on in.", b.name);
    if (c === 1) await say("The pizzeria? Huh. The promoter was just asking about you guys. Go on in.", b.name);
    if (c === 2) await say("...That is the correct password. Go on in.", b.name);
    b.talking = false;
    await say("(Walk around and talk to folks. Press A to talk or look.)");
    G.busy = false;
    G.mode = "explore";
    await new Promise((res) => { clubDone = res; });
    G.mode = "cut";
    await fadeOut(1.2);
    G.alarm = 0;
  }

  async function runBack() {
    const s = streetScene({ speed: 1, endX: 1500, run: true, dest: (x, gy, t) => pizzeriaFront(x, gy, t) });
    G.scene = s;
    music("run");
    await fadeIn(0.8);
    await caption("You burst out of the Techno and RUN.", 2.5, "top");
    await caption("Up a hill.", 2, "top");
    await caption("Down a hill.", 2, "top");
    await caption("Up ANOTHER hill. (This is San Francisco.)", 2.5, "top");
    s.car = { x: 170 };
    sfx("ding");
    await caption("A cable car dings at you. You ding back.", 2.5, "top");
    await caption("Your legs are noodles. Your heart is pizza.", 2.5, "top");
    await untilStopped(s);
    await caption("The pizzeria! The lights are still on!", 2.5, "top");
    await fadeOut(1);
  }

  async function theKitchen() {
    G.scene = scenes.home;
    G.heroDir = "up";
    music("kitchen");
    await fadeIn(1);
    await say("Back already? You look like you ran up three hills.", "BOSS");
    const c = await menu("What do you say?", ["PIZZA EMERGENCY!", "THE VAN GOT TOWED", "THE TECHNO IS HUNGRY"]);
    await say(["A pizza emergency?! At the TECHNO?!", "Towed?! With the pies in it?!", "The Techno is always hungry. But you mean HUNGRY hungry."][c], "BOSS");
    await say("Say no more. Apron on, kid. We've got three tickets.", "BOSS");
    await say("Make 'em slow. Make 'em right.", "BOSS");
    await fadeOut(0.8);
    const stats = { score: 0, pineapple: false };
    for (let i = 0; i < 3; i++) await makePizza(i, i, stats);
    G.scene = scenes.home;
    await fadeIn(0.8);
    await say("Three hot pies. I'll drive the scooter. Hold on tight.", "BOSS");
    await fadeOut(1);
    return stats;
  }

  async function finale(stats) {
    resetClub();
    hero.x = hero.tx = 7; hero.y = hero.ty = 8; hero.dir = "up";
    Object.assign(club, { lights: false, frozen: true, crowd: false });
    const pals = ["crowdA", "crowdB", "crowdC"];
    club.extras = [[4, 5], [8, 4], [11, 6], [5, 6], [9, 7], [11, 3], [4, 3]].map(([x, y], i) => {
      const e = mkEnt("x" + i, pals[i % 3], x, y, "down");
      e.jump = 1 + (i % 2);
      return e;
    });
    [...npcs, ...club.extras].forEach((e) => { if (e.id !== "dj") e.dir = "down"; e.jump = e.jump || (e.dance ? 1 : 0); });
    G.scene = scenes.finale;
    music(null);
    await fadeIn(1);
    await say("You burst through the doors with three hot pizzas.");
    await say("The crowd goes silent...");
    await say("...the drop is ready.", "DJ WILLAA");
    sfx("drop");
    G.shake = reduceMotion ? 0 : 24;
    club.lights = true; club.frozen = false; club.crowd = true;
    music("club");
    sfx("cheer");
    G.hearts = Array.from({ length: 18 }, (_, i) => ({ x: 20 + ((i * 37) % 120), y: 96, t0: G.t + i * 14, ch: i % 3 ? "~" : "^", c: [C.coral, C.yellow, C.cyan][i % 3] }));
    await wait(2);
    await say("YOU SAVED THE TECHNO!", "PROMOTER");
    await say("It's 1:23. Worth it.", "RAVER");
    if (stats.pineapple) await say("Pineapple, huh? ...I'll allow it.", "OLD-TIMER");
    await say("Music to feed your soul. And pizza to feed your... also soul.", "DJ WILLAA");
    await wait(1);
    await fadeOut(1.5);
    G.hearts = null;
    G.stats = stats;
    G.scene = scenes.end;
    music("end");
    await fadeIn(1.5);
    await wait(1);
    const party = window.NEXT_PARTY;
    if (party && Array.isArray(party.lines) && party.lines.length) {
      await say("Psst. You didn't hear it from me...", "???");
      await say(party.lines.join("\n"), "THE NEXT PARTY");
    }
    const opts = ["PLAY AGAIN", "BACK TO THE SITE"];
    if (party && party.url) opts.splice(1, 0, "THE NEXT PARTY");
    const c = opts[await menu(null, opts)];
    if (c === "THE NEXT PARTY") { location.href = party.url; return new Promise(() => {}); }
    if (c === "BACK TO THE SITE") { location.href = "/"; return new Promise(() => {}); }
    await fadeOut(1);
  }

  // #techno, #kitchen etc. jump straight to a chapter (handy for testing)
  async function main() {
    const CHAPTERS = ["title", "intro", "pizzeria", "techno", "run", "kitchen", "finale"];
    let at = Math.max(0, CHAPTERS.indexOf(location.hash.slice(1)));
    let stats = { score: 0, pineapple: false };
    for (;;) {
      if (at <= 0) await titleScreen();
      if (at <= 1) await intro();
      if (at <= 2) await atThePizzeria();
      if (at <= 3) await theTechno();
      if (at <= 4) await runBack();
      if (at <= 5) stats = await theKitchen();
      await finale(stats);
      at = 0;
    }
  }

  // ---------------------------------------------------------------- loop
  function tick() {
    G.t++;
    if (pressed.start && G.mode === "intro" && !G.skipping) {
      G.skipping = true;
      if (G.ui && G.ui.kind === "cap") closeUI();
      G.waits.splice(0).forEach((w) => w.res());
      G.tweens.splice(0).forEach((tw) => { G[tw.key] = tw.to; tw.res(); });
    }
    G.waits = G.waits.filter((w) => { if (G.t >= w.at) { w.res(); return false; } return true; });
    G.tweens = G.tweens.filter((tw) => {
      const p = Math.min(1, (G.t - tw.t0) / tw.dur);
      G[tw.key] = tw.from + (tw.to - tw.from) * p;
      if (p >= 1) { tw.res(); return false; }
      return true;
    });
    updateUI();
    if (G.scene && G.scene.update) G.scene.update();
    if (G.shake > 0) G.shake--;
    for (const k in pressed) delete pressed[k];
  }
  function draw() {
    g.save();
    if (G.shake > 0) g.translate(Math.round(Math.sin(G.t * 1.7) * 2), Math.round(Math.cos(G.t * 2.3)));
    if (G.scene) G.scene.draw();
    g.restore();
    if (G.alarm) {
      g.globalAlpha = reduceMotion ? 0.2 : 0.12 + 0.14 * (Math.sin(G.t / 18) + 1) / 2;
      R(0, 0, W, H, C.red);
      g.globalAlpha = 1;
    }
    if (G.banner) {
      R(0, 52, W, 30, C.out);
      R(0, 53, W, 1, C.coral); R(0, 80, W, 1, C.coral);
      const flip = reduceMotion ? 0 : Math.floor(G.t / 30) % 2;
      textShadow(G.banner, 57, flip ? C.yellow : C.coral, 1);
      textC("!!  !!  !!", 69, flip ? C.coral : C.yellow);
    }
    if (G.letterbox) { R(0, 0, W, 16, C.out); R(0, H - 38, W, 38, C.out); }
    if (G.fade > 0) { g.globalAlpha = Math.min(1, G.fade); R(0, 0, W, H, C.out); g.globalAlpha = 1; }
    drawUI();
    if (G.mode === "intro" && !G.skipping) text("START: SKIP", W - 70, 5, C.gray);
    if (G.toast && G.t < G.toast.until) { box(W - 76, 2, 74, 15, C.ink, C.cream); text(G.toast.text, W - 70, 6, C.cream); }
  }
  let acc = 0, last = performance.now();
  function frame(now) {
    acc += Math.min(250, now - last);
    last = now;
    while (acc >= 1000 / 60) { tick(); acc -= 1000 / 60; }
    draw();
    requestAnimationFrame(frame);
  }

  // integer scaling that fits the viewport (pad below on touch screens)
  function fit() {
    const touch = !matchMedia("(hover: hover) and (pointer: fine)").matches;
    const availW = innerWidth - 52, availH = innerHeight - (touch ? 360 : 150);
    const s = Math.max(1, Math.floor(Math.min(availW / W, availH / H)));
    cv.style.width = W * s + "px";
    cv.style.height = H * s + "px";
  }
  addEventListener("resize", fit);
  fit();

  // ?debug exposes read-only state so automated playthroughs can wait on the story
  if (/[?&]debug\b/.test(location.search)) window.__emergency = { G, hero, get ui() { return G.ui && G.ui.kind; } };

  requestAnimationFrame(frame);
  main();
})();
