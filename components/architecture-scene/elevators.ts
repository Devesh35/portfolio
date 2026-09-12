import * as THREE from "three";

import type { Kit } from "./kit";
import { EMBER, EMBER_DIM, GOLD, LINE, LINE_DIM, LINE_FAINT, MINT, STEEL, VIOLET } from "./palette";
import {
  FLOOR_LEVELS,
  MR_H,
  MR_HD,
  MR_TOP,
  MR_X0,
  MR_X1,
  SHAFT_BOTTOM,
  SHAFT_D,
  SHAFT_TOP,
  SHAFT_W,
  SHAFT_X,
} from "./layout";

/**
 * The API: three elevator shafts side by side along Z (Dev's floor plan,
 * round 6), each with its own door direction, tied together at the top by
 * one machine-room box (round 13).
 *
 * `door`: -1 opens toward the frontend floors (-X), +1 toward the DBs (+X).
 * `stops`: FLOOR_LEVELS indexes where a car is parked; `active` picks the
 * one drawn in full ember. `doors`: which levels get a door glyph — default
 * every level (round 14); the middle lift serves ground + 3rd only (round 15).
 */
export type Shaft = { z: number; door: 1 | -1; stops: number[]; active: number; doors?: number[] };

export const SHAFTS: Shaft[] = [
  { z: -2.1, door: -1, stops: [0, 2, 4], active: 1, doors: [0, 1, 2, 3, 4] },
  // round 27: the middle lift runs ground → control room → observation room
  { z: 0, door: 1, stops: [1, 5], active: 1, doors: [1, 4, 5] },
  { z: 2.1, door: -1, stops: [1, 3], active: 0, doors: [0, 1, 2, 3, 4] },
];

const CAR_H = 1.9;
const SHEAVE_Y = SHAFT_TOP - 0.63;

/** Two-panel sliding-door glyph on a shaft's ±X face (round 5/6). */
function doorFrame(kit: Kit, cx: number, cy: number, cz: number, color: number, opacity: number, side: 1 | -1) {
  const w = 1.0;
  const h = 2.0;
  const glyph = kit.lines(
    [
      -w / 2, -h / 2, 0, w / 2, -h / 2, 0,
      w / 2, -h / 2, 0, w / 2, h / 2, 0,
      w / 2, h / 2, 0, -w / 2, h / 2, 0,
      -w / 2, h / 2, 0, -w / 2, -h / 2, 0,
      0, -h / 2, 0, 0, h / 2, 0,
    ],
    color,
    opacity,
  );
  glyph.rotation.y = side * (Math.PI / 2);
  return kit.place(glyph, cx, cy, cz);
}

