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

const bullets = (items) => `<ul>${items.map((b) => `<li>${esc(b)}</li>`).join("")}</ul>`;

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

const roleBlock = (role) => `
    <div class="role">
      <div class="row">
        <span class="role-title">${esc(role.company)} <span class="role-sub">– ${esc(role.title)}</span></span>
        <span class="date">${esc(role.period)}</span>
      </div>
      ${role.summary ? `<p class="role-summary">${esc(role.summary)}</p>` : ""}
      ${role.bullets ? bullets(role.bullets) : ""}
      ${role.projects.map(projectBlock).join("")}
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
    (item) => `<li><b>${esc(item.name)}</b> (${esc(item.domain)})${
      item.url ? ` — <a href="${item.url}">${esc(bare(item.url))}</a>` : ""
    } — ${esc(item.text)} <i>${esc(resumePeriod(item.slug))}</i></li>`,
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
  .role { margin-bottom: 0; }
  .role-title { font-size: 8.07pt; font-weight: 700; color: #1a1a1a; }
  .role-sub { color: #b8511f; }
  .role .date { font-size: 9.22pt; }
  .date { font-style: italic; color: #333; white-space: nowrap; }
  .role-summary { margin-top: 3.2pt; }

  .proj { margin-top: 7.45pt; page-break-inside: avoid; }
  .proj-title { font-size: 9.22pt; font-weight: 700; color: #7a3316; }
  .proj-title a { font-weight: 400; font-size: 8.07pt; }
  .proj .date { font-size: 8.07pt; }
  .context { font-size: 8.07pt; line-height: 12.1pt; margin-top: 1.35pt; }
  .stack { font-size: 8.07pt; line-height: 12.1pt; }
  .context b, .stack b { color: #7a3316; }

  /* -------------------------------------------------------------- bullets */
  ul { list-style: none; margin: 1.5pt 0 0; padding-left: 9.2pt; }
  li { position: relative; margin-bottom: 3.45pt; }
  li::before {
    content: "▪"; position: absolute; left: -9.2pt; top: -0.5pt;
    color: #d1662f; font-size: 7.5pt;
  }
  .role > ul { margin-top: 2.6pt; }
  .tight { margin-top: 4pt; }

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
  ${resume.roles.map(roleBlock).join("")}

  <h2>Additional Projects</h2>
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
