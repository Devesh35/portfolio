/**
 * Builds the résumé from content/ — the same data the site renders.
 *
 * The four older PDFs drifted apart because each was typed by hand. Generating
 * from one source means the site and the résumé cannot disagree again.
 *
 *   node scripts/build-resume.mjs               # writes resume.html
 *   node scripts/build-resume.mjs --pdf         # also prints a PDF (needs playwright)
 *
 * Node 22 strips the TypeScript types on import, so there is no build step.
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { register } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// Teach Node the app's "@/" alias before any content module is pulled in.
register("./alias-hook.mjs", import.meta.url);

const { resume, resumePeriod } = await import("../content/resume.ts");

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = resolve(ROOT, "public");

/** The résumé is stored under the name it should save as, so every route to it
 *  — the download button, a right-click save, opening the URL directly —
 *  produces the same filename without relying on the `download` attribute. */
const PDF_NAME = "Devesh_Singh_Resume.pdf";

const esc = (value) =>
  String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const bare = (url) => url.replace(/^https?:\/\//, "").replace(/\/$/, "");

// The marker is real text (not a CSS pseudo-element) so ATS text extraction
// keeps it on the same line as the bullet's own text instead of orphaning it.
const bullets = (items) =>
  `<ul>${items.map((b) => `<li><span class="bullet">▪</span>${esc(b)}</li>`).join("")}</ul>`;

// Context, then the stack line, then the bullets (Dev, 2026-09-01, second
// pass: stack moved back up above the bullets). `stack` itself only carries
// major tech not already named in the bullets below it — not a full list.
const projectBlock = (project) => `
      <div class="proj">
        <div class="row">
          <span class="proj-title">${esc(project.heading)}${
            project.url ? ` <a href="${project.url}">${esc(bare(project.url))}</a>` : ""
          }</span>
          <span class="date">${esc(resumePeriod(project.slug))}</span>
        </div>
        <p class="context"><b>Context:</b> ${esc(project.context)}</p>
        <p class="stack"><b>Stack:</b> ${esc(project.stack)}</p>
        ${bullets(project.bullets)}
      </div>`;

// One position (title + period) — a plain one-sentence summary, no
// projects nested inside it any more (Dev, 2026-09-01: positions and major
// projects are now two separate blocks under Professional Experience).
const positionBlock = (position) => `
    <div class="position">
      <div class="row">
        <span class="position-title">${esc(position.title)}</span>
        <span class="date">${esc(position.period)}</span>
      </div>
      <p class="role-summary">${esc(position.summary)}</p>
    </div>`;

const skillsBlock = resume.skills
  .map(
    (row) => `
      <div class="skill-row">
        <span class="skill-label">${esc(row.label)}:</span>
        <span class="skill-items">${esc(row.items)}</span>
      </div>`,
  )
  .join("");

const additionalBlock = resume.additional
  .map(
    (item) => `<li class="add-item">
        <div class="row add-row">
          <span class="add-left"><span class="bullet">▪</span><span class="add-title"><b>${esc(item.name)}</b> (${esc(item.domain)})${
            item.url ? ` — <a href="${item.url}">${esc(bare(item.url))}</a>` : ""
          }</span></span>
          <span class="date">${esc(resumePeriod(item.slug))}</span>
        </div>
        <span class="add-text">${esc(item.text)}</span>
      </li>`,
  )
  .join("");

const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<title>${esc(resume.header.name)} — résumé</title>
<style>
  /* Type metrics measured from Devesh_Singh_Resume.pdf with pdfplumber:
     A4 595x842pt, 45pt margins, 503.6pt text column, Carlito (Calibri metrics).
     Body 9.22pt on a 13.85pt line (1.502). Small text 8.07pt on 12.1pt.
     Name 20.17pt. Contact 7.49pt on 10.4pt. Section rules 0.58pt. */

  @page { size: A4; margin: 45pt; }
  * { box-sizing: border-box; }

  body {
    font-family: Calibri, Carlito, "Segoe UI", sans-serif;
    font-size: 9.22pt;
    line-height: 13.85pt;   /* measured: 13.8pt between body lines */
    color: #1a1a1a;
    margin: 0;
    -webkit-print-color-adjust: exact; print-color-adjust: exact;
  }
  a { color: #a8481c; text-decoration: underline; }

  /* ------------------------------------------------------------- masthead */
  .masthead { display: flex; justify-content: space-between; align-items: flex-start; gap: 18pt; margin-bottom: 10.7pt; }
  h1 { font-size: 20.17pt; font-weight: 700; color: #7a3316; line-height: 1; margin: 0 0 6.3pt; }
  .tagline { font-size: 9.22pt; color: #b8511f; margin: 0 0 1.2pt; }
  .headline-stack { font-size: 9.22pt; font-weight: 700; color: #b8511f; margin: 0; }
  .contact {
    text-align: right; font-size: 7.49pt; line-height: 10.4pt;
    white-space: nowrap; padding-top: 1pt;
  }

  /* ------------------------------------------------------------- sections */
  h2 {
    font-size: 9.22pt; font-weight: 700; text-transform: uppercase; color: #b8511f;
    margin: 11.8pt 0 9.7pt; padding: 0; border-bottom: 0.58pt solid #f0c3a8;
  }
  p { margin: 0; }
  .summary { margin: 0 0 4.6pt; text-align: justify; }

  /* --------------------------------------------------------------- skills */
  .skill-row { display: flex; margin-bottom: 4.05pt; }
  .skill-label { flex: 0 0 94.1pt; font-weight: 700; color: #7a3316; }
  .skill-items { flex: 1; }

  /* ----------------------------------------------------------- experience */
  .row { display: flex; justify-content: space-between; align-items: baseline; gap: 14pt; }
  .date { font-style: italic; color: #333; white-space: nowrap; }

  /* Company header — printed once above every position held there. */
  .company-header { margin-bottom: 1.2pt; }
  .company-name { font-size: 11.6pt; font-weight: 700; text-transform: uppercase; color: #7a3316; letter-spacing: 0.02em; }
  .company-header .date { font-size: 9.22pt; font-weight: 700; font-style: normal; color: #7a3316; }
  .company-blurb { font-size: 7.8pt; line-height: 10.8pt; color: #555; font-style: italic; margin: 1.5pt 0 6pt; }

  /* Position — a title held at the company above. Deliberately larger than
     body text so SDE 2 and Graduate Consultant both read as distinct roles,
     not sub-labels of the company line (Dev, 2026-09-01). No border-left here
     on purpose: a box border drawn on an element that spans a page break
     renders as a stray rule down the blank rest of the page — plain spacing
     avoids that failure mode. */
  .position { margin-top: 6.5pt; margin-bottom: 0; }
  .position-title { font-size: 10.5pt; font-weight: 700; color: #1a1a1a; }
  .position .date { font-size: 9.22pt; }
  .role-summary { margin-top: 2.6pt; }

  /* Small labelled break between the positions and the major-project write-ups
     that follow them (Dev, 2026-09-01 — projects are no longer nested under
     a position). Same accent as h2, lighter weight, no border. */
  .subhead { font-size: 8.5pt; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #7a3316; margin: 11pt 0 2pt; }

  .proj { margin-top: 7.45pt; }
  .proj-title { font-size: 9.22pt; font-weight: 700; color: #7a3316; }
  .proj-title a { font-weight: 400; font-size: 8.07pt; }
  .proj .date { font-size: 8.07pt; }
  .context { font-size: 8.07pt; line-height: 12.1pt; margin-top: 1.35pt; page-break-after: avoid; }
  .proj .row { page-break-after: avoid; }
  .stack { font-size: 8.07pt; line-height: 12.1pt; margin-top: 1.35pt; }
  .context b, .stack b { color: #7a3316; }

  /* -------------------------------------------------------------- bullets */
  ul { list-style: none; margin: 1.5pt 0 0; padding-left: 0; }
  /* The list itself CAN break across a page (Dev, 2026-09-01 — fills pages
     instead of leaving blank space), but a single bullet's own text should
     not split mid-sentence across that break. */
  li { margin-bottom: 3.45pt; page-break-inside: avoid; padding-left: 9.2pt; text-indent: -9.2pt; }
  .bullet { display: inline-block; width: 9.2pt; text-indent: 0; color: #d1662f; font-size: 8.5pt; }
  .position > ul { margin-top: 2.6pt; }
  .tight { margin-top: 4pt; }
  .additional-intro { font-size: 8.07pt; line-height: 12.1pt; color: #555; font-style: italic; margin-bottom: 4pt; }
  .add-item { padding-left: 0; text-indent: 0; }
  .add-row { margin-bottom: 0.5pt; }
  .add-title { font-size: 9.22pt; }
  .add-title a { font-size: 8.07pt; font-weight: 400; }
  .tight .date { font-size: 8.07pt; }
  .add-text { display: block; margin-left: 9.2pt; }

  /* ------------------------------------------------------------ education */
  .edu-line { font-size: 9.22pt; }

  /* On screen the document sits on a page; in print @page owns the margins. */
  @media screen {
    html { background: #eceff2; }
    body {
      max-width: 595pt;
      width: 100%;
      margin: 0 auto;
      padding: 45pt;
      background: #fff;
    }
  }
</style></head>
<body>
  <header class="masthead">
    <div>
      <h1>${esc(resume.header.name.toUpperCase())}</h1>
      <p class="tagline">${esc(resume.header.line)}</p>
      <p class="headline-stack">${esc(resume.header.stack)}</p>
    </div>
    <div class="contact">
      ${resume.header.contact
        .map(
          (c) =>
            `<div><b>${esc(c.label)}:</b> ${
              c.href ? `<a href="${c.href}">${esc(c.value)}</a>` : esc(c.value)
            }</div>`,
        )
        .join("")}
    </div>
  </header>

  <p class="summary">${esc(resume.summary)}</p>
  <p class="summary">Solo project: <a href="${resume.soloProject.url}">${esc(
    bare(resume.soloProject.url),
  )}</a>, ${esc(resume.soloProject.text)}</p>

  <h2>Technical Skills</h2>
  ${skillsBlock}

  <h2>Professional Experience</h2>
  <div class="company-header row">
    <span class="company-name">${esc(resume.company.name)}</span>
    <span class="date">${esc(resume.company.period)}</span>
  </div>
  <p class="company-blurb">${esc(resume.company.blurb)}</p>
  ${resume.positions.map(positionBlock).join("")}
  <p class="subhead">Major Projects</p>
  ${resume.majorProjects.map(projectBlock).join("")}

  <h2>Additional Projects</h2>
  <p class="additional-intro">${esc(resume.additionalIntro)}</p>
  <ul class="tight">${additionalBlock}</ul>

  <h2>Education</h2>
  <div class="row">
    <span class="proj-title">${esc(resume.education.degree)} <span style="font-weight:400;color:#b8511f">– ${esc(
      resume.education.school,
    )}</span></span>
    <span class="date">${esc(resume.education.period)}</span>
  </div>
  <div class="row">
    <span class="edu-line">${esc(resume.education.line)}</span>
    <span class="date">${esc(resume.education.result)}</span>
  </div>
</body></html>`;

mkdirSync(OUT_DIR, { recursive: true });
const htmlPath = resolve(OUT_DIR, "resume.html");
writeFileSync(htmlPath, html, "utf8");
console.log("wrote", htmlPath);

if (process.argv.includes("--pdf")) {
  const { chromium } = await import("playwright");
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "load" });
  await page.pdf({
    path: resolve(OUT_DIR, PDF_NAME),
    printBackground: true,
    // @page in the stylesheet owns size and margins — one source, not two.
    preferCSSPageSize: true,
  });
  await browser.close();
  console.log("wrote", resolve(OUT_DIR, PDF_NAME));
}
