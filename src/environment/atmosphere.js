import * as THREE from "three";
import { groundHeight } from "./terrain.js";

function glowTexture() {
  // Tiny local texture for soft lantern pools; generated once, no network assets.
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 32;
  const context = canvas.getContext("2d");
  if (!context) return null;
  const gradient = context.createRadialGradient(16, 16, 0, 16, 16, 16);
  gradient.addColorStop(0, "#ffffffb0");
  gradient.addColorStop(0.35, "#ffffff40");
  gradient.addColorStop(1, "#ffffff00");
  context.fillStyle = gradient;
  context.fillRect(0, 0, 32, 32);
  return new THREE.CanvasTexture(canvas);
}
export function createAtmosphere(scene, batch, lanterns) {
  scene.fog = new THREE.FogExp2(0x657676, 0.019);
  scene.background = new THREE.Color(0x263943);
  scene.add(new THREE.HemisphereLight(0xaebfd0, 0x4d5746, 1.5));
  const moonlight = new THREE.DirectionalLight(0xc6d5d7, 2.7);
  moonlight.position.set(-22, 35, 16);
  scene.add(moonlight);
  // A tiny gradient background avoids dome clipping on Low's short far plane.
  if (typeof document !== "undefined") {
    const canvas = document.createElement("canvas");
    canvas.width = 2;
    canvas.height = 128;
    const context = canvas.getContext("2d");
    if (context) {
      const gradient = context.createLinearGradient(0, 0, 0, 128);
      gradient.addColorStop(0, "#152734");
      gradient.addColorStop(0.35, "#526569");
      gradient.addColorStop(0.55, "#657676");
      gradient.addColorStop(1, "#657676");
      context.fillStyle = gradient;
      context.fillRect(0, 0, 2, 128);
      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      scene.background = texture;
    }
  }
  const moon = new THREE.Mesh(
    new THREE.SphereGeometry(2.6, 12, 8),
    new THREE.MeshBasicMaterial({ color: 0xe5dfba, fog: false }),
  );
  moon.position.set(-30, 40, -72);
  scene.add(moon);
  // A distant sawtooth ridgeline gives the village a sheltered, deliberate backdrop.
  for (let i = 0; i < 14; i++) {
    const x = -70 + i * 11,
      h = 16 + Math.sin(i * 2.3) * 7;
    batch.add(
      "cone",
      0x465c61,
      x,
      h * 0.36,
      -77 - Math.cos(i) * 4,
      15,
      h,
      11,
      0,
      i * 0.7,
    );
  }
  const texture = glowTexture();
  const glowMaterial = new THREE.SpriteMaterial({
    map: texture,
    color: 0xffba63,
    transparent: true,
    opacity: 0.45,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const poolMaterial = new THREE.MeshBasicMaterial({
    map: texture,
    color: 0xe4ad60,
    blending: THREE.AdditiveBlending,
    transparent: true,
    opacity: 0.3,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -1,
  });
  const flameMaterial = new THREE.MeshBasicMaterial({ color: 0xffd18b });
  const flames = [];
  const flameGeometry = new THREE.BoxGeometry(0.2, 0.32, 0.2);
  const poolGeometry = new THREE.PlaneGeometry(4.6, 4.6);
  for (const [x, y, z] of lanterns) {
    batch.add("box", 0x303a33, x, y + 0.32, z, 0.09, 0.52, 0.09);
    batch.add("box", 0x303a33, x, y, z, 0.38, 0.55, 0.34);
    const flame = new THREE.Mesh(flameGeometry, flameMaterial);
    flame.position.set(x, y, z + 0.08);
    scene.add(flame);
    batch.add("cone", 0x41473a, x, y + 0.36, z, 0.33, 0.2, 0.3);
    const glow = new THREE.Sprite(glowMaterial);
    glow.position.set(x, y, z + 0.12);
    glow.scale.set(2.1, 2.1, 1);
    scene.add(glow);
    const pool = new THREE.Mesh(poolGeometry, poolMaterial);
    pool.rotation.x = -Math.PI / 2;
    pool.position.set(x, groundHeight(x, z) + 0.06, z);
    scene.add(pool);
    flames.push(glow);
  }
  return {
    update(time) {
      glowMaterial.opacity = 0.38 + Math.sin(time * 3.1) * 0.035;
    },
    flames,
  };
}
