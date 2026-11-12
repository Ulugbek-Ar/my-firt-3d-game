import * as THREE from "three";

// Build static instancing groups once. Hundreds of decorative pieces become a few draws.
export class EnvironmentBatch {
  constructor(scene) {
    this.scene = scene;
    this.groups = new Map();
    this.geometry = {
      box: new THREE.BoxGeometry(1, 1, 1),
      cone: new THREE.ConeGeometry(1, 1, 6),
      cylinder: new THREE.CylinderGeometry(1, 1, 1, 6),
      rock: new THREE.IcosahedronGeometry(1, 0),
    };
    const tuft = new THREE.BufferGeometry();
    tuft.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(
        [
          -0.5, 0, 0, 0, 1, 0, 0.5, 0, 0, 0, 0, -0.4, 0.1, 0.8, 0, 0, 0, 0.4,
          -0.3, 0, -0.3, -0.1, 0.65, 0.1, 0.3, 0, 0.3,
        ],
        3,
      ),
    );
    tuft.computeVertexNormals();
    this.geometry.tuft = tuft;
    this.material = new THREE.MeshLambertMaterial({
      color: 0xffffff,
      flatShading: true,
    });
  }
  add(type, color, x, y, z, sx, sy, sz, rx = 0, ry = 0, rz = 0) {
    if (!this.groups.has(type)) this.groups.set(type, []);
    this.groups.get(type).push({ color, x, y, z, sx, sy, sz, rx, ry, rz });
  }
  finish() {
    const meshes = [],
      dummy = new THREE.Object3D(),
      color = new THREE.Color();
    for (const [type, pieces] of this.groups) {
      const mesh = new THREE.InstancedMesh(
        this.geometry[type],
        this.material,
        pieces.length,
      );
      pieces.forEach((p, i) => {
        dummy.position.set(p.x, p.y, p.z);
        dummy.scale.set(p.sx, p.sy, p.sz);
        dummy.rotation.set(p.rx, p.ry, p.rz);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
        mesh.setColorAt(i, color.set(p.color));
      });
      mesh.computeBoundingSphere();
      this.scene.add(mesh);
      meshes.push(mesh);
    }
    return meshes;
  }
}
export function seedRandom(seed) {
  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}
