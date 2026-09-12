import * as THREE from "three";

import type { Kit } from "./kit";
import { EMBER, LINE, LINE_DIM, LINE_FAINT, MINT } from "./palette";
import { strokeText, strokeWidth } from "./stroke-font";

/**
 * The building's surroundings, laid out deliberately rather than scattered
 * (round 37, Dev: "reimagine the surroundings"): a south road and a west
 * road with kerbs and pavements, a zebra crossing at the south entrance,
 * street lamps, parked cars, rows of street trees on the far kerbs plus a
 * few plaza trees, a ring of distant city blocks, and a street billboard
 * east of the building facing south-south-east.
 *
 * Every builder returns the objects it made so the backdrop's fade-when-in-
 * front logic can track them; the roads, kerbs and billboard are not
 * tracked (they never sit "in front" in a way that hides the building).
 */

export const GROUND_HALF = 17;
export const SOUTH_ROAD = { z0: 4.6, z1: 6.6 };
export const WEST_ROAD = { x0: -10.6, x1: -8.6 };

function tree(kit: Kit, x: number, z: number, s = 1) {
  const g = new THREE.Group();
  g.add(kit.boxAt(0, 0.55 * s, 0, 0.14 * s, 1.1 * s, 0.14 * s, LINE_DIM, 0.6));
  g.add(kit.place(kit.edged(new THREE.IcosahedronGeometry(0.62 * s, 1), MINT, 0.5, 12), 0, 1.55 * s, 0));
  g.add(kit.place(kit.edged(new THREE.IcosahedronGeometry(0.42 * s, 1), MINT, 0.5, 12), 0.15 * s, 2.15 * s, 0));
  return kit.place(g, x, 0, z);
}

function lamp(kit: Kit, x: number, z: number, armDir: [number, number]) {
  const g = new THREE.Group();
  g.add(kit.boxAt(0, 1.6, 0, 0.1, 3.2, 0.1, LINE_DIM, 0.6));
  g.add(kit.boxAt(armDir[0] * 0.35, 3.2, armDir[1] * 0.35, 0.7 * Math.abs(armDir[0]) + 0.1, 0.06, 0.7 * Math.abs(armDir[1]) + 0.1, LINE_DIM, 0.6));
  g.add(kit.boxAt(armDir[0] * 0.65, 3.12, armDir[1] * 0.65, 0.3, 0.12, 0.3, EMBER, 0.7));
  return kit.place(g, x, 0, z);
}

function car(kit: Kit, x: number, z: number, alongX: boolean) {
  const g = new THREE.Group();
  g.add(kit.boxAt(0, 0.5, 0, 1.9, 0.5, 0.85, LINE, 0.65));
  g.add(kit.boxAt(-0.1, 0.95, 0, 1.0, 0.4, 0.8, LINE, 0.65));
  // wheels: circles in the XY plane, in the group's own space so they fade with it
  const pts: number[] = [];
  [-0.6, 0.6].forEach((dx) =>
    [-0.44, 0.44].forEach((dz) => {
      for (let i = 0; i < 12; i++) {
        const a0 = (i / 12) * Math.PI * 2;
        const a1 = ((i + 1) / 12) * Math.PI * 2;
        pts.push(dx + Math.cos(a0) * 0.24, 0.25 + Math.sin(a0) * 0.24, dz, dx + Math.cos(a1) * 0.24, 0.25 + Math.sin(a1) * 0.24, dz);
      }
    }),
  );
  g.add(kit.lines(pts, LINE_DIM, 0.6));
  if (!alongX) g.rotation.y = Math.PI / 2;
  return kit.place(g, x, 0, z);
}

function block(kit: Kit, x: number, z: number, w: number, h: number, d: number) {
  const g = new THREE.Group();
  g.add(kit.boxAt(0, h / 2, 0, w, h, d, LINE_FAINT, 0.3));
  // a rooftop tank on the taller ones
  if (h > 6) g.add(kit.boxAt(w * 0.2, h + 0.3, 0, 0.7, 0.6, 0.7, LINE_FAINT, 0.3));
  return kit.place(g, x, 0, z);
}

/** Kerbs, pavements and the zebra crossing — static lines, not tracked. */
export function buildStreets(kit: Kit) {
  const y = 0.01;
  const pts: number[] = [];
  const H = GROUND_HALF;
  const dashed = (ax: "x" | "z", c: number) => {
    for (let t = -H; t < H; t += 1.2) pts.push(...(ax === "z" ? [t, y, c, Math.min(t + 0.6, H), y, c] : [c, y, t, c, y, Math.min(t + 0.6, H)]));
  };
  // south road: two kerbs, pavement line on the building side, centre dashes
  [SOUTH_ROAD.z0, SOUTH_ROAD.z1, SOUTH_ROAD.z0 - 0.9].forEach((z) => pts.push(-H, y, z, H, y, z));
  dashed("z", (SOUTH_ROAD.z0 + SOUTH_ROAD.z1) / 2);
  // west road
  [WEST_ROAD.x0, WEST_ROAD.x1, WEST_ROAD.x1 + 0.9].forEach((x) => pts.push(x, y, -H, x, y, H));
  dashed("x", (WEST_ROAD.x0 + WEST_ROAD.x1) / 2);
  // zebra crossing in front of the south entrance
  for (let x = -4.2; x <= -2.0; x += 0.4) pts.push(x, y, SOUTH_ROAD.z0, x, y, SOUTH_ROAD.z1);
  kit.world.add(kit.lines(pts, LINE_DIM, 0.55));
}

