import test from "node:test";
import assert from "node:assert/strict";
import * as THREE from "three";
import { readFileSync, statSync } from "node:fs";
import { SURFACES, texturedGeometry } from "../src/art/materials.js";
import { createWorld } from "../src/world.js";
import { SaveSystem } from "../src/save.js";

test("atlas tiles have safe UV gutters and small, power-of-two delivered textures", () => {
  assert.equal(new Set(SURFACES).size, 16);
  for (const [index, surface] of SURFACES.entries()) {
    const g = texturedGeometry(new THREE.BoxGeometry(), surface),
      uv = g.attributes.uv;
    for (let i = 0; i < uv.count; i++) {
      assert.ok(
        uv.getX(i) > (index % 4) / 4 && uv.getX(i) < ((index % 4) + 1) / 4,
      );
      assert.ok(
        uv.getY(i) > 1 - (Math.floor(index / 4) + 1) / 4 &&
          uv.getY(i) < 1 - Math.floor(index / 4) / 4,
      );
    }
  }
  for (const [name, size] of [
    ["asterfall-atlas", 1024],
    ["ground", 128],
    ["mud", 128],
  ]) {
    const path = new URL(`../public/textures/${name}.png`, import.meta.url),
      data = readFileSync(path);
    assert.equal(data.readUInt32BE(16), size);
    assert.equal(data.readUInt32BE(20), size);
    assert.ok(statSync(path).size < 500000);
  }
});
test("spatial batching culls distant detail without changing collision or material shaders", () => {
  const scene = new THREE.Scene(),
    world = createWorld(scene, "medium"),
    colliderCount = world.colliders.length;
  const meshes = scene.children.filter((o) => o.userData.center);
  assert.ok(meshes.length > 8, "multiple independently cullable chunks exist");
  const before = meshes.filter((o) => o.visible).length;
  world.update(1, new THREE.Vector3(0, 2, 19));
  assert.ok(meshes.filter((o) => o.visible).length < before);
  assert.equal(world.colliders.length, colliderCount);
  assert.ok(
    meshes.every((o) => o.frustumCulled && o.material.isMeshLambertMaterial),
  );
  world.setQuality("low");
  world.update(2, new THREE.Vector3(0, 2, 19));
  assert.ok(meshes.some((o) => o.visible));
});
test("render resolution is validated and independent of legacy game saves", () => {
  const map = new Map(),
    saves = new SaveSystem({
      getItem: (k) => map.get(k) ?? null,
      setItem: (k, v) => map.set(k, v),
    });
  assert.equal(saves.readResolution(), null);
  assert.equal(saves.writeResolution(0.8), true);
  assert.equal(saves.readResolution(), 0.8);
  assert.equal(saves.writeResolution(4), false);
  assert.equal(saves.load(), null);
  map.set("the-last-epoch.resolution", "garbage");
  assert.equal(saves.readResolution(), null);
});
