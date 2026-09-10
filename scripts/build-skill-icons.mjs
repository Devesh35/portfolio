/**
 * Generates content/skill-icons.ts — real brand marks for the skills page.
 *
 *   node scripts/build-skill-icons.mjs
 *
 * Sources, in the order they are tried:
 *   @iconify-json/logos        SVG Logos (gilbarbara) — full-colour brand marks,
 *                              including the individual AWS services
 *   devicon                    square marks the logos set only has as wordmarks
 *   simple-icons               single-path marks the other sets lack
 *   @iconify-json/skill-icons  last-resort brand fallback
 *   monogram                   no licensable mark exists — the UI draws letters
 *
 * Every mark is inlined into a generated TS file at build time, so the site
 * ships no icon dependency and makes no network request for an icon. The icon
 * packages stay devDependencies.
 */

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { register } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

register("./alias-hook.mjs", import.meta.url);

const require = createRequire(import.meta.url);
const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..");
const OUT = resolve(ROOT, "content/skill-icons.ts");

const { skillGroups } = await import("../content/skills.ts");

const logos = require("@iconify-json/logos/icons.json");
const simple = require("simple-icons");
const skillset = require("@iconify-json/skill-icons/icons.json");

/* ------------------------------------------------------------------ mapping */

/** skill name -> icon, as "<set>:<name>" or "devicon:<file>". */
const ICONS = {
  /* frontend & mobile */
  "Next.js": "logos:nextjs-icon",
  React: "logos:react",
  "React Native": "logos:react",
  TypeScript: "logos:typescript-icon",
  "JavaScript (ES6+)": "logos:javascript",
  Redux: "logos:redux",
  "Tailwind CSS": "simple:tailwindcss",
  "Android (Java, Kotlin)": "simple:android",
  "Android (Kotlin)": "logos:kotlin-icon",
  "Electron.js": "logos:electron",

  /* backend */
  "Node.js": "logos:nodejs-icon",
  "Express.js": "simple:express",
  WebSocket: "logos:websocket",
  "Apache Kafka": "logos:kafka-icon",
  "Swagger / OpenAPI": "logos:swagger",

  /* data */
  MongoDB: "logos:mongodb-icon",
  PostgreSQL: "logos:postgresql",
  Redis: "logos:redis",
  Firebase: "logos:firebase-icon",

  /* aws — the logos set carries every service mark */
  AWS: "logos:aws",
  "Amazon EC2": "logos:aws-ec2",
  "AWS Elastic Beanstalk": "logos:aws-elastic-beanstalk",
  "Amazon ECS": "logos:aws-ecs",
  "AWS Lambda": "logos:aws-lambda",
  "Amazon S3": "logos:aws-s3",
  "Amazon RDS": "logos:aws-rds",
  "Amazon DynamoDB": "logos:aws-dynamodb",
  "Amazon Route 53": "logos:aws-route53",
  "Elastic Load Balancing": "logos:aws-elb",
  "Amazon CloudFront": "logos:aws-cloudfront",
  "Amazon SNS": "logos:aws-sns",
  "Amazon SQS": "logos:aws-sqs",
  "AWS IAM": "logos:aws-iam",
  "Amazon CloudWatch": "logos:aws-cloudwatch",
  CloudFormation: "logos:aws-cloudformation",

  /* azure — only the platform mark is published in an open set */
  Azure: "devicon:azure/azure-original.svg",
  "Azure App Service": "devicon:azure/azure-original.svg",
  "Azure Blob Storage": "devicon:azure/azure-original.svg",
  "Azure Cosmos DB": "devicon:azure/azure-original.svg",
  "Azure AI Foundry": "devicon:azure/azure-original.svg",
  "Microsoft Entra PIM": "devicon:azure/azure-original.svg",
  "Azure DevOps": "devicon:azuredevops/azuredevops-original.svg",
  "Azure Repos": "devicon:azuredevops/azuredevops-original.svg",

  /* containers & monorepo */
  Docker: "logos:docker-icon",
  "Docker Compose": "logos:docker-icon",
  "Nx Monorepo": "simple:nx",

  /* iac, ci/cd, monitoring */
  Terraform: "logos:terraform-icon",
  "GitHub Actions": "logos:github-actions",
  "GitLab CI/CD": "simple:gitlab",
  "Nx Cloud": "simple:nx",
  Vercel: "logos:vercel-icon",
  "App Store": "logos:apple-app-store",
  "Google Play": "logos:google-play-icon",
  Datadog: "logos:datadog-icon",
  "ELK Stack": "logos:elasticsearch",

  /* testing */
  Jest: "logos:jest",
  Cypress: "logos:cypress-icon",
  Selenium: "logos:selenium",

  /* integrations */
  Okta: "logos:okta-icon",
  "Google Sign-In": "logos:google-icon",
  "Meta Login": "logos:meta-icon",
  "Sign in with Apple": "simple:apple",
  "Microsoft Entra ID": "logos:microsoft-icon",
  Razorpay: "simple:razorpay",
  "Google Maps": "logos:google-maps",
  "Meta Business APIs (WhatsApp, Facebook, Instagram)": "logos:meta-icon",
  "Google Analytics": "logos:google-analytics",
  "Meta Pixel": "logos:meta-icon",

  /* design */
  Figma: "logos:figma",
  "draw.io": "simple:diagramsdotnet",
  Mermaid: "simple:mermaid",
  Storybook: "logos:storybook-icon",

  /* AI tools */
  Claude: "logos:claude-icon",
  ChatGPT: "logos:openai-icon",
  Codex: "logos:codex",
  Gemini: "logos:google-gemini-icon",

  /* tooling */
  Git: "logos:git-icon",
  GitHub: "logos:github-icon",
  GitLab: "simple:gitlab",
  Bitbucket: "logos:bitbucket",
  Postman: "logos:postman-icon",
  JIRA: "logos:jira",
  ESLint: "logos:eslint",
};

