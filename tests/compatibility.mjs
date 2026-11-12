import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
await mkdir(".artifacts", { recursive: true });
const baseURL = process.env.BASE_URL || "http://127.0.0.1:5173";
import assert from "node:assert/strict";
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
  // Force the application's real capability detection down its WebGL1 path.
  const page = await browser.newPage({ viewport: { width: 960, height: 640 } });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...args) {
      return type === "webgl2" ? null : original.call(this, type, ...args);
    };
  });
  await page.goto(baseURL);
  await page.getByRole("button", { name: "Yangi o‘yin" }).click();
  await page.getByRole("button", { name: "Xotiraga ergashish" }).click();
  await page.locator("#hud").waitFor({ state: "visible" });
  await page.waitForTimeout(500);
  assert.deepEqual(errors, []);
  console.log("PASS forced WebGL1 application startup");
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Sozlamalar" }).click();
  await page.locator("#quality").selectOption("low");
  await page.getByRole("button", { name: "Qaytish" }).click();
  await page.getByRole("button", { name: "Qaytish" }).click();
  await page.mouse.move(500, 300);
  await page.mouse.down();
  await page.mouse.move(650, 340, { steps: 5 });
  await page.mouse.up();
  await page.waitForTimeout(500);
  await page.screenshot({ path: ".artifacts/epoch-camera.png" });
  await page.keyboard.down("KeyW");
  await page.waitForTimeout(1200);
  await page.keyboard.up("KeyW");
  await page.keyboard.press("Escape");
  const turnedSave = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("the-last-epoch.save")),
  );
  assert.ok(
    turnedSave.position.x > 0.2,
    "camera drag changes camera-relative travel direction",
  );
  assert.equal(turnedSave.graphics, "low");
  assert.deepEqual(errors, []);
  console.log("PASS camera drag, relative movement, and Low preset");
  await page.close();
  const blocked = await browser.newPage();
  await blocked.addInitScript(() => {
    HTMLCanvasElement.prototype.getContext = () => null;
  });
  await blocked.goto(baseURL);
  await blocked.getByText("Grafika mavjud emas", { exact: true }).waitFor();
  console.log("PASS missing WebGL fallback");
  await blocked.close();
  const oldGPU = await browser.newPage();
  await oldGPU.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...args) {
      if (type === "webgl2") return null;
      const gl = original.call(this, type, ...args);
      if (gl && type === "webgl") {
        const getExtension = gl.getExtension.bind(gl);
        gl.getExtension = (name) =>
          name === "ANGLE_instanced_arrays" ? null : getExtension(name);
      }
      return gl;
    };
  });
  await oldGPU.goto(baseURL);
  await oldGPU.getByText("Grafika mavjud emas", { exact: true }).waitFor();
  console.log("PASS missing required GPU extension fallback");
  await oldGPU.close();
  const denied = await browser.newPage();
  await denied.addInitScript(() => {
    Object.defineProperty(window, "localStorage", {
      get() {
        throw new DOMException("Denied", "SecurityError");
      },
    });
  });
  await denied.goto(baseURL);
  await denied.getByRole("button", { name: "Yangi o‘yin" }).click();
  await denied.getByRole("button", { name: "Xotiraga ergashish" }).click();
  await denied
    .getByText("Saqlab bo‘lmadi. Brauzer xotirasiga ruxsatni tekshiring.")
    .waitFor();
  console.log("PASS storage denied graceful gameplay");
} finally {
  await browser.close();
}
