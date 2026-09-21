/* ==========================================================
   ELTORA FITNESS — script.js
   Vanilla JS + Three.js (r128) + GSAP/ScrollTrigger + Lenis
   ========================================================== */
(() => {
'use strict';

const $  = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer  = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const hasGSAP = typeof window.gsap !== 'undefined';
const hasST   = hasGSAP && typeof window.ScrollTrigger !== 'undefined';
if (hasST) gsap.registerPlugin(ScrollTrigger);

const safe = (name, fn) => { try { return fn(); } catch (e) { console.error('[ELTORA] ' + name + ' failed:', e); } };

let lenis = null;

/* ==========================================================
   1. IMAGE SLOTS — detect missing files and show a clearly
      labelled fallback (never a broken-image icon).
   ========================================================== */
const MISSING = [];
const BARBELL_SVG =
  '<svg viewBox="0 0 120 60" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" aria-hidden="true">' +
  '<path d="M10 30h100M22 12v36M32 6v48M88 6v48M98 12v36"/></svg>';

function markMissing(slot, img) {
  if (slot.classList.contains('is-missing')) return;
  slot.classList.add('is-missing');
  const file = (img.getAttribute('src') || '').split('/').pop();
  MISSING.push(file);
  if (slot.hasAttribute('data-optional')) return; // optional backdrop: simply hidden
  const fb = document.createElement('div');
  fb.className = 'img__fallback';
  fb.innerHTML = BARBELL_SVG + '<b>Photo slot</b><span>assets/images/' + file + '</span>';
  slot.insertBefore(fb, slot.firstChild);
}

function initImageSlots() {
  $$('[data-slot]').forEach(slot => {
    const img = $('img', slot);
    if (!img) return;
    const check = () => { if (img.complete && img.naturalWidth === 0) markMissing(slot, img); };
    img.addEventListener('error', () => markMissing(slot, img));
    check();
  });
  window.ELTORA_MISSING_IMAGES = MISSING;
  window.addEventListener('load', () => {
    setTimeout(() => {
      if (MISSING.length) {
        console.info('[ELTORA] ' + MISSING.length + ' image slot(s) have no photo yet. Check the file names in index.html against assets/images/.');
      }
    }, 800);
  });
}

/* ==========================================================
   2. SMOOTH SCROLL (Lenis) + anchor handling
   ========================================================== */
function initScroll() {
  if (!reduceMotion && typeof window.Lenis !== 'undefined') {
    lenis = new Lenis({ duration: 1.15, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
    if (hasST) {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(t => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      const raf = t => { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
  }
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const hash = a.getAttribute('href');
    e.preventDefault();
    if (hash === '#' || hash.length < 2) return;
    const target = $(hash);
    if (!target) return;
    closeMenu();
    const go = () => {
      if (lenis) lenis.scrollTo(target, { offset: 0, duration: 1.5 });
      else target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    };
    // let the mobile menu finish closing so scroll isn't locked
    setTimeout(go, menuOpen ? 30 : 0);
  });
}

/* ==========================================================
   3. NAVIGATION
   ========================================================== */
let menuOpen = false;
const burger = $('#burger'), mmenu = $('#mobileMenu');
function openMenu()  { menuOpen = true;  mmenu.classList.add('is-open'); mmenu.setAttribute('aria-hidden', 'false'); burger.setAttribute('aria-expanded', 'true'); burger.setAttribute('aria-label', 'Close menu'); if (lenis) lenis.stop(); document.body.style.overflow = 'hidden'; }
function closeMenu() { if (!menuOpen) return; menuOpen = false; mmenu.classList.remove('is-open'); mmenu.setAttribute('aria-hidden', 'true'); burger.setAttribute('aria-expanded', 'false'); burger.setAttribute('aria-label', 'Open menu'); if (lenis) lenis.start(); document.body.style.overflow = ''; }

function initNav() {
  const nav = $('#nav');
  const onScroll = () => nav.classList.toggle('is-solid', window.scrollY > 30);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  burger.addEventListener('click', () => menuOpen ? closeMenu() : openMenu());
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
  window.matchMedia('(min-width:1180px)').addEventListener('change', e => { if (e.matches) closeMenu(); });

  // active link highlighting
  const map = {};
  $$('.nav__links a').forEach(a => { map[a.getAttribute('href').slice(1)] = a; });
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      $$('.nav__links a').forEach(a => a.classList.remove('is-active'));
      const link = map[en.target.id];
      if (link) link.classList.add('is-active');
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  Object.keys(map).forEach(id => { const s = document.getElementById(id); if (s) io.observe(s); });
}

/* ==========================================================
   4. REVEALS, COUNTERS, MAGNETIC, PARALLAX
   ========================================================== */
function initReveals() {
  const items = $$('[data-reveal]');
  if (reduceMotion || !('IntersectionObserver' in window)) { items.forEach(i => i.classList.add('is-in')); return; }
  items.forEach(el => {
    const sibs = el.parentElement ? Array.from(el.parentElement.children) : [];
    const idx = Math.max(0, sibs.indexOf(el));
    const d = ((idx % 3) * 0.09) + 's';
    el.style.setProperty('--d', d);
    const img = $('img', el); if (img) img.style.transitionDelay = d;
  });
  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('is-in'); obs.unobserve(en.target); } });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  items.forEach(i => io.observe(i));
  // safety: never leave an image hidden
  setTimeout(() => items.forEach(i => { const r = i.getBoundingClientRect(); if (r.top < innerHeight && r.bottom > 0) i.classList.add('is-in'); }), 2500);
}

function initCounters() {
  const els = $$('[data-count]');
  const fmt = n => Math.round(n).toLocaleString('en-US');
  const run = el => {
    const end = +el.dataset.count, suf = el.dataset.suffix || '';
    if (reduceMotion) { el.textContent = fmt(end) + suf; return; }
    const o = { v: 0 };
    const upd = () => { el.textContent = fmt(o.v) + suf; };
    if (hasGSAP) gsap.to(o, { v: end, duration: 2.2, ease: 'power3.out', onUpdate: upd, onComplete: upd });
    else { const t0 = performance.now(); const step = t => { const p = clamp((t - t0) / 2000, 0, 1); o.v = end * (1 - Math.pow(1 - p, 3)); upd(); if (p < 1) requestAnimationFrame(step); }; requestAnimationFrame(step); }
  };
  const io = new IntersectionObserver((entries, obs) => entries.forEach(en => { if (en.isIntersecting) { run(en.target); obs.unobserve(en.target); } }), { threshold: 0.6 });
  els.forEach(e => io.observe(e));
}

function initMagnetic() {
  if (!hasGSAP || !finePointer || reduceMotion) return;
  $$('.magnetic').forEach(el => {
    el.addEventListener('pointermove', e => {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
      gsap.to(el, { x: dx * 0.22, y: dy * 0.32, duration: 0.4, ease: 'power3.out' });
    });
    el.addEventListener('pointerleave', () => gsap.to(el, { x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1,.4)' }));
  });
}

function initParallax() {
  if (!hasST || reduceMotion) return;
  $$('[data-parallax]').forEach(el => {
    const k = parseFloat(el.dataset.parallax) || 0.15;
    gsap.fromTo(el, { yPercent: -k * 50 }, {
      yPercent: k * 50, ease: 'none',
      scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true }
    });
  });
  // hero depth on scroll
  gsap.to('.hero__title', { yPercent: 14, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  gsap.to('.hero__content', { yPercent: -18, opacity: 0, ease: 'none', scrollTrigger: { trigger: '.hero', start: '30% top', end: 'bottom top', scrub: true } });
}

/* ==========================================================
   5. PAGE-LOAD SEQUENCE
   ========================================================== */
let heroAPI = null;
function showHeroInstantly() {
  $$('.hero [data-hero-in], .hero [data-hero-word]').forEach(el => { el.style.opacity = 1; el.style.transform = 'none'; });
}
function runIntro() {
  const loader = $('#loader');
  let finished = false;
  const finish = () => { if (finished) return; finished = true; if (loader) loader.style.display = 'none'; };

  if (!hasGSAP || reduceMotion) {
    finish(); showHeroInstantly(); if (heroAPI) heroAPI.intro(true); return;
  }
  const kick = () => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.fromTo('.loader__word', { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.55 })
      .to('.loader__bar i', { scaleX: 1, duration: 0.85, ease: 'power2.inOut' }, '-=0.15')
      .to('#loader', { yPercent: -100, duration: 0.95, ease: 'expo.inOut' }, '+=0.08')
      .add(() => { finish(); if (heroAPI) heroAPI.intro(false); }, '-=0.55')
      .fromTo('[data-hero-word]', { yPercent: 38, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 1.5, stagger: 0.14, ease: 'expo.out' }, '-=0.45')
      .fromTo('[data-hero-in]', { y: 28, opacity: 0 }, { y: 0, opacity: 1, duration: 1, stagger: 0.12 }, '-=1.05');
  };
  (document.fonts && document.fonts.ready ? Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 1800))]) : Promise.resolve()).then(kick);
  // failsafe: never trap the visitor behind the loader
  setTimeout(() => { finish(); showHeroInstantly(); if (heroAPI) heroAPI.intro(true); }, 6500);
}

