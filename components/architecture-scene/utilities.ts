import * as THREE from "three";

import type { Kit } from "./kit";
import { GOLD, MINT, STEEL, VIOLET } from "./palette";
import { CEIL_Y, FLOOR_Y } from "./layout";

/**
 * External integrations: four colour-coded utility feeds (Dev's floor plan:
 * purple, green, yellow, blue top→bottom) entering the basement from the
 * right as STRAIGHT pipes (round 8) at one common near-floor level, each
 * ending on its own floor-standing appliance which carries the pipe's
 * colour. Pipes stay at floor level all the way out and just end (round 9).
 *
 * The colour→appliance pairing (electric→distro, water→washer, gas→heater,
 * phone→tank) is mine, not Dev-specified item-by-item.
 */

const PIPE_R = 0.1;
const PIPE_Y = FLOOR_Y + 0.45;

/** Electrical distribution cabinet: wide low box with switch ticks. */
function distroCabinet(kit: Kit, cx: number, cy: number, cz: number, color: number) {
  const g = new THREE.Group();
  g.add(kit.boxAt(0, 0, 0, 1.5, 0.8, 0.5, color, 0.6));
  const pts: number[] = [];
  for (let i = 0; i < 4; i++) pts.push(-0.45 + i * 0.3, -0.2, 0.26, -0.45 + i * 0.3, 0.2, 0.26);
  g.add(kit.lines(pts, color, 0.85));
  return kit.place(g, cx, cy, cz);
}
/** Washing machine: squat cube with a round door ring (20% larger, round 8). */
function washer(kit: Kit, cx: number, cy: number, cz: number, color: number) {
  const g = new THREE.Group();
  g.add(kit.boxAt(0, 0, 0, 0.9, 0.96, 0.84, color, 0.55));
  const pts: number[] = [];
  for (let a = 0; a < 16; a++) {
    const a0 = (a / 16) * Math.PI * 2;
    const a1 = ((a + 1) / 16) * Math.PI * 2;
    pts.push(Math.cos(a0) * 0.29, Math.sin(a0) * 0.29, 0.43, Math.cos(a1) * 0.29, Math.sin(a1) * 0.29, 0.43);
  }
  g.add(kit.lines(pts, color, 0.85));
  return kit.place(g, cx, cy, cz);
}
/** Heater: L in plan — a long low radiator body plus a taller boiler block. */
function heater(kit: Kit, cx: number, cy: number, cz: number, color: number) {
  const g = new THREE.Group();
  g.add(kit.boxAt(-0.3, -0.15, 0, 1.3, 0.7, 0.4, color, 0.55));
  g.add(kit.boxAt(0.55, 0, 0.45, 0.4, 1.0, 1.2, color, 0.55));
  const pts: number[] = [];
  for (let i = 0; i < 5; i++) pts.push(-0.8 + i * 0.25, -0.42, 0.21, -0.8 + i * 0.25, 0.12, 0.21);
  g.add(kit.lines(pts, color, 0.85));
  return kit.place(g, cx, cy, cz);
}

/**
 * The yellow cabinet's back long side extends as a panel to the ceiling
 * carrying a small circuit: relay/breaker boxes, capacitor cylinders with
 * rim rings at both ends (round 11), and orthogonal traces (round 8).
 */
