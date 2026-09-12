import type { Kit } from "./kit";
import { LINE, LINE_DIM, LINE_FAINT } from "./palette";
import { FLOOR_H, FLOOR_LEVELS, MAIN_D, MAIN_W, MAIN_X, MAIN_X0, MAIN_X1, MAIN_Z0, MAIN_Z1, N_FLOORS, SHAFT_W, SHAFT_X, SLAB } from "./layout";
import { DOOR_H, DOOR_W, frontendDoorZs } from "./elevators";

/**
 * The frontend block's shell (round 20): three enclosed floors that are
 * glass on three sides — full-height windows on the west, north and south
 * faces drawn as corner columns + vertical mullions with NO occluder, so the
 * interiors stay visible — and one solid wall on the east face toward the
 * lifts, with door openings where the outer shafts' doors land. Each floor
 * has a slab; the deck's floor slab caps the top storey. Partition walls
 * for the internal rooms are added per floor by `partition()`.
 */

export const WALL_T = 0.15;
export const COL = 0.25;
export const INNER_X0 = MAIN_X0 + COL; // usable interior extents
export const INNER_X1 = MAIN_X1 - WALL_T;
export const INNER_Z0 = MAIN_Z0 + COL;
export const INNER_Z1 = MAIN_Z1 - COL;
export const MULLION_STEP = 1.0;

/**
 * Floor i's walking surface and the underside of its CEILING slab. Round 22
 * (Dev: "floors should have ceiling and not floor"): each storey carries
 * its slab at the TOP — the ground floor stands directly on the basement's
 * ceiling, and floor 2's slab doubles as the open deck's floor.
 */
export function floorSpan(i: number) {
  const y0 = i * FLOOR_H;
  // fy sits 0.02 above the slab below so furniture bottoms never z-fight it
  return { fy: y0 + 0.02, ceil: y0 + FLOOR_H - SLAB };
}

function doorGlyph(kit: Kit, x: number, fy: number, z: number, side: 1 | -1, color: number, opacity = 0.7) {
  // rectangular opening + centre split, on a wall whose normal is ±X
  const w = DOOR_W;
  const h = DOOR_H;
  return kit.place(
    (() => {
      const g = kit.lines(
        [-w / 2, 0, 0, w / 2, 0, 0, w / 2, 0, 0, w / 2, h, 0, w / 2, h, 0, -w / 2, h, 0, -w / 2, h, 0, -w / 2, 0, 0, 0, 0, 0, 0, h, 0],
        color,
        opacity,
      );
      g.rotation.y = side * (Math.PI / 2);
      return g;
    })(),
    x,
    fy,
    z,
  );
}

/** A thin interior wall from (x0,z0) to (x1,z1) along X or Z, with an optional door opening at `doorAt` (distance along the wall). */
export function partition(kit: Kit, fy: number, ceil: number, x0: number, z0: number, x1: number, z1: number, doorAt?: number) {
  const h = ceil - fy;
  const alongX = Math.abs(x1 - x0) > Math.abs(z1 - z0);
  const len = alongX ? Math.abs(x1 - x0) : Math.abs(z1 - z0);
  const cx = (x0 + x1) / 2;
  const cz = (z0 + z1) / 2;
  const T = 0.1;
  if (doorAt === undefined) {
    kit.world.add(kit.boxAt(cx, fy + h / 2, cz, alongX ? len : T, h, alongX ? T : len, LINE_DIM, 0.6));
    return;
  }
  // split the wall around a DOOR_W-wide opening, with a header above it
  const s = alongX ? Math.min(x0, x1) : Math.min(z0, z1);
  const segs: [number, number][] = [
    [s, s + doorAt - DOOR_W / 2],
    [s + doorAt + DOOR_W / 2, s + len],
  ];
  segs.forEach(([p, q]) => {
    const c = (p + q) / 2;
    const l = q - p;
    if (l <= 0.01) return;
    kit.world.add(kit.boxAt(alongX ? c : cx, fy + h / 2, alongX ? cz : c, alongX ? l : T, h, alongX ? T : l, LINE_DIM, 0.6));
  });
  const dc = s + doorAt;
  const headerH = h - DOOR_H;
  kit.world.add(
    kit.boxAt(alongX ? dc : cx, fy + DOOR_H + headerH / 2, alongX ? cz : dc, alongX ? DOOR_W : T, headerH, alongX ? T : DOOR_W, LINE_DIM, 0.6),
  );
}