/* ==========================================================
   6. THREE.JS — shared helpers
   ========================================================== */
function webglOK() {
  try { const c = document.createElement('canvas'); return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl'))); }
  catch (e) { return false; }
}

function makeRenderer(canvas, opts = {}) {
  const r = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  r.setPixelRatio(Math.min(window.devicePixelRatio || 1, opts.maxDPR || 2));
  r.outputEncoding = THREE.sRGBEncoding;
  r.toneMapping = THREE.ACESFilmicToneMapping;
  r.toneMappingExposure = opts.exposure || 1.05;
  r.shadowMap.enabled = true;
  r.shadowMap.type = THREE.PCFSoftShadowMap;
  r.setClearColor(0x000000, 0);
  return r;
}

function makeEnv(renderer, scene, intensity = 1) {
  const pm = new THREE.PMREMGenerator(renderer);
  const env = pm.fromScene(new THREE.RoomEnvironment(), 0.04).texture;
  scene.environment = env;
  pm.dispose();
  return env;
}

const CANVAS_TEXTURES = [];
function canvasTexture(w, h, draw) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const ctx = c.getContext('2d');
  draw(ctx, w, h);
  const t = new THREE.CanvasTexture(c);
  t.encoding = THREE.sRGBEncoding;
  t.anisotropy = 8;
  CANVAS_TEXTURES.push({ ctx, w, h, draw, t });
  return t;
}
// text drawn into textures must use the web font, so redraw once fonts are ready
if (document.fonts && document.fonts.ready) {
  Promise.all([document.fonts.load('900 100px "Big Shoulders Display"'), document.fonts.load('800 60px "Big Shoulders Display"')])
    .catch(() => {})
    .then(() => document.fonts.ready)
    .then(() => CANVAS_TEXTURES.forEach(o => { o.ctx.clearRect(0, 0, o.w, o.h); o.draw(o.ctx, o.w, o.h); o.t.needsUpdate = true; }));
}

function knurlTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const x = c.getContext('2d');
  x.fillStyle = '#000'; x.fillRect(0, 0, 128, 128);
  x.strokeStyle = '#fff'; x.lineWidth = 9;
  for (let i = -128; i <= 256; i += 16) {
    x.beginPath(); x.moveTo(i, 0); x.lineTo(i + 128, 128); x.stroke();
    x.beginPath(); x.moveTo(i + 128, 0); x.lineTo(i, 128); x.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 8;
  return t;
}

function glowTexture(color = '198,255,26') {
  return canvasTexture(256, 256, (x, w, h) => {
    const g = x.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    g.addColorStop(0, 'rgba(' + color + ',1)'); g.addColorStop(0.35, 'rgba(' + color + ',.28)'); g.addColorStop(1, 'rgba(' + color + ',0)');
    x.fillStyle = g; x.fillRect(0, 0, w, h);
  });
}

function sparkTexture() {
  return canvasTexture(64, 64, (x, w, h) => {
    const g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.25, 'rgba(210,255,90,.8)'); g.addColorStop(1, 'rgba(198,255,26,0)');
    x.fillStyle = g; x.fillRect(0, 0, w, h);
  });
}

function makeMaterials(knurl) {
  return {
    iron:   new THREE.MeshStandardMaterial({ color: 0x0d0e10, metalness: 0.9, roughness: 0.38, envMapIntensity: 0.62 }),
    cast:   new THREE.MeshStandardMaterial({ color: 0x0c0d0f, metalness: 0.85, roughness: 0.5, envMapIntensity: 0.6 }),
    chrome: new THREE.MeshStandardMaterial({ color: 0xdfe3e6, metalness: 1.0, roughness: 0.16, envMapIntensity: 1.05 }),
    knurl:  new THREE.MeshStandardMaterial({ color: 0x9ea4aa, metalness: 1.0, roughness: 0.4, bumpMap: knurl, bumpScale: 1.1, envMapIntensity: 0.85 }),
    rubber: new THREE.MeshStandardMaterial({ color: 0x070808, metalness: 0.2, roughness: 0.55, envMapIntensity: 0.32 }),
    lime:   new THREE.MeshStandardMaterial({ color: 0x8fc400, metalness: 0.1, roughness: 0.42, emissive: 0x2c4a00, emissiveIntensity: 0.55, toneMapped: false })
  };
}

function plateLabel() {
  return canvasTexture(768, 768, (x, w, h) => {
    x.clearRect(0, 0, w, h);
    x.textAlign = 'center'; x.textBaseline = 'middle';
    x.fillStyle = '#c6ff1a';
    x.font = '900 84px "Big Shoulders Display", Impact, sans-serif';
    x.fillText('ELTORA 20 KG', w / 2, h * 0.855);
    x.fillStyle = '#e8ebee';
    x.font = '800 50px "Big Shoulders Display", Impact, sans-serif';
    x.fillText('PERFORMANCE PLATE', w / 2, h * 0.165);
  });
}

function limeLabel(lines) {
  return canvasTexture(512, 512, (x, w, h) => {
    x.clearRect(0, 0, w, h);
    x.textAlign = 'center'; x.textBaseline = 'middle';
    x.fillStyle = '#c6ff1a';
    x.font = '900 150px "Big Shoulders Display", Impact, sans-serif';
    x.fillText(lines[0], w / 2, h * 0.42);
    x.fillStyle = '#e8ebee';
    x.font = '800 64px "Big Shoulders Display", Impact, sans-serif';
    x.fillText(lines[1], w / 2, h * 0.62);
    x.strokeStyle = 'rgba(198,255,26,.7)'; x.lineWidth = 4;
    x.beginPath(); x.moveTo(w * 0.28, h * 0.27); x.lineTo(w * 0.72, h * 0.27); x.stroke();
  });
}

/* ---- Equipment builders (all built along Y axis, centred at origin) ---- */

function hexShape(r) {
  const s = new THREE.Shape();
  for (let i = 0; i < 6; i++) {
    const a = Math.PI / 6 + i * Math.PI / 3; // flat sides face ±x
    const px = Math.cos(a) * r, py = Math.sin(a) * r;
    if (i === 0) s.moveTo(px, py); else s.lineTo(px, py);
  }
  s.closePath();
  return s;
}

