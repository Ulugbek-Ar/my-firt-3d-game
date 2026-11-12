import * as THREE from "three";

export const SURFACES = Object.freeze([
  "stone",
  "brick",
  "timber",
  "planks",
  "cobble",
  "mud",
  "moss",
  "ground",
  "slate",
  "metal",
  "runes",
  "needles",
  "cloth",
  "plaster",
  "bark",
  "leather",
]);
const art = { atlas: null, ground: null, mud: null };
export function getArt() {
  return art;
}
export async function loadArt(onProgress = () => {}) {
  const loader = new THREE.TextureLoader();
  let complete = 0;
  await Promise.all(
    Object.keys(art).map(async (key) => {
      const name = key === "atlas" ? "asterfall-atlas" : key;
      const texture = await loader.loadAsync(
        `${import.meta.env.BASE_URL}textures/${name}.png`,
      );
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = 1;
      if (key !== "atlas") {
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      }
      art[key] = texture;
      onProgress(++complete / 3);
    }),
  );
}
export function texturedGeometry(geometry, surface) {
  const g = geometry.clone(),
    uv = g.attributes.uv;
  if (!uv) return g;
  const index = SURFACES.indexOf(surface);
  if (index < 0) throw new Error(`Unknown surface: ${surface}`);
  // 4px replicated gutters around each 256px tile keep mip-level seams subtle.
  const inset = 5 / 1024,
    span = 0.25 - inset * 2;
  for (let i = 0; i < uv.count; i++)
    uv.setXY(
      i,
      (index % 4) / 4 + inset + uv.getX(i) * span,
      1 - (Math.floor(index / 4) + 1) / 4 + inset + uv.getY(i) * span,
    );
  return g;
}
export function artMaterial(color, options = {}) {
  return new THREE.MeshLambertMaterial({ color, map: art.atlas, ...options });
}
const TIMBER = new Set([
  0x373b32, 0x414136, 0x383c32, 0x4d4838, 0x343c37, 0x424637, 0x484638,
  0x4c4c3a, 0x3c3c30,
]);
const METAL = new Set([0x303a33, 0x323d37, 0x242f2d, 0xb4995d]);
const SLATE = new Set([0x424e59, 0x3b4954, 0x4e5055, 0x3b5054]);
export function surfaceFor(type, color) {
  if (type === "pine") return "needles";
  if (type === "tuft" || color === 0x344e3f) return "moss";
  if (type === "rock") return "stone";
  if (TIMBER.has(color)) return color === 0x484638 ? "bark" : "timber";
  if (METAL.has(color)) return "metal";
  if (SLATE.has(color) || SLATE.has(color - 0x050504)) return "slate";
  if (color === 0x9a9275) return "plaster";
  if ([0x5b4b36, 0x67523a, 0x66523b, 0x686a55].includes(color)) return "planks";
  if ([0x666b60, 0x697064, 0x5d665d, 0x51574e].includes(color)) return "brick";
  return "stone";
}
