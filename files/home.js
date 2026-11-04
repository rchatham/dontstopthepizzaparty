/* Homepage hero: the doodles lean away from the mouse (desktop only). */
(function () {
  var hero = document.querySelector(".dsp-hero");
  if (!hero) return;
  var fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!fine || calm) return;
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
