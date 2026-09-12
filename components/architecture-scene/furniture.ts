import * as THREE from "three";

import type { Kit } from "./kit";
import { EMBER_DIM, LINE, LINE_DIM, LINE_FAINT, MINT } from "./palette";

/**
 * Furniture + decoration builders for the frontend interiors (round 20).
 * Every builder takes the floor's top surface `fy` and stands its object
 * on it; `rot` turns the object about Y (0 = its front faces +Z). Round
 * parts use the kit's silhouette tubes so they keep proper edges.
 */

function rotated(kit: Kit, g: THREE.Group, x: number, y: number, z: number, rot: number) {
  g.rotation.y = rot;
  return kit.place(g, x, y, z);
}

export function desk(kit: Kit, x: number, fy: number, z: number, w = 1.4, d = 0.7, rot = 0) {
  const g = new THREE.Group();
  g.add(kit.boxAt(0, 0.72, 0, w, 0.06, d, LINE, 0.7));
  g.add(kit.boxAt(-w / 2 + 0.04, 0.35, 0, 0.06, 0.7, d - 0.1, LINE_DIM, 0.55));
  g.add(kit.boxAt(w / 2 - 0.04, 0.35, 0, 0.06, 0.7, d - 0.1, LINE_DIM, 0.55));
  kit.world.add(rotated(kit, g, x, fy, z, rot));
}

/** Office chair: seat + back on a post with a base ring. Front faces +Z. */
export function chair(kit: Kit, x: number, fy: number, z: number, rot = 0, color = LINE_DIM) {
  const g = new THREE.Group();
  g.add(kit.boxAt(0, 0.46, 0, 0.44, 0.07, 0.44, color, 0.6));
  g.add(kit.boxAt(0, 0.75, -0.2, 0.44, 0.5, 0.06, color, 0.6));
  g.add(kit.lines([0, 0.05, 0, 0, 0.42, 0], color, 0.6));
  g.add(kit.ringXZ(0, 0.03, 0, 0.22, color, 0.5, 16));
  kit.world.add(rotated(kit, g, x, fy, z, rot));
}

export function sofa(kit: Kit, x: number, fy: number, z: number, w = 1.8, rot = 0) {
  const g = new THREE.Group();
  g.add(kit.boxAt(0, 0.22, 0.05, w, 0.44, 0.75, LINE, 0.65));
  g.add(kit.boxAt(0, 0.6, -0.28, w, 0.4, 0.2, LINE, 0.65));
  // arms stop short of the backrest so the two boxes don't interpenetrate
  g.add(kit.boxAt(-w / 2 + 0.1, 0.5, 0.15, 0.2, 0.2, 0.55, LINE, 0.65));
  g.add(kit.boxAt(w / 2 - 0.1, 0.5, 0.15, 0.2, 0.2, 0.55, LINE, 0.65));
  kit.world.add(rotated(kit, g, x, fy, z, rot));
}

export function lowTable(kit: Kit, x: number, fy: number, z: number, w = 1.0, d = 0.55) {
  const g = new THREE.Group();
  g.add(kit.boxAt(0, 0.42, 0, w, 0.05, d, LINE, 0.7));
  const pts: number[] = [];
  [-1, 1].forEach((sx) => [-1, 1].forEach((sz) => pts.push(sx * (w / 2 - 0.06), 0, sz * (d / 2 - 0.06), sx * (w / 2 - 0.06), 0.4, sz * (d / 2 - 0.06))));
  g.add(kit.lines(pts, LINE_DIM, 0.6));
  kit.world.add(kit.place(g, x, fy, z));
}

/** Big meeting table on two pedestals. */
export function meetingTable(kit: Kit, x: number, fy: number, z: number, w = 3.2, d = 1.4) {
  kit.world.add(kit.boxAt(x, fy + 0.73, z, w, 0.07, d, LINE, 0.75));
  [-w / 4, w / 4].forEach((dx) => kit.world.add(kit.boxAt(x + dx, fy + 0.35, z, 0.5, 0.7, 0.5, LINE_DIM, 0.55)));
}

