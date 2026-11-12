import * as THREE from "three";
import { SPAWN } from "./state.js";
import { canOccupy } from "./collision.js";
import { createCharacter } from "./character.js";
export class Player {
  constructor(scene, colliders, heightAt = () => 0) {
    this.colliders = colliders;
    this.position = new THREE.Vector3(SPAWN.x, 0, SPAWN.z);
    this.velocity = new THREE.Vector3();
    this.vertical = 0;
    this.character = createCharacter();
    this.model = this.character.root;
    this.model.rotation.y = Math.PI;
    scene.add(this.model);
    this.heightAt = heightAt;
    this.groundHeight = heightAt(SPAWN.x, SPAWN.z);
    this.position.y = this.groundHeight;
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
    this.groundHeight = this.heightAt(position.x, position.z);
    this.position.set(position.x, this.groundHeight, position.z);
    this.velocity.set(0, 0, 0);
    this.vertical = 0;
    this.model.rotation.y = Math.PI;
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
    const wasGrounded = this.position.y <= this.groundHeight + 0.025;
    this.groundHeight = this.heightAt(this.position.x, this.position.z);
    if (wasGrounded && this.vertical <= 0) this.position.y = this.groundHeight;
    if (input.jump && wasGrounded) this.vertical = 6;
    input.jump = false;
    this.vertical -= 18 * dt;
    this.position.y = Math.max(
      this.groundHeight,
      this.position.y + this.vertical * dt,
    );
    if (this.position.y <= this.groundHeight) this.vertical = 0;
    if (moving) {
      const target = Math.atan2(dx, dz);
      const difference = Math.atan2(
        Math.sin(target - this.model.rotation.y),
        Math.cos(target - this.model.rotation.y),
      );
      this.model.rotation.y += difference * Math.min(1, dt * 12);
      this.phase += dt * (running ? 12 : 8);
    }
    if (!moving) this.phase += dt;
    this.character.animate(
      this.phase,
      moving,
      running,
      this.position.y > this.groundHeight + 0.05,
    );
    this.model.position.copy(this.position);
    this.shadow.position.set(
      this.position.x,
      this.groundHeight + 0.04,
      this.position.z,
    );
  }
}
