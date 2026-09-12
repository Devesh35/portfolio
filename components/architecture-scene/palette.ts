import * as THREE from "three";

/**
 * Colours + the five section callouts for the hero's 3D scene.
 *
 * Dev, round 5 ("update all the colors to be platform colors only"): every
 * hex here matches an actual token used elsewhere on the site —
 * app/globals.css's @theme block or the systems-tree.tsx ACCENT map. The one
 * exception is RED (round-5 database spec): there is no red in either
 * source, so it's a new hex chosen to match the accents' muted saturation.
 */
export const LINE = 0xf3f6fa; // --color-text
export const LINE_DIM = 0x8b96a5; // --color-dim
export const LINE_FAINT = 0x4a5563; // --color-line-bright
export const EMBER = 0xff7a45; // --color-ember
export const EMBER_DIM = 0x9c4a26; // --color-ember-dim (elevator cars/doors)
export const STEEL = 0x7fbcff; // --color-steel
export const GOLD = 0xe5c07b; // systems-tree ACCENT.test / ACCENT.cicd
export const MINT = 0x4fd1a5; // --color-mint / systems-tree ACCENT.data
export const VIOLET = 0xa78bfa; // systems-tree ACCENT.api / ACCENT.integrations
export const RED = 0xe06c75; // NOT an existing platform token — see above

// Only the five section callouts render as text (Dev, 2026-09-11: "only show
// main labels ... remove all other text"). `anchor` is where the leader line
// touches the model; `end` is where the HTML label is pinned.
export type MajorLabel = {
  id: string;
  title: string;
  anchor: THREE.Vector3;
  end: THREE.Vector3;
  color: number;
};

export const MAJOR_LABELS: MajorLabel[] = [
  {
    id: "frontend",
    title: "Frontend",
    anchor: new THREE.Vector3(-6.2, 4.6, 0.2),
    end: new THREE.Vector3(-9.6, 5.5, 0.2),
    color: EMBER,
  },
  {
    id: "api",
    title: "API",
    // round 32: anchored on the front (+Z) face of the shafts just under
    // the machine room, with the text floating above the roofline — the
    // old machine-room anchor ran its leader across the observation room
    anchor: new THREE.Vector3(1.1, 12.9, 3.0),
    end: new THREE.Vector3(-1.2, 16.2, 4.6),
    color: EMBER,
  },
  {
    id: "backend",
    title: "Backend",
    anchor: new THREE.Vector3(-6.2, -1.7, 0.2),
    end: new THREE.Vector3(-9.6, -2.1, 0.2),
    color: EMBER,
  },
  {
    id: "external",
    title: "External integrations",
    // anchored at the pipes' floor-level exit; text pushed out and ABOVE
    // ground so it never sits inside the pipe cluster (rounds 6/9)
    anchor: new THREE.Vector3(8.6, -2.6, 0),
    end: new THREE.Vector3(12.0, -5.2, 0.6), // below ground, beside the pipes' exit (Dev, round 37)
    color: EMBER,
  },
  {
    id: "infra",
    title: "Infra",
    anchor: new THREE.Vector3(2.6, -3.6, 3.7),
    end: new THREE.Vector3(2.0, -5.3, 5.6),
    color: EMBER,
  },
];
