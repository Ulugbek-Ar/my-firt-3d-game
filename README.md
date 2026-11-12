# my-firt-3d-game

# THE LAST EPOCH — V3: Asterfall art identity

A playable, procedural dark-fantasy 3D prototype set in Asterfall, Elyndra. V3 extends the V1/V2 foundation with original textured surfaces, distinctive architecture, organic pine silhouettes, a tailored animated traveler and a redesigned Uzbek interface. See [art direction and rendering budgets](docs/ART_DIRECTION.md). All player-facing text is Uzbek. The working English title is retained here; the localized title is **So‘nggi davr**.

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

Walk north along the main path through the four-house village. The glowing shrine is beyond the houses. Within 3.6 meters, press E to hear the memory and finish the introduction. Explore freely afterward. There is no combat in V3; health and memory are foundations for future systems.

Pause → **Saqlash** saves manually; the game also saves every 15 seconds, on shrine completion, pause, menu return, and page exit. **Davom etish** resumes a valid save. New Game asks before replacing an existing save. Graphics settings have their own storage key. Saves are local to the browser and origin, not synchronized across devices or dev/preview ports. Denied/full storage produces a message; corrupt/unsupported saves disable Continue. Save schema version 1 is validated before use; add explicit migrations when extending it.

## Structure and extension contracts

- `src/main.js`: composition root, mode transitions, fixed-step simulation, frame pacing, lifecycle.
- `src/graphics.js`: WebGL capability detection, renderer, resize and presets.
- `src/world.js`: seeded procedural village, instanced forest and rocks, shared geometry/materials, collider and camera obstacle registries.
- `src/player.js`: camera-relative motion, gravity, sampled terrain collision and animated low-poly Kael.
- `src/character.js`: modular hooded traveler, layered clothing, cloak/stride/breathing animations.
- `src/environment/`: pure sampled terrain, instancing builder, authored buildings, forest groves, shrine and atmosphere.
- `src/collision.js`: reusable horizontal collision queries and safe placement of legacy saves.
- `src/camera.js`: damped third-person follow with nearby collision proxies and terrain boom sampling.
- `src/input.js`: keyboard, pointer lock/drag, focus handling.
- `src/ui.js` and `src/style.css`: Uzbek menus, story, HUD, settings, feedback.
- `src/state.js`: fresh runtime state and graphics presets.
- `src/save.js`: validated, versioned localStorage boundary.
- `src/interactions.js`: range-gated shrine interaction; future interactables can expose the same update/interact contract.
- `tests/systems.test.js`: stateful save, collision, motion, camera and interaction checks.

Keep these modules and extend them for future versions rather than rebuilding. Add combat/NPC systems as separate modules injected at the composition root; keep render code independent from rules. Extend world regions through world-owned geometry/collider registries. Add equipment, quests, reputation and world evolution to explicitly versioned state/save schemas with migrations. No empty placeholder subsystems are shipped.

## Performance and compatibility

Three.js **0.160.1** is deliberately pinned as a release supporting WebGL1; do not upgrade blindly to WebGL2-only versions. WebGL2 is attempted first, then WebGL1. If neither is available, a localized recovery message appears. Context loss stops rendering and requests reload. Low: 30 FPS cap, device pixel ratio capped at 1 then scaled to 80%; Medium: 60 FPS cap, DPR capped at 1.25. No real-time shadows, postprocessing, downloaded textures, or dynamic point lights. An optimized 1024×1024 original material atlas and two 128×128 repeating maps provide surface detail; tiny glow/sky textures provide soft light pools and a gradient sky. Lambert/basic materials are used throughout; there are no expensive physically based materials or custom shaders. Trees and rocks use instancing, materials and geometry are shared, and fog limits distance. Simulation uses fixed 60 Hz steps with elapsed-time clamping. Rendering stops when hidden; gameplay pauses on focus loss.

The target Pentium G2020 / old Intel HD / Windows 10 PC has **not been tested**. 30 FPS is a target, not a guarantee; driver/WebGL instancing support is required. The current game uses a triangulated hilly terrain surface, conservative horizontal obstacles (no climbing onto buildings), a bounded small region, and a single story interaction. Desktop keyboard/mouse is required; touch controls, audio, NPCs, combat and a full open world are deferred.

## Manual acceptance checklist

1. Fresh origin: Continue disabled. New Game → introduction → visible Kael and village.
2. WASD, sprint stamina/recovery, jump/landing, wall collision, mouse orbit and camera obstacle avoidance.
3. Escape pauses; settings apply Low/Medium immediately; credits and menu navigation work.
4. Follow road to shrine, E opens memory, objective completes exactly once.
5. Save, reload, Continue: position, progress, graphics persist. Test corrupted storage and blocked storage.
6. Switch tab: gameplay/rendering pauses. Return and resume. Disable WebGL: helpful fallback.

## V2 design and save compatibility (retained foundation)

The four houses, spawn, shrine coordinates and first objective are retained. Paths lead between authored homes and lanterns toward the shrine; deterministic forest groves and rock outcrops frame the playable corridor rather than blocking it. Slate courses, gable boards, beams/braces, plank doors, shutters, stone steps, chimneys, barrels and foundation blocks share instanced geometry. Lantern cores, halo sprites and softly painted light pools suggest warmth without point lights or shadows. Instanced runes pulse at the restored shrine; Medium adds 24 gently drifting motes, extra canopy layers and ground cover. All colliding trunks and a base canopy remain visible on Low. Low hides these optional meshes immediately.

