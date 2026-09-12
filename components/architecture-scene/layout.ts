/**
 * Shared dimensions of the building. Every section module reads from here
 * so the floors, shafts, basement and roof stay mutually aligned — nothing
 * below is a hand-typed height that could drift from its neighbour.
 */

/* ---------------------------------------------------- frontend block */
export const FLOOR_H = 3.0;
export const MAIN_X = -3.1; // centre of the left (frontend) block
export const MAIN_W = 6.2; // spans x -6.2 .. 0
export const MAIN_D = 6.0; // spans z -3 .. 3
export const MAIN_X0 = MAIN_X - MAIN_W / 2;
export const MAIN_X1 = MAIN_X + MAIN_W / 2;
export const MAIN_Z0 = -MAIN_D / 2;
export const MAIN_Z1 = MAIN_D / 2;
export const SLAB = 0.2; // floor/ceiling slab thickness
export const N_FLOORS = 3; // enclosed floors; an open deck sits above them
export const DECK_Y0 = FLOOR_H * N_FLOORS; // the open top floor's floor
export const DECK_ROOF_Y = DECK_Y0 + FLOOR_H; // top of the deck's roof slab

/* ---------------------------------------------------------- elevators */
export const SHAFT_X = 1.1;
export const SHAFT_W = 1.6;
export const SHAFT_D = 1.8;
export const SHAFT_BOTTOM = -3.3;
export const SHAFT_TOP = 14.25; // round 41: headroom for the sheave above the car parked at the observation room
export const SHAFT_ZS = [-2.1, 0, 2.1];
// machine room bridging the three shafts
export const MR_H = 1.7;
export const MR_OVERLAP = 0.35;
export const MR_TOP = SHAFT_TOP - MR_OVERLAP + MR_H; // the building's highest point
export const MR_X0 = 0; // abuts the deck roof (round 19)
export const MR_X1 = 2.2; // abuts the L-block's upper storey (round 19)
export const MR_HD = 3.6;

/* ----------------------------------------------------------- basement */
export const BASEMENT_TOP = 0;
export const BASEMENT_BOTTOM = -3.3;
export const BASEMENT_W = 12.6; // contains the frontend's footprint on the left
export const BASEMENT_D = 6.6;
export const BASEMENT_L = 0.1 - BASEMENT_W / 2;
export const BASEMENT_R = 0.1 + BASEMENT_W / 2;
export const BASEMENT_ZN = -BASEMENT_D / 2;
export const BASEMENT_ZP = BASEMENT_D / 2;
export const SLAB_T = 0.14;
// Round 10 (Dev: "show the edges at the ground" for every item): a shared
// floor level 0.02 ABOVE the slab top so bottom edges never sit coplanar
// with (or inside) the slab and z-fight/vanish.
export const FLOOR_Y = BASEMENT_BOTTOM + SLAB_T + 0.02;
export const CEIL_Y = BASEMENT_TOP - SLAB_T;

/* ------------------------------------------------- lift stop levels */
// Round 7 (Dev: "elevators are not aligned to floors"): every stop is the
// real slab level it serves. Index 0 = basement, 1 = ground, 2/3 = floors,
// 4 = the open deck / terrace level ("3rd floor" in Dev's counting).
// index 5 = the observation room floor (right tower), served by the middle lift only (round 27)
export const FLOOR_LEVELS = [BASEMENT_BOTTOM + SLAB_T, 0, FLOOR_H, 2 * FLOOR_H, 3 * FLOOR_H, 3 * FLOOR_H + 2.4];

/* --------------------------------------------- right (terrace) block */
export const TERRACE_X = 4.2;
export const TERRACE_Y0 = FLOOR_H * 3;
export const TERRACE_H = 2.4;
export const TERRACE_W = 4.0;
export const TERRACE_D = 5.2;
export const ROOF_TOP = TERRACE_Y0 + TERRACE_H;
export const UPPER_W = 1.8; // the L's upper storey, flush with the shaft side
export const UPPER_H = MR_TOP - ROOF_TOP; // Dev: "top flush to elevator top"