/** Reception counter: an L of two blocks with a raised front ledge. */
export function receptionDesk(kit: Kit, x: number, fy: number, z: number, rot = 0) {
  const g = new THREE.Group();
  g.add(kit.boxAt(0, 0.52, 0, 2.2, 1.04, 0.55, LINE, 0.75));
  g.add(kit.boxAt(-1.1 + 0.275, 0.52, -0.75, 0.55, 1.04, 0.95, LINE, 0.75));
  g.add(kit.boxAt(0, 1.08, 0.05, 2.3, 0.06, 0.65, LINE_DIM, 0.7));
  kit.world.add(rotated(kit, g, x, fy, z, rot));
}

/** Potted plant: pot cylinder, stem, low-poly foliage ball. */
export function plant(kit: Kit, x: number, fy: number, z: number, s = 1) {
  kit.vCyl(x, fy, z, 0.18 * s, 0.3 * s, LINE_DIM, 0.7);
  kit.world.add(kit.lines([x, fy + 0.3 * s, z, x, fy + 0.75 * s, z], MINT, 0.7));
  kit.world.add(kit.place(kit.edged(new THREE.IcosahedronGeometry(0.32 * s, 0), MINT, 0.6, 8), x, fy + 0.95 * s, z));
}

/** Pendant light hanging from the ceiling: cord + cone shade with a rim. */
export function pendant(kit: Kit, x: number, ceil: number, z: number) {
  const top = new THREE.Vector3(x, ceil - 0.5, z);
  const bottom = new THREE.Vector3(x, ceil - 0.78, z);
  kit.world.add(kit.lines([x, ceil, z, x, ceil - 0.5, z], LINE_DIM, 0.6));
  kit.tube(top, bottom, 0.05, 0.22, EMBER_DIM, 0.85);
  kit.endRing(bottom, new THREE.Vector3(0, -1, 0), 0.22, EMBER_DIM, 0.85);
}

/** Recessed ceiling light panel (outline only). */
export function ceilingPanel(kit: Kit, x: number, ceil: number, z: number, w = 1.2, d = 0.4) {
  const y = ceil - 0.01;
  kit.world.add(kit.lines([x - w / 2, y, z - d / 2, x + w / 2, y, z - d / 2, x + w / 2, y, z - d / 2, x + w / 2, y, z + d / 2, x + w / 2, y, z + d / 2, x - w / 2, y, z + d / 2, x - w / 2, y, z + d / 2, x - w / 2, y, z - d / 2], EMBER_DIM, 0.7));
}

/** Framed picture flush on a wall; `rot` sets which wall it faces away from. */
export function painting(kit: Kit, x: number, y: number, z: number, w = 0.8, h = 0.55, rot = 0) {
  const g = new THREE.Group();
  g.add(kit.boxAt(0, 0, 0, w, h, 0.04, LINE, 0.7));
  const iw = w - 0.14;
  const ih = h - 0.14;
  g.add(kit.lines([-iw / 2, -ih / 2, 0.025, iw / 2, -ih / 2, 0.025, iw / 2, -ih / 2, 0.025, iw / 2, ih / 2, 0.025, iw / 2, ih / 2, 0.025, -iw / 2, ih / 2, 0.025, -iw / 2, ih / 2, 0.025, -iw / 2, -ih / 2, 0.025], LINE_DIM, 0.6));
  kit.world.add(rotated(kit, g, x, y, z, rot));
}

/** Whiteboard / screen on a wall. */
export function board(kit: Kit, x: number, y: number, z: number, w = 2.4, h = 1.3, rot = 0) {
  const g = new THREE.Group();
  g.add(kit.boxAt(0, 0, 0, w, h, 0.05, LINE, 0.8));
  g.add(kit.lines([-w / 2 + 0.08, -h / 2 + 0.08, 0.03, w / 2 - 0.08, -h / 2 + 0.08, 0.03, w / 2 - 0.08, -h / 2 + 0.08, 0.03, w / 2 - 0.08, h / 2 - 0.08, 0.03, w / 2 - 0.08, h / 2 - 0.08, 0.03, -w / 2 + 0.08, h / 2 - 0.08, 0.03, -w / 2 + 0.08, h / 2 - 0.08, 0.03, -w / 2 + 0.08, -h / 2 + 0.08, 0.03], LINE_DIM, 0.5));
  kit.world.add(rotated(kit, g, x, y, z, rot));
}

