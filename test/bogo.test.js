/* The BOGO easter egg in Pizza Emergency at the Techno: a local browser test.

   Build the site, then:  npm test   (or: node test/bogo.test.js)
   It serves _site (or SITE_DIR), plays the Techno chapter in headless Chromium,
   looks at the pizza poster in the back-right corner and checks the ticket:
   the code in party.js, Copy, the ticket link, that it's remembered, and that
   window.BOGO = null switches it off. SCREENSHOTS=some/dir saves the key frames. */
const http = require("http");
const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const SITE = path.resolve(process.env.SITE_DIR || path.join(__dirname, "..", "_site"));
const SHOTS = process.env.SCREENSHOTS && path.resolve(process.env.SCREENSHOTS);
const TYPES = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".png": "image/png", ".gif": "image/gif" };

if (!fs.existsSync(path.join(SITE, "emergency", "index.html"))) {
  console.error("No built site at " + SITE + ". Run `bundle exec jekyll build` first (or set SITE_DIR).");
  process.exit(1);
}
const PARTY = fs.readFileSync(path.join(SITE, "emergency", "party.js"), "utf8");
const CODE = new Function("window", PARTY + "; return window.BOGO && window.BOGO.code;")({});

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
  try { await fn(); results.push("ok"); console.log("  ok   " + name); }
  catch (e) { results.push("FAIL"); console.log("  FAIL " + name + "\n       " + e.message.split("\n")[0]); }
}
function expect(cond, msg) { if (!cond) throw new Error(msg); }