/** Letters for tools with no mark in any open set. */
const MONOGRAM = {
  "Amazon EBS": "EBS",
  "Amazon EC2 Auto Scaling": "ASG",
  Lokalise: "L10N",
  "GPT-5.4": "AI",
  Canvas: "2D",
  "Simulation engines": "SIM",
  "Design system": "DS",
  Tally: "TLY",
};

/** Practices with no product behind them get a drawn line glyph in the site's
 *  hairline style (24 × 24, stroke, currentColor) — Dev, 2026-09-10: every
 *  skill gets an icon. */
const S = 'fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"';
const GLYPHS = {
  "Responsive & cross-platform UI": `<g ${S}><rect x="2.5" y="4" width="15" height="11" rx="1.5"/><path d="M7 19h5"/><rect x="15.5" y="9" width="6" height="11" rx="1.5"/><path d="M18.5 17.5v.01"/></g>`,
  "REST API design": `<g ${S}><path d="M8 7l-4 5 4 5M16 7l4 5-4 5M13.5 5l-3 14"/></g>`,
  Microservices: `<g ${S}><rect x="3" y="3" width="6" height="6" rx="1.2"/><rect x="15" y="3" width="6" height="6" rx="1.2"/><rect x="9" y="15" width="6" height="6" rx="1.2"/><path d="M9 6h6M7.5 9l3 6M16.5 9l-3 6"/></g>`,
  "Schema design": `<g ${S}><rect x="3" y="4" width="18" height="16" rx="1.5"/><path d="M3 9h18M9 9v11M15 9v11"/></g>`,
  "Query optimisation & scaling": `<g ${S}><ellipse cx="10" cy="5.5" rx="6.5" ry="2.5"/><path d="M3.5 5.5v12c0 1.4 2.9 2.5 6.5 2.5M16.5 5.5v4"/><path d="M19 11l-3.5 5h4L16 21"/></g>`,
  "node:test runner": `<g ${S}><path d="M12 2.5l8 4.6v9.3l-8 4.6-8-4.6V7.1z"/><path d="M8.5 12.2l2.4 2.4 4.8-4.8"/></g>`,
  "Unit testing": `<g ${S}><path d="M9.5 3h5M10 3v6l-5.5 9.2A1.5 1.5 0 0 0 5.8 20.5h12.4a1.5 1.5 0 0 0 1.3-2.3L14 9V3"/><path d="M7.5 15.5h9"/></g>`,
  "Integration testing": `<g ${S}><path d="M10 14a4 4 0 0 1 0-5.7l2.3-2.3a4 4 0 0 1 5.7 5.7l-1.2 1.2"/><path d="M14 10a4 4 0 0 1 0 5.7l-2.3 2.3a4 4 0 0 1-5.7-5.7l1.2-1.2"/></g>`,
  "SSO / OAuth 2.0": `<g ${S}><circle cx="8" cy="9" r="4.5"/><path d="M11.5 12.5L20 21M17 18l2-2M14.5 15.5l2-2"/></g>`,
  "CI/CD pipelines": `<g ${S}><path d="M20 12a8 8 0 0 1-14.3 4.9M4 12a8 8 0 0 1 14.3-4.9"/><path d="M4 21v-4.5h4.5M20 3v4.5h-4.5"/></g>`,
  "Multi-environment deployments": `<g ${S}><path d="M12 3l9 4.5-9 4.5-9-4.5z"/><path d="M3 12l9 4.5 9-4.5M3 16.5L12 21l9-4.5"/></g>`,
  "Blue-green deployment": `<g ${S}><circle cx="7" cy="12" r="4"/><circle cx="17" cy="12" r="4" stroke-dasharray="3.5 2.5"/><path d="M11 12h2"/></g>`,
  "Rolling deployments": `<g ${S}><rect x="3" y="9" width="4.5" height="6" rx="1"/><rect x="9.75" y="9" width="4.5" height="6" rx="1"/><rect x="16.5" y="9" width="4.5" height="6" rx="1"/><path d="M6 4.5h11M14.5 2l2.5 2.5L14.5 7M18 19.5H7M9.5 17L7 19.5 9.5 22"/></g>`,
  "Agile / Scrum": `<g ${S}><path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3"/><path d="M19.5 4v4h-4"/><circle cx="12" cy="12" r="1.5"/></g>`,
};

