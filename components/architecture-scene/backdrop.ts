import * as THREE from "three";

import type { Kit } from "./kit";
import { LINE_FAINT } from "./palette";
import { GROUND_HALF, buildBillboard, buildSiteObjects, buildStreets } from "./site";

/**
 * Ground grid + the site (see site.ts). Site objects are tracked so the
 * render loop can fade out any that sit between the camera and the building
 * (Dev, round 6) — each gets its own cloned material so it fades alone, and
 * its occluder stops depth-writing the moment it starts hiding so a fading
 * tree never punches holes in the building's lines behind it.
 */

type Backdrop = { obj: THREE.Object3D; mats: { m: THREE.LineBasicMaterial; base: number }[]; occluders: THREE.Mesh[] };

// `grid: false` leaves the ground grid out — used by the headless still
// (round 57, Dev): the faint iso grid antialiases into a dot lattice that
// clashes with the page's own dot pattern behind the mobile preview.
export function buildBackdrop(kit: Kit, target: THREE.Vector3, { grid = true }: { grid?: boolean } = {}) {
  const { world } = kit;
  if (grid) {
    const g = new THREE.GridHelper(GROUND_HALF * 2, 28, LINE_FAINT, LINE_FAINT);
    if (!Array.isArray(g.material)) {
      g.material.transparent = true;
      g.material.opacity = 0.14;
    }
    world.add(g);
  }
  buildStreets(kit);
  buildBillboard(kit);

  const backdrop: Backdrop[] = [];
  buildSiteObjects(kit).forEach((obj) => {
    const mats: Backdrop["mats"] = [];
    const occluders: THREE.Mesh[] = [];
    obj.traverse((child) => {
      if (child instanceof THREE.LineSegments && child.material instanceof THREE.LineBasicMaterial) {
        const m = child.material.clone();
        child.material = m;
        mats.push({ m, base: m.opacity });
      } else if (child instanceof THREE.Mesh) {
        occluders.push(child);
      }
    });
    backdrop.push({ obj, mats, occluders });
    world.add(obj);
  });

  // An object is "in front" when its ground position projects > 7.5 units
  // along target→camera (the building's footprint reaches ~7). Fade, don't
  // pop, so the auto-rotate never flickers things in and out.
  const toCamera = new THREE.Vector3();
  const flat = new THREE.Vector3();
  return function updateBackdrop(camera: THREE.Camera) {
    toCamera.subVectors(camera.position, target);
    toCamera.y = 0;
    toCamera.normalize();
    backdrop.forEach(({ obj, mats, occluders }) => {
      flat.set(obj.position.x - target.x, 0, obj.position.z - target.z);
      const hide = flat.dot(toCamera) > 7.5;
      mats.forEach(({ m, base }) => {
        m.opacity += ((hide ? 0 : base) - m.opacity) * 0.12;
      });
      occluders.forEach((mesh) => (mesh.visible = !hide));
      obj.visible = mats.some(({ m }) => m.opacity > 0.01);
    });
  };
}
