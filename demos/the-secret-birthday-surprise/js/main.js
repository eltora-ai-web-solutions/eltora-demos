/* =========================================================
   EDIT ME — personalise the surprise
   ========================================================= */
const CONFIG = {
  name: "My Love",
  date: "MARCH 15 · 2027",
};

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-name]').forEach(el => el.textContent = CONFIG.name);
  document.querySelectorAll('[data-date]').forEach(el => el.textContent = CONFIG.date);

  /* ---------------- Nav ---------------- */
  const nav = document.querySelector('.site-nav');
  const navLinks = document.querySelector('.nav-links');
  const navToggle = document.querySelector('.nav-toggle');

  window.addEventListener('scroll', () => {
    nav.classList.toggle('is-scrolled', window.scrollY > 40);
  }, { passive:true });

  navToggle.addEventListener('click', () => {
    const open = navLinks.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    navToggle.textContent = open ? '✕' : '☰';
  });
  navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    navLinks.classList.remove('is-open');
    navToggle.textContent = '☰';
  }));

  /* ---------------- Three.js scenes (background layer only) ---------------- */
  if (window.THREE) {
    const secretCanvas = document.getElementById('secret-canvas');
    if (secretCanvas) initSecretScene(secretCanvas);

    const heartCanvas = document.getElementById('heart-canvas');
    if (heartCanvas) initForeverHeart(heartCanvas);
  }

  /* =========================================================
     Reliable one-shot scroll reveals.
     Uses IntersectionObserver instead of scroll-position math,
     so a programmatic scrollIntoView() can never leave content
     stuck at opacity:0 — every element is force-revealed the
     moment it enters the viewport, no matter how it got there.
     ========================================================= */
  function setupReveal(selector, { fromVars = {}, toVars = {}, stagger = 0 } = {}) {
    const els = gsap.utils.toArray(selector);
    if (!els.length) return { play(){} };

    gsap.set(els, Object.assign({ opacity: 0, y: 40, filter: 'blur(6px)' }, fromVars));

    let played = false;
    function play() {
      if (played) return;
      played = true;
      gsap.to(els, Object.assign({
        opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.1, ease: 'power2.out', stagger
      }, toVars));
    }

    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => { if (entry.isIntersecting) play(); });
    }, { threshold: 0.12 });
    els.forEach(el => io.observe(el));

    return { play };
  }

  const revealBirthday = setupReveal('.reveal-photo, .reveal-copy', { stagger: 0.15 });
  const revealCake      = setupReveal('.cake', { fromVars: { scale: .85, y: 20 }, toVars: { scale: 1 } });
  const revealStoryHead = setupReveal('.story-head');
  const revealPolaroids = setupReveal('.polaroid', { stagger: 0.06 });
  const revealForeverTop = setupReveal('#forever .eyebrow, #forever .heart-stage, #forever .heart-hint', { stagger: 0.1 });

  /* Failsafe: guarantee nothing is ever left permanently invisible,
     even if a browser never fires an IntersectionObserver callback
     (e.g. a tab restored mid-scroll). Force everything visible after
     a short delay regardless. */
  setTimeout(() => {
    revealBirthday.play();
    revealCake.play();
    revealStoryHead.play();
    revealPolaroids.play();
    revealForeverTop.play();
  }, 6000);

  /* ---------------- Envelope + music trigger ---------------- */
  const openBtn = document.getElementById('open-surprise');
  const envelope = document.getElementById('envelope');
  const audio = document.getElementById('bgm');
  const audioNote = document.querySelector('.audio-note');
  const secretLayout = document.querySelector('.secret-layout');
  let opened = false;

  openBtn.addEventListener('click', () => {
    if (opened) return;
    opened = true;
    openBtn.disabled = true;
    openBtn.textContent = 'OPENING…';

    // Music starts directly inside this click handler — no delay, no second click.
    audio.volume = 0.55;
    audio.play().catch(() => { /* user gesture already given; should succeed */ });
    if (audioNote) {
      audioNote.classList.add('is-visible');
      setTimeout(() => audioNote.classList.remove('is-visible'), 3600);
    }

    envelope.classList.add('is-open');

    // Envelope opens (CSS transition, ~1.1s) while the secret text fades.
    // The moment that finishes, we scroll AND force the reveal-section
    // content visible in the same step — so it can never land empty.
    gsap.to(secretLayout, {
      opacity: 0, y: -30, duration: .8, delay: 1.0, ease: 'power2.out',
      onComplete() {
        document.getElementById('reveal').scrollIntoView({ behavior: 'smooth', block: 'start' });
        revealBirthday.play();
        revealCake.play();
      }
    });
  });

  /* ---------------- Heart tap → golden blast + confetti + couple photo reveal ---------------- */
  const heartStage   = document.querySelector('.heart-stage');
  const heartBlast   = document.querySelector('.heart-blast');
  const heartHint    = document.getElementById('heart-hint');
  const heartReveal  = document.getElementById('heart-reveal');
  const foreverFinal = document.getElementById('forever-final');
  const confettiCanvas = document.getElementById('confetti-canvas');
  let heartRevealed = false;

  /* Quick cinematic golden bloom flash from the heart, on click. */
  function triggerHeartFlash() {
    if (!heartBlast) return;
    heartBlast.classList.remove('is-blasting');
    // Force reflow so the animation can restart reliably.
    void heartBlast.offsetWidth;
    heartBlast.classList.add('is-blasting');
  }

  /* Lightweight canvas 2D confetti burst — champagne/gold paper pieces
     that fly out from the heart and fall with gravity, then clear
     themselves. Self-contained, no external libraries, no layout impact
     (canvas is position:fixed and pointer-events:none). */
  function triggerGoldConfetti(originEl) {
    if (!confettiCanvas || !originEl || typeof window === 'undefined') return;
    const ctx = confettiCanvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    function sizeCanvas() {
      confettiCanvas.width  = window.innerWidth * dpr;
      confettiCanvas.height = window.innerHeight * dpr;
      confettiCanvas.style.width  = window.innerWidth + 'px';
      confettiCanvas.style.height = window.innerHeight + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    sizeCanvas();

    const rect = originEl.getBoundingClientRect();
    const originX = rect.left + rect.width / 2;
    const originY = rect.top + rect.height / 2;

    // Fewer pieces on small/mobile screens to stay performance-friendly.
    const isCompact = window.innerWidth < 700;
    const pieceCount = isCompact ? 55 : 100;
    const goldTones = ['#f0cf8a', '#caa15a', '#fff3c4', '#e3c078', '#f6e6bd'];

    const pieces = [];
    for (let i = 0; i < pieceCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2.6 + Math.random() * 6.4;
      pieces.push({
        x: originX, y: originY,
        vx: Math.cos(angle) * speed * (0.45 + Math.random() * 0.65),
        vy: Math.sin(angle) * speed * (0.45 + Math.random() * 0.65) - 2.6,
        w: 5 + Math.random() * 6,
        h: 8 + Math.random() * 9,
        rot: Math.random() * Math.PI * 2,
        vrot: (Math.random() - 0.5) * 0.22,
        color: goldTones[(Math.random() * goldTones.length) | 0],
        gravity: 0.1 + Math.random() * 0.06,
        drag: 0.982 + Math.random() * 0.012,
        life: 1,
        decay: 0.0035 + Math.random() * 0.0018
      });
    }

    const startTime = performance.now();
    let rafId;

    function frame(now) {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      let anyAlive = false;

      for (let i = 0; i < pieces.length; i++) {
        const p = pieces[i];
        if (p.life <= 0) continue;

        p.vx *= p.drag;
        p.vy = p.vy * p.drag + p.gravity;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vrot;
        p.life -= p.decay;

        if (p.y > window.innerHeight + 40 || p.life <= 0) { p.life = 0; continue; }
        anyAlive = true;

        ctx.save();
        ctx.globalAlpha = Math.max(p.life, 0);
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.shadowColor = 'rgba(240,207,138,0.5)';
        ctx.shadowBlur = 5;
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }

      if (anyAlive && now - startTime < 6500) {
        rafId = requestAnimationFrame(frame);
      } else {
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        window.removeEventListener('resize', sizeCanvas);
      }
    }

    window.addEventListener('resize', sizeCanvas, { passive: true });
    rafId = requestAnimationFrame(frame);
  }

  function revealHeartMoment() {
    if (heartRevealed) return;
    heartRevealed = true;

    // Blast + confetti fire immediately, at the moment of the click.
    triggerHeartFlash();
    triggerGoldConfetti(heartStage);

    if (heartStage) heartStage.classList.add('is-tapped');
    if (heartHint) heartHint.classList.add('is-hidden');
    if (heartReveal) heartReveal.classList.add('is-visible');
    // Give the photo a beat, then bring in the closing message.
    setTimeout(() => {
      if (foreverFinal) foreverFinal.classList.add('is-visible');
    }, 450);
  }
  if (heartStage) {
    heartStage.addEventListener('pointerdown', revealHeartMoment);
    heartStage.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); revealHeartMoment(); }
    });
  }
});
