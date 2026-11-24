// ELTORA – About page: scroll reveal + brand story video player (loaded only by about.html)
document.documentElement.classList.add('js');
document.addEventListener('DOMContentLoaded', () => {
  const calm = matchMedia('(prefers-reduced-motion:reduce)').matches;

  // scroll reveal
  const items = document.querySelectorAll('.rv');
  if (!('IntersectionObserver' in window) || calm) items.forEach(el => el.classList.add('in'));
  else {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
    items.forEach(el => io.observe(el));
  }

  // video player
  const wrap = document.getElementById('ab2-video'), video = document.getElementById('story-video'),
        play = document.getElementById('story-play'), watch = document.getElementById('watch-story');
  if (!video) return;
  const start = () => {
    video.controls = true;                 // native controls include fullscreen, volume and seeking
    const p = video.play();
    if (p && p.catch) p.catch(() => { wrap.classList.remove('playing'); });
  };
  play.addEventListener('click', start);
  video.addEventListener('play', () => wrap.classList.add('playing'));
  video.addEventListener('ended', () => { wrap.classList.remove('playing'); video.controls = false; video.load(); });
  if (watch) watch.addEventListener('click', e => {
    e.preventDefault();
    document.getElementById('story').scrollIntoView({ behavior: calm ? 'auto' : 'smooth', block: 'center' });
    setTimeout(start, calm ? 0 : 550);
  });
});
