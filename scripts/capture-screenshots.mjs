/**
 * Capture project homepage screenshots into public/projects/.
 *
 * Run this on your own machine — it needs real internet access.
 *   cd fe
 *   npm i -D playwright && npx playwright install chromium
 *   node scripts/capture-screenshots.mjs            # all targets
 *   node scripts/capture-screenshots.mjs boongg     # one target
 *
 * Output is 1200x750 at 2x DPI, matching the generated placeholders exactly,
 * so replacing an image never requires a code change.
 *
 * READ THIS FIRST: these are the clients' public marketing pages, not the
 * screens you built. Set image.kind to "marketing" in content/projects.ts for
 * anything captured here so the card can caption itself honestly. For
 * Estateguru and NextDecade, a redacted capture of the actual UI you built is
 * a better asset than anything this script can produce.
 */

import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = resolve(ROOT, "public/projects");

const TARGETS = [
  { slug: "estateguru", url: "https://estateguru.co/" },
  { slug: "modcart", url: "https://modcart.io/" },
  { slug: "boongg", url: "https://boongg.com/" },
  { slug: "devtools", url: "https://devtools.simarium.in/" },
];

const CONSENT = [
  "Accept all", "Allow all", "I agree", "Agree", "Accept cookies",
  "Accept", "Got it", "Understood", "Allow cookies", "Nõustun",
];

const only = process.argv[2];
const targets = only ? TARGETS.filter((t) => t.slug === only) : TARGETS;

if (targets.length === 0) {
  console.error(`No target "${only}". Known: ${TARGETS.map((t) => t.slug).join(", ")}`);
  process.exit(1);
}

mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
let failed = 0;

for (const target of targets) {
  const context = await browser.newContext({
    viewport: { width: 1200, height: 750 },
    deviceScaleFactor: 2,
    locale: "en-GB",
  });
  const page = await context.newPage();

  try {
    await page.goto(target.url, { waitUntil: "domcontentloaded", timeout: 45000 });
    await page.waitForTimeout(3500);
    await dismissConsent(page);
    await removeStickyOverlays(page);
    await page.waitForTimeout(500);
    await page.screenshot({ path: resolve(OUT, `${target.slug}.png`) });
    console.log(`captured  ${target.slug}`);
  } catch (error) {
    failed += 1;
    console.error(`failed    ${target.slug}  ${error.message.split("\n")[0]}`);
  }

  await context.close();
}

await browser.close();
process.exit(failed > 0 ? 1 : 0);

async function dismissConsent(page) {
  for (const label of CONSENT) {
    try {
      const button = page.getByRole("button", { name: label, exact: false }).first();
      if (await button.isVisible({ timeout: 700 })) {
        await button.click({ timeout: 1500 });
        await page.waitForTimeout(900);
        return;
      }
    } catch {
      // try the next label
    }
  }
}

/** Strip cookie bars, chat widgets and newsletter modals that cover the hero. */
async function removeStickyOverlays(page) {
  await page.evaluate(() => {
    const junk = /cookie|consent|gdpr|cmp|onetrust|banner|modal|popup|newsletter|intercom|drift|crisp/i;
    for (const el of document.querySelectorAll("div, section, aside, dialog, iframe")) {
      const style = getComputedStyle(el);
      const stuck = style.position === "fixed" || style.position === "sticky";
      if (!stuck || el.offsetHeight < 90) continue;
      const identity = `${el.id || ""} ${el.className?.toString?.() ?? ""}`;
      if (junk.test(identity)) el.remove();
    }
  });
}
