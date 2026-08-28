# Project images

All files here are **1200 × 750 at 2x DPI** (2400 × 1500 actual pixels).
Keep that size when you replace one — the filename and dimensions are the contract,
so swapping an image never touches code.

## Current state

Every image is a generated placeholder. They are designed to look deliberate,
not broken, so the site can go live before the real assets exist.

## When you replace one

Update `image.kind` in `content/projects.ts` so the card captions itself truthfully:

| kind | means | UI should say |
|---|---|---|
| `placeholder` | generated card, no real asset | nothing |
| `marketing` | the client's public homepage | "Client's public site" |
| `own` | your own product, or a screen you actually built | nothing |

## Priority order for real assets

1. **devtools** — your own product, zero permission concerns. Or drop the image and embed the live demo.
2. **nextdecade** — anonymise the log data and capture the real UI.
3. **estateguru** — a redacted investor-dashboard capture beats their marketing homepage by a mile.
4. **boongg / modcart** — `scripts/capture-screenshots.mjs` will grab the public homepages if you want them.

Note that `modcart.io` now runs an AI coupon platform, which is not the ad platform
described in that case study. Its homepage is actively misleading as a case-study image.
