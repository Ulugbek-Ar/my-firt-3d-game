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
