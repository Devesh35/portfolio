"use client";

import * as THREE from "three";
import { useEffect, useRef, useState } from "react";

import { ArchitectureFallback } from "@/components/architecture-preview";
import { createOrbitControls } from "@/components/architecture-scene/controls";
import { createKit } from "@/components/architecture-scene/kit";
import { MAJOR_LABELS } from "@/components/architecture-scene/palette";
import { buildBackdrop } from "@/components/architecture-scene/backdrop";
import { buildBasement, buildFoundation } from "@/components/architecture-scene/basement";
import { buildElevators } from "@/components/architecture-scene/elevators";
import { buildFrontendShell } from "@/components/architecture-scene/frontend-shell";
import { buildInteriors } from "@/components/architecture-scene/interiors";
import { buildControlTower } from "@/components/architecture-scene/control-tower";
import { buildDeckTerrace } from "@/components/architecture-scene/deck-terrace";
import { buildDeckRoof, buildRoofPlant } from "@/components/architecture-scene/rooftop";
import { buildUtilities } from "@/components/architecture-scene/utilities";

/**
 * Software architecture drawn as a rotatable 3D line-art building cutaway:
 * frontend floors above ground, elevator shafts standing in for the API, a
 * server-room basement for the backend, colour-coded utility pipes for
 * third-party integrations, and a foundation slab for infra.
 *
 * This file owns only the renderer, camera orbit, label projection and the
 * render loop. Geometry lives in components/architecture-scene/*, one
 * module per section of the building, all drawing through the shared kit
 * (hidden-line boxes + camera-facing silhouettes for round parts).
 *
 * WebGL is fed dynamically (code-split via next/dynamic) and never rendered
 * during SSR; a browser without a context shows the rendered still instead
 * (round 52 — the fallback came back, now generated from the scene itself).
 */

function hasWebGL(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    return !!(window.WebGLRenderingContext && (canvas.getContext("webgl2") || canvas.getContext("webgl")));
  } catch {
    return false;
  }
}

/**
 * `feather` (desktop hero): a solid ground-coloured disc behind the canvas
 * hides the page's dot grid under the building and lets it fade back in
 * toward the edges, and the canvas itself is masked to fade out at its
 * edges so the scene sits in the page without a hard rectangle. Off in the
 * mobile modal, which fills the screen.
 */
// Round 55: the horizontal radius is exactly half the width, so the mask
// reaches 0 at the left/right edges instead of leaving a hard cut (a 62%
// radius left ~40% opacity there, visible on narrow hero columns). The
// vertical radius stays a little over half so the machine room and the
// foundation aren't faded away with the frame.
const DOT_SHIELD = "radial-gradient(ellipse 50% 56% at 50% 50%, #000 0%, #000 40%, transparent 100%)";
const CANVAS_FEATHER = "radial-gradient(ellipse 50% 56% at 50% 50%, #000 68%, transparent 100%)";

type Props = {
  hint?: boolean;
  feather?: boolean;
  /** Show the rendered still when WebGL is missing (desktop hero). The mobile modal already showed it on its button, so it gets a one-line note instead. */
  fallback?: boolean;
};

