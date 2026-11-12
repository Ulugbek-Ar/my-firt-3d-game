import * as THREE from "three";

const SIZE = 128,
  STEPS = 48,
  CELL = SIZE / STEPS;
const smooth = (a, b, x) => {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
function elevation(x, z) {
  const rim = smooth(12, 35, Math.abs(x));
  const ridge =
    3.8 + 2.1 * Math.sin(z * 0.075 + 0.5) + 1.2 * Math.sin(x * 0.14 + z * 0.08);
  const village = 0.35 + 0.3 * Math.sin(z * 0.065) + 0.22 * Math.sin(x * 0.12);
  return (
    village + rim * ridge + smooth(24, 49, -z) * (3 + Math.sin(x * 0.11) * 2)
  );
}
// Match PlaneGeometry's triangulation exactly: physics and decorative meshes share this surface.
export function groundHeight(x, z) {
  const gx = Math.max(0, Math.min(STEPS - 0.00001, (x + SIZE / 2) / CELL));
  const gz = Math.max(0, Math.min(STEPS - 0.00001, (z + SIZE / 2) / CELL));
  const ix = Math.floor(gx),
    iz = Math.floor(gz),
    u = gx - ix,
    v = gz - iz;
  const x0 = ix * CELL - SIZE / 2,
    z0 = iz * CELL - SIZE / 2;
  const a = elevation(x0, z0),
    b = elevation(x0 + CELL, z0),
    c = elevation(x0, z0 + CELL),
    d = elevation(x0 + CELL, z0 + CELL);
  return u + v <= 1
    ? a + (b - a) * u + (c - a) * v
    : d + (c - d) * (1 - u) + (b - d) * (1 - v);
}
export function pathCenter(z) {
  return 0.65 * Math.sin(z * 0.13);
}
export function createTerrain(scene) {
  const geometry = new THREE.PlaneGeometry(SIZE, SIZE, STEPS, STEPS);
  geometry.rotateX(-Math.PI / 2);
  const positions = geometry.attributes.position;
  for (let i = 0; i < positions.count; i++)
    positions.setY(i, elevation(positions.getX(i), positions.getZ(i)));
  const flat = geometry.toNonIndexed();
  geometry.dispose();
  const p = flat.attributes.position,
    colors = new Float32Array(p.count * 3);
  const color = new THREE.Color();
  for (let i = 0; i < p.count; i += 3) {
    const x = (p.getX(i) + p.getX(i + 1) + p.getX(i + 2)) / 3;
    const z = (p.getZ(i) + p.getZ(i + 1) + p.getZ(i + 2)) / 3;
    const tint =
      Math.sin(x * 0.23 + z * 0.18) * 0.025 + Math.cos(z * 0.31) * 0.018;
    color.setHSL(
      0.255 + tint * 0.5,
      0.18,
      0.16 + tint + Math.min(0.035, elevation(x, z) * 0.004),
    );
    for (let n = 0; n < 3; n++) color.toArray(colors, (i + n) * 3);
  }
  flat.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  flat.computeVertexNormals();
  const material = new THREE.MeshLambertMaterial({
    vertexColors: true,
    flatShading: true,
  });
  const terrain = new THREE.Mesh(flat, material);
  scene.add(terrain);
  const pathMaterial = new THREE.MeshLambertMaterial({
    color: 0x655d49,
    flatShading: true,
  });
  function ribbon(start, end, width, point) {
    const vertices = [];
    for (let s = start; s < end; s++) {
      const [ax, az] = point(s),
        [bx, bz] = point(s + 1);
      const dx = bx - ax,
        dz = bz - az,
        len = Math.hypot(dx, dz);
      const w1 = width * (1 + 0.09 * Math.sin(s * 1.3)),
        w2 = width * (1 + 0.09 * Math.sin((s + 1) * 1.3));
      const corners = [
        [ax - (dz / len) * w1, az + (dx / len) * w1],
        [ax + (dz / len) * w1, az - (dx / len) * w1],
        [bx - (dz / len) * w2, bz + (dx / len) * w2],
        [bx + (dz / len) * w2, bz - (dx / len) * w2],
      ];
      for (const j of [0, 2, 1, 1, 2, 3]) {
        const [x, z] = corners[j];
        vertices.push(x, groundHeight(x, z) + 0.045, z);
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
    g.computeVertexNormals();
    scene.add(new THREE.Mesh(g, pathMaterial));
  }
  ribbon(-19, 53, 1.65, (z) => [pathCenter(z), z]);
  ribbon(-13, 14, 1.1, (x) => [x, -1 + Math.sin(x * 0.2) * 0.35]);
  return terrain;
}
