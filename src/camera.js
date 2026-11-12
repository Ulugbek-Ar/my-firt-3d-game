import * as THREE from "three";
export class FollowCamera {
  constructor(camera, obstacles, heightAt = () => 0) {
    this.camera = camera;
    this.obstacles = obstacles;
    this.heightAt = heightAt;
    this.candidates = [];
    this.yaw = 0;
    this.pitch = 0.2;
    this.target = new THREE.Vector3();
    this.desired = new THREE.Vector3();
    this.direction = new THREE.Vector3();
    this.ray = new THREE.Raycaster();
  }
  update(dt, player, input, snap = false) {
    this.yaw -= input.lookX * 0.003;
    this.pitch = THREE.MathUtils.clamp(
      this.pitch + input.lookY * 0.003,
      -0.05,
      0.95,
    );
    input.lookX = input.lookY = 0;
    this.target.copy(player.position).y += 1.45;
    this.direction.set(
      Math.sin(this.yaw) * Math.cos(this.pitch),
      Math.sin(this.pitch),
      Math.cos(this.yaw) * Math.cos(this.pitch),
    );
    this.ray.set(this.target, this.direction);
    this.ray.far = 8.2;
    this.candidates.length = 0;
    for (const obstacle of this.obstacles) {
      if (obstacle.position.distanceToSquared(this.target) < 225)
        this.candidates.push(obstacle);
    }
    const hit = this.ray.intersectObjects(this.candidates, false)[0];
    const distance = hit ? Math.max(0.55, hit.distance - 0.4) : 8.2;
    this.desired.copy(this.target).addScaledVector(this.direction, distance);
    // Sample the camera boom as well as its endpoint so a hillside cannot obscure Kael.
    for (let step = 0.5; step <= distance; step += 0.5) {
      const x = this.target.x + this.direction.x * step,
        z = this.target.z + this.direction.z * step;
      if (
        this.target.y + this.direction.y * step <
        this.heightAt(x, z) + 0.45
      ) {
        this.desired
          .copy(this.target)
          .addScaledVector(this.direction, Math.max(0.6, step - 0.5));
        break;
      }
    }
    this.desired.y = Math.max(
      this.heightAt(this.desired.x, this.desired.z) + 0.5,
      this.desired.y,
    );
    this.camera.position.lerp(
      this.desired,
      snap || hit ? 1 : 1 - Math.exp(-8 * dt),
    );
    this.camera.position.y = Math.max(
      this.heightAt(this.camera.position.x, this.camera.position.z) + 0.4,
      this.camera.position.y,
    );
    this.camera.lookAt(this.target);
  }
}
