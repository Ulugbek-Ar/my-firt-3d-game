import * as THREE from "three";
import { createTerrain, groundHeight } from "./environment/terrain.js";
import { EnvironmentBatch } from "./environment/batches.js";
import { createBuildings } from "./environment/buildings.js";
import { createForest } from "./environment/forest.js";
import { createShrine } from "./environment/shrine.js";
import { createAtmosphere } from "./environment/atmosphere.js";

export const SHRINE = Object.freeze({ x: 0, z: -16 });
export function createWorld(scene, quality = "low") {
  const colliders = [],
    cameraObstacles = [],
    lanterns = [];
  const batch = new EnvironmentBatch(scene),
    details = new EnvironmentBatch(scene);
  const proxyGeometry = new THREE.BoxGeometry(1, 1, 1),
    proxyMaterial = new THREE.MeshBasicMaterial();
  function addSolid(x, y, z, w, h, d) {
    colliders.push({
      minX: x - w / 2,
      maxX: x + w / 2,
      minZ: z - d / 2,
      maxZ: z + d / 2,
    });
    addCameraObstacle(x, y, z, w, h, d);
  }
  function addCameraObstacle(x, y, z, w, h, d) {
    // Simplified raycast-only proxies: detail geometry never enters the camera query.
    const proxy = new THREE.Mesh(proxyGeometry, proxyMaterial);
    proxy.position.set(x, y, z);
    proxy.scale.set(w, h, d);
    proxy.updateMatrixWorld();
    cameraObstacles.push(proxy);
  }
  const terrain = createTerrain(scene);
  createBuildings(batch, addSolid, lanterns, addCameraObstacle);
  const trees = createForest(batch, details, addSolid);
  const shrine = createShrine(scene, batch, addSolid, SHRINE);
  for (const [x, z] of [
    [-3.3, 17],
    [3.4, -8],
    [-4.6, -13],
  ]) {
    const y = groundHeight(x, z);
    batch.add("cylinder", 0x424637, x, y + 1.4, z, 0.09, 2.8, 0.09);
    batch.add("box", 0x424637, x + 0.25, y + 2.8, z, 0.65, 0.12, 0.12);
    lanterns.push([x + 0.5, y + 2.55, z]);
    addSolid(x, y + 1.3, z, 0.2, 2.6, 0.2);
  }
  const atmosphere = createAtmosphere(scene, batch, lanterns);
  batch.finish();
  const detailMeshes = details.finish();
  const world = {
    colliders,
    cameraObstacles,
    groundHeight,
    shrine: SHRINE,
    stats: { trees },
    setQuality(value) {
      detailMeshes.forEach((m) => {
        m.visible = value === "medium";
      });
      shrine.motes.visible = value === "medium";
    },
    update(time) {
      shrine.update(time);
      atmosphere.update(time);
    },
    terrain,
  };
  world.setQuality(quality);
  world.update(0);
  return world;
}
