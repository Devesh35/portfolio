import * as THREE from "three";

import type { Kit } from "./kit";
import { MAIN_X0, MAIN_X1, MAIN_Z0, MAIN_Z1 } from "./layout";
import { LINE_DIM } from "./palette";
import { floorSpan, partition, INNER_X0, INNER_X1, INNER_Z0, INNER_Z1, WALL_T } from "./frontend-shell";
import * as F from "./furniture";

/**
 * What's inside each frontend floor (round 20, Dev):
 *   ground — lobby: reception, seating, back-of-house room
 *   1st    — presentation room: board + projector, rows of chairs, AV closet
 *   2nd    — meeting room: big table, chairs, board + projector, pantry
 * plus decoration everywhere: pendant/recessed lights, plants, cupboards,
 * paintings, bookshelves, water coolers, a clock, rugs.
 *
 * Coordinates: interior spans x INNER_X0..INNER_X1 (≈ -5.95..-0.15) and
 * z INNER_Z0..INNER_Z1 (≈ -2.75..2.75). Lift doors land on the east wall at
 * z = ±2.1, so that wall's middle (|z| < 1.5) is free for furniture.
 */

const N = MAIN_Z0 + 0.03; // "on the north glass" (faces +Z, rot 0)
const S = MAIN_Z1 - 0.03; // on the south glass (faces -Z, rot π)
const W = MAIN_X0 + 0.03; // on the west glass (faces +X, rot π/2)
const E = MAIN_X1 - WALL_T - 0.03; // on the east wall's inner face (faces -X, rot -π/2)
const EAST_NORMAL = new THREE.Vector3(-1, 0, 0);

function boardCorners(x: number, y: number, z: number, w: number, h: number) {
  return [
    new THREE.Vector3(x - w / 2, y - h / 2, z),
    new THREE.Vector3(x + w / 2, y - h / 2, z),
    new THREE.Vector3(x + w / 2, y + h / 2, z),
    new THREE.Vector3(x - w / 2, y + h / 2, z),
  ];
}

function lobby(kit: Kit) {
  const { fy, ceil } = floorSpan(0);
  // back-of-house room in the NW corner, door on its long wall
  // (room widened to x=-4.0 and the cupboard moved to its west wall so the
  // desk, chair, cupboard and partition no longer touch — round 41 audit)
  partition(kit, fy, ceil, -4.0, INNER_Z0, -4.0, -1.2);
  partition(kit, fy, ceil, INNER_X0, -1.2, -4.0, -1.2, 0.9);
  F.desk(kit, -4.95, fy, -2.0, 1.2, 0.6, Math.PI / 2);
  F.chair(kit, -4.5, fy, -2.0, -Math.PI / 2);
  F.cupboard(kit, INNER_X0 + 0.25, fy, -2.0, 1.3, 1.6, 0.45, Math.PI / 2);
  // main entrance on the west glass, reception facing it
  F.doubleDoor(kit, MAIN_X0 + 0.02, fy, 0.6, 1);
  F.doubleDoor(kit, -3.1, fy, MAIN_Z1 - 0.02, 0); // second entrance on the south glass (round 36)
  F.rug(kit, -3.4, fy, 0.6, 2.4, 1.6);
  // rot -π/2: counter runs along Z facing the entrance, and the L's return
  // block extends toward the east WALL, not toward the door (round 21)
  F.receptionDesk(kit, -1.7, fy, 0.3, -Math.PI / 2);
  F.chair(kit, -1.0, fy, 0.3, -Math.PI / 2);
  F.cupboard(kit, E - 0.23, fy, 0.7, 1.6, 0.9, 0.45, -Math.PI / 2);
  F.wallClock(kit, E, fy + 2.2, 0.6, EAST_NORMAL);
  // visitor chairs, centred on the counter's front (the counter runs
  // z -0.8..1.4, centre 0.3 — round 66, Dev: "align them")
  F.chair(kit, -2.45, fy, -0.1, Math.PI / 2);
  F.chair(kit, -2.45, fy, 0.7, Math.PI / 2);
  // sitting area (SW): one sofa facing a low table — the second sofa sat
  // in the entrance path and was removed (round 21)
  F.sofa(kit, -4.5, fy, 2.5, 1.8, Math.PI);
  F.lowTable(kit, -4.5, fy, 1.75);
  F.rug(kit, -4.5, fy, 1.75, 2.6, 2.2);
  F.bookshelf(kit, -2.4, fy, N + 0.2, 1.2, 1.8, 0.35, 0);
  F.waterCooler(kit, -5.7, fy, -0.9); // beside the entrance, not in front of it
  // decoration
  F.plant(kit, INNER_X1 - 0.35, fy, INNER_Z1 - 0.3, 1.1);
  F.plant(kit, -3.3, fy, INNER_Z1 - 0.3, 0.9);
  F.painting(kit, -3.2, fy + 1.7, N, 0.9, 0.6, 0);
  F.painting(kit, -1.6, fy + 1.7, N, 0.6, 0.6, 0);
  F.painting(kit, E, fy + 1.7, -1.2, 0.7, 0.5, -Math.PI / 2);
  [-4.6, -3.2, -1.8].forEach((x) => F.pendant(kit, x, ceil, 0.6));
  F.ceilingPanel(kit, -4.5, ceil, 1.75, 1.6, 0.4);
  F.ceilingPanel(kit, -2.0, ceil, -1.8, 1.6, 0.4);
}

