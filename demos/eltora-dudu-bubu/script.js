/* =========================================================================
   ELTOR — DUDU & BUBU ENGAGEMENT INVITATION
   script.js

   EDIT THE CONFIG BELOW TO CUSTOMISE THE INVITATION.
   Nothing else in this file needs to change for basic edits.
   ========================================================================= */

const CONFIG = {
  groomName: "Dudu",
  brideName: "Bubu",
  eventDate: "2029-03-15T00:00:00", // ISO date used by the live countdown
  displayDate: "15 March 2029",
  familyName: "ELTOR Family",
  brandName: "ELTOR",
  venue: "ELTOR Home Function",
  time: "To Be Announced",

  // Optional — leave blank to hide related UI
  phone: "",
  whatsapp: "",          // e.g. "+91XXXXXXXXXX" — enables an RSVP button on the Invite section
  directionsUrl: "",     // e.g. a Google Maps link — falls back to a text search of `venue`

  // Media
  audioSrc: "assets/audio/Radhimaa.mp3", // background music, plays across the whole site
  photos: [
    "assets/images/gallery1.jpg",
    "assets/images/gallery2.jpg",
    "assets/images/gallery3.jpg",
    "assets/images/gallery4.jpg",
    "assets/images/gallery5.jpg",
    "assets/images/gallery6.jpg",
  ],
  heroPhoto: "", // e.g. "assets/images/couple-hero.jpg" — activates the cinematic
                 // arched portrait behind the names on the opening screen.
};

/* =========================================================================
   Utilities
   ========================================================================= */
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const isCoarsePointer = window.matchMedia("(pointer: coarse)").matches;
const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
const lerp = (a, b, t) => a + (b - a) * t;

function pad2(n) { return String(Math.max(0, n)).padStart(2, "0"); }

/** Generates a soft circular sprite texture for particle points. */
function makeGlowTexture(hex = "#e8c98a") {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d");
  const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0, "rgba(255,255,255,0.95)");
  grad.addColorStop(0.25, hex);
  grad.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

/* =========================================================================
   Populate editable text content from CONFIG
   ========================================================================= */
(function applyConfig() {
  document.title = `${CONFIG.groomName} & ${CONFIG.brideName} — Engagement Celebration | ${CONFIG.brandName}`;

  const setText = (id, text) => { const el = document.getElementById(id); if (el) el.textContent = text; };
  setText("venueValue", CONFIG.venue);
  setText("timeValue", CONFIG.time);
  setText("inviteVenue", CONFIG.venue);
  setText("locationVenue", CONFIG.venue);

  const directions = document.getElementById("directionsBtn");
  if (directions) {
    directions.href = CONFIG.directionsUrl
      ? CONFIG.directionsUrl
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(CONFIG.venue)}`;
    directions.target = "_blank";
    directions.rel = "noopener";
  }

  // Optional WhatsApp RSVP — only injected if a number is configured
  if (CONFIG.whatsapp) {
    const invite = document.querySelector("#invite .section-inner");
    if (invite) {
      const a = document.createElement("a");
      a.className = "cta-outline reveal";
      a.style.marginTop = "22px";
      a.href = `https://wa.me/${CONFIG.whatsapp.replace(/[^\d]/g, "")}`;
      a.target = "_blank";
      a.rel = "noopener";
      a.innerHTML = "<span>RSVP on WhatsApp</span><span class='cta-arrow'>&rarr;</span>";
      invite.appendChild(a);
    }
  }

  // Optional cinematic hero portrait
  if (CONFIG.heroPhoto) {
    const frame = document.getElementById("introPhotoFrame");
    const img = document.getElementById("introPhotoImg");
    if (frame && img) {
      img.style.backgroundImage = `url('${CONFIG.heroPhoto}')`;
      frame.classList.add("has-photo");
    }
  }

  // Photo gallery — six frames, six distinct photos, strict 1:1 mapping
  // (no modulo/wraparound, so a frame is simply skipped rather than ever
  // reusing another photo). Lazy-loaded as each frame nears the viewport.
  if (CONFIG.photos && CONFIG.photos.length) {
    const frames = document.querySelectorAll(".photo-frame");
    const loadFrame = (frame, i) => {
      const src = CONFIG.photos[i];
      if (!src) return;
      const imgEl = frame.querySelector(".photo-frame-img");
      if (!imgEl) return;
      const preload = new Image();
      preload.onload = () => {
        imgEl.src = src;
        frame.classList.add("has-photo");
      };
      preload.src = src;
    };

    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver((entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const i = Array.prototype.indexOf.call(frames, entry.target);
            loadFrame(entry.target, i);
            obs.unobserve(entry.target);
          }
        });
      }, { rootMargin: "200px 0px" });
      frames.forEach((frame) => io.observe(frame));
    } else {
      frames.forEach((frame, i) => loadFrame(frame, i));
    }
  }
})();

/* =========================================================================
   Countdown
   ========================================================================= */
(function countdown() {
  const target = new Date(CONFIG.eventDate).getTime();
  const els = {
    d: document.getElementById("cdDays"),
    h: document.getElementById("cdHours"),
    m: document.getElementById("cdMinutes"),
    s: document.getElementById("cdSeconds"),
  };
  if (!els.d) return;

  function tick() {
    const diff = target - Date.now();
    if (diff <= 0) {
      els.d.textContent = els.h.textContent = els.m.textContent = els.s.textContent = "00";
      return;
    }
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    const secs = Math.floor((diff % 60000) / 1000);
    els.d.textContent = pad2(days);
    els.h.textContent = pad2(hours);
    els.m.textContent = pad2(mins);
    els.s.textContent = pad2(secs);
  }
  tick();
  setInterval(tick, 1000);
})();

