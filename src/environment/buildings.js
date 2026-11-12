import { groundHeight } from "./terrain.js";

export const HOMES = Object.freeze([
  { x: -9, z: 7, w: 6, d: 6, h: 3.5, roof: 0x424e59 },
  { x: 9, z: 4, w: 6, d: 7, h: 3.8, roof: 0x3b4954 },
  { x: -10, z: -6, w: 7, d: 6, h: 3.4, roof: 0x4e5055 },
  { x: 10, z: -9, w: 6, d: 6, h: 4.1, roof: 0x3b5054 },
]);
export function createBuildings(batch, addSolid, lanterns, addCameraObstacle) {
  for (const { x, z, w, d, h, roof } of HOMES) {
    const y = groundHeight(x, z),
      eave = y + h + 0.5;
    const box = (color, dx, dy, dz, a, b, c, rx = 0, ry = 0, rz = 0) =>
      batch.add("box", color, x + dx, y + dy, z + dz, a, b, c, rx, ry, rz);
    // Keep V1 building footprints: legacy saves remain valid around the village.
    addSolid(x, y + h / 2 + 0.2, z, w + 0.3, h + 0.4, d + 0.3);
    addCameraObstacle(x, y + h + 1.7, z, w + 1.1, 2.8, d + 1.1);
    box(0x51574e, 0, 0.23, 0, w + 0.3, 0.7, d + 0.3);
    box(0x9a9275, 0, h / 2 + 0.5, 0, w, h, d);
    // Individual foundation blocks, timber corner posts and horizontal floors.
    for (const side of [-1, 1]) {
      for (let i = 0; i < w; i++)
        box(
          i % 2 ? 0x697064 : 0x5d665d,
          -w / 2 + i + 0.5,
          0.25,
          side * (d / 2 + 0.08),
          0.94,
          0.48,
          0.18,
        );
      for (const dx of [-w / 2 + 0.12, 0, w / 2 - 0.12])
        box(
          0x373b32,
          dx,
          h / 2 + 0.5,
          side * (d / 2 + 0.04),
          0.21,
          h + 0.15,
          0.19,
        );
      for (const dy of [0.65, 2.5, h + 0.45])
        box(0x414136, 0, dy, side * (d / 2 + 0.08), w + 0.1, 0.18, 0.19);
      for (const dx of [-w / 2, w / 2])
        box(0x383c32, dx, h / 2 + 0.5, 0, 0.22, h + 0.1, d + 0.2);
      // Leaning braces under the eaves.
      for (const dx of [-w / 2 + 0.6, w / 2 - 0.6])
        box(
          0x4d4838,
          dx,
          h - 0.03,
          side * (d / 2 + 0.12),
          0.13,
          1.25,
          0.16,
          0,
          0,
          dx < 0 ? -0.65 : 0.65,
        );
    }
    // Closed plank door with lintel, hinges, ring, and three stone steps.
    const front = d / 2 + 0.14;
    box(0x272b26, 0, 1.54, front, 1.48, 2.25, 0.16);
    for (let j = 0; j < 5; j++)
      box(
        j % 2 ? 0x5b4b36 : 0x67523a,
        -0.55 + j * 0.275,
        1.5,
        front + 0.11,
        0.25,
        2.05,
        0.1,
      );
    for (const dx of [-0.83, 0.83])
      box(0x625c48, dx, 1.55, front + 0.06, 0.19, 2.45, 0.32);
    box(0x625c48, 0, 2.75, front + 0.07, 1.85, 0.2, 0.34);
    for (const dy of [0.95, 1.95])
      box(0x242f2d, 0, dy, front + 0.18, 1.34, 0.1, 0.045);
    box(0xb4995d, 0.43, 1.4, front + 0.2, 0.12, 0.16, 0.05);
    for (let i = 0; i < 3; i++)
      box(
        0x666a5b,
        0,
        0.05 + i * 0.13,
        front + 0.6 - i * 0.16,
        2 - i * 0.14,
        0.16,
        0.85 - i * 0.16,
      );
    // Warm windows with inset surrounds, crossbars, sill and shutters, front and back.
    for (const side of [-1, 1])
      for (const dx of [-w * 0.31, w * 0.31]) {
        const f = side * (d / 2 + 0.12);
        box(0x282f2b, dx, 2.02, f, 1.06, 1.3, 0.12);
        box(0xbe9054, dx, 2.02, f + side * 0.06, 0.78, 1.04, 0.06);
        box(0x3c3c30, dx, 2.02, f + side * 0.12, 0.075, 1.15, 0.08);
        box(0x3c3c30, dx, 2.02, f + side * 0.12, 0.88, 0.075, 0.08);
        box(0x6f674e, dx, 1.38, f + side * 0.12, 1.2, 0.14, 0.4);
        for (const s of [-1, 1])
          box(
            0x4c4c3a,
            dx + s * 0.66,
            2.02,
            f + side * 0.08,
            0.26,
            1.2,
            0.12,
            0,
            s * 0.25,
          );
      }
    // A true gabled roof made of two pitched planes with staggered slate courses.
    const angle = Math.atan2(2.35, w / 2 + 0.5),
      slope = Math.hypot(w / 2 + 0.5, 2.35);
    for (const side of [-1, 1]) {
      box(
        roof,
        side * (w / 4 + 0.25),
        h + 1.67,
        0,
        slope,
        0.2,
        d + 1,
        0,
        0,
        -side * angle,
      );
      for (let row = 0; row < 6; row++) {
        const t = (row + 0.5) / 6;
        for (let tile = 0; tile < Math.ceil(d + 1); tile++) {
          const dx = side * (w / 2 + 0.5) * t;
          box(
            row % 2 ? roof : roof + 0x050504,
            dx,
            h + 2.86 - t * 2.35,
            -(d + 0.6) / 2 + tile + (row % 2) * 0.2,
            slope / 5.7,
            0.07,
            0.92,
            0,
            0,
            -side * angle,
          );
        }
      }
      for (const end of [-1, 1]) {
        box(
          0x343c37,
          side * (w / 4 + 0.25),
          h + 1.67,
          end * (d / 2 + 0.53),
          slope + 0.15,
          0.19,
          0.17,
          0,
          0,
          -side * angle,
        );
        // Gable planks under each roof half, with decreasing lengths.
        for (let j = 0; j < 6; j++) {
          const t = (j + 0.5) / 6,
            ph = 2.35 * (1 - t);
          box(
            0x686a55,
            side * t * (w / 2),
            h + 0.5 + ph / 2,
            end * (d / 2 + 0.03),
            w / 12 - 0.025,
            ph,
            0.12,
          );
        }
      }
    }
    box(0x68716a, 0, h + 2.92, 0, 0.2, 0.22, d + 1.2);
    box(0x666b60, w * 0.28, h + 2.1, -0.6, 0.68, 2.2, 0.72);
    box(0x424d48, w * 0.28, h + 3.22, -0.6, 0.86, 0.19, 0.9);
    lanterns.push([x + 1.05, y + 2.35, z + front + 0.45]);
    // Distinctive dormers, projecting upper rooms and workshop lean-to silhouettes.
    if (x > 0 && z > 0) {
      box(0x9a9275, -1.2, h + 1.25, d / 2 - 0.6, 1.5, 1.35, 1.4);
      box(0x424e59, -1.2, h + 2.02, d / 2 - 0.6, 1.9, 0.16, 1.9, 0.15);
      box(0x272b26, -1.2, h + 1.35, d / 2 + 0.12, 0.8, 0.8, 0.12);
      box(0xbe9054, -1.2, h + 1.35, d / 2 + 0.2, 0.6, 0.58, 0.06);
    }
    if (x < 0 && z > 0) {
      box(0x9a9275, -1.6, 2.9, d / 2 + 0.25, 1.9, 1.1, 0.65);
      box(0x414136, -1.6, 2.4, d / 2 + 0.62, 2.15, 0.12, 0.16);
      box(0x272b26, -1.6, 3, d / 2 + 0.62, 0.95, 0.65, 0.1);
    }
    if (x > 0 && z < 0) {
      box(roof, 0, h + 1, -d / 2, w + 1.2, 0.18, 2.5, -0.28);
      for (const dx of [-w / 2, w / 2])
        box(0x373b32, dx, h / 2, -d / 2 + 0.2, 0.18, h, 0.18);
    }
    // Door awning and a barrel beside it.
    box(roof, 0, 2.95, front + 0.42, 2.1, 0.15, 1, 0.16);
    batch.add(
      "cylinder",
      0x66523b,
      x - 2.6,
      y + 0.47,
      z + front + 0.6,
      0.42,
      0.9,
      0.42,
    );
    for (const dy of [0.2, 0.75])
      batch.add(
        "cylinder",
        0x323d37,
        x - 2.6,
        y + dy,
        z + front + 0.6,
        0.44,
        0.07,
        0.44,
      );
  }
}