/* ------------------------------------------------------------- extraction */

function fromIconifySet(set, name) {
  const icon = set.icons?.[name];
  if (!icon) return null;
  const w = icon.width ?? set.width ?? 24;
  const h = icon.height ?? set.height ?? 24;
  const left = icon.left ?? 0;
  const top = icon.top ?? 0;
  return {
    kind: "markup",
    body: icon.body.replace(/\s+/g, " ").trim(),
    viewBox: `${left} ${top} ${w} ${h}`,
  };
}

function fromDevicon(file) {
  const path = resolve(ROOT, "node_modules/devicon/icons", file);
  if (!existsSync(path)) return null;
  const raw = readFileSync(path, "utf8");
  const viewBox = raw.match(/viewBox="([^"]+)"/)?.[1] ?? "0 0 128 128";
  const body = raw
    .replace(/<\?xml[\s\S]*?\?>/g, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<svg[^>]*>/, "")
    .replace(/<\/svg>\s*$/, "")
    .replace(/\s+/g, " ")
    .trim();
  return { kind: "markup", body, viewBox };
}

function resolveIcon(ref) {
  if (!ref) return null;
  const [set, ...rest] = ref.split(":");
  const name = rest.join(":");
  if (set === "logos") return fromIconifySet(logos, name);
  if (set === "skill-icons") return fromIconifySet(skillset, name);
  if (set === "devicon") return fromDevicon(name);
  if (set === "simple") {
    const key = "si" + name.charAt(0).toUpperCase() + name.slice(1);
    const icon = simple[key] ?? Object.values(simple).find((i) => i && i.slug === name);
    if (!icon) return null;
    return {
      kind: "markup",
      viewBox: "0 0 24 24",
      body: `<path fill="#${icon.hex}" d="${icon.path}"/>`,
    };
  }
  return null;
}

