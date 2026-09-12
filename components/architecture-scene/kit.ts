import * as THREE from "three";

/**
 * Drawing primitives shared by every section of the scene.
 *
 * Hidden-line technique: every solid is an invisible depth-writing occluder
 * (colorWrite: false) plus line geometry drawn on top, so silhouettes and
 * interior lines hide correctly from ANY rotation angle. No lighting.
 *
 * Round solids (drums, pipes, tanks, cones) are NOT outlined with
 * EdgesGeometry (one seam per radial segment); they use `tube`/`disc`,
 * whose silhouette lines are recomputed every frame at the tangent points
 * as seen from the camera — `updateSilhouettes(camera)` in the loop.
 */
export type Kit = ReturnType<typeof createKit>;

export const UP = new THREE.Vector3(0, 1, 0);
const X_AXIS = new THREE.Vector3(1, 0, 0);

type Tube = { sil: THREE.LineSegments; a: THREE.Vector3; b: THREE.Vector3; ra: number; rb: number };
type Disc = { line: THREE.LineLoop; c: THREE.Vector3; r: number };

export function createKit(world: THREE.Group) {
  const occluderMaterial = new THREE.MeshBasicMaterial({ colorWrite: false });
  const materialCache = new Map<string, THREE.LineBasicMaterial>();
  const tubes: Tube[] = [];
  const discs: Disc[] = [];

  function edgeMat(color: number, opacity = 0.85) {
    const key = `${color}:${opacity}`;
    let m = materialCache.get(key);
    if (!m) {
      m = new THREE.LineBasicMaterial({ color, transparent: true, opacity });
      materialCache.set(key, m);
    }
    return m;
  }
  function place<T extends THREE.Object3D>(obj: T, x: number, y: number, z: number): T {
    obj.position.set(x, y, z);
    return obj;
  }
  function edged(geometry: THREE.BufferGeometry, color: number, opacity = 0.85, thresholdAngle = 1) {
    const group = new THREE.Group();
    group.add(new THREE.Mesh(geometry, occluderMaterial));
    group.add(new THREE.LineSegments(new THREE.EdgesGeometry(geometry, thresholdAngle), edgeMat(color, opacity)));
    return group;
  }
  function boxAt(cx: number, cy: number, cz: number, w: number, h: number, d: number, color: number, opacity = 0.85) {
    return place(edged(new THREE.BoxGeometry(w, h, d), color, opacity), cx, cy, cz);
  }
  /** Plain line segments from a flat [x,y,z, x,y,z, ...] pair list (no occluder). */
  function lines(pts: number[], color: number, opacity = 0.85) {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
    return new THREE.LineSegments(geo, edgeMat(color, opacity));
  }
  /** Box outline drawn WITHOUT an occluder — a wireframe/glass volume. */
  function wireBox(cx: number, cy: number, cz: number, w: number, h: number, d: number, color: number, opacity = 0.85) {
    return place(new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(w, h, d)), edgeMat(color, opacity)), cx, cy, cz);
  }
  /** A horizontal circle (rim ring) at y, 4% outside radius r — see dbTank's round-10 note. */
  function ringXZ(cx: number, y: number, cz: number, r: number, color: number, opacity = 0.85, segs = 32) {
    const rr = r * 1.04;
    const pts: number[] = [];
    for (let a = 0; a < segs; a++) {
      const a0 = (a / segs) * Math.PI * 2;
      const a1 = ((a + 1) / segs) * Math.PI * 2;
      pts.push(cx + Math.cos(a0) * rr, y, cz + Math.sin(a0) * rr, cx + Math.cos(a1) * rr, y, cz + Math.sin(a1) * rr);
    }
    return lines(pts, color, opacity);
  }

  /* --------------------------------------- camera-facing silhouettes */
  /** Cylinder (ra === rb) or cone from a to b, world space. */
  function tube(a: THREE.Vector3, b: THREE.Vector3, ra: number, rb: number, color: number, opacity = 0.85) {
    const axis = new THREE.Vector3().subVectors(b, a);
    const len = axis.length();
    // closed ends — round 9: an open-ended occluder left drum tops see-through
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(rb, ra, len, 12, 1, false), occluderMaterial);
    mesh.position.copy(a).addScaledVector(axis, 0.5);
    mesh.quaternion.setFromUnitVectors(UP, axis.clone().normalize());
    world.add(mesh);
    const silGeo = new THREE.BufferGeometry();
    silGeo.setAttribute("position", new THREE.Float32BufferAttribute(new Float32Array(12), 3));
    const sil = new THREE.LineSegments(silGeo, edgeMat(color, opacity));
    world.add(sil);
    // radii nudged 3% outside the occluder so the lines don't z-fight it
    tubes.push({ sil, a: a.clone(), b: b.clone(), ra: ra * 1.03, rb: rb * 1.03 });
  }
  /** Sphere elbow: occluder + a circle that always faces the camera. */
  function disc(c: THREE.Vector3, r: number, color: number, opacity = 0.85) {
    world.add(place(new THREE.Mesh(new THREE.SphereGeometry(r, 10, 8), occluderMaterial), c.x, c.y, c.z));
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(new Float32Array(16 * 3), 3));
    const line = new THREE.LineLoop(geo, edgeMat(color, opacity));
    world.add(line);
    discs.push({ line, c: c.clone(), r: r * 1.03 });
  }
  /** Static rim circle in the plane perpendicular to `dir` at `c` (round 11). */
  function endRing(c: THREE.Vector3, dir: THREE.Vector3, r: number, color: number, opacity = 0.85) {
    const n = dir.clone().normalize();
    const u = new THREE.Vector3().crossVectors(n, Math.abs(n.y) < 0.9 ? UP : X_AXIS).normalize();
    const v = new THREE.Vector3().crossVectors(n, u);
    const rr = r * 1.04;
    const pts: number[] = [];
    const at = (t: number) => [
      c.x + (u.x * Math.cos(t) + v.x * Math.sin(t)) * rr,
      c.y + (u.y * Math.cos(t) + v.y * Math.sin(t)) * rr,
      c.z + (u.z * Math.cos(t) + v.z * Math.sin(t)) * rr,
    ];
    for (let i = 0; i < 24; i++) pts.push(...at((i / 24) * Math.PI * 2), ...at(((i + 1) / 24) * Math.PI * 2));
    world.add(lines(pts, color, opacity));
  }
  /** Straight pipe through `points` with sphere elbows and rims at both ends (rounds 8–12). */
  function pipeRun(points: THREE.Vector3[], r: number, color: number) {
    for (let i = 0; i < points.length - 1; i++) tube(points[i], points[i + 1], r, r, color);
    for (let i = 1; i < points.length - 1; i++) disc(points[i], r, color);
    const n = points.length;
    endRing(points[n - 1], new THREE.Vector3().subVectors(points[n - 1], points[n - 2]), r, color);
    endRing(points[0], new THREE.Vector3().subVectors(points[1], points[0]), r, color);
  }
  /** Vertical cylinder standing on y0 with rims top and bottom. */
  function vCyl(x: number, y0: number, z: number, r: number, h: number, color: number, opacity = 0.85) {
    const a = new THREE.Vector3(x, y0, z);
    const b = new THREE.Vector3(x, y0 + h, z);
    tube(a, b, r, r, color, opacity);
    endRing(a, UP, r, color, opacity);
    endRing(b, UP, r, color, opacity);
  }

  const view = new THREE.Vector3();
  const axis = new THREE.Vector3();
  const off = new THREE.Vector3();
  const mid = new THREE.Vector3();
  const u = new THREE.Vector3();
  const v = new THREE.Vector3();
  function updateSilhouettes(camera: THREE.Camera) {
    tubes.forEach(({ sil, a, b, ra, rb }) => {
      // the two generator lines whose offset is perpendicular to BOTH the
      // axis and the view direction (axis × view), scaled per end radius
      mid.addVectors(a, b).multiplyScalar(0.5);
      view.subVectors(camera.position, mid);
      axis.subVectors(b, a);
      off.crossVectors(axis, view);
      if (off.lengthSq() < 1e-8) return; // looking straight down the axis
      off.normalize();
      const p = sil.geometry.getAttribute("position") as THREE.BufferAttribute;
      p.setXYZ(0, a.x + off.x * ra, a.y + off.y * ra, a.z + off.z * ra);
      p.setXYZ(1, b.x + off.x * rb, b.y + off.y * rb, b.z + off.z * rb);
      p.setXYZ(2, a.x - off.x * ra, a.y - off.y * ra, a.z - off.z * ra);
      p.setXYZ(3, b.x - off.x * rb, b.y - off.y * rb, b.z - off.z * rb);
      p.needsUpdate = true;
    });
    discs.forEach(({ line, c, r }) => {
      view.subVectors(camera.position, c).normalize();
      u.crossVectors(view, Math.abs(view.y) < 0.9 ? UP : X_AXIS).normalize();
      v.crossVectors(view, u);
      const p = line.geometry.getAttribute("position") as THREE.BufferAttribute;
      for (let i = 0; i < 16; i++) {
        const t = (i / 16) * Math.PI * 2;
        const cu = Math.cos(t) * r;
        const sv = Math.sin(t) * r;
        p.setXYZ(i, c.x + u.x * cu + v.x * sv, c.y + u.y * cu + v.y * sv, c.z + u.z * cu + v.z * sv);
      }
      p.needsUpdate = true;
    });
  }

  return { world, edgeMat, place, edged, boxAt, lines, wireBox, ringXZ, tube, disc, endRing, pipeRun, vCyl, updateSilhouettes };
}