function buildDumbbell(m, labelTex) {
  const g = new THREE.Group();
  const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 3.7, 48, 1), m.knurl);
  m.knurl.bumpMap.repeat.set(6, 13);
  handle.castShadow = true; g.add(handle);

  const headGeo = new THREE.ExtrudeGeometry(hexShape(0.98), { depth: 0.72, bevelEnabled: true, bevelThickness: 0.09, bevelSize: 0.09, bevelSegments: 5, curveSegments: 4 });
  headGeo.center(); headGeo.rotateX(Math.PI / 2);
  const faceGeo = new THREE.CircleGeometry(0.8, 48);
  const collarGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.14, 48);
  const ringGeo = new THREE.TorusGeometry(0.86, 0.022, 12, 6 * 8);

  [1, -1].forEach(s => {
    const head = new THREE.Mesh(headGeo, m.iron);
    head.position.y = s * 1.45; head.castShadow = true; head.receiveShadow = true; g.add(head);

    const collar = new THREE.Mesh(collarGeo, m.chrome);
    collar.position.y = s * 0.95; collar.castShadow = true; g.add(collar);

    const ring = new THREE.Mesh(ringGeo, m.lime);
    ring.rotation.x = Math.PI / 2; ring.position.y = s * 1.908; g.add(ring);

    const face = new THREE.Mesh(faceGeo, new THREE.MeshBasicMaterial({ map: labelTex, transparent: true, depthWrite: false }));
    face.rotation.x = s > 0 ? -Math.PI / 2 : Math.PI / 2;
    face.position.y = s * 1.912; g.add(face);
  });
  return g;
}

function buildKettlebell(m, labelTex) {
  const g = new THREE.Group();
  const R = 1.25, thetaEnd = 2.7;
  const body = new THREE.Mesh(new THREE.SphereGeometry(R, 72, 56, 0, Math.PI * 2, 0, thetaEnd), m.cast);
  body.castShadow = true; body.receiveShadow = true; g.add(body);

  const baseY = R * Math.cos(thetaEnd);       // ≈ -1.13
  const baseR = R * Math.sin(thetaEnd);       // ≈ 0.53
  const foot = new THREE.Mesh(new THREE.CylinderGeometry(baseR + 0.03, baseR + 0.14, 0.16, 48), m.cast);
  foot.position.y = baseY - 0.05; foot.castShadow = true; g.add(foot);
  const cap = new THREE.Mesh(new THREE.CircleGeometry(baseR, 48), m.cast);
  cap.rotation.x = Math.PI / 2; cap.position.y = baseY; g.add(cap);

  // decal patch conforming to the sphere
  const patch = new THREE.Mesh(
    new THREE.SphereGeometry(R * 1.004, 48, 32, Math.PI / 2 - 0.62, 1.24, Math.PI / 2 - 0.42, 0.84),
    new THREE.MeshBasicMaterial({ map: labelTex, transparent: true, depthWrite: false })
  );
  g.add(patch);

  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.68, 0.78, 0), new THREE.Vector3(-0.86, 1.42, 0), new THREE.Vector3(-0.62, 1.98, 0),
    new THREE.Vector3(0, 2.16, 0),
    new THREE.Vector3(0.62, 1.98, 0), new THREE.Vector3(0.86, 1.42, 0), new THREE.Vector3(0.68, 0.78, 0)
  ], false, 'catmullrom', 0.5);
  const handle = new THREE.Mesh(new THREE.TubeGeometry(curve, 120, 0.18, 28, false), m.cast);
  handle.castShadow = true; g.add(handle);
  // lime grip band: sampled from the handle's own curve so it hugs it exactly
  const bandPts = []; for (let i = 0; i <= 12; i++) bandPts.push(curve.getPoint(0.36 + (0.28 * i) / 12));
  const band = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(bandPts), 40, 0.196, 28, false), m.lime);
  g.add(band);
  return g;
}

function buildPlate(m, labelTex) {
  const g = new THREE.Group();
  const prof = [[0.56, -0.16], [0.56, 0.16], [1.6, 0.16], [1.72, 0.12], [1.74, 0.06], [1.74, -0.06], [1.72, -0.12], [1.6, -0.16], [0.56, -0.16]]
    .map(p => new THREE.Vector2(p[0], p[1]));
  const disc = new THREE.Mesh(new THREE.LatheGeometry(prof, 120), m.rubber);
  disc.material.side = THREE.DoubleSide;
  disc.castShadow = true; disc.receiveShadow = true; g.add(disc);

  const hubProf = [[0.42, -0.2], [0.42, 0.2], [0.62, 0.2], [0.66, 0.14], [0.66, -0.14], [0.62, -0.2], [0.42, -0.2]].map(p => new THREE.Vector2(p[0], p[1]));
  const hub = new THREE.Mesh(new THREE.LatheGeometry(hubProf, 64), m.chrome);
  hub.material.side = THREE.DoubleSide; hub.castShadow = true; g.add(hub);

  [1, -1].forEach(s => {
    const rx = s > 0 ? -Math.PI / 2 : Math.PI / 2;
    const ring = new THREE.Mesh(new THREE.RingGeometry(1.34, 1.42, 128), m.lime);
    ring.rotation.x = rx; ring.position.y = s * 0.166; g.add(ring);
    const outer = new THREE.Mesh(new THREE.RingGeometry(1.5, 1.53, 128), m.chrome);
    outer.rotation.x = rx; outer.position.y = s * 0.166; g.add(outer);
    const face = new THREE.Mesh(new THREE.CircleGeometry(1.3, 64), new THREE.MeshBasicMaterial({ map: labelTex, transparent: true, depthWrite: false }));
    face.rotation.x = rx; face.position.y = s * 0.168; g.add(face);
  });
  g.rotation.x = Math.PI / 2; // stand upright, faces toward ±Z
  const wrap = new THREE.Group(); wrap.add(g);
  return wrap;
}