/* =========================================================================
   Music control
   No UI (no button, no volume slider) — the single existing <audio id="bgAudio">
   element is used as-is. Playback is triggered exactly once, directly from
   the "BEGIN THE CELEBRATION →" click handler, and never anywhere else.
   ========================================================================= */
const EltoraMusic = (function music() {
  const audio = document.getElementById("bgAudio");
  if (!audio) return { start() {} };

  // Set up + start buffering as early as possible (page load), so by the
  // time the visitor reaches and clicks the button, the audio is already
  // decoded and sitting ready — play() then has nothing left to wait on.
  audio.src = CONFIG.audioSrc;
  audio.loop = true;
  audio.preload = "auto";
  audio.volume = 0.3; // fixed, elegant, soft — no UI to adjust it
  try { audio.load(); } catch (e) {}

  let started = false;

  function start() {
    if (started) return;
    started = true;
    // Called as the very first line of the click handler — a direct,
    // synchronous, user-gesture play() call. Nothing is awaited, delayed,
    // or scheduled before this line runs.
    try {
      if (audio.readyState > 0) audio.currentTime = 0;
    } catch (e) {}
    audio.play().catch(() => {
      // In the rare case a browser still blocks it, allow a retry on the
      // very next gesture instead of leaving the song silently stuck off.
      started = false;
    });
  }

  return { start };
})();


/* =========================================================================
   Floating nav visibility
   ========================================================================= */
(function nav() {
  const nav = document.getElementById("floatnav");
  if (!nav) return;
  window.addEventListener("scroll", () => {
    nav.classList.toggle("scrolled", window.scrollY > 40);
  }, { passive: true });
})();

/* =========================================================================
   Cursor glow (desktop only)
   ========================================================================= */
(function cursorGlow() {
  if (isCoarsePointer) return;
  const glow = document.getElementById("cursorGlow");
  if (!glow) return;
  let raf = null;
  window.addEventListener("mousemove", (e) => {
    glow.style.opacity = "1";
    if (raf) return;
    raf = requestAnimationFrame(() => {
      glow.style.left = e.clientX + "px";
      glow.style.top = e.clientY + "px";
      raf = null;
    });
  });
})();

/* =========================================================================
   ELTORA — premium brand welcome
   A light, self-contained 2D canvas particle drift (kept separate from the
   Three.js intro scene below on purpose — this screen is brief and should
   stay light-weight). Gives a soft, slow-moving field of golden motes for
   cinematic depth without being flashy or game-like.
   ========================================================================= */
const EltoraParticles = (() => {
  const canvas = document.getElementById("eltoraCanvas");
  if (!canvas) return { start() {}, stop() {} };
  const ctx = canvas.getContext("2d");
  let particles = [];
  let raf = null;
  let running = false;
  let w = 0, h = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);

  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    w = rect.width; h = rect.height;
    canvas.width = w * dpr; canvas.height = h * dpr;
    canvas.style.width = w + "px"; canvas.style.height = h + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function seed() {
    const count = isCoarsePointer ? 34 : 60;
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: 0.6 + Math.random() * 1.6,
      s: 0.06 + Math.random() * 0.16,
      drift: (Math.random() - 0.5) * 0.06,
      tw: Math.random() * Math.PI * 2,
      alpha: 0.25 + Math.random() * 0.45,
    }));
  }

  function draw() {
    if (!running) return;
    ctx.clearRect(0, 0, w, h);
    if (!prefersReducedMotion) {
      particles.forEach((p) => {
        p.y -= p.s;
        p.x += p.drift;
        p.tw += 0.02;
        if (p.y < -6) { p.y = h + 6; p.x = Math.random() * w; }
        if (p.x < -6) p.x = w + 6;
        if (p.x > w + 6) p.x = -6;
        const flicker = 0.65 + Math.sin(p.tw) * 0.35;
        ctx.beginPath();
        ctx.fillStyle = `rgba(232,201,138,${(p.alpha * flicker).toFixed(3)})`;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      });
    }
    raf = requestAnimationFrame(draw);
  }

  window.addEventListener("resize", () => { resize(); });

  return {
    start() {
      if (running) return;
      running = true;
      resize();
      seed();
      draw();
    },
    stop() {
      running = false;
      if (raf) cancelAnimationFrame(raf);
      ctx.clearRect(0, 0, w, h);
    },
  };
})();

let eltoraWelcomeDone = false;