export function buildFrontendShell(kit: Kit) {
  const { world, boxAt, lines } = kit;
  const doorZs = frontendDoorZs();

  for (let i = 0; i < N_FLOORS; i++) {
    const { fy, ceil } = floorSpan(i);
    // ceiling slab (round 22)
    world.add(boxAt(MAIN_X, ceil + SLAB / 2, 0, MAIN_W, SLAB, MAIN_D, LINE, 0.75));
    const h = ceil - fy;
    // corner columns
    [MAIN_X0 + COL / 2, MAIN_X1 - COL / 2].forEach((x) =>
      [MAIN_Z0 + COL / 2, MAIN_Z1 - COL / 2].forEach((z) => world.add(boxAt(x, fy + h / 2, z, COL, h, COL, LINE, 0.75))),
    );
    // east wall (toward the lifts) with door openings facing the outer shafts
    world.add(boxAt(MAIN_X1 - WALL_T / 2, fy + h / 2, 0, WALL_T, h, MAIN_D - COL * 2, LINE, 0.75));
    doorZs.forEach((z) => world.add(doorGlyph(kit, MAIN_X1 - WALL_T - 0.01, fy, z, -1, LINE_DIM)));
    // glass on the other three sides: vertical mullions, no occluder
    const pts: number[] = [];
    for (let z = MAIN_Z0 + MULLION_STEP; z < MAIN_Z1 - 0.01; z += MULLION_STEP) pts.push(MAIN_X0, fy, z, MAIN_X0, ceil, z);
    for (let x = MAIN_X0 + MULLION_STEP; x < MAIN_X1 - 0.01; x += MULLION_STEP) {
      pts.push(x, fy, MAIN_Z0, x, ceil, MAIN_Z0, x, fy, MAIN_Z1, x, ceil, MAIN_Z1);
    }
    // a transom line two-thirds up on each glass face
    const ty = fy + h * 0.68;
    pts.push(MAIN_X0, ty, MAIN_Z0, MAIN_X0, ty, MAIN_Z1, MAIN_X0, ty, MAIN_Z0, MAIN_X1, ty, MAIN_Z0, MAIN_X0, ty, MAIN_Z1, MAIN_X1, ty, MAIN_Z1);
    world.add(lines(pts, LINE_FAINT, 0.7));
  }
  // Round 22 (Dev: "connect the elevator to the floor structure ... at
  // every elevator door"): a hollow vestibule bridges the gap between the
  // east wall and each outer shaft's door face — floor plate, roof plate
  // and two side cheeks, open through the middle so both door glyphs stay
  // visible — on every level the block has (ground, 1st, 2nd, deck).
  const gapX0 = MAIN_X1;
  const gapX1 = SHAFT_X - SHAFT_W / 2;
  const gx = (gapX0 + gapX1) / 2;
  const gw = gapX1 - gapX0;
  const vw = DOOR_W + 0.3; // vestibule width (along z)
  const vh = DOOR_H + 0.2;
  const T = 0.06;
  FLOOR_LEVELS.slice(1, 5).forEach((lvl) => // ground … deck; level 5 belongs to the right tower
    doorZs.forEach((z) => {
      world.add(boxAt(gx, lvl + T / 2, z, gw, T, vw, LINE, 0.7));
      world.add(boxAt(gx, lvl + vh - T / 2, z, gw, T, vw, LINE, 0.7));
      world.add(boxAt(gx, lvl + vh / 2, z - vw / 2 + T / 2, gw, vh, T, LINE, 0.7));
      world.add(boxAt(gx, lvl + vh / 2, z + vw / 2 - T / 2, gw, vh, T, LINE, 0.7));
    }),
  );
}
