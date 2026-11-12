import * as THREE from "three";

// Procedural traveler silhouette: hood, layered coat, leather straps and a split cloak.
export function createCharacter() {
  const root = new THREE.Group(),
    body = new THREE.Group();
  root.add(body);
  const materials = {
    coat: new THREE.MeshLambertMaterial({ color: 0x776e54, flatShading: true }),
    cloak: new THREE.MeshLambertMaterial({
      color: 0x70473e,
      flatShading: true,
      side: THREE.DoubleSide,
    }),
    leather: new THREE.MeshLambertMaterial({
      color: 0x383b32,
      flatShading: true,
    }),
    metal: new THREE.MeshLambertMaterial({
      color: 0x9c9f8e,
      flatShading: true,
    }),
    hood: new THREE.MeshLambertMaterial({ color: 0x575b49, flatShading: true }),
    face: new THREE.MeshLambertMaterial({ color: 0x252f2d }),
    skin: new THREE.MeshLambertMaterial({ color: 0xb3a384 }),
    clasp: new THREE.MeshBasicMaterial({ color: 0xcab679 }),
  };
  function part(parent, geometry, material, x, y, z) {
    const mesh = new THREE.Mesh(geometry, materials[material]);
    mesh.position.set(x, y, z);
    parent.add(mesh);
    return mesh;
  }
  part(
    body,
    new THREE.CylinderGeometry(0.29, 0.38, 0.65, 6),
    "coat",
    0,
    1.28,
    0,
  );
  part(
    body,
    new THREE.CylinderGeometry(0.33, 0.45, 0.46, 7),
    "coat",
    0,
    0.83,
    0,
  );
  part(body, new THREE.BoxGeometry(0.68, 0.11, 0.42), "leather", 0, 1.04, 0);
  part(body, new THREE.BoxGeometry(0.15, 0.13, 0.06), "clasp", 0, 1.04, 0.24);
  part(
    body,
    new THREE.BoxGeometry(0.12, 0.8, 0.07),
    "leather",
    -0.07,
    1.34,
    0.28,
  ).rotation.z = -0.45;
  part(
    body,
    new THREE.CylinderGeometry(0.11, 0.12, 0.15, 6),
    "skin",
    0,
    1.67,
    0,
  );
  part(
    body,
    new THREE.IcosahedronGeometry(0.3, 1),
    "hood",
    0,
    1.94,
    -0.015,
  ).scale.set(1, 1.15, 1);
  part(body, new THREE.BoxGeometry(0.31, 0.31, 0.06), "face", 0, 1.94, 0.235);
  part(body, new THREE.BoxGeometry(0.21, 0.12, 0.06), "skin", 0, 1.96, 0.27);
  part(body, new THREE.BoxGeometry(0.32, 0.16, 0.13), "hood", 0, 1.82, 0.25);
  for (const side of [-1, 1])
    part(
      body,
      new THREE.IcosahedronGeometry(0.24, 0),
      "metal",
      side * 0.38,
      1.53,
      0,
    ).scale.set(1.15, 0.65, 1);
  const legs = [],
    arms = [];
  for (const side of [-1, 1]) {
    const leg = new THREE.Group();
    leg.position.set(side * 0.18, 0.78, 0);
    root.add(leg);
    legs.push(leg);
    part(leg, new THREE.BoxGeometry(0.22, 0.43, 0.24), "leather", 0, -0.19, 0);
    part(
      leg,
      new THREE.BoxGeometry(0.24, 0.3, 0.28),
      "leather",
      0,
      -0.53,
      0.02,
    );
    part(
      leg,
      new THREE.BoxGeometry(0.24, 0.15, 0.39),
      "leather",
      0,
      -0.69,
      0.07,
    );
    part(leg, new THREE.BoxGeometry(0.17, 0.17, 0.04), "metal", 0, -0.39, 0.15);
    const arm = new THREE.Group();
    arm.position.set(side * 0.43, 1.48, 0);
    body.add(arm);
    arms.push(arm);
    part(
      arm,
      new THREE.BoxGeometry(0.18, 0.45, 0.22),
      "coat",
      side * 0.025,
      -0.18,
      0,
    );
    part(
      arm,
      new THREE.BoxGeometry(0.2, 0.22, 0.24),
      "leather",
      side * 0.025,
      -0.45,
      0,
    );
    part(
      arm,
      new THREE.IcosahedronGeometry(0.12, 0),
      "skin",
      side * 0.025,
      -0.61,
      0.02,
    );
  }
  // A hinged, irregular hem moves as one cheap rigid mesh instead of cloth simulation.
  const capeGeometry = new THREE.BufferGeometry();
  capeGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(
      [
        -0.37, 0, 0, -0.55, -0.96, -0.2, 0, -0.75, -0.36, -0.37, 0, 0, 0, -0.75,
        -0.36, 0.37, 0, 0, 0.37, 0, 0, 0, -0.75, -0.36, 0.48, -1.05, -0.19,
      ],
      3,
    ),
  );
  capeGeometry.computeVertexNormals();
  const cape = part(body, capeGeometry, "cloak", 0, 1.61, -0.25);
  part(
    body,
    new THREE.BoxGeometry(0.28, 0.38, 0.2),
    "leather",
    0.38,
    0.96,
    -0.09,
  );
  // Small memory talisman, deliberately visible even in the darkest forest.
  part(body, new THREE.IcosahedronGeometry(0.07, 0), "clasp", 0, 1.48, 0.31);
  return {
    root,
    animate(time, moving, running, airborne) {
      const stride = moving ? (running ? 0.65 : 0.42) : 0;
      legs.forEach((leg, i) => {
        leg.rotation.x = Math.sin(time + i * Math.PI) * stride;
      });
      arms.forEach((arm, i) => {
        arm.rotation.x = -Math.sin(time + i * Math.PI) * stride * 0.7;
      });
      body.position.y = moving
        ? Math.abs(Math.sin(time)) * 0.035
        : Math.sin(time * 0.35) * 0.008;
      cape.rotation.x =
        -0.08 -
        (running ? 0.2 : 0.05) -
        Math.sin(time * 0.7) * 0.06 -
        (airborne ? 0.15 : 0);
    },
  };
}
