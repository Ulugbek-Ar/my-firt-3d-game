export class ShrineInteraction {
  constructor(shrine) {
    this.shrine = shrine;
    this.distance = Infinity;
    this.available = false;
  }
  update(player, state) {
    this.distance = Math.hypot(
      player.position.x - this.shrine.x,
      player.position.z - this.shrine.z,
    );
    this.available =
      this.distance < 3.6 &&
      player.position.y - (player.groundHeight ?? 0) < 1 &&
      !state.objectiveComplete;
  }
  interact(state) {
    if (!this.available) return false;
    state.objectiveComplete = true;
    state.memory = 50;
    this.available = false;
    return true;
  }
}
