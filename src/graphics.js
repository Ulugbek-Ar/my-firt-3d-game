import * as THREE from "three";
import { PRESETS } from "./state.js";
export function createGraphics(canvas, quality) {
  // r160 is intentionally retained for WebGL1 support; modern releases require WebGL2.
  const attributes = {
    antialias: false,
    alpha: false,
    powerPreference: "low-power",
  };
  const context =
    canvas.getContext("webgl2", attributes) ||
    canvas.getContext("webgl", attributes);
  if (!context) throw new Error("WEBGL_UNAVAILABLE");
  const isWebGL2 =
    typeof WebGL2RenderingContext !== "undefined" &&
    context instanceof WebGL2RenderingContext;
  if (!isWebGL2 && !context.getExtension("ANGLE_instanced_arrays"))
    throw new Error("INSTANCING_UNAVAILABLE");
  const renderer = new THREE.WebGLRenderer({ canvas, context, ...attributes });
  renderer.setClearColor(0x17282c);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = false;
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x243737, 0.025);
  const camera = new THREE.PerspectiveCamera(55, 1, 0.15, 100);
  const graphics = {
    renderer,
    scene,
    camera,
    quality,
    resize() {
      const p = PRESETS[this.quality];
      renderer.setPixelRatio(
        Math.min(window.devicePixelRatio || 1, p.pixelRatio) * p.scale,
      );
      renderer.setSize(window.innerWidth, window.innerHeight, false);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.far = p.far;
      camera.updateProjectionMatrix();
    },
    setQuality(value) {
      this.quality = value;
      this.resize();
    },
  };
  window.addEventListener("resize", () => graphics.resize());
  graphics.resize();
  return graphics;
}