(async () => {
  const server = await serve();
  const base = "http://127.0.0.1:" + server.address().port;
  const browser = await chromium.launch();

  async function open(viewport, opts = {}) {
    const context = await browser.newContext({ viewport, hasTouch: !!opts.touch, isMobile: !!opts.touch, deviceScaleFactor: Number(process.env.DSF || 1) });
    await context.grantPermissions(["clipboard-read", "clipboard-write"], { origin: base });
    await context.route(/^https?:\/\/(?!127\.0\.0\.1)/, (r) => r.abort());
    if (opts.party) await context.route(/\/emergency\/party\.js/, (r) => r.fulfill({ contentType: "text/javascript", body: opts.party }));
    const page = await context.newPage();
    page.errors = [];
    page.on("pageerror", (e) => page.errors.push(e.message));
    await page.goto(base + "/emergency/?debug#techno", { waitUntil: "load" });
    return page;
  }
  const state = (page) => page.evaluate(() => ({ ui: window.__emergency.ui, mode: window.__emergency.G.mode, busy: window.__emergency.G.busy }));
  // press A until fn(state) holds (dialog pages need two presses: finish typing, then next)
  async function pressUntil(page, fn, what, max = 120) {
    for (let i = 0; i < max; i++) {
      const s = await state(page);
      if (fn(s)) return s;
      await page.keyboard.press("z");
      await page.waitForTimeout(60);
    }
    throw new Error("never reached: " + what + " (last " + JSON.stringify(await state(page)) + ")");
  }
  const exploring = (s) => s.mode === "explore" && !s.ui && !s.busy;
  // walk into the club, then stand under the poster (tile 14,0) facing it
  async function atThePoster(page) {
    await pressUntil(page, exploring, "free to explore the Techno");
    await page.evaluate(() => {
      const { hero, npcs } = window.__emergency;
      const promo = npcs.find((n) => n.id === "promo");
      Object.assign(promo, { x: 13, tx: 13, y: 1, ty: 1, moving: false, prog: 0 });
      Object.assign(hero, { x: 14, tx: 14, y: 1, ty: 1, dir: "up", moving: false, prog: 0 });
    });
    await page.waitForTimeout(100);
  }
  const shot = async (page, name) => { if (SHOTS) { fs.mkdirSync(SHOTS, { recursive: true }); await page.screenshot({ path: path.join(SHOTS, name + ".png") }); } };
  const card = (page) => page.locator("[data-bogo]");

  expect(CODE, "party.js has no window.BOGO.code");
  for (const [label, viewport, touch] of [["phone 390", { width: 390, height: 844 }, true], ["desktop 1440", { width: 1440, height: 900 }, false]]) {
    console.log(label + " (code " + CODE + ")");
    const tag = label.split(" ")[0];

    await check("the poster hides a BOGO ticket: in-game ticket, then the card with the code", async () => {
      const page = await open(viewport, { touch });
      await atThePoster(page);
      await shot(page, tag + "-1-poster");
      await page.keyboard.press("z");
      await pressUntil(page, (s) => s.ui === "ticket", "the in-game ticket");
      await page.waitForTimeout(400);
      await shot(page, tag + "-2-ticket");
      await page.waitForTimeout(300);
      for (let i = 0; i < 40 && !(await card(page).isVisible()); i++) { await page.keyboard.press("z"); await page.waitForTimeout(60); }
      expect(await card(page).isVisible(), "the ticket card never opened");
      expect((await page.textContent("[data-bogo-code]")) === CODE, "card shows " + await page.textContent("[data-bogo-code]"));
      await shot(page, tag + "-3-card");

      // game keys don't reach the game while the card is open
      const before = await page.evaluate(() => window.__emergency.hero.x);
      await page.keyboard.press("ArrowLeft"); await page.waitForTimeout(400);
      expect(await page.evaluate(() => window.__emergency.hero.x) === before, "the hero walked while the card was open");

      await page.click("[data-bogo-copy]");
      await page.waitForFunction(() => document.querySelector("[data-bogo-copy]").textContent === "Copied!", null, { timeout: 2000 });
      expect((await page.evaluate(() => navigator.clipboard.readText())) === CODE, "clipboard doesn't hold the code");

      const href = await page.getAttribute("[data-bogo-link]", "href");
      expect(/^https?:\/\//.test(href), "ticket link is " + href);
      expect(await page.getAttribute("[data-bogo-link]", "target") === "_blank", "the ticket link would leave the game");

      await page.click("[data-bogo-close]");
      expect(!(await card(page).isVisible()), "card didn't close");
      await pressUntil(page, exploring, "back to exploring after the ticket");
      expect(await page.isVisible("[data-bogo-open]"), "no 'Your BOGO ticket' button after finding it");

      // remembered: after a reload the button is there and reopens the card
      await page.reload({ waitUntil: "load" });
      expect(await page.isVisible("[data-bogo-open]"), "ticket forgotten after a reload");
      await page.click("[data-bogo-open]");
      expect(await card(page).isVisible() && (await page.textContent("[data-bogo-code]")) === CODE, "button doesn't reopen the card");
      await page.keyboard.press("Escape");
      expect(!(await card(page).isVisible()), "Escape didn't close the card");

      // a second look at the poster just reminds you of the code
      await atThePoster(page);
      await page.keyboard.press("z");
      await pressUntil(page, exploring, "done looking again");
      expect(!(await card(page).isVisible()), "card reopened on a second look");
      expect(page.errors.length === 0, "page errors: " + page.errors.join(" | "));
      await page.context().close();
    });
  }

  console.log("config");
  await check("with a ticket url, the link applies the code (?discount=)", async () => {
    const page = await open({ width: 390, height: 844 }, { party: 'window.NEXT_PARTY = null; window.BOGO = { code: "test-2for1", url: "https://www.eventbrite.com/e/next-party-123?aff=egg" };' });
    await atThePoster(page);
    await page.keyboard.press("z");
    for (let i = 0; i < 80 && !(await card(page).isVisible()); i++) { await page.keyboard.press("z"); await page.waitForTimeout(60); }
    expect((await page.textContent("[data-bogo-code]")) === "TEST-2FOR1", "code not normalised: " + await page.textContent("[data-bogo-code]"));
    const href = await page.getAttribute("[data-bogo-link]", "href");
    expect(href === "https://www.eventbrite.com/e/next-party-123?aff=egg&discount=TEST-2FOR1", "link is " + href);
    await page.context().close();
  });

  await check("window.BOGO = null: the poster is just a poster", async () => {
    const page = await open({ width: 390, height: 844 }, { party: "window.NEXT_PARTY = null; window.BOGO = null;" });
    await atThePoster(page);
    await page.keyboard.press("z");
    let sawTicket = false;
    for (let i = 0; i < 30; i++) {
      const s = await state(page);
      if (s.ui === "ticket") sawTicket = true;
      if (exploring(s) && i > 2) break;
      await page.keyboard.press("z"); await page.waitForTimeout(60);
    }
    expect(!sawTicket && !(await card(page).isVisible()) && !(await page.isVisible("[data-bogo-open]")), "the egg showed up anyway");
    expect(page.errors.length === 0, "page errors: " + page.errors.join(" | "));
    await page.context().close();
  });

  await browser.close();
  server.close();
  const failed = results.filter((r) => r === "FAIL").length;
  console.log("\n" + (results.length - failed) + " passed, " + failed + " failed");
  process.exit(failed ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
