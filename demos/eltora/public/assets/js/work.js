// ELTORA – Our Work page: category filter with smooth transitions (loaded only by work.html)
document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('pf-grid');
  if (!grid) return;
  const chips = [...document.querySelectorAll('.pf-chip')];
  const cards = [...grid.querySelectorAll('.pf-card')];
  const empty = document.getElementById('pf-empty');
  const calm = matchMedia('(prefers-reduced-motion:reduce)').matches;
  let timer;

  const apply = f => {
    const show = c => f === 'all' || c.dataset.tags.split(' ').includes(f);
    clearTimeout(timer);
    // fade out the visible cards that are leaving
    cards.forEach(c => { if (!c.hidden && !show(c)) c.classList.add('is-out'); });
    timer = setTimeout(() => {
      let n = 0;
      cards.forEach(c => {
        c.classList.remove('is-out', 'is-in');
        const ok = show(c);
        c.hidden = !ok;
        if (ok) {
          n++;
          if (!calm) { void c.offsetWidth; c.style.animationDelay = (n - 1) * 45 + 'ms'; c.classList.add('is-in'); }
        }
      });
      if (empty) empty.hidden = n > 0;
    }, calm ? 0 : 220);
  };

  chips.forEach(ch => ch.addEventListener('click', () => {
    if (ch.classList.contains('on')) return;
    chips.forEach(x => { x.classList.toggle('on', x === ch); x.setAttribute('aria-pressed', x === ch); });
    apply(ch.dataset.f);
  }));
});
