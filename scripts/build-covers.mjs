/**
 * Generates the project cover art in public/projects/ — 1200×750 PNGs drawn
 * in the site's own visual language: graphite ground, hairline grid, one
 * line-art motif per product domain, steel for client work and ember for
 * Dev's own projects.
 *
 * These are deliberately stylized covers, not screenshots, and the site labels
 * them as such (image.kind: "cover"). Regenerate after changing a name or
 * domain in content/projects.ts:
 *
 *   node scripts/build-covers.mjs          # needs playwright + Geist (node_modules)
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = resolve(ROOT, "public", "projects");
const ART = resolve(OUT, "art");

const W = 1200;
const H = 750;

const C = {
  ground: "#0b0d10",
  surface: "#101318",
  raised: "#161a20",
  line: "#222831",
  bright: "#333b46",
  text: "#e9ecf1",
  muted: "#98a1ac",
  dim: "#6b7480",
  ember: "#e8734a",
  emberDim: "#7b3b23",
  steel: "#79a6d2",
  steelDim: "#3a5875",
};

/* --------------------------------------------------------------- helpers */

const grid = () => {
  let s = "";
  for (let x = 60; x < W; x += 60) s += `<line x1="${x}" y1="0" x2="${x}" y2="${H}" stroke="${C.line}" stroke-width="1" opacity="0.28"/>`;
  for (let y = 60; y < H; y += 60) s += `<line x1="0" y1="${y}" x2="${W}" y2="${y}" stroke="${C.line}" stroke-width="1" opacity="0.28"/>`;
  return s;
};

const glow = (accent, cx = 800, cy = 330) =>
  `<circle cx="${cx}" cy="${cy}" r="330" fill="${accent}" opacity="0.055" filter="url(#soft)"/>`;

const panel = (x, y, w, h, r = 2) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${C.surface}" stroke="${C.bright}" stroke-width="2"/>`;

const P = (pts) => pts.map(([x, y]) => `${x},${y}`).join(" ");

/* ---------------------------------------------------------------- motifs */
/* Every motif draws inside roughly x 560–1140, y 90–560 and answers one
   question: what kind of system was this? Line art only — no fake pixels. */

