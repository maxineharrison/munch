# MEMORY.md — Munch project log

Living record of what we learn, key takeaways, progress and important decisions. **Keep this current.** At the start of every session, read CLAUDE.md, PRD.md and this file first.

## Status snapshot
- **Phase:** v1 prototype built and smoke-tested (desktop + mobile width). Not yet reviewed by the user.
- **Run it:** open `index.html` directly, or `node serve.js` (serves on http://localhost:8765). `.claude/launch.json` has a "munch" preview config.
- **Next up:** User review and feedback; polish visuals, check remaining images, test sounds by ear, test more worldwide searches.

## File map
- `index.html` — shell (header, nav, footer, modal/toast roots)
- `css/styles.css` — design tokens, components, responsive rules
- `js/data.js` — Unsplash photo ids, 24 sample restaurants, cuisine→dish suggestions, atmosphere options, 9 fictional events
- `js/store.js` — pure points rules (`Points`) + localStorage store (`Store`, key `munch.v1`)
- `js/sound.js` — Web Audio synthesised sounds (munch, clink, pop, coin, star, fanfare), mute toggle
- `js/app.js` — routing (#/home, #/review, #/lists, #/events, #/profile), review wizard, lists, events, profile, search, effects
- `assets/logo.svg`, `assets/icon.svg` — logo (smiling tomato with a bite + stroke-drawn wordmark, no font needed)
- `serve.js` — tiny Node static server (python's http.server failed with a macOS Desktop permission error)

## Progress log
- **2026-11-06** — Created `CLAUDE.md`, `MEMORY.md`, `PRD.md` in the Food App folder.
- **2026-11-06** — Wrote full PRD (review flow, points, lists, events, branding, effects) and CLAUDE.md (project rules).
- **2026-11-06** — Added pull-to-refresh (touch): pulling down at the top of the page slides a small card out from under the header, and the glasses close in as you pull (the splash swing animation is scrubbed with a negative `animation-delay`). Past 70px of pull and released, they clink (plus clink sound), the page re-renders and a "Refreshed" toast shows. Also added page-to-page load effects: a tomato-to-gold progress bar across the top, the old page fades and blurs out, then the new one fades in with staggered cards. Tested with simulated touch events and nav clicks; no console errors. `window.munchRefresh()` triggers the refresh on desktop.
- **2026-11-06** — Restyle for adults/young adults: dark editorial theme (Fraunces + Inter), new face-less logo for dark backgrounds, all emoji removed from the UI, doodles/tilt/bouncy effects dropped, confetti now small tomato/gold/cream pieces. Added a loading splash: two glasses (champagne, rosé) on a plain background swing together and clink, then the logo fades in (~3.7s, click to skip). Verified on a narrow (phone-like) pane: splash, home, review flow (+11 test review), events, lists; no console errors.
- **2026-11-06** — Built the whole v1 site: logo, review wizard (search → half-star rating → dishes → photos → vibe → go back → date → summary), points engine, Been/To Try/custom lists with per-place 12-pt tiers, Events tab with showcase notice and who-picked-what roster, profile with badges, confetti/sparkles/tilt, synthesised sounds with mute.
- **2026-11-06** — Tested: points maths (20-pt review cap, 12-pt place cap, no double-earning, 30-day repeat = 0), full review flow, list detail modal, events page, mobile width (no horizontal scroll). Fixed: mobile nav (fixed bottom bar broke inside the blurred header, so it's now a scrollable second row) and worldwide search retry.
- **2026-11-06** — Clarified list points: cap is 12 per place (not per user). Chose tiered-effort breakdown and updated PRD.md, CLAUDE.md and this file.
- **2026-11-06** — Resolved the open questions (stack, list points, half-stars/custom lists) and updated PRD.md and CLAUDE.md. Set up this memory log and the "read all three files at session start" rule.

## Decisions
| Date | Decision | Why |
|---|---|---|
| 2026-11-06 | App name is **munch** (lowercase logo) | User's choice |
| 2026-11-06 | **Static site** (HTML/CSS/JS), localStorage, no backend | User wants the easiest option |
| 2026-11-06 | **Max 20 points per review**: rating 3, items 5, photos 5, atmosphere 3, go-back 2, date 2 | Fair split by effort; capped per section |
| 2026-11-06 | ~~+1 per place, 12 total cap~~ **Superseded:** each place in a list earns **up to 12 pts** (cap per place, unlimited places, so 10 places = up to 120). Tiered: add 1, rating 2, note 2, photo 2, tags 2, dishes 3 | User clarified the cap is per place; tiered-effort option chosen to keep it fair |
| 2026-11-06 | Event spending **deducts** from the points balance | User confirmed |
| 2026-11-06 | **Half-star ratings** and **custom lists** are in v1 | User request |
| 2026-11-06 | Accounts are **name only** | Lets us track who chose which event without real auth |
| 2026-11-06 | Events are **fictional showcase only** with a visible disclaimer; cities: Cape Town, London, Paris | User request; avoids implying real tickets |
| 2026-11-06 | One rewarded review per user per restaurant per 30 days | Anti points-farming |
| 2026-11-06 | Sounds start only after first interaction, with a mute toggle | Browser autoplay rules and accessibility |
| 2026-11-06 | Design direction changed to **mature dark editorial** (was playful cream/Fredoka) | User wants it catered to adults and young adults |
| 2026-11-06 | Loading screen with two glasses clinking on a plain background, shown on every open | User request; click to skip |

## Assumptions to confirm
- ✅ Confirmed (user said "yes continue"): a place earns list points **once per user** even if added to several lists (anti-farming).
- Confirmed: spending points on events deducts from the same balance earned via reviews and lists.

## What we're learning
- Free restaurant APIs (OpenStreetMap Nominatim/Overpass) give names, addresses and cuisine tags but **rarely real menus**. Menu "suggestions" will be inferred from cuisine and public info, and clearly labelled as suggestions, with free-text entry always allowed.
- Nominatim (OSM) search is strict about names: "Nando's Soho" works, "Nandos Soho London" doesn't. We retry once without the last word. It returns `type` (restaurant, cafe…) which we filter on; `jsonv2` has `category`, not `class`.
- A `backdrop-filter` on the header makes `position: fixed` children position relative to the header, so a fixed mobile bottom nav inside it breaks.
- `python3 -m http.server` fails from the Desktop folder under the preview sandbox (getcwd permission); Node with `__dirname` works.
- When a review auto-adds a place to "Been", its details are recorded as already-banked in `placePoints` without paying (the review already paid), so the list ring can show e.g. 6/12 without any list points actually earned. Only new details added later pay out.
- Browsers block autoplay audio, so food sounds (munch, glass clink) must wait for a user gesture.

## Key takeaways
- Reviews are worth up to 20 each. List entries earn up to 12 per place, so heavy list use can add up (10 places = 120). Keep an eye on balance against event costs (90–180 pts).
- The Events tab must always say events are not real and are for showcase only.
- Points logic should live in pure functions so the 20-point review cap and 12-point per-place list cap are each enforced in one place.

- SVG gotcha: a CSS `transform` on an element replaces its `transform="..."` attribute, so animated parts need a wrapper `<g>` that holds the positioning attribute (this misplaced the splash spark burst at first).
- The browser only lets audio start after the user has interacted, so the splash clink is silent on a cold load; it plays when the user clicks to skip.

- Flex gotcha: a flex item inside a `height: 0` flex container stretches to 0 height unless `align-items: flex-start` is set (this squashed the pull-to-refresh card at first). Also, the splash isn't removed from the DOM until about 4.6s, so use `body.is-loading` to check whether it's still showing.

## Known gaps / to verify
- Pull-to-refresh is touch-only and was tested with simulated touch events, not on a real phone. Desktop has no pull gesture.
- Splash glass tilt and spark timing were tuned from screenshots at a narrow width; check on a full desktop window.
- Sounds are synthesised and untested by ear (headless test only checked no errors).
- Event/restaurant stock photos are Unsplash ids chosen by name; only checked that URLs resolve, and eyeballed a few. Swap any that look off.
- Sample restaurants are real but their details (coordinates, whether still open) are approximate starter data.
- Photos are resized to ~900px JPEG before saving to localStorage; many photos can still fill storage (we warn).

## Open questions
- None currently (see "Assumptions to confirm").
