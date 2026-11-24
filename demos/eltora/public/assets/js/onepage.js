// ELTORA single scrolling page: Services cards jump to the Contact form with the matching project type selected.
document.addEventListener('DOMContentLoaded', () => {
  const MAP = { 'Web Development': 'Website Development', 'AI Solutions': 'AI Solutions', 'Automation': 'Business Automation',
    'Data & Analytics': 'Data Analytics', 'Custom Software': 'Custom Software', 'Mobile Apps': 'Mobile Application',
    'E-Commerce': 'E-Commerce Website', 'UI/UX & Branding': 'UI/UX & Branding', '3D Invitations': 'Other', 'Maintenance': 'Other' };
  const sel = document.getElementById('cf-type');
  document.querySelectorAll('a[data-service]').forEach(a => a.addEventListener('click', () => {
    const v = MAP[a.dataset.service] || a.dataset.service;
    if (sel && [...sel.options].some(o => o.value === v)) { sel.value = v; sel.dispatchEvent(new Event('change')); }
  }));
});

// Page dots: 01 Home … 05 Contact, highlight the page in view, click to jump.
document.addEventListener('DOMContentLoaded', () => {
  const pages = [['home', 'Home'], ['services', 'Services'], ['work', 'Work'], ['about', 'About'], ['contact', 'Contact']]
    .map(([id, name]) => [document.getElementById(id), name]).filter(([el]) => el);
  if (pages.length < 2) return;
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const nav = document.createElement('nav'); nav.className = 'op-dots'; nav.setAttribute('aria-label', 'Pages');
  const links = pages.map(([el, name], i) => {
    const a = document.createElement('a'); a.href = '#' + el.id; a.setAttribute('aria-label', `Page ${i + 1}: ${name}`);
    a.innerHTML = `${String(i + 1).padStart(2, '0')}<span>${name}</span>`;
    a.addEventListener('click', e => { e.preventDefault(); el.scrollIntoView({ behavior: calm ? 'auto' : 'smooth', block: 'start' }); try { history.replaceState(null, '', '#' + el.id); } catch (_) {} });
    nav.appendChild(a); return a;
  });
  document.body.appendChild(nav);
  let cur = -1, t;
  const set = i => { if (i === cur) return; cur = i; links.forEach((a, k) => { a.classList.toggle('on', k === i); a.toggleAttribute('aria-current', k === i); });
    const a = links[i]; a.classList.add('flash'); clearTimeout(t); t = setTimeout(() => a.classList.remove('flash'), 1400); };
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) set(pages.findIndex(([el]) => el === e.target)); }), { rootMargin: '-45% 0px -50% 0px' });
  pages.forEach(([el]) => io.observe(el));
});