const motifs = {
  /* Property lending: skyline with a loan curve climbing across it. */
  estateguru(a) {
    const win = (bx, by, cols, rows) => {
      let s = "";
      for (let i = 0; i < cols; i++)
        for (let j = 0; j < rows; j++)
          s += `<rect x="${bx + 18 + i * 30}" y="${by + 20 + j * 38}" width="14" height="18" fill="none" stroke="${C.bright}" stroke-width="2"/>`;
      return s;
    };
    return `
      ${panel(600, 250, 130, 310)} ${win(600, 250, 3, 7)}
      ${panel(760, 150, 160, 410)} ${win(760, 150, 4, 10)}
      ${panel(950, 320, 120, 240)} ${win(950, 320, 3, 5)}
      <polyline points="${P([[560, 470], [680, 420], [800, 330], [930, 260], [1080, 150]])}"
        fill="none" stroke="${a}" stroke-width="3.5" stroke-linejoin="round"/>
      ${[[560, 470], [680, 420], [800, 330], [930, 260], [1080, 150]]
        .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="6" fill="${C.ground}" stroke="${a}" stroke-width="3"/>`)
        .join("")}
      <line x1="560" y1="560" x2="1110" y2="560" stroke="${C.bright}" stroke-width="2"/>
    `;
  },

  /* Observability: log stream, a lens over one line, the pulse it found. */
  nextdecade(a) {
    const row = (y, segs, hot = false) =>
      segs
        .map(
          ([x, w]) =>
            `<line x1="${x}" y1="${y}" x2="${x + w}" y2="${y}" stroke="${hot ? a : C.bright}" stroke-width="${hot ? 5 : 4}" stroke-linecap="round" opacity="${hot ? 1 : 0.8}"/>`,
        )
        .join("");
    return `
      ${row(150, [[580, 90], [700, 200], [930, 130]])}
      ${row(200, [[580, 160], [770, 90], [890, 180]])}
      ${row(250, [[580, 60], [670, 240], [940, 120]], true)}
      ${row(300, [[580, 200], [810, 110], [950, 100]])}
      ${row(350, [[580, 120], [730, 170], [930, 140]])}
      <circle cx="810" cy="250" r="72" fill="none" stroke="${a}" stroke-width="3.5"/>
      <line x1="862" y1="302" x2="922" y2="362" stroke="${a}" stroke-width="3.5" stroke-linecap="round"/>
      <polyline points="${P([[600, 480], [700, 480], [730, 430], [770, 530], [805, 455], [830, 480], [1090, 480]])}"
        fill="none" stroke="${a}" stroke-width="3" stroke-linejoin="round"/>
      <circle cx="770" cy="530" r="5" fill="${a}"/>
    `;
  },

  /* AdTech: one creative broadcast into many placements, analytics below. */
  modcart(a) {
    const bars = [[900, 42], [940, 74], [980, 58], [1020, 96]]
      .map(([x, h]) => `<rect x="${x}" y="${540 - h}" width="24" height="${h}" fill="none" stroke="${a}" stroke-width="3"/>`)
      .join("");
    return `
      ${panel(580, 130, 260, 200, 4)}
      <line x1="580" y1="170" x2="840" y2="170" stroke="${C.bright}" stroke-width="2"/>
      <circle cx="602" cy="150" r="5" fill="${C.bright}"/><circle cx="622" cy="150" r="5" fill="${C.bright}"/><circle cx="642" cy="150" r="5" fill="${C.bright}"/>
      <rect x="604" y="192" width="90" height="110" fill="none" stroke="${a}" stroke-width="3"/>
      <line x1="714" y1="205" x2="816" y2="205" stroke="${C.bright}" stroke-width="4" stroke-linecap="round"/>
      <line x1="714" y1="235" x2="790" y2="235" stroke="${C.bright}" stroke-width="4" stroke-linecap="round"/>
      <line x1="714" y1="282" x2="770" y2="282" stroke="${a}" stroke-width="5" stroke-linecap="round"/>
      <path d="M 840 230 C 940 230, 950 170, 1010 170" fill="none" stroke="${C.bright}" stroke-width="2.5" stroke-dasharray="2 7"/>
      <path d="M 840 250 C 930 255, 940 300, 1000 305" fill="none" stroke="${C.bright}" stroke-width="2.5" stroke-dasharray="2 7"/>
      ${panel(1010, 140, 110, 66, 3)}${panel(1000, 275, 130, 66, 3)}
      <rect x="1026" y="158" width="30" height="30" fill="none" stroke="${a}" stroke-width="2.5"/>
      <rect x="1016" y="293" width="30" height="30" fill="none" stroke="${a}" stroke-width="2.5"/>
      ${bars}
      <line x1="880" y1="540" x2="1070" y2="540" stroke="${C.bright}" stroke-width="2"/>
    `;
  },

  /* Mobility: a scooter drawn from geometry, on a routed, pinned path. */
  boongg(a) {
    return `
      <path d="M 590 470 C 700 430, 830 500, 950 450 S 1090 380, 1110 330"
        fill="none" stroke="${C.bright}" stroke-width="3" stroke-dasharray="4 12" stroke-linecap="round"/>
      <circle cx="1110" cy="300" r="18" fill="none" stroke="${a}" stroke-width="3.5"/>
      <path d="M 1110 318 L 1110 350" stroke="${a}" stroke-width="3.5" stroke-linecap="round"/>
      <circle cx="700" cy="360" r="52" fill="none" stroke="${a}" stroke-width="4"/>
      <circle cx="920" cy="360" r="52" fill="none" stroke="${a}" stroke-width="4"/>
      <circle cx="700" cy="360" r="8" fill="${a}"/><circle cx="920" cy="360" r="8" fill="${a}"/>
      <path d="M 700 360 L 790 360 L 830 270 L 900 270 M 920 360 L 860 360 L 830 270"
        fill="none" stroke="${C.muted}" stroke-width="4" stroke-linejoin="round"/>
      <path d="M 812 270 L 770 190 L 740 190 M 770 190 L 800 175"
        fill="none" stroke="${C.muted}" stroke-width="4" stroke-linecap="round"/>
      <rect x="838" y="240" width="60" height="30" rx="4" fill="none" stroke="${C.bright}" stroke-width="3"/>
    `;
  },

  /* Sports management: the roster grid and the team graph around it. */
  goapi(a) {
    const dots = [
      [620, 160], [1060, 160], [620, 470], [1060, 470],
    ];
    let cal = "";
    for (let i = 0; i < 4; i++)
      for (let j = 0; j < 3; j++) {
        const hot = (i === 2 && j === 1) || (i === 0 && j === 2);
        cal += `<rect x="${770 + i * 40}" y="${255 + j * 40}" width="26" height="26" fill="none" stroke="${hot ? a : C.bright}" stroke-width="${hot ? 3 : 2}"/>`;
      }
    return `
      ${panel(750, 200, 180, 200, 4)}
      <line x1="750" y1="238" x2="930" y2="238" stroke="${C.bright}" stroke-width="2"/>
      ${cal}
      ${dots
        .map(
          ([x, y]) => `
        <circle cx="${x}" cy="${y}" r="18" fill="none" stroke="${a}" stroke-width="3"/>
        <circle cx="${x}" cy="${y - 6}" r="6" fill="none" stroke="${a}" stroke-width="2.5"/>
        <path d="M ${x - 9} ${y + 9} C ${x - 4} ${y + 1}, ${x + 4} ${y + 1}, ${x + 9} ${y + 9}" fill="none" stroke="${a}" stroke-width="2.5"/>`,
        )
        .join("")}
      <path d="M 638 165 L 748 240 M 1042 165 L 932 240 M 638 462 L 748 372 M 1042 462 L 932 372"
        stroke="${C.bright}" stroke-width="2.5" stroke-dasharray="2 7"/>
    `;
  },

  /* Health & fitness: activity arcs with the trace that feeds them. */
  wellcompanion(a) {
    const arc = (r, o, sweep) =>
      `<circle cx="840" cy="300" r="${r}" fill="none" stroke="${o ? a : C.bright}" stroke-width="10"
        stroke-linecap="round" stroke-dasharray="${sweep} ${2 * Math.PI * r}" opacity="${o ? 1 : 0.55}"
        transform="rotate(-90 840 300)"/>`;
    return `
      ${arc(150, false, 2 * Math.PI * 150)}
      ${arc(150, true, 2 * Math.PI * 150 * 0.72)}
      ${arc(112, false, 2 * Math.PI * 112)}
      ${arc(112, true, 2 * Math.PI * 112 * 0.45)}
      <polyline points="${P([[600, 520], [740, 520], [780, 470], [830, 560], [880, 490], [910, 520], [1080, 520]])}"
        fill="none" stroke="${a}" stroke-width="3" stroke-linejoin="round"/>
      <circle cx="840" cy="300" r="7" fill="${a}"/>
    `;
  },

  /* Financial analysis: dashboards over a data table. */
  datachamps(a) {
    const bars = [[634, 60], [668, 100], [702, 76], [736, 130]]
      .map(([x, h]) => `<rect x="${x}" y="${280 - h}" width="22" height="${h}" fill="none" stroke="${a}" stroke-width="3"/>`)
      .join("");
    const rows = [0, 1, 2, 3]
      .map(
        (i) => `
      <line x1="620" y1="${406 + i * 40}" x2="760" y2="${406 + i * 40}" stroke="${C.bright}" stroke-width="4" stroke-linecap="round"/>
      <line x1="800" y1="${406 + i * 40}" x2="880" y2="${406 + i * 40}" stroke="${C.bright}" stroke-width="4" stroke-linecap="round" opacity="0.6"/>
      <line x1="920" y1="${406 + i * 40}" x2="${960 + i * 30}" y2="${406 + i * 40}" stroke="${i === 2 ? a : C.bright}" stroke-width="4" stroke-linecap="round"/>`,
      )
      .join("");
    return `
      ${panel(600, 130, 180, 180, 4)}${bars}
      ${panel(820, 130, 300, 180, 4)}
      <polyline points="${P([[850, 270], [910, 220], [970, 245], [1030, 175], [1090, 190]])}"
        fill="none" stroke="${a}" stroke-width="3" stroke-linejoin="round"/>
      ${panel(600, 370, 520, 190, 4)}
      ${rows}
    `;
  },

  /* E-commerce support: the parcel between storefront and buyer. */
  tradegully(a) {
    return `
      <path d="M 780 230 L 900 175 L 1020 230 L 1020 370 L 900 425 L 780 370 Z"
        fill="none" stroke="${C.muted}" stroke-width="4" stroke-linejoin="round"/>
      <path d="M 780 230 L 900 285 L 1020 230 M 900 285 L 900 425"
        fill="none" stroke="${C.muted}" stroke-width="4" stroke-linejoin="round"/>
      <path d="M 840 202 L 960 258" fill="none" stroke="${a}" stroke-width="3.5"/>
      ${panel(580, 130, 120, 90, 4)}
      <path d="M 580 160 L 700 160 M 596 130 L 596 118 L 684 118 L 684 130" stroke="${C.bright}" stroke-width="3" fill="none"/>
      <circle cx="640" cy="190" r="10" fill="none" stroke="${a}" stroke-width="3"/>
      <path d="M 700 175 C 740 175, 745 200, 778 216" fill="none" stroke="${C.bright}" stroke-width="2.5" stroke-dasharray="2 7"/>
      <path d="M 1020 390 C 1065 400, 1080 440, 1080 480" fill="none" stroke="${C.bright}" stroke-width="2.5" stroke-dasharray="2 7"/>
      <path d="M 1062 462 L 1080 480 L 1092 456" fill="none" stroke="${C.bright}" stroke-width="2.5"/>
    `;
  },

  /* Dental practice management: the tooth and its appointment book. */
  bestosys(a) {
    let cal = "";
    for (let i = 0; i < 3; i++)
      for (let j = 0; j < 3; j++) {
        const hot = i === 1 && j === 1;
        cal += `<rect x="${960 + i * 44}" y="${296 + j * 44}" width="28" height="28" fill="none" stroke="${hot ? a : C.bright}" stroke-width="${hot ? 3 : 2}"/>`;
      }
    return `
      <path d="M 640 200
               C 660 150, 730 150, 750 200
               C 770 150, 840 150, 860 200
               C 885 260, 860 330, 830 420
               C 815 465, 790 465, 782 420
               L 762 330 C 756 305, 744 305, 738 330
               L 718 420 C 710 465, 685 465, 670 420
               C 640 330, 615 260, 640 200 Z"
        fill="none" stroke="${a}" stroke-width="4" stroke-linejoin="round"/>
      ${panel(940, 240, 160, 160, 4)}
      <line x1="940" y1="278" x2="1100" y2="278" stroke="${C.bright}" stroke-width="2"/>
      <line x1="968" y1="240" x2="968" y2="222" stroke="${C.bright}" stroke-width="3"/>
      <line x1="1072" y1="240" x2="1072" y2="222" stroke="${C.bright}" stroke-width="3"/>
      ${cal}
      <path d="M 862 300 C 900 300, 905 320, 938 320" fill="none" stroke="${C.bright}" stroke-width="2.5" stroke-dasharray="2 7"/>
    `;
  },

  /* Hospitality: table, order ticket, both sides of the hand-off. */
  "dine-in"(a) {
    return `
      <circle cx="740" cy="330" r="120" fill="none" stroke="${C.muted}" stroke-width="4"/>
      <circle cx="700" cy="290" r="34" fill="none" stroke="${a}" stroke-width="3"/>
      <circle cx="790" cy="380" r="34" fill="none" stroke="${a}" stroke-width="3"/>
      <circle cx="700" cy="290" r="20" fill="none" stroke="${C.bright}" stroke-width="2"/>
      <circle cx="790" cy="380" r="20" fill="none" stroke="${C.bright}" stroke-width="2"/>
      ${panel(950, 180, 150, 210, 3)}
      <path d="M 950 390 L 965 375 L 980 390 L 995 375 L 1010 390 L 1025 375 L 1040 390 L 1055 375 L 1070 390 L 1085 375 L 1100 390"
        fill="none" stroke="${C.bright}" stroke-width="2.5"/>
      <line x1="972" y1="215" x2="1078" y2="215" stroke="${C.bright}" stroke-width="4" stroke-linecap="round"/>
      <line x1="972" y1="250" x2="1050" y2="250" stroke="${C.bright}" stroke-width="4" stroke-linecap="round"/>
      <line x1="972" y1="285" x2="1066" y2="285" stroke="${C.bright}" stroke-width="4" stroke-linecap="round"/>
      <circle cx="972" cy="330" r="7" fill="none" stroke="${a}" stroke-width="3"/>
      <path d="M 990 330 L 1030 330" stroke="${a}" stroke-width="4" stroke-linecap="round"/>
      <path d="M 866 300 C 905 285, 915 240, 948 235" fill="none" stroke="${C.bright}" stroke-width="2.5" stroke-dasharray="2 7"/>
    `;
  },

  /* Dev's own: the commit graph — the same idiom as the /work timeline. */
  devtools(a) {
    const spine = 700;
    const lane = 830;
    const lane2 = 950;
    return `
      <line x1="${spine}" y1="120" x2="${spine}" y2="560" stroke="${C.muted}" stroke-width="4"/>
      ${[160, 250, 340, 470, 540].map((y) => `<circle cx="${spine}" cy="${y}" r="9" fill="${C.ground}" stroke="${C.muted}" stroke-width="3.5"/>`).join("")}
      <path d="M ${spine} 470 C ${spine} 420, ${lane} 440, ${lane} 390 L ${lane} 300 C ${lane} 250, ${spine} 270, ${spine} 250"
        fill="none" stroke="${a}" stroke-width="4"/>
      <circle cx="${lane}" cy="390" r="9" fill="${C.ground}" stroke="${a}" stroke-width="3.5"/>
      <circle cx="${lane}" cy="300" r="9" fill="${C.ground}" stroke="${a}" stroke-width="3.5"/>
      <path d="M ${lane} 390 C ${lane} 350, ${lane2} 370, ${lane2} 320 L ${lane2} 230"
        fill="none" stroke="${C.steel}" stroke-width="3.5"/>
      <circle cx="${lane2}" cy="320" r="9" fill="${C.ground}" stroke="${C.steel}" stroke-width="3.5"/>
      <circle cx="${lane2}" cy="230" r="9" fill="none" stroke="${C.steel}" stroke-width="3.5"/>
      <circle cx="${spine}" cy="160" r="15" fill="none" stroke="${a}" stroke-width="3.5"/>
      <text x="1000" y="470" font-family="mono" font-size="26" fill="${C.dim}">rebase</text>
      <text x="1000" y="510" font-family="mono" font-size="26" fill="${C.dim}">merge</text>
      <text x="1000" y="550" font-family="mono" font-size="26" fill="${C.dim}">cherry-pick</text>
    `;
  },
};

/* ---------------------------------------------------------------- covers */

const covers = [
  { slug: "estateguru", name: "Estateguru", domain: "FinTech · Real Estate", track: "client" },
  { slug: "nextdecade", name: "NextDecade Observability", domain: "AIOps", track: "client" },
  { slug: "modcart", name: "Modcart", domain: "AdTech", track: "client" },
  { slug: "boongg", name: "Boongg", domain: "Mobility", track: "client" },
  { slug: "goapi", name: "GOAPI", domain: "Sports Management", track: "client" },
  { slug: "wellcompanion", name: "WellCompanion", domain: "Health & Fitness", track: "client" },
  { slug: "datachamps", name: "Datachamps", domain: "FinTech", track: "client" },
  { slug: "tradegully", name: "Tradegully", domain: "E-commerce", track: "client" },
  { slug: "bestosys", name: "Bestosys", domain: "HealthTech", track: "client" },
  { slug: "dine-in", name: "Dine In", domain: "Hospitality", track: "personal" },
  { slug: "devtools", name: "DevTools", domain: "Developer Tools · Simarium", track: "personal" },
];

/** Motif only, transparent — the ghosted background art on project pages. */
function artSvgFor(cover) {
  const accent = cover.track === "personal" ? C.ember : C.steel;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs><filter id="soft" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="70"/></filter></defs>
  ${motifs[cover.slug](accent)}
</svg>`;
}

