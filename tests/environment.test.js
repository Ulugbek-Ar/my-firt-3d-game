import test from "node:test";
import assert from "node:assert/strict";
import * as THREE from "three";
import { createTerrain, groundHeight } from "../src/environment/terrain.js";
import { createWorld } from "../src/world.js";
import { Player } from "../src/player.js";
import { FollowCamera } from "../src/camera.js";
import { createState, SPAWN } from "../src/state.js";
import { canOccupy, resolveSavedPosition } from "../src/collision.js";
import { SaveSystem, SAVE_KEY } from "../src/save.js";
import { ShrineInteraction } from "../src/interactions.js";

test("terrain collision samples match rendered triangles on hills and village", () => {
  const terrain = createTerrain(new THREE.Scene());
  terrain.updateMatrixWorld();
  const ray = new THREE.Raycaster();
  for (let x = -43; x < 44; x += 6.3)
    for (let z = -43; z < 44; z += 7.7) {
      ray.set(new THREE.Vector3(x, 40, z), new THREE.Vector3(0, -1, 0));
      const hit = ray.intersectObject(terrain)[0];
      assert.ok(hit, `ground exists at ${x},${z}`);
      assert.ok(Math.abs(hit.point.y - groundHeight(x, z)) < 0.0001);
    }
  assert.ok(groundHeight(35, 0) - groundHeight(0, 0) > 3, "real hills exist");
});
test("legacy V1 saves retain progress and horizontal position while grounding onto hills", () => {
  const legacy = {
    version: 1,
    position: { x: 34, y: 0, z: 8 },
    graphics: "medium",
    objectiveComplete: true,
    playSeconds: 186,
  };
  const data = new Map([[SAVE_KEY, JSON.stringify(legacy)]]);
  const saves = new SaveSystem({
    getItem: (key) => data.get(key),
    setItem: (key, value) => data.set(key, value),
  });
  const loaded = saves.load();
  assert.deepEqual(loaded, legacy);
  const player = new Player(new THREE.Scene(), [], groundHeight);
  player.reset(loaded.position);
  assert.equal(player.position.x, legacy.position.x);
  assert.equal(player.position.z, legacy.position.z);
  assert.equal(player.position.y, groundHeight(34, 8));
  const state = Object.assign(createState(), loaded);
  assert.equal(saves.write(player, state), true);
  assert.equal(saves.load().objectiveComplete, true);
  assert.equal(saves.load().playSeconds, 186);
  assert.equal(saves.load().version, 1);
});
test("walking, jumping and landing conform to rising and falling ground", () => {
  const player = new Player(new THREE.Scene(), [], groundHeight),
    state = createState();
  player.reset({ x: 14, y: 0, z: 10 });
  const input = { down: (key) => key === "KeyD", jump: false };
  for (let i = 0; i < 360; i++) player.update(1 / 60, input, 0, state);
  assert.ok(player.position.x > 30);
  assert.equal(
    player.position.y,
    groundHeight(player.position.x, player.position.z),
  );
  input.down = () => false;
  input.jump = true;
  player.update(1 / 60, input, 0, state);
  assert.ok(player.position.y > player.groundHeight);
  for (let i = 0; i < 150; i++) player.update(1 / 60, input, 0, state);
  assert.equal(player.position.y, player.groundHeight);
  input.down = (key) => key === "KeyA";
  for (let i = 0; i < 360; i++) player.update(1 / 60, input, 0, state);
  assert.equal(
    player.position.y,
    groundHeight(player.position.x, player.position.z),
  );
});
test("shrine range uses height above terrain, and camera remains above hills", () => {
  const state = createState(),
    shrine = new ShrineInteraction({ x: 0, z: -16 });
  shrine.update({ position: { x: 0, y: 3, z: -14 }, groundHeight: 3 }, state);
  assert.equal(shrine.available, true);
  shrine.update({ position: { x: 0, y: 4.2, z: -14 }, groundHeight: 3 }, state);
  assert.equal(shrine.available, false);
  const camera = new THREE.PerspectiveCamera(),
    follow = new FollowCamera(camera, [], groundHeight);
  for (let yaw = 0; yaw < Math.PI * 2; yaw += 0.25) {
    follow.yaw = yaw;
    follow.pitch = -0.05;
    follow.update(
      1 / 60,
      { position: new THREE.Vector3(24, groundHeight(24, 0), 0) },
      { lookX: 0, lookY: 0 },
      true,
    );
    assert.ok(
      camera.position.y >=
        groundHeight(camera.position.x, camera.position.z) + 0.39,
    );
  }
});
test("authored village keeps the original shrine route clear and optional details bounded", () => {
  const scene = new THREE.Scene(),
    world = createWorld(scene);
  for (let z = 19; z >= -13; z -= 0.25)
    assert.ok(canOccupy(0, z, world.colliders), `route is clear at ${z}`);
  assert.ok(canOccupy(SPAWN.x, SPAWN.z, world.colliders));
  const roofRay = new THREE.Raycaster(
    new THREE.Vector3(-9, 5.5, 13),
    new THREE.Vector3(0, 0, -1),
    0,
    10,
  );
  assert.ok(
    roofRay.intersectObjects(world.cameraObstacles).length > 0,
    "pitched roofs obstruct the camera above the walls",
  );
  const blocked = world.colliders[0],
    position = {
      x: (blocked.minX + blocked.maxX) / 2,
      y: 0,
      z: (blocked.minZ + blocked.maxZ) / 2,
    };
  const safe = resolveSavedPosition(position, world.colliders, SPAWN);
  assert.ok(canOccupy(safe.x, safe.z, world.colliders));
  assert.ok(Math.hypot(safe.x - position.x, safe.z - position.z) < 8);
  function budget(quality) {
    world.setQuality(quality);
    let calls = 0,
      triangles = 0;
    scene.traverse((o) => {
      if (o.isMesh && o.visible) {
        calls++;
        triangles +=
          ((o.geometry.index?.count ?? o.geometry.attributes.position.count) /
            3) *
          (o.count ?? 1);
      }
    });
    return { calls, triangles };
  }
  const low = budget("low");
  const visibleCylinders = scene.children
    .filter(
      (o) =>
        o.isInstancedMesh &&
        o.visible &&
        o.geometry.type === "CylinderGeometry",
    )
    .reduce((total, o) => total + o.count, 0);
  assert.ok(
    visibleCylinders >= world.stats.trees,
    "Low never hides colliding tree trunks",
  );
  const medium = budget("medium");
  console.log("Static environment upper bounds (before culling):", {
    low,
    medium,
    trees: world.stats.trees,
  });
  assert.ok(low.calls < 60 && low.triangles < 40000);
  assert.ok(medium.triangles > low.triangles && medium.triangles < 60000);
  assert.equal(
    scene.children.filter((o) => o.isLight).length,
    2,
    "lanterns add no dynamic lights",
  );
});