/* ==========================================================
   7. HERO SCENE
   ========================================================== */
function initHero() {
  const canvas = $('#heroCanvas');
  const hero = $('.hero');
  if (!canvas) return;
  if (!webglOK()) { document.documentElement.classList.add('no-webgl'); return; }

  let renderer;
  try { renderer = makeRenderer(canvas, { maxDPR: 2, exposure: 0.95 }); }
  catch (e) { document.documentElement.classList.add('no-webgl'); return; }

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  camera.position.set(0, 0.3, 11);
  makeEnv(renderer, scene);

  // ---- lights: white key, lime rim, cool fill ----
  const key = new THREE.DirectionalLight(0xffffff, 1.5);
  key.position.set(4.5, 7, 5); key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  Object.assign(key.shadow.camera, { left: -6, right: 6, top: 6, bottom: -6, near: 1, far: 24 });
  key.shadow.bias = -0.0004; key.shadow.radius = 5;
  scene.add(key);
  const rim = new THREE.PointLight(0xc6ff1a, 2.6, 26, 1.2); rim.position.set(-5.5, 1.5, -3.5); scene.add(rim);
  const rim2 = new THREE.PointLight(0xc6ff1a, 0.9, 20, 1.2); rim2.position.set(5, -2.2, -2); scene.add(rim2);
  const fill = new THREE.DirectionalLight(0x7f95ff, 0.55); fill.position.set(-5, 2, 4); scene.add(fill);
  scene.add(new THREE.AmbientLight(0xffffff, 0.12));

  // ---- floor (shadow catcher) + glow ----
  const floorY = -2.85;
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.ShadowMaterial({ opacity: 0.26 }));
  floor.rotation.x = -Math.PI / 2; floor.position.y = floorY; floor.receiveShadow = true; scene.add(floor);
  const pool = new THREE.Mesh(new THREE.PlaneGeometry(9, 9), new THREE.MeshBasicMaterial({ map: glowTexture(), transparent: true, opacity: 0.4, blending: THREE.AdditiveBlending, depthWrite: false }));
  pool.rotation.x = -Math.PI / 2; pool.position.y = floorY + 0.01; scene.add(pool);
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture('198,255,26'), transparent: true, opacity: 0.32, blending: THREE.AdditiveBlending, depthWrite: false }));
  halo.scale.set(11, 11, 1); halo.position.z = -3; scene.add(halo);

  // ---- hero object ----
  const knurl = knurlTexture();
  const mats = makeMaterials(knurl);
  const label = limeLabel(['ELTORA', '20 KG']);
  const dumbbell = buildDumbbell(mats, label);
  dumbbell.rotation.z = Math.PI / 2;       // lay horizontally
  const tilt = new THREE.Group(); tilt.add(dumbbell);
  const spin = new THREE.Group(); spin.add(tilt);
  const pivot = new THREE.Group(); pivot.add(spin); scene.add(pivot);
  tilt.rotation.set(0.28, 0, -0.34);

  // ---- particles ----
  const N = window.innerWidth < 700 ? 110 : 260;
  const pos = new Float32Array(N * 3), spd = new Float32Array(N);
  for (let i = 0; i < N; i++) { pos[i * 3] = (Math.random() - 0.5) * 18; pos[i * 3 + 1] = (Math.random() - 0.5) * 10; pos[i * 3 + 2] = (Math.random() - 0.5) * 8 - 1; spd[i] = 0.05 + Math.random() * 0.16; }
  const pg = new THREE.BufferGeometry(); pg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const points = new THREE.Points(pg, new THREE.PointsMaterial({ size: 0.075, map: sparkTexture(), transparent: true, opacity: 0.8, depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true }));
  scene.add(points);

  // ---- state ----
  const S = { intro: 0, mx: 0, my: 0, cx: 0, cy: 0, scroll: 0, base: { x: 1.8, y: 0.05, s: 1.18 } };
  const layout = () => {
    const w = hero.clientWidth, h = hero.clientHeight, a = w / h;
    renderer.setSize(w, h, false);
    camera.aspect = a; camera.updateProjectionMatrix();
    if (a > 1.15)      S.base = { x: 1.65, y: 0.1, s: 1.04 };
    else if (a > 0.8)  S.base = { x: 0.9, y: 0.5, s: 0.95 };
    else               S.base = { x: 0, y: 0.32, s: clamp(a * 1.2, 0.5, 0.74) };
  };
  layout();
  new ResizeObserver(layout).observe(hero);

  window.addEventListener('pointermove', e => {
    S.mx = (e.clientX / window.innerWidth) * 2 - 1;
    S.my = (e.clientY / window.innerHeight) * 2 - 1;
  }, { passive: true });
  window.addEventListener('scroll', () => { S.scroll = clamp(window.scrollY / window.innerHeight, 0, 1.2); }, { passive: true });

  // gyroscope-free touch: a gentle auto sway keeps mobile alive
  let visible = true, tabVisible = true;
  new IntersectionObserver(en => { visible = en[0].isIntersecting; }, { threshold: 0 }).observe(hero);
  document.addEventListener('visibilitychange', () => { tabVisible = !document.hidden; });

  const clock = new THREE.Clock();
  let t = 0;
  function frame() {
    requestAnimationFrame(frame);
    if (!visible || !tabVisible) { clock.getDelta(); return; }
    const dt = Math.min(clock.getDelta(), 0.05);
    t += dt;
    const speed = reduceMotion ? 0.15 : 1;

    S.cx = lerp(S.cx, S.mx, 0.05); S.cy = lerp(S.cy, S.my, 0.05);
    const iN = 1 - S.intro;

    // object: float + slow spin + mouse tilt + scroll drift
    const sc = S.base.s * (0.72 + 0.28 * S.intro);
    pivot.scale.setScalar(sc);
    pivot.position.set(S.base.x, S.base.y + Math.sin(t * 0.9 * speed) * 0.14 + S.scroll * 1.6, -iN * 2.5);
    spin.rotation.y = t * 0.32 * speed + iN * 2.6 + S.cx * 0.55 + S.scroll * 1.1;
    tilt.rotation.x = 0.28 + S.cy * 0.22 + Math.sin(t * 0.6 * speed) * 0.05;
    tilt.rotation.z = -0.34 - S.cx * 0.1;

    // cinematic camera: dolly in on intro, then breathe with the cursor
    camera.position.set(S.cx * 0.7, 0.3 - S.cy * 0.4 + S.scroll * 0.4, 11 + iN * 5.5 - Math.sin(t * 0.25 * speed) * 0.25);
    camera.lookAt(S.base.x * 0.12, 0, 0);

    halo.position.set(S.base.x, S.base.y, -3);
    halo.material.opacity = 0.22 + 0.14 * S.intro + Math.sin(t * 1.1) * 0.03;
    pool.position.x = S.base.x;
    rim.position.x = -5.5 + Math.sin(t * 0.4) * 1.2;

    // particles drift upward
    const p = pg.attributes.position.array;
    for (let i = 0; i < N; i++) {
      p[i * 3 + 1] += spd[i] * dt * speed;
      p[i * 3] += Math.sin(t * 0.3 + i) * 0.0009;
      if (p[i * 3 + 1] > 5) p[i * 3 + 1] = -5;
    }
    pg.attributes.position.needsUpdate = true;
    points.rotation.y = S.cx * 0.05;

    renderer.render(scene, camera);
  }
  frame();

  heroAPI = {
    intro(instant) {
      if (instant || !hasGSAP) { S.intro = 1; return; }
      gsap.to(S, { intro: 1, duration: 2.6, ease: 'expo.out' });
    }
  };
  S.intro = 0;
  // if the loader sequence never runs (e.g. error), don't stay zoomed out forever
  setTimeout(() => { if (S.intro === 0) S.intro = 1; }, 8000);
}

