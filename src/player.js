import * as THREE from "three";
import { SPAWN } from "./state.js";
import { canOccupy } from "./collision.js";
export class Player {
  constructor(scene, colliders) {
    this.colliders = colliders;
    this.position = new THREE.Vector3(SPAWN.x, 0, SPAWN.z);
    this.velocity = new THREE.Vector3();
    this.vertical = 0;
    this.model = new THREE.Group();
    scene.add(this.model);
    const cloth = new THREE.MeshLambertMaterial({
      color: 0x8b6250,
      flatShading: true,
    });
    const dark = new THREE.MeshLambertMaterial({ color: 0x293332 });
    const skin = new THREE.MeshLambertMaterial({ color: 0xb5a78a });
    function part(geometry, material, x, y, z) {
      const m = new THREE.Mesh(geometry, material);
      m.position.set(x, y, z);
      return m;
    }
    this.model.add(part(new THREE.ConeGeometry(0.48, 1.15, 6), cloth, 0, 1, 0));
    this.model.add(
      part(new THREE.BoxGeometry(0.58, 0.65, 0.35), dark, 0, 1.25, 0),
    );
    this.model.add(
      part(new THREE.IcosahedronGeometry(0.25, 0), skin, 0, 1.85, 0),
    );
    this.model.add(
      part(new THREE.BoxGeometry(0.35, 0.18, 0.36), dark, 0, 2.01, -0.03),
    );
    this.legs = [-1, 1].map((s) => {
      const m = part(
        new THREE.BoxGeometry(0.2, 0.6, 0.24),
        dark,
        s * 0.18,
        0.32,
        0,
      );
      this.model.add(m);
      return m;
    });
    for (const s of [-1, 1])
      this.model.add(
        part(new THREE.BoxGeometry(0.19, 0.63, 0.22), cloth, s * 0.42, 1.2, 0),
      );
    const buckle = part(
      new THREE.BoxGeometry(0.18, 0.14, 0.04),
      new THREE.MeshBasicMaterial({ color: 0xc7b17d }),
      0,
      1.03,
      0.2,
    );
    this.model.add(buckle);
    const shadow = new THREE.Mesh(
      new THREE.CircleGeometry(0.55, 16),
      new THREE.MeshBasicMaterial({
        color: 0x142522,
        transparent: true,
        opacity: 0.5,
        depthWrite: false,
      }),
    );
    shadow.rotation.x = -Math.PI / 2;
    scene.add(shadow);
    this.shadow = shadow;
    this.model.position.copy(this.position);
    this.phase = 0;
  }
  reset(position = SPAWN) {
    this.position.set(position.x, position.y, position.z);
    this.velocity.set(0, 0, 0);
    this.vertical = 0;
    this.model.position.copy(this.position);
  }
  update(dt, input, yaw, state) {
    let x = Number(input.down("KeyD")) - Number(input.down("KeyA"));
    let z = Number(input.down("KeyS")) - Number(input.down("KeyW"));
    const moving = x !== 0 || z !== 0;
    const length = Math.hypot(x, z) || 1;
    x /= length;
    z /= length;
    const running = moving && input.down("ShiftLeft") && state.stamina > 1;
    state.stamina = THREE.MathUtils.clamp(
      state.stamina + (running ? -22 : 15) * dt,
      0,
      100,
    );
    const speed = running ? 6 : 3.1;
    const dx = (x * Math.cos(yaw) + z * Math.sin(yaw)) * speed;
    const dz = (-x * Math.sin(yaw) + z * Math.cos(yaw)) * speed;
    this.velocity.x = THREE.MathUtils.damp(this.velocity.x, dx, 12, dt);
    this.velocity.z = THREE.MathUtils.damp(this.velocity.z, dz, 12, dt);
    const nx = this.position.x + this.velocity.x * dt,
      nz = this.position.z + this.velocity.z * dt;
    if (canOccupy(nx, this.position.z, this.colliders)) this.position.x = nx;
    if (canOccupy(this.position.x, nz, this.colliders)) this.position.z = nz;
    if (input.jump && this.position.y < 0.001) this.vertical = 6;
    input.jump = false;
    this.vertical -= 18 * dt;
    this.position.y = Math.max(0, this.position.y + this.vertical * dt);
    if (!this.position.y) this.vertical = 0;
    if (moving) {
      const target = Math.atan2(dx, dz);
      const difference = Math.atan2(
        Math.sin(target - this.model.rotation.y),
        Math.cos(target - this.model.rotation.y),
      );
      this.model.rotation.y += difference * Math.min(1, dt * 12);
      this.phase += dt * (running ? 12 : 8);
    }
    this.legs.forEach((leg, i) => {
      leg.rotation.x = moving ? Math.sin(this.phase + i * Math.PI) * 0.5 : 0;
    });
    this.model.position.copy(this.position);
    this.shadow.position.set(this.position.x, 0.03, this.position.z);
  }
}
