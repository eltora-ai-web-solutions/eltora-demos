# ELTORA SALON & SPA

**"Beauty, Wellness & You."**

A premium, cinematic 3D website for a luxury salon & day spa, built with plain HTML5, CSS3, vanilla JavaScript and Three.js — no build tools, no frameworks, no backend.

## Running it

You don't need to install anything.

**Option A — just open it**
Double-click `index.html` and it will open in your browser.

**Option B — local server (recommended, avoids browser file:// restrictions on some systems)**
```bash
# Python 3
python3 -m http.server 8000
# then visit http://localhost:8000

# or Node
npx serve .
```

## Deploying

- **GitHub Pages:** push this folder to a repo and enable Pages on the `main` branch (root).
- **Netlify:** drag-and-drop the folder onto the Netlify dashboard, or connect the repo. No build command is required — publish directory is `/`.

## Structure

```
ELTORA-SALON-SPA/
├── index.html      → all page content & sections
├── style.css       → full design system (colors, type, layout, components)
├── script.js       → Three.js hero + interactive 3D scene, nav, reveal
│                     animations, parallax, form validation, gallery
├── README.md
└── assets/
    ├── images/     → (reserved for local image assets)
    ├── icons/      → (reserved for local icon assets)
    └── 3d/         → (reserved for any exported 3D models)
```

## Notes on imagery

All photography is served from Unsplash's CDN (`images.unsplash.com` /
`plus.unsplash.com`), so an internet connection is required to see the
photographs load. The two 3D scenes (the hero and the "Beauty In Every
Detail" section) are built entirely from Three.js primitives — no external
3D model files are required, so they render even offline.

If you prefer fully offline images, download each photo referenced in
`index.html` into `assets/images/` and update the `src` attributes to point
to the local files.

## Content

Team profiles and testimonials are clearly marked as **demo content** for
presentation purposes — swap in real team photos, bios and client reviews
before going live. Pricing shown throughout is illustrative demo pricing in INR.

## Tech

- Three.js r128 (hero cinematic scene + interactive drag/zoom beauty object)
- Vanilla JS (IntersectionObserver reveal animations, magnetic buttons,
  parallax, tabbed service menu, booking form validation)
- Google Fonts: Fraunces (display) + Jost (body)
- Fully responsive: desktop, laptop, tablet, mobile
