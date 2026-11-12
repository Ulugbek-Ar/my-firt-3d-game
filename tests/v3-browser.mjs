import { chromium } from "playwright";
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
await mkdir(".artifacts", { recursive: true });
const baseURL = process.env.BASE_URL || "http://127.0.0.1:5177";
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || undefined,
  headless: true,
  args: [
    "--no-sandbox",
    "--enable-unsafe-swiftshader",
    "--use-gl=angle",
    "--use-angle=swiftshader",
  ],
});
try {
  const page = await browser.newPage({
      viewport: { width: 1280, height: 800 },
    }),
    errors = [],
    assets = new Set();
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("response", (r) => {
    if (r.url().includes("/textures/") && r.ok())
      assets.add(r.url().split("/").pop());
  });
  let releaseArt;
  const artGate = new Promise((resolve) => {
    releaseArt = resolve;
  });
  await page.route("**/textures/*.png", async (route) => {
    await artGate;
    await route.continue();
  });
  async function settlePanel() {
    const panel = page.locator(".panel");
    if (await panel.count())
      await panel.evaluate((el) =>
        Promise.all(
          el
            .getAnimations()
            .filter((a) => a.effect.getTiming().iterations !== Infinity)
            .map((a) => a.finished.catch(() => {})),
        ),
      );
  }
  // Test-only draw instrumentation: measure submitted geometry, not source-file complexity.
  await page.addInitScript(() => {
    let calls = 0,
      triangles = 0;
    window.__drawFrames = [];
    const getContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...args) {
      const gl = getContext.call(this, type, ...args);
      if (gl && (type === "webgl2" || type === "webgl") && !gl.__measured) {
        gl.__measured = true;
        for (const name of [
          "drawElements",
          "drawArrays",
          "drawElementsInstanced",
          "drawArraysInstanced",
        ]) {
          if (!gl[name]) continue;
          const draw = gl[name].bind(gl);
          gl[name] = (...values) => {
            calls++;
            const count = name.startsWith("drawElements")
              ? values[1]
              : values[2];
            if (values[0] === 4)
              triangles +=
                (count / 3) * (name.endsWith("Instanced") ? values.at(-1) : 1);
            return draw(...values);
          };
        }
      }
      return gl;
    };
    const raf = window.requestAnimationFrame;
    window.requestAnimationFrame = (callback) =>
      raf.call(window, (time) => {
        calls = triangles = 0;
        callback(time);
        if (calls) {
          window.__drawFrames.push({ calls, triangles });
          if (window.__drawFrames.length > 30) window.__drawFrames.shift();
        }
      });
  });
  await page.goto(baseURL, { waitUntil: "domcontentloaded" });
  await page
    .locator("#overlay[data-kind=loading]")
    .waitFor({ state: "visible" });
  await settlePanel();
  await page.screenshot({ path: ".artifacts/v3-loading.png" });
  releaseArt();
  await page.getByRole("button", { name: "Yangi o‘yin" }).waitFor();
  await page.waitForTimeout(400);
  await settlePanel();
  await page.screenshot({ path: ".artifacts/v3-menu.png" });
  const caption = await page.locator(".menu-world-caption").boundingBox();
  assert.ok(
    caption.x > 700,
    "menu caption must never overlap navigation during transitions",
  );
  assert.ok(
    assets.has("asterfall-atlas.png") &&
      assets.has("ground.png") &&
      assets.has("mud.png"),
  );
  await page.getByRole("button", { name: "Yangi o‘yin" }).click();
  await page.getByRole("button", { name: "Xotiraga ergashish" }).click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: ".artifacts/v3-village-low.png" });
  const lowFrames = await page.evaluate(() => window.__drawFrames);
  console.log(
    "Measured Low submitted frames (software WebGL, not hardware FPS):",
    lowFrames.slice(-3),
  );
  assert.ok(
    lowFrames.length && lowFrames.at(-1).calls < 110,
    "rendered Low draw budget",
  );
  await page.screenshot({
    path: ".artifacts/v3-kael.png",
    clip: { x: 470, y: 250, width: 340, height: 340 },
  });
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Sozlamalar" }).click();
  await page.locator("#resolution").selectOption("0.6");
  assert.equal(
    await page.evaluate(() => document.querySelector("#world").width),
    768,
  );
  await page.locator("#quality").selectOption("medium");
  await page.locator("#resolution").selectOption("1");
  await settlePanel();
  await page.screenshot({ path: ".artifacts/v3-settings.png" });
  await page.getByRole("button", { name: "Qaytish" }).click();
  await page.getByRole("button", { name: "Qaytish" }).click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: ".artifacts/v3-village-medium.png" });
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Bosh menyu" }).click();
  await page.reload();
  await page.getByRole("button", { name: "Sozlamalar" }).click();
  assert.equal(await page.locator("#resolution").inputValue(), "1");
  await page.setViewportSize({ width: 850, height: 650 });
  await settlePanel();
  await page.screenshot({ path: ".artifacts/v3-compact-ui.png" });
  const back = page.getByRole("button", { name: "Qaytish" });
  const rect = await back.boundingBox();
  assert.ok(rect.y + rect.height <= 650);
  await page.close();
  const shrinePage = await browser.newPage({
    viewport: { width: 1280, height: 800 },
  });
  shrinePage.on("pageerror", (e) => errors.push(e.message));
  await shrinePage.addInitScript(() =>
    localStorage.setItem(
      "the-last-epoch.save",
      JSON.stringify({
        version: 1,
        position: { x: 0, y: 0, z: -13.3 },
        graphics: "medium",
        objectiveComplete: false,
        playSeconds: 200,
      }),
    ),
  );
  await shrinePage.goto(baseURL);
  await shrinePage.getByRole("button", { name: "Davom etish" }).click();
  await shrinePage.locator("#prompt").waitFor({ state: "visible" });
  await shrinePage.waitForTimeout(400);
  await shrinePage.screenshot({ path: ".artifacts/v3-shrine.png" });
  await shrinePage.keyboard.press("KeyE");
  await shrinePage.getByText("Toshlar eslaydi.").waitFor();
  await shrinePage.close();
  const fallback = await browser.newPage();
  fallback.on("pageerror", (e) => errors.push(e.message));
  await fallback.route("**/textures/*.png", (route) => route.abort());
  await fallback.goto(baseURL);
  await fallback.getByRole("button", { name: "Yangi o‘yin" }).click();
  await fallback.getByRole("button", { name: "Xotiraga ergashish" }).click();
  await fallback.locator("#hud").waitFor({ state: "visible" });
  assert.deepEqual(errors, []);
  console.log(
    "PASS V3 art loading, Low/Medium visuals, resolution persistence, compact UI, shrine, and runtime console",
  );
} finally {
  await browser.close();
}
