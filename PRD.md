# Munch — Product Requirements Document

## 1. Overview
**Munch** is a modern, playful web app for rating restaurants around the world. Users earn **points** for every review they write, keep lists of places they've been and places they want to try, and can spend points on (showcase-only) food and drink experiences in Cape Town, London and Paris.

**Vibe:** modern, aesthetic, food-coloured, tactile. Cool micro-animations and food sounds (munching, glasses clinking) make it feel alive.

## 2. Goals
- Make reviewing a restaurant fast, fun and rewarding.
- Reward effort fairly (richer reviews earn more points, capped at 20).
- Give users a personal food passport: "Been" and "To Try" lists.
- Showcase how points could be redeemed through an Events tab.

## 3. Non-goals (for this version)
- Real events, real ticketing or payments. Events are **showcase only**.
- Real authentication. Accounts are name-only and free.
- Moderation, social feeds or following other users.

## 4. Branding
- **Audience and tone (updated):** adults and young adults. The look is modern and mature: dark, editorial, restrained. No cartoon faces, no emoji clutter, no bouncy effects.
- **Name:** Munch (always styled "munch", lowercase, in the logo).
- **Logo:** a tomato-coloured fruit with a bite taken out (no face) beside a rounded lowercase wordmark in cream. Designed for dark backgrounds. `assets/logo.svg` plus `assets/icon.svg` for the favicon.
- **Loading screen:** on every open, two glasses (champagne and rosé) on a plain dark background swing together and clink, with a gold spark burst, then the logo fades in and the app appears. Clicking skips it. The clink sound only plays if the browser already allows audio.
- **Current theme (supersedes the palette below where they differ):** near-black plum background `#110c11`, cream text `#f5ede3`, tomato `#ff5a3c` accent, gold `#e8b04a` for points, soft green `#8dbb7a` for success. Fonts: Fraunces (serif display) and Inter (body).
- **Palette (food-inspired):**
  - Tomato `#FF4D2E` — primary
  - Mustard `#FFB627` — accent / points
  - Avocado `#7BB661` — success / "would go back"
  - Cream `#FFF6E5` — background
  - Aubergine `#2B1B2E` — text / dark surfaces
  - Peach `#FF9F80` — soft highlights
- **Type:** rounded, friendly display font for headings (e.g. Fredoka / Baloo 2) and a clean sans for body (e.g. Inter / DM Sans).
- **Imagery:** public/free-licence photos (Unsplash, Pexels, Wikimedia Commons) for hero, cuisines, events and empty states. Credit sources in the footer.

## 5. Users and accounts
- Free account created with **just a name** (no email/password).
- The name is stored with the user's points, reviews, lists and event choices so we can track **who chose which event**.
- Stored locally (localStorage) for the prototype (static site, no backend); structure data so a backend can replace it later.
- Light "sign in" = pick/enter your name again to resume.

## 6. Core features

### 6.1 Review flow (form)
A step-by-step form with a progress bar and a live "points earned" counter.

1. **Find the restaurant** — search box with autocomplete. User clicks a result to select it. Data from public sources (see §9). Shows name, address, city/country, cuisine and a photo if available.
2. **Rate it** — 0.5–5 stars with **half-star** support.
3. **What did you have?** — free-text plus **suggested menu items** pulled/inferred from public info for that restaurant or its cuisine (tap to add chips). Users can add their own items.
4. **Photos** — upload photos of the visit, food and drinks (preview, remove, up to 5).
5. **Atmosphere** — choose from options (multi-select): Cosy, Lively, Romantic, Family-friendly, Fancy, Casual, Quiet, Good for groups, Outdoor/terrace, Great music, Hidden gem.
6. **Would you go back?** — Yes / Maybe / No.
7. **When did you go?** — date picker (cannot be in the future).
8. **Submit** — confetti, munch sound, points awarded, restaurant offered for the "Been" list.

### 6.2 Points system (max 20 per review)
Points reflect effort and are split fairly across sections:

| Section | Max pts | How earned |
|---|---|---|
| Star rating | 3 | 3 for giving a rating |
| What you had | 5 | 2 for the first item, +1 for each extra item (up to 3 more) |
| Photos | 5 | 1 per photo, up to 5 |
| Atmosphere | 3 | 2 for 1+ tags, +1 for 3 or more tags |
| Would you go back | 2 | 2 for answering |
| Date of visit | 2 | 2 for entering a valid date |
| Restaurant selected | 0 | Required to start, no points |
| **Total** | **20** | |

#### Points for lists (secondary source)
Each place in a list can earn **up to 12 points** (a cap **per place**, not per user). There's no limit on the number of places or lists, so 10 places in a "Coffee spots" list can earn up to 120 points.

| List entry detail | Max pts | How earned |
|---|---|---|
| Adding the place to a list | 1 | 1 on add |
| Personal rating | 2 | Stars on Been places; "excitement" (1–5) on To Try places |
| Note | 2 | A short written note (min. ~10 characters) |
| Photo | 2 | 1 photo = 2 |
| Tags | 2 | 1+ tags (e.g. best for brunch, date night, cheap eats) |
| Dishes | 3 | Dishes had (Been) or dishes to try (To Try): 1 each, up to 3 |
| **Total per place** | **12** | |

- List points are separate from review points. Writing a full in-venue review (up to 20) is still worth more than any single list entry, which keeps the focus on real visits.
- Points are awarded once per detail and are not refunded or re-earned if the user removes and re-adds the entry.
- **Anti-farming (assumed, to confirm):** a place earns its list points once per user, even if it's added to several lists.

Fairness rules:
- Each section is capped so one section can't dominate.
- One reviewed visit per restaurant per user per 30 days earns points (extra reviews allowed but 0 points) to prevent farming.
- Visit date must be today or earlier.
- Points breakdown is shown on submit and in the review history.

### 6.3 Lists
- **Been** — places the user has visited (auto-added after a review, or added manually).
- **To Try** — wishlist of places. One-tap "move to Been → write review".
- **Custom named lists** are in v1 (e.g. "Best brunch", "Date night"): create, rename, delete, add/remove places.
- Each list item shows photo, name, city, and the user's rating if any.

### 6.4 Events tab
- Prominent banner at the top: **"These aren't real events — they're here for showcase purposes only. No tickets are issued and no points are charged for real."**
- Events in **Cape Town, London and Paris**, filterable by city.
- Each event card: image, city, date, short blurb, what's included, points cost, "Attend" button.
- Clicking "Attend" requires a name-only account (prompt to create one), deducts points (if enough), and records the user's choice.
- "My events" view shows what the user picked. A simple admin/export view (or console/JSON) lists who chose which event.
- Insufficient points → friendly message showing how many more are needed.

#### Showcase events (all fictional)
| Event | City | Cost | Blurb | Included |
|---|---|---|---|---|
| **Sundowners & Braai on the Rooftop** | Cape Town | 120 pts | Golden-hour rooftop with Table Mountain views, live marimba and a modern South African braai. | 2 welcome drinks (local wine or gin), braai dinner (boerewors, line fish, sides), dessert. Further drinks on you. |
| **Winelands Long-Table Lunch** | Cape Town | 180 pts | A long communal table among the vines in Stellenbosch with the winemaker. | 3-course lunch, paired tasting of 4 wines, shuttle from city. Extra bottles on you. |
| **Bo-Kaap Cook & Spice Walk** | Cape Town | 90 pts | Guided walk through colourful Bo-Kaap with a Cape Malay cooking demo. | Spice tasting, cooking class, 1 drink, take-home spice mix. |
| **Street Food Supper Club** | London | 110 pts | Pop-up supper club with 4 street-food vendors under one roof in East London. | 4 small plates, 2 drinks (beer or cocktail). Extra drinks on you. |
| **Gin & Tonic Masterclass** | London | 100 pts | Learn to build the perfect G&T with a distiller in a Soho speakeasy. | 3 tasting serves, botanicals kit, nibbles. Extra drinks on you. |
| **Sunday Roast Showdown** | London | 130 pts | Three pubs, one roast — vote for the best Yorkshire pudding. | Roast dinner, 1 pint or glass of wine, voting card. Drinks on you after. |
| **Midnight Cheese & Wine Crawl** | Paris | 140 pts | After-dark crawl through Le Marais with a fromager and sommelier. | 3 stops, cheese boards, 2 glasses of wine per stop. Extra on you. |
| **Pâtisserie Atelier: Macarons & Champagne** | Paris | 160 pts | Hands-on macaron class in a Montmartre atelier, finished with bubbles. | Class, ingredients, box of 12 macarons, 2 glasses of champagne. |
| **Seine-Side Picnic Dinner** | Paris | 150 pts | Curated picnic basket on the quay as the Eiffel Tower sparkles. | Picnic dinner for one, 2 drinks, blanket. More drinks on you. |