/** Ceiling-hung projector with a faint beam to the four corners of a board. */
export function projector(kit: Kit, x: number, ceil: number, z: number, boardCorners: THREE.Vector3[]) {
  const y = ceil - 0.32;
  kit.world.add(kit.lines([x, ceil, z, x, y + 0.07, z], LINE_DIM, 0.6));
  kit.world.add(kit.boxAt(x, y, z, 0.36, 0.14, 0.28, LINE, 0.75));
  const pts: number[] = [];
  boardCorners.forEach((c) => pts.push(x, y, z, c.x, c.y, c.z));
  kit.world.add(kit.lines(pts, LINE_FAINT, 0.55));
}

export function cupboard(kit: Kit, x: number, fy: number, z: number, w = 1.2, h = 0.9, d = 0.45, rot = 0) {
  const g = new THREE.Group();
  g.add(kit.boxAt(0, h / 2, 0, w, h, d, LINE, 0.7));
  g.add(kit.lines([0, 0.05, d / 2 + 0.01, 0, h - 0.05, d / 2 + 0.01, -0.08, h * 0.55, d / 2 + 0.01, -0.08, h * 0.45, d / 2 + 0.01, 0.08, h * 0.55, d / 2 + 0.01, 0.08, h * 0.45, d / 2 + 0.01], LINE_DIM, 0.6));
  kit.world.add(rotated(kit, g, x, fy, z, rot));
}

/** Open bookshelf: wire box with shelves and a few book blocks. */
export function bookshelf(kit: Kit, x: number, fy: number, z: number, w = 1.2, h = 1.8, d = 0.35, rot = 0) {
  const g = new THREE.Group();
  g.add(kit.wireBox(0, h / 2, 0, w, h, d, LINE, 0.7));
  const pts: number[] = [];
  for (let i = 1; i < 4; i++) pts.push(-w / 2, (h / 4) * i, -d / 2, w / 2, (h / 4) * i, -d / 2, -w / 2, (h / 4) * i, d / 2, w / 2, (h / 4) * i, d / 2);
  g.add(kit.lines(pts, LINE_DIM, 0.6));
  [0, 1, 2].forEach((i) => g.add(kit.boxAt(-w / 2 + 0.25 + i * 0.2, (h / 4) * (i + 1) + 0.16, 0, 0.3, 0.3, d - 0.08, LINE_DIM, 0.5)));
  kit.world.add(rotated(kit, g, x, fy, z, rot));
}

export function waterCooler(kit: Kit, x: number, fy: number, z: number) {
  kit.world.add(kit.boxAt(x, fy + 0.45, z, 0.34, 0.9, 0.34, LINE, 0.7));
  kit.vCyl(x, fy + 0.92, z, 0.13, 0.36, LINE_DIM, 0.7);
}

export function wallClock(kit: Kit, x: number, y: number, z: number, normal: THREE.Vector3) {
  kit.endRing(new THREE.Vector3(x, y, z), normal, 0.16, LINE, 0.8);
  kit.world.add(kit.lines([x, y, z, x, y + 0.1, z, x, y, z, x + normal.z * 0.07, y, z - normal.x * 0.07], LINE_DIM, 0.7));
}

/** Rug: rectangle outline just above the floor. */
export function rug(kit: Kit, x: number, fy: number, z: number, w: number, d: number) {
  const y = fy + 0.005;
  kit.world.add(kit.lines([x - w / 2, y, z - d / 2, x + w / 2, y, z - d / 2, x + w / 2, y, z - d / 2, x + w / 2, y, z + d / 2, x + w / 2, y, z + d / 2, x - w / 2, y, z + d / 2, x - w / 2, y, z + d / 2, x - w / 2, y, z - d / 2], LINE_FAINT, 0.7));
}

