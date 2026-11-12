import { groundHeight } from "./terrain.js";

export function createLandmarks(batch, addSolid, addCamera) {
  // Fence gardens sit outside the preserved central road and home entrances.
  for (const [x, z, length] of [
    [-13, 13, 7],
    [13, 11, 6],
    [-14, -11, 5],
    [14, -14, 7],
  ]) {
    for (let i = 0; i < length; i++) {
      const px = x + (x < 0 ? -1 : 1) * i * 0.8,
        y = groundHeight(px, z);
      batch.add("box", 0x484638, px, y + 0.6, z, 0.14, 1.2, 0.14);
      for (const h of [0.35, 0.86])
        batch.add("box", 0x414136, px + 0.35, y + h, z, 0.9, 0.12, 0.12);
    }
    addSolid(
      x + (x < 0 ? -1 : 1) * length * 0.4,
      groundHeight(x, z) + 0.6,
      z,
      length * 0.8,
      1.2,
      0.18,
    );
  }
  // Left rear house: narrow bell turret, a landmark visible over its slate roof.
  const x = -10,
    z = -6,
    y = groundHeight(x, z);
  batch.add("box", 0x697064, x, y + 6.4, z, 0.92, 2.5, 0.92);
  for (const dx of [-0.5, 0.5])
    batch.add("box", 0x373b32, x + dx, y + 7.6, z, 0.12, 1.4, 1.15);
  batch.add("cone", 0x424e59, x, y + 8.5, z, 1.05, 1.35, 1.05, 0, Math.PI / 4);
  batch.add("cylinder", 0xb4995d, x, y + 7.5, z, 0.27, 0.38, 0.27);
  addCamera(x, y + 7, z, 1.8, 3.4, 1.8);
  // Near right house: a guild sign and stacked split firewood tell of a working settlement.
  batch.add("box", 0x484638, 6.3, groundHeight(6.3, 7) + 3, 7, 0.14, 2.8, 0.14);
  batch.add(
    "box",
    0x414136,
    6.8,
    groundHeight(6.3, 7) + 4.2,
    7,
    1.2,
    0.12,
    0.14,
  );
  batch.add(
    "box",
    0x67523a,
    7.2,
    groundHeight(6.3, 7) + 3.65,
    7,
    0.75,
    0.7,
    0.12,
    0,
    0,
    0.05,
  );
  for (let i = 0; i < 6; i++)
    batch.add(
      "cylinder",
      0x484638,
      12.7 + (i % 3) * 0.35,
      groundHeight(13, 7) + 0.25 + Math.floor(i / 3) * 0.3,
      7,
      0.16,
      1.3,
      0.16,
      Math.PI / 2,
    );
  // Epoch relics: a toppled carved stele and votive stones beside, not across, the shrine route.
  const sy = groundHeight(-5, -17);
  batch.add(
    "box",
    0x707e77,
    -5,
    sy + 0.4,
    -17,
    1.4,
    0.7,
    2.4,
    0.08,
    0.3,
    0.12,
    "runes",
  );
  for (const [px, pz] of [
    [-4.5, -15.5],
    [4.7, -18],
    [5.7, -16.5],
  ]) {
    const py = groundHeight(px, pz);
    batch.add("rock", 0x707e77, px, py + 0.35, pz, 0.5, 0.65, 0.4, 0, 0.4);
    addSolid(px, py + 0.3, pz, 0.7, 0.7, 0.6);
  }
}
