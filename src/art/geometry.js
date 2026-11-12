import * as THREE from "three";

// A single asymmetric, serrated crown replaces V2's stacked regular cones.
export function pineGeometry() {
  const points = [],
    uvs = [],
    indices = [],
    sides = 6;
  const rings = [
    [0, 1],
    [0.12, 0.85],
    [0.31, 0.43],
    [0.32, 0.78],
    [0.57, 0.28],
    [0.58, 0.52],
    [0.82, 0.16],
    [1, 0.01],
  ];
  rings.forEach(([y, r], j) => {
    for (let i = 0; i <= sides; i++) {
      const a = (i / sides) * Math.PI * 2,
        uneven = 1 + 0.15 * Math.sin(i * 3.3 + j * 1.7);
      points.push(
        Math.cos(a) * r * uneven,
        y - 0.5 + Math.sin(i * 2.1 + j) * 0.025,
        Math.sin(a) * r * uneven,
      );
      uvs.push(i / sides, y);
      if (j && i < sides) {
        const n = j * (sides + 1) + i;
        indices.push(n, n + 1, n - sides - 1, n + 1, n - sides, n - sides - 1);
      }
    }
  });
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(points, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  g.setIndex(indices);
  g.computeVertexNormals();
  return g;
}
