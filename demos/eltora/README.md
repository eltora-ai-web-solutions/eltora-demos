# ELTORA – Official Website

Five pages: `/` Home, `/services`, `/work`, `/about`, `/contact` (`public/index.html`, `services.html`, `work.html`, `about.html`, `contact.html`; footer on every page) with a real
**Project Enquiry → email** backend. Enquiries are delivered to **eltora2026@gmail.com**.

```
public/            The website (index.html, assets/)
api/contact.js     Vercel serverless function  POST /api/contact  (Contact page form – used by the site)
lib/contact.js     Contact form validation, spam protection, email building + sending via Resend
api/enquiry.js     Older endpoint POST /api/enquiry (kept for compatibility, no longer used by the pages)
lib/enquiry.js     Logic for the older endpoint
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
Hero bird, building and service illustrations live in `public/assets/img/art/`; project thumbnails in `public/assets/img/thumbs/p1–p9.jpg`. Replace with higher-resolution originals (same names) for sharper output.

## Baskar Jewellers featured card
The card uses `public/assets/img/thumbs/baskar-feature.jpg`. Replace it with a real screenshot/photo (same name) any time.

## Contact page form → email (POST /api/contact)
The Contact page form sends JSON to `/api/contact`. The server validates every field (name, email, optional phone,
project type from the fixed list, message), ignores bots (hidden `company_website` honeypot), limits each connection to
5 enquiries per 10 minutes, and sends the email through Resend with the visitor's address as **Reply-To**.
The visitor only sees "Thank you!…" after Resend accepts the message and returns an email id; otherwise they see the
error message and their typed details stay in the form.

Email subject: `New ELTORA Website Project Enquiry – [Project Type]`, delivered to `CONTACT_TO_EMAIL` (default eltora2026@gmail.com).

### What you must set up (one time)
1. Sign up at https://resend.com **with eltora2026@gmail.com** (the free test sender `onboarding@resend.dev` can only
   deliver to the Resend account owner's own email).
2. Resend → **API Keys** → *Create API key* (permission: Sending access). Copy it once.
3. Vercel → your project → **Settings → Environment Variables**, add for *Production* (and *Preview* if wanted):
   - `RESEND_API_KEY` = the key from step 2
   - `CONTACT_TO_EMAIL` = `eltora2026@gmail.com`
   - `FROM_EMAIL` = `ELTORA Website <onboarding@resend.dev>`
4. **Redeploy** (Deployments → ⋯ → Redeploy) – environment variables only apply to new deployments.
5. Submit the form on the live site once and check eltora2026@gmail.com (look in Spam the first time, mark "Not spam").

Optional, recommended later: buy/own a domain, verify it in Resend → **Domains** (add the DNS records it shows), then set
`FROM_EMAIL` to e.g. `ELTORA Website <enquiries@yourdomain.com>` for better inbox delivery and to send to any address.

If `RESEND_API_KEY` is missing the endpoint answers 503 and the visitor sees the error message – no fake success.
Check Vercel → **Logs** for lines starting with `[contact]` if delivery fails (no visitor message content is logged).
