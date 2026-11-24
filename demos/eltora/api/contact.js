'use strict';
// Vercel serverless function: POST /api/contact  (Contact page project enquiry → email via Resend)
const { handleContact } = require('../lib/contact');

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ ok: false, error: 'Method not allowed' }); }
  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch (_) { body = null; } }
  const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || (req.socket && req.socket.remoteAddress) || '';
  const r = await handleContact(body, ip, req.headers);
  return res.status(r.status).json(r.json);
};
