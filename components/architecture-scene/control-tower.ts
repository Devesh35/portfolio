import * as THREE from "three";

import type { Kit } from "./kit";
import { EMBER, EMBER_DIM, LINE, LINE_DIM, LINE_FAINT, STEEL } from "./palette";
import { MR_TOP, MR_X1, ROOF_TOP, SHAFT_W, SHAFT_X, SLAB, TERRACE_D, TERRACE_W, TERRACE_X, TERRACE_Y0, UPPER_W } from "./layout";
import { DOOR_H, DOOR_W } from "./elevators";
import * as F from "./furniture";

/**
 * The right-side L block as a glass tower (rounds 23–24, Dev's plan):
 * control room below — lift door on the left (west) wall, a concave screen
 * wall on the right (east), two side cabinets by the lift wall, two operator
 * consoles facing the screen. Observation room above (desk, seating), also
 * served by the middle lift (round 27 — the stair is gone), balcony beyond
 * it with the binoculars. Glass everywhere except the lift-side walls.
 */

const X0 = TERRACE_X - TERRACE_W / 2; // 2.2 — lift-side face
const X1 = TERRACE_X + TERRACE_W / 2; // 6.2
const XU = X0 + UPPER_W; // 4.0 — observation room ends / balcony starts
const Z0 = -TERRACE_D / 2;
const Z1 = TERRACE_D / 2;
const CTRL_FY = TERRACE_Y0 + SLAB + 0.02;
const CTRL_CEIL = ROOF_TOP - SLAB;
const OBS_FY = ROOF_TOP + 0.02;
const OBS_CEIL = MR_TOP - SLAB;
const COL = 0.22;
const WALL_T = 0.15;
const STEP = 1.0;


function mullions(kit: Kit, fy: number, ceil: number, faces: { x?: number; z?: number }[], xa = X0, xb = X1) {
  const pts: number[] = [];
  const ty = fy + (ceil - fy) * 0.68;
  faces.forEach(({ x, z }) => {
    if (x !== undefined) {
      for (let zz = Z0 + STEP; zz < Z1 - 0.01; zz += STEP) pts.push(x, fy, zz, x, ceil, zz);
      pts.push(x, ty, Z0, x, ty, Z1);
    }
    if (z !== undefined) {
      for (let xx = xa + STEP; xx < xb - 0.01; xx += STEP) pts.push(xx, fy, z, xx, ceil, z);
      pts.push(xa, ty, z, xb, ty, z);
    }
  });
  kit.world.add(kit.lines(pts, LINE_FAINT, 0.7));
}

function doorGlyph(kit: Kit, x: number, fy: number, z: number, rot: number, w = DOOR_W, h = DOOR_H) {
  const g = kit.lines([-w / 2, 0, 0, w / 2, 0, 0, w / 2, 0, 0, w / 2, h, 0, w / 2, h, 0, -w / 2, h, 0, -w / 2, h, 0, -w / 2, 0, 0, 0, 0, 0, 0, h, 0], LINE_DIM, 0.7);
  g.rotation.y = rot;
  kit.world.add(kit.place(g, x, fy, z));
}

function monitor(kit: Kit, x: number, y: number, z: number, rot: number, w = 0.55) {
  const g = new THREE.Group();
  g.add(kit.boxAt(0, 0.42, 0, w, 0.34, 0.03, LINE, 0.8));
  g.add(kit.lines([0, 0.02, 0, 0, 0.25, 0, -0.12, 0.02, 0, 0.12, 0.02, 0], LINE_DIM, 0.7));
  g.rotation.y = rot;
  kit.world.add(kit.place(g, x, y, z));
}

/**
 * Concave screen wall on the east glass: flat panels following an arc that
 * bulges toward the glass, spanning the room from the north to the south
 * wall (Dev, round 29 — the stair is gone, so the full width is free).
 */
function curvedScreen(kit: Kit, fy: number) {
  const zc = 0;
  const half = 2.2;
  for (let i = 0; i < 7; i++) {
    const z = zc - 1.8 + i * 0.6; // 7 panels centred on the wall (was offset — round 31)
    const t = (z - zc) / half;
    const x = 5.55 + 0.35 * (1 - t * t);
    const dx = (-0.7 * (z - zc)) / (half * half); // d x / d z
    const g = new THREE.Group();
    g.add(kit.boxAt(0, 0, 0, 0.62, 1.5, 0.05, LINE, 0.8));
    g.add(kit.lines([-0.26, -0.68, -0.03, 0.26, -0.68, -0.03, -0.26, 0.68, -0.03, 0.26, 0.68, -0.03], LINE_DIM, 0.5));
    // rotation θ about Y maps local +X to (cosθ, 0, -sinθ); we want the
    // panel's long axis along the arc tangent (dx, 0, 1) → θ = atan2(-1, dx)
    g.rotation.y = Math.atan2(-1, dx);
    // centred low enough that the 1.5-tall panel stays under the ceiling
    // (it used to poke up through the balcony floor — round 28)
    kit.world.add(kit.place(g, x, fy + 1.1, z));
  }
}