/* ------------------------------------------------------------------- tone --
   A few brand marks are near-black by design (GitHub, Express, Kafka) or just
   very dark (Datadog, Razorpay). On a #0b0d11 page they vanish. Rather than
   hand-maintaining a list, measure the mark: if its lightest colour is too
   dark to read here, tag it so the UI can lift it — monochrome marks are
   inverted to white, the way GitHub itself renders on dark, and dark colour
   marks are brightened while keeping their hue. */

function luminance(hex) {
  const c = hex.length === 3 ? hex.split("").map((x) => x + x).join("") : hex;
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(c.slice(i, i + 2), 16));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function toneFor(body) {
  const cols = [...body.matchAll(/#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})\b/g)].map((m) => m[1]);
  // No colour at all (Vercel's bare <path>) means SVG's default: black.
  if (!cols.length) return /fill=/.test(body) ? null : "mono";
  const lums = cols.map(luminance);
  const brightest = Math.max(...lums);
  if (brightest >= 72) return null;
  // Neutral black marks become white; dark *coloured* marks keep their hue.
  const neutral = cols.every((hex) => {
    const c = hex.length === 3 ? hex.split("").map((x) => x + x).join("") : hex;
    const ch = [0, 2, 4].map((i) => parseInt(c.slice(i, i + 2), 16));
    return Math.max(...ch) - Math.min(...ch) < 30;
  });
  return neutral ? "mono" : "lift";
}

/* ----------------------------------------------------------------- emit */

const names = skillGroups.flatMap((g) => g.items.map((i) => i.name));
const entries = [];
const unresolved = [];
const plain = [];

for (const name of names) {
  let icon = resolveIcon(ICONS[name]);
  if (!icon && ICONS[name]) unresolved.push(`${name} (${ICONS[name]})`);
  if (!icon && MONOGRAM[name]) icon = { kind: "monogram", text: MONOGRAM[name] };
  if (!icon && GLYPHS[name]) icon = { kind: "glyph", body: GLYPHS[name].replace(/\s+/g, " ").trim() };
  if (icon?.kind === "markup") {
    const tone = toneFor(icon.body);
    if (tone) icon = { ...icon, tone };
  }
  if (icon) entries.push([name, icon]);
  else plain.push(name);
}

const json = (v) => JSON.stringify(v);
const lines = entries.map(([name, icon]) =>
  icon.kind === "markup"
    ? `  ${json(name)}: { kind: "markup", viewBox: ${json(icon.viewBox)},${icon.tone ? ` tone: ${json(icon.tone)},` : ""} body: ${json(icon.body)} },`
    : icon.kind === "glyph"
      ? `  ${json(name)}: { kind: "glyph", body: ${json(icon.body)} },`
      : `  ${json(name)}: { kind: "monogram", text: ${json(icon.text)} },`,
);

writeFileSync(
  OUT,
  `/* GENERATED by scripts/build-skill-icons.mjs — do not edit by hand. */

export type SkillIcon =
  | { kind: "markup"; viewBox: string; body: string; tone?: "mono" | "lift" }
  | { kind: "glyph"; body: string }
  | { kind: "monogram"; text: string };

export const skillIcons: Record<string, SkillIcon> = {
${lines.join("\n")}
};

export function iconFor(name: string): SkillIcon | null {
  return skillIcons[name] ?? null;
}
`,
  "utf8",
);

console.log(`wrote ${OUT}`);
console.log(`  ${entries.length} marks, ${plain.length} without one`);
if (unresolved.length) console.log(`  UNRESOLVED: ${unresolved.join(", ")}`);
if (plain.length) console.log(`  no mark: ${plain.join(", ")}`);

const wide = entries.filter(([, i]) => {
  if (i.kind !== "markup") return false;
  const [, , w, h] = i.viewBox.split(/\s+/).map(Number);
  return w / h > 1.6;
});
if (wide.length)
  console.log(`  wide (wordmark) marks: ${wide.map(([n]) => n).join(", ")}`);
