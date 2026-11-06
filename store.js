/* munch — points rules (pure) + localStorage store */
(function () {
  // ---------- Points (pure functions, the single source of truth for caps) ----------
  const REVIEW_MAX = 20;
  const LIST_PLACE_MAX = 12;
  const REVIEW_LABELS = {
    rating: 'Star rating', items: 'What you had', photos: 'Photos', atmosphere: 'Atmosphere', back: 'Would go back', date: 'Date of visit',
  };
  const REVIEW_SECTION_MAX = { rating: 3, items: 5, photos: 5, atmosphere: 3, back: 2, date: 2 };
  const LIST_LABELS = { add: 'Added to a list', rating: 'Personal rating', note: 'Note', photo: 'Photo', tags: 'Tags', dishes: 'Dishes' };
  const LIST_SECTION_MAX = { add: 1, rating: 2, note: 2, photo: 2, tags: 2, dishes: 3 };

  const todayISO = () => {
    const d = new Date();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${m}-${day}`;
  };
  const validDate = (s) => /^\d{4}-\d{2}-\d{2}$/.test(s || '') && !isNaN(Date.parse(s)) && s <= todayISO();
  const sum = (o) => Object.values(o).reduce((a, b) => a + b, 0);

  function reviewPoints(d) {
    const items = (d.items || []).length;
    const photos = (d.photos || []).length;
    const atm = (d.atmosphere || []).length;
    const b = {
      rating: d.rating > 0 ? 3 : 0,
      items: items ? 2 + Math.min(items - 1, 3) : 0,
      photos: Math.min(photos, 5),
      atmosphere: atm >= 3 ? 3 : atm >= 1 ? 2 : 0,
      back: ['yes', 'maybe', 'no'].includes(d.back) ? 2 : 0,
      date: validDate(d.date) ? 2 : 0,
    };
    return { breakdown: b, total: Math.min(sum(b), REVIEW_MAX) };
  }

  function entryPoints(e) {
    const b = {
      add: 1,
      rating: e.rating > 0 ? 2 : 0,
      note: (e.note || '').trim().length >= 10 ? 2 : 0,
      photo: e.photo ? 2 : 0,
      tags: (e.tags || []).length ? 2 : 0,
      dishes: Math.min((e.dishes || []).length, 3),
    };
    return { breakdown: b, total: Math.min(sum(b), LIST_PLACE_MAX) };
  }

  // ---------- Store ----------
  const KEY = 'munch.v1';
  const uid = () => Math.random().toString(36).slice(2, 10);
  let db = load();
  function load() {
    try { const d = JSON.parse(localStorage.getItem(KEY)); if (d && d.users) return d; } catch (e) { /* ignore */ }
    return { users: {}, current: null, selections: [] };
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(db)); return true; } catch (e) { return false; }
  }
  const user = () => (db.current ? db.users[db.current] || null : null);
  const balance = (u) => (u ? u.earned - u.spent : 0);

  function newUser(name) {
    return {
      id: uid(), name, createdAt: Date.now(), earned: 0, spent: 0, ledger: [], reviews: [], placePoints: {},
      lists: [
        { id: uid(), name: 'Been', type: 'been', items: [] },
        { id: uid(), name: 'To Try', type: 'toTry', items: [] },
      ],
    };
  }
  function signIn(name) {
    name = String(name || '').trim().replace(/\s+/g, ' ').slice(0, 30);
    if (!name) return null;
    const key = name.toLowerCase();
    let created = false;
    if (!db.users[key]) { db.users[key] = newUser(name); created = true; }
    db.current = key; save();
    return { user: db.users[key], created };
  }
  function signOut() { db.current = null; save(); }

  function credit(u, pts, label) {
    if (pts <= 0) return;
    u.earned += pts;
    u.ledger.unshift({ t: Date.now(), label, pts });
    u.ledger = u.ledger.slice(0, 200);
  }

  // award only the NEW points for each detail of a place (once per place per user, across all lists)
  function awardPlace(u, restId, breakdown, silent) {
    const rec = u.placePoints[restId] || {};
    let delta = 0;
    Object.keys(breakdown).forEach((k) => {
      const prev = rec[k] || 0;
      if (breakdown[k] > prev) { delta += breakdown[k] - prev; rec[k] = breakdown[k]; }
    });
    u.placePoints[restId] = rec;
    return silent ? 0 : delta;
  }

  const DAY = 86400000;
  function addReview(draft) {
    const u = user(); if (!u) return null;
    const { breakdown, total } = reviewPoints(draft);
    const recent = u.reviews.find((r) => r.restaurant.id === draft.restaurant.id && r.rewarded && Date.now() - r.createdAt < 30 * DAY);
    const rewarded = !recent;
    const pts = rewarded ? total : 0;
    const review = {
      id: uid(), restaurant: draft.restaurant, rating: draft.rating, items: draft.items, photos: draft.photos,
      atmosphere: draft.atmosphere, back: draft.back, date: draft.date, pointsAwarded: pts, possible: total, breakdown, rewarded, createdAt: Date.now(),
    };
    u.reviews.unshift(review);
    credit(u, pts, `Review: ${draft.restaurant.name}`);
    // auto-add to "Been" without paying list points again (the review already paid for this info)
    const been = u.lists.find((l) => l.type === 'been');
    if (been && !been.items.find((i) => i.restaurant.id === draft.restaurant.id)) {
      const entry = {
        restaurant: draft.restaurant, rating: draft.rating, note: '', photo: (draft.photos || [])[0] || '', tags: [], dishes: (draft.items || []).slice(0, 3), addedAt: Date.now(),
      };
      entry.points = entryPoints(entry).total;
      been.items.unshift(entry);
      awardPlace(u, draft.restaurant.id, entryPoints(entry).breakdown, true);
    }
    const ok = save();
    return { review, ok, rewarded, awarded: pts, possible: total, breakdown };
  }

  const findList = (u, id) => u.lists.find((l) => l.id === id);
  function createList(name) {
    const u = user(); if (!u) return null;
    name = String(name || '').trim().slice(0, 40); if (!name) return null;
    const l = { id: uid(), name, type: 'custom', items: [] };
    u.lists.push(l); save(); return l;
  }
  function renameList(id, name) {
    const u = user(); const l = u && findList(u, id); name = String(name || '').trim().slice(0, 40);
    if (!l || l.type !== 'custom' || !name) return false; l.name = name; save(); return true;
  }
  function deleteList(id) {
    const u = user(); const l = u && findList(u, id);
    if (!l || l.type !== 'custom') return false;
    u.lists = u.lists.filter((x) => x.id !== id); save(); return true;
  }
  function addToList(listId, restaurant) {
    const u = user(); const l = u && findList(u, listId); if (!l) return { error: 'no-list' };
    if (l.items.find((i) => i.restaurant.id === restaurant.id)) return { error: 'exists' };
    const entry = { restaurant, rating: 0, note: '', photo: '', tags: [], dishes: [], addedAt: Date.now() };
    const ep = entryPoints(entry); entry.points = ep.total;
    l.items.unshift(entry);
    const pts = awardPlace(u, restaurant.id, ep.breakdown);
    credit(u, pts, `Added to ${l.name}: ${restaurant.name}`);
    // keep entry.points in sync with what the user has banked for this place
    entry.points = placeBanked(u, restaurant.id);
    save();
    return { awarded: pts, entry };
  }
  const placeBanked = (u, id) => Math.min(LIST_PLACE_MAX, sum(u.placePoints[id] || {}));
  function updateEntry(listId, restId, patch) {
    const u = user(); const l = u && findList(u, listId); const e = l && l.items.find((i) => i.restaurant.id === restId);
    if (!e) return { error: 'missing' };
    Object.assign(e, patch);
    const ep = entryPoints(e);
    const pts = awardPlace(u, restId, ep.breakdown);
    credit(u, pts, `List details: ${e.restaurant.name}`);
    u.lists.forEach((li) => li.items.forEach((it) => { if (it.restaurant.id === restId) it.points = placeBanked(u, restId); }));
    const ok = save();
    return { awarded: pts, entry: e, ok };
  }
  function removeFromList(listId, restId) {
    const u = user(); const l = u && findList(u, listId); if (!l) return false;
    l.items = l.items.filter((i) => i.restaurant.id !== restId); save(); return true;
  }
  function moveToBeen(listId, restId) {
    const u = user(); const from = u && findList(u, listId); const been = u && u.lists.find((l) => l.type === 'been');
    if (!from || !been) return false;
    const e = from.items.find((i) => i.restaurant.id === restId); if (!e) return false;
    if (!been.items.find((i) => i.restaurant.id === restId)) been.items.unshift(e);
    from.items = from.items.filter((i) => i.restaurant.id !== restId);
    save(); return true;
  }

  function attendEvent(ev) {
    const u = user(); if (!u) return { error: 'no-user' };
    if (db.selections.find((s) => s.userKey === db.current && s.eventId === ev.id)) return { error: 'already' };
    if (balance(u) < ev.cost) return { error: 'short', need: ev.cost - balance(u) };
    u.spent += ev.cost;
    u.ledger.unshift({ t: Date.now(), label: `Event: ${ev.title}`, pts: -ev.cost });
    db.selections.unshift({ id: uid(), userKey: db.current, user: u.name, eventId: ev.id, title: ev.title, city: ev.city, cost: ev.cost, t: Date.now() });
    save();
    return { ok: true };
  }

  const allReviews = () => Object.values(db.users).flatMap((u) => u.reviews.map((r) => ({ ...r, userName: u.name }))).sort((a, b) => b.createdAt - a.createdAt);
  function avgRating(restId) {
    const rs = allReviews().filter((r) => r.restaurant.id === restId && r.rating > 0);
    if (!rs.length) return null;
    return { avg: rs.reduce((a, r) => a + r.rating, 0) / rs.length, n: rs.length };
  }

  window.Points = { REVIEW_MAX, LIST_PLACE_MAX, REVIEW_LABELS, REVIEW_SECTION_MAX, LIST_LABELS, LIST_SECTION_MAX, reviewPoints, entryPoints, validDate, todayISO };
  window.Store = {
    user, balance, signIn, signOut, addReview, createList, renameList, deleteList, addToList, updateEntry, removeFromList, moveToBeen,
    attendEvent, allReviews, avgRating, placeBanked,
    selections: () => db.selections, users: () => Object.values(db.users), exportRoster: () => JSON.stringify(db.selections, null, 2),
  };
})();