/** Lift door on the tower's west wall + the vestibule bridging to the middle shaft's +X face. */
function liftEntry(kit: Kit, fy: number, slabY: number) {
  const { world, boxAt } = kit;
  doorGlyph(kit, X0 + WALL_T + 0.01, fy, 0, Math.PI / 2);
  const gx0 = SHAFT_X + SHAFT_W / 2;
  const gx = (gx0 + X0) / 2;
  const gw = X0 - gx0;
  const vw = DOOR_W + 0.3;
  const vh = DOOR_H + 0.2;
  const T = 0.06;
  world.add(boxAt(gx, slabY + T / 2, 0, gw, T, vw, LINE, 0.7));
  world.add(boxAt(gx, slabY + vh - T / 2, 0, gw, T, vw, LINE, 0.7));
  world.add(boxAt(gx, slabY + vh / 2, -vw / 2 + T / 2, gw, vh, T, LINE, 0.7));
  world.add(boxAt(gx, slabY + vh / 2, vw / 2 - T / 2, gw, vh, T, LINE, 0.7));
}

function controlRoom(kit: Kit) {
  const { world, boxAt } = kit;
  const fy = CTRL_FY;
  const ceil = CTRL_CEIL;
  const h = ceil - fy;
  // floor slab (over open air, on the pillars) and ceiling slab
  world.add(boxAt(TERRACE_X, TERRACE_Y0 + SLAB / 2, 0, TERRACE_W, SLAB, TERRACE_D, LINE, 0.6));
  world.add(boxAt(TERRACE_X, ceil + SLAB / 2, 0, TERRACE_W, SLAB, TERRACE_D, LINE, 0.6));
  // columns, glass N/S/E, solid lift-side wall with the lift door + vestibule
  [X0 + COL / 2, X1 - COL / 2].forEach((x) => [Z0 + COL / 2, Z1 - COL / 2].forEach((z) => world.add(boxAt(x, fy + h / 2, z, COL, h, COL, LINE, 0.7))));
  mullions(kit, fy, ceil, [{ z: Z0 }, { z: Z1 }, { x: X1 }]);
  world.add(boxAt(X0 + WALL_T / 2, fy + h / 2, 0, WALL_T, h, TERRACE_D - COL * 2, LINE, 0.7));
  liftEntry(kit, fy, TERRACE_Y0);
  curvedScreen(kit, fy);
  // status-light column beside the lift door
  kit.vCyl(X0 + 0.45, fy, -0.9, 0.09, 1.6, LINE_DIM, 0.7);
  [0.4, 0.9, 1.4].forEach((dy, i) => world.add(kit.ringXZ(X0 + 0.45, fy + dy, -0.9, 0.13, i === 2 ? EMBER : EMBER_DIM, 0.85, 16)));
  // side cabinets by the lift wall, one each side of the door
  F.cupboard(kit, 3.0, fy, Z0 + 0.55, 1.2, 0.9, 0.5, 0);
  F.cupboard(kit, 3.0, fy, Z1 - 0.55, 1.2, 0.9, 0.5, Math.PI);
  // three operator consoles in a shallow arc echoing the screen — sized and
  // spaced so neither they nor their chairs touch each other or the
  // cabinets (round 31)
  [
    [4.45, -1.5, 0.25],
    [4.7, 0, 0],
    [4.45, 1.5, -0.25],
  ].forEach(([x, z, a]) => {
    F.desk(kit, x, fy, z, 1.2, 0.6, Math.PI / 2 + a);
    monitor(kit, x + 0.15, fy + 0.75, z - 0.28, -Math.PI / 2 + a, 0.45);
    monitor(kit, x + 0.15, fy + 0.75, z + 0.28, -Math.PI / 2 + a, 0.45);
    F.chair(kit, x - 0.55, fy, z, Math.PI / 2 + a);
  });
  F.plant(kit, X0 + 0.5, fy, 0.9, 0.9); // by the door, opposite the status column
  [3.4, 4.8].forEach((x) => F.ceilingPanel(kit, x, ceil, -0.3, 1.2, 0.4));
}

