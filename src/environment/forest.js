import { groundHeight, pathCenter } from "./terrain.js";
import { seedRandom } from "./batches.js";
import { HOMES } from "./buildings.js";

export function createForest(batch, detailBatch, addSolid) {
  const random = seedRandom(92814);
  // Groves frame the settlement, with clear sightlines to the shrine and down the road.
  const groves = [
    [-23, 14],
    [24, 12],
    [-24, -11],
    [25, -16],
    [-14, -35],
    [10, -37],
    [-39, -28],
    [39, -30],
    [-35, 38],
    [35, 36],
  ];
  let trees = 0;
  groves.forEach(([cx, cz], grove) => {
    for (let i = 0; i < 25; i++) {
      const angle = random() * Math.PI * 2,
        radius = 3 + Math.sqrt(random()) * 11;
      const x = cx + Math.cos(angle) * radius,
        z = cz + Math.sin(angle) * radius;
      if (
        Math.abs(x - pathCenter(z)) < 4 ||
        Math.hypot(x, z + 16) < 8 ||
        HOMES.some(
          (h) =>
            Math.abs(x - h.x) < h.w / 2 + 2.5 &&
            Math.abs(z - h.z) < h.d / 2 + 2.5,
        )
      )
        continue;
      const y = groundHeight(x, z),
        h = 6 + random() * 6,
        r = 1.5 + random();
      const target = i < 18 ? batch : detailBatch;
      batch.add(
        "cylinder",
        0x484638,
        x,
        y + h * 0.35,
        z,
        0.22 + h * 0.012,
        h * 0.7,
        0.22 + h * 0.012,
      );
      for (let tier = 0; tier < 3; tier++)
        (tier === 0 ? batch : target).add(
          "cone",
          [0x304c46, 0x3b554a, 0x435e50][(grove + tier) % 3],
          x,
          y + h * (0.42 + tier * 0.23),
          z,
          r * (1 - tier * 0.22),
          h * 0.56,
          r * (1 - tier * 0.22),
          0,
          random(),
        );
      // Every colliding trunk and its base canopy remain visible on Low.
      addSolid(x, y + h * 0.25, z, 0.55, h * 0.5, 0.55);
      trees++;
    }
  });
  // Placed rock outcrops, rather than scattering obstacles across playable routes.
  for (const [cx, cz] of [
    [-18, 18],
    [19, 20],
    [-18, -18],
    [19, -23],
    [-5, -26],
    [27, 0],
  ]) {
    for (let i = 0; i < 7; i++) {
      const x = cx + (random() - 0.5) * 6,
        z = cz + (random() - 0.5) * 5,
        s = 0.6 + random() * 1.8;
      batch.add(
        "rock",
        i % 2 ? 0x626f69 : 0x71776a,
        x,
        groundHeight(x, z) + s * 0.25,
        z,
        s,
        s * 0.65,
        s * 0.8,
        0,
        random() * 4,
        0.15,
      );
      addSolid(x, groundHeight(x, z) + s * 0.3, z, s * 1.3, s, s * 1.2);
    }
  }
  // Ground cover uses clustered low-poly tufts, with no alpha-tested grass cards.
  for (let i = 0; i < 950; i++) {
    const x = (random() - 0.5) * 86,
      z = (random() - 0.5) * 95;
    if (
      Math.abs(x - pathCenter(z)) < 2.3 ||
      (Math.abs(z + 1) < 1.5 && Math.abs(x) < 15) ||
      Math.hypot(x, z + 16) < 4.8 ||
      HOMES.some(
        (h) =>
          Math.abs(x - h.x) < h.w / 2 + 0.6 &&
          Math.abs(z - h.z) < h.d / 2 + 0.6,
      )
    )
      continue;
    const target = i < 480 ? batch : detailBatch;
    const y = groundHeight(x, z),
      s = 0.15 + random() * 0.36;
    target.add(
      "tuft",
      i % 3 ? 0x656b44 : 0x818067,
      x,
      y + s * 0.4,
      z,
      s * 0.5,
      s,
      s * 0.4,
      0,
      random() * 3,
      0.15,
    );
    if (i % 4 === 0)
      target.add("rock", 0x344e3f, x + 0.2, y + 0.15, z, 0.65, 0.35, 0.48);
  }
  // Worn edging, gravel and broken flagstones follow the authored path.
  for (let z = -13; z < 28; z += 1.25)
    for (const side of [-1, 1]) {
      const x = pathCenter(z) + side * (1.55 + random() * 0.32);
      batch.add(
        "rock",
        0x7d806e,
        x,
        groundHeight(x, z) + 0.03,
        z,
        0.2 + random() * 0.22,
        0.08,
        0.3,
        0,
        random() * 3,
      );
    }
  for (let i = 0; i < 45; i++) {
    const z = -12 + random() * 36,
      x = pathCenter(z) + (random() - 0.5) * 2.3;
    batch.add(
      "rock",
      i % 2 ? 0x777866 : 0x5a6052,
      x,
      groundHeight(x, z) + 0.035,
      z,
      0.35,
      0.035,
      0.45,
      0,
      random() * 3,
    );
  }
  return trees;
}
