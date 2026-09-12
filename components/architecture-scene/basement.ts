import * as THREE from "three";

import type { Kit } from "./kit";
import { LINE, LINE_DIM, RED, STEEL } from "./palette";
import {
  BASEMENT_BOTTOM,
  BASEMENT_D,
  BASEMENT_L,
  BASEMENT_R,
  BASEMENT_TOP,
  BASEMENT_W,
  BASEMENT_ZN,
  BASEMENT_ZP,
  FLOOR_Y,
  SLAB_T,
} from "./layout";

/**
 * The backend: a server-room basement (slabs + columns, no walls so the
 * cutaway stays readable — Dev, 2026-09-11), 4×5 racks in a hot/cold-aisle
 * layout left of the shafts, three DB drums right of them (Dev's floor
 * plan, rounds 5–6), and the foundation slab + piers below (infra).
 */

/** Server rack: wider unit with tick "LEDs" on its +Z front; `facing` -1 turns it around. */
function rack(kit: Kit, cx: number, cy: number, cz: number, color: number, facing: 1 | -1) {
  const group = new THREE.Group();
  group.add(kit.boxAt(0, 0.95, 0, 0.85, 1.9, 0.55, color, 0.4));
  const pts: number[] = [];
  for (let i = 0; i < 6; i++) {
    const y = 0.18 + i * 0.3;
    pts.push(-0.34, y, 0.28, 0.34, y, 0.28);
  }
  group.add(kit.lines(pts, LINE_DIM, 0.6));
  if (facing === -1) group.rotation.y = Math.PI;
  return kit.place(group, cx, cy, cz);
}

/**
 * Database drum: silhouette-tube body (camera-facing vertical edges, round 7)
 * plus horizontal rim/platter rings only — no vertical seam lines (round 5).
 * Rings run 4% outside the occluder with 32 segments so they never dip into
 * its flat faces (round 10's "dark spots").
 */
function dbTank(kit: Kit, cx: number, cy: number, cz: number, color: number) {
  kit.tube(new THREE.Vector3(cx, cy - 0.55, cz), new THREE.Vector3(cx, cy + 0.55, cz), 0.5, 0.5, color, 0.55);
  [0.55, 0.2, -0.2, -0.55].forEach((dy) => kit.world.add(kit.ringXZ(cx, cy + dy, cz, 0.5, color, 0.55)));
}

export function buildBasement(kit: Kit) {
  const { world, boxAt } = kit;

  // floor + ceiling slabs, columns inset so their outer face is flush (round 8)
  world.add(boxAt(0.1, BASEMENT_TOP - SLAB_T / 2, 0, BASEMENT_W, SLAB_T, BASEMENT_D, LINE, 0.6));
  world.add(boxAt(0.1, BASEMENT_BOTTOM + SLAB_T / 2, 0, BASEMENT_W, SLAB_T, BASEMENT_D, LINE, 0.6));
  {
    const colY = (BASEMENT_TOP + BASEMENT_BOTTOM) / 2;
    const colH = BASEMENT_TOP - BASEMENT_BOTTOM - SLAB_T * 2;
    const IN = 0.15;
    const xs = [BASEMENT_L + IN, BASEMENT_L + BASEMENT_W / 3, BASEMENT_L + (2 * BASEMENT_W) / 3, BASEMENT_R - IN];
    xs.forEach((x) => [BASEMENT_ZN + IN, BASEMENT_ZP - IN].forEach((z) => world.add(boxAt(x, colY, z, 0.3, colH, 0.3, LINE_DIM, 0.55))));
  }

  // racks: edge rows face inward, centre rows sit back-to-back facing outward
  const rackXs = [-5.5, -4.45, -3.4, -2.35, -1.3];
  const rows: { z: number; facing: 1 | -1 }[] = [
    { z: -2.7, facing: 1 },
    { z: -0.45, facing: -1 },
    { z: 0.45, facing: 1 },
    { z: 2.7, facing: -1 },
  ];
  rows.forEach(({ z, facing }) => rackXs.forEach((x) => world.add(rack(kit, x, FLOOR_Y, z, STEEL, facing))));

  // databases: 2 blue on the edges, 1 red in the centre, resting on the slab
  const DB_X = 3.4;
  const DB_Y = FLOOR_Y + 0.55;
  dbTank(kit, DB_X, DB_Y, -1.8, STEEL);
  dbTank(kit, DB_X, DB_Y, 0, RED);
  dbTank(kit, DB_X, DB_Y, 1.8, STEEL);
}

/** Infra: the foundation slab everything rests on, plus its pier blocks. */
export function buildFoundation(kit: Kit) {
  const { world, boxAt } = kit;
  const FOUND_TOP = BASEMENT_BOTTOM;
  const FOUND_BOTTOM = -3.95;
  world.add(boxAt(0.2, (FOUND_TOP + FOUND_BOTTOM) / 2, 0, 13.6, FOUND_TOP - FOUND_BOTTOM, 7.4, LINE, 0.55));
  [-5.4, -1.8, 1.8, 5.4].forEach((x) =>
    [-2.5, 2.5].forEach((z) => world.add(boxAt(x, FOUND_BOTTOM - 0.5, z, 0.55, 0.9, 0.55, LINE_DIM, 0.4))),
  );
}