function svgFor(cover) {
  const accent = cover.track === "personal" ? C.ember : C.steel;
  const motif = motifs[cover.slug](accent);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs><filter id="soft" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="70"/></filter></defs>
  <rect width="${W}" height="${H}" fill="${C.ground}"/>
  ${grid()}
  ${glow(accent)}
  ${motif}
  <line x1="72" y1="586" x2="132" y2="586" stroke="${accent}" stroke-width="5"/>
  <text x="72" y="640" font-family="mono" font-size="22" letter-spacing="4" fill="${C.dim}">${cover.domain.toUpperCase()}</text>
  <text x="72" y="694" font-family="sans" font-size="46" font-weight="600" fill="${C.text}">${cover.name}</text>
  <text x="1128" y="694" text-anchor="end" font-family="mono" font-size="20" fill="${C.dim}" opacity="0.7">${cover.track === "personal" ? "PERSONAL" : "NIRMITEE.IO"}</text>
</svg>`;
}

/* ---------------------------------------------------------------- render */

const fontCss = () => {
  const sans = resolve(ROOT, "node_modules/geist/dist/fonts/geist-sans/Geist-SemiBold.woff2");
  const mono = resolve(ROOT, "node_modules/geist/dist/fonts/geist-mono/GeistMono-Regular.woff2");
  return `
    @font-face { font-family: sans; src: url("file://${sans}"); font-weight: 600; }
    @font-face { font-family: mono; src: url("file://${mono}"); }
    * { margin: 0; } body { width: ${W}px; height: ${H}px; }
  `;
};

const { chromium } = await import("playwright");
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: W, height: H } });

mkdirSync(ART, { recursive: true });
const tmp = resolve(ROOT, ".cover-tmp.html");
for (const cover of covers) {
  const html = `<!doctype html><style>${fontCss()}</style>${svgFor(cover)}`;
  writeFileSync(tmp, html, "utf8");
  await page.goto(`file://${tmp}`);
  await page.evaluate(() => document.fonts.ready);
  const out = resolve(OUT, `${cover.slug}.png`);
  await page.screenshot({ path: out });
  console.log(`wrote ${out}`);

  writeFileSync(tmp, `<!doctype html><style>${fontCss()} body { background: transparent; }</style>${artSvgFor(cover)}`, "utf8");
  await page.goto(`file://${tmp}`);
  const artOut = resolve(ART, `${cover.slug}.png`);
  await page.screenshot({ path: artOut, omitBackground: true });
  console.log(`wrote ${artOut}`);
}
const { unlinkSync } = await import("node:fs");
unlinkSync(tmp);

await browser.close();
