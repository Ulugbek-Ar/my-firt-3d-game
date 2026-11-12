import { SPAWN } from "./state.js";
export const SAVE_KEY = "the-last-epoch.save";
export const SETTINGS_KEY = "the-last-epoch.graphics";
export function validateSave(data) {
  if (
    !data ||
    data.version !== 1 ||
    !data.position ||
    typeof data.objectiveComplete !== "boolean"
  )
    return null;
  const { x, y, z } = data.position;
  if (
    ![x, y, z].every(Number.isFinite) ||
    Math.abs(x) > 48 ||
    Math.abs(z) > 48 ||
    y < 0 ||
    y > 20
  )
    return null;
  if (
    !["low", "medium"].includes(data.graphics) ||
    !Number.isFinite(data.playSeconds) ||
    data.playSeconds < 0
  )
    return null;
  return {
    version: 1,
    position: { x, y, z },
    graphics: data.graphics,
    objectiveComplete: data.objectiveComplete,
    playSeconds: data.playSeconds,
  };
}
export class SaveSystem {
  constructor(storage = globalThis.localStorage) {
    this.storage = storage;
  }
  load() {
    try {
      return validateSave(JSON.parse(this.storage.getItem(SAVE_KEY)));
    } catch {
      return null;
    }
  }
  write(player, state) {
    const data = validateSave({
      version: 1,
      position: { x: player.position.x, y: 0, z: player.position.z },
      graphics: state.graphics,
      objectiveComplete: state.objectiveComplete,
      playSeconds: state.playSeconds,
    });
    if (!data) return false;
    try {
      this.storage.setItem(SAVE_KEY, JSON.stringify(data));
      return true;
    } catch {
      return false;
    }
  }
  readResolution() {
    try {
      const raw = this.storage.getItem("the-last-epoch.resolution");
      const value = Number(raw);
      return raw && [0.6, 0.8, 1].includes(value) ? value : null;
    } catch {
      return null;
    }
  }
  writeResolution(value) {
    if (![0.6, 0.8, 1].includes(value)) return false;
    try {
      this.storage.setItem("the-last-epoch.resolution", String(value));
      return true;
    } catch {
      return false;
    }
  }
  readGraphics() {
    try {
      const value = this.storage.getItem(SETTINGS_KEY);
      return ["low", "medium"].includes(value) ? value : null;
    } catch {
      return null;
    }
  }
  writeGraphics(value) {
    try {
      this.storage.setItem(SETTINGS_KEY, value);
      return true;
    } catch {
      return false;
    }
  }
}
export { SPAWN };
