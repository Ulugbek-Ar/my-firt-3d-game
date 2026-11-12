export class Input {
  constructor(canvas, isPlaying, pause) {
    this.keys = new Set();
    this.lookX = 0;
    this.lookY = 0;
    this.jump = false;
    this.interact = false;
    this.canvas = canvas;
    window.addEventListener("keydown", (e) => {
      if (e.code === "Escape") {
        e.preventDefault();
        pause();
        return;
      }
      if (!isPlaying()) return;
      if (["Space", "KeyW", "KeyA", "KeyS", "KeyD"].includes(e.code))
        e.preventDefault();
      this.keys.add(e.code);
      if (!e.repeat && e.code === "Space") this.jump = true;
      if (!e.repeat && e.code === "KeyE") this.interact = true;
    });
    window.addEventListener("keyup", (e) => this.keys.delete(e.code));
    window.addEventListener("blur", () => {
      this.clear();
      if (isPlaying()) pause();
    });
    canvas.addEventListener("click", () => {
      if (isPlaying() && document.pointerLockElement !== canvas) {
        try {
          canvas.requestPointerLock()?.catch(() => {});
        } catch {
          /* Dragging remains available. */
        }
      }
    });
    window.addEventListener("mousemove", (e) => {
      if (
        isPlaying() &&
        (document.pointerLockElement === canvas || e.buttons === 1)
      ) {
        this.lookX += e.movementX;
        this.lookY += e.movementY;
      }
    });
    document.addEventListener("pointerlockchange", () => {
      if (document.pointerLockElement !== canvas && isPlaying()) pause();
    });
  }
  down(code) {
    return this.keys.has(code);
  }
  clear() {
    this.keys.clear();
    this.jump = false;
    this.interact = false;
    this.lookX = 0;
    this.lookY = 0;
  }
}