(Dates are placeholders a few weeks ahead of the build date.)

### 6.5 Discover / Home
- Hero with logo and animated food imagery.
- Search bar for restaurants, top-rated places, recent reviews, cuisine chips.
- Points balance and level shown in the header.

### 6.6 Profile
- Name, total points, points spent, review count, cities visited, badges (e.g. "First Bite", "Globetrotter", "Dessert Lover").
- Review history with points breakdown.

## 7. Effects, sound and aesthetic
- **Sounds** (royalty-free, short, lazy-loaded): munch/crunch on submit and star taps, glasses clinking when attending an event or earning points, soft pop on adding chips/photos.
- **Sound toggle** visible in the header; **muted until first user interaction** (browser autoplay rules), respect `prefers-reduced-motion` and remember the toggle.
- **Effects:** confetti/food-emoji burst on review submit, animated points counter, star sparkle, card hover tilt, smooth page transitions, floating food doodles in the background, a "bite" animation on the logo.
- Mobile-first, responsive, accessible contrast, keyboard navigable.

## 8. Pages / navigation
1. Home / Discover
2. Review (form flow)
3. My Lists (Been / To Try)
4. Events (with showcase disclaimer)
5. Profile / Sign in

## 9. Data and public sources
- **Restaurant search:** OpenStreetMap Nominatim and/or Overpass (free, no key) for name, address, location, cuisine tags. Optionally Foursquare/Google Places if a key is provided later.
- **Menu suggestions:** public menu data is rarely available via free APIs. Use OSM `cuisine` tags and Wikipedia/Wikidata dish lists to suggest typical dishes for the cuisine, plus any menu info found on the restaurant's public website. Always let the user type their own items. Be honest in the UI that these are suggestions.
- **Images:** Unsplash/Pexels/Wikimedia Commons, with attribution.
- Respect each API's usage policy (rate limits, user-agent, caching). Fail gracefully offline with a small bundled sample dataset of well-known restaurants.

## 10. Data model (prototype)
- `User { id, name, points, createdAt }`
- `Restaurant { id, name, address, city, country, lat, lng, cuisine, photoUrl, source }`
- `Review { id, userId, restaurantId, rating, items[], photos[], atmosphere[], wouldGoBack, visitDate, pointsAwarded, pointsBreakdown, createdAt }`
- `List { id, userId, type: been|toTry|custom, name, restaurantIds[] }`
- `ListEntry { listId, restaurantId, rating, note, photos[], tags[], dishes[], pointsEarned (max 12), pointsBreakdown }`
- `User.points` is a balance: earned points minus points spent on events
- `Event { id, title, city, date, blurb, included[], costPoints, image }`
- `EventSelection { id, userId, eventId, pointsSpent, createdAt }`

## 11. Success criteria
- A new user can create a name-only account and submit a full review in under 2 minutes.
- Points are always ≤ 20 per review and the breakdown adds up.
- Events tab clearly states events are not real, and each selection is recorded against a user name.
- Site feels polished: animations and sounds work, with a mute control, on desktop and mobile.

## 12. Decisions on earlier open questions
- **Stack:** easiest option — a static site (HTML/CSS/JS), data in localStorage, no backend.
- **Extra points:** each place in a list earns up to 12 points (tiered by effort, see §6.2), capped per place with no limit on places. Points spent on events deduct from the user's balance.
- **v1 scope:** half-star ratings and custom lists are included.

## 13. Open questions
- Assumption to confirm: a place earns list points once per user even if added to multiple lists (to stop farming).