function runEltoraWelcome() {
  const section = document.getElementById("eltoraWelcome");
  if (!section) { eltoraWelcomeDone = true; runIntroTimeline(); return; }

  EltoraParticles.start();
  const reduced = prefersReducedMotion;
  const tl = gsap.timeline({
    defaults: { ease: "power2.out" },
    onComplete: leaveEltoraWelcome,
  });

  if (reduced) {
    tl.to("#eltoraGlow", { opacity: 0.6, duration: 0.3 })
      .to("#eltoraMark", { opacity: 1, scale: 1, duration: 0.3 }, "<")
      .to("#eltoraEyebrow", { opacity: 1, y: 0, duration: 0.3 }, "<")
      .to(".eltora-word", { opacity: 1, y: 0, duration: 0.3, stagger: 0.15 }, "<")
      .to({}, { duration: 1.1 });
    return;
  }

  // 0.2s — the golden bloom slowly fills the centre of a dark screen.
  tl.to("#eltoraGlow", { opacity: 0.85, scale: 1, duration: 1.7, ease: "power3.out" }, 0.2)
    // 0.4s — the ELTORA wordmark/ring settles in first.
    .to("#eltoraMark", { opacity: 1, scale: 1, duration: 1.1, ease: "power3.out" }, 0.4)
    // 1.4s — "WELCOME TO" rises in.
    .to("#eltoraEyebrow", { opacity: 1, y: 0, duration: 0.8 }, 1.4)
    // 1.9s — "ELTORA" then "FAMILY" reveal, the main focal moment.
    .fromTo(".eltora-word", { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: 1, stagger: 0.4 }, 1.9)
    // hold on the finished lockup so it can breathe before handing off.
    .to({}, { duration: 1.9 });
}

/** Cinematic gold flash hand-off from the ELTORA welcome into the DUDU & BUBU intro. */
let eltoraLeft = false;
function leaveEltoraWelcome() {
  if (eltoraLeft) return;
  eltoraLeft = true;

  const section = document.getElementById("eltoraWelcome");
  const flash = document.getElementById("eltoraFlash");
  const reduced = prefersReducedMotion;

  const tl = gsap.timeline({
    onComplete: () => {
      if (section) { section.classList.add("leaving"); section.style.display = "none"; }
      EltoraParticles.stop();
      eltoraWelcomeDone = true;
      runIntroTimeline();
    },
  });

  if (reduced) {
    tl.to(section, { opacity: 0, duration: 0.3 });
  } else {
    tl.to(flash, { opacity: 1, duration: 0.5, ease: "power2.in" })
      .to(section, { opacity: 0, duration: 0.35, ease: "power1.out" }, "-=0.1")
      .to(flash, { opacity: 0, duration: 0.6, ease: "power2.out" }, "-=0.05");
  }
}

/* =========================================================================
   INTRO CINEMATIC SEQUENCE
   A luxury jewellery-commercial opening: layered dust / starlight / petals,
   two rings entering from off-screen and meeting at centre, a diamond glint,
   then the couple's names rising out of the gold light.
   ========================================================================= */