function distroPanel(kit: Kit, cx: number, floorY: number, ceilY: number, zBack: number, color: number) {
  const T = 0.18;
  const H = ceilY - floorY;
  kit.world.add(kit.boxAt(cx, floorY + H / 2, zBack - T / 2, 1.5, H, T, color, 0.6));
  const face = zBack + 0.01;
  const boxes: [number, number, number, number][] = [
    [-0.45, 1.2, 0.3, 0.2],
    [0.1, 1.2, 0.3, 0.2],
    [-0.2, 1.8, 0.5, 0.22],
    [0.4, 2.3, 0.28, 0.18],
    [-0.5, 2.5, 0.24, 0.16],
  ];
  boxes.forEach(([x, y, w, h]) => kit.world.add(kit.boxAt(cx + x, floorY + y, face + 0.03, w, h, 0.06, color, 0.85)));
  const out = new THREE.Vector3(0, 0, 1);
  ([[0.45, 1.6], [-0.55, 1.95], [0.05, 2.55]] as [number, number][]).forEach(([x, y]) => {
    const a = new THREE.Vector3(cx + x, floorY + y, face);
    const b = new THREE.Vector3(cx + x, floorY + y, face + 0.16);
    kit.tube(a, b, 0.07, 0.07, color, 0.85);
    kit.endRing(a, out, 0.07, color);
    kit.endRing(b, out, 0.07, color);
  });
  const tr = [
    -0.45, 1.1, 0.1, 1.1, 0.1, 1.1, 0.1, 0.95, -0.45, 1.3, -0.45, 1.8, -0.45, 1.8, -0.55, 1.95,
    0.1, 1.3, 0.45, 1.3, 0.45, 1.3, 0.45, 1.6, 0.05, 1.8, 0.4, 1.8, 0.4, 1.8, 0.4, 2.3,
    -0.2, 1.91, -0.2, 2.5, -0.2, 2.5, -0.5, 2.5, 0.05, 2.3, 0.05, 2.55, 0.1, 0.95, 0.4, 0.95,
    0.4, 0.95, 0.4, 0.86,
  ];
  const pts: number[] = [];
  for (let i = 0; i < tr.length; i += 4) pts.push(cx + tr[i], floorY + tr[i + 1], face, cx + tr[i + 2], floorY + tr[i + 3], face);
  kit.world.add(kit.lines(pts, color, 0.7));
}

/** Purple tank: cylinder + cone narrowing to the pipe diameter; returns the cone tip. */
function tank(kit: Kit, cx: number, floorY: number, cz: number, color: number, pipeR: number) {
  const R = 0.45;
  const H = 1.1;
  const CONE = 0.3;
  const base = new THREE.Vector3(cx, floorY, cz);
  const top = new THREE.Vector3(cx, floorY + H, cz);
  const tip = new THREE.Vector3(cx, floorY + H + CONE, cz);
  kit.tube(base, top, R, R, color, 0.6);
  kit.tube(top, tip, R, pipeR, color, 0.6);
  kit.world.add(kit.ringXZ(cx, floorY + 0.02, cz, R, color, 0.6));
  kit.world.add(kit.ringXZ(cx, floorY + H, cz, R, color, 0.6));
  return tip;
}

type Kind = "distro" | "washer" | "heater" | "tank";
const BUILDERS = { distro: distroCabinet, washer, heater };
const ITEM_H = { distro: 0.8, washer: 0.96, heater: 1.0 };
const ITEM_HALF_W = { distro: 0.75, washer: 0.45, heater: 0.75 };

const PIPES: { color: number; z: number; outerX: number; itemX: number; kind: Kind }[] = [
  { color: VIOLET, z: -2.4, outerX: 8.8, itemX: 5.0, kind: "tank" },
  { color: MINT, z: -0.7, outerX: 8.4, itemX: 5.2, kind: "heater" },
  { color: GOLD, z: 1.1, outerX: 8.0, itemX: 5.3, kind: "distro" },
  { color: STEEL, z: 2.6, outerX: 7.6, itemX: 5.6, kind: "washer" },
];

export function buildUtilities(kit: Kit) {
  const { world } = kit;
  PIPES.forEach(({ color, z, outerX, itemX, kind }) => {
    const run: THREE.Vector3[] = [];
    if (kind === "tank") {
      // pipe grows out of the cone tip: up, 90°, straight, 90° down to PIPE_Y
      const tip = tank(kit, itemX, FLOOR_Y, z, color, PIPE_R);
      run.push(tip, new THREE.Vector3(itemX, tip.y + 0.4, z), new THREE.Vector3(itemX + 1.0, tip.y + 0.4, z), new THREE.Vector3(itemX + 1.0, PIPE_Y, z));
    } else {
      const h = ITEM_H[kind];
      world.add(BUILDERS[kind](kit, itemX, FLOOR_Y + h / 2, z, color));
      if (kind === "distro") distroPanel(kit, itemX, FLOOR_Y, CEIL_Y, z - 0.25, color);
      // Dev, round 8: the blue washer is duplicated beside it; only the first is on the pipe
      if (kind === "washer") world.add(BUILDERS[kind](kit, itemX - 1.05, FLOOR_Y + h / 2, z, color));
      run.push(new THREE.Vector3(itemX + ITEM_HALF_W[kind], PIPE_Y, z));
    }
    run.push(new THREE.Vector3(outerX, PIPE_Y, z));
    kit.pipeRun(run, PIPE_R, color);
  });
}
