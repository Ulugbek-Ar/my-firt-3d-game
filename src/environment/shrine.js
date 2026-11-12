import * as THREE from "three";
import { groundHeight } from "./terrain.js";
export function createShrine(scene, batch, addSolid, shrine) {
  const x = shrine.x,
    z = shrine.z,
    y = groundHeight(x, z);
  const stone = 0x707e77,
    dark = 0x485f5c;
  // The circular clearing remains traversable; only upright stones collide.
  batch.add("cylinder", dark, x, y - 0.03, z, 3.75, 0.12, 3.75);
  batch.add("cylinder", stone, x, y + 0.015, z, 3.2, 0.08, 3.2);
  for (let i = 0; i < 16; i++) {
    const a = (i * Math.PI) / 8;
    batch.add(
      "box",
      i % 2 ? dark : stone,
      x + Math.sin(a) * 3.4,
      y + 0.08,
      z + Math.cos(a) * 3.4,
      0.63,
      0.18,
      0.35,
      0,
      a,
    );
  }
  const centerZ = z - 1.2;
  batch.add("box", dark, x, y + 0.22, centerZ, 2, 0.5, 1.65);
  batch.add("box", stone, x, y + 1.85, centerZ, 1.35, 3.25, 1.08, 0, 0, -0.035);
  batch.add("rock", stone, x, y + 3.5, centerZ, 0.78, 0.65, 0.61, 0, 0.2);
  addSolid(x, y + 1.7, centerZ, 1.5, 3.7, 1.2);
  for (const side of [-1, 1]) {
    const px = x + side * 2.8;
    addSolid(px, y + 1.9, centerZ, 0.8, 3.8, 0.9);
    batch.add("box", dark, px, y + 0.16, centerZ, 1.2, 0.32, 1.25);
    for (let j = 0; j < 6; j++)
      batch.add(
        "box",
        j % 2 ? stone : dark,
        px,
        y + 0.55 + j * 0.53,
        centerZ,
        0.75,
        0.5,
        0.85,
        0,
        j % 2 ? 0.04 : -0.04,
      );
    batch.add("box", stone, px, y + 3.8, centerZ, 1.1, 0.28, 1.1);
  }
  batch.add("box", dark, x, y + 4.1, centerZ, 6.6, 0.5, 1.1);
  for (const side of [-1, 1])
    batch.add("rock", stone, x + side * 2, y + 4.48, centerZ, 1.4, 0.35, 0.64);
  const runeMaterial = new THREE.MeshBasicMaterial({ color: 0x87ebce });
  const runeTransforms = [];
  function rune(px, py, pz, length = 0.6) {
    for (const [sx, sy, angle] of [
      [0.065, length, 0],
      [length * 0.7, 0.045, 0.62],
      [length * 0.7, 0.045, -0.62],
    ]) {
      runeTransforms.push({ px, py, pz, sx, sy, angle });
    }
  }
  rune(x, y + 2.1, centerZ + 0.57, 1.35);
  for (const side of [-1, 1])
    for (let j = 0; j < 3; j++)
      rune(x + side * 2.8, y + 1 + j * 0.8, centerZ + 0.44, 0.34);
  const runes = new THREE.InstancedMesh(
    new THREE.BoxGeometry(1, 1, 1),
    runeMaterial,
    runeTransforms.length,
  );
  const dummy = new THREE.Object3D();
  runeTransforms.forEach((r, i) => {
    dummy.position.set(r.px, r.py, r.pz);
    dummy.scale.set(r.sx, r.sy, 0.028);
    dummy.rotation.set(0, 0, r.angle);
    dummy.updateMatrix();
    runes.setMatrixAt(i, dummy.matrix);
  });
  runes.computeBoundingSphere();
  scene.add(runes);
  // Broken inscription fragments sit flush to the ground, without a large glowing disc.
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(2.46, 2.5, 48, 1, 0.2, Math.PI * 1.7),
    runeMaterial,
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.set(x, y + 0.075, z);
  scene.add(ring);
  const count = 24,
    positions = new Float32Array(count * 3);
  const particles = new THREE.BufferGeometry();
  particles.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const motes = new THREE.Points(
    particles,
    new THREE.PointsMaterial({
      color: 0xa4ffe1,
      size: 0.07,
      transparent: true,
      opacity: 0.7,
      depthWrite: false,
    }),
  );
  scene.add(motes);
  // Ruined apse, deliberately asymmetrical with gaps between broken buttresses.
  for (let i = 0; i < 7; i++) {
    const px = -7 + i * 2.4,
      pz = -23 + Math.sin(i) * 0.5,
      py = groundHeight(px, pz),
      h = i % 2 ? 1.4 : 2.8;
    addSolid(px, py + h / 2, pz, 1.4, h, 1.1);
    for (let j = 0; j < Math.ceil(h / 0.48); j++)
      batch.add(
        "box",
        j % 2 ? stone : dark,
        px + (j % 2) * 0.07,
        py + j * 0.45 + 0.2,
        pz,
        1.4,
        0.43,
        1.1,
      );
  }
  const baseColor = new THREE.Color(0x87ebce);
  return {
    motes,
    update(time) {
      runeMaterial.color
        .copy(baseColor)
        .multiplyScalar(0.8 + Math.sin(time * 1.25) * 0.15);
      for (let i = 0; i < count; i++) {
        const angle = i * 2.399 + time * 0.12,
          r = 1.1 + (i % 7) * 0.26;
        positions[i * 3] = x + Math.cos(angle) * r;
        positions[i * 3 + 1] = y + 0.2 + ((time * 0.12 + i * 0.157) % 2.9);
        positions[i * 3 + 2] = z + Math.sin(angle) * r;
      }
      particles.attributes.position.needsUpdate = true;
    },
  };
}
