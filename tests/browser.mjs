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
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
await page.goto(baseURL);
await page.getByRole("button", { name: "Yangi o‘yin" }).waitFor();
assert.equal(
  await page.getByRole("button", { name: "Davom etish" }).isDisabled(),
  true,
);
await page.screenshot({ path: ".artifacts/epoch-menu.png" });
await page.getByRole("button", { name: "Sozlamalar" }).click();
await page.locator("#quality").selectOption("medium");
await page.getByRole("button", { name: "Qaytish" }).click();
await page.getByRole("button", { name: "Mualliflar" }).click();
assert.ok(
  await page.getByText("Dasturlash: OpenAI Codex", { exact: false }).count(),
);
await page.getByRole("button", { name: "Qaytish" }).click();
await page.getByRole("button", { name: "Yangi o‘yin" }).click();
await page.getByRole("button", { name: "Xotiraga ergashish" }).click();
await page.waitForTimeout(500);
await page.screenshot({ path: ".artifacts/epoch-world.png" });
await page.keyboard.down("KeyW");
await page.waitForTimeout(10600);
await page.keyboard.up("KeyW");
await page.waitForTimeout(200);
await page.keyboard.press("Escape");
const moved = await page.evaluate(() =>
  JSON.parse(localStorage.getItem("the-last-epoch.save")),
);
console.log("movement save", moved);
assert.ok(moved.position.z < 10, "W must move toward village");
await page.getByRole("button", { name: "Qaytish" }).click();
// Reach shrine by ordinary WASD, allowing for software-renderer simulation timing.
let attempts = 0;
while (!(await page.locator("#prompt").isVisible()) && attempts++ < 30) {
  await page.keyboard.down("KeyW");
  await page.waitForTimeout(500);
  await page.keyboard.up("KeyW");
}
assert.equal(
  await page.locator("#prompt").isVisible(),
  true,
  "shrine in range",
);
await page.keyboard.press("KeyE");
await page.getByText("Toshlar eslaydi.").waitFor();
await page.screenshot({ path: ".artifacts/epoch-shrine.png" });
await page.getByRole("button", { name: "Yo‘lni davom ettirish" }).click();
await page.keyboard.press("Escape");
await page.getByRole("button", { name: "Saqlash", exact: true }).click();
const saved = await page.evaluate(() =>
  JSON.parse(localStorage.getItem("the-last-epoch.save")),
);
assert.equal(saved.objectiveComplete, true);
assert.equal(saved.graphics, "medium");
await page.reload();
await page.getByRole("button", { name: "Davom etish" }).click();
await page
  .locator("#hud")
  .waitFor({ state: "visible" })
  .catch(async (e) => {
    console.log("ERRORS", errors, await page.locator("#overlay").textContent());
    throw e;
  });
await page.waitForFunction(() =>
  document
    .querySelector("#objective-text")
    .textContent.includes("Maskan topildi"),
);
await page.keyboard.press("Space");
await page.waitForTimeout(120);
await page.screenshot({ path: ".artifacts/epoch-complete.png" });
await page.keyboard.press("Escape");
await page.getByRole("button", { name: "Bosh menyu" }).click();
await page.addInitScript(() =>
  localStorage.setItem("the-last-epoch.save", "corrupt"),
);
await page.reload();
assert.equal(
  await page.getByRole("button", { name: "Davom etish" }).isDisabled(),
  true,
);
assert.deepEqual(errors, []);
console.log(
  "PASS menus, graphics, movement, shrine, save/load, corrupt save, no runtime errors",
);
await browser.close();
