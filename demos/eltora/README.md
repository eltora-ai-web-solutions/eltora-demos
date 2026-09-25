# ELTORA – Official Website

Single long-scroll page (`#home → #services → #work → #about → #contact`, footer at the bottom of Contact) with a real
**Project Enquiry → email** backend. Enquiries are delivered to **eltora2026@gmail.com**.

```
public/            The website (index.html, assets/)
api/enquiry.js     Vercel serverless function  POST /api/enquiry
lib/enquiry.js     Validation + email building + sending (shared)
server.js          Zero-dependency Node server (local run / any Node host)
vercel.json        Output dir = public, clean URLs, old-route redirects
.env.example       Environment variables to set (never commit real values)
```

## How enquiry delivery works
The form posts JSON to `/api/enquiry`. The server validates every field (required, email/phone format, allowed service,
length limits), ignores bot submissions (hidden honeypot field), rate-limits repeat submissions, and sends the email
through the [Resend](https://resend.com) API. The API key lives **only** in server environment variables – it is never
in the frontend code. Email subject: `New ELTORA Project Enquiry – [Visitor Name]`; Reply-To is the visitor's email.
The visitor sees the success message only after delivery succeeds, an error message if it fails, a loading state while sending,
and cannot double-submit. The page never reloads.

## One-time setup (5 minutes)
1. Create a free Resend account **using eltora2026@gmail.com** and create an API key (Resend > API Keys).
2. Set environment variables:
   - `RESEND_API_KEY` = your key
   - `TO_EMAIL` = `eltora2026@gmail.com` (default)
   - `FROM_EMAIL` = `ELTORA Website <onboarding@resend.dev>` (default)
3. Deploy (below), then submit the form once to confirm the email arrives (check Spam the first time).

> The default `onboarding@resend.dev` sender can only deliver to the email address that owns the Resend account – which is why the account should be
> created with eltora2026@gmail.com. For a branded sender (e.g. `enquiries@yourdomain.com`), verify your domain in Resend and set `FROM_EMAIL`.

## Deploy on Vercel
Import the folder/repo (Framework Preset: *Other*, no build command) → add the environment variables above → Deploy.
Vercel serves `public/` and runs `api/enquiry.js` automatically. Redeploy after changing environment variables.

## Run locally
```bash
cp .env.example .env     # then put your real RESEND_API_KEY in .env
npm start                # http://localhost:3000  (Node 18+, no npm install needed)
```
Quick API check:
```bash
curl -X POST http://localhost:3000/api/enquiry -H "Content-Type: application/json" \
 -d '{"name":"Test User","email":"you@example.com","phone":"+91 98439 83376","company":"","service":"Web Development","details":"Testing enquiry delivery."}'
```
Any other Node host (Render, Railway, a VPS): `npm start` with the same environment variables.
Static-only hosts (Netlify drop, GitHub Pages) cannot send email – use Vercel or a Node host.

## Editing
Replace `public/assets/img/icons/logo.png` and `public/assets/img/thumbs/p1–p9.jpg` with your originals (same names) for sharper output.
