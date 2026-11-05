/* Homepage hero.
   - ?lights=strobe|fade|chase|pulse|off picks the light show.
   - The wallpaper is split into tile-wide columns that bounce like EQ bars on
     every four beats, with a gentle lift on the bass side.
   - Desktop: the wallpaper and stickers lean away from the mouse. */
(function () {
  var hero = document.querySelector(".dsp-hero");
  if (!hero) return;
  var pick = (location.search.match(/[?&]lights=(strobe|fade|chase|pulse|off)\b/) || [])[1];
  if (pick) hero.setAttribute("data-lights", pick);
  var calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (calm) return;

  // ---- the pizza visualizer ----
  var wall = hero.querySelector(".dsp-wallpaper");
  var BEAT = (60000 / 124) * 4;
  var cols = [];
  function build() {
    var n = Math.ceil(wall.offsetWidth / 156) + 1;
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
    var start = performance.now();
    var last = -1;
    var tick = function (now) {
      var beat = Math.floor((now - start) / BEAT);
      if (beat !== last) {
        last = beat;
        var down = beat % 4 === 0;                 // the first beat of a bar hits harder
        cols.forEach(function (c, i) {
          var bass = 1 - (i / cols.length) * 0.6;  // left side is the bass
          var amp = (down ? 12 : 8) * bass * (0.35 + Math.random() * 0.65);
          c.classList.add("hit");
          c.style.transform = "translateY(" + (-amp).toFixed(1) + "px)";
        });
        setTimeout(function () {
          cols.forEach(function (c) { c.classList.remove("hit"); c.style.transform = ""; });
        }, 260);
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  // ---- desktop mouse lean ----
  var fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (!fine) return;
  var frame = 0;
  window.addEventListener("pointermove", function (e) {
    if (frame) return;
    frame = requestAnimationFrame(function () {
      frame = 0;
      hero.style.setProperty("--px", ((e.clientX / window.innerWidth) * 2 - 1).toFixed(3));
      hero.style.setProperty("--py", ((e.clientY / window.innerHeight) * 2 - 1).toFixed(3));
    });
  });
})();