const IntroScene = (() => {
  const canvas = document.getElementById("introCanvas");
  const empty = {
    start() {}, stop() {}, ringGroupA: null, ringGroupB: null,
    gemLight: null, rimLight: null, setMouse() {},
  };
  if (!canvas || typeof THREE === "undefined") return empty;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x1a060d, 0.05);
  const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 100);
  camera.position.set(0, 0, 12);

  /* ---- lighting: warm key + cool rim + a dedicated gem sparkle light ---- */
  const hemi = new THREE.HemisphereLight(0xfff2d8, 0x1a0a10, 0.5);
  scene.add(hemi);
  const key = new THREE.DirectionalLight(0xffe9bd, 1.05);
  key.position.set(4, 5, 7);
  scene.add(key);
  const rimLight = new THREE.PointLight(0xd98a6b, 0.9, 40);
  rimLight.position.set(-6, -2, 5);
  scene.add(rimLight);
  const gemLight = new THREE.PointLight(0xffffff, 0, 12);
  gemLight.position.set(0, 0.9, 3);
  scene.add(gemLight);

  /* ---- soft volumetric glow sprite behind the rings (fake bloom) ---- */
  const glowSprite = new THREE.Sprite(new THREE.SpriteMaterial({
    map: makeGlowTexture("#f7e7c1"),
    color: 0xffe9bd,
    transparent: true,
    opacity: 0.35,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  }));
  glowSprite.scale.set(9, 9, 1);
  glowSprite.position.set(0, 0.3, -1);
  scene.add(glowSprite);

  /* ---- gold material helper ---- */
  function gold(extra = {}) {
    return new THREE.MeshStandardMaterial({
      color: 0xcfaf6e, metalness: 1, roughness: 0.25,
      emissive: 0x3a2a0f, emissiveIntensity: 0.3,
      transparent: true, opacity: 1,
      ...extra,
    });
  }

  /* ---- Ring 1 — engagement ring with a diamond ---- */
  const ringGroupA = new THREE.Group();
  const bandA = new THREE.Mesh(new THREE.TorusGeometry(0.85, 0.1, 28, 100), gold());
  bandA.rotation.x = Math.PI / 2.15;
  const gemMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff, roughness: 0.04, metalness: 0,
    transmission: 0.92, thickness: 0.4, clearcoat: 1,
    transparent: true, opacity: 1,
  });
  const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.2, 0), gemMat);
  gem.position.set(0, 0.82, 0.05);
  gem.scale.set(1, 1.35, 1);
  ringGroupA.add(bandA, gem);

  /* ---- Ring 2 — minimal wedding band ---- */
  const ringGroupB = new THREE.Group();
  const bandB = new THREE.Mesh(new THREE.TorusGeometry(0.78, 0.065, 28, 100), gold({ emissiveIntensity: 0.4 }));
  bandB.rotation.x = Math.PI / 2.15;
  ringGroupB.add(bandB);

  // Start far apart, off-canvas, and invisible until the timeline reveals them.
  ringGroupA.position.set(-9, 0.5, -1.4);
  ringGroupB.position.set(9, -0.35, -1.4);
  ringGroupA.scale.setScalar(0.001);
  ringGroupB.scale.setScalar(0.001);
  scene.add(ringGroupA, ringGroupB);

  /* ---- Particle field builder (dust / stars / petals share this) ---- */
  function makeField({ count, spread, size, color, additive = true }) {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const seeds = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * spread.x;
      positions[i * 3 + 1] = (Math.random() - 0.5) * spread.y;
      positions[i * 3 + 2] = (Math.random() - 0.5) * spread.z;
      seeds[i * 3] = Math.random() * Math.PI * 2;
      seeds[i * 3 + 1] = 0.1 + Math.random() * 0.4;
      seeds[i * 3 + 2] = 0.2 + Math.random() * 0.6;
    }
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({
      size, map: makeGlowTexture(color), color,
      transparent: true, depthWrite: false, opacity: 0.85,
      blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending,
    });
    const points = new THREE.Points(geo, mat);
    scene.add(points);
    return { points, geo, seeds, count, spread };
  }

  const dustCount = isCoarsePointer ? 140 : 300;
  const starCount = isCoarsePointer ? 60 : 140;
  const petalCount = isCoarsePointer ? 26 : 55;

  const dust = makeField({ count: dustCount, spread: { x: 22, y: 16, z: 10 }, size: 0.07, color: "#e8c98a" });
  const stars = makeField({ count: starCount, spread: { x: 26, y: 18, z: 14 }, size: 0.045, color: "#fff6df" });
  const petals = makeField({ count: petalCount, spread: { x: 18, y: 14, z: 8 }, size: 0.14, color: "#d9a6a0", additive: false });

  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    renderer.setSize(rect.width, rect.height, false);
    camera.aspect = rect.width / Math.max(rect.height, 1);
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener("resize", resize);

  /* ---- gentle mouse parallax ---- */
  let mx = 0, my = 0;
  function setMouse(nx, ny) { mx = nx; my = ny; }
  window.addEventListener("mousemove", (e) => {
    setMouse(e.clientX / window.innerWidth - 0.5, e.clientY / window.innerHeight - 0.5);
  });

  let running = false;
  let raf = null;
  const clock = new THREE.Clock();

  function animate() {
    if (!running) return;
    const t = clock.getElapsedTime();

    if (!prefersReducedMotion) {
      // Dust drifts gently upward.
      const dp = dust.geo.attributes.position;
      for (let i = 0; i < dust.count; i++) {
        let y = dp.getY(i) + dust.seeds[i * 3 + 1] * 0.006;
        if (y > 8) y = -8;
        dp.setY(i, y);
        dp.setX(i, dp.getX(i) + Math.sin(t * dust.seeds[i * 3 + 2] + dust.seeds[i * 3]) * 0.0015);
      }
      dp.needsUpdate = true;
      dust.points.rotation.y = t * 0.012;

      // Stars twinkle via a shared sine pulse on overall opacity.
      stars.points.material.opacity = 0.55 + Math.sin(t * 1.6) * 0.25;
      stars.points.rotation.y = t * 0.006;

      // Petals fall slowly with a soft side-to-side sway.
      const pp = petals.geo.attributes.position;
      for (let i = 0; i < petals.count; i++) {
        let y = pp.getY(i) - petals.seeds[i * 3 + 1] * 0.01;
        if (y < -7) y = 7;
        pp.setY(i, y);
        pp.setX(i, pp.getX(i) + Math.sin(t * petals.seeds[i * 3 + 2] * 0.5 + petals.seeds[i * 3]) * 0.002);
      }
      pp.needsUpdate = true;
      petals.points.rotation.z = Math.sin(t * 0.05) * 0.05;

      // Rings rotate slowly and continuously — a luxury commercial, not a spin cycle.
      ringGroupA.rotation.y = t * 0.16;
      ringGroupB.rotation.y = -t * 0.13;
      glowSprite.material.opacity = 0.28 + Math.sin(t * 0.5) * 0.08;
    }

    // Mouse parallax — camera, light and glow sprite drift a few % with the cursor.
    camera.position.x = lerp(camera.position.x, mx * 1.1, 0.03);
    camera.position.y = lerp(camera.position.y, -my * 0.8, 0.03);
    camera.lookAt(0, 0.1, 0);
    rimLight.position.x = lerp(rimLight.position.x, -6 + mx * 3, 0.04);
    glowSprite.position.x = lerp(glowSprite.position.x, mx * 0.6, 0.04);

    renderer.render(scene, camera);
    raf = requestAnimationFrame(animate);
  }

  return {
    start() { if (running) return; running = true; animate(); },
    stop() { running = false; if (raf) cancelAnimationFrame(raf); },
    ringGroupA, ringGroupB, gemMat, gemLight, rimLight, setMouse,
  };
})();