function observationRoom(kit: Kit) {
  const { world, boxAt, lines } = kit;
  const fy = OBS_FY;
  const ceil = OBS_CEIL;
  const h = ceil - fy;
  world.add(boxAt((X0 + XU) / 2, ceil + SLAB / 2, 0, UPPER_W, SLAB, TERRACE_D, LINE, 0.6));
  [X0 + COL / 2, XU - COL / 2].forEach((x) => [Z0 + COL / 2, Z1 - COL / 2].forEach((z) => world.add(boxAt(x, fy + h / 2, z, COL, h, COL, LINE, 0.7))));
  mullions(kit, fy, ceil, [{ z: Z0 }, { z: Z1 }, { x: XU }], X0, XU);
  world.add(boxAt(X0 + WALL_T / 2, fy + h / 2, 0, WALL_T, h, TERRACE_D - COL * 2, LINE, 0.7));
  world.add(lines([MR_X1, MR_TOP, Z0, MR_X1, MR_TOP, Z1, MR_X1, ROOF_TOP, Z0, MR_X1, MR_TOP, Z0, MR_X1, ROOF_TOP, Z1, MR_X1, MR_TOP, Z1], LINE, 0.7));
  doorGlyph(kit, XU + 0.01, fy, -0.6, Math.PI / 2);
  liftEntry(kit, fy, ROOF_TOP);
  // desk inside (moved off the balcony — Dev), seating, decoration
  // desk by the south glass, facing north (Dev, round 28)
  // (pulled in from the glass so the chair behind it stays inside — round 30)
  F.desk(kit, 3.1, fy, Z1 - 1.1, 1.3, 0.6, 0);
  monitor(kit, 3.1, fy + 0.75, Z1 - 1.25, Math.PI, 0.55);
  F.chair(kit, 3.1, fy, Z1 - 0.55, Math.PI);
  F.sofa(kit, 3.1, fy, -1.85, 1.5, 0);
  F.plant(kit, XU - 0.45, fy, 0.6, 0.9); // clear of the lift door, the desk and the sofa (round 31)
  F.painting(kit, X0 + WALL_T + 0.03, fy + 1.6, 1.2, 0.8, 0.55, Math.PI / 2);
  F.pendant(kit, 3.1, ceil, -0.9);
}

function balcony(kit: Kit) {
  const { world, lines, boxAt } = kit;
  const railY = ROOF_TOP + 0.55;
  const xm = (XU + X1) / 2;
  world.add(
    lines(
      [
        XU, railY, Z0, X1, railY, Z0, X1, ROOF_TOP, Z0, X1, railY, Z0, X1, railY, Z0, X1, railY, Z1,
        XU, railY, Z1, X1, railY, Z1, X1, ROOF_TOP, Z1, X1, railY, Z1,
        xm, ROOF_TOP, Z0, xm, railY, Z0, xm, ROOF_TOP, Z1, xm, railY, Z1, X1, ROOF_TOP, 0, X1, railY, 0,
      ],
      LINE_DIM,
      0.45,
    ),
  );
  const fy = ROOF_TOP + 0.02;
  // two binoculars on posts at the outer rail (Dev, round 28)
  [0.3, 1.6].forEach((z) => {
    kit.vCyl(5.7, fy, z, 0.06, 1.1, LINE_DIM, 0.75);
    world.add(boxAt(5.7, ROOF_TOP + 1.22, z, 0.2, 0.16, 0.45, LINE, 0.8));
  });
  // round table with two chairs under a parasol on the north side
  F.parasolTable(kit, 5.0, fy, -1.6);
  F.plant(kit, X1 - 0.5, fy, Z1 - 0.5, 1.0);
}

/** Fountain on the ground between the tower's pillars (Dev, round 36). */
function fountain(kit: Kit) {
  const { world, lines } = kit;
  const cx = TERRACE_X;
  const cz = 0;
  const gy = 0.02; // ground (the basement's ceiling slab top)
  // basin: low wide cylinder with rims, inner water-line ring
  kit.vCyl(cx, gy, cz, 1.25, 0.35, LINE, 0.75);
  world.add(kit.ringXZ(cx, gy + 0.3, cz, 1.05, LINE_DIM, 0.5));
  // pedestal + upper bowl (a flared cone) with its rim
  kit.vCyl(cx, gy + 0.35, cz, 0.18, 0.7, LINE, 0.75);
  const bowlBase = new THREE.Vector3(cx, gy + 1.05, cz);
  const bowlRim = new THREE.Vector3(cx, gy + 1.3, cz);
  kit.tube(bowlBase, bowlRim, 0.2, 0.6, LINE, 0.75);
  kit.endRing(bowlRim, new THREE.Vector3(0, 1, 0), 0.6, LINE, 0.75);
  // water: a centre jet and four arcs falling from the bowl into the basin
  const pts: number[] = [cx, gy + 1.3, cz, cx, gy + 2.0, cz];
  [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].forEach((a) => {
    let px = cx + Math.cos(a) * 0.6;
    let py = gy + 1.3;
    let pz = cz + Math.sin(a) * 0.6;
    for (let i = 1; i <= 5; i++) {
      const t = i / 5;
      const nx = cx + Math.cos(a) * (0.6 + 0.45 * t);
      const ny = gy + 1.3 - 1.0 * t * t;
      const nz = cz + Math.sin(a) * (0.6 + 0.45 * t);
      pts.push(px, py, pz, nx, ny, nz);
      px = nx;
      py = ny;
      pz = nz;
    }
  });
  world.add(lines(pts, STEEL, 0.7));
}

export function buildControlTower(kit: Kit) {
  controlRoom(kit);
  observationRoom(kit);
  balcony(kit);
  fountain(kit);
  [TERRACE_X - 1.7, TERRACE_X + 1.7].forEach((x) =>
    [-2.3, 2.3].forEach((z) => kit.world.add(kit.boxAt(x, TERRACE_Y0 / 2, z, 0.3, TERRACE_Y0, 0.3, LINE_DIM, 0.45))),
  );
}