The original save key and schema **version 1 remain unchanged**. Saved `x/z`, objective, play time and quality are reused. The old serialized `y=0` represents a grounded location: on load, the player is reprojected onto V2 terrain without modifying the stored save. When new scenery occupies a saved position, a bounded nearby search finds free ground; spawn is the last fallback. Objective/progress survive either path. Autosave continues using grounded `y=0`, so elevated terrain never creates an invalid legacy save. The shrine measures jump height above terrain rather than absolute world height.

All static scenery is grouped by shared geometry/material, including roof tiles, foliage, stones and rune strokes. Camera raycasts use simple local proxies instead of testing every decorative triangle. Terrain is a 48×48 grid; collision heights use exactly the same triangle interpolation (covered by raycast tests). Grass uses three triangles per tuft. The environment's pre-culling upper bounds in Node tests are approximately 39k triangles/25 mesh draws on Low and 45k/28 on Medium; these counts exclude Kael, sprites, points and the browser background pass and are not measured GPU performance. Actual rendered counts depend on view/culling.

## Future versions

Keep the V1 state/input/UI/save boundaries and V2 environment submodules. Profile on the target Intel HD machine before adding more scenery. Art extensions can add local environment batches, new regions and animation poses without replacing the gameplay foundation. Combat and NPCs remain outside this graphics update.

## Automated browser validation

With the development server already running in another terminal:

```sh
npx playwright install chromium
npm run test:browser
```

Alternatively set `CHROMIUM_PATH` to an existing Chromium executable. Set `BASE_URL` to test a different local server, including `npm run preview`. The scripts launch headless Chromium with software WebGL flags, exercise menus, camera dragging, presets, keyboard travel to the shrine, interaction, save/reload, corrupted saves, forced WebGL1 startup, missing WebGL, and denied storage. Screenshots are written to ignored `.artifacts/`. These are functional compatibility checks, not GPU performance benchmarks. `npm test` runs thirteen fast system/environment/art tests without needing a browser or running server.

## V1 validation record (historical)

Validated in the cloud environment with Node.js 24.22.1 and headless Chromium using software WebGL:

- Production build succeeded (approximately 126 kB gzip JavaScript).
- All five system tests passed.
- Both browser scripts passed against the production preview: village entry, WASD travel, menus, camera-relative movement after mouse orbit, Low/Medium settings, shrine completion, save/reload, corrupted save, forced WebGL1, missing WebGL/instancing extension recovery, and denied localStorage.
- No JavaScript runtime errors in the normal gameplay scenario.
- No tests were performed on the target Windows/Intel HD machine. Real GPU performance, physical mouse feel, and actual driver/context-loss recovery still need device testing.

## V2 validation

Run `npm run build`, `npm test`, and `npm run test:browser` against a local development or production preview server. The additional V2 browser fixtures load actual V1-format saves at the hillside, shrine, and village, checking progress/position retention and interaction. Environment tests check physics/rendered terrain agreement, uphill/downhill travel, jumps, terrain-aware camera, a clear original shrine route, bounded mesh/triangle budgets, and exactly two scene lights. Browser captures are saved in `.artifacts/v2-*.png`.

V2 limitations: approximate static lantern light pools, rigid cloak animation, conservative horizontal scenery collision (not climbable roofs or stairs), no terrain LOD/streaming, and no combat/NPCs. Target-machine FPS and real Intel driver behavior remain unverified. Vercel uses the unchanged root build command `npm run build` and output directory `dist`; Three.js is split into its own cacheable bundle. No manual deployment is needed when the connected main-branch integration is enabled.

V2 cloud validation completed successfully: `npm install`, production build (no chunk-size warnings), all 10 system/environment tests, and all three browser scripts against the production preview. Forced WebGL1, Low/Medium camera/movement, shrine completion, V1-format saves, damaged/denied storage and missing graphics capabilities passed. Screenshots were visually inspected for village, shrine and hills. Chromium used software rendering; these results do not establish target-hardware FPS.

## V3: surfaces, silhouettes and presentation

- Original stone/brick, timber/planks, cobble/mud, moss/ground, slate, metal, carved runes, needles, cloth, plaster, bark and leather atlas. Original asset provenance and regeneration instructions are in `public/textures/README.md`.
- Independently cullable spatial batches, instanced irregular pines/grass, authored fences/guild sign/firewood/votive stones, distinct house rooflines, bell turret, fallen forest branches and rebalanced cold/warm lighting.
- Shaped character clothing, textured russet cloak, layered leather/metal, bent-knee stride, run lean, breathing and a small CPU cloak ripple.
- Staged village main menu, real asset loading progress, redesigned pause/settings/HUD/prompts/notifications, persistent 60/80/100% resolution selection. Game saves retain their original version 1 schema.
- `src/art/` owns surfaces and reusable art geometry; `src/environment/landmarks.js` owns new authored props. V3 keeps the V1 controller, input, save, interaction and objective systems.

Run the same installation/build commands above. `npm run test:browser` now runs four scripts. V3 checks texture downloads and graceful asset failure, resolution/persistence, compact settings layout, Low/Medium rendering, shrine interaction and actual submitted draw counts, and saves screenshots to `.artifacts/v3-*.png`. Browser tests use software WebGL, not the target Intel HD GPU. Normal maps and physically based lighting are intentionally omitted. Surfaces and character remain stylized original procedural art; contact/light pools and cloak motion are approximations, and collision does not permit roof climbing. Actual driver behavior and target 30 FPS remain unverified.

V3 validation completed: dependency installation, production build, 13 tests and all four browser scripts passed; final visual checks were repeated after correcting pine profiles and menu transition layout. A preserved V2 commit supplied a genuine before screenshot. Normal gameplay had no JavaScript runtime errors. The Low sample submitted 86 draw calls/~48k triangles in software WebGL; the Intel HD target's FPS and Vercel deployment outcome were not verified here.