/* -------------------------------------------------------------------------
   Timeline — every cue below mirrors a luxury-commercial beat sheet:
   particles -> glow -> rings enter -> rings meet -> diamond catches light
   -> names reveal -> date -> button. Reduced-motion collapses it to a fade.
------------------------------------------------------------------------- */
function runIntroTimeline() {
  const reduced = prefersReducedMotion;
  const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

  IntroScene.start();

  const { ringGroupA, ringGroupB, gemMat, gemLight, rimLight } = IntroScene;

  if (reduced) {
    // Calm, near-instant reveal for people who prefer minimal motion.
    tl.to("#introLight", { opacity: 0.7, duration: 0.3 })
      .to("#introFrame", { opacity: 0.4, scale: 1, duration: 0.3 }, "<")
      .to(["#introEyebrow", "#introBrand"], { opacity: 1, duration: 0.3 }, "<")
      .to(".intro-name, .intro-amp", { opacity: 1, y: 0, duration: 0.3 }, "<")
      .to(["#introSub", "#introDate"], { opacity: 1, duration: 0.3 }, "<")
      .to("#introPhotoFrame", { opacity: 0.22, scale: 1, duration: 0.3 }, "<")
      .to("#introEnter", { opacity: 1, duration: 0.3 }, "<")
      .to("#introScrollHint", { opacity: 0.7, duration: 0.3 }, "+=0.1");
    if (ringGroupA && ringGroupB) {
      gsap.set(ringGroupA.position, { x: -0.9 });
      gsap.set(ringGroupB.position, { x: 0.9 });
      gsap.set([ringGroupA.scale, ringGroupB.scale], { x: 1, y: 1, z: 1 });
    }
    return;
  }

  // 0.5s — tiny golden particles are already drifting (IntroScene.start()).
  tl.to("#introLight", { opacity: 1, duration: 0.6 }, 0.5)
    // 1.0s — soft golden light blooms outward, wide enough to light the whole title area.
    .to("#introLight", { scale: 95, opacity: 0.7, duration: 1.6, ease: "power3.out" }, 1.0)
    .to("#introFrame", { opacity: 1, scale: 1, duration: 1.6, ease: "power3.out" }, 1.0)
    .fromTo("#introFrame .ornament-petals", { rotate: -20 }, { rotate: 0, duration: 1.6, ease: "power3.out", transformOrigin: "200px 200px" }, 1.0);

  // 1.5s — the two rings slowly appear (scale up from nothing) and begin drifting inward.
  if (ringGroupA && ringGroupB) {
    tl.to(ringGroupA.scale, { x: 1, y: 1, z: 1, duration: 1, ease: "power2.out" }, 1.5)
      .to(ringGroupB.scale, { x: 1, y: 1, z: 1, duration: 1, ease: "power2.out" }, 1.5)
      // 2.5s — they travel toward the centre and meet, very slowly.
      .to(ringGroupA.position, { x: -0.85, y: 0.15, z: -0.4, duration: 2.4, ease: "power2.inOut" }, 2.5)
      .to(ringGroupB.position, { x: 0.85, y: -0.1, z: -0.4, duration: 2.4, ease: "power2.inOut" }, 2.5)
      // 3.5s — warm light passes across them and the diamond catches the light.
      .to(rimLight, { intensity: 2.6, duration: 0.5, ease: "power1.inOut", yoyo: true, repeat: 1 }, 3.5)
      .to(gemLight, { intensity: 3.2, duration: 0.45, ease: "power1.inOut", yoyo: true, repeat: 1 }, 3.5)
      .to(gemMat, { roughness: 0.01, duration: 0.4 }, 3.5)
      // after the glint, the rings gently rise and recede so the names can take focus.
      .to(ringGroupA.position, { y: 2.1, z: -6, duration: 1.6, ease: "power2.inOut" }, 4.0)
      .to(ringGroupB.position, { y: 2.3, z: -6, duration: 1.6, ease: "power2.inOut" }, 4.0)
      .to([ringGroupA.scale, ringGroupB.scale], { x: 0.55, y: 0.55, z: 0.55, duration: 1.6, ease: "power2.inOut" }, 4.0)
      .to([bandMaterialsOpacity(ringGroupA), bandMaterialsOpacity(ringGroupB)], { opacity: 0.4, duration: 1.4 }, 4.0);
  }

  // 4.0s — cinematic couple portrait settles in as a faint, subtle backdrop
  // (kept low-opacity on purpose so it never competes with the names above it).
  tl.to("#introPhotoFrame", { opacity: 0.22, scale: 1, duration: 1.4, ease: "power2.out" }, 4.0)
    // brand mark fades as the names take over.
    .to("#introEyebrow", { opacity: 1, duration: 0.8 }, 3.6)
    .to("#introBrand", { opacity: 1, duration: 0.9 }, 3.7)
    .to("#introBrand", { opacity: 0, duration: 0.6 }, 4.6)
    .to("#introFrame", { opacity: 0.12, duration: 0.6 }, 4.6)
    // 4.0s (kept slightly after brand for legibility) — DUDU & BUBU reveal.
    .fromTo(".intro-name", { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 1, stagger: 0.25 }, 4.0)
    .to(".intro-amp", { opacity: 1, duration: 0.8 }, 4.5)
    .to("#introSub", { opacity: 1, duration: 0.8 }, 4.7)
    // 5.0s — date appears.
    .to("#introDate", { opacity: 1, duration: 0.8 }, 5.0)
    // 5.5s — the button invites them in.
    .to("#introEnter", { opacity: 1, duration: 0.8 }, 5.5)
    .to("#introScrollHint", { opacity: 0.75, duration: 0.8 }, 6.2);
}

/** Small helper: returns a proxy object whose "opacity" setter drives every
 *  mesh material inside a ring group — used to fade the rings as they recede. */
