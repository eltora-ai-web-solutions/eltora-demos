# Eltora Care — Hospital / Multi-Specialty Clinic Website

A premium, cinematic frontend concept for **Eltora Care** — "Care Today. A Healthier Tomorrow."

Pure HTML5 / CSS3 / vanilla JavaScript, with Three.js for the 3D hero and
technology visuals, and GSAP for the hero entrance sequence and scroll-based
motion. No React, no build step, no backend — open `index.html` in a browser
and it runs.

## Structure

```
ELTORA-CARE-HOSPITAL/
├── index.html          All markup / sections
├── style.css            Design tokens, layout, responsive rules, animation hooks
├── script.js             Three.js scenes, GSAP timeline, scroll reveal, form + carousel logic
├── assets/images/        Empty folders reserved for real photography (see below)
│   ├── hospital/
│   ├── doctors/
│   ├── departments/
│   └── facilities/
└── README.md
```

## ⚠️ About the imagery — please read

The brief calls for real, licensed photographic imagery (hospital exterior,
doctors, ICU, operation theatre, etc). I generate this site in a sandboxed
environment with **no internet access** to browse, license or download stock
photography, and no image-generation tool suited to real photography. To
avoid the two things the brief explicitly rules out — broken images and
generic-looking placeholder boxes — I did **not** hotlink guessed stock-photo
URLs (a real risk of dead links or using content I can't confirm is licensed
for reuse).

Instead:

- Every photography slot is a hand-styled **`.photo-panel`** element —
  a duotone gradient + line-icon treatment in the brand palette, built to
  read as an intentional art-directed visual rather than a missing image.
  Each one is marked in the CSS with a comment showing exactly where to
  drop in a real `<img>` or `background-image`.
- The demo **doctor portraits** and **patient testimonial avatars** use
  real human photographs from a public headshot service (`i.pravatar.cc`),
  appropriate for clearly-fictional demo profiles.
- Swapping in real photography is a drop-in change: replace the
  `.photo-panel` background rule (or the element itself) with your own
  `<img src="assets/images/...">`. The `assets/images/` folders are already
  wired into the intended structure and ready to receive files.

Recommended sources for licensed, real hospital photography: your own
photo library, a commissioned shoot, or a stock library with commercial
healthcare licensing (Getty Images, Adobe Stock, iStock).

## What's implemented

- Sticky glass navbar with search overlay and mobile menu
- Full-bleed 3D cinematic hero (Three.js: floating glass core, orbit rings,
  data nodes, particle field) with a GSAP entrance sequence and an ECG
  readout card
- Floating 24/7 emergency CTA
- Animated trust statistics (clearly flagged as sample figures)
- 12-department specialty grid with hover motion
- Cinematic full-bleed statement section with a "Watch Our Story" motion
  moment (no fake video)
- Bento-style department showcase (Emergency, ICU, Maternity, Ortho & Spine,
  Radiology, Laboratory)
- Doctor profiles (clearly labelled as demo/fictional)
- Services grid, scrollable facilities strip
- Second Three.js scene — an abstract data-helix — for the "Inside Eltora
  Care" technology section
- Appointment form (frontend-only demo, clearly labelled, with validation)
- Emergency CTA section
- Patient experience grid
- Testimonial carousel (clearly flagged as sample content)
- Health-library / blog teaser grid
- Contact section with a styled map placeholder
- Full footer

## Notes

- Colors, type and spacing are defined as CSS custom properties at the top
  of `style.css` — change the palette or type scale from one place.
- Icons are rendered via Lucide (loaded from CDN); every icon is chosen to
  match its section semantically, not decoratively.
- Respects `prefers-reduced-motion`.
- No device/phone mockups are used anywhere — the layout itself is
  responsive across desktop, tablet and mobile.
