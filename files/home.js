/* Homepage hero.
   - ?lights=strobe|fade|chase|pulse|off picks the light show.
   - The wallpaper is split into tile-wide columns that bounce like EQ bars on
     every beat (124 bpm, the same --beat the CSS uses), bass side hardest.
   - The logo block follows the pointer in 3D (the mouse on desktop, a finger while
     it's touching on phones) and wobbles when clicked, like pizzaandtechno.com;
     the wallpaper and stickers lean the other way. */
(function () {
  var hero = document.querySelector(".dsp-hero");
  if (!hero) return;
  var pick = (location.search.match(/[?&]lights=(strobe|fade|chase|pulse|off)\b/) || [])[1];
  if (pick) hero.setAttribute("data-lights", pick);
  var calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (calm) return;

  // ---- the pizza visualizer ----
  var wall = hero.querySelector(".dsp-wallpaper");
  var BEAT = 60000 / 124;
  var cols = [];
  function build() {
    var n = Math.ceil(wall.offsetWidth / 156) + 2;
    if (n === cols.length) return;
    wall.textContent = "";
    cols = [];
    for (var i = 0; i < n; i++) {
      var c = document.createElement("div");
      c.className = "viz-col";
      c.style.setProperty("--fall", (BEAT * 0.8 / 1000).toFixed(3) + "s");
      wall.appendChild(c);
      cols.push(c);
    }
    wall.classList.add("is-viz");
  }
  if (wall && hero.getAttribute("data-lights") !== "off") {
    build();
    window.addEventListener("resize", build);
    window.addEventListener("load", build);           // Safari can measure before layout settles
    if ("ResizeObserver" in window) new ResizeObserver(build).observe(wall);
    var start = performance.now();
    var last = -1;
    var tick = function (now) {
      var beat = Math.floor((now - start) / BEAT);
      if (beat !== last) {
        last = beat;
        var down = beat % 4 === 0;                 // the first beat of a bar hits harder
        cols.forEach(function (c, i) {
          var bass = 1 - (i / cols.length) * 0.6;  // left side is the bass
          var amp = (down ? 22 : 14) * bass * (0.35 + Math.random() * 0.65);
          c.classList.add("hit");
          c.style.transform = "translateY(" + (-amp).toFixed(1) + "px)";
        });
        setTimeout(function () {
          cols.forEach(function (c) { c.classList.remove("hit"); c.style.transform = ""; });
        }, 80);
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  // ---- the logo follows the pointer; the wallpaper and stickers lean away ----
  var frame = 0;
  var follow = function (e) {
    if (frame) return;
    frame = requestAnimationFrame(function () {
      frame = 0;
      hero.style.setProperty("--px", ((e.clientX / window.innerWidth) * 2 - 1).toFixed(3));
      hero.style.setProperty("--py", ((e.clientY / window.innerHeight) * 2 - 1).toFixed(3));
    });
  };
  var settle = function (e) {
    if (e.pointerType === "mouse") return;
    hero.style.setProperty("--px", 0);
    hero.style.setProperty("--py", 0);
  };
  window.addEventListener("pointermove", follow);
  window.addEventListener("pointerdown", function (e) { if (e.pointerType !== "mouse") follow(e); });
  window.addEventListener("pointerup", settle);
  window.addEventListener("pointercancel", settle);

  // ---- click the logo: jello ----
  var copy = hero.querySelector(".dsp-copy");
  if (copy) {
    copy.addEventListener("click", function () {
      copy.classList.remove("jello");
      void copy.offsetWidth;                         // restart the animation on every click
      copy.classList.add("jello");
    });
    copy.addEventListener("animationend", function () { copy.classList.remove("jello"); });
  }
})();
