# deveshsingh.in

Portfolio site. Next.js 16 (App Router), React 19, Tailwind v4, TypeScript. No runtime dependencies beyond the framework and the vendored `geist` fonts — animation is CSS plus one `IntersectionObserver`.

## Run

```bash
npm install
npm run dev            # http://localhost:3000
npm run build
npx eslint app components content lib
```

## Where things live

| Path | What |
|---|---|
| `content/` | **Single source of truth.** Profile, experience, skills, projects, site config. Nothing is hand-repeated in a component. |
| `components/` | UI and the three motion primitives: `ScrollReveal`, `CountUp`, `ScrambleText`. |
| `lib/` | Shared contact validation and the experience calculation. |
| `app/api/contact/` | Resend, via plain `fetch`. |
| `public/projects/` | Project images — see the README in that folder. |
| `public/resume.pdf` | Canonical résumé at a stable path. `/resume` redirects here. |

## Editing content

Change `content/*.ts` — every page re-renders from it. Two fields carry rules rather than data:

- `Project.contribution` — what *you* built, scoped so it survives an interview. Distinct from `summary`, which describes the product.
- `Project.image.kind` — `placeholder` | `marketing` | `own`. Drives the caption on cards and whether the detail page shows the image at all. Update it whenever you replace an image.

Years of experience is computed from `CAREER_START`, never typed. That is deliberate: four résumés each hard-coded a different number and drifted apart.

## Environment

Copy `.env.example`. Without `RESEND_API_KEY` and `CONTACT_FROM` the contact route returns a clear 503 and the page still shows a direct email link.

## Updating the résumé

Replace `public/resume.pdf`, keep the path, and bump `resume.updated` in `content/profile.ts`. The date is shown under the download button.