function bandMaterialsOpacity(group) {
  const mats = [];
  group.traverse((obj) => { if (obj.material) mats.push(obj.material); });
  return {
    get opacity() { return mats[0] ? mats[0].opacity : 1; },
    set opacity(v) { mats.forEach((m) => { m.opacity = v; }); },
  };
}

/* -------------------------------------------------------------------------
   Cinematic hand-off into the main invitation: a warm gold flash fills the
   screen (like a film transition) before the hero section is revealed.
------------------------------------------------------------------------- */
let introLeft = false;
function leaveIntro() {
  if (introLeft) return;
  introLeft = true;

  const intro = document.getElementById("intro");
  const flash = document.getElementById("introFlash");
  const nav = document.getElementById("floatnav");
  const reduced = prefersReducedMotion;

  const tl = gsap.timeline({
    onComplete: () => {
      intro.classList.add("leaving");
      intro.style.display = "none";
      IntroScene.stop();
      document.body.style.overflow = "";
      ScrollTrigger.refresh();
    },
  });

  if (reduced) {
    tl.to(intro, { opacity: 0, duration: 0.3 });
  } else {
    tl.to(flash, { opacity: 1, duration: 0.55, ease: "power2.in" })
      .to(intro, { opacity: 0, duration: 0.4, ease: "power1.out" }, "-=0.1")
      .to(flash, { opacity: 0, duration: 0.7, ease: "power2.out" }, "-=0.05");
  }

  if (nav) nav.classList.add("visible");
  playHeroReveal();
}

document.addEventListener("DOMContentLoaded", () => {
  document.body.style.overflow = "hidden";

  // ELTORA brand welcome plays first, then hands off into the existing
  // DUDU & BUBU cinematic intro (runIntroTimeline is called from inside
  // leaveEltoraWelcome once that hand-off completes).
  runEltoraWelcome();
  const enterBtn = document.getElementById("introEnter");
  enterBtn?.addEventListener("click", () => {
    // STEP 1 — audio.play() first, synchronously, as the very first thing
    // that happens inside this click handler. This is a direct user-gesture
    // call: no setTimeout, no GSAP delay, no scroll listener, no
    // intersection observer, no "wait for animation/image/Three.js" — just
    // audio.play() firing on the click itself, so the browser's
    // user-interaction permission for audio is used immediately.
    EltoraMusic.start();

    // STEP 2 — the cinematic hand-off/scroll into the celebration section.
    // Deferred one frame (via requestAnimationFrame) purely so the heavier
    // GSAP/Three.js work below can never contend with the audio engine for
    // the same tick — it does not delay when audio.play() was *called*,
    // only ensures the transition itself doesn't race it.
    requestAnimationFrame(leaveIntro);
  });

  // Advancing the cinematic (tap/click/scroll) still works exactly as
  // before — only the music call has been removed from these gestures.
  const introEl = document.getElementById("intro");
  const onGesture = () => {
    if (!eltoraWelcomeDone) { leaveEltoraWelcome(); return; }
    if (introEl && introEl.style.display !== "none") leaveIntro();
  };
  document.getElementById("eltoraWelcome")?.addEventListener("click", onGesture);
  window.addEventListener("wheel", onGesture, { passive: true });
  window.addEventListener("touchmove", onGesture, { passive: true });
});

/* =========================================================================
   GSAP / ScrollTrigger setup
   ========================================================================= */
gsap.registerPlugin(ScrollTrigger);

function playHeroReveal() {
  gsap.to("#hero .reveal-up", {
    opacity: 1,
    y: 0,
    duration: prefersReducedMotion ? 0.4 : 1,
    stagger: 0.12,
    ease: "power2.out",
    delay: 0.2,
  });
}

// Generic scroll reveals for every other section
function initScrollReveals() {
  document.querySelectorAll(".section:not(.hero) .reveal").forEach((el) => {
    gsap.to(el, {
      opacity: 1,
      duration: prefersReducedMotion ? 0.4 : 1,
      ease: "power2.out",
      scrollTrigger: { trigger: el, start: "top 85%" },
    });
  });
  document.querySelectorAll(".section:not(.hero) .reveal-up").forEach((el) => {
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: prefersReducedMotion ? 0.4 : 1,
      ease: "power2.out",
      scrollTrigger: { trigger: el, start: "top 85%" },
    });
  });
  gsap.utils.toArray(".photo-frame").forEach((el, i) => {
    gsap.fromTo(el, { opacity: 0, y: 20 }, {
      opacity: 1, y: 0, duration: 0.8, ease: "power2.out",
      delay: (i % 3) * 0.08,
      scrollTrigger: { trigger: el, start: "top 92%" },
    });
  });
}
initScrollReveals();

/* =========================================================================
   Shared Three.js scene helper
   Pauses rendering when its canvas is off-screen to protect performance.
   ========================================================================= */
