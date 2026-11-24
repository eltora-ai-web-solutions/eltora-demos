// Homepage hero video: autoplays muted; "Tap for sound" plays the AI voice + music from the start.
// Pauses when off-screen, respects "reduce motion" (poster only until the visitor asks for sound).
document.addEventListener('DOMContentLoaded', () => {
  const v = document.getElementById('hb-video'), btn = document.getElementById('hb-sound');
  if (!v) return;
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let wanted = !calm;                                   // should the video be playing when visible?
  const play = () => { const p = v.play(); if (p && p.catch) p.catch(() => {}); };
  if (calm) { v.removeAttribute('autoplay'); v.pause(); }
  if ('IntersectionObserver' in window)
    new IntersectionObserver(es => { if (es[0].isIntersecting) { if (wanted) play(); } else v.pause(); }, { threshold: 0.05 }).observe(v);
  document.addEventListener('visibilitychange', () => { if (!document.hidden && wanted) play(); });
  if (btn) btn.addEventListener('click', () => {
    const on = btn.getAttribute('aria-pressed') !== 'true';
    btn.setAttribute('aria-pressed', on);
    btn.querySelector('b').textContent = on ? 'Sound on' : 'Tap for sound';
    btn.setAttribute('aria-label', on ? 'Mute the ELTORA video' : 'Turn on sound to hear the ELTORA AI assistant');
    v.muted = !on;
    if (on) { v.currentTime = 0; wanted = true; play(); }  // start the voiceover from the beginning
  });
});
