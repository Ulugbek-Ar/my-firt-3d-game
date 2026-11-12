import * as THREE from "three";
export const SHRINE = Object.freeze({ x: 0, z: -16 });
export function createWorld(scene) {
  const colliders = [];
  const cameraObstacles = [];
  const stone = new THREE.MeshLambertMaterial({
    color: 0x56625b,
    flatShading: true,
  });
  const wall = new THREE.MeshLambertMaterial({
    color: 0x7b7961,
    flatShading: true,
  });
  const wood = new THREE.MeshLambertMaterial({ color: 0x393d32 });
  const roof = new THREE.MeshLambertMaterial({
    color: 0x344b49,
    flatShading: true,
  });
  const leaf = new THREE.MeshLambertMaterial({
    color: 0x29433b,
    flatShading: true,
  });
  const runeMat = new THREE.MeshBasicMaterial({ color: 0x9ae6ce });
  const geometries = {
    box: new THREE.BoxGeometry(1, 1, 1),
    cone: new THREE.ConeGeometry(1, 1, 5),
    rock: new THREE.IcosahedronGeometry(1, 0),
    cylinder: new THREE.CylinderGeometry(1, 1, 1, 8),
  };
  function mesh(type, mat, x, y, z, sx, sy, sz, solid = false) {
    const m = new THREE.Mesh(geometries[type], mat);
    m.position.set(x, y, z);
    m.scale.set(sx, sy, sz);
    scene.add(m);
    if (solid) {
      colliders.push({
        minX: x - sx / 2,
        maxX: x + sx / 2,
        minZ: z - sz / 2,
        maxZ: z + sz / 2,
      });
      cameraObstacles.push(m);
    }
    return m;
  }
  scene.add(new THREE.HemisphereLight(0xa9d5cd, 0x373a28, 2.2));
  const moonlight = new THREE.DirectionalLight(0xd4dbbd, 1.7);
  moonlight.position.set(-15, 24, 8);
  scene.add(moonlight);
  mesh(
    "box",
    new THREE.MeshLambertMaterial({ color: 0x3b4b3e }),
    0,
    -0.3,
    0,
    110,
    0.6,
    110,
  );
  const pathMat = new THREE.MeshLambertMaterial({ color: 0x666752 });
  mesh("box", pathMat, 0, 0.008, 5, 4.5, 0.02, 47);
  mesh("box", pathMat, 0, 0.009, -1, 27, 0.025, 3.5);
  // Four homes leave the central street and shrine approach unobstructed.
  for (const [x, z, w, d] of [
    [-9, 7, 6, 6],
    [9, 4, 6, 7],
    [-10, -6, 7, 6],
    [10, -9, 6, 6],
  ]) {
    mesh("box", stone, x, 0.3, z, w + 0.3, 0.6, d + 0.3, true);
    mesh("box", wall, x, 2, z, w, 3.5, d, true);
    const r = new THREE.Mesh(new THREE.CylinderGeometry(0, 1, 1, 4), roof);
    r.position.set(x, 4.5, z);
    r.rotation.y = Math.PI / 4;
    r.scale.set(w * 0.82, 2.7, d * 0.82);
    scene.add(r);
    cameraObstacles.push(r);
    for (const dx of [-w / 2 + 0.18, w / 2 - 0.18, 0])
      mesh("box", wood, x + dx, 2, z + d / 2 + 0.02, 0.18, 3.6, 0.15);
    mesh("box", wood, x, 1.15, z + d / 2 + 0.1, 1.2, 2.3, 0.18);
    mesh(
      "box",
      new THREE.MeshBasicMaterial({ color: 0xc1a66c }),
      x - 1.8,
      2.25,
      z + d / 2 + 0.08,
      0.65,
      0.85,
      0.08,
    );
    mesh("box", stone, x + 1.5, 4.6, z, 0.7, 2.6, 0.7);
  }
  let seed = 410;
  function random() {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  }
  const trunks = [],
    crowns = [],
    rocks = [];
  for (let i = 0; i < 92; i++) {
    const x = (random() - 0.5) * 100,
      z = (random() - 0.5) * 100;
    if (Math.abs(x) < 18 && z > -24 && z < 27) continue;
    const h = 4 + random() * 5;
    trunks.push([x, h * 0.25, z, 0.35, h * 0.5, 0.35]);
    crowns.push([x, h * 0.7, z, 2, h * 0.9, 2]);
    crowns.push([x, h, z, 1.4, h * 0.65, 1.4]);
    colliders.push({
      minX: x - 0.3,
      maxX: x + 0.3,
      minZ: z - 0.3,
      maxZ: z + 0.3,
    });
  }
  for (let i = 0; i < 35; i++) {
    const x = (random() - 0.5) * 85,
      z = (random() - 0.5) * 85;
    if (Math.abs(x) < 18 && z > -24 && z < 27) continue;
    const s = 0.5 + random() * 1.2;
    rocks.push([x, s * 0.3, z, s, s * 0.65, s]);
    colliders.push({
      minX: x - s * 0.7,
      maxX: x + s * 0.7,
      minZ: z - s * 0.7,
      maxZ: z + s * 0.7,
    });
  }
  function instances(type, material, transforms) {
    const m = new THREE.InstancedMesh(
      geometries[type],
      material,
      transforms.length,
    );
    const dummy = new THREE.Object3D();
    transforms.forEach(([x, y, z, sx, sy, sz], i) => {
      dummy.position.set(x, y, z);
      dummy.scale.set(sx, sy, sz);
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    });
    scene.add(m);
    cameraObstacles.push(m);
  }
  instances("cylinder", wood, trunks);
  instances("cone", leaf, crowns);
  instances("rock", stone, rocks);
  for (let i = 0; i < 6; i++) {
    const x = -6 + i * 2.4;
    const h = i % 2 ? 1.8 : 2.7;
    mesh("box", stone, x, h / 2, -22, 1.4, h, 1.1, true);
  }
  // A circular shrine with an open approach; the standing stone is solid.
  mesh("cylinder", stone, 0, 0.08, -16, 3.5, 0.16, 3.5);
  mesh("box", stone, 0, 1.6, -17.2, 1.5, 3.2, 1.2, true);
  mesh("box", stone, -2.8, 1.8, -17.2, 0.6, 3.6, 0.7, true);
  mesh("box", stone, 2.8, 1.8, -17.2, 0.6, 3.6, 0.7, true);
  mesh("box", stone, 0, 3.7, -17.2, 6.2, 0.6, 0.9);
  const rune = mesh("box", runeMat, 0, 1.9, -16.58, 0.12, 1.5, 0.025);
  mesh("box", runeMat, 0, 1.9, -16.55, 0.7, 0.1, 0.025).rotation.z = 0.7;
  mesh("box", runeMat, 0, 1.9, -16.54, 0.7, 0.1, 0.025).rotation.z = -0.7;
  const ring = new THREE.Mesh(new THREE.RingGeometry(2.2, 2.25, 32), runeMat);
  ring.rotation.x = -Math.PI / 2;
  ring.position.set(0, 0.175, -16);
  scene.add(ring);
  const moon = new THREE.Mesh(
    new THREE.SphereGeometry(2.5, 12, 8),
    new THREE.MeshBasicMaterial({ color: 0xb4c7ae, fog: false }),
  );
  moon.position.set(-31, 37, -65);
  scene.add(moon);
  return {
    colliders,
    cameraObstacles,
    shrine: SHRINE,
    update(time) {
      runeMat.color.setScalar(0.65 + Math.sin(time * 1.4) * 0.15);
      runeMat.color.multiply(new THREE.Color(0x9ae6ce));
      rune.rotation.y = Math.sin(time) * 0.06;
    },
  };
}
