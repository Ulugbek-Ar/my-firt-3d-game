# my-firt-3d-game

# THE LAST EPOCH — V1: Foundation

A playable, procedural dark-fantasy 3D prototype set in Asterfall, Elyndra. All player-facing text is Uzbek. The working English title is retained here; the localized title is **So‘nggi davr**.

## Run

Requires Node.js 20.19+ (Node 22.12+ or 24 LTS recommended), npm, and a desktop browser with WebGL1 or WebGL2 enabled.

```sh
npm ci
npm run dev
```

Open the address printed by Vite. For a production build:

```sh
npm run build
npm run preview
npm test
```

If your environment restricts the default npm cache, append `--cache /tmp/epoch-npm-cache` to `npm ci`. No backend, credentials, external assets, fonts, or runtime CDN access are needed. `dist/` is generated and ignored.

## Play

Choose **Yangi o‘yin**, read the introduction, then **Xotiraga ergashish**. WASD moves relative to the camera; hold left Shift to sprint, Space to jump. Click the world to capture the mouse; if capture is unavailable, hold the left mouse button and drag. Move the mouse to orbit, Escape to pause or release capture. A pause button also works without pointer capture.

Walk north along the main path through the four-house village. The glowing shrine is beyond the houses. Within 3.6 meters, press E to hear the memory and finish the introduction. Explore freely afterward. There is no combat in V1; health and memory are foundations for future systems.

Pause → **Saqlash** saves manually; the game also saves every 15 seconds, on shrine completion, pause, menu return, and page exit. **Davom etish** resumes a valid save. New Game asks before replacing an existing save. Graphics settings have their own storage key. Saves are local to the browser and origin, not synchronized across devices or dev/preview ports. Denied/full storage produces a message; corrupt/unsupported saves disable Continue. Save schema version 1 is validated before use; add explicit migrations when extending it.

## Structure and extension contracts

- `src/main.js`: composition root, mode transitions, fixed-step simulation, frame pacing, lifecycle.
- `src/graphics.js`: WebGL capability detection, renderer, resize and presets.
- `src/world.js`: seeded procedural village, instanced forest and rocks, shared geometry/materials, collider and camera obstacle registries.
- `src/player.js`: camera-relative motion, gravity, ground plane, collision and low-poly Kael.
- `src/collision.js`: reusable horizontal collision queries.
- `src/camera.js`: damped third-person follow with obstacle raycasts.
- `src/input.js`: keyboard, pointer lock/drag, focus handling.
- `src/ui.js` and `src/style.css`: Uzbek menus, story, HUD, settings, feedback.
- `src/state.js`: fresh runtime state and graphics presets.
- `src/save.js`: validated, versioned localStorage boundary.
- `src/interactions.js`: range-gated shrine interaction; future interactables can expose the same update/interact contract.
- `tests/systems.test.js`: stateful save, collision, motion, camera and interaction checks.

Keep these modules and extend them for future versions rather than rebuilding. Add combat/NPC systems as separate modules injected at the composition root; keep render code independent from rules. Extend world regions through world-owned geometry/collider registries. Add equipment, quests, reputation and world evolution to explicitly versioned state/save schemas with migrations. No empty placeholder subsystems are shipped.

## Performance and compatibility

Three.js **0.160.1** is deliberately pinned as a release supporting WebGL1; do not upgrade blindly to WebGL2-only versions. WebGL2 is attempted first, then WebGL1. If neither is available, a localized recovery message appears. Context loss stops rendering and requests reload. Low: 30 FPS cap, device pixel ratio capped at 1 then scaled to 80%; Medium: 60 FPS cap, DPR capped at 1.25. No shadows, postprocessing, textures, or dynamic point lights. Trees and rocks use instancing, materials and geometry are shared, and fog limits distance. Simulation uses fixed 60 Hz steps with elapsed-time clamping. Rendering stops when hidden; gameplay pauses on focus loss.

The target Pentium G2020 / old Intel HD / Windows 10 PC has **not been tested**. 30 FPS is a target, not a guarantee; driver/WebGL instancing support is required. This V1 uses a flat walkable terrain plane, conservative horizontal obstacles (no climbing onto buildings), a bounded small region, and a single story interaction. Desktop keyboard/mouse is required; touch controls, audio, NPCs, combat and a full open world are deferred.

## Manual acceptance checklist

1. Fresh origin: Continue disabled. New Game → introduction → visible Kael and village.
2. WASD, sprint stamina/recovery, jump/landing, wall collision, mouse orbit and camera obstacle avoidance.
3. Escape pauses; settings apply Low/Medium immediately; credits and menu navigation work.
4. Follow road to shrine, E opens memory, objective completes exactly once.
5. Save, reload, Continue: position, progress, graphics persist. Test corrupted storage and blocked storage.
6. Switch tab: gameplay/rendering pauses. Return and resume. Disable WebGL: helpful fallback.

## V2 direction

Add one melee enemy and a minimal stamina-based combat loop; an NPC with branching dialogue; a second objective using the interaction contract; explicit save migration tests; and profiling on the target Intel HD hardware before expanding the world.

## Automated browser validation

With the development server already running in another terminal:

```sh
npx playwright install chromium
npm run test:browser
```

Alternatively set `CHROMIUM_PATH` to an existing Chromium executable. Set `BASE_URL` to test a different local server, including `npm run preview`. The scripts launch headless Chromium with software WebGL flags, exercise menus, camera dragging, presets, keyboard travel to the shrine, interaction, save/reload, corrupted saves, forced WebGL1 startup, missing WebGL, and denied storage. Screenshots are written to ignored `.artifacts/`. These are functional compatibility checks, not GPU performance benchmarks. `npm test` runs the five fast system tests without needing a browser or running server.

## V1 validation record

Validated in the cloud environment with Node.js 24.22.1 and headless Chromium using software WebGL:

- Production build succeeded (approximately 126 kB gzip JavaScript).
- All five system tests passed.
- Both browser scripts passed against the production preview: village entry, WASD travel, menus, camera-relative movement after mouse orbit, Low/Medium settings, shrine completion, save/reload, corrupted save, forced WebGL1, missing WebGL/instancing extension recovery, and denied localStorage.
- No JavaScript runtime errors in the normal gameplay scenario.
- No tests were performed on the target Windows/Intel HD machine. Real GPU performance, physical mouse feel, and actual driver/context-loss recovery still need device testing.
