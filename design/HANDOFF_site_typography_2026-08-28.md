# Handoff: OllieWise site typography unification

## Overview

Unify olliewise.com on a single typeface. The site currently loads two families, Plus Jakarta Sans for headings and Inter for body and UI. Everything moves to **Plus Jakarta Sans**, so the marketing site matches the Flutter app and the pitch deck. Reading comfort is compensated with size, line-height, and measure. Two small pre-existing bugs are fixed along the way.

**Repo:** `rcoder101/Prakriti` (branch `main`)
**Verified against upstream commit-of-record:** tree `cff254212219`, checked 2026-08-28. All three files matched their pre-edit state at that point, so these changes apply with no conflict.

## About the design files

Unlike a typical handoff, this bundle is **not** a set of design references to recreate in another framework. `files/` contains the three real site files, already edited and ready to commit. The site is plain static HTML with inline `<style>` blocks, which is the production format. Diff them against the repo, sanity-check, commit.

**Do not copy the PNGs.** The project's working copy also contains `ollie.png`, `ollie_wing.png`, and `ollie_night_leaf.png`. Those are unmodified copies that existed only so the design tool could render a preview. They are already in the repo, byte-identical. Leave them alone.

## Fidelity

**High fidelity, production ready.** These are the actual files, not mockups. Every value below is exact.

## Files changed

| File | Change |
| --- | --- |
| `index.html` | Font link, body font stack, form-control font reset, body line-height, text rendering, tab title + og tags |
| `privacy.html` | Font link, body font stack, body font-size, `.wrap` measure, `h2` weight and spacing |
| `terms.html` | Same as privacy.html |

## The changes, precisely

### 1. Google Fonts link (all three files)

Replace the two-family request with one. Note the italic axis is included: italic is reserved for Ollie's voice and Sanskrit terms.

**Before** (`index.html`; the legal pages request narrower weight sets):
```html
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700&family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
```

**After** (identical in all three files):
```html
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,500&display=swap" rel="stylesheet">
```

### 2. Body font stack (all three files)

**Before:**
```css
font-family: 'Inter', -apple-system, 'Segoe UI', sans-serif;
```

**After:**
```css
font-family: 'Plus Jakarta Sans', -apple-system, 'Segoe UI', sans-serif;
```

Every other `font-family` declaration in these files already named Plus Jakarta Sans and is unchanged. After this change there are zero occurrences of the string `Inter` in all three files, which is the quickest way to verify.

### 3. Form-control font reset (`index.html` only) — bug fix

Form controls do not inherit `font-family` from `body`; the UA stylesheet wins. The result was that `<button class="btn" type="submit">Count me in</button>`, the primary conversion CTA on the page, rendered in **Arial**. The nav and hero buttons looked correct only because they are `<a class="btn">`, which do inherit. The honeypot `input[name="nickname"]` had the same problem, because the existing rule `.waitlist-form input[type="email"] { font-family: inherit; }` does not match `type="text"`.

Added immediately after the existing `*` reset:

```css
  * { margin: 0; padding: 0; box-sizing: border-box; }
  /* Form controls do not inherit the face from body. One font means one font. */
  button, input, textarea, select { font-family: inherit; }
```

A blanket reset rather than a `.btn` fix, so future buttons and inputs cannot regress.

**Verify:**
```js
getComputedStyle(document.querySelector('button.btn')).fontFamily
// → "Plus Jakarta Sans", -apple-system, "Segoe UI", sans-serif
```

### 4. Reading comfort, home page (`index.html`)

Plus Jakarta Sans is a geometric, display-leaning face with a slightly smaller x-height than Inter, so it needs a little more room at body sizes.

**Before:**
```css
    font-size: 17px;
    line-height: 1.6;
```

**After:**
```css
    font-size: 17px;
    line-height: 1.65;
    -webkit-font-smoothing: antialiased;
    text-rendering: optimizeLegibility;
```

### 5. Reading comfort, legal pages (`privacy.html`, `terms.html`)

**Before:**
```css
    font-size: 16px; line-height: 1.7;
```

**After:**
```css
    font-size: 17px; line-height: 1.7; -webkit-font-smoothing: antialiased;
```

### 6. Legal page measure (`privacy.html`, `terms.html`)

720px was at the upper end for this face. 680px lands around 66 characters per line.

**Before:**
```css
  .wrap { max-width: 720px; margin: 0 auto; padding: 24px 24px 64px; }
```

**After:**
```css
  .wrap { max-width: 680px; margin: 0 auto; padding: 24px 24px 64px; }
```

### 7. Legal section heads (`privacy.html`, `terms.html`)

`h2` inherited weight 600 from the shared `h1, h2, h3` rule, so section heads sat too close to bold body text. Dropped to 500 with more space above, so they read as signposts.

**Before:**
```css
  h2 { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 1.15rem; margin: 32px 0 10px; letter-spacing: -0.01em; }
```

**After:**
```css
  h2 { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 1.15rem; font-weight: 500; margin: 40px 0 10px; letter-spacing: -0.01em; }
```

