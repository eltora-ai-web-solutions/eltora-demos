# The Secret — Cinematic Birthday Surprise

A dark, romantic, cinematic birthday website: an opening envelope scene, a
birthday reveal with a 3D-lit cake, a hanging polaroid photo story built from
your uploaded photos, and an interactive glowing heart finale — with your own
music starting the moment the surprise is opened.

## 1. Personalise it

Open `js/main.js` and edit the two lines at the top:

```js
const CONFIG = {
  name: "My Love",          // → whoever the birthday is for
  date: "MARCH 15 · 2027",  // → their birthday
};
```

Everything else (message copy, captions) lives directly in `index.html` —
search for the section you want to change (`01 — THE SECRET`,
`02 — BIRTHDAY REVEAL`, `03 — OUR LITTLE STORY`, `04 — FOREVER`) and edit the
text in place.

## 2. Swap in different photos (optional)

Your 10 uploaded photos are already in `assets/images/memory-01.jpg` through
`memory-10.jpg` and wired into the "Our Little Story" gallery with captions.
To reorder, swap, or add photos, just replace the files (keep the same names)
or add new `<figure class="polaroid">` blocks in `index.html`.

The reveal photo at the top of section 02 uses `memory-08.jpg` — change the
`src` there if you'd like a different hero photo.

## 3. Preview locally

Because the page loads local files (images/audio) and modules from a CDN,
serve it over a local server rather than opening the file directly:

```bash
npx serve .
# or
python3 -m http.server 5500
```

Then open the printed local address in your browser.

## 4. Deploy to Vercel

No build step, no backend — this is a static site.

```bash
npm i -g vercel   # if you don't have it yet
vercel             # from inside this folder, follow the prompts
```

Or drag-and-drop the whole folder onto vercel.com/new.

## Notes on behaviour

- The opening screen plays **no music**. Music starts only inside the click
  handler for "OPEN YOUR SURPRISE →", satisfying browser autoplay rules and
  the "no second click" requirement.
- The moon/fireflies/petals scene and the glowing interactive heart are real
  Three.js scenes, not flat images.
- Tap/click the heart in the final section for a light burst + pulse effect.
- Respects `prefers-reduced-motion`.