function createScene(canvasId, { fov = 45, z = 10 } = {}) {
  const canvas = document.getElementById(canvasId);
  if (!canvas || typeof THREE === "undefined") return null;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(fov, 1, 0.1, 100);
  camera.position.z = z;

  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    if (rect.width < 1 || rect.height < 1) return;
    renderer.setSize(rect.width, rect.height, false);
    camera.aspect = rect.width / rect.height;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener("resize", resize);

  let visible = false;
  let raf = null;
  let updateFn = null;
  const clock = new THREE.Clock();

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      visible = entry.isIntersecting;
      if (visible) loop();
      else if (raf) { cancelAnimationFrame(raf); raf = null; }
    });
  }, { threshold: 0.05 });
  io.observe(canvas);

  function loop() {
    if (!visible) return;
    const t = clock.getElapsedTime();
    if (updateFn) updateFn(t);
    renderer.render(scene, camera);
    raf = requestAnimationFrame(loop);
  }

  return {
    scene, camera, renderer,
    setUpdate(fn) { updateFn = fn; },
  };
}

function goldMaterial(extra = {}) {
  return new THREE.MeshStandardMaterial({
    color: 0xcfaf6e,
    metalness: 1,
    roughness: 0.28,
    emissive: 0x3a2a0f,
    emissiveIntensity: 0.25,
    ...extra,
  });
}

function addLighting(scene, { warm = true } = {}) {
  const hemi = new THREE.HemisphereLight(0xfff2d8, 0x1a0a10, 0.55);
  scene.add(hemi);
  const key = new THREE.DirectionalLight(0xffe9bd, 1.1);
  key.position.set(4, 5, 6);
  scene.add(key);
  const rim = new THREE.PointLight(warm ? 0xd98a6b : 0x9fd9c4, 0.8, 30);
  rim.position.set(-5, -2, 4);
  scene.add(rim);
  return { hemi, key, rim };
}

function makePetalField(scene, count, colorHex) {
  const geo = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const seeds = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 14;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 8;
    seeds[i * 3] = Math.random() * Math.PI * 2;
    seeds[i * 3 + 1] = 0.2 + Math.random() * 0.5;
    seeds[i * 3 + 2] = 0.3 + Math.random() * 0.7;
  }
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const mat = new THREE.PointsMaterial({
    size: 0.12,
    map: makeGlowTexture(colorHex),
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    opacity: 0.8,
  });
  const points = new THREE.Points(geo, mat);
  scene.add(points);
  return { points, geo, seeds, count };
}

function animatePetalField(field, t, driftSpeed = 0.25) {
  const pos = field.geo.attributes.position;
  for (let i = 0; i < field.count; i++) {
    const sx = field.seeds[i * 3], freq = field.seeds[i * 3 + 1], fall = field.seeds[i * 3 + 2];
    const x = pos.getX(i) + Math.sin(t * freq + sx) * 0.0025;
    let y = pos.getY(i) - fall * 0.008 * driftSpeed;
    if (y < -6) y = 6;
    pos.setX(i, x);
    pos.setY(i, y);
  }
  pos.needsUpdate = true;
  field.points.rotation.y = t * 0.015;
}

/* ---------------------------------------------------------------------
   Hero scene — soft floating gold + rose particles with light parallax
--------------------------------------------------------------------- */
(function heroScene() {
  const s = createScene("heroCanvas", { fov: 50, z: 9 });
  if (!s) return;
  addLighting(s.scene);
  const count = isCoarsePointer ? 90 : 160;
  const gold = makePetalField(s.scene, count, "#e8c98a");
  const rose = makePetalField(s.scene, Math.floor(count * 0.4), "#d9a6a0");

  let mx = 0, my = 0;
  window.addEventListener("mousemove", (e) => {
    mx = (e.clientX / window.innerWidth - 0.5);
    my = (e.clientY / window.innerHeight - 0.5);
  });

  s.setUpdate((t) => {
    if (!prefersReducedMotion) {
      animatePetalField(gold, t, 0.6);
      animatePetalField(rose, t * 0.8, 0.4);
    }
    s.camera.position.x = lerp(s.camera.position.x, mx * 0.8, 0.04);
    s.camera.position.y = lerp(s.camera.position.y, -my * 0.6, 0.04);
    s.camera.lookAt(0, 0, 0);
  });
})();

/* ---------------------------------------------------------------------
   Save-the-date scene — rotating golden ornamental ring frame
--------------------------------------------------------------------- */
(function dateScene() {
  const s = createScene("dateCanvas", { fov: 45, z: 8 });
  if (!s) return;
  addLighting(s.scene, { warm: false });

  const group = new THREE.Group();
  const outer = new THREE.Mesh(new THREE.TorusGeometry(2.4, 0.05, 32, 128), goldMaterial());
  const inner = new THREE.Mesh(new THREE.TorusGeometry(2.05, 0.025, 24, 128), goldMaterial({ emissiveIntensity: 0.4 }));
  inner.rotation.x = Math.PI / 2;
  outer.rotation.x = Math.PI / 2;
  group.add(outer, inner);

  // small decorative studs
  const studGeo = new THREE.SphereGeometry(0.06, 16, 16);
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const stud = new THREE.Mesh(studGeo, goldMaterial({ emissiveIntensity: 0.6 }));
    stud.position.set(Math.cos(a) * 2.4, 0, Math.sin(a) * 2.4);
    group.add(stud);
  }
  s.scene.add(group);

  const dust = makePetalField(s.scene, isCoarsePointer ? 40 : 80, "#f1ddb0");

  const section = document.getElementById("save-the-date");
  let progress = 0;
  if (section && !prefersReducedMotion) {
    ScrollTrigger.create({
      trigger: section,
      start: "top bottom",
      end: "bottom top",
      onUpdate: (self) => { progress = self.progress; },
    });
  }

  s.setUpdate((t) => {
    group.rotation.y = t * 0.25 + progress * Math.PI;
    group.rotation.z = Math.sin(t * 0.2) * 0.08;
    if (!prefersReducedMotion) animatePetalField(dust, t, 0.3);
  });
})();