/** Double entrance door glyph: `side` ±1 for a wall whose normal is ±X, 0 for a ±Z wall. */
export function doubleDoor(kit: Kit, x: number, fy: number, z: number, side: 1 | -1 | 0) {
  const w = 1.8;
  const h = 2.2;
  const g = kit.lines([-w / 2, 0, 0, w / 2, 0, 0, w / 2, 0, 0, w / 2, h, 0, w / 2, h, 0, -w / 2, h, 0, -w / 2, h, 0, -w / 2, 0, 0, 0, 0, 0, 0, h, 0, -0.1, h / 2, 0, -0.1, h / 2 + 0.2, 0, 0.1, h / 2, 0, 0.1, h / 2 + 0.2, 0], LINE, 0.8);
  g.rotation.y = side * (Math.PI / 2);
  kit.world.add(kit.place(g, x, fy, z));
}

/** Round bistro table with two chairs, optionally under a parasol (balcony / terrace). */
export function parasolTable(kit: Kit, x: number, fy: number, z: number, rot = 0, parasol = true) {
  kit.vCyl(x, fy, z, 0.05, 0.7, LINE_DIM, 0.7);
  kit.tube(new THREE.Vector3(x, fy + 0.7, z), new THREE.Vector3(x, fy + 0.74, z), 0.42, 0.42, LINE, 0.8);
  kit.world.add(kit.ringXZ(x, fy + 0.74, z, 0.42, LINE, 0.8));
  kit.world.add(kit.ringXZ(x, fy + 0.7, z, 0.42, LINE, 0.8));
  const dx = Math.cos(rot) * 0.75;
  const dz = -Math.sin(rot) * 0.75;
  chair(kit, x - dx, fy, z - dz, Math.PI / 2 + rot);
  chair(kit, x + dx, fy, z + dz, -Math.PI / 2 + rot);
  if (!parasol) return;
  kit.vCyl(x, fy + 0.74, z, 0.03, 1.3, LINE_DIM, 0.7);
  const rim = new THREE.Vector3(x, fy + 1.85, z);
  kit.tube(rim, new THREE.Vector3(x, fy + 2.25, z), 1.0, 0.03, LINE, 0.8);
  kit.endRing(rim, new THREE.Vector3(0, -1, 0), 1.0, LINE, 0.8);
}

/** Bar stool: post + round seat. */
export function stool(kit: Kit, x: number, fy: number, z: number) {
  kit.vCyl(x, fy, z, 0.04, 0.68, LINE_DIM, 0.7);
  kit.tube(new THREE.Vector3(x, fy + 0.68, z), new THREE.Vector3(x, fy + 0.74, z), 0.18, 0.18, LINE, 0.8);
  kit.world.add(kit.ringXZ(x, fy + 0.74, z, 0.18, LINE, 0.8));
  kit.world.add(kit.ringXZ(x, fy + 0.02, z, 0.16, LINE_DIM, 0.5, 16));
}

/** Long planter box with a row of small plants. */
export function planter(kit: Kit, x: number, fy: number, z: number, len: number, rot = 0) {
  const g = new THREE.Group();
  g.add(kit.boxAt(0, 0.25, 0, len, 0.5, 0.45, LINE_DIM, 0.65));
  kit.world.add(rotated(kit, g, x, fy, z, rot));
  const n = Math.max(1, Math.round(len / 0.6));
  for (let i = 0; i < n; i++) {
    const t = -len / 2 + (len / n) * (i + 0.5);
    plant(kit, x + Math.cos(rot) * t, fy + 0.5, z - Math.sin(rot) * t, 0.55);
  }
}

/** Bench: slatted seat on two end supports. Front faces +Z. */
export function bench(kit: Kit, x: number, fy: number, z: number, w = 1.6, rot = 0) {
  const g = new THREE.Group();
  g.add(kit.boxAt(0, 0.44, 0, w, 0.06, 0.45, LINE, 0.7));
  g.add(kit.boxAt(0, 0.72, -0.2, w, 0.5, 0.05, LINE, 0.7));
  [-w / 2 + 0.1, w / 2 - 0.1].forEach((dx) => g.add(kit.boxAt(dx, 0.2, 0, 0.06, 0.4, 0.4, LINE_DIM, 0.6)));
  kit.world.add(rotated(kit, g, x, fy, z, rot));
}
