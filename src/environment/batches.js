import * as THREE from "three";
import { artMaterial, surfaceFor, texturedGeometry } from "../art/materials.js";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { pineGeometry } from "../art/geometry.js";

// Build static instancing groups once. Hundreds of decorative pieces become a few draws.
export class EnvironmentBatch {
  constructor(scene) {
    this.scene = scene;
    this.groups = new Map();
    this.geometry = {
      pine: pineGeometry(),
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
    this.material = artMaterial(0xffffff, { flatShading: true });
  }
  add(
    type,
    color,
    x,
    y,
    z,
    sx,
    sy,
    sz,
    rx = 0,
    ry = 0,
    rz = 0,
    surface = surfaceFor(type, color),
  ) {
    const chunk = `${Math.floor((x + 16) / 32)},${Math.floor((z + 16) / 32)}`;
    const key = `${type === "pine" || type === "tuft" ? type : "static"}:${chunk}`;
    if (!this.groups.has(key))
      this.groups.set(key, { type, surface, pieces: [] });
    this.groups
      .get(key)
      .pieces.push({ type, surface, color, x, y, z, sx, sy, sz, rx, ry, rz });
  }
  finish() {
    const meshes = [],
      dummy = new THREE.Object3D(),
      color = new THREE.Color();
    const geometryCache = new Map();
    const mergedMaterial = this.material.clone();
    mergedMaterial.vertexColors = true;
    for (const { type, pieces } of this.groups.values()) {
      const repeated = type === "pine" || type === "tuft";
      const transformed = [];
      let mesh;
      pieces.forEach((p, i) => {
        const key = `${p.type}:${p.surface}`;
        if (!geometryCache.has(key)) {
          const g = texturedGeometry(this.geometry[p.type], p.surface);
          if (!g.attributes.uv)
            g.setAttribute(
              "uv",
              new THREE.Float32BufferAttribute(
                new Float32Array(g.attributes.position.count * 2),
                2,
              ),
            );
          geometryCache.set(key, g.index ? g.toNonIndexed() : g);
        }
        dummy.position.set(p.x, p.y, p.z);
        dummy.scale.set(p.sx, p.sy, p.sz);
        dummy.rotation.set(p.rx, p.ry, p.rz);
        dummy.updateMatrix();
        color.set(p.color);
        if (repeated) {
          if (!mesh)
            mesh = new THREE.InstancedMesh(
              geometryCache.get(key),
              this.material,
              pieces.length,
            );
          mesh.setMatrixAt(i, dummy.matrix);
          mesh.setColorAt(i, color);
        } else {
          const g = geometryCache.get(key).clone();
          g.applyMatrix4(dummy.matrix);
          const values = new Float32Array(g.attributes.position.count * 3);
          for (let n = 0; n < g.attributes.position.count; n++)
            color.toArray(values, n * 3);
          g.setAttribute("color", new THREE.BufferAttribute(values, 3));
          transformed.push(g);
        }
      });
      if (!repeated) {
        const merged = mergeGeometries(transformed);
        transformed.forEach((g) => g.dispose());
        mesh = new THREE.Mesh(merged, mergedMaterial);
        mesh.geometry.computeBoundingSphere();
      } else mesh.computeBoundingSphere();
      mesh.userData.center = (
        mesh.boundingSphere || mesh.geometry.boundingSphere
      ).center.clone();
      mesh.userData.trunks = pieces.filter(
        (p) => p.type === "cylinder" && p.color === 0x484638 && p.sy > 2,
      ).length;
      mesh.frustumCulled = true;
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