/* ---------------------------------------------------------------------
   Ring reveal scene — two rings converge on scroll, then glow together
--------------------------------------------------------------------- */
(function ringScene() {
  const s = createScene("ringCanvas", { fov: 42, z: 9 });
  if (!s) return;
  const lights = addLighting(s.scene);

  const ringGeo = new THREE.TorusGeometry(1.1, 0.16, 32, 128);
  const ringA = new THREE.Mesh(ringGeo, goldMaterial());
  const ringB = new THREE.Mesh(ringGeo, goldMaterial());
  ringA.rotation.x = Math.PI / 2.3;
  ringB.rotation.x = Math.PI / 2.3;
  ringA.position.x = -2.6;
  ringB.position.x = 2.6;
  s.scene.add(ringA, ringB);

  // small gem accents
  const gemMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.05, transmission: 0.9, thickness: 0.3, metalness: 0 });
  const gemGeo = new THREE.OctahedronGeometry(0.16, 0);
  const gemA = new THREE.Mesh(gemGeo, gemMat);
  const gemB = new THREE.Mesh(gemGeo, gemMat);
  gemA.position.set(-2.6, 1.05, 0);
  gemB.position.set(2.6, 1.05, 0);
  s.scene.add(gemA, gemB);

  const sparkle = makePetalField(s.scene, isCoarsePointer ? 50 : 100, "#f7e7c1");

  const section = document.getElementById("ring-reveal");
  let progress = 0;
  if (section) {
    ScrollTrigger.create({
      trigger: section,
      start: "top bottom",
      end: "bottom top",
      scrub: true,
      onUpdate: (self) => { progress = self.progress; },
    });
  }

  const finalEls = gsap.utils.toArray("#ringEyebrow, #ringFinal, #ringDate");
  gsap.set(finalEls, { opacity: 0 });
  ScrollTrigger.create({
    trigger: section,
    start: "center center",
    onEnter: () => gsap.to(finalEls, { opacity: 1, duration: 1, stagger: 0.15 }),
    onLeaveBack: () => gsap.to(finalEls, { opacity: 0, duration: 0.4 }),
  });

  s.setUpdate((t) => {
    // progress 0 -> 0.55 : rings travel inward. progress > 0.55: merged, rotate together, glow.
    const travel = clamp(progress / 0.55, 0, 1);
    const merged = clamp((progress - 0.55) / 0.45, 0, 1);

    ringA.position.x = lerp(-2.6, -0.55, travel);
    ringB.position.x = lerp(2.6, 0.55, travel);
    gemA.position.x = ringA.position.x;
    gemB.position.x = ringB.position.x;

    const spin = prefersReducedMotion ? 0 : t * 0.4;
    ringA.rotation.z = spin + travel * 0.6;
    ringB.rotation.z = -spin - travel * 0.6;

    const glow = 0.25 + merged * 0.9;
    ringA.material.emissiveIntensity = glow;
    ringB.material.emissiveIntensity = glow;
    lights.rim.intensity = 0.8 + merged * 1.4;

    if (!prefersReducedMotion) animatePetalField(sparkle, t, 0.25);
  });
})();

/* ---------------------------------------------------------------------
   Finale scene — falling gold particles + two rings resting together
--------------------------------------------------------------------- */
(function finaleScene() {
  const s = createScene("finaleCanvas", { fov: 42, z: 9 });
  if (!s) return;
  addLighting(s.scene);

  const ringGeo = new THREE.TorusGeometry(0.7, 0.09, 32, 96);
  const ringA = new THREE.Mesh(ringGeo, goldMaterial({ emissiveIntensity: 0.55 }));
  const ringB = new THREE.Mesh(ringGeo, goldMaterial({ emissiveIntensity: 0.55 }));
  ringA.rotation.x = Math.PI / 2.3;
  ringB.rotation.x = Math.PI / 2.3;
  ringA.position.set(-0.35, 1.8, 0);
  ringB.position.set(0.35, 1.8, 0);
  s.scene.add(ringA, ringB);

  const count = isCoarsePointer ? 90 : 180;
  const geo = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const speeds = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 12;
    positions[i * 3 + 1] = Math.random() * 12 - 4;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 6;
    speeds[i] = 0.2 + Math.random() * 0.5;
  }
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const mat = new THREE.PointsMaterial({
    size: 0.1,
    map: makeGlowTexture("#f1ddb0"),
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    opacity: 0.75,
  });
  const points = new THREE.Points(geo, mat);
  s.scene.add(points);

  s.setUpdate((t) => {
    ringA.rotation.z = t * 0.3;
    ringB.rotation.z = -t * 0.3;

    if (!prefersReducedMotion) {
      const pos = geo.attributes.position;
      for (let i = 0; i < count; i++) {
        let y = pos.getY(i) - speeds[i] * 0.012;
        if (y < -7) y = 7;
        pos.setY(i, y);
      }
      pos.needsUpdate = true;
    }
  });
})();

/* =========================================================================
   Safety net — recalculate ScrollTrigger positions after full load
   (fonts / layout can shift section heights on first paint)
   ========================================================================= */
window.addEventListener("load", () => {
  ScrollTrigger.refresh();
});