### 8. Tab title and social preview (`index.html`) — tagline placement

The tagline "At home in yourself" was decided in August 2026. It is placed where identity is the job, and deliberately NOT in the page body: the hero headline "Your day has a rhythm. Ollie helps you find it." was tested with real users and stays exactly as it is. Nothing a visitor reads on the page changes.

**Before:**
```html
<title>OllieWise | Your day has a rhythm. Ollie helps you find it.</title>
<meta name="description" content="OllieWise is a daily-routine companion. …">
```

**After:**
```html
<title>OllieWise · At home in yourself</title>
<meta name="description" content="OllieWise is a daily-routine companion. …">
<meta property="og:title" content="OllieWise · At home in yourself">
<meta property="og:description" content="Your day has a rhythm. Ollie helps you find it.">
```

The `description` meta is unchanged. In a shared-link preview the tagline is the card title and the tested hero line is the description, so the tagline introduces and the hero converts.

Note the separator is a middot, not a hyphen: the brand rule forbids dashes and hyphen-as-punctuation in user-facing copy.

## Design tokens

Full token set in `reference/olliewise-tokens.css`. The values relevant here:

### Typeface

One family, everywhere: `'Plus Jakarta Sans', -apple-system, 'Segoe UI', sans-serif`

| Weight | Use |
| --- | --- |
| 800 | Wordmark |
| 700 | Headline, button label |
| 600 | Card title, section head (web marketing) |
| 500 | Screen title, Ollie's voice, legal section head |
| 400 | Body, options |

Headlines carry negative tracking, -0.02em to -0.04em, at line-height 1.2. Body sits at 0 tracking. Italic is reserved for Ollie's own voice and for Sanskrit terms, nothing else. Never all-caps above 20px, except the 12px eyebrow.

### Type scale, web

| Role | Size | Weight |
| --- | --- | --- |
| Hero | 50px | 700 |
| Section head | 34px | 600 |
| Lede | 19px | 400 |
| Card title | 17px | 600 |
| Body | 17px / 1.6–1.65 | 400 |
| Small | 15px | 400 |
| Caption | 14px | 400 |
| Eyebrow | 12px caps, 0.16em tracking | 700 |

### Colors used on these pages

| Token | Hex | Role |
| --- | --- | --- |
| Warm Ivory | `#FAF6EF` | Canvas. Never pure white |
| Deep Bark | `#3A2E28` | All text. Never black |
| Bark Light | `#7A6E68` | Web secondary text |
| CTA Sage | `#6A8E6F` | Primary button, links |
| CTA Pressed | `#5A795E` | Hover and pressed |
| Ollie Bubble | `#F9F0DA` | The "plain words version" box, `--warm` |

### Shape and elevation

| Token | Value |
| --- | --- |
| Web button radius | `999px`, pill, web only |
| Web card radius | `20px` |
| Legal box radius | `14px` |
| Card shadow | `0 8px 40px rgba(58, 46, 40, 0.07)` |
| Legal measure | `680px` |
| Min touch target | `44px` |

## Assets

No new assets. The three Ollie PNGs referenced by `index.html` are already in the repo and unchanged.

## Verification checklist

1. `grep -c Inter index.html privacy.html terms.html` → `0` in all three.
2. `getComputedStyle(document.querySelector('button.btn')).fontFamily` contains `Plus Jakarta Sans`.
3. `getComputedStyle(document.querySelector('input[name="nickname"]')).fontFamily` contains `Plus Jakarta Sans`.
4. `document.fonts.check("700 17px 'Plus Jakarta Sans'")` → `true`.
5. `document.documentElement.scrollWidth === window.innerWidth` at 375px, 768px, and 1280px, i.e. no horizontal overflow.
6. Waitlist form still submits to the Cloudflare worker; `worker.js` is untouched.

## Out of scope, deliberately

- **`worker.js`** — not touched.
- **The Flutter app** — `OllieWise/flutter/lib/theme/app_theme.dart` bundles no custom font and falls back to the platform face (SF Pro / Roboto). Bundling Plus Jakarta Sans in the app is a separate, larger task: add the family to `pubspec.yaml`, set `fontFamily` on the theme, and check every screen for reflow at the app's 19/17/15/13/11 sp scale. Not included here.
- **Straight vs curly quotes** — `terms.html` contains `"as is."` with straight quotes while the rest of the page uses curly. Cosmetic, left alone to keep this diff purely typographic.

## Open decision, for later

Inter was purpose-built for dense screen text: larger x-height, tighter fit, more legible per pixel at small sizes. Plus Jakarta Sans is the weaker tool for long-form reading, and the size and line-height bumps above are compensation for that. The trade is deliberate: brand recognition compounds across surfaces, and a fractional legibility edge on a privacy policy does not.

**Articles and a blog are planned.** That is the moment to revisit. When long-form ships, fix reading comfort with **measure, size, and weight first** — cap body at roughly 66 to 68 characters, keep body at 400, let headings carry the personality. Reintroducing a second family is the last resort, because it costs exactly what this change bought.

Recorded in `github.md` at the project root, alongside the repo association and screen map.