export function ArchitectureScene({ hint = true, feather = true, fallback = true }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const hostRef = useRef<HTMLDivElement | null>(null);
  const majorRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const [supported] = useState<boolean | null>(() => hasWebGL());

  useEffect(() => {
    if (!supported) return;
    const container = containerRef.current;
    const host = hostRef.current;
    if (!container || !host) return;

    let raf = 0;
    let disposed = false;

    /* ------------------------------------------------- renderer / scene */
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    // 1-px GL lines get almost nothing from MSAA on a 1× display, so always
    // supersample to at least 2× the CSS size (round 7: "edges look jagged").
    // On small screens (the mobile modal) the native DPR is already 2–3×
    // and the GPU is weaker, so don't force extra supersampling there.
    const dpr = window.devicePixelRatio || 1;
    renderer.setPixelRatio(window.innerWidth < 992 ? Math.min(dpr, 2) : Math.min(Math.max(dpr, 2), 3));
    renderer.domElement.style.display = "block";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 300);
    // round 27: the tower grew to ~15 units, so the orbit centre moved up and
    // out a little to keep the machine room inside the frame at every angle
    const target = new THREE.Vector3(0, 4.0, 0); // building centre — the backdrop fade is measured from here

    let width = 1;
    let height = 1;
    function applySize() {
      width = container?.clientWidth || 1;
      height = container?.clientHeight || 1;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    }
    applySize();
    const ro = new ResizeObserver(() => applySize());
    ro.observe(container);

    /* --------------------------------------------------------- controls */
    const controls = createOrbitControls(host, camera, target);

    /* ------------------------------------------------------------ build */
    const world = new THREE.Group();
    scene.add(world);
    const kit = createKit(world);
    const updateBackdrop = buildBackdrop(kit, target);
    buildFrontendShell(kit);
    buildInteriors(kit);
    buildDeckRoof(kit);
    buildDeckTerrace(kit);
    buildRoofPlant(kit);
    buildElevators(kit);
    buildControlTower(kit);
    buildBasement(kit);
    buildFoundation(kit);
    buildUtilities(kit);
    MAJOR_LABELS.forEach((l) => {
      world.add(kit.lines([l.anchor.x, l.anchor.y, l.anchor.z, l.end.x, l.end.y, l.end.z], l.color, 0.55));
      world.add(kit.place(kit.edged(new THREE.IcosahedronGeometry(0.09, 0), l.color, 0.9), l.anchor.x, l.anchor.y, l.anchor.z));
    });

    /* ------------------------------------------------------------- loop */
    function updateLabels() {
      const margin = 50;
      MAJOR_LABELS.forEach((l) => {
        const el = majorRefs.current.get(l.id);
        if (!el) return;
        const p = l.end.clone().project(camera);
        const x = (p.x * 0.5 + 0.5) * width;
        const y = (-p.y * 0.5 + 0.5) * height;
        const visible = p.z < 1 && x > -margin && x < width + margin && y > -margin && y < height + margin;
        el.style.transform = `translate(${x}px, ${y}px)`;
        el.style.opacity = visible ? "1" : "0";
      });
    }
    function animate(now: number) {
      if (disposed) return;
      raf = requestAnimationFrame(animate);
      controls.update(now);
      updateBackdrop(camera);
      kit.updateSilhouettes(camera);
      renderer.render(scene, camera);
      updateLabels();
    }
    raf = requestAnimationFrame(animate);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      controls.dispose();
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh || obj instanceof THREE.LineSegments || obj instanceof THREE.Line) {
          obj.geometry.dispose();
          const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
          mats.forEach((m) => m.dispose());
        }
      });
      renderer.dispose();
      if (renderer.domElement.parentElement === host) host.removeChild(renderer.domElement);
    };
  }, [supported]);

  if (supported === false) {
    if (fallback) return <ArchitectureFallback />;
    return (
      <p className="flex h-full items-center justify-center px-6 text-center font-mono text-xs uppercase tracking-[0.14em] text-dim">
        This browser can&apos;t draw 3D (no WebGL)
      </p>
    );
  }

  return (
    <div ref={containerRef} className="relative h-full min-h-[26rem] w-full select-none">
      {feather && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-ground"
          style={{ maskImage: DOT_SHIELD, WebkitMaskImage: DOT_SHIELD }}
        />
      )}
      <div
        ref={hostRef}
        className="absolute inset-0 cursor-grab active:cursor-grabbing"
        style={feather ? { maskImage: CANVAS_FEATHER, WebkitMaskImage: CANVAS_FEATHER } : undefined}
      />

      {MAJOR_LABELS.map((l) => (
        <div
          key={l.id}
          ref={(el) => {
            if (el) majorRefs.current.set(l.id, el);
          }}
          className="pointer-events-none absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap opacity-0 transition-opacity duration-150"
        >
          <p className="label whitespace-nowrap">{l.title}</p>
        </div>
      ))}

      {hint && (
        <p className="pointer-events-none absolute bottom-2 left-2 font-mono text-[0.5625rem] uppercase tracking-[0.14em] text-dim/70">
          Drag to rotate · Shift+drag to pan · Ctrl+scroll to zoom · Double-click to reset
        </p>
      )}
    </div>
  );
}
