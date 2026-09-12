import type { Kit } from "./kit";
import { LINE, LINE_DIM } from "./palette";
import { DECK_ROOF_Y, DECK_Y0, MAIN_X0, MAIN_X1, MAIN_Z0, MAIN_Z1, SLAB } from "./layout";
import { frontendDoorZs } from "./elevators";
import * as F from "./furniture";

/**
 * The left block's open top floor as a rooftop break-out terrace (round 33,
 * Dev): a coffee bar against the lift side between the two lift entries,
 * bistro tables under parasols, planters along the open edges, and benches
 * facing the skyline. Everything is low so the deck stays legible from the
 * hero's default distance; the roof plant lives on the slab above.
 */

export function buildDeckTerrace(kit: Kit) {
  const { world, boxAt } = kit;
  const fy = DECK_Y0 + 0.02;
  const ceil = DECK_ROOF_Y - SLAB;
  const doorZs = frontendDoorZs(); // ±2.1 — keep those lanes clear on the lift side

  // coffee bar: counter with stools on the deck side, back counter with
  // a coffee machine and a shelf against the lift side
  const barZ0 = Math.min(...doorZs) + 0.8;
  const barZ1 = Math.max(...doorZs) - 0.8;
  const barLen = barZ1 - barZ0;
  const barZ = (barZ0 + barZ1) / 2;
  // counter stands ~0.6 clear of the back counter (round 34)
  world.add(boxAt(MAIN_X1 - 1.5, fy + 0.52, barZ, 0.55, 1.04, barLen, LINE, 0.75));
  world.add(boxAt(MAIN_X1 - 1.5, fy + 1.07, barZ, 0.7, 0.06, barLen + 0.1, LINE_DIM, 0.7));
  world.add(boxAt(MAIN_X1 - 0.45, fy + 0.45, barZ, 0.5, 0.9, barLen, LINE, 0.7));
  world.add(boxAt(MAIN_X1 - 0.45, fy + 1.15, barZ - 0.6, 0.4, 0.5, 0.45, LINE_DIM, 0.7)); // coffee machine
  world.add(boxAt(MAIN_X1 - 0.45, fy + 1.05, barZ + 0.5, 0.35, 0.3, 0.6, LINE_DIM, 0.6)); // cups / stack
  [-0.75, 0, 0.75].forEach((dz) => F.stool(kit, MAIN_X1 - 2.15, fy, barZ + dz));
  F.pendant(kit, MAIN_X1 - 1.5, ceil, barZ - 0.7);
  F.pendant(kit, MAIN_X1 - 1.5, ceil, barZ + 0.7);

  // three round tables in one line across the deck, chairs on the east/west
  // sides so neighbouring chairs never touch — no parasols, the roof covers
  // the deck (rounds 34–35)
  [-1.9, 0, 1.9].forEach((z) => F.parasolTable(kit, -3.6, fy, z, 0, false));

  // planters along the west edge and the two open corners
  F.planter(kit, MAIN_X0 + 0.45, fy, -1.9, 1.4, Math.PI / 2);
  F.planter(kit, MAIN_X0 + 0.45, fy, 0.1, 1.4, Math.PI / 2);
  F.planter(kit, MAIN_X0 + 0.45, fy, 2.0, 1.2, Math.PI / 2);
  F.planter(kit, -2.0, fy, MAIN_Z0 + 0.45, 1.4, 0);

  F.plant(kit, MAIN_X1 - 0.75, fy, MAIN_Z0 + 0.6, 1.0);

  // railing along the three open edges (west, north, south) — round 35;
  // the lift side stays open for the bar and the two lift entries
  const railY = fy + 1.0;
  const midY = fy + 0.5;
  const pts: number[] = [];
  const edge = (x0: number, z0: number, x1: number, z1: number) => {
    pts.push(x0, railY, z0, x1, railY, z1, x0, midY, z0, x1, midY, z1);
    const len = Math.hypot(x1 - x0, z1 - z0);
    const n = Math.round(len / 1.0);
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      const x = x0 + (x1 - x0) * t;
      const z = z0 + (z1 - z0) * t;
      pts.push(x, fy, z, x, railY, z);
    }
  };
  const in_ = 0.05;
  edge(MAIN_X0 + in_, MAIN_Z0 + in_, MAIN_X0 + in_, MAIN_Z1 - in_);
  edge(MAIN_X0 + in_, MAIN_Z0 + in_, MAIN_X1 - in_, MAIN_Z0 + in_);
  edge(MAIN_X0 + in_, MAIN_Z1 - in_, MAIN_X1 - in_, MAIN_Z1 - in_);
  world.add(kit.lines(pts, LINE_DIM, 0.6));
}
