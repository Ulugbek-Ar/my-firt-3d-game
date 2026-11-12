# Asterfall visual identity — V3

V3 evolves the V1/V2 world; it does not replace its gameplay, save schema, or coordinate layout.

## The visual target

An inhabited border settlement in a cold, old forest. Slate-blue roofs and muted lime plaster sit on moss-dark foundations. Timber and nailed plank doors show use rather than ruin. Amber lanterns identify safe human spaces. The Memory Shrine uses the same weathered materials but has sharper, monumental silhouettes and restrained turquoise inscriptions. Kael's russet cloak is the foreground color anchor.

Use ornament sparingly: the shrine glyph, cloak hem, HUD crest and menu rules share the same angular language. Avoid adding unrelated bright effects to compensate for weak surfaces.

## Palette and surfaces

- Sky and ambient: cold blue-gray, pale distant ridges; restrained fog preserves the road/shrine view.
- Ground: olive forest floor, earth-brown mud, worn gray flagstones; varied vertex color breaks up tiled surfaces.
- Settlement: aged plaster, almost-black timber, slate, rusty fittings, warm glass.
- Shrine: green-gray fissured stone, chiseled epoch marks, faint sea-green light.
- Character: dark leather, flax undercoat, russet textile cloak and tarnished metal.

All artwork is original. `scripts/generate_art.py` builds a deterministic 16-surface atlas and two repeating ground textures. The runtime material library handles UV gutters and assigns surfaces consistently. The art source is committed alongside its PNG outputs. Regeneration requires Pillow only in an authoring environment; players need only the browser.

## Composition rules

Keep the original spawn `(0,19)` and shrine `(0,-16)` sightline open. Ground detail may border the road but must not obstruct keyboard travel. Preserve the four home footprints so legacy saves remain useful. The bell turret, dormer, projecting room and workshop roof differentiate the four homes. Gardens/fences, a guild sign, split logs, fallen branches and epoch votive stones sit at authored locations, not on random playable paths. Any new substantial prop needs collision and a simple camera proxy where applicable.

Menu presentation uses a staged camera inside the clearing, independently of the player camera. Kael and his contact shadow are hidden on the menu and restored on entering the world. Always inspect a rendered screenshot when changing the presentation camera: an acceptable numeric camera position can still put a tree in front of the village.

## Character

Use shaped cloth volumes and rounded limb joints, not stacked cubes. Keep a readable hood/shoulder/cloak silhouette from behind. Walk and run share the existing movement rules but blend different stride amplitude, knee bend, arm swing and torso lean. Idle breathing and a small vertex-driven cloak ripple add life without skeletal/cloth simulation dependencies. Preserve player dimensions and collision radius across art upgrades.

## Rendering budget

- Three.js r160 remains pinned for WebGL1 support. Built-in Lambert/basic materials only; no PBR/normal maps, real-time shadows or postprocessing.
- One 1024² indexed PNG atlas (~0.42 MB download), two 128² ground maps; approximately 5.5 MiB decoded RGBA memory including mipmaps, plus tiny sky/glow textures.
- Static architecture/rocks/trunks are merged by 32m spatial cell, with vertex tint and atlas UVs. Pines and grass remain instanced per cell. This trades a little CPU mesh data for fewer texture/material draw calls and independent chunk frustum culling.
- Entire-world upper bounds before culling: approximately 50.5k environment triangles/64 mesh draws on Low, 61.2k/92 on Medium. These exclude Kael, sprites, particles and the background; they are _not_ hardware benchmarks. The browser visual test instruments actual submitted draws for the sample Low view.
- Low retains all colliding trunks and crowns; optional Medium cover uses a 40m chunk-center detail cutoff. Distant static cells are reduced beyond the preset viewing range; Three.js performs additional frustum culling.
- Low retains its 30 FPS cap and default 80% rendering scale; Medium uses a 60 FPS cap and 100% scale. Users can independently choose 60/80/100% rendering scale. DPR remains capped. Reduced resolution is a performance option, not proof of target-machine FPS.

No claim is made about the Pentium G2020 / Intel HD target until tested on that actual machine.

## UI and loading

All player text is Uzbek. Serif display typography contrasts with compact sans-serif labels. Rules, crests and muted metallic borders replace generic filled browser buttons. Keep keyboard focus visible and reduced-motion behavior supported. Loading progress reflects the three real texture downloads. If texture loading fails, retain playable flat-material fallback and explain it in Uzbek. Keep WebGL capability fallback independent of art loading success.

Render resolution has its own validated localStorage key; legacy game saves remain version 1. Location, objective, health, stamina, memory, FPS and pause controls remain available. Avoid placing decorative overlays across the character or interaction prompt.

## Extending the art

Add new surface names in the atlas/library together, retaining existing tile indices. Test UV bounds after changes. Add environment components through `world.js`, preserving the input/UI/save boundaries. Do not make source-file detail counts the quality gate: capture and inspect menu, gameplay, character, shrine, Low and compact UI after each substantial visual change.

## V3 validation record

Validated in the cloud environment with Node.js 24.22.1, Vite 6.4.6 and headless Chromium software WebGL. Installation, production build and all 13 automated tests passed. The four browser scripts passed against the production preview; the V3 visual script was rerun after the final silhouette/transition corrections. The Low starting view submitted 86 draw calls and 47,994 triangles including character/visible scenery; this is not a measured target-machine frame rate.

Visually inspected captures: loading screen, staged menu, Low and Medium village, Kael crop, Memory Shrine, settings and compact 850×650 layout. A true V2 comparison was captured separately from Git commit `855272b` at 1280×800/Low (`.artifacts/v2-baseline-855272b.png`), without altering current sources. V3 evidence uses `.artifacts/v3-*.png`. The texture generator was rerun and SHA-256 outputs matched byte-for-byte. Runtime errors were absent in normal gameplay; expected missing-WebGL and blocked-texture cases were tested separately as recovery scenarios.
