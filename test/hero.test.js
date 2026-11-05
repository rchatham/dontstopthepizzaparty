/* Homepage hero: a local browser test.

   Build the site, then run the test against the build:
     bundle exec jekyll build
     npm install && npx playwright install chromium   (first time only)
     npm test

   It serves _site (or SITE_DIR) on a local port, drives the homepage in
   headless Chromium at phone and desktop sizes, and fails on any page error.
   SCREENSHOTS=some/dir also saves a phone and a desktop screenshot there. */
const http = require("http");
const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const SITE = path.resolve(process.env.SITE_DIR || path.join(__dirname, "..", "_site"));
const SHOTS = process.env.SCREENSHOTS && path.resolve(process.env.SCREENSHOTS);
const TYPES = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".png": "image/png",
  ".gif": "image/gif", ".jpg": "image/jpeg", ".svg": "image/svg+xml", ".json": "application/json", ".xml": "text/xml" };

if (!fs.existsSync(path.join(SITE, "index.html"))) {
  console.error("No built site at " + SITE + ". Run `bundle exec jekyll build` first (or set SITE_DIR).");
  process.exit(1);
}

function serve() {
  const server = http.createServer((req, res) => {
    let file = path.join(SITE, decodeURIComponent(req.url.split("?")[0]));
    if (!file.startsWith(SITE)) { res.writeHead(403); return res.end(); }
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, "index.html");
    if (!fs.existsSync(file)) { res.writeHead(404); return res.end("not found"); }
    res.writeHead(200, { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream" });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise((resolve) => server.listen(0, "127.0.0.1", () => resolve(server)));
}

const results = [];
async function check(name, fn) {
  try { await fn(); results.push(["ok", name]); console.log("  ok   " + name); }
  catch (e) { results.push(["FAIL", name]); console.log("  FAIL " + name + "\n       " + e.message.split("\n")[0]); }
}
function expect(cond, msg) { if (!cond) throw new Error(msg); }

const PHONE = { width: 390, height: 844 };
const DESKTOP = { width: 1440, height: 900 };

(async () => {
  const server = await serve();
  const base = "http://127.0.0.1:" + server.address().port;
  const browser = await chromium.launch();

  // a fresh page per check; page errors and console errors fail the check
  async function open(viewport, opts = {}) {
    const context = await browser.newContext({ viewport, reducedMotion: opts.reducedMotion || "no-preference",
      hasTouch: !!opts.touch, isMobile: !!opts.touch });
    // analytics and other third parties stay out of the test (Google Fonts is allowed)
    await context.route(/^https?:\/\/(?!127\.0\.0\.1|fonts\.(googleapis|gstatic)\.com)/, (r) => r.abort());
    const page = await context.newPage();
    page.errors = [];
    page.on("pageerror", (e) => page.errors.push(e.message));
    await page.goto(base + (opts.query || "/"), { waitUntil: "load" });
    await page.evaluate(() => Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 3000))]));
    await page.waitForTimeout(1100); // let the entrance pop finish
    return page;
  }
  async function done(page) {
    expect(page.errors.length === 0, "page errors: " + page.errors.join(" | "));
    await page.context().close();
  }
  const box = (page, sel) => page.locator(sel).first().boundingBox();
  // the title drifts gently forever, so Playwright never sees it "stable": click its centre directly
  const clickTitle = async (page) => {
    const b = await box(page, ".dsp-logo");
    await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2);
  };
  const overlaps = (a, b) => a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;

  for (const [label, viewport] of [["phone 390", PHONE], ["desktop 1440", DESKTOP]]) {
    console.log(label);

    await check("layout: title on three lines, everything on screen, nothing on top of the title", async () => {
      const page = await open(viewport, { touch: viewport === PHONE });
      const lines = await page.$$eval(".dsp-logo span", (spans) => spans.map((s) => ({
        text: s.textContent, h: s.offsetHeight, /* untransformed: the title is rotated */ fs: parseFloat(getComputedStyle(s).fontSize) })));
      expect(lines.map((l) => l.text).join(" / ") === "Don’t Stop / ~ the ~ / Pizza Party", "title reads " + lines.map((l) => l.text).join(" / "));
      lines.forEach((l) => expect(l.h < l.fs * 1.3, "\"" + l.text + "\" wraps (" + Math.round(l.h) + "px tall at " + l.fs + "px)"));
      for (const sel of [".dsp-logo", ".dsp-tag", ".dsp-pill", ".dsp-credits", ".dsp-party-button", ".dsp-controls summary"]) {
        const b = await box(page, sel);
        expect(b && b.x >= 0 && b.y >= 0 && b.x + b.width <= viewport.width && b.y + b.height <= viewport.height,
          sel + " is off screen: " + JSON.stringify(b));
      }
      const title = await box(page, ".dsp-logo");
      for (const sel of [".dsp-stage", ".dsp-credits", ".dsp-pill"]) {
        expect(!overlaps(title, await box(page, sel)), sel + " overlaps the title");
      }
      const scrollX = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(scrollX <= 0, "the page scrolls sideways by " + scrollX + "px");
      if (SHOTS) {
        fs.mkdirSync(SHOTS, { recursive: true });
        await page.screenshot({ path: path.join(SHOTS, label.split(" ")[0] + ".png") });
      }
      await done(page);
    });

    await check("click on the title: group bounce and 18 bits of confetti, cleaned up after", async () => {
      const page = await open(viewport);
      await clickTitle(page);
      expect(await page.$eval(".dsp-copy", (c) => c.classList.contains("party-hit")), "no party-hit bounce");
      expect(await page.locator(".dsp-confetti").count() === 18, "confetti count " + await page.locator(".dsp-confetti").count());
      await page.waitForTimeout(1800);
      expect(await page.locator(".dsp-confetti").count() === 0, "confetti left behind");
      expect(!(await page.$eval(".dsp-copy", (c) => c.classList.contains("party-hit"))), "bounce never cleared");
      await done(page);
    });

    await check("Drop the pizza button throws confetti from the title", async () => {
      const page = await open(viewport);
      await page.click(".dsp-party-button");
      expect(await page.locator(".dsp-confetti").count() === 18, "no confetti");
      await done(page);
    });

    await check("stage controls open, close on Escape and on an outside click", async () => {
      const page = await open(viewport);
      const isOpen = () => page.$eval(".dsp-controls", (d) => d.open);
      await page.click(".dsp-controls summary");
      expect(await isOpen(), "panel didn't open");
      const panel = await box(page, ".dsp-controls__panel");
      expect(panel.x >= 0 && panel.x + panel.width <= viewport.width && panel.y + panel.height <= viewport.height,
        "panel is off screen: " + JSON.stringify(panel));
      await page.keyboard.press("Escape");
      expect(!(await isOpen()), "Escape didn't close it");
      await page.click(".dsp-controls summary");
      await page.mouse.click(10, viewport.height / 2);
      expect(!(await isOpen()), "an outside click didn't close it");
      await done(page);
    });
  }

  console.log("controls (desktop)");
  const set = (page, sel, value) => page.$eval(sel, (el, v) => {
    el.value = v; el.dispatchEvent(new Event(el.tagName === "SELECT" ? "change" : "input", { bubbles: true }));
  }, String(value));
  const heroVar = (page, name) => page.$eval(".dsp-hero", (h, n) => h.style.getPropertyValue(n), name);

  await check("lights: a pattern from the menu, off hides them, ?lights= picks one", async () => {
    let page = await open(DESKTOP);
    await page.click(".dsp-controls summary");
    await set(page, "#stage-lights", "chase");
    expect(await page.$eval(".dsp-hero", (h) => h.dataset.lights) === "chase", "chase not applied");
    await set(page, "#stage-lights", "off");
    expect(await page.$eval(".dsp-spots", (s) => getComputedStyle(s).display) === "none", "lights still showing when off");
    await done(page);
    page = await open(DESKTOP, { query: "/?lights=strobe" });
    expect(await page.$eval(".dsp-hero", (h) => h.dataset.lights) === "strobe", "?lights=strobe ignored");
    expect(await page.$eval("#stage-lights", (s) => s.value) === "strobe", "menu doesn't show strobe");
    await done(page);
  });

  await check("light intensity 0 makes the light layers fully transparent, 100 fully on", async () => {
    const page = await open(DESKTOP);
    // the filter eases over 1s, so wait (up to 3s) for it to land
    const lands = async (sel, re) => {
      try { await page.waitForFunction(([s, r]) => new RegExp(r).test(getComputedStyle(document.querySelector(s)).filter), [sel, re], { timeout: 3000 }); }
      catch (e) { throw new Error(sel + " filter is " + await page.$eval(sel, (el) => getComputedStyle(el).filter) + ", wanted " + re); }
    };
    await set(page, "#stage-light-intensity", 0);
    for (const sel of [".dsp-spots", ".dsp-lights"]) await lands(sel, "opacity\\(0\\)");
    await set(page, "#stage-light-intensity", 100);
    for (const sel of [".dsp-spots", ".dsp-lights"]) await lands(sel, "opacity\\(1\\)");
    await done(page);
  });

  await check("tempo and light speed set the beat", async () => {
    const page = await open(DESKTOP);
    await set(page, "#stage-tempo", 150);
    expect(await heroVar(page, "--beat") === "0.4s", "--beat at 150 bpm is " + await heroVar(page, "--beat"));
    expect(await page.textContent("#stage-bpm") === "150 BPM", "BPM label not updated");
    await set(page, "#stage-light-speed", 200);
    expect(await heroVar(page, "--light-beat") === "0.2s", "--light-beat at 200% is " + await heroVar(page, "--light-beat"));
    await done(page);
  });

  await check("motion slider: 0 switches motion off, 300 triples it", async () => {
    const page = await open(DESKTOP);
    await set(page, "#stage-motion", 0);
    expect(await page.$eval(".dsp-hero", (h) => h.dataset.motion) === "off", "motion not off at 0");
    expect(await page.textContent("#stage-motion-value") === "0%", "label not 0%");
    await set(page, "#stage-motion", 300);
    expect(await heroVar(page, "--motion") === "3", "--motion at 300 is " + await heroVar(page, "--motion"));
    await done(page);
  });

  await check("the title follows the mouse", async () => {
    const page = await open(DESKTOP);
    const at = async (x, y) => {
      await page.mouse.move(x, y); await page.waitForTimeout(1000);
      return page.$eval(".dsp-copy", (c) => getComputedStyle(c).translate);
    };
    const left = await at(5, 5), right = await at(DESKTOP.width - 5, DESKTOP.height - 5);
    expect(left !== right && left !== "none", "translate didn't change: " + left + " vs " + right);
    await done(page);
  });

  await check("sound defaults on, starts with interaction, and stays muted when switched off", async () => {
    const page = await open(DESKTOP);
    const pressed = () => page.$eval("#stage-sound", (b) => b.getAttribute("aria-pressed"));
    expect(await pressed() === "true", "sound is not enabled by default");
    await page.click(".dsp-controls summary");
    await page.waitForFunction(() => document.getElementById("stage-sound").textContent === "Sound: on", null, { timeout: 3000 });
    await page.click("#stage-sound");
    expect(await pressed() === "false", "sound didn't stop");
    await page.click(".dsp-party-button");
    expect(await pressed() === "false", "interaction undid the mute");
    await done(page);
  });

  await check("reduced motion: motion starts at 0 and a click gives one still slice", async () => {
    const page = await open(PHONE, { reducedMotion: "reduce" });
    expect(await page.$eval(".dsp-hero", (h) => h.dataset.motion) === "off", "motion not off");
    await clickTitle(page);
    expect(await page.locator(".dsp-confetti.is-still").count() === 1, "expected one still slice");
    expect(!(await page.$eval(".dsp-copy", (c) => c.classList.contains("party-hit"))), "it bounced anyway");
    await done(page);
  });

  await check("secret word: typing techno goes to the pizza emergency", async () => {
    const page = await open(PHONE);
    await page.fill(".dsp-pill input", "");
    await page.type(".dsp-pill input", "techno");
    await page.waitForURL(/\/emergency\/$/, { timeout: 3000 });
    await done(page);
  });

  await browser.close();
  server.close();
  const failed = results.filter((r) => r[0] === "FAIL").length;
  console.log("\n" + (results.length - failed) + " passed, " + failed + " failed");
  process.exit(failed ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
