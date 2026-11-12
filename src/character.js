import * as THREE from "three";
import { artMaterial, texturedGeometry } from "./art/materials.js";

export function createCharacter() {
  const root = new THREE.Group(),
    body = new THREE.Group();
  root.add(body);
  const surfaces = {
    coat: "cloth",
    cloak: "cloth",
    leather: "leather",
    metal: "metal",
    hood: "cloth",
  };
  const materials = {
    coat: artMaterial(0x93866a),
    cloak: artMaterial(0x9a5146, { side: THREE.DoubleSide }),
    leather: artMaterial(0x4a4235),
    metal: artMaterial(0xaaa589),
    hood: artMaterial(0x68654e),
    face: new THREE.MeshLambertMaterial({ color: 0x202a29 }),
    skin: new THREE.MeshLambertMaterial({ color: 0xb9a88b }),
    clasp: new THREE.MeshBasicMaterial({ color: 0xbeb48b }),
  };
  function part(parent, geometry, material, x, y, z) {
    const g = surfaces[material]
      ? texturedGeometry(geometry, surfaces[material])
      : geometry;
    const mesh = new THREE.Mesh(g, materials[material]);
    mesh.position.set(x, y, z);
    parent.add(mesh);
    return mesh;
  }
  const lathe = (points, segments = 8) =>
    new THREE.LatheGeometry(
      points.map(([r, y]) => new THREE.Vector2(r, y)),
      segments,
    );
  // Tailored torso and a flared coat, rather than intersecting boxes.
  part(
    body,
    lathe([
      [0.26, -0.3],
      [0.28, -0.15],
      [0.32, 0.18],
      [0.23, 0.36],
    ]),
    "coat",
    0,
    1.23,
    0,
  ).scale.z = 0.72;
  part(
    body,
    lathe([
      [0.44, -0.23],
      [0.36, 0.08],
      [0.28, 0.26],
    ]),
    "coat",
    0,
    0.9,
    0,
  ).scale.z = 0.72;
  part(
    body,
    new THREE.CylinderGeometry(0.295, 0.3, 0.105, 10),
    "leather",
    0,
    1.06,
    0,
  ).scale.z = 0.8;
  part(body, new THREE.BoxGeometry(0.13, 0.12, 0.04), "metal", 0, 1.06, 0.25);
  part(
    body,
    new THREE.BoxGeometry(0.075, 0.74, 0.035),
    "leather",
    -0.08,
    1.36,
    0.245,
  ).rotation.z = -0.38;
  part(
    body,
    new THREE.CylinderGeometry(0.1, 0.11, 0.15, 8),
    "skin",
    0,
    1.69,
    0,
  );
  part(
    body,
    lathe(
      [
        [0, -0.22],
        [0.2, -0.22],
        [0.25, -0.04],
        [0.24, 0.15],
        [0.15, 0.29],
        [0, 0.32],
      ],
      10,
    ),
    "hood",
    0,
    1.92,
    -0.025,
  ).scale.z = 0.93;
  part(
    body,
    new THREE.CircleGeometry(0.185, 8),
    "face",
    0,
    1.95,
    0.205,
  ).scale.y = 1.1;
  part(
    body,
    new THREE.SphereGeometry(0.12, 8, 6),
    "skin",
    0,
    1.96,
    0.235,
  ).scale.set(1, 0.95, 0.58);
  part(body, new THREE.BoxGeometry(0.25, 0.105, 0.11), "hood", 0, 1.83, 0.23);
  const thighs = [],
    shins = [],
    arms = [];
  for (const side of [-1, 1]) {
    const plate = part(
      body,
      new THREE.SphereGeometry(0.22, 6, 4, 0, Math.PI * 2, 0, Math.PI * 0.65),
      "metal",
      side * 0.35,
      1.48,
      0,
    );
    plate.scale.set(1.05, 0.6, 1);
    plate.rotation.z = side * -0.22;
    const thigh = new THREE.Group();
    thigh.position.set(side * 0.16, 0.8, 0);
    root.add(thigh);
    thighs.push(thigh);
    part(
      thigh,
      new THREE.CylinderGeometry(0.115, 0.095, 0.38, 7),
      "leather",
      0,
      -0.17,
      0,
    );
    const shin = new THREE.Group();
    shin.position.y = -0.34;
    thigh.add(shin);
    shins.push(shin);
    part(
      shin,
      new THREE.CylinderGeometry(0.11, 0.09, 0.34, 7),
      "leather",
      0,
      -0.17,
      0,
    );
    part(
      shin,
      new THREE.SphereGeometry(0.13, 6, 4),
      "metal",
      0,
      -0.01,
      0.055,
    ).scale.set(0.85, 1, 0.5);
    part(
      shin,
      new THREE.BoxGeometry(0.19, 0.13, 0.32),
      "leather",
      0,
      -0.34,
      0.055,
    );
    const arm = new THREE.Group();
    arm.position.set(side * 0.38, 1.47, 0);
    body.add(arm);
    arms.push(arm);
    part(
      arm,
      new THREE.CylinderGeometry(0.11, 0.09, 0.36, 7),
      "coat",
      side * 0.035,
      -0.17,
      0,
    );
    part(
      arm,
      new THREE.CylinderGeometry(0.1, 0.085, 0.25, 7),
      "leather",
      side * 0.035,
      -0.43,
      0.015,
    ).rotation.x = -0.12;
    part(
      arm,
      new THREE.SphereGeometry(0.095, 6, 4),
      "leather",
      side * 0.035,
      -0.6,
      0.04,
    );
  }
  // Original tailored cloak, with a scalloped hem and a small CPU-driven fold animation.
  const columns = 6,
    rows = 5,
    vertices = [],
    uv = [],
    indices = [],
    rest = [];
  for (let row = 0; row <= rows; row++)
    for (let col = 0; col <= columns; col++) {
      const u = col / columns,
        v = row / rows,
        x = (u - 0.5) * (0.64 + v * 0.42),
        y = -v * 1.05 + (row === rows ? 0.045 * Math.sin(col * 2) : 0),
        z = -v * 0.16 - 0.045 * Math.cos(u * Math.PI * 4);
      vertices.push(x, y, z);
      rest.push(x, y, z);
      uv.push(u, 1 - v);
      if (row && col < columns) {
        const i = row * (columns + 1) + col;
        indices.push(
          i,
          i + 1,
          i - columns - 1,
          i + 1,
          i - columns,
          i - columns - 1,
        );
      }
    }
  const cloakGeometry = new THREE.BufferGeometry();
  cloakGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(vertices, 3),
  );
  cloakGeometry.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  cloakGeometry.setIndex(indices);
  cloakGeometry.computeVertexNormals();
  const cape = part(body, cloakGeometry, "cloak", 0, 1.61, -0.23);
  part(body, new THREE.BoxGeometry(0.23, 0.3, 0.15), "leather", 0.34, 1, -0.01);
  part(body, new THREE.TorusGeometry(0.06, 0.018, 4, 8), "metal", 0, 1.5, 0.27);
  let blend = 0;
  return {
    root,
    animate(time, moving, running, airborne) {
      blend += (Number(moving) - blend) * 0.15;
      const stride = (running ? 0.68 : 0.43) * blend;
      thighs.forEach((leg, i) => {
        const phase = time + i * Math.PI;
        leg.rotation.x = Math.sin(phase) * stride;
        shins[i].rotation.x =
          Math.max(0, -Math.sin(phase)) * (running ? 0.75 : 0.36) * blend;
      });
      arms.forEach((arm, i) => {
        arm.rotation.x = -Math.sin(time + i * Math.PI) * stride * 0.75 - 0.09;
        arm.rotation.z = (i ? 1 : -1) * (0.05 + blend * 0.03);
      });
      body.position.y =
        Math.abs(Math.sin(time)) * blend * 0.028 +
        Math.sin(time * 0.8) * (1 - blend) * 0.012;
      body.rotation.x = running ? 0.08 * blend : 0;
      const position = cape.geometry.attributes.position;
      for (let i = 0; i < position.count; i++) {
        const v = Math.floor(i / (columns + 1)) / rows;
        position.setZ(
          i,
          rest[i * 3 + 2] -
            v * (running ? 0.24 : 0.05) +
            Math.sin(time * 0.75 + i * 0.35) * 0.045 * v +
            (airborne ? -0.1 * v : 0),
        );
      }
      position.needsUpdate = true;
    },
  };
}
