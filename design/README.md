# OllieWise Design System

The canonical reference for color, typography, components, mascot use, and voice
across the app, the website, and the pitch deck.

## What is here

| File | What it is |
| --- | --- |
| `OllieWise-Design-System.html` | The full reference. Self-contained: open it in any browser, no server, no build, no network. |
| `olliewise-tokens.css` | The tokens as CSS custom properties, ready to import into the website. Includes the four constitution themes via `[data-ow-theme]`. |

## Sources of truth

Tokens exist in three places and must agree:

1. `flutter/lib/theme/app_theme.dart` in the OllieWise app repo — the app.
2. `olliewise-tokens.css` here — the website.
3. This document — the written rules the other two cannot express.

When a color changes, change all three.

## The rules worth knowing before you design anything

- **Six colors.** Warm Ivory, Sage Mist, Turmeric Glow, Clay Rose, Dusk Mauve, Deep Bark. Everything else is one of the six tinted toward Warm Ivory.
- **Color belongs to the fill; text is Deep Bark.** The tints fall under 3:1 on ivory and collapse further on tinted grounds. Never an accent color for text, labels, or thin marks.
- **One typeface.** Plus Jakarta Sans everywhere. Hierarchy comes from weight and tracking, never from a second family.
- **Ollie is a companion, not a coach.** He notices, he never scolds. One Ollie per screen, one bubble per Ollie.
- **Plain words before Sanskrit.** "Running in all directions" comes before *Vata*, always in that order.
- **No dashes** in anything a user reads. American English throughout.
- **No medical claims.** General wellness only.

## Deck rules

Four slide backgrounds, each with a job: Warm Ivory default, sage surface for a
pause, Ollie Bubble cream where Ollie speaks in his own voice, Deep Bark exactly
once for the close. Never a background chosen for variety.

## Editing

This HTML is compiled output. The source lives in the design project as
`OllieWise Design System.dc.html`; edit there and re-export rather than
hand-editing this file.
