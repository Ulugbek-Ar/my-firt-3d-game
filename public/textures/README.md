# Asterfall original surface library

All images are original procedural artwork authored for this repository. No photographs, stock models, remote asset services, third-party fonts, or unlicensed source images are used.

- `asterfall-atlas.png`: optimized indexed PNG, 1024×1024, sixteen 256px tiles with 4px duplicated gutters. Row-major order: weathered stone, brick, timber, planks, cobble, mud, moss, forest ground, slate, metal, carved runes, needles, woven cloth, plaster, bark, stitched leather.
- `ground.png`, `mud.png`: 128×128 repeating detail surfaces for world-space terrain/path UVs.
- Regenerate with `python3 scripts/generate_art.py` (Python + Pillow, authoring only; no Python dependency in the shipped game).

The material library uses Three.js built-in Lambert/basic shaders. Texture-defined cracks, seams, highlights and grime provide baked-looking relief; these are color maps, not normal/PBR maps. The atlas plus repeating maps use approximately 5.5 MiB of RGBA texture memory including mipmaps, irrespective of PNG transfer compression. No normal maps are loaded, to keep the WebGL1/Low path inexpensive.
