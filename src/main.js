import "./style.css";
import { loadArt } from "./art/materials.js";
import { createGraphics } from "./graphics.js";
import { createWorld } from "./world.js";
import { Player } from "./player.js";
import { FollowCamera } from "./camera.js";
import { Input } from "./input.js";
import { createState, PRESETS, SPAWN } from "./state.js";
import { SaveSystem } from "./save.js";
import { ShrineInteraction } from "./interactions.js";
import { resolveSavedPosition } from "./collision.js";
import { UI } from "./ui.js";

async function boot() {
  const state = createState();
  let saveSystem;
  try {
    saveSystem = new SaveSystem();
  } catch {
    saveSystem = new SaveSystem(null);
  }
  state.graphics =
    saveSystem.readGraphics() || saveSystem.load()?.graphics || "low";
  state.resolution = saveSystem.readResolution();
  let graphics,
    world,
    player,
    camera,
    input,
    interaction,
    hasGame = false,
    returnTo = "menu";
  function release() {
    if (document.pointerLockElement) document.exitPointerLock();
    input?.clear();
  }
  function save(notify = false) {
    if (!hasGame) return;
    const ok = saveSystem.write(player, state);
    if (notify || !ok)
      ui.toast(
        ok
          ? "Xotira saqlandi."
          : "Saqlab bo‘lmadi. Brauzer xotirasiga ruxsatni tekshiring.",
      );
  }
  function resume() {
    player.model.visible = true;
    player.shadow.visible = true;
    state.mode = "playing";
    input.clear();
    ui.play();
  }
  function pause() {
    if (state.mode === "playing") {
      state.mode = "paused";
      release();
      save();
      ui.pause();
    } else if (state.mode === "paused") resume();
    else if (state.mode === "settings" || state.mode === "credits") back();
  }
  function mainMenu() {
    save();
    state.mode = "menu";
    release();
    showMainMenu();
  }
  function showMainMenu() {
    player.model.visible = false;
    player.shadow.visible = false;
    graphics.camera.position.set(3.6, 5.4, 26);
    graphics.camera.lookAt(-2, 2.2, -8);
    ui.menu(!!saveSystem.load());
  }
  function back() {
    if (returnTo === "paused") {
      state.mode = "paused";
      ui.pause();
    } else {
      state.mode = "menu";
      showMainMenu();
    }
  }
  const ui = new UI({
    pause,
    resume,
    mainMenu,
    save: () => save(true),
    newGame() {
      if (
        saveSystem.load() &&
        !window.confirm(
          "Yangi o‘yin saqlangan xotirani almashtiradi. Davom etasizmi?",
        )
      )
        return;
      hasGame = true;
      state.objectiveComplete = false;
      state.playSeconds = 0;
      state.stamina = 100;
      state.memory = 25;
      player.model.visible = true;
      player.shadow.visible = true;
      player.reset();
      camera.yaw = 0;
      camera.pitch = 0.2;
      camera.update(0, player, input, true);
      state.mode = "intro";
      ui.intro();
    },
    begin() {
      resume();
      save();
    },
    continueGame() {
      const data = saveSystem.load();
      if (!data) {
        ui.menu(false);
        ui.toast("Saqlangan xotira topilmadi.");
        return;
      }
      hasGame = true;
      state.objectiveComplete = data.objectiveComplete;
      state.memory = data.objectiveComplete ? 50 : 25;
      state.stamina = 100;
      state.playSeconds = data.playSeconds;
      state.graphics = saveSystem.readGraphics() || data.graphics;
      graphics.setQuality(state.graphics);
      world.setQuality(state.graphics);
      player.reset(resolveSavedPosition(data.position, world.colliders, SPAWN));
      camera.yaw = 0;
      camera.pitch = 0.2;
      camera.update(0, player, input, true);
      resume();
    },
    settings() {
      returnTo = state.mode === "paused" ? "paused" : "menu";
      state.mode = "settings";
      release();
      ui.settings(state.graphics, back, state.resolution);
    },
    resolution(value) {
      state.resolution = value;
      graphics.setResolution(value);
      if (!saveSystem.writeResolution(value))
        ui.toast("Sozlamalarni saqlab bo‘lmadi.");
    },
    quality(value) {
      state.graphics = value;
      graphics.setQuality(value);
      world.setQuality(value);
      if (!saveSystem.writeGraphics(value))
        ui.toast("Sozlamalarni saqlab bo‘lmadi.");
      if (hasGame) save();
    },
    credits() {
      returnTo = "menu";
      state.mode = "credits";
      ui.credits(back);
    },
  });
  document.querySelector("#boot-screen").hidden = true;
  ui.loading(0);
  try {
    await loadArt((progress) => ui.loading(progress));
  } catch (error) {
    console.warn("Surface art unavailable; using fallback materials.", error);
    ui.toast("Tasvirlar yuklanmadi. Soddalashtirilgan ko‘rinish yoqildi.");
  }
  try {
    graphics = createGraphics(document.querySelector("#world"), state.graphics);
    graphics.setResolution(state.resolution);
    world = createWorld(graphics.scene, state.graphics);
    player = new Player(graphics.scene, world.colliders, world.groundHeight);
    camera = new FollowCamera(
      graphics.camera,
      world.cameraObstacles,
      world.groundHeight,
    );
    input = new Input(
      graphics.renderer.domElement,
      () => state.mode === "playing",
      pause,
    );
    interaction = new ShrineInteraction(world.shrine);
    camera.update(0, player, input, true);
  } catch (error) {
    console.error(error);
    ui.fatal();
    return;
  }
  showMainMenu();
  let last = 0,
    accumulator = 0,
    lastRender = 0,
    fpsTime = 0,
    frames = 0,
    fps = 0,
    saveTime = 0;
  document.addEventListener("visibilitychange", () => {
    if (document.hidden && state.mode === "playing") pause();
    last = 0;
    accumulator = 0;
  });
  window.addEventListener("pagehide", () => save());
  graphics.renderer.domElement.addEventListener("webglcontextlost", (event) => {
    event.preventDefault();
    save();
    state.mode = "error";
    release();
    ui.fatal();
  });
  function frame(now) {
    requestAnimationFrame(frame);
    if (document.hidden || state.mode === "error") return;
    const dt = last ? Math.min((now - last) / 1000, 0.1) : 0;
    last = now;
    if (state.mode === "playing") {
      // Fixed simulation steps keep collisions stable at low rendering rates.
      accumulator += dt;
      camera.yaw -= input.lookX * 0.003;
      camera.pitch = Math.max(
        -0.05,
        Math.min(0.95, camera.pitch + input.lookY * 0.003),
      );
      input.lookX = input.lookY = 0;
      while (accumulator >= 1 / 60) {
        player.update(1 / 60, input, camera.yaw, state);
        accumulator -= 1 / 60;
        state.playSeconds += 1 / 60;
      }
      interaction.update(player, state);
      if (input.interact) {
        input.interact = false;
        if (interaction.interact(state)) {
          state.mode = "memory";
          release();
          save();
          ui.memory();
          ui.toast("Xotira uyg‘ondi · Maqsad bajarildi.");
        }
      }
      camera.update(dt, player, input);
      saveTime += dt;
      if (saveTime >= 15) {
        saveTime = 0;
        save();
      }
    } else {
      accumulator = 0;
      interaction.update(player, state);
    }
    const interval = 1000 / PRESETS[state.graphics].fps;
    if (now - lastRender >= interval - 0.5) {
      lastRender = now - ((now - lastRender) % interval);
      world.update(now / 1000, graphics.camera.position);
      graphics.renderer.render(graphics.scene, graphics.camera);
      frames++;
      if (now - fpsTime > 1000) {
        fps = Math.round((frames * 1000) / (now - fpsTime));
        frames = 0;
        fpsTime = now;
      }
      ui.update(state, interaction, fps);
    }
  }
  requestAnimationFrame(frame);
}
boot();
