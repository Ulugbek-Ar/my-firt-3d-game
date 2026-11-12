import { chromium } from "playwright";
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
await mkdir(".artifacts", { recursive: true });
const baseURL = process.env.BASE_URL || "http://127.0.0.1:5173";
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
  const errors = [];
  // These fixtures have exactly the schema written by V1, including its flat-ground y=0.
  for (const fixture of [
    { label: "hillside", x: 34, z: 8, complete: true },
    { label: "shrine", x: 0, z: -13.3, complete: false },
    { label: "village-low", x: 0, z: 19, complete: false },
  ]) {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 800 },
    });
    await context.addInitScript(
      (f) =>
        localStorage.setItem(
          "the-last-epoch.save",
          JSON.stringify({
            version: 1,
            position: { x: f.x, y: 0, z: f.z },
            graphics: f.label === "village-low" ? "low" : "medium",
            objectiveComplete: f.complete,
            playSeconds: 186,
          }),
        ),
      fixture,
    );
    const page = await context.newPage();
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto(baseURL);
    await page.getByRole("button", { name: "Davom etish" }).click();
    await page.locator("#hud").waitFor({ state: "visible" });
    if (fixture.complete)
      await page.waitForFunction(() =>
        document
          .querySelector("#objective-text")
          .textContent.includes("Maskan topildi"),
      );
    await page.waitForTimeout(800);
    await page.screenshot({ path: `.artifacts/v2-${fixture.label}.png` });
    if (fixture.label === "shrine") {
      await page.locator("#prompt").waitFor({ state: "visible" });
      await page.keyboard.press("KeyE");
      await page.getByText("Toshlar eslaydi.").waitFor();
      await page.getByRole("button", { name: "Yo‘lni davom ettirish" }).click();
    }
    await page.keyboard.press("Escape");
    const saved = await page.evaluate(() =>
      JSON.parse(localStorage.getItem("the-last-epoch.save")),
    );
    assert.equal(saved.version, 1);
    assert.ok(saved.playSeconds >= 186);
    assert.equal(
      saved.objectiveComplete,
      fixture.complete || fixture.label === "shrine",
    );
    assert.ok(
      Math.hypot(saved.position.x - fixture.x, saved.position.z - fixture.z) <
        8,
      "legacy position retained or safely nudged nearby",
    );
    await context.close();
  }
  assert.deepEqual(errors, []);
  console.log(
    "PASS V1 save fixtures in V2: hills, shrine completion, Low village, unchanged schema/progress",
  );
} finally {
  await browser.close();
}
