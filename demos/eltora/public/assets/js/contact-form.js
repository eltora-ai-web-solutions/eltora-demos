// ELTORA – Contact page: project enquiry form → POST /api/contact (loaded only by contact.html)
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contact-form');
  if (!form) return;
  const btn = form.querySelector('.ct2-submit'), lbl = btn.querySelector('.ct2-lbl'), status = document.getElementById('cf-status');
  const MSG_OK = 'Thank you! Your enquiry has been submitted successfully. Our team will contact you soon.';
  const MSG_FAIL = 'Sorry, we couldn’t submit your enquiry. Please try again or contact us directly.';
  const F = { name: 'cf-name', email: 'cf-email', phone: 'cf-phone', projectType: 'cf-type', message: 'cf-msg' };
  const EMAIL_RE = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[A-Za-z]{2,}$/;
  let busy = false;

  // Pre-select project type from Services page links (/contact?service=...)
  const MAP = { 'Web Development': 'Website Development', 'AI Solutions': 'AI Solutions', 'Automation': 'Business Automation',
    'Data & Analytics': 'Data Analytics', 'Custom Software': 'Custom Software', 'Mobile Apps': 'Mobile Application',
    'E-Commerce': 'E-Commerce Website', 'UI/UX & Branding': 'UI/UX & Branding', '3D Invitations': 'Other', 'Maintenance': 'Other' };
  try {
    const sv = new URLSearchParams(location.search).get('service'), sel = document.getElementById(F.projectType);
    const v = sv && (MAP[sv] || sv);
    if (v && [...sel.options].some(o => o.value === v)) sel.value = v;
  } catch (_) {}

  const fieldOf = k => document.getElementById(F[k]);
  const setErr = (k, msg) => {
    const el = fieldOf(k), box = el.closest('.ct2-f'), p = document.getElementById(F[k] + '-err');
    box.classList.toggle('bad', !!msg); el.setAttribute('aria-invalid', msg ? 'true' : 'false'); p.textContent = msg || '';
  };
  const check = () => {
    const v = k => fieldOf(k).value.trim(), e = {};
    if (v('name').length < 2) e.name = 'Please enter your name.';
    if (!EMAIL_RE.test(v('email'))) e.email = v('email') ? 'Please enter a valid email address.' : 'Please enter your email.';
    if (v('phone') && !/^[0-9+()\-.\s]{7,20}$/.test(v('phone'))) e.phone = 'Please enter a valid phone number (or leave it empty).';
    if (!v('projectType')) e.projectType = 'Please select a project type.';
    if (v('message').length < 10) e.message = v('message') ? 'Please add a little more detail (at least 10 characters).' : 'Please enter your message.';
    return e;
  };
  Object.keys(F).forEach(k => fieldOf(k).addEventListener('input', () => { if (fieldOf(k).getAttribute('aria-invalid') === 'true') setErr(k, check()[k]); }));
  fieldOf('projectType').addEventListener('change', () => setErr('projectType', check().projectType));

  const show = (ok, text) => { status.hidden = false; status.className = 'ct2-status ' + (ok ? 'ok' : 'err'); status.textContent = text; status.focus({ preventScroll: true }); status.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); };

  // Live-preview only: the preview has no email server, so send the enquiry through the
  // owner's connected Gmail. On the real website /api/contact (Resend) handles delivery.
  async function previewSend(d) {
    if (!(window.claude && typeof window.claude.use === 'function')) return 'none';
    let mcp = null; try { mcp = await window.claude.use('mcp'); } catch (_) {}
    if (!mcp) return 'none';
    const body = ['NEW PROJECT ENQUIRY', '', `Name: ${d.name}`, '', `Email: ${d.email}`, '', `Phone: ${d.phone || 'Not provided'}`, '',
      `Project Type: ${d.projectType}`, '', 'Message:', d.message, '', 'Received Through:', 'ELTORA Official Website (live preview)'].join('\n');
    try {
      await mcp.callTool('Gmail', 'send_message', { to: ['eltora2026@gmail.com'], subject: `New ELTORA Website Project Enquiry – ${d.projectType}`, body });
      return 'ok';
    } catch (e) { return (e && e.code) || 'error'; }
  }

  // When sending fails: one-tap alternatives with the enquiry already written (works everywhere).
  function fallback(d, code) {
    const text = ['Hi ELTORA, I have a project enquiry.', '', `Name: ${d.name}`, `Email: ${d.email}`, `Phone: ${d.phone || 'Not provided'}`, `Project Type: ${d.projectType}`, '', d.message].join('\n');
    const row = document.createElement('div'); row.className = 'ct2-fallback';
    const mk = (label, href, cls) => { const a = document.createElement('a'); a.href = href; a.target = '_blank'; a.rel = 'noopener noreferrer'; a.className = cls; a.textContent = label; row.appendChild(a); };
    mk('Send via WhatsApp', 'https://wa.me/919843983376?text=' + encodeURIComponent(text), 'fb-wa');
    mk('Send via Gmail', 'https://mail.google.com/mail/?view=cm&fs=1&to=eltora2026%40gmail.com&su=' + encodeURIComponent('New ELTORA Website Project Enquiry – ' + d.projectType) + '&body=' + encodeURIComponent(text), 'fb-gm');
    if (code && code !== 'none') { const c = document.createElement('small'); c.className = 'fb-code'; c.textContent = 'code: ' + code; row.appendChild(c); }
    status.appendChild(row);
  }

  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (busy) return;                                   // no duplicate submissions
    const errs = check();
    Object.keys(F).forEach(k => setErr(k, errs[k]));
    const first = Object.keys(F).find(k => errs[k]);
    if (first) { fieldOf(first).focus(); return; }

    busy = true; btn.disabled = true; btn.setAttribute('aria-busy', 'true'); lbl.textContent = 'Sending…'; status.hidden = true;
    const ctl = new AbortController(), to = setTimeout(() => ctl.abort(), 20000);
    try {
    const data = Object.fromEntries(new FormData(form));
    const done = () => { form.reset(); Object.keys(F).forEach(k => setErr(k, '')); show(true, MSG_OK); };
    let noBackend = false;
    try {
      const r = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data), signal: ctl.signal });
      const j = await r.json().catch(() => null);
      if (r.ok && j && j.ok) done();                      // only after the email provider accepted the message
      else if (r.status === 400 && j && j.errors) {       // server-side validation: point at the fields, keep input
        Object.keys(F).forEach(k => setErr(k, j.errors[k]));
        const f = Object.keys(F).find(k => j.errors[k]); if (f) fieldOf(f).focus();
        show(false, MSG_FAIL);
      } else if (!j || typeof j.ok !== 'boolean') noBackend = true;   // not our API (e.g. the preview host answered)
      else { show(false, r.status === 429 && j.error ? j.error : MSG_FAIL); fallback(data, 'http_' + r.status); }   // form is NOT cleared on failure
    } catch (_) { noBackend = true; }
    if (noBackend) {
      const res = await previewSend(data);
      if (res === 'ok') done();
      else if (res === 'approval_required' || res === 'not_in_manifest') { show(false, 'Please allow Gmail when claude.ai asks, then press Send Message again — or send it directly below.'); fallback(data, res); }
      else if (res === 'upstream_error') { show(false, 'Gmail permission was not confirmed. Press Send Message again and click Allow when claude.ai asks — or send it directly below.'); fallback(data, res); }
      else if (res === 'needs_reauth' || res === 'server_not_connected') { show(false, 'Gmail is not connected for this preview. Send it directly below instead.'); fallback(data, res); }
      else { show(false, MSG_FAIL); fallback(data, res); }
    }
    } finally {
      clearTimeout(to); busy = false; btn.disabled = false; btn.removeAttribute('aria-busy'); lbl.textContent = 'Send Message';
    }
  });
});