/* ==========================================================
   8. INTERACTIVE EQUIPMENT SCENE
   ========================================================== */
function initEquip() {
  const canvas = $('#equipCanvas');
  if (!canvas) return;
  const stage = canvas.parentElement;
  if (!webglOK() || typeof THREE.OrbitControls === 'undefined') { stage.classList.add('no-webgl-equip'); return; }

  let renderer;
  try { renderer = makeRenderer(canvas, { maxDPR: 2, exposure: 0.95 }); }
  catch (e) { stage.classList.add('no-webgl-equip'); return; }

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
  camera.position.set(0, 1.4, 9.2);
  makeEnv(renderer, scene);

  const key = new THREE.SpotLight(0xffffff, 2.2, 40, 0.5, 0.6, 1);
  key.position.set(5, 9, 6); key.castShadow = true; key.shadow.mapSize.set(1024, 1024); key.shadow.bias = -0.0004; key.shadow.radius = 4;
  scene.add(key); scene.add(key.target);
  const rim = new THREE.PointLight(0xc6ff1a, 2.4, 24, 1.2); rim.position.set(-5, 1.2, -4); scene.add(rim);
  const rim2 = new THREE.PointLight(0xc6ff1a, 0.9, 18, 1.2); rim2.position.set(4.5, -1, -3); scene.add(rim2);
  const fill = new THREE.DirectionalLight(0x8aa0ff, 0.55); fill.position.set(-5, 3, 5); scene.add(fill);
  scene.add(new THREE.AmbientLight(0xffffff, 0.12));

  // platform
  const platY = -1.55;
  const plat = new THREE.Mesh(new THREE.CylinderGeometry(2.7, 2.85, 0.16, 96), new THREE.MeshStandardMaterial({ color: 0x0a0b0c, metalness: 0.6, roughness: 0.55, envMapIntensity: 0.16 }));
  plat.position.y = platY - 0.08; plat.receiveShadow = true; scene.add(plat);
  const platRing = new THREE.Mesh(new THREE.TorusGeometry(2.72, 0.022, 12, 128), new THREE.MeshBasicMaterial({ color: 0xc6ff1a, toneMapped: false }));
  platRing.rotation.x = Math.PI / 2; platRing.position.y = platY + 0.002; scene.add(platRing);
  const pool = new THREE.Mesh(new THREE.PlaneGeometry(9, 9), new THREE.MeshBasicMaterial({ map: glowTexture(), transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false }));
  pool.rotation.x = -Math.PI / 2; pool.position.y = platY - 0.14; scene.add(pool);

  // models
  const knurl = knurlTexture();
  const mats = makeMaterials(knurl);
  const models = {};
  const setup = () => {
    models.kettlebell = buildKettlebell(mats, limeLabel(['ELTORA', '24 KG']));
    models.kettlebell.position.y = platY + 1.24;
    models.plate = buildPlate(mats, plateLabel());
    models.plate.position.y = platY + 1.76;
    models.dumbbell = buildDumbbell(mats, limeLabel(['ELTORA', '20 KG']));
    const dbWrap = new THREE.Group(); models.dumbbell.rotation.z = Math.PI / 2; dbWrap.add(models.dumbbell);
    dbWrap.position.y = platY + 1.22; dbWrap.scale.setScalar(1.1);
    models.dumbbell = dbWrap;
  };
  setup();

  const stagePivot = new THREE.Group(); scene.add(stagePivot);
  let current = null, currentName = 'kettlebell';
  const baseScale = { kettlebell: 1, plate: 1, dumbbell: 1.1 };
  const restY = { kettlebell: platY + 1.24, plate: platY + 1.76, dumbbell: platY + 1.22 };
  function show(name, animate) {
    const next = models[name]; if (!next) return;
    const add = () => {
      if (current) stagePivot.remove(current);
      current = next; currentName = name; stagePivot.add(current);
      if (animate && hasGSAP) { current.scale.setScalar(0.01); gsap.to(current.scale, { x: baseScale[name], y: baseScale[name], z: baseScale[name], duration: 0.9, ease: 'back.out(1.6)' }); }
      else current.scale.setScalar(baseScale[name]);
    };
    if (current && animate && hasGSAP) gsap.to(current.scale, { x: 0.01, y: 0.01, z: 0.01, duration: 0.28, ease: 'power2.in', onComplete: add });
    else add();
  }
  show('kettlebell', false);

  $$('.equip__pick button').forEach(b => b.addEventListener('click', () => {
    $$('.equip__pick button').forEach(x => x.setAttribute('aria-selected', String(x === b)));
    show(b.dataset.model, true);
  }));

  // controls: drag to rotate, ctrl/⌘+wheel or buttons to zoom
  const controls = new THREE.OrbitControls(camera, canvas);
  controls.enablePan = false; controls.enableZoom = false;
  controls.enableDamping = true; controls.dampingFactor = 0.07;
  controls.autoRotate = !reduceMotion; controls.autoRotateSpeed = 1.6;
  controls.minPolarAngle = 0.75; controls.maxPolarAngle = 1.7;
  controls.target.set(0, 0.05, 0);
  let idleTimer;
  controls.addEventListener('start', () => { controls.autoRotate = false; clearTimeout(idleTimer); });
  controls.addEventListener('end', () => { clearTimeout(idleTimer); if (!reduceMotion) idleTimer = setTimeout(() => { controls.autoRotate = true; }, 2500); });

  const DMIN = 5.2, DMAX = 13;
  let dist = camera.position.distanceTo(controls.target), distT = dist;
  const dolly = k => { distT = clamp(distT * k, DMIN, DMAX); };
  canvas.addEventListener('wheel', e => { if (e.ctrlKey || e.metaKey) { e.preventDefault(); dolly(e.deltaY > 0 ? 1.08 : 0.92); } }, { passive: false });
  $('#zoomIn').addEventListener('click', () => dolly(0.82));
  $('#zoomOut').addEventListener('click', () => dolly(1.22));

  // pinch to zoom (two fingers)
  const pts = new Map(); let pinch0 = 0;
  canvas.addEventListener('pointerdown', e => { pts.set(e.pointerId, e); if (pts.size === 2) { const [a, b] = [...pts.values()]; pinch0 = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY); } });
  canvas.addEventListener('pointermove', e => {
    if (!pts.has(e.pointerId)) return; pts.set(e.pointerId, e);
    if (pts.size === 2) { const [a, b] = [...pts.values()]; const d = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY); if (pinch0) dolly(pinch0 / d); pinch0 = d; }
  });
  ['pointerup', 'pointercancel', 'pointerleave'].forEach(ev => canvas.addEventListener(ev, e => { pts.delete(e.pointerId); pinch0 = 0; }));

  const layout = () => {
    const w = stage.clientWidth, h = stage.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.fov = w / h < 0.9 ? 46 : 36;
    camera.updateProjectionMatrix();
  };
  layout();
  new ResizeObserver(layout).observe(stage);

  let visible = false, tabVisible = true;
  new IntersectionObserver(en => { visible = en[0].isIntersecting; }, { threshold: 0.02 }).observe(stage);
  document.addEventListener('visibilitychange', () => { tabVisible = !document.hidden; });

  const clock = new THREE.Clock(); let t = 0;
  function frame() {
    requestAnimationFrame(frame);
    if (!visible || !tabVisible) { clock.getDelta(); return; }
    t += Math.min(clock.getDelta(), 0.05);
    if (current) current.position.y += (restY[currentName] + Math.sin(t * 1.2) * 0.06 - current.position.y) * 0.1;
    // smooth zoom
    dist = lerp(dist, distT, 0.1);
    const v = camera.position.clone().sub(controls.target);
    if (Math.abs(v.length() - dist) > 0.001) { v.setLength(dist); camera.position.copy(controls.target).add(v); }
    controls.update();
    key.target.position.set(0, 0, 0);
    renderer.render(scene, camera);
  }
  frame();
}

