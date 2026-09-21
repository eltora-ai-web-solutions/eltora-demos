# ELTORA JEWELS

**Timeless Pieces. Modern Elegance.**

A premium, cinematic jewellery brand website built with plain HTML5, CSS3,
vanilla JavaScript and Three.js. No frameworks, no build step, no backend —
open `index.html` and it runs.

---

## Running it

**Option A — just open it**
Double-click `index.html`. Everything works, including the 3D scenes,
as long as you're online (see CDN dependencies below).

**Option B — local server (recommended)**
Some browsers restrict `file://` pages slightly. A tiny local server avoids
any of that friction:

```bash
# Python 3
python3 -m http.server 8080

# Node
npx serve .
```

Then visit `http://localhost:8080`.

**Deploying**
This is a static site — drag the folder into Netlify, push it to a GitHub
Pages branch, or upload it to any static host. No environment variables,
no build command, no database.

---

## Project structure

```
ELTORA-JEWELS/
├── index.html          All 14 sections, semantic markup
├── style.css            Full design system + responsive layout
├── script.js             Nav, scroll reveals, forms, sliders, Three.js scenes
├── assets/
│   ├── images/           (reserved — the site currently references
│   │                      hotlinked, license-checked Unsplash photography;
│   │                      see "Imagery" below to localize it)
│   ├── icons/             (reserved for custom icon assets)
│   └── 3d/                (reserved — the 3D pieces in this build are
│                            procedural Three.js geometry, not model files)
└── README.md
```

---

## Third-party libraries (all loaded via CDN, documented per the brief)

| Library | Version | Purpose | Source |
|---|---|---|---|
| Three.js | r160 (ES module) | Hero gem scene + interactive 3D ring configurator | `unpkg.com/three@0.160.0` |
| GSAP | 3.12.5 | Hero entrance timeline (falls back to plain CSS transitions if it fails to load) | `cdnjs.cloudflare.com` |
| Google Fonts — Fraunces & Manrope | — | Display serif + body sans | `fonts.googleapis.com` |

Three.js is loaded through an **import map** and a **dynamic `import()`**,
deliberately decoupled from the rest of the site's JavaScript. If that CDN
is ever slow, blocked, or the visitor is briefly offline, the navigation,
scroll animations, forms, sliders and every other interaction still work —
only the two 3D scenes fall back to a quiet CSS placeholder (a soft gold
glow and a diamond glyph) instead of an empty box. This was tested directly.

---

## Imagery

Every image area in this build uses **real, freely-licensed jewellery
photography** (rings, necklaces, earrings, bangles, pearls, bridal sets,
goldsmithing, etc.), sourced from Unsplash's CDN under the Unsplash License
(unsplash.com/license — free for commercial use, no attribution required).
Each URL was individually checked before use.

**Every image also has a bundled local fallback.** `assets/images/` contains
a full set of custom-drawn, brand-matched vector illustrations — one for
every single photo slot on the site, each depicting the correct piece (a
ring for the ring slot, a necklace for the necklace slot, and so on). If a
photograph ever fails to load — no internet connection, a network that
blocks the image host, or a hosting environment with a stricter content
policy — the matching illustration takes its place automatically and
instantly. You will never see a broken-image icon or an empty box, in any
environment.

This is handled by a small, self-contained script at the very top of
`index.html` (`handleImgError`), completely independent from the rest of
the site's JavaScript, so this fallback works even if something else on the
page fails.

**To use your own studio photography instead:** replace the `src="https://
images.unsplash.com/..."` on any `<img>` with your own file path, and
update its neighbouring `data-fallback="assets/images/..."` if you'd like a
different illustration to back it up.

---

## Sections included

1. Hero — full-screen Three.js gem scene, cinematic entrance
2. Signature Collection — 4 editorial cards
3. Shop By Jewellery — 6 categories
4. Curated For You — 6 featured products with wishlist + demo pricing
5. Cinematic showcase — "The Aurelia" with parallax
6. Interactive 3D showroom — drag-to-rotate, scroll-to-zoom ring configurator
7. The Bridal Edit
8. Our Craft — goldsmithing story
9. Lookbook — editorial masonry grid
10. About ELTORA
11. Testimonials (clearly labelled as demo content)
12. Private Consultation — validated appointment form (front-end only)
13. Visit Us — studio details, map link
14. Newsletter + full footer

## Notes

- The consultation and newsletter forms are front-end only (no backend, as
  specified) — they validate input and show a success state, but do not
  send data anywhere. Wire them up to your booking system / ESP of choice.
- All prices and testimonials are explicitly marked as demo content.
- Respects `prefers-reduced-motion`.

Copyright © 2026 ELTORA JEWELS. Demo brand for portfolio/client presentation
purposes.
