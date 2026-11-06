# CLAUDE.md — Munch

Instructions and context for Claude when working in this project. Full requirements live in `PRD.md` — read it before building anything, and keep it up to date if requirements change.

## Session start (always)
1. Read **CLAUDE.md**, **PRD.md** and **MEMORY.md** first to get full project context before doing anything else.
2. Keep **MEMORY.md** up to date at all times: log what we learn, key takeaways, progress and important decisions as they happen (not just at the end). Update PRD.md too when requirements change.

## Project
**Munch** is a web app for rating restaurants around the world. Users earn points for reviews, keep "Been" and "To Try" lists, and spend points on **showcase-only** food/drink events in Cape Town, London and Paris.

## Non-negotiables
- App name is **munch** (lowercase in the logo). Generate a modern SVG logo (`assets/logo.svg`, plus a favicon) in food colours.
- **Review form flow:** search restaurant → click to select → star rating (out of 5) → what they had (suggest menu items/locations from public web info) → add photos → atmosphere options → would they go back → when they went.
- **Points: max 20 per review**, split across sections exactly as in `PRD.md` §6.2 (rating 3, items 5, photos 5, atmosphere 3, go-back 2, date 2). Never exceed 20. Show the breakdown.
- **Ratings:** half-star support.
- **Lists:** "Been", "To Try" and **custom named lists** (v1).
- **List points:** each place in a list earns **up to 12 points per place** (cap per place, no limit on places), tiered by effort: add 1, rating 2, note 2, photo 2, tags 2, dishes 3. See `PRD.md` §6.2. A place earns list points once per user across lists. Event spending deducts from the balance.
- **Events tab:** must show a clear notice that **these are not real events and are for showcase purposes only**. Cape Town, London and Paris events with a short blurb and what the ticket includes (e.g. 2 drinks, dinner, further drinks on you). Attending spends points.
- **Accounts:** free, **name only** (no email/password). Record which user chose which event.
- **Aesthetic:** modern, food-coloured, very aesthetic, with cool effects and **sounds** (munching, glasses clinking). Include a mute toggle; don't autoplay audio before user interaction; honour `prefers-reduced-motion`.
- Use public/free-licence pictures (Unsplash, Pexels, Wikimedia Commons) and credit them.

## Current look (supersedes the older playful direction)
- Audience is adults and young adults: modern, mature, dark and editorial. Avoid cartoon faces, emoji in the UI, and bouncy/kiddy effects.
- On open, show the loading screen: two glasses on a plain dark background clinking (`#splash` in `index.html`), then fade into the app.
- Tokens: bg `#110c11`, text `#f5ede3`, tomato `#ff5a3c`, gold `#e8b04a`, green `#8dbb7a`. Fonts: Fraunces (headings) + Inter (body).

## Design tokens (original brand palette, kept for reference)
- Tomato `#FF4D2E` (primary), Mustard `#FFB627` (points/accent), Avocado `#7BB661` (success), Cream `#FFF6E5` (background), Aubergine `#2B1B2E` (text/dark), Peach `#FF9F80` (soft highlight).
- Headings: rounded display font (Fredoka / Baloo 2). Body: Inter or DM Sans.
- Mobile-first, accessible contrast, keyboard navigable.

## Data and APIs
- Restaurant search: OpenStreetMap Nominatim / Overpass (free, no key). Respect usage policies and rate limits; cache results.
- Menu suggestions: free APIs rarely provide menus. Infer from cuisine tags and public sources, label them as suggestions, and always allow free-text entry. Don't invent claims about specific restaurants' menus.
- Provide a small bundled sample dataset as an offline/fallback so the app always works.
- Never commit API keys; use environment variables.

## Engineering guidelines
- Stack is decided: the easiest option, a **static site** (plain HTML/CSS/JS, no build step if possible) with localStorage persistence. Ask before adding a backend or heavy framework.
- Structure data per the model in `PRD.md` §10 so a backend can replace localStorage later.
- Put points logic in pure, tested functions so the 20-point review cap and 12-point per-place list cap are each enforced in a single place.
- Validate form input (date not in the future, max 5 photos, valid image types, size limits).
- One rewarded review per user per restaurant per 30 days; later ones earn 0 points.
- Keep sounds small, lazy-loaded, and from royalty-free sources; document their licences.
- Don't add unrequested features; list ideas as suggestions instead.

## Working style
- Make a short plan before large changes and check it against `PRD.md`.
- Run and visually check the app (desktop and mobile widths) before saying it's done; report anything unverified honestly.
- Keep commits small and descriptive (if git is initialised).

## Project files
- `PRD.md` — product requirements (source of truth)
- `CLAUDE.md` — this file
- `MEMORY.md` — living log of learnings, takeaways, progress and decisions (keep current)
