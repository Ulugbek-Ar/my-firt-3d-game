import test from "node:test";
import assert from "node:assert/strict";
import * as THREE from "three";
import { SaveSystem, SAVE_KEY, validateSave } from "../src/save.js";
import { createState } from "../src/state.js";
import { Player } from "../src/player.js";
import { ShrineInteraction } from "../src/interactions.js";
import { canOccupy } from "../src/collision.js";
import { FollowCamera } from "../src/camera.js";
const valid = {
  version: 1,
  position: { x: 0, y: 0, z: 19 },
  graphics: "low",
  objectiveComplete: false,
  playSeconds: 5,
};
function storage() {
  const data = new Map();
  return {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => data.set(key, value),
  };
}
test("versioned saves round trip and reject malformed, future, and unsafe positions", () => {
  const store = storage(),
    saves = new SaveSystem(store),
    state = createState();
  assert.equal(saves.load(), null);
  assert.equal(saves.write({ position: valid.position }, state), true);
  assert.equal(saves.load().position.z, 19);
  for (const bad of [
    "{",
    "null",
    JSON.stringify({ ...valid, version: 2 }),
    JSON.stringify({ ...valid, position: { x: 1e6, y: 0, z: 0 } }),
  ]) {
    store.setItem(SAVE_KEY, bad);
    assert.equal(saves.load(), null);
  }
  assert.equal(
    validateSave({ ...valid, position: { x: NaN, y: 0, z: 0 } }),
    null,
  );
});
test("denied storage is handled and settings persist separately", () => {
  const saves = new SaveSystem(storage());
  assert.equal(saves.writeGraphics("medium"), true);
  assert.equal(saves.readGraphics(), "medium");
  const denied = new SaveSystem({
    getItem() {
      throw Error("denied");
    },
    setItem() {
      throw Error("full");
    },
  });
  assert.equal(denied.load(), null);
  assert.equal(
    denied.write({ position: valid.position }, createState()),
    false,
  );
});
test("player moves camera-relative, runs, jumps, lands, and cannot cross walls", () => {
  const wall = { minX: -3, maxX: 3, minZ: 10, maxZ: 11 };
  const player = new Player(new THREE.Scene(), [wall]);
  const state = createState();
  const keys = new Set(["KeyW"]);
  const input = { down: (key) => keys.has(key), jump: false };
  for (let i = 0; i < 240; i++) player.update(1 / 60, input, 0, state);
  assert.ok(player.position.z > 11.4 && player.position.z < 12);
  assert.equal(canOccupy(0, 10.5, [wall]), false);
  player.reset();
  keys.add("ShiftLeft");
  for (let i = 0; i < 60; i++) player.update(1 / 60, input, Math.PI / 2, state);
  assert.ok(player.position.x < -5);
  assert.ok(state.stamina < 100);
  keys.clear();
  input.jump = true;
  player.update(1 / 60, input, 0, state);
  assert.ok(player.position.y > 0);
  for (let i = 0; i < 120; i++) player.update(1 / 60, input, 0, state);
  assert.equal(player.position.y, 0);
});
test("shrine only completes once and only within interaction distance", () => {
  const shrine = new ShrineInteraction({ x: 0, z: -16 }),
    state = createState(),
    player = { position: { x: 0, y: 0, z: 19 } };
  shrine.update(player, state);
  assert.equal(shrine.interact(state), false);
  player.position.z = -14;
  shrine.update(player, state);
  assert.equal(shrine.interact(state), true);
  assert.equal(state.memory, 50);
  shrine.update(player, state);
  assert.equal(shrine.interact(state), false);
});
test("camera clamps pitch and shortens its distance before a solid wall", () => {
  const camera = new THREE.PerspectiveCamera();
  const obstacle = new THREE.Mesh(new THREE.BoxGeometry(10, 10, 1));
  obstacle.position.set(0, 2, 4);
  obstacle.updateMatrixWorld();
  const follow = new FollowCamera(camera, [obstacle]);
  const player = { position: new THREE.Vector3() };
  const input = { lookX: 0, lookY: 0 };
  follow.update(1 / 60, player, input, true);
  assert.ok(camera.position.z < 3.5);
  input.lookY = 10000;
  follow.update(1 / 60, player, input, true);
  assert.equal(follow.pitch, 0.95);
});
