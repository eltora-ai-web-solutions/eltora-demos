'use strict';
// Contact-page enquiry logic: POST /api/contact
// Used by api/contact.js (Vercel serverless) and server.js (any Node host).
// Secrets come only from environment variables; nothing sensitive is sent to the browser.

const PROJECT_TYPES = [
  'Website Development', 'E-Commerce Website', 'AI Solutions', 'AI Agent Development', 'AI Voice Assistant', 'Business Automation',
  'Data Analytics', 'Custom Software', 'UI/UX & Branding', 'Mobile Application', 'Other',
];
const LIMITS = { name: 100, email: 254, phone: 30, projectType: 60, message: 5000 };
const RATE_WINDOW = 10 * 60 * 1000, RATE_MAX = 5;          // max 5 enquiries per IP per 10 minutes
const hits = new Map();                                     // best-effort, per server instance

// strip control characters (keep \t \n \r), normalise and trim
const clean = (v, max) => String(v == null ? '' : v)
  .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
  .replace(/\r\n?/g, '\n').trim().slice(0, max);
const oneLine = s => s.replace(/\s*\n\s*/g, ' ');
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const EMAIL_RE = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[A-Za-z]{2,}$/;

function sameOrigin(h) {
  const o = h && h.origin; if (!o) return true;
  try { return new URL(o).host === (h['x-forwarded-host'] || h.host); } catch (_) { return false; }
}
function limited(ip) {
  const now = Date.now(), list = (hits.get(ip) || []).filter(t => now - t < RATE_WINDOW);
  list.push(now); hits.set(ip, list);
  if (hits.size > 5000) hits.clear();
  return list.length > RATE_MAX;
}

function validate(body) {
  const d = {};
  for (const k of Object.keys(LIMITS)) d[k] = clean(body[k], LIMITS[k]);
  d.name = oneLine(d.name); d.email = oneLine(d.email); d.phone = oneLine(d.phone); d.projectType = oneLine(d.projectType);
  const errors = {};
  if (d.name.length < 2) errors.name = 'Please enter your name.';
  if (!EMAIL_RE.test(d.email)) errors.email = 'Please enter a valid email address.';
  if (d.phone && !/^[0-9+()\-.\s]{7,20}$/.test(d.phone)) errors.phone = 'Please enter a valid phone number (or leave it empty).';
  if (!PROJECT_TYPES.includes(d.projectType)) errors.projectType = 'Please select a project type.';
  if (d.message.length < 10) errors.message = 'Please tell us a little about your project (at least 10 characters).';
  return { d, errors };
}

function buildEmail(d) {
  const subject = `New ELTORA Website Project Enquiry – ${d.projectType}`;
  const phone = d.phone || 'Not provided';
  const text = [
    'NEW PROJECT ENQUIRY', '',
    `Name: ${d.name}`, '',
    `Email: ${d.email}`, '',
    `Phone: ${phone}`, '',
    `Project Type: ${d.projectType}`, '',
    'Message:', d.message, '',
    'Received Through:', 'ELTORA Official Website',
  ].join('\n');
  const row = (k, v) => `<tr><td style="padding:8px 16px 8px 0;color:#4d7a00;font-weight:700;vertical-align:top;white-space:nowrap">${k}</td><td style="padding:8px 0;color:#111">${v}</td></tr>`;
  const html = `<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.5;max-width:640px">
<h2 style="margin:0 0 16px;font-size:20px;letter-spacing:.04em;color:#111">NEW PROJECT ENQUIRY</h2>
<table style="border-collapse:collapse">${row('Name:', esc(d.name))}${row('Email:', `<a href="mailto:${esc(d.email)}">${esc(d.email)}</a>`)}${row('Phone:', esc(phone))}${row('Project Type:', esc(d.projectType))}${row('Message:', `<div style="white-space:pre-wrap">${esc(d.message)}</div>`)}</table>
<p style="margin:20px 0 0;color:#555">Received Through:<br><strong style="color:#111">ELTORA Official Website</strong></p></div>`;
  return { subject, text, html };
}

const FAIL = { ok: false, error: 'Sorry, we couldn\'t submit your enquiry. Please try again or contact us directly.' };

async function handleContact(body, ip, headers, env = process.env) {
  if (!sameOrigin(headers)) return { status: 403, json: { ...FAIL, code: 'forbidden' } };
  if (!body || typeof body !== 'object' || Array.isArray(body)) return { status: 400, json: { ...FAIL, code: 'invalid_request' } };
  // Honeypot: real visitors never fill the hidden "company_website" field. Bots get a quiet 200 and nothing is sent.
  if (clean(body.company_website, 200)) return { status: 200, json: { ok: true } };
  if (limited(ip || 'unknown')) return { status: 429, json: { ok: false, code: 'rate_limited', error: 'Too many enquiries from this connection. Please wait a few minutes, or contact us on WhatsApp.' } };

  const { d, errors } = validate(body);
  if (Object.keys(errors).length) return { status: 400, json: { ok: false, code: 'validation', error: Object.values(errors)[0], errors } };

  const key = env.RESEND_API_KEY;
  const to = env.CONTACT_TO_EMAIL || env.TO_EMAIL || 'eltora2026@gmail.com';
  const from = env.FROM_EMAIL || 'ELTORA Website <onboarding@resend.dev>';
  if (!key) { console.error('[contact] RESEND_API_KEY is not set – email not sent'); return { status: 503, json: { ...FAIL, code: 'not_configured' } }; }

  const m = buildEmail(d), ctl = new AbortController(), timer = setTimeout(() => ctl.abort(), 12000);
  try {
    const r = await fetch(env.RESEND_API_URL || 'https://api.resend.com/emails', {
      method: 'POST', signal: ctl.signal,
      headers: { Authorization: 'Bearer ' + key, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to: [to], reply_to: d.email, subject: m.subject, text: m.text, html: m.html }),
    });
    const j = await r.json().catch(() => ({}));
    // Success only when the provider accepted the message and returned its id.
    if (!r.ok || !j || !j.id) {
      console.error('[contact] provider rejected the email', r.status, j && (j.name || j.message) ? `${j.name || ''} ${j.message || ''}` : '');
      return { status: 502, json: { ...FAIL, code: 'provider_error' } };
    }
    return { status: 200, json: { ok: true, id: j.id } };
  } catch (err) {
    console.error('[contact] send failed:', err && err.name === 'AbortError' ? 'timeout' : (err && err.message));
    return { status: 502, json: { ...FAIL, code: 'provider_unreachable' } };
  } finally { clearTimeout(timer); }
}

module.exports = { handleContact, PROJECT_TYPES, buildEmail, validate };