// Email links: copy the address and offer Gmail (mail-app links are blocked in some browsers and in the preview).
document.addEventListener('click', e => {
  const a = e.target.closest && e.target.closest('a[href^="mailto:"]'); if (!a) return;
  const addr = a.getAttribute('href').slice(7).split('?')[0];
  try { if (navigator.clipboard) navigator.clipboard.writeText(addr).catch(() => {}); } catch (_) {}
  let t = document.getElementById('mail-toast');
  if (!t) {
    t = document.createElement('div'); t.id = 'mail-toast'; t.className = 'mail-toast'; t.setAttribute('role', 'status'); t.setAttribute('aria-live', 'polite');
    t.innerHTML = '<span class="mt-msg"></span><a class="mt-gmail" target="_blank" rel="noopener noreferrer">Open in Gmail ↗</a><button type="button" class="mt-x" aria-label="Close">×</button>';
    document.body.appendChild(t); t.querySelector('.mt-x').addEventListener('click', () => t.classList.remove('show'));
  }
  t.querySelector('.mt-msg').textContent = 'Email copied: ' + addr;
  t.querySelector('.mt-gmail').href = 'https://mail.google.com/mail/?view=cm&fs=1&to=' + encodeURIComponent(addr);
  t.classList.add('show'); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('show'), 7000);
});
