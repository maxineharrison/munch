/* munch — UI, routing and interactions */
(function () {
  const D = window.MUNCH_DATA, P = window.Points, St = window.Store, Snd = window.Sound;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const view = $('#view');
  const ICON_SOUND = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/></svg>';
  const ICON_MUTE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M17 9l5 6M22 9l-5 6"/></svg>';

  const REG = {};
  const reg = (r) => { REG[r.id] = r; return r; };
  D.RESTAURANTS.forEach(reg);
  const S = { draft: null, step: 0, listId: null, evCity: 'All', chip: 'all', cur: 'home' };

  // ---------- small helpers ----------
  const parseLocal = (iso) => { const [y, m, d] = String(iso).split('-').map(Number); return new Date(y, m - 1, d); };
  const fmtDay = (iso) => (iso ? parseLocal(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : '');
  const fmtEvent = (iso) => new Date(iso).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' }) + ' · ' + new Date(iso).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  const pic = (r, w = 600) => `<img src="${esc(D.photoFor(r, w))}" alt="" loading="lazy" onerror="this.style.display='none'">`;
  const cuisineLabel = (r) => D.prettyCuisine(r.cuisine) || 'Restaurant';

  function starsHTML(rating, small) {
    const pct = Math.max(0, Math.min(5, rating || 0)) / 5 * 100;
    return `<span class="stars ${small ? 'sm' : ''}" aria-label="${rating || 0} out of 5 stars"><span class="stars-bg">★★★★★</span><span class="stars-fg" style="width:${pct}%">★★★★★</span></span>`;
  }
  function bindStars(el, initial, onChange) {
    let val = initial || 0;
    const fg = $('.stars-fg', el);
    const paint = (v) => { fg.style.width = (v / 5 * 100) + '%'; };
    const fromEvent = (e) => { const r = el.getBoundingClientRect(); const pos = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)); return Math.max(0.5, Math.ceil(pos * 10) / 2); };
    el.setAttribute('role', 'slider'); el.tabIndex = 0;
    el.setAttribute('aria-valuemin', '0'); el.setAttribute('aria-valuemax', '5'); el.setAttribute('aria-valuenow', String(val));
    el.addEventListener('pointermove', (e) => paint(fromEvent(e)));
    el.addEventListener('pointerleave', () => paint(val));
    const set = (v, e) => { val = v; paint(v); el.setAttribute('aria-valuenow', String(v)); Snd.star(v); if (e) sparkle(e.clientX, e.clientY); onChange(v); };
    el.addEventListener('click', (e) => set(fromEvent(e), e));
    el.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { e.preventDefault(); set(Math.min(5, (val || 0) + 0.5)); }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { e.preventDefault(); set(Math.max(0.5, (val || 1) - 0.5)); }
    });
  }
  function sparkle(x, y) {
    if (reduce) return;
    for (let i = 0; i < 9; i++) {
      const s = document.createElement('span'); s.className = 'sparkle'; s.style.background = ['#e8b04a', '#ff5a3c', '#f5ede3'][i % 3];
      s.style.left = x + 'px'; s.style.top = y + 'px';
      const a = (Math.PI * 2 * i) / 9; s.style.setProperty('--dx', Math.cos(a) * 60 + 'px'); s.style.setProperty('--dy', Math.sin(a) * 60 + 'px');
      document.body.appendChild(s); setTimeout(() => s.remove(), 850);
    }
  }
  function confetti(n) {
    if (reduce) return;
    const c = $('#confetti'), ctx = c.getContext('2d'); c.width = innerWidth; c.height = innerHeight;
    const cols = ['#ff5a3c', '#e8b04a', '#f5ede3', '#8dbb7a'];
    const ps = Array.from({ length: n || 110 }, () => ({ x: innerWidth / 2 + (Math.random() - 0.5) * 240, y: innerHeight * 0.4, vx: (Math.random() - 0.5) * 17, vy: -Math.random() * 16 - 4, w: 5 + Math.random() * 6, h: 9 + Math.random() * 9, r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.3, c: cols[Math.floor(Math.random() * cols.length)] }));
    let f = 0;
    (function tick() {
      ctx.clearRect(0, 0, c.width, c.height);
      ps.forEach((p) => { p.vy += 0.45; p.x += p.vx; p.y += p.vy; p.r += p.vr; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.fillStyle = p.c; ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); ctx.restore(); });
      if (++f < 140) requestAnimationFrame(tick); else ctx.clearRect(0, 0, c.width, c.height);
    })();
  }
  function toast(html) {
    const t = document.createElement('div'); t.className = 'toast'; t.innerHTML = html; $('#toasts').appendChild(t); setTimeout(() => t.remove(), 3100);
  }
  function modal(html, wide) {
    closeModal();
    const back = document.createElement('div'); back.className = 'modal-back';
    back.innerHTML = `<div class="modal ${wide ? 'wide' : ''}" role="dialog" aria-modal="true"><button class="icon-btn close" data-action="close-modal" aria-label="Close">✕</button>${html}</div>`;
    back.addEventListener('mousedown', (e) => { if (e.target === back) closeModal(); });
    $('#modalRoot').appendChild(back);
    const f = $('input,textarea', back); if (f) setTimeout(() => f.focus(), 60);
    return $('.modal', back);
  }
  function closeModal() { $('#modalRoot').innerHTML = ''; }
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

  function animateNumber(el, from, to) {
    if (reduce || from === to) { el.textContent = to; return; }
    const t0 = performance.now(), dur = 800;
    (function step(t) { const k = Math.min(1, (t - t0) / dur); el.textContent = Math.round(from + (to - from) * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(step); })(t0);
  }
  let shownPts = 0;
  function updateHeader(bump) {
    const u = St.user(); const bal = St.balance(u);
    animateNumber($('#ptsNum'), shownPts, bal); shownPts = bal;
    if (bump) { const c = $('#ptsChip'); c.classList.remove('bump'); void c.offsetWidth; c.classList.add('bump'); }
    $('#userBtn').innerHTML = u ? `<span class="u-av">${esc(u.name[0].toUpperCase())}</span><span class="u-label">${esc(u.name)}</span>` : 'Sign in';
    $('#soundBtn').innerHTML = Snd.isMuted() ? ICON_MUTE : ICON_SOUND;
  }
  const savedOK = (ok) => { if (ok === false) toast(' Storage is full. Try smaller or fewer photos.'); };

  // ---------- accounts ----------
  function ensureUser(cb) { if (St.user()) cb(); else openSignIn(cb); }
  function openSignIn(cb) {
    const m = modal(`<h2>Join munch </h2><p class="muted">Free account — just your name. It tracks your points, lists and the events you pick.</p>
      <form id="signForm" class="field"><label for="nm">Your name</label><input id="nm" type="text" maxlength="30" placeholder="e.g. Maxine" required autocomplete="given-name">
      <div class="row" style="margin-top:16px"><button class="btn" data-snd="pop">Let's munch →</button></div></form>`);
    $('#signForm', m).addEventListener('submit', (e) => {
      e.preventDefault();
      const r = St.signIn($('#nm', m).value); if (!r) return;
      closeModal(); updateHeader(); Snd.coin();
      toast(r.created ? `Welcome, <b>${esc(r.user.name)}</b>! ` : `Welcome back, <b>${esc(r.user.name)}</b> `);
      if (cb) cb(); else render();
    });
  }
  function userMenu() {
    const u = St.user(); if (!u) return openSignIn();
    modal(`<h2>Hi ${esc(u.name)} </h2><p class="muted">You have <b>${St.balance(u)} pts</b> to spend.</p>
      <div class="row"><a class="btn" href="#/profile" data-action="close-modal">View profile</a><button class="btn ghost" data-action="signout">Switch / sign out</button></div>`);
  }
  const gate = (msg) => `<div class="empty card"><div class="big"></div><h2>${msg}</h2><p>Create a free account with just your name.</p><button class="btn" data-action="user" data-snd="pop">Sign in / join</button></div>`;

  // ---------- restaurant search ----------
  const OK_TYPES = new Set(['restaurant', 'cafe', 'bar', 'pub', 'fast_food', 'food_court', 'ice_cream', 'biergarten', 'bakery', 'deli', 'confectionery']);
  const remoteCache = new Map();
  async function remoteSearch(q) {
    if (remoteCache.has(q)) return remoteCache.get(q);
    try {
      const run = async (query) => {
        const url = 'https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&extratags=1&limit=12&accept-language=en&q=' + encodeURIComponent(query);
        const res = await fetch(url, { headers: { Accept: 'application/json' } });
        if (!res.ok) throw new Error('bad');
        return (await res.json()).filter((x) => OK_TYPES.has(x.type));
      };
      let data = await run(q);
      const words = q.split(/\s+/);
      if (!data.length && words.length >= 3) { // OSM search is strict: retry once without the last word (usually the city)
        await new Promise((r) => setTimeout(r, 1100));
        data = await run(words.slice(0, -1).join(' '));
      }
      const out = data.map((x) => {
        const a = x.address || {}, ex = x.extratags || {};
        const parts = String(x.display_name).split(',').map((s) => s.trim());
        return {
          id: 'osm-' + String(x.osm_type || 'n')[0] + x.osm_id, name: x.name || parts[0],
          address: parts.slice(1, 5).join(', '), city: a.city || a.town || a.village || a.municipality || a.suburb || a.county || '', country: a.country || '',
          lat: +x.lat, lng: +x.lon, cuisine: ex.cuisine || x.type, website: ex.website || ex['contact:website'] || '', source: 'osm', sig: [],
        };
      });
      remoteCache.set(q, out); return out;
    } catch (e) { return null; }
  }
  function localSearch(q) {
    const words = q.toLowerCase().split(/\s+/).filter(Boolean);
    return D.RESTAURANTS.filter((r) => { const hay = (r.name + ' ' + r.address + ' ' + r.cuisine).toLowerCase(); return words.every((w) => hay.includes(w)); });
  }
  function mountSearch(root, opts) {
    root.innerHTML = `<div class="search"><span class="search-ic" aria-hidden="true"></span><input type="search" placeholder="${esc(opts.placeholder || 'Search a restaurant, e.g. Padella London')}" autocomplete="off" aria-label="Search restaurants"><div class="search-results" hidden></div></div>`;
    const input = $('input', root), box = $('.search-results', root);
    let timer, reqId = 0, items = [];
    const paint = (list, status) => {
      items = list; box.hidden = false;
      box.innerHTML = list.map((r, i) => `<button type="button" class="sr-item" data-i="${i}"><img src="${esc(D.photoFor(r, 120))}" alt="" onerror="this.style.visibility='hidden'"><span><b>${esc(r.name)}</b><small>${esc([cuisineLabel(r), r.address].filter(Boolean).join(' · '))}</small></span></button>`).join('') + (status ? `<div class="sr-note">${status}</div>` : '');
    };
    input.addEventListener('input', () => {
      const q = input.value.trim(); clearTimeout(timer);
      if (q.length < 2) { box.hidden = true; return; }
      const local = localSearch(q); paint(local, ' Searching restaurants worldwide…');
      timer = setTimeout(async () => {
        const id = ++reqId; const remote = await remoteSearch(q); if (id !== reqId) return;
        if (remote === null) return paint(local, local.length ? "Couldn't reach worldwide search. Showing popular places." : "Couldn't reach worldwide search. Check your connection.");
        const seen = new Set(local.map((r) => r.name.toLowerCase())); const merged = local.concat(remote.filter((r) => !seen.has(r.name.toLowerCase())));
        paint(merged, merged.length ? 'Not here? Add the city to your search.' : 'No matches. Try adding the city, e.g. “Nando\'s Soho”.');
      }, 650);
    });
    box.addEventListener('click', (e) => {
      const b = e.target.closest('.sr-item'); if (!b) return;
      const r = reg(items[+b.dataset.i]); box.hidden = true; Snd.pop(); opts.onPick(r);
    });
    document.addEventListener('click', (e) => { if (!root.contains(e.target)) box.hidden = true; });
    return input;
  }

  // ---------- restaurant cards / info ----------
  function rCard(r) {
    const avg = St.avgRating(r.id);
    return `<article class="card r-card tilt"><div class="pic">${pic(r)}</div><div class="body">
      <h3>${esc(r.name)}</h3><p class="muted small" style="margin-bottom:10px"> ${esc(r.city)}${r.country ? ', ' + esc(r.country) : ''}</p>
      <div class="row between"><span class="tag">${esc(cuisineLabel(r))}</span>${avg ? `<span class="row" style="gap:6px">${starsHTML(avg.avg, true)}<b class="small">${avg.avg.toFixed(1)}</b></span>` : '<span class="muted small">Be the first to review</span>'}</div>
      <div class="row" style="margin-top:14px"><button class="btn sm" data-action="review-place" data-id="${esc(r.id)}" data-snd="pop">Review</button><button class="btn sm ghost" data-action="add-list" data-id="${esc(r.id)}" data-snd="pop">+ List</button><button class="btn sm ghost" data-action="place-info" data-id="${esc(r.id)}">Info</button></div></div></article>`;
  }
  const mapLink = (r) => (r.lat ? `https://www.openstreetmap.org/?mlat=${r.lat}&mlon=${r.lng}#map=17/${r.lat}/${r.lng}` : '');
  const mapEmbed = (r) => (r.lat ? `https://www.openstreetmap.org/export/embed.html?bbox=${r.lng - 0.004}%2C${r.lat - 0.0025}%2C${r.lng + 0.004}%2C${r.lat + 0.0025}&layer=mapnik&marker=${r.lat}%2C${r.lng}` : '');
  function placeInfo(r) {
    const avg = St.avgRating(r.id);
    modal(`<div class="card" style="margin-bottom:16px"><div class="r-card"><div class="pic" style="aspect-ratio:16/8">${pic(r, 900)}</div></div></div>
      <h2>${esc(r.name)}</h2><p class="muted"> ${esc(r.address || r.city)}</p>
      <div class="row" style="margin-bottom:12px"><span class="tag">${esc(cuisineLabel(r))}</span>${avg ? `<span class="tag must">★ ${avg.avg.toFixed(1)} · ${avg.n} munch review${avg.n > 1 ? 's' : ''}</span>` : ''}${r.website ? `<a class="tag green" href="${esc(r.website)}" target="_blank" rel="noopener">Website ↗</a>` : ''}${mapLink(r) ? `<a class="tag" href="${mapLink(r)}" target="_blank" rel="noopener">Map ↗</a>` : ''}</div>
      <h3>Popular things to order</h3><p class="muted small">Suggestions based on the cuisine and well-known dishes.</p>
      <div class="chips" style="margin-bottom:18px">${D.suggestDishes(r).slice(0, 8).map((d) => `<span class="tag">${esc(d)}</span>`).join('')}</div>
      <div class="row"><button class="btn" data-action="review-place" data-id="${esc(r.id)}"> Review it</button><button class="btn ghost" data-action="add-list" data-id="${esc(r.id)}">+ Add to a list</button></div>`, true);
  }
  function addToListModal(r) {
    ensureUser(() => {
      const u = St.user();
      modal(`<h2>Add to a list</h2><p class="muted">${esc(r.name)} · each place can earn up to <b>12 pts</b> in your lists.</p>
        <div class="stack" id="pickList">${u.lists.map((l, i) => `<label class="list-pill" style="cursor:pointer"><span><input type="radio" name="lst" value="${l.id}" ${i === 1 ? 'checked' : ''}> ${esc(l.name)}</span><small>${l.items.length} places</small></label>`).join('')}</div>
        <div class="row" style="margin-top:18px"><button class="btn" id="confirmAdd" data-snd="pop">Add place</button></div>`);
      $('#confirmAdd').addEventListener('click', () => {
        const id = ($('input[name=lst]:checked') || {}).value; if (!id) return;
        const res = St.addToList(id, r);
        closeModal();
        if (res.error === 'exists') return toast('Already on that list ');
        Snd.coin(); updateHeader(true);
        toast(res.awarded ? `Added! <b>+${res.awarded} pt</b> — add details in Lists to earn up to 12` : 'Added to your list ✓');
        if (S.cur === 'lists') render();
      });
    });
  }

  // ---------- HOME ----------
  function viewHome() {
    const list = D.RESTAURANTS.filter((r) => S.chip === 'all' || D.cuisineKey(r.cuisine) === S.chip);
    const recent = St.allReviews().slice(0, 6);
    view.innerHTML = `
      <section class="hero">
        <div>
          <span class="eyebrow">Restaurant ratings, worldwide</span>
          <h1>Every great meal, <em>remembered.</em></h1>
          <p class="lead">Rate the places you eat and drink, build your lists, and turn your points into evenings worth showing up for.</p>
          <div id="homeSearch" style="max-width:520px"></div>
          <div class="hero-cta"><a class="btn" href="#/review" data-snd="munch">Write a review</a><a class="btn ghost" href="#/events" data-snd="pop">Explore events</a></div>
        </div>
        <div class="collage" aria-hidden="true">
          <div class="ph p1"><img src="${D.imgUrl('plated', 700)}" alt=""></div>
          <div class="ph p2"><img src="${D.imgUrl('cocktails', 600)}" alt=""></div>
          <div class="ph p3"><img src="${D.imgUrl('pizza', 600)}" alt=""></div>
          <span class="badge-float b1">+20 pts / review</span><span class="badge-float b2">★ 4.5</span><span class="badge-float b3"> Cheers!</span>
        </div>
      </section>
      <section class="section"><div class="section-head"><div><h2>How munch works</h2><p>Three simple steps.</p></div></div>
        <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(230px,1fr))">
          <div class="card step-card tilt"><div class="n">1</div><h3>Review</h3><p class="muted">Find the place, rate it, tell us what you ate, add photos and the vibe. Up to <b>20 pts</b> per review.</p></div>
          <div class="card step-card tilt"><div class="n">2</div><h3>Collect</h3><p class="muted">Build lists of places you've been and want to try. Each place earns up to <b>12 pts</b>.</p></div>
          <div class="card step-card tilt"><div class="n">3</div><h3>Spend</h3><p class="muted">Use your points on showcase food &amp; drink events in Cape Town, London and Paris.</p></div>
        </div></section>
      <section class="section"><div class="section-head"><div><h2>Popular spots</h2><p>Starter places from around the world. Search above for any restaurant.</p></div></div>
        <div class="chips" style="margin-bottom:20px">${D.HOME_CHIPS.map(([k, l]) => `<button class="chip ${S.chip === k ? 'on' : ''}" data-action="chip" data-k="${k}" data-snd="pop">${l}</button>`).join('')}</div>
        <div class="grid">${list.map(rCard).join('') || '<p class="muted">Nothing here yet.</p>'}</div></section>
      ${recent.length ? `<section class="section"><div class="section-head"><h2>Fresh reviews</h2></div><div class="grid">${recent.map((r) => `<article class="card tilt" style="padding:18px"><div class="row between"><b>${esc(r.userName)}</b><span class="muted small">${fmtDay(r.date) || 'recently'}</span></div><h3 style="margin-top:6px">${esc(r.restaurant.name)}</h3>${starsHTML(r.rating, true)}${r.items.length ? `<p class="muted small" style="margin-top:8px">Had: ${esc(r.items.slice(0, 3).join(', '))}</p>` : ''}</article>`).join('')}</div></section>` : ''}`;
    mountSearch($('#homeSearch'), { placeholder: 'Search any restaurant…', onPick: placeInfo });
  }

  // ---------- REVIEW ----------
  const STEPS = ['Find', 'Rate', 'Had', 'Photos', 'Vibe', 'Return', 'When', 'Done'];
  const newDraft = () => ({ restaurant: null, rating: 0, items: [], photos: [], atmosphere: [], back: '', date: '' });
  function fileToDataURL(file, max) {
    return new Promise((resolve, reject) => {
      const fr = new FileReader();
      fr.onload = () => { const im = new Image(); im.onload = () => { const k = Math.min(1, (max || 900) / Math.max(im.width, im.height)); const c = document.createElement('canvas'); c.width = Math.round(im.width * k); c.height = Math.round(im.height * k); c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); resolve(c.toDataURL('image/jpeg', 0.72)); }; im.onerror = reject; im.src = fr.result; };
      fr.onerror = reject; fr.readAsDataURL(file);
    });
  }
  async function readFiles(files, room) {
    const out = [];
    for (const f of Array.from(files).slice(0, room)) {
      if (!/^image\//.test(f.type)) { toast('Only image files please '); continue; }
      if (f.size > 15 * 1024 * 1024) { toast('That photo is over 15MB'); continue; }
      try { out.push(await fileToDataURL(f)); } catch (e) { toast("Couldn't read that photo"); }
    }
    return out;
  }
  function bindDrop(label, onFiles) {
    const input = $('input[type=file]', label);
    input.addEventListener('change', () => { onFiles(input.files); input.value = ''; });
    ['dragover', 'dragenter'].forEach((ev) => label.addEventListener(ev, (e) => { e.preventDefault(); label.classList.add('over'); }));
    ['dragleave', 'drop'].forEach((ev) => label.addEventListener(ev, () => label.classList.remove('over')));
    label.addEventListener('drop', (e) => { e.preventDefault(); onFiles(e.dataTransfer.files); });
  }
  function dishPicker(r, items, onChange, max) {
    // returns html; binding done by bindDishPicker
    const sugg = D.suggestDishes(r);
    return `<div class="chips" id="dishSugg" style="margin:10px 0">${sugg.map((d) => `<button type="button" class="chip ${items.includes(d) ? 'on green' : ''}" data-dish="${esc(d)}">${items.includes(d) ? '✓ ' : '+ '}${esc(d)}</button>`).join('')}</div>
      <div class="field"><label for="dishIn">Add your own</label><div class="row"><input id="dishIn" type="text" maxlength="50" placeholder="e.g. Truffle fries" style="flex:1;min-width:180px"><button type="button" class="btn sm" id="dishAdd">Add</button></div></div>
      <div class="chips" id="dishSel">${items.filter((d) => !sugg.includes(d)).map((d) => `<button type="button" class="chip on green" data-dish="${esc(d)}">${esc(d)} <span class="x">✕</span></button>`).join('')}</div>`;
  }
  function bindDishPicker(root, items, onChange, max) {
    const toggle = (d) => { const i = items.indexOf(d); if (i >= 0) items.splice(i, 1); else if (items.length < (max || 12)) items.push(d); else toast(`Max ${max || 12} items`); Snd.pop(); onChange(); };
    $$('[data-dish]', root).forEach((b) => b.addEventListener('click', () => toggle(b.dataset.dish)));
    const add = () => { const inp = $('#dishIn', root); const v = inp.value.trim(); if (!v) return; if (!items.includes(v) && items.length < (max || 12)) items.push(v); Snd.pop(); onChange(true); };
    $('#dishAdd', root).addEventListener('click', add);
    $('#dishIn', root).addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } });
  }

  function viewReview() {
    if (!S.draft) S.draft = newDraft();
    const d = S.draft, step = S.step, r = d.restaurant;
    const live = P.reviewPoints(d);
    const pct = (step / (STEPS.length - 1)) * 100;
    let body = '';
    if (step === 0) {
      body = `<h2>Where did you go? </h2><p class="muted">Search for the restaurant, café or bar, then tap it.</p><div id="rvSearch"></div>
        ${r ? `<div class="selected-place card" style="padding:14px"><div class="sp-pic">${pic(r, 400)}</div><div class="sp-info"><span class="tag green">✓ Selected</span><h3 style="margin-top:6px">${esc(r.name)}</h3><p class="muted small"> ${esc(r.address || r.city)}</p><span class="tag">${esc(cuisineLabel(r))}</span> <button class="btn sm ghost" data-action="change-place">Change</button></div>${mapEmbed(r) ? `<iframe class="map-frame" loading="lazy" title="Map" src="${mapEmbed(r)}"></iframe>` : ''}</div>` : ''}`;
    } else if (step === 1) {
      body = `<h2>How was it? </h2><p class="muted">${esc(r.name)} · tap a star (half stars welcome). <span class="tag must">3 pts</span></p><div style="text-align:center;padding:26px 0"><div id="starPick">${starsHTML(d.rating)}</div><p class="step-pts" style="font-size:1.4rem;margin-top:10px">${d.rating ? d.rating.toFixed(1) + ' / 5' : 'Tap to rate'}</p></div>`;
    } else if (step === 2) {
      body = `<h2>What did you have? </h2><p class="muted">Tap suggestions or add your own. <span class="tag must">up to 5 pts</span> (2 for the first, +1 each up to 4 items)</p>${dishPicker(r, d.items)}`;
    } else if (step === 3) {
      body = `<h2>Show us! </h2><p class="muted">Food, drinks, the room, the view. <span class="tag must">1 pt per photo, up to 5</span></p>
        <label class="drop" id="drop"><input type="file" accept="image/*" multiple hidden><div style="font-size:2.4rem"></div><b>Tap to add photos</b><div class="muted small">or drag &amp; drop · ${d.photos.length}/5 added</div></label>
        <div class="thumbs">${d.photos.map((p, i) => `<div class="thumb"><img src="${p}" alt="Your photo ${i + 1}"><button data-action="rm-photo" data-i="${i}" aria-label="Remove photo">✕</button></div>`).join('')}</div>`;
    } else if (step === 4) {
      body = `<h2>What was the vibe? </h2><p class="muted">Pick as many as fit. <span class="tag must">2 pts, +1 for 3 or more</span></p><div class="chips">${D.ATMOSPHERE.map(([n, e]) => `<button type="button" class="chip ${d.atmosphere.includes(n) ? 'on' : ''}" data-atm="${esc(n)}">${e} ${esc(n)}</button>`).join('')}</div>`;
    } else if (step === 5) {
      body = `<h2>Would you go back? </h2><p class="muted">Be honest. <span class="tag must">2 pts</span></p><div class="big-choices">${D.GO_BACK.map((g) => `<button type="button" class="big-choice ${d.back === g.v ? 'on' : ''}" data-back="${g.v}"><span class="e">${g.emoji}</span>${g.label}</button>`).join('')}</div>`;
    } else if (step === 6) {
      body = `<h2>When did you go? </h2><p class="muted">Pick the day of your visit. <span class="tag must">2 pts</span></p>
        <div class="field"><label for="visit">Visit date</label><input id="visit" type="date" max="${P.todayISO()}" value="${esc(d.date)}"></div>
        <div class="chips"><button type="button" class="chip" data-quick="0">Today</button><button type="button" class="chip" data-quick="1">Yesterday</button><button type="button" class="chip" data-quick="7">Last week</button></div>`;
    } else {
      const u = St.user();
      const recent = u && r && u.reviews.find((x) => x.restaurant.id === r.id && x.rewarded && Date.now() - x.createdAt < 30 * 86400000);
      body = `<h2>Ready to munch? </h2><p class="muted">Here's your review of <b>${esc(r.name)}</b> ${starsHTML(d.rating, true)}</p>
        ${recent ? '<p class="hint"> You already earned points for this place in the last 30 days, so this review will earn <b>0 pts</b> (it still saves).</p>' : ''}
        <table class="breakdown">${Object.keys(P.REVIEW_LABELS).map((k) => `<tr><td>${P.REVIEW_LABELS[k]}</td><td><span class="bar-mini"><i style="width:${live.breakdown[k] / P.REVIEW_SECTION_MAX[k] * 100}%"></i></span>${live.breakdown[k]} / ${P.REVIEW_SECTION_MAX[k]}</td></tr>`).join('')}<tr class="total"><td>Total</td><td>${recent ? 0 : live.total} / ${P.REVIEW_MAX}</td></tr></table>
        ${!d.rating ? '<p class="hint">Please add a star rating first.</p>' : ''}`;
    }
    const canNext = step === 0 ? !!r : step === 1 ? d.rating > 0 : true;
    view.innerHTML = `<div class="wizard">
      <div class="wiz-top"><span class="pts-chip" style="box-shadow:0 3px 0 #d99708"> <span>${live.total}</span> / ${P.REVIEW_MAX} pts</span><div class="progress" role="progressbar" aria-valuenow="${Math.round(pct)}" aria-valuemin="0" aria-valuemax="100"><i style="width:${pct}%"></i></div><span class="muted small">${step + 1}/${STEPS.length}</span></div>
      <div class="card wiz-card">${body}
        <div class="wiz-actions"><button class="btn ghost" data-action="prev" ${step === 0 ? 'style="visibility:hidden"' : ''}>← Back</button>
        ${step < STEPS.length - 1 ? `<button class="btn" data-action="next" ${canNext ? '' : 'disabled'} data-snd="pop">${step >= 2 && step <= 6 ? 'Next →' : 'Next →'}</button>` : `<button class="btn green" data-action="submit" ${d.rating ? '' : 'disabled'}> Submit &amp; munch!</button>`}</div>
      </div></div>`;
    bindReview(step);
  }
  function bindReview(step) {
    const d = S.draft;
    if (step === 0) {
      const inp = mountSearch($('#rvSearch'), { onPick: (r) => { d.restaurant = r; viewReview(); } });
      if (!d.restaurant) setTimeout(() => inp.focus(), 50);
    } else if (step === 1) {
      bindStars($('#starPick .stars'), d.rating, (v) => { d.rating = v; setTimeout(viewReview, 250); });
    } else if (step === 2) {
      bindDishPicker(view, d.items, (focus) => { viewReview(); if (focus) $('#dishIn').focus(); }, 12);
    } else if (step === 3) {
      bindDrop($('#drop'), async (files) => { const room = 5 - d.photos.length; if (room <= 0) return toast('Max 5 photos '); const add = await readFiles(files, room); if (add.length) { d.photos.push(...add); Snd.pop(); viewReview(); } });
    } else if (step === 4) {
      $$('[data-atm]').forEach((b) => b.addEventListener('click', () => { const n = b.dataset.atm; const i = d.atmosphere.indexOf(n); if (i >= 0) d.atmosphere.splice(i, 1); else d.atmosphere.push(n); Snd.pop(); viewReview(); }));
    } else if (step === 5) {
      $$('[data-back]').forEach((b) => b.addEventListener('click', () => { d.back = b.dataset.back; Snd.pop(); viewReview(); }));
    } else if (step === 6) {
      $('#visit').addEventListener('change', (e) => { const v = e.target.value; if (v && !P.validDate(v)) { toast('Pick a date that is today or earlier'); e.target.value = d.date; return; } d.date = v; Snd.pop(); viewReview(); });
      $$('[data-quick]').forEach((b) => b.addEventListener('click', () => { const dt = new Date(); dt.setDate(dt.getDate() - +b.dataset.quick); d.date = dt.getFullYear() + '-' + String(dt.getMonth() + 1).padStart(2, '0') + '-' + String(dt.getDate()).padStart(2, '0'); Snd.pop(); viewReview(); }));
    }
  }
  function submitReview() {
    const d = S.draft; if (!d || !d.restaurant || !d.rating) return toast('Add a restaurant and star rating first');
    ensureUser(() => {
      const res = St.addReview(d); if (!res) return;
      savedOK(res.ok);
      S.draft = null; S.step = 0;
      confetti(130); Snd.munch(); setTimeout(() => Snd.clink(), 520); setTimeout(() => Snd.fanfare(), 900);
      updateHeader(true);
      const rv = res.review;
      const m = modal(`<div style="text-align:center"><div style="font-size:3.4rem"></div><h2>${res.rewarded ? `+${res.awarded} points!` : 'Review saved'}</h2><p class="muted">${res.rewarded ? 'Thanks for munching with us.' : 'You already earned points for this place in the last 30 days.'}</p></div>
        <table class="breakdown">${Object.keys(P.REVIEW_LABELS).map((k) => `<tr><td>${P.REVIEW_LABELS[k]}</td><td>${res.rewarded ? rv.breakdown[k] : 0} / ${P.REVIEW_SECTION_MAX[k]}</td></tr>`).join('')}<tr class="total"><td>Total</td><td>${res.awarded} / ${P.REVIEW_MAX}</td></tr></table>
        <p class="small muted">${esc(rv.restaurant.name)} was added to your <b>Been</b> list.</p>
        <div class="row"><a class="btn" href="#/review" data-action="close-modal">Review another</a><a class="btn alt" href="#/events" data-action="close-modal">Spend points </a></div>`);
      render();
    });
  }

  // ---------- LISTS ----------
  function viewLists() {
    const u = St.user(); if (!u) { view.innerHTML = gate('Sign in to build your lists'); return; }
    if (!S.listId || !u.lists.find((l) => l.id === S.listId)) S.listId = u.lists[0].id;
    const l = u.lists.find((x) => x.id === S.listId);
    const isBeen = l.type === 'been';
    view.innerHTML = `<div class="section-head" style="margin-top:0"><div><h2>My lists </h2><p>Each place earns up to <b>12 pts</b>: add it (1), then rating (2), note (2), photo (2), tags (2) and dishes (3).</p></div><button class="btn" data-action="new-list" data-snd="pop">+ New list</button></div>
      <div class="lists-layout"><nav class="list-nav" aria-label="Your lists">${u.lists.map((x) => `<button class="list-pill ${x.id === l.id ? 'on' : ''}" data-action="pick-list" data-id="${x.id}" data-snd="tick"><span>${x.type === 'been' ? '' : x.type === 'toTry' ? '' : ''} ${esc(x.name)}</span><small>${x.items.length}</small></button>`).join('')}</nav>
      <section><div class="row between" style="margin-bottom:14px"><h2 style="margin:0">${esc(l.name)}</h2>${l.type === 'custom' ? `<div class="row"><button class="btn sm ghost" data-action="rename-list">Rename</button><button class="btn sm danger" data-action="delete-list">Delete</button></div>` : ''}</div>
      <div id="listSearch" style="margin-bottom:20px"></div>
      ${l.items.length ? `<div class="stack">${l.items.map((e) => { const pts = St.placeBanked(u, e.restaurant.id); return `<article class="card entry tilt">${e.photo ? `<img class="e-pic" src="${e.photo}" alt="">` : `<div class="e-pic" style="overflow:hidden">${pic(e.restaurant, 200)}</div>`}
        <div class="e-body"><h3>${esc(e.restaurant.name)}</h3><p class="muted small"> ${esc(e.restaurant.city || e.restaurant.address)} · ${esc(cuisineLabel(e.restaurant))}</p>${e.rating ? `<div>${starsHTML(e.rating, true)} <b class="small">${e.rating}</b></div>` : ''}${e.tags && e.tags.length ? `<div class="chips" style="margin-top:6px">${e.tags.map((t) => `<span class="tag">${esc(t)}</span>`).join('')}</div>` : ''}${e.note ? `<p class="small muted" style="margin:6px 0 0">“${esc(e.note)}”</p>` : ''}
        <div class="row" style="margin-top:10px"><button class="btn sm" data-action="edit-entry" data-id="${esc(e.restaurant.id)}" data-snd="pop">Add details</button><button class="btn sm ghost" data-action="review-place" data-id="${esc(e.restaurant.id)}">Review</button>${!isBeen ? `<button class="btn sm ghost" data-action="to-been" data-id="${esc(e.restaurant.id)}" data-snd="coin">✓ Been</button>` : ''}<button class="btn sm danger" data-action="rm-entry" data-id="${esc(e.restaurant.id)}">Remove</button></div></div>
        <div class="ring" style="--p:${pts / 12 * 100}" title="${pts} of 12 points"><b>${pts}/12</b></div></article>`; }).join('')}</div>` : `<div class="empty"><div class="big">${isBeen ? '' : ''}</div><h3>${isBeen ? 'No places yet' : 'This list is empty'}</h3><p>Search above to add your first place.</p></div>`}</section></div>`;
    (reg, mountSearch($('#listSearch'), { placeholder: 'Add a place to this list…', onPick: (r) => {
      const res = St.addToList(l.id, r);
      if (res.error === 'exists') return toast('Already on this list ');
      Snd.coin(); updateHeader(true); toast(res.awarded ? `Added! <b>+${res.awarded} pt</b>` : 'Added ✓ (points already earned for this place)'); viewLists();
    } }));
  }
  function textModal(title, label, value, cta, cb) {
    const m = modal(`<h2>${title}</h2><form class="field" id="tf"><label for="tv">${label}</label><input id="tv" type="text" maxlength="40" value="${esc(value)}" required><div class="row" style="margin-top:16px"><button class="btn" data-snd="pop">${cta}</button></div></form>`);
    $('#tf', m).addEventListener('submit', (e) => { e.preventDefault(); const v = $('#tv', m).value.trim(); if (v) { closeModal(); cb(v); } });
  }
  function entryModal(listId, restId) {
    const u = St.user(); const l = u.lists.find((x) => x.id === listId); const e = l.items.find((i) => i.restaurant.id === restId); if (!e) return;
    const ed = { rating: e.rating || 0, note: e.note || '', photo: e.photo || '', tags: [...(e.tags || [])], dishes: [...(e.dishes || [])] };
    const isToTry = l.type === 'toTry';
    const paint = (keepNote) => {
      const note = keepNote ? ($('#edNote') ? $('#edNote').value : ed.note) : ed.note; ed.note = note;
      const ep = P.entryPoints(ed);
      const m = modal(`<h2>${esc(e.restaurant.name)}</h2><p class="muted">Add details to earn up to <b>12 pts</b> for this place.</p>
        <div class="field"><label>${isToTry ? 'How excited are you?' : 'Your rating'} <span class="tag must">2 pts</span></label><div id="edStars">${starsHTML(ed.rating)}</div></div>
        <div class="field"><label for="edNote">Note <span class="tag must">2 pts · 10+ characters</span></label><textarea id="edNote" maxlength="240" placeholder="${isToTry ? 'Why do you want to go?' : 'What do you remember?'}">${esc(ed.note)}</textarea></div>
        <div class="field"><label>Photo <span class="tag must">2 pts</span></label><label class="drop" id="edDrop" style="padding:14px"><input type="file" accept="image/*" hidden>${ed.photo ? `<img src="${ed.photo}" alt="" style="max-height:120px;margin:0 auto;border-radius:12px">` : ' Tap to add a photo'}</label></div>
        <div class="field"><label>Tags <span class="tag must">2 pts</span></label><div class="chips">${D.LIST_TAGS.map((t) => `<button type="button" class="chip ${ed.tags.includes(t) ? 'on' : ''}" data-tag="${esc(t)}">${esc(t)}</button>`).join('')}</div></div>
        <div class="field"><label>${isToTry ? 'Dishes to try' : 'Dishes you had'} <span class="tag must">1 pt each, up to 3</span></label>${dishPicker(e.restaurant, ed.dishes)}</div>
        <div class="hint" style="margin:14px 0">This place: <b>${ep.total} / 12 pts</b> possible · banked so far: <b>${St.placeBanked(u, restId)}</b></div>
        <div class="row"><button class="btn green" id="edSave" data-snd="coin">Save details</button></div>`, true);
      bindStars($('#edStars .stars', m), ed.rating, (v) => { ed.rating = v; setTimeout(() => paint(true), 250); });
      bindDrop($('#edDrop', m), async (files) => { const a = await readFiles(files, 1); if (a.length) { ed.photo = a[0]; paint(true); } });
      $$('[data-tag]', m).forEach((b) => b.addEventListener('click', () => { const t = b.dataset.tag; const i = ed.tags.indexOf(t); if (i >= 0) ed.tags.splice(i, 1); else ed.tags.push(t); Snd.pop(); paint(true); }));
      bindDishPicker(m, ed.dishes, (focus) => { paint(true); if (focus) { const i = $('#dishIn'); if (i) i.focus(); } }, 10);
      $('#edSave', m).addEventListener('click', () => {
        ed.note = $('#edNote', m).value;
        const res = St.updateEntry(listId, restId, ed); closeModal(); savedOK(res.ok);
        updateHeader(!!res.awarded); toast(res.awarded ? `Saved! <b>+${res.awarded} pts</b>` : 'Saved ✓'); if (res.awarded) { Snd.clink(); confetti(40); }
        viewLists();
      });
    };
    paint(false);
  }

  // ---------- EVENTS ----------
  function viewEvents() {
    const u = St.user(); const cities = ['All', 'Cape Town', 'London', 'Paris'];
    const evs = D.EVENTS.filter((e) => S.evCity === 'All' || e.city === S.evCity);
    const going = new Set(St.selections().filter((s) => u && s.userKey === u.name.toLowerCase()).map((s) => s.eventId));
    const mine = D.EVENTS.filter((e) => going.has(e.id));
    view.innerHTML = `<div class="notice" role="note"><span class="big"></span><div><b>Showcase only — these aren't real events.</b> They're here to show what your points could unlock. No tickets are issued and nothing is booked, but your picks are saved against your name.</div></div>
      <div class="section-head" style="margin-top:30px"><div><h2>Events </h2><p>Spend your points on food &amp; drink experiences. ${u ? `You have <b>${St.balance(u)} pts</b>.` : 'Sign in with your name to pick events.'}</p></div></div>
      <div class="chips" style="margin-bottom:22px">${cities.map((c) => `<button class="chip ${S.evCity === c ? 'on' : ''}" data-action="ev-city" data-c="${c}" data-snd="pop">${c === 'All' ? ' All cities' : c}</button>`).join('')}</div>
      <div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(300px,1fr))">${evs.map((e) => `<article class="card ev-card tilt"><div class="pic"><img src="${D.imgUrl(e.image, 700)}" alt="" loading="lazy" onerror="this.style.display='none'"><span class="city"> ${e.city}</span><span class="showcase">Showcase</span><span class="cost">${e.cost} pts</span></div>
        <div class="body"><p class="muted small" style="margin-bottom:4px">${fmtEvent(e.date)}</p><h3>${e.emoji} ${esc(e.title)}</h3><p class="muted">${esc(e.blurb)}</p><b class="small">What's included</b><ul>${e.included.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>
        ${going.has(e.id) ? '<button class="btn green" disabled>✓ You picked this</button>' : `<button class="btn" data-action="attend" data-id="${e.id}" data-snd="pop">Attend · ${e.cost} pts</button>`}</div></article>`).join('')}</div>
      ${mine.length ? `<section class="section"><h2>My picks</h2><div class="row">${mine.map((e) => `<span class="badge">${e.emoji} ${esc(e.title)} · ${e.city}</span>`).join('')}</div></section>` : ''}
      <section class="section"><div class="section-head"><div><h2>Who picked what</h2><p>Every event pick is recorded against a name (stored on this device).</p></div><button class="btn sm ghost" data-action="export-roster">Export JSON</button></div>
        <div class="card" style="padding:8px 14px;overflow:auto">${St.selections().length ? `<table class="table"><tr><th>Name</th><th>Event</th><th>City</th><th>Points</th><th>When</th></tr>${St.selections().map((s) => `<tr><td><b>${esc(s.user)}</b></td><td>${esc(s.title)}</td><td>${esc(s.city)}</td><td>${s.cost}</td><td>${new Date(s.t).toLocaleString()}</td></tr>`).join('')}</table>` : '<p class="muted" style="padding:14px">No picks yet. Be the first!</p>'}</div></section>`;
  }
  function attend(id) {
    const ev = D.EVENTS.find((e) => e.id === id); if (!ev) return;
    ensureUser(() => {
      const u = St.user(); const bal = St.balance(u);
      if (bal < ev.cost) return modal(`<div style="text-align:center"><div style="font-size:3rem"></div><h2>Not enough points yet</h2><p class="muted">You need <b>${ev.cost - bal} more pts</b> for “${esc(ev.title)}”. Write a review to earn up to 20!</p><div class="row" style="justify-content:center"><a class="btn" href="#/review" data-action="close-modal">Write a review</a></div></div>`);
      modal(`<h2>${ev.emoji} ${esc(ev.title)}</h2><p class="muted">${ev.city} · ${fmtEvent(ev.date)}</p><p class="hint"> Reminder: this is a showcase event, not real. Your pick is saved against <b>${esc(u.name)}</b>.</p>
        <p>Cost: <b>${ev.cost} pts</b> · Balance after: <b>${bal - ev.cost} pts</b></p><div class="row"><button class="btn green" id="confirmAttend">Confirm &amp; clink </button><button class="btn ghost" data-action="close-modal">Cancel</button></div>`);
      $('#confirmAttend').addEventListener('click', () => {
        const res = St.attendEvent(ev); closeModal();
        if (res.error) return toast(res.error === 'already' ? 'You already picked this one' : 'Something went wrong');
        Snd.clink(); setTimeout(() => Snd.clink(), 300); confetti(90); updateHeader(true); toast(`Cheers, <b>${esc(u.name)}</b>! You picked ${esc(ev.title)}`); viewEvents();
      });
    });
  }

  // ---------- PROFILE ----------
  function viewProfile() {
    const u = St.user(); if (!u) { view.innerHTML = gate('Sign in to see your profile'); return; }
    const cities = new Set(); u.reviews.forEach((r) => r.restaurant.city && cities.add(r.restaurant.city)); u.lists.forEach((l) => l.items.forEach((i) => i.restaurant.city && cities.add(i.restaurant.city)));
    const photos = u.reviews.reduce((a, r) => a + r.photos.length, 0); const entries = u.lists.reduce((a, l) => a + l.items.length, 0);
    const picks = St.selections().filter((s) => s.userKey === u.name.toLowerCase()).length;
    const badges = [['', 'First Bite', u.reviews.length >= 1], ['', 'Regular (5 reviews)', u.reviews.length >= 5], ['', 'Globetrotter (3 cities)', cities.size >= 3], ['', 'Shutterbug (5 photos)', photos >= 5], ['', 'List Master (10 places)', entries >= 10], ['', 'Event Goer', picks >= 1]];
    view.innerHTML = `<div class="card profile-head"><div class="avatar">${esc(u.name[0].toUpperCase())}</div><div style="flex:1"><h2 style="margin:0">${esc(u.name)}</h2><p class="muted" style="margin:0">Munching since ${new Date(u.createdAt).toLocaleDateString()}</p></div><button class="btn ghost" data-action="signout">Switch / sign out</button></div>
      <div class="stats"><div class="stat"><b>${St.balance(u)}</b>points balance</div><div class="stat"><b>${u.earned}</b>earned</div><div class="stat"><b>${u.spent}</b>spent</div><div class="stat"><b>${u.reviews.length}</b>reviews</div><div class="stat"><b>${cities.size}</b>cities</div></div>
      <section class="section"><h2>Badges</h2><div class="row">${badges.map(([e, n, ok]) => `<span class="badge ${ok ? '' : 'locked'}">${e} ${n}</span>`).join('')}</div></section>
      <section class="section"><h2>My reviews</h2>${u.reviews.length ? `<div class="stack">${u.reviews.map((r) => `<article class="card entry"><div class="e-pic" style="overflow:hidden">${r.photos[0] ? `<img src="${r.photos[0]}" alt="" style="width:100%;height:100%;object-fit:cover">` : pic(r.restaurant, 200)}</div><div class="e-body"><h3>${esc(r.restaurant.name)}</h3>${starsHTML(r.rating, true)} <span class="muted small">${fmtDay(r.date) || ''}</span>${r.items.length ? `<p class="small muted" style="margin:4px 0 0">Had: ${esc(r.items.join(', '))}</p>` : ''}<div class="chips" style="margin-top:6px">${r.atmosphere.map((a) => `<span class="tag">${esc(a)}</span>`).join('')}${r.back ? `<span class="tag green">Go back: ${esc(r.back)}</span>` : ''}</div></div><span class="pts-chip">+${r.pointsAwarded}</span></article>`).join('')}</div>` : `<div class="empty"><div class="big"></div><p>No reviews yet.</p><a class="btn" href="#/review">Write your first review</a></div>`}</section>
      <section class="section"><h2>Points history</h2><div class="card" style="padding:8px 14px">${u.ledger.length ? `<table class="table">${u.ledger.slice(0, 25).map((l) => `<tr><td>${esc(l.label)}</td><td style="text-align:right;font-family:var(--display);color:${l.pts < 0 ? 'var(--tomato)' : 'var(--green)'}">${l.pts > 0 ? '+' : ''}${l.pts}</td></tr>`).join('')}</table>` : '<p class="muted" style="padding:14px">Nothing yet.</p>'}</div></section>`;
  }

  // ---------- actions & routing ----------
  const actions = {
    'close-modal': () => closeModal(),
    user: () => userMenu(),
    signout: () => { St.signOut(); closeModal(); S.listId = null; shownPts = St.balance(null); updateHeader(); toast('Signed out '); render(); },
    'review-place': (t) => { const r = REG[t.dataset.id]; if (!r) return; closeModal(); S.draft = newDraft(); S.draft.restaurant = r; S.step = 1; if (S.cur === 'review') render(); else location.hash = '#/review'; },
    'add-list': (t) => { const r = REG[t.dataset.id]; if (r) addToListModal(r); },
    'place-info': (t) => { const r = REG[t.dataset.id]; if (r) placeInfo(r); },
    chip: (t) => { S.chip = t.dataset.k; viewHome(); },
    next: () => { S.step = Math.min(STEPS.length - 1, S.step + 1); viewReview(); swapCard(); window.scrollTo({ top: 0, behavior: 'smooth' }); },
    prev: () => { S.step = Math.max(0, S.step - 1); viewReview(); swapCard(); },
    'change-place': () => { S.draft.restaurant = null; viewReview(); },
    'rm-photo': (t) => { S.draft.photos.splice(+t.dataset.i, 1); viewReview(); },
    submit: () => submitReview(),
    'pick-list': (t) => { S.listId = t.dataset.id; viewLists(); },
    'new-list': () => ensureUser(() => textModal('New list', 'List name', '', 'Create', (v) => { const l = St.createList(v); S.listId = l.id; Snd.coin(); toast(`Created <b>${esc(v)}</b>`); render(); })),
    'rename-list': () => { const u = St.user(); const l = u.lists.find((x) => x.id === S.listId); textModal('Rename list', 'List name', l.name, 'Save', (v) => { St.renameList(l.id, v); render(); }); },
    'delete-list': () => { const u = St.user(); const l = u.lists.find((x) => x.id === S.listId); modal(`<h2>Delete “${esc(l.name)}”?</h2><p class="muted">Points you've already earned stay yours.</p><div class="row"><button class="btn danger" id="yesDel">Delete list</button><button class="btn ghost" data-action="close-modal">Cancel</button></div>`); $('#yesDel').addEventListener('click', () => { St.deleteList(l.id); S.listId = null; closeModal(); render(); }); },
    'edit-entry': (t) => entryModal(S.listId, t.dataset.id),
    'to-been': (t) => { St.moveToBeen(S.listId, t.dataset.id); toast('Moved to <b>Been</b> ✓ — now write a review for up to 20 pts!'); viewLists(); },
    'rm-entry': (t) => { St.removeFromList(S.listId, t.dataset.id); viewLists(); },
    'ev-city': (t) => { S.evCity = t.dataset.c; viewEvents(); },
    attend: (t) => attend(t.dataset.id),
    'export-roster': () => { const b = new Blob([St.exportRoster()], { type: 'application/json' }); const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'munch-event-picks.json'; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000); },
  };
  document.addEventListener('click', (e) => {
    const snd = e.target.closest('[data-snd]'); if (snd && Snd[snd.dataset.snd]) Snd[snd.dataset.snd]();
    const t = e.target.closest('[data-action]'); if (t && actions[t.dataset.action]) actions[t.dataset.action](t, e);
    if (e.target.closest('.nav a')) Snd.tick();
  });
  $('#soundBtn').addEventListener('click', () => { Snd.setMuted(!Snd.isMuted()); updateHeader(); if (!Snd.isMuted()) Snd.clink(); });
  $('#userBtn').addEventListener('click', () => {}); // handled via data-action

  // tilt on hover (desktop only)
  if (!reduce && window.matchMedia('(hover: hover)').matches) {
    document.addEventListener('pointermove', (e) => {
      const el = e.target.closest && e.target.closest('.tilt'); if (!el) return;
      const r = el.getBoundingClientRect(); const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      el.style.setProperty('--ry', (x * 7).toFixed(2) + 'deg'); el.style.setProperty('--rx', (-y * 7).toFixed(2) + 'deg');
    });
    document.addEventListener('pointerout', (e) => { const el = e.target.closest && e.target.closest('.tilt'); if (el && !el.contains(e.relatedTarget)) { el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg'); } });
  }

  const routes = { home: viewHome, review: viewReview, lists: viewLists, events: viewEvents, profile: viewProfile };
  function render() {
    const name = (location.hash.replace(/^#\/?/, '') || 'home').split('?')[0];
    S.cur = routes[name] ? name : 'home';
    $$('.nav a').forEach((a) => a.classList.toggle('active', a.dataset.route === S.cur));
    view.classList.remove('enter'); void view.offsetWidth; view.classList.add('enter');
    routes[S.cur]();
    $$('#view .grid > *, #view .stack > *, #view .stats > *').forEach((el, i) => el.style.setProperty('--i', Math.min(i, 12)));
    clearTimeout(render.t); render.t = setTimeout(() => view.classList.remove('enter'), 1400); // so re-renders (chips, steps) don't replay the entrance
  }
  const swapCard = () => { const c = $('.wiz-card'); if (c) { c.classList.remove('swap'); void c.offsetWidth; c.classList.add('swap'); } };

  // page-to-page load effect: progress bar + fade/blur out, render, fade in with staggered cards
  const bar = $('#topbar'), barFill = $('#topbar i');
  function startBar() {
    bar.style.transition = 'none'; bar.style.opacity = '1'; barFill.style.transition = 'none'; barFill.style.width = '0';
    void bar.offsetWidth; barFill.style.transition = 'width .5s cubic-bezier(.2,.7,.2,1)'; barFill.style.width = '72%';
  }
  function finishBar() {
    barFill.style.transition = 'width .25s ease-out'; barFill.style.width = '100%';
    setTimeout(() => { bar.style.transition = 'opacity .35s'; bar.style.opacity = '0'; }, 260);
  }
  let navTimer;
  function transitionTo(after) {
    closeModal(); clearTimeout(navTimer);
    if (reduce) { render(); window.scrollTo({ top: 0 }); if (after) after(); return; }
    startBar(); view.classList.add('leaving');
    navTimer = setTimeout(() => { render(); window.scrollTo({ top: 0 }); view.classList.remove('leaving'); finishBar(); if (after) after(); }, 260);
  }
  window.addEventListener('hashchange', () => transitionTo());

  // pull to refresh (touch): the glasses close in as you pull, then clink and the page refreshes
  (function pullToRefresh() {
    const ptr = $('#ptrIn'), src = $('#splash .cheers'); if (!ptr || !src) return;
    ptr.innerHTML = src.outerHTML.replace(/id="(\w+)"/g, 'id="$1-p"').replace(/url\(#(\w+)\)/g, 'url(#$1-p)');
    const setHH = () => document.documentElement.style.setProperty('--hh', $('.header').offsetHeight + 'px'); // indicator slides out from under the header
    setHH(); window.addEventListener('resize', setHH);
    const T = 70, SCRUB = 1.86; // px of pull needed; seconds of the swing animation that lead up to the clink
    let startY = 0, pulling = false, pull = 0, busy = false;
    function setPull(px, settle) {
      ptr.classList.toggle('settle', !!settle); ptr.style.setProperty('--pull', px);
      ptr.style.setProperty('--d', (-Math.min(1, px / T) * SCRUB) + 's'); ptr.style.setProperty('--state', 'paused');
    }
    function refresh() {
      busy = true; ptr.classList.add('settle'); ptr.style.setProperty('--pull', T);
      ptr.style.setProperty('--d', (-SCRUB) + 's'); ptr.style.setProperty('--state', 'running'); // plays the clink
      Snd.clink();
      setTimeout(() => transitionTo(() => { setPull(0, true); toast('Refreshed'); busy = false; }), 1250);
    }
    document.addEventListener('touchstart', (e) => {
      if (busy || e.touches.length !== 1 || window.scrollY > 0 || $('.modal-back') || document.body.classList.contains('is-loading')) return;
      startY = e.touches[0].clientY; pulling = true; pull = 0;
    }, { passive: true });
    document.addEventListener('touchmove', (e) => {
      if (!pulling) return;
      const dy = e.touches[0].clientY - startY;
      if (window.scrollY > 0 || dy <= 0) { pull = 0; setPull(0); return; }
      pull = Math.min(110, dy * 0.5); setPull(pull);
    }, { passive: true });
    document.addEventListener('touchend', () => {
      if (!pulling) return; pulling = false;
      if (pull >= T) refresh(); else setPull(0, true);
    });
    window.munchRefresh = refresh; // handy for testing on desktop
  })();

  // loading screen: two glasses cheers, then fade out (click to skip)
  (function splash() {
    const s = $('#splash'); if (!s) return;
    let closed = false;
    const close = () => { if (closed) return; closed = true; s.classList.add('hide'); document.body.classList.remove('is-loading'); setTimeout(() => s.remove(), 900); };
    setTimeout(close, reduce ? 700 : 3700);
    s.addEventListener('click', () => { Snd.clink(); close(); });
    if (!reduce) setTimeout(() => Snd.clink(), 1850); // plays only if the browser already allows audio
  })();

  shownPts = St.balance(St.user());
  updateHeader(); render();
})();