export function buildElevators(kit: Kit) {
  const { world, boxAt, lines } = kit;

  SHAFTS.forEach(({ z, door, stops, active, doors }) => {
    // Round 38: the shaft is a wire box (no occluder) so its insides — cars,
    // rails, cables, counterweight, conduit — read through it like a glass
    // lift, matching the glass floors beside it.
    world.add(kit.wireBox(SHAFT_X, (SHAFT_BOTTOM + SHAFT_TOP) / 2, z, SHAFT_W, SHAFT_TOP - SHAFT_BOTTOM, SHAFT_D, LINE, 0.55));
    // cross-beams on the back wall every storey, a conduit up one corner
    // with a junction box every other storey, and a sheave at the top
    {
      const bx = SHAFT_X - door * (SHAFT_W / 2 - 0.06);
      for (let y = SHAFT_BOTTOM + 3; y < SHAFT_TOP - 0.5; y += 3) world.add(boxAt(bx, y, z, 0.08, 0.1, SHAFT_D - 0.2, LINE_FAINT, 0.6));
      const cx = SHAFT_X + door * 0.62;
      const cz = z + SHAFT_D / 2 - 0.18;
      // round 50 (Dev: colour the shaft internals): electrical conduit and
      // junction boxes in gold, hoist cables in steel, sheaves in mint,
      // counterweight in violet — the same tokens the basement uses
      kit.tube(new THREE.Vector3(cx, SHAFT_BOTTOM + 0.1, cz), new THREE.Vector3(cx, SHAFT_TOP - 0.2, cz), 0.05, 0.05, GOLD, 0.7);
      for (let y = SHAFT_BOTTOM + 4.5; y < SHAFT_TOP - 1; y += 6) world.add(boxAt(cx, y, cz - 0.02, 0.22, 0.3, 0.14, GOLD, 0.7));
      // sheave sits below the machine-room floor and above the highest car (round 41 audit)
      const a = new THREE.Vector3(SHAFT_X - 0.2, SHEAVE_Y, z);
      const b = new THREE.Vector3(SHAFT_X + 0.2, SHEAVE_Y, z);
      kit.tube(a, b, 0.25, 0.25, MINT, 0.75);
      kit.endRing(a, new THREE.Vector3(1, 0, 0), 0.25, MINT, 0.75);
      kit.endRing(b, new THREE.Vector3(1, 0, 0), 0.25, MINT, 0.75);
    }
    // ONE ember guide rail, full height, on the shaft's back (non-door) side (Dev, round 39)
    const rx = SHAFT_X - door * 0.6;
    world.add(lines([rx, SHAFT_BOTTOM + 0.1, z, rx, SHAFT_TOP - 0.1, z], EMBER, 0.6));
    // cars: 1.9 tall, centred 1.0 above the slab they serve (round 7);
    // ember-dim with the active one in full ember (round 13)
    // ONE car per shaft (Dev, round 39) — parked at the active stop; the
    // other stops keep their doors only
    {
      const cy = FLOOR_LEVELS[stops[active]] + 1.0;
      world.add(boxAt(SHAFT_X, cy, z, 1.0, CAR_H, 0.95, EMBER, 0.85));
      // hoist cables from the car's roof up to the sheave
      world.add(lines([SHAFT_X - 0.25, cy + CAR_H / 2, z, SHAFT_X - 0.25, SHEAVE_Y, z, SHAFT_X + 0.25, cy + CAR_H / 2, z, SHAFT_X + 0.25, SHEAVE_Y, z], STEEL, 0.7));
    }
    // counterweight on the rail side, roughly mirroring the active car's height, on its own cable
    {
      const carY = FLOOR_LEVELS[stops[active]] + 1.0;
      const cwY = THREE.MathUtils.clamp(SHAFT_TOP + SHAFT_BOTTOM - carY, SHAFT_BOTTOM + 1.0, SHAFT_TOP - 1.5);
      const cwX = SHAFT_X - door * 0.6;
      world.add(boxAt(cwX, cwY, z + 0.55, 0.22, 1.2, 0.5, VIOLET, 0.7)); // beside the rail, not on it
      world.add(lines([cwX, cwY + 0.6, z + 0.55, cwX, SHEAVE_Y, z + 0.55], STEEL, 0.7));
    }
    // doors, just proud of the shaft face to avoid z-fighting its edges
    FLOOR_LEVELS.forEach((lvl, li) => {
      if (doors && !doors.includes(li)) return;
      const isActive = stops[active] === li;
      world.add(
        doorFrame(kit, SHAFT_X + door * (SHAFT_W / 2 + 0.02), lvl + 1.0, z, isActive ? EMBER : EMBER_DIM, isActive ? 0.85 : 0.8, door),
      );
    });
  });

  // machine room bridging the three shafts; it abuts the deck roof (x=0)
  // and the L-block's upper storey (x=2.2) — round 19
  // Round 49 (Dev: "motor-like structures in the top"): the machine room is
  // a wire box now — a solid one hid everything inside it — with its own
  // floor slab, and per shaft a bedplate carrying a traction motor (drum with
  // rims) coupled to a larger drive sheave, plus a controller cabinet on the
  // deck-roof side and a cable tray along the back wall.
  const mrX = (MR_X0 + MR_X1) / 2;
  const mrFloor = MR_TOP - MR_H;
  world.add(kit.wireBox(mrX, MR_TOP - MR_H / 2, 0, MR_X1 - MR_X0, MR_H, MR_HD * 2, LINE, 0.7));
  world.add(boxAt(mrX, mrFloor + 0.06, 0, MR_X1 - MR_X0, 0.12, MR_HD * 2, LINE, 0.6));
  const fy = mrFloor + 0.13;
  const along = new THREE.Vector3(1, 0, 0);
  SHAFTS.forEach(({ z }) => {
    // bedplate
    world.add(boxAt(SHAFT_X, fy + 0.06, z, 1.6, 0.12, 1.1, LINE_DIM, 0.6));
    // traction motor: a drum on the west half of the bedplate
    const mA = new THREE.Vector3(SHAFT_X - 0.7, fy + 0.6, z);
    const mB = new THREE.Vector3(SHAFT_X - 0.12, fy + 0.6, z);
    kit.tube(mA, mB, 0.27, 0.27, LINE, 0.75);
    kit.endRing(mA, along, 0.27, LINE, 0.75);
    kit.endRing(mB, along, 0.27, LINE, 0.75);
    world.add(boxAt(SHAFT_X - 0.41, fy + 0.22, z, 0.5, 0.2, 0.7, LINE_DIM, 0.6)); // motor foot
    // coupling + drive sheave on the east half
    kit.tube(mB, new THREE.Vector3(SHAFT_X + 0.08, fy + 0.6, z), 0.06, 0.06, LINE_DIM, 0.7);
    const sA = new THREE.Vector3(SHAFT_X + 0.08, fy + 0.6, z);
    const sB = new THREE.Vector3(SHAFT_X + 0.34, fy + 0.6, z);
    kit.tube(sA, sB, 0.46, 0.46, MINT, 0.8);
    kit.endRing(sA, along, 0.46, MINT, 0.8);
    kit.endRing(sB, along, 0.46, MINT, 0.8);
    kit.endRing(sA, along, 0.12, MINT, 0.6); // hub
    world.add(boxAt(SHAFT_X + 0.21, fy + 0.13, z, 0.5, 0.1, 1.0, LINE_DIM, 0.6)); // sheave pedestal
    // brake caliper on top of the motor
    world.add(boxAt(SHAFT_X - 0.41, fy + 0.96, z, 0.3, 0.16, 0.24, LINE_DIM, 0.6));
    // controller cabinet against the deck-roof side, one per lift
    world.add(boxAt(MR_X0 + 0.27, fy + 0.6, z + 0.9, 0.5, 1.2, 0.6, GOLD, 0.7));
    world.add(lines([MR_X0 + 0.53, fy + 0.35, z + 0.9, MR_X0 + 0.53, fy + 0.85, z + 0.9], GOLD, 0.7));
  });
  // cable tray along the lift-wall side, feeding the three cabinets
  world.add(boxAt(MR_X0 + 0.3, mrFloor + MR_H - 0.3, 0, 0.35, 0.08, MR_HD * 2 - 0.4, GOLD, 0.6));
  // Junction lines EdgesGeometry can't produce (interior to the union):
  // each shaft's footprint where it enters the machine room's underside.
  const y = MR_TOP - MR_H;
  const hx = SHAFT_W / 2;
  const hz = SHAFT_D / 2;
  SHAFTS.forEach(({ z }) =>
    world.add(
      lines(
        [
          SHAFT_X - hx, y, z - hz, SHAFT_X + hx, y, z - hz,
          SHAFT_X + hx, y, z - hz, SHAFT_X + hx, y, z + hz,
          SHAFT_X + hx, y, z + hz, SHAFT_X - hx, y, z + hz,
          SHAFT_X - hx, y, z + hz, SHAFT_X - hx, y, z - hz,
        ],
        LINE,
        0.55,
      ),
    ),
  );
}

/** Where the outer shafts' -X doors meet the frontend block's east wall. */
export function frontendDoorZs(): number[] {
  return SHAFTS.filter((s) => s.door === -1).map((s) => s.z);
}

export const DOOR_W = 1.0;
export const DOOR_H = 2.0;
