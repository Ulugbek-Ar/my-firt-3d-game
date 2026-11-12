export const SPAWN = Object.freeze({ x: 0, y: 0, z: 19 });
export const PRESETS = Object.freeze({
  low: { pixelRatio: 1, scale: 0.8, fps: 30, far: 100 },
  medium: { pixelRatio: 1.25, scale: 1, fps: 60, far: 135 },
});
export function createState() {
  return {
    mode: "menu",
    graphics: "low",
    objectiveComplete: false,
    health: 100,
    stamina: 100,
    memory: 25,
    playSeconds: 0,
  };
}
