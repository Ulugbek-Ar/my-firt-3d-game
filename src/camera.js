import * as THREE from "three";
export class FollowCamera {
  constructor(camera, obstacles) {
    this.camera = camera;
    this.obstacles = obstacles;
    this.yaw = 0;
    this.pitch = 0.27;
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
    this.target.copy(player.position).y += 1.3;
    this.direction.set(
      Math.sin(this.yaw) * Math.cos(this.pitch),
      Math.sin(this.pitch),
      Math.cos(this.yaw) * Math.cos(this.pitch),
    );
    this.ray.set(this.target, this.direction);
    this.ray.far = 7.5;
    const hit = this.ray.intersectObjects(this.obstacles, false)[0];
    const distance = hit ? Math.max(0.55, hit.distance - 0.4) : 7.5;
    this.desired.copy(this.target).addScaledVector(this.direction, distance);
    this.desired.y = Math.max(0.5, this.desired.y);
    this.camera.position.lerp(
      this.desired,
      snap || hit ? 1 : 1 - Math.exp(-8 * dt),
    );
    this.camera.lookAt(this.target);
  }
}
