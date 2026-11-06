# munch

Rate restaurants around the world, earn points for every review, keep lists of places you've been and want to try, and spend points on (showcase-only) food and drink events in Cape Town, London and Paris.

It's a static site: plain HTML, CSS and JavaScript, with data saved in your browser (localStorage). No build step and no backend.

## Run it

Open `index.html` in a browser, or serve the folder:

```bash
node serve.js
```

then visit http://localhost:8765.

## How points work

- A review earns up to **20 points**: rating 3, what you had 5, photos 5, atmosphere 3, would you go back 2, date 2.
- Each place in a list earns up to **12 points**: add 1, rating 2, note 2, photo 2, tags 2, dishes 3.
- Spending points on events deducts from your balance.

## Notes

- Events are fictional and for showcase only.
- Restaurant search uses OpenStreetMap (Nominatim). Menu items are suggestions based on cuisine and well-known dishes.
- Photos are hot-linked from Unsplash. Sounds are synthesised in the browser.
- Project context lives in `PRD.md`, `CLAUDE.md` and `MEMORY.md`.
