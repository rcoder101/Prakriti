# Prakriti — OllieWise.com

The public landing page and waitlist for [OllieWise](https://olliewise.com)
(the app itself lives in the `Agni` repo). Static site + one Cloudflare
Worker, deployed on Cloudflare.

## ⚠️ The one rule

**Every push to `main` deploys straight to olliewise.com.** There is no
staging environment. Work on a branch and open a PR for anything
non-trivial; push to `main` only what you'd be happy to see live a minute
later.

## What's in the repo

| File | What it is |
|---|---|
| `index.html` | The entire landing page (self-contained: markup, CSS, JS) |
| `privacy.html`, `terms.html` | Legal pages, linked from the footer as `/privacy` and `/terms` |
| `ollie.png` | Midday Ollie (hero mascot) |
| `ollie_morning.png`, `ollie_evening.png`, `ollie_night.png` | Time-of-day variants |
| `worker.js` | Cloudflare Worker: serves the static assets **and** handles `POST /api/waitlist` |
| `wrangler.jsonc` | Worker config: routes (apex + www), D1 binding, observability |
| `.assetsignore` | Keeps `.git`, config, and the worker script out of the served site |

## How the site behaves

- **Time-of-day Ollie:** the hero image and speech bubble follow the
  visitor's local clock (morning / midday / evening / night). Preview any
  slot with a query param: `index.html?hour=8`, `?hour=13`, `?hour=19`,
  `?hour=23`.
- **Waitlist:** the form POSTs to `/api/waitlist`. The worker validates,
  drops bot submissions (hidden honeypot field), inserts into D1 with
  dedupe, and on a *first-time* signup sends a welcome email via Resend
  from `hello@olliewise.com`. Repeat signups get a distinct
  "you're already in the nest" response (`{ ok, already }`).
- **Brand voice:** plain English first, Sanskrit dosha names as a gentle
  secondary reveal. Outbound copy is signed "Ollie", never a person's name.

## What lives in Cloudflare (NOT in this repo)

All under the OllieWise Cloudflare account — repo access alone can't see
or break these:

- **D1 database `olliewise-waitlist`** — the signup list. View it:
  dashboard → Storage & Databases → D1 → Console →
  `SELECT * FROM waitlist ORDER BY created_at DESC;`
  Schema: `waitlist (email TEXT PRIMARY KEY, created_at TEXT)`.
- **Secret `RESEND_API_KEY`** on the `prakriti` worker — auth for the
  welcome email. Never put it in this repo.
- **Email Routing** — inbound `hello@olliewise.com` forwards to the brand
  Gmail. (Outbound goes through Resend; the domain is verified there.)
- **Custom domains / DNS** — `olliewise.com` and `www` route to the worker.
- **Worker logs** — dashboard → prakriti → Observability (enabled in
  `wrangler.jsonc`), for debugging signups.

## Local development

No build step, no dependencies. Open `index.html` in a browser — everything
renders except the waitlist POST (no worker locally). If you have Node:
`npx wrangler dev` runs the worker + site together locally.

## Deploys

Handled by Cloudflare's Git integration: push → build (`npx wrangler
deploy`) → live. Check status: dashboard → Workers & Pages → prakriti →
Deployments. Browsers and the edge cache the page — hard-refresh
(Cmd+Shift+R) before concluding a deploy "didn't work".