/* ==========================================================
   9. LIGHTBOX
   ========================================================== */
function initLightbox() {
  const dlg = $('#lightbox'), img = $('#lbImg'), cap = $('#lbCap');
  if (!dlg || typeof dlg.showModal !== 'function') return;
  const open = fig => {
    if (fig.classList.contains('is-missing')) return;
    const src = $('img', fig);
    img.src = src.currentSrc || src.src; img.alt = src.alt; cap.textContent = fig.dataset.cat || '';
    dlg.showModal(); if (lenis) lenis.stop();
  };
  const close = () => { if (dlg.open) dlg.close(); };
  dlg.addEventListener('close', () => { if (lenis && !menuOpen) lenis.start(); });
  $('#lbClose').addEventListener('click', close);
  dlg.addEventListener('click', e => { if (e.target === dlg) close(); });
  $$('.masonry .m').forEach(fig => {
    fig.tabIndex = 0; fig.setAttribute('role', 'button'); fig.setAttribute('aria-label', 'Enlarge photo: ' + (fig.dataset.cat || ''));
    fig.addEventListener('click', () => open(fig));
    fig.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(fig); } });
  });
}

/* ==========================================================
   10. FORM — front-end validation + confirmation (no backend)
   ========================================================== */
function initForm() {
  const form = $('#leadForm'), status = $('#formStatus');
  if (!form) return;
  const dateEl = $('#f-date');
  const d = new Date(); const pad = n => String(n).padStart(2, '0');
  const today = d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  dateEl.min = today;

  const rules = {
    name:  v => v.trim().length >= 2 ? '' : 'Enter your full name.',
    email: v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? '' : 'Enter a valid email address, like name@example.com.',
    phone: v => {
      const digits = v.replace(/\D/g, '');
      const ok = (digits.length === 10 && /^[6-9]/.test(digits)) || (digits.length === 12 && digits.startsWith('91') && /^[6-9]/.test(digits.slice(2)));
      return ok ? '' : 'Enter a 10-digit Indian mobile number (with or without +91).';
    },
    goal:  v => v ? '' : 'Choose the goal closest to yours.',
    date:  v => !v ? 'Pick a preferred date.' : (v < today ? 'Choose today or a future date.' : ''),
    message: v => v.length <= 500 ? '' : 'Keep your message under 500 characters.'
  };

  const setErr = (el, msg) => {
    const f = el.closest('.field'), out = $('[data-err]', f);
    f.classList.toggle('has-error', !!msg);
    el.setAttribute('aria-invalid', msg ? 'true' : 'false');
    out.textContent = msg;
    if (msg) { out.id = out.id || el.id + '-err'; el.setAttribute('aria-describedby', out.id); } else el.removeAttribute('aria-describedby');
  };
  const validate = el => { const r = rules[el.name]; const msg = r ? r(el.value) : ''; setErr(el, msg); return !msg; };

  let attempted = false;
  $$('input,select,textarea', form).forEach(el => {
    el.addEventListener('blur', () => { if (el.value || attempted) validate(el); });
    el.addEventListener('input', () => { if (attempted || el.closest('.field').classList.contains('has-error')) validate(el); });
    el.addEventListener('change', () => { if (attempted || el.closest('.field').classList.contains('has-error')) validate(el); });
  });

  form.addEventListener('submit', e => {
    e.preventDefault(); attempted = true;
    status.className = 'form__status'; status.textContent = '';
    const fields = $$('input,select,textarea', form);
    const bad = fields.filter(el => !validate(el));
    if (bad.length) {
      status.classList.add('is-err');
      status.textContent = bad.length === 1 ? 'One field needs attention.' : bad.length + ' fields need attention.';
      bad[0].focus();
      return;
    }
    const data = Object.fromEntries(new FormData(form).entries());
    const pretty = new Date(data.date + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });
    status.classList.add('is-ok');
    status.textContent = '';
    const strong = document.createElement('strong');
    strong.textContent = 'You’re booked in, ' + data.name.trim().split(' ')[0] + '.';
    const p = document.createElement('span');
    p.textContent = 'We’ve noted your intro session for ' + pretty + ' (goal: ' + data.goal.toLowerCase() + '). A coach will confirm by phone or email. This is a demo form, so nothing was actually sent.';
    status.append(strong, p);
    form.reset(); attempted = false;
    $$('.field', form).forEach(f => f.classList.remove('has-error'));
    status.focus();
  });
}

/* ==========================================================
   BOOT
   ========================================================== */
safe('image slots', initImageSlots);
safe('scroll', initScroll);
safe('nav', initNav);
safe('reveals', initReveals);
safe('counters', initCounters);
safe('magnetic', initMagnetic);
safe('parallax', initParallax);
safe('hero3d', initHero);
safe('equip3d', initEquip);
safe('lightbox', initLightbox);
safe('form', initForm);
safe('intro', runIntro);
window.addEventListener('load', () => { if (hasST) ScrollTrigger.refresh(); });

})();