/** Everything that stands on the ground and should fade when in front of the camera. */
export function buildSiteObjects(kit: Kit): THREE.Object3D[] {
  const out: THREE.Object3D[] = [];
  // street trees on the far kerb of each road
  for (let x = -15; x <= 15; x += 3) out.push(tree(kit, x, SOUTH_ROAD.z1 + 1.0, 1));
  for (let z = -15; z <= 2; z += 3) out.push(tree(kit, WEST_ROAD.x0 - 1.0, z, 1));
  // plaza trees around the building
  [
    [-7.0, -4.8, 0.9],
    [-1.0, -5.6, 0.9],
    [5.0, -5.4, 0.9],
    [7.6, -4.8, 0.85],
    [-4.5, -5.5, 0.85],
    [-7.2, 3.0, 0.8],
  ].forEach(([x, z, s]) => out.push(tree(kit, x, z, s)));
  // street lamps on the pavements, arms over the road
  [-13, -8, -3, 2, 7, 12].forEach((x) => out.push(lamp(kit, x, SOUTH_ROAD.z0 - 0.4, [0, 1])));
  [-13, -8, -3, 2].forEach((z) => out.push(lamp(kit, WEST_ROAD.x1 + 0.4, z, [-1, 0])));
  // parked cars along the far kerb of the south road and the west road
  [-12.5, -7.0, 4.5, 9.5].forEach((x) => out.push(car(kit, x, SOUTH_ROAD.z1 - 0.6, true)));
  [-11.5, -5.0].forEach((z) => out.push(car(kit, WEST_ROAD.x0 + 0.6, z, false)));
  // distant city blocks beyond the roads
  const blocks: [number, number, number, number, number][] = [
    [-12, -14, 3, 7, 3], [-6, -15, 2.5, 5, 2.5], [0, -14.5, 3.2, 8.5, 3], [6, -15, 2.4, 4.5, 2.4], [12, -14, 3, 6.5, 3],
    [14.5, -8, 2.6, 5, 3], [15, -2, 3, 7.5, 3], [14.5, 5, 2.4, 4, 2.4], [14, 11, 3, 6, 3],
    [-13, 11, 3, 4, 3], [-6, 12, 2.6, 3.5, 2.6], [2, 12, 3, 5, 3], [9, 12.5, 2.4, 3.5, 2.4],
    [-14, -7, 2.6, 5.5, 3], [-14.5, 1, 3, 4, 3], [-14, 8, 2.4, 6, 2.4],
  ];
  blocks.forEach(([x, z, w, h, d]) => out.push(block(kit, x, z, w, h, d)));
  return out;
}

/** Street billboard east of the building, facing south-south-east, with stroke-font text. */
export function buildBillboard(kit: Kit) {
  const g = new THREE.Group();
  const W = 7.4;
  const Hb = 2.4;
  const yBot = 2.2;
  [-2.7, 2.7].forEach((dx) => g.add(kit.boxAt(dx, yBot / 2, -0.1, 0.16, yBot, 0.16, LINE_DIM, 0.7)));
  // opaque board (Dev, round 37) — it hides whatever is behind it
  g.add(kit.boxAt(0, yBot + Hb / 2, 0, W, Hb, 0.12, LINE, 0.85));
  g.add(kit.lines([-W / 2 + 0.15, yBot + 0.15, 0.07, W / 2 - 0.15, yBot + 0.15, 0.07, W / 2 - 0.15, yBot + 0.15, 0.07, W / 2 - 0.15, yBot + Hb - 0.15, 0.07, W / 2 - 0.15, yBot + Hb - 0.15, 0.07, -W / 2 + 0.15, yBot + Hb - 0.15, 0.07, -W / 2 + 0.15, yBot + Hb - 0.15, 0.07, -W / 2 + 0.15, yBot + 0.15, 0.07], LINE_DIM, 0.5));
  // two lines of text, centred on the face
  const s1 = 0.42;
  const l1 = "BUILDING TOUGHER";
  const l2 = "SYSTEMS";
  const t1 = kit.lines(strokeText(l1, -strokeWidth(l1) * s1 / 2, yBot + 1.35, s1), EMBER, 0.9);
  const t2 = kit.lines(strokeText(l2, -strokeWidth(l2) * s1 / 2, yBot + 0.5, s1), EMBER, 0.9);
  t1.position.z = 0.08;
  t2.position.z = 0.08;
  g.add(t1, t2);
  // three little floodlights along the top edge
  [-2.4, 0, 2.4].forEach((dx) => g.add(kit.boxAt(dx, yBot + Hb + 0.15, 0.25, 0.3, 0.12, 0.3, LINE_DIM, 0.6)));
  // face normal (sinθ, 0, cosθ): θ = 22.5° → south-south-east
  g.rotation.y = Math.PI / 8;
  // close enough to the building to stay inside the hero's frame at the default angle
  kit.world.add(kit.place(g, 9.8, 0, 2.2));
}
