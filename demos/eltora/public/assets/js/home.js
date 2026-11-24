// ELTORA – Home page: pinned scroll story, scroll-driven horizontal work gallery, video teaser.
document.addEventListener('DOMContentLoaded', () => {
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const wide = () => innerWidth > 900;
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));

  // ---------- scroll story ----------
  const story = document.getElementById('what-we-do');
  const chs = story ? [...story.querySelectorAll('.hm-ch')] : [];
  const vis = story ? [...story.querySelectorAll('.hm-vis')] : [];
  const num = story && story.querySelector('.hm-story-num');
  const rail = story && story.querySelector('.hm-rail');
  let cur = -1;
  const setChapter = i => {
    if (i === cur) return; cur = i;
    chs.forEach((c, k) => c.classList.toggle('on', k === i));
    vis.forEach((v, k) => v.classList.toggle('on', k === i));
    if (num) num.textContent = String(i + 1).padStart(2, '0');
  };
  chs.forEach((c, k) => c.addEventListener('click', () => {           // click a chapter to jump to it
    if (!wide()) return;
    const top = story.offsetTop + (story.offsetHeight - innerHeight) * ((k + .5) / chs.length);
    scrollTo({ top, behavior: calm ? 'auto' : 'smooth' });
  }));

  // ---------- horizontal gallery ----------
  const work = document.getElementById('selected-work');
  const track = document.getElementById('hm-track');
  const prog = document.getElementById('hm-progress'), counter = document.getElementById('hm-count');
  const cards = track ? [...track.children] : [];
  let dist = 0;
  const sizeWork = () => {
    if (!work) return;
    if (!wide()) { work.style.height = ''; track.style.transform = ''; return; }
    dist = Math.max(0, track.scrollWidth - innerWidth);
    work.style.height = (innerHeight + dist) + 'px';                   // scroll length = sideways distance
  };

  let ticking = false;
  const update = () => {
    ticking = false;
    if (story && wide()) {
      const r = story.getBoundingClientRect(), p = clamp(-r.top / (story.offsetHeight - innerHeight));
      setChapter(Math.min(chs.length - 1, Math.floor(p * chs.length)));
      if (rail) rail.style.setProperty('--sp', p.toFixed(3));
    }
    if (work && wide() && dist > 0) {
      const r = work.getBoundingClientRect(), p = clamp(-r.top / (work.offsetHeight - innerHeight));
      track.style.transform = `translate3d(${(-p * dist).toFixed(1)}px,0,0)`;
      prog.parentElement.style.setProperty('--wp', p.toFixed(3));
      counter.textContent = String(Math.min(cards.length, Math.floor(p * (cards.length - 0.001)) + 1)).padStart(2, '0');
    }
  };
  const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', () => { sizeWork(); update(); });
  addEventListener('load', () => { sizeWork(); update(); });
  sizeWork(); update();
  // keyboard users tabbing into an off-screen gallery card: scroll page so the card comes into view
  cards.forEach((c, k) => c.addEventListener('focus', () => {
    if (!wide() || !dist) return;
    const p = clamp((c.offsetLeft - innerWidth * 0.3) / dist);
    scrollTo({ top: work.offsetTop + p * (work.offsetHeight - innerHeight), behavior: 'auto' });
  }));

  // ---------- video teaser ----------
  const frame = document.getElementById('hm-video'), video = document.getElementById('hm-video-el'), play = document.getElementById('hm-play');
  if (video && play) {
    play.addEventListener('click', () => { video.controls = true; const p = video.play(); if (p && p.catch) p.catch(() => frame.classList.remove('playing')); });
    video.addEventListener('play', () => frame.classList.add('playing'));
    video.addEventListener('ended', () => { frame.classList.remove('playing'); video.controls = false; video.load(); });
    // pause if the visitor scrolls away
    if ('IntersectionObserver' in window) new IntersectionObserver(es => { if (!es[0].isIntersecting && !video.paused) video.pause(); }, { threshold: 0.2 }).observe(frame);
  }
});
