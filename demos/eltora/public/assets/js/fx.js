// ELTORA – shared scroll experience for every page:
// progress bar, reveal-on-scroll, headline word reveal, parallax, count-up stats,
// cursor spotlight, magnetic buttons and back-to-top. Respects "reduce motion".
(() => {
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  document.documentElement.classList.add('fx-ready');

  document.addEventListener('DOMContentLoaded', () => {
    // ---------- progress bar + back to top ----------
    const bar = Object.assign(document.createElement('div'), { className: 'fx-bar' });
    bar.setAttribute('aria-hidden', 'true');
    const top = document.createElement('button');
    top.className = 'fx-top'; top.type = 'button'; top.setAttribute('aria-label', 'Back to top');
    top.innerHTML = '<svg class="ring" viewBox="0 0 52 52" aria-hidden="true"><circle class="bg" cx="26" cy="26" r="24"/><circle class="fg" cx="26" cy="26" r="24"/></svg><span class="arrow"><svg class="ic" aria-hidden="true"><use href="#i-arrow-up-right" transform="rotate(-45 12 12)"/></svg></span>';
    top.addEventListener('click', () => scrollTo({ top: 0, behavior: calm ? 'auto' : 'smooth' }));
    document.body.append(bar, top);

    // ---------- reveal on scroll ----------
    // Elements are tagged here (one list for all pages) so the HTML stays clean.
    const groups = [
      // [selector, effect, stagger(ms)]
      ['.hm-sec-head > *, .pf-copy > *, .sv-copy > *, .ct2-hero-in > *:not(h1)', 'up', 90],
      ['.s10c, .pf-card, .ab2-mvv, .ab2-tech, .hm-svc', 'up', 70],
      ['.stats, .pf-stats, .ab2-stats, .sv-art, .pf-art, .s-cta, .pf-cta, .ct2-steps, .hm-video-frame, .hm-cta-in > *', 'zoom', 120],
      ['.ct2-cards', 'left', 0], ['.ct2-form', 'up', 0], ['.ct2-office', 'right', 0],
      ['.pf-chips, .ft2-top > *', 'up', 80],
    ];
    const tagged = new Set();
    groups.forEach(([sel, fx, step]) => {
      const byParent = new Map();
      $$(sel).forEach(el => {
        if (tagged.has(el) || el.classList.contains('rv') || el.closest('[data-fx]')) return;
        tagged.add(el); el.dataset.fx = el.dataset.fx || fx;
        const k = el.parentElement, n = byParent.get(k) || 0; byParent.set(k, n + 1);
        el.style.setProperty('--fx-d', Math.min(n, 8) * step);
      });
    });
    // big headlines: word-by-word rise
    $$('main h1, main h2').forEach(h => {
      if (h.closest('form') || h.closest('.pf-card') || h.dataset.noWords !== undefined) return;
      let i = 0;
      const walk = node => [...node.childNodes].forEach(n => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(part => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.append(part); return; }
            const w = document.createElement('span'); w.className = 'fx-w';
            const s = document.createElement('span'); s.textContent = part; w.style.setProperty('--i', i++);
            w.append(s); frag.append(w);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && n.tagName !== 'BR' && n.tagName !== 'svg' && !n.classList.contains('ln')) {
          if (n.tagName === 'EM' || n.tagName === 'SPAN') {           // keep styled words whole
            const w = document.createElement('span'); w.className = 'fx-w'; w.style.setProperty('--i', i++);
            n.replaceWith(w); const s = document.createElement('span'); s.append(n); w.append(s);
          } else walk(n);
        }
      });
      walk(h); h.classList.add('fx-words');
    });

    const reveal = el => {
      el.classList.add('fx-in');
      if (el.dataset.fx) { // after the entrance, give the element its own hover transforms back
        const d = (parseFloat(getComputedStyle(el).getPropertyValue('--fx-d')) || 0) + 1000;
        setTimeout(() => {
          el.removeAttribute('data-fx'); el.style.removeProperty('--fx-d');
          if (!el.classList.contains('fx-words')) el.classList.remove('fx-in');   // word-split headings keep their revealed state
        }, d);
      }
    };
    const targets = $$('[data-fx], .fx-words');
    if (calm || !('IntersectionObserver' in window)) targets.forEach(reveal);
    else {
      const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { reveal(e.target); io.unobserve(e.target); } }), { rootMargin: '0px 0px -10% 0px', threshold: 0.08 });
      targets.forEach(t => io.observe(t));
    }

    // ---------- count-up numbers ----------
    const counters = $$('.stats b, .pf-stats b, .ab2-stats b').filter(b => /^\d+\+?$/.test(b.textContent.trim()));
    const count = b => {
      const raw = b.textContent.trim(), end = parseInt(raw, 10), plus = raw.endsWith('+') ? '+' : '';
      if (calm || end < 2) return;
      const t0 = performance.now(), dur = 1400;
      const tick = t => { const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3); b.textContent = Math.round(end * e) + plus; if (k < 1) requestAnimationFrame(tick); };
      b.textContent = '0' + plus; requestAnimationFrame(tick);
    };
    if ('IntersectionObserver' in window) {
      const io2 = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { count(e.target); io2.unobserve(e.target); } }), { threshold: 0.6 });
      counters.forEach(c => io2.observe(c));
    }

    // ---------- parallax (hero art drifts slower than the page) ----------
    const para = [
      ['.hero-art', -0.12], ['.sv-art', -0.14], ['.pf-art', -0.12], ['.ab2-hq', 0.10], ['.ct2-art', 0.10],
      ['.pf-rk.tl, .pf-rk.tr', 0.2], ['.mtn', 0.08], ['.hm-story-num', -0.25],
    ];
    const pEls = [];
    para.forEach(([s, f]) => $$(s).forEach(el => { el.dataset.parallax = f; pEls.push([el, f]); }));

    // ---------- one scroll loop ----------
    let ticking = false;
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - innerHeight, p = max > 0 ? Math.min(1, scrollY / max) : 0;
      bar.style.setProperty('--p', p.toFixed(4)); top.style.setProperty('--p', p.toFixed(4));
      top.classList.toggle('show', scrollY > innerHeight * 0.8);
      if (!calm) pEls.forEach(([el, f]) => {
        const r = el.getBoundingClientRect(); if (r.bottom < -200 || r.top > innerHeight + 200) return;
        const c = r.top + r.height / 2 - innerHeight / 2;
        el.style.translate = `0 ${(c * f).toFixed(1)}px`;
      });
      ticking = false;
    };
    addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
    addEventListener('resize', onScroll); onScroll();

    // ---------- cursor spotlight + magnetic buttons (mouse only) ----------
    if (fine && !calm) {
      const glow = Object.assign(document.createElement('div'), { className: 'fx-glow' });
      glow.setAttribute('aria-hidden', 'true'); document.body.append(glow);
      let gx = innerWidth / 2, gy = innerHeight / 2, tx = gx, ty = gy, raf = 0;
      const loop = () => { gx += (tx - gx) * 0.14; gy += (ty - gy) * 0.14; glow.style.transform = `translate(${gx}px,${gy}px)`; raf = Math.abs(tx - gx) + Math.abs(ty - gy) > 0.5 ? requestAnimationFrame(loop) : 0; };
      addEventListener('pointermove', e => { tx = e.clientX; ty = e.clientY; glow.classList.add('on'); if (!raf) raf = requestAnimationFrame(loop); }, { passive: true });
      document.addEventListener('pointerleave', () => glow.classList.remove('on'));

      $$('.btn.lime, .hd-cta, .pf-start, .ab2-btn.lime, .ct2-submit, .hm-cta-btn, .ft2-cta a').forEach(b => {
        b.dataset.magnetic = '';
        b.addEventListener('pointermove', e => { const r = b.getBoundingClientRect(); b.style.translate = `${((e.clientX - r.left) / r.width - .5) * 14}px ${((e.clientY - r.top) / r.height - .5) * 10}px`; });
        b.addEventListener('pointerleave', () => { b.style.translate = ''; });
      });
    }
  });
})();
