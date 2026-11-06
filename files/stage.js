/* Local party effects and a synthesized dance beat. No audio downloads. */
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
  var audio, gain, filter, timer, playing = false, soundWanted = true, starting = false, step = 0, lastDrop = -Infinity;
  var bounceTimer;
  var dropButton = hero.querySelector('.dsp-party-button');
  var dropPhase = 'idle', dropStep = 0;
  function setDropPhase(phase) {
    dropPhase = phase; dropStep = 0; hero.dataset.drop = phase;
    dropButton.disabled = phase !== 'idle';
    dropButton.textContent = {idle:'🍕 Drop the pizza',queued:'🍕 Drop queued…',build:'🍕 Building…',break:'🍕 Wait for it…',drop:'🍕 PIZZA DROP!'}[phase];
  }
  function dropBurst() {
    var rect = textGroup.getBoundingClientRect();
    party(rect.left + rect.width / 2, rect.top + rect.height / 2, true);
  }
  var textGroup = hero.querySelector('.dsp-copy');
  textGroup.addEventListener('animationend', function (event) {
    if (event.target === textGroup) textGroup.classList.add('has-entered');
  });
  lights.value = /[?&]lights=/.test(location.search) ? hero.dataset.lights : (hero.dataset.lightShow || hero.dataset.lights);
  var lightSpeed = document.getElementById('stage-light-speed');
  var intensity = document.getElementById('stage-light-intensity');
  var color = document.getElementById('stage-color');
  var groove = document.getElementById('stage-groove');
  var kick = document.getElementById('stage-kick');
  var bass = document.getElementById('stage-bass');
  var hats = document.getElementById('stage-hats');
  var toneControl = document.getElementById('stage-tone');
  var shows = ['fade', 'chase', 'pulse', 'chase'], showIndex = 0;
  function updateLightSpeed() {
    hero.style.setProperty('--light-beat', (60 / Number(tempo.value) / (Number(lightSpeed.value) / 100)) + 's');
  }
  function applyLights() {
    hero.dataset.lights = lights.value === 'auto' ? shows[showIndex % shows.length] : lights.value;
  }
  lights.addEventListener('change', applyLights);
  setInterval(function () {
    if (document.hidden || lights.value !== 'auto' || reduced.matches) return;
    showIndex++; applyLights();
    hero.style.setProperty('--light-hue', (Number(color.value) + showIndex * 35) % 360 + 'deg');
  }, 6000);
  lightSpeed.addEventListener('input', updateLightSpeed);
  intensity.addEventListener('input', function () {
    hero.style.setProperty('--light-intensity', Number(intensity.value) / 100);
  });
  color.addEventListener('change', function () { hero.style.setProperty('--light-hue', color.value + 'deg'); });
  if (reduced.matches) motion.value = '0';
  function updateMotion() {
    var amount = reduced.matches ? 0 : Number(motion.value) / 100;
    hero.dataset.motion = amount === 0 ? 'off' : 'gentle';
    hero.style.setProperty('--motion', amount);
    document.getElementById('stage-motion-value').textContent = Math.round(amount * 100) + '%';
    if (!amount) { hero.style.setProperty('--px', 0); hero.style.setProperty('--py', 0); }
  }
  motion.addEventListener('input', updateMotion);
  reduced.addEventListener('change', updateMotion);
  updateMotion(); applyLights(); updateLightSpeed();
  toneControl.addEventListener('input', function () {
    if (filter) filter.frequency.setTargetAtTime(Number(toneControl.value), audio.currentTime, 0.03);
  });
  tempo.addEventListener('input', function () {
    hero.dataset.tempo = tempo.value;
    updateLightSpeed();
    hero.style.setProperty('--beat', (60 / Number(tempo.value)) + 's');
    document.getElementById('stage-bpm').textContent = tempo.value + ' BPM';
  });
  volume.addEventListener('input', function () {
    if (gain) gain.gain.setTargetAtTime(Number(volume.value) / 100 * 0.35, audio.currentTime, 0.03);
  });
  function tone(freq, endFreq, duration, level, type, delay) {
    if (level <= 0) return;
    var osc = audio.createOscillator(), envelope = audio.createGain(), now = audio.currentTime + (delay || 0);
    osc.type = type; osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(endFreq, now + duration);
    envelope.gain.setValueAtTime(level, now);
    envelope.gain.exponentialRampToValueAtTime(0.001, now + duration);
    osc.connect(envelope); envelope.connect(filter); osc.start(now); osc.stop(now + duration);
    osc.onended = function () { osc.disconnect(); envelope.disconnect(); };
  }
  function beat() {
    if (!playing) return;
    if (dropPhase === 'queued' && step % 8 === 0) setDropPhase('build');
    if (dropPhase === 'build') {
      // Eight beats of rising percussion, with the kick and bass pulled out.
      var pitch = 260 * Math.pow(4, dropStep / 15);
      tone(pitch, pitch * 1.2, 0.1, Number(hats.value) / 100 * 0.18, 'triangle');
      if (dropStep >= 8) tone(pitch * 1.25, pitch * 1.5, 0.06, Number(hats.value) / 100 * 0.12, 'triangle', 15000 / Number(tempo.value) / 1000);
      if (++dropStep === 16) setDropPhase('break');
    } else if (dropPhase === 'break') {
      // One beat of silence makes the return hit harder, without raising master volume.
      if (++dropStep === 2) { setDropPhase('drop'); step = -1; }
    } else {
      var dropping = dropPhase === 'drop';
      if (dropping && dropStep === 0) {
        dropBurst();
        tone(75, 32, 0.65, Number(bass.value) / 100 * 0.45, 'sine');
        status.textContent = 'Pizza drop! Bass is back.';
      }
      var pattern = groove.value;
      var hit = pattern === 'broken' ? [0, 3, 6].indexOf(step % 8) !== -1 : step % 2 === 0;
      if (hit && Number(kick.value)) tone(pattern === 'techno' ? 165 : 130, 42, dropping ? 0.35 : 0.22, Number(kick.value) / 100, 'sine');
      if ((step % 2 || pattern === 'techno') && Number(hats.value)) tone(2200, 650, 0.035, Number(hats.value) / 100 * 0.14, 'triangle');
      if (step % 4 === 2 && Number(hats.value)) tone(180, 75, 0.09, Number(hats.value) / 100 * 0.2, 'triangle');
      if (Number(bass.value) && (step % 2 || pattern === 'broken')) {
        var note = [55, 55, 65.41, 49][Math.floor(step / 2) % 4];
        tone(dropping ? note / 2 : note, dropping ? note / 2 : note, dropping ? 0.3 : 0.18, Number(bass.value) / 100 * 0.3, (dropping || pattern === 'techno') ? 'sawtooth' : 'triangle');
      }
      if (dropping && ++dropStep === 16) setDropPhase('idle');
    }
    step++;
    timer = setTimeout(beat, 30000 / Number(tempo.value));
  }
  function stop() {
    soundWanted = false; playing = false; clearTimeout(timer);
    setDropPhase('idle');
    if (gain) gain.gain.setTargetAtTime(0, audio.currentTime, 0.02);
    sound.setAttribute('aria-pressed', 'false'); sound.textContent = 'Sound: off';
  }
  function prepareAudio() {
    if (audio) return;
    var Audio = window.AudioContext || window.webkitAudioContext;
    audio = new Audio(); gain = audio.createGain(); filter = audio.createBiquadFilter();
    filter.type = 'lowpass'; filter.frequency.value = Number(toneControl.value);
    filter.connect(gain); gain.connect(audio.destination);
  }
  async function startSound() {
    if (starting || playing || !soundWanted) return;
    starting = true;
    try {
      prepareAudio();
      await audio.resume();
      if (document.hidden || !soundWanted) return;
      gain.gain.setValueAtTime(Number(volume.value) / 100 * 0.35, audio.currentTime);
      playing = true; step = 0; beat();
      sound.setAttribute('aria-pressed', 'true'); sound.textContent = 'Sound: on';
      status.textContent = 'Beat on. Mix it your way.';
    } catch (error) { stop(); status.textContent = 'Sound is unavailable in this browser.'; }
    finally { starting = false; }
  }
  sound.addEventListener('click', function () {
    if (soundWanted) { stop(); return; }
    soundWanted = true;
    sound.setAttribute('aria-pressed', 'true');
    sound.textContent = 'Sound: on · starting';
    startSound();
  });
  // Autoplay when allowed; otherwise wait for a real user gesture.
  // Never let a gesture undo an explicit mute, including the mute button itself.
  function unlockSound(event) {
    if (event.target.closest && event.target.closest('#stage-sound')) return;
    if (soundWanted && !playing) startSound();
  }
  document.addEventListener('pointerup', unlockSound);
  document.addEventListener('click', unlockSound);
  document.addEventListener('keydown', unlockSound);
  try {
    prepareAudio();
    if (audio.state === 'running') startSound();
  } catch (error) { stop(); status.textContent = 'Sound is unavailable in this browser.'; }
  document.addEventListener('visibilitychange', function () { if (document.hidden) stop(); });
  window.addEventListener('pagehide', stop);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && panel.open) { panel.open = false; panel.querySelector('summary').focus(); }
  });
  document.addEventListener('click', function (e) { if (!panel.contains(e.target)) panel.open = false; });
  function party(x, y, big) {
    // Click accents remain playable throughout the drop, independently of visual throttling.
    if (playing && !big) tone(520, 130, 0.2, 0.15, 'sine');
    var now = performance.now();
    if (!big && now - lastDrop < 350) return;
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
    for (var i = 0; i < (still ? 1 : (big ? 48 : 18)); i++) {
      var bit = document.createElement('span');
      bit.className = 'dsp-confetti'; bit.textContent = i % 4 === 0 ? '🍕' : ['✦','●','♪'][i % 3];
      bit.style.left = (x - rect.left) + 'px'; bit.style.top = (y - rect.top) + 'px';
      bit.style.color = ['#ffe73c','#ff2d9b','#20c9e6','#fffaf0'][i % 4];
      effects.appendChild(bit);
      var angle = Math.random() * Math.PI * 2, distance = (big ? 130 : 70) + Math.random() * (big ? 240 : 130);
      bit.style.setProperty('--dx', Math.cos(angle) * distance + 'px');
      bit.style.setProperty('--dy', (Math.sin(angle) * distance + 60) + 'px');
      bit.style.setProperty('--spin', (Math.random() * 240 - 120) + 'deg');
      if (still) bit.classList.add('is-still');
      setTimeout(function (node) { return function () { node.remove(); }; }(bit), 1600);
    }
  }
  hero.addEventListener('click', function (e) {
    if (e.target.closest('a, input, label, button, details')) return;
    party(e.clientX, e.clientY);
  });
  dropButton.addEventListener('click', function () {
    if (dropPhase !== 'idle') return;
    if (!soundWanted) {
      dropBurst();
      status.textContent = 'Visual drop! Turn sound on for the musical build-up.';
      return;
    }
    setDropPhase('queued');
    status.textContent = 'Drop queued for the next bar. Here we go…';
    startSound();
  });
})();
