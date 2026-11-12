export function overlaps(x, z, radius, box) {
  const nx = Math.max(box.minX, Math.min(x, box.maxX));
  const nz = Math.max(box.minZ, Math.min(z, box.maxZ));
  return (x - nx) ** 2 + (z - nz) ** 2 < radius ** 2;
}
export function canOccupy(x, z, colliders, radius = 0.42) {
  return (
    Math.abs(x) < 46 &&
    Math.abs(z) < 46 &&
    !colliders.some((box) => overlaps(x, z, radius, box))
  );
}

// Visual upgrades can add a tree where an old save stood. Nudge to nearby free ground.
export function resolveSavedPosition(position, colliders, fallback) {
  if (canOccupy(position.x, position.z, colliders)) return position;
  const x = Math.max(-45.4, Math.min(45.4, position.x));
  const z = Math.max(-45.4, Math.min(45.4, position.z));
  for (let radius = 0.5; radius <= 8; radius += 0.5) {
    for (let step = 0; step < 16; step++) {
      const angle = (step * Math.PI) / 8;
      const nx = x + Math.cos(angle) * radius,
        nz = z + Math.sin(angle) * radius;
      if (canOccupy(nx, nz, colliders)) return { x: nx, y: 0, z: nz };
    }
  }
  return fallback;
}
