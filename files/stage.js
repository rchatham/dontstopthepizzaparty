/* Local party effects and an opt-in synthesized dance beat. No audio downloads. */
(function () {
  var hero = document.querySelector('.dsp-hero');
  if (!hero) return;
  var panel = hero.querySelector('.dsp-controls');
  var lights = document.getElementById('stage-lights');
  var motion = document.getElementById('stage-motion');
  var tempo = document.getElementById('stage-tempo');
  var volume = document.getElementById('stage-volume');
  var sound = document.getElementById('stage-sound');
  var status = hero.querySelector('.dsp-stage-status');
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  var audio, gain, timer, playing = false, starting = false, step = 0, lastDrop = -Infinity;
  var bounceTimer;
  var textGroup = hero.querySelector('.dsp-copy');
  textGroup.addEventListener('animationend', function (event) {
    if (event.target === textGroup) textGroup.classList.add('has-entered');
  });
  lights.value = hero.dataset.lights;
  motion.value = reduced.matches ? 'off' : 'gentle';
  hero.dataset.motion = motion.value;
  lights.addEventListener('change', function () { hero.dataset.lights = lights.value; });
  motion.addEventListener('change', function () {
    hero.dataset.motion = motion.value;
    hero.style.setProperty('--px', 0); hero.style.setProperty('--py', 0);
  });
  tempo.addEventListener('input', function () {
    hero.dataset.tempo = tempo.value;
    hero.style.setProperty('--beat', (60 / Number(tempo.value)) + 's');
    document.getElementById('stage-bpm').textContent = tempo.value + ' BPM';
  });
  volume.addEventListener('input', function () {
    if (gain) gain.gain.setTargetAtTime(Number(volume.value) / 100 * 0.35, audio.currentTime, 0.03);
  });
  function tone(freq, endFreq, duration, level, type) {
    var osc = audio.createOscillator(), envelope = audio.createGain(), now = audio.currentTime;
    osc.type = type; osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(endFreq, now + duration);
    envelope.gain.setValueAtTime(level, now);
    envelope.gain.exponentialRampToValueAtTime(0.001, now + duration);
    osc.connect(envelope); envelope.connect(gain); osc.start(now); osc.stop(now + duration);
    osc.onended = function () { osc.disconnect(); envelope.disconnect(); };
  }
  function beat() {
    if (!playing) return;
    if (step % 2 === 0) tone(130, 42, 0.2, 0.8, 'sine');
    else tone(1800, 650, 0.035, 0.07, 'triangle');
    if (step % 4 === 2) tone(180, 75, 0.09, 0.12, 'triangle');
    step++;
    timer = setTimeout(beat, 30000 / Number(tempo.value));
  }
  function stop() {
    playing = false; clearTimeout(timer);
    if (gain) gain.gain.setTargetAtTime(0, audio.currentTime, 0.02);
    sound.setAttribute('aria-pressed', 'false'); sound.textContent = 'Sound: off';
  }
  sound.addEventListener('click', async function () {
    if (starting) return;
    if (playing) { stop(); return; }
    starting = true;
    try {
      var Audio = window.AudioContext || window.webkitAudioContext;
      if (!audio) { audio = new Audio(); gain = audio.createGain(); gain.connect(audio.destination); }
      await audio.resume();
      if (document.hidden) return;
      gain.gain.setValueAtTime(Number(volume.value) / 100 * 0.35, audio.currentTime);
      playing = true; step = 0; beat();
      sound.setAttribute('aria-pressed', 'true'); sound.textContent = 'Sound: on';
      status.textContent = 'House beat on. Make it yours.';
    } catch (error) { stop(); status.textContent = 'Sound is unavailable in this browser.'; }
    finally { starting = false; }
  });
  document.addEventListener('visibilitychange', function () { if (document.hidden) stop(); });
  window.addEventListener('pagehide', stop);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && panel.open) { panel.open = false; panel.querySelector('summary').focus(); }
  });
  document.addEventListener('click', function (e) { if (!panel.contains(e.target)) panel.open = false; });
  function party(x, y) {
    var now = performance.now();
    if (now - lastDrop < 350) return;
    lastDrop = now;
    status.textContent = 'Fresh slice. Big vibes. 🍕';
    var still = reduced.matches || hero.dataset.motion === 'off';
    var copy = hero.querySelector('.dsp-copy');
    if (!still) {
      copy.classList.add('has-entered');
      clearTimeout(bounceTimer);
      copy.classList.remove('party-hit');
      void copy.offsetWidth;
      copy.classList.add('party-hit');
      bounceTimer = setTimeout(function () { copy.classList.remove('party-hit'); }, 850);
    }
    var effects = hero.querySelector('.dsp-party-effects');
    var rect = hero.getBoundingClientRect();
    for (var i = 0; i < (still ? 1 : 18); i++) {
      var bit = document.createElement('span');
      bit.className = 'dsp-confetti'; bit.textContent = i % 4 === 0 ? '🍕' : ['✦','●','♪'][i % 3];
      bit.style.left = (x - rect.left) + 'px'; bit.style.top = (y - rect.top) + 'px';
      bit.style.color = ['#ffe73c','#ff2d9b','#20c9e6','#fffaf0'][i % 4];
      effects.appendChild(bit);
      var angle = Math.random() * Math.PI * 2, distance = 70 + Math.random() * 130;
      bit.style.setProperty('--dx', Math.cos(angle) * distance + 'px');
      bit.style.setProperty('--dy', (Math.sin(angle) * distance + 60) + 'px');
      bit.style.setProperty('--spin', (Math.random() * 240 - 120) + 'deg');
      if (still) bit.classList.add('is-still');
      setTimeout(function (node) { return function () { node.remove(); }; }(bit), 1600);
    }
    if (playing) tone(520, 130, 0.2, 0.15, 'sine');
  }
  hero.addEventListener('click', function (e) {
    if (e.target.closest('a, input, label, button, details')) return;
    party(e.clientX, e.clientY);
  });
  hero.querySelector('.dsp-party-button').addEventListener('click', function () {
    var rect = hero.querySelector('.dsp-copy').getBoundingClientRect();
    party(rect.left + rect.width / 2, rect.top + rect.height / 2);
  });
})();
