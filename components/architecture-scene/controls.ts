import * as THREE from "three";

/**
 * Orbit / pan / zoom controls for the hero scene (rounds 40 + 43).
 *
 * The camera orbits a fixed model so the labels can stay pinned to fixed
 * world anchors and simply get re-projected every frame. Left-drag rotates;
 * shift-drag, right-drag or middle-drag pans; Ctrl/⌘ + wheel (which is also
 * what a trackpad pinch sends) zooms — plain wheel is left alone so the page
 * still scrolls over the hero; double-click resets. On touch, one finger
 * rotates, two fingers pinch to zoom and drag to pan. After 1.4 s without
 * input the view slowly auto-rotates around the current orbit centre.
 *
 * `target` is the building's centre and never moves (the backdrop fade is
 * measured from it); `orbit` is what the camera looks at and is what pan
 * moves and reset restores.
 */
export function createOrbitControls(host: HTMLElement, camera: THREE.PerspectiveCamera, target: THREE.Vector3) {
  const orbit = target.clone();
  const RADIUS0 = 57;
  const THETA0 = THREE.MathUtils.degToRad(29);
  const PHI0 = THREE.MathUtils.degToRad(62);
  let radius = RADIUS0;
  let theta = THETA0;
  let phi = PHI0;
  let dragging = false;
  let panning = false;
  let lastX = 0;
  let lastY = 0;
  let lastInteraction = performance.now();

  function placeCamera() {
    // portrait viewports (the mobile modal) pull the camera back so the
    // whole building still fits the narrower frame
    const fit = camera.aspect < 0.72 ? 0.72 / camera.aspect : 1;
    const r = radius * fit;
    const sr = r * Math.sin(phi);
    camera.position.set(orbit.x + sr * Math.sin(theta), orbit.y + r * Math.cos(phi), orbit.z + sr * Math.cos(theta));
    camera.lookAt(orbit);
  }
  placeCamera();

  const camRight = new THREE.Vector3();
  const camUp = new THREE.Vector3();
  const touches = new Map<number, { x: number; y: number }>();
  let pinchDist = 0;
  function pan(dx: number, dy: number) {
    const k = radius * 0.0007; // ~1 model unit per 25px at the default distance
    camRight.setFromMatrixColumn(camera.matrixWorld, 0);
    camUp.setFromMatrixColumn(camera.matrixWorld, 1);
    orbit.addScaledVector(camRight, -dx * k).addScaledVector(camUp, dy * k);
  }
  function onPointerDown(e: PointerEvent) {
    if (e.pointerType === "touch") {
      touches.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (touches.size === 2) {
        const [a, b] = [...touches.values()];
        pinchDist = Math.hypot(a.x - b.x, a.y - b.y);
        dragging = false; // two fingers: no orbit until one lifts
        return;
      }
    }
    panning = e.button === 1 || e.button === 2 || e.shiftKey;
    dragging = true;
    lastX = e.clientX;
    lastY = e.clientY;
    lastInteraction = performance.now();
    try {
      host.setPointerCapture(e.pointerId);
    } catch {
      // synthetic or already-released pointer — capture is a nicety, not required
    }
  }
  function onPointerMove(e: PointerEvent) {
    if (e.pointerType === "touch" && touches.has(e.pointerId) && touches.size === 2) {
      const prev = [...touches.values()];
      const prevMid = { x: (prev[0].x + prev[1].x) / 2, y: (prev[0].y + prev[1].y) / 2 };
      touches.set(e.pointerId, { x: e.clientX, y: e.clientY });
      const [a, b] = [...touches.values()];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      if (pinchDist > 0) radius = THREE.MathUtils.clamp((radius * pinchDist) / dist, 22, 120);
      pinchDist = dist;
      pan((a.x + b.x) / 2 - prevMid.x, (a.y + b.y) / 2 - prevMid.y);
      lastInteraction = performance.now();
      return;
    }
    if (!dragging) return;
    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;
    lastX = e.clientX;
    lastY = e.clientY;
    if (panning) {
      pan(dx, dy);
    } else {
      theta -= dx * 0.0062;
      phi = THREE.MathUtils.clamp(phi - dy * 0.0062, 0.5, 1.45);
    }
    lastInteraction = performance.now();
  }
  function onPointerUp(e: PointerEvent) {
    touches.delete(e.pointerId);
    pinchDist = 0;
    dragging = false;
    panning = false;
    lastInteraction = performance.now();
    try {
      host.releasePointerCapture(e.pointerId);
    } catch {
      // pointer was already released — nothing to do
    }
  }
  function onWheel(e: WheelEvent) {
    if (!e.ctrlKey && !e.metaKey) return;
    e.preventDefault();
    radius = THREE.MathUtils.clamp(radius * Math.exp(e.deltaY * 0.0016), 22, 120);
    lastInteraction = performance.now();
  }
  function reset() {
    radius = RADIUS0;
    theta = THETA0;
    phi = PHI0;
    orbit.copy(target);
    lastInteraction = performance.now();
  }
  function onContextMenu(e: Event) {
    e.preventDefault(); // right-drag is pan
  }
  host.style.touchAction = "none";
  host.addEventListener("pointerdown", onPointerDown);
  host.addEventListener("wheel", onWheel, { passive: false });
  host.addEventListener("dblclick", reset);
  host.addEventListener("contextmenu", onContextMenu);
  window.addEventListener("pointermove", onPointerMove);
  window.addEventListener("pointerup", onPointerUp);
  window.addEventListener("pointercancel", onPointerUp);

  return {
    /** Call once per frame: auto-rotates when idle and positions the camera. */
    update(now: number) {
      if (!dragging && now - lastInteraction > 1400) theta += 0.0024;
      placeCamera();
    },
    dispose() {
      host.removeEventListener("pointerdown", onPointerDown);
      host.removeEventListener("wheel", onWheel);
      host.removeEventListener("dblclick", reset);
      host.removeEventListener("contextmenu", onContextMenu);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
    },
  };
}
