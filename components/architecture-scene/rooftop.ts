import * as THREE from "three";

import type { Kit } from "./kit";
import { LINE, LINE_DIM } from "./palette";
import { DECK_ROOF_Y, DECK_Y0, MAIN_D, MAIN_W, MAIN_X, MAIN_X1, SLAB } from "./layout";

/**
 * Above the left block's enclosed floors: the open deck's roof slab on
 * columns (round 14) and the rooftop plant on it (round 16). The right-side
 * tower lives in control-tower.ts.
 */

export function buildDeckRoof(kit: Kit) {
  const { world, boxAt, lines } = kit;
  world.add(boxAt(MAIN_X, DECK_ROOF_Y - SLAB / 2, 0, MAIN_W, SLAB, MAIN_D, LINE, 0.75));
  const inset = 0.2;
  const colH = DECK_ROOF_Y - SLAB - DECK_Y0;
  // corner columns only (Dev, round 34: mid-edge columns removed)
  [MAIN_X - MAIN_W / 2 + inset, MAIN_X1 - inset].forEach((x) =>
    [-MAIN_D / 2 + inset, MAIN_D / 2 - inset].forEach((z) => world.add(boxAt(x, DECK_Y0 + colH / 2, z, 0.3, colH, 0.3, LINE_DIM, 0.6))),
  );
  // seam where the roof slab meets the machine room's side face (round 19)
  const y1 = DECK_ROOF_Y;
  const y0 = DECK_ROOF_Y - SLAB;
  const hd = MAIN_D / 2;
  world.add(lines([MAIN_X1, y1, -hd, MAIN_X1, y1, hd, MAIN_X1, y0, -hd, MAIN_X1, y0, hd, MAIN_X1, y0, -hd, MAIN_X1, y1, -hd, MAIN_X1, y0, hd, MAIN_X1, y1, hd], LINE, 0.7));
}

/** Tanks + ventilation on the deck roof, every round part with rim rings (round 16/17). */
export function buildRoofPlant(kit: Kit) {
  const { world, boxAt, vCyl, tube, endRing, pipeRun } = kit;
  const ROOF_Y = DECK_ROOF_Y + 0.02; // just above the slab, so bottom edges show
  // two vertical water tanks
  vCyl(-5.1, ROOF_Y, -2.0, 0.5, 1.3, LINE, 0.7);
  vCyl(-5.1, ROOF_Y, -0.55, 0.5, 1.3, LINE, 0.7);
  // one horizontal tank on two saddles
  {
    const r = 0.42;
    const cz = -2.0;
    const cy = ROOF_Y + 0.3 + r;
    const a = new THREE.Vector3(-3.4, cy, cz);
    const b = new THREE.Vector3(-1.4, cy, cz);
    const along = new THREE.Vector3(1, 0, 0);
    tube(a, b, r, r, LINE, 0.7);
    endRing(a, along, r, LINE, 0.7);
    endRing(b, along, r, LINE, 0.7);
    [-2.95, -1.85].forEach((x) => world.add(boxAt(x, ROOF_Y + 0.15, cz, 0.3, 0.3, r * 2, LINE_DIM, 0.6)));
  }
  // air-handling unit + duct ending ON the vent hood's face (no overlap, round 17)
  world.add(boxAt(-1.6, ROOF_Y + 0.5, 1.7, 1.5, 1.0, 1.1, LINE, 0.7));
  {
    const y = ROOF_Y + 0.65;
    pipeRun([new THREE.Vector3(-2.35, y, 1.7), new THREE.Vector3(-3.6, y, 1.7), new THREE.Vector3(-3.6, y, 2.3)], 0.2, LINE_DIM);
    world.add(boxAt(-3.6, ROOF_Y + 0.45, 2.55, 0.7, 0.9, 0.5, LINE_DIM, 0.6));
  }
  // capped round vent stacks, clear of the hood
  [
    [-5.2, 2.4],
    [-4.5, 2.4],
    [-0.7, -0.6],
  ].forEach(([x, z]) => {
    vCyl(x, ROOF_Y, z, 0.17, 0.55, LINE, 0.7);
    world.add(boxAt(x, ROOF_Y + 0.62, z, 0.5, 0.08, 0.5, LINE_DIM, 0.6));
  });
}