function presentation(kit: Kit) {
  const { fy, ceil } = floorSpan(1);
  // board on the north glass wall, projector hanging in front of it
  const bw = 2.4;
  const bh = 1.3;
  const by = fy + 1.6;
  F.board(kit, -3.0, by, N + 0.03, bw, bh, 0);
  F.projector(kit, -3.0, ceil, -0.5, boardCorners(-3.0, by, N + 0.06, bw, bh));
  // lectern
  F.desk(kit, -5.1, fy, -1.9, 0.7, 0.5, 0);
  // three rows of five chairs facing the board
  // rows kept clear of the SW closet wall (x < -4.8, z > 1.9) — round 21
  [0.2, 1.0, 1.8].forEach((z) => [-4.3, -3.5, -2.7, -1.9, -1.1].forEach((x) => F.chair(kit, x, fy, z, Math.PI)));
  // AV / storage closet in the SW corner
  partition(kit, fy, ceil, -4.8, 1.9, -4.8, INNER_Z1, 0.5);
  partition(kit, fy, ceil, INNER_X0, 1.9, -4.8, 1.9);
  F.cupboard(kit, -5.4, fy, INNER_Z1 - 0.25, 1.0, 1.4, 0.45, Math.PI);
  // decoration
  F.cupboard(kit, W + 0.23, fy, 0.6, 1.4, 0.9, 0.45, Math.PI / 2);
  F.plant(kit, INNER_X1 - 0.35, fy, INNER_Z0 + 0.3, 1.0);
  F.plant(kit, INNER_X1 - 0.35, fy, INNER_Z1 - 0.3, 0.9);
  F.painting(kit, W, fy + 1.7, -1.0, 0.8, 0.55, Math.PI / 2);
  F.painting(kit, W, fy + 1.7, -0.1, 0.5, 0.55, Math.PI / 2);
  F.painting(kit, E, fy + 1.7, 0.0, 0.7, 0.5, -Math.PI / 2);
  F.waterCooler(kit, E - 0.2, fy, -1.0);
  [-4.4, -2.6].forEach((x) => F.pendant(kit, x, ceil, 1.1));
  F.ceilingPanel(kit, -3.2, ceil, 2.4, 2.0, 0.4);
}

function meeting(kit: Kit) {
  const { fy, ceil } = floorSpan(2);
  // big table in the centre with chairs all round
  F.meetingTable(kit, -3.1, fy, 0.1, 3.2, 1.4);
  [-4.3, -3.5, -2.7, -1.9].forEach((x) => {
    F.chair(kit, x, fy, -0.95, 0);
    F.chair(kit, x, fy, 1.15, Math.PI);
  });
  F.chair(kit, -5.1, fy, 0.1, Math.PI / 2);
  // (no chair at the east end — that's where the board is; round 21)
  F.rug(kit, -3.1, fy, 0.1, 4.6, 3.0);
  // board on the elevator-side (east) wall between the lift doors, with
  // the projector hanging over the table pointing at it (Dev, round 21)
  const bw = 2.4;
  const bh = 1.3;
  const by = fy + 1.6;
  F.board(kit, E - 0.03, by, 0.1, bw, bh, -Math.PI / 2);
  F.projector(kit, -2.6, ceil, 0.1, [
    new THREE.Vector3(E - 0.06, by - bh / 2, 0.1 - bw / 2),
    new THREE.Vector3(E - 0.06, by - bh / 2, 0.1 + bw / 2),
    new THREE.Vector3(E - 0.06, by + bh / 2, 0.1 + bw / 2),
    new THREE.Vector3(E - 0.06, by + bh / 2, 0.1 - bw / 2),
  ]);
  // pantry in the NW corner
  partition(kit, fy, ceil, -4.6, INNER_Z0, -4.6, -1.6, 0.7);
  partition(kit, fy, ceil, INNER_X0, -1.6, -4.6, -1.6);
  F.cupboard(kit, -5.3, fy, INNER_Z0 + 0.25, 1.3, 0.9, 0.45, 0);
  kit.world.add(kit.boxAt(-5.7, fy + 1.15, INNER_Z0 + 0.25, 0.4, 0.5, 0.4, LINE_DIM, 0.6)); // coffee machine
  F.waterCooler(kit, -4.95, fy, INNER_Z0 + 0.3);
  // decoration
  F.cupboard(kit, -2.0, fy, S - 0.23, 1.4, 0.9, 0.45, Math.PI);
  F.cupboard(kit, -4.2, fy, S - 0.23, 1.4, 0.9, 0.45, Math.PI);
  F.bookshelf(kit, W + 0.2, fy, 1.6, 1.2, 1.8, 0.35, Math.PI / 2);
  F.plant(kit, INNER_X1 - 0.35, fy, INNER_Z0 + 0.3, 1.0);
  F.plant(kit, INNER_X0 + 0.35, fy, INNER_Z1 - 0.3, 1.0);
  F.painting(kit, W, fy + 1.7, 0.2, 0.8, 0.55, Math.PI / 2);
  F.painting(kit, W, fy + 1.7, -0.9, 0.5, 0.55, Math.PI / 2);
  F.painting(kit, -1.4, fy + 1.7, N, 0.9, 0.5, 0);
  F.wallClock(kit, E, fy + 2.5, -1.45, EAST_NORMAL);
  [-4.2].forEach((x) => F.pendant(kit, x, ceil, 0.1));
  F.ceilingPanel(kit, -3.1, ceil, 2.3, 2.0, 0.4);
}

export function buildInteriors(kit: Kit) {
  lobby(kit);
  presentation(kit);
  meeting(kit);
}
