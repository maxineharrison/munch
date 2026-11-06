/* munch — static data: images, sample restaurants, suggestions, events */
(function () {
  const U = (id) => id; // Unsplash photo ids (free-licence photos, hot-linked)
  const IMG = {
    spread: U('1504674900247-0877df9cc836'),
    plated: U('1414235077428-338989a2e8c0'),
    pizza: U('1565299624946-b28f40a0ae38'),
    burger: U('1551782450-a2132b4ba21d'),
    salad: U('1546069901-ba9599a7e63c'),
    pancakes: U('1567620905732-2d1ec7ab7445'),
    toast: U('1482049016688-2d3e1b311543'),
    steak: U('1544025162-d76694265947'),
    sushi: U('1579871494447-9811cf80d66c'),
    interior: U('1517248135467-4c7edcad34c4'),
    interior2: U('1555396273-367ea4eb4db5'),
    interior3: U('1559339352-11d035aa65de'),
    bar: U('1514933651103-005eec06c04b'),
    cocktails: U('1470337458703-46ad1756a187'),
    wine: U('1510812431401-41d2bd2722f3'),
    cheers: U('1528605248644-14dd04022da1'),
    cafe: U('1559925393-8be0ec4767c8'),
    macarons: U('1486427944299-d1955d23e34d'),
    capetown: U('1580060839134-75a5edca2e99'),
    london: U('1513635269975-59663e0ac1ad'),
    paris: U('1502602898657-3e91760cbb34'),
    bbq: U('1555939594-58d7cb561ad1'),
    street: U('1529042410759-befb1204b468'),
    food1: U('1540189549336-e6e99c3679fe'),
    food2: U('1488477181946-6428a0291777'),
    food3: U('1498837167922-ddd27525d352'),
    food4: U('1473093295043-cdd812d0e601'),
    food5: U('1504754524776-8f4f37790ca0'),
  };
  const imgUrl = (key, w = 600) =>
    `https://images.unsplash.com/photo-${IMG[key] || IMG.spread}?auto=format&fit=crop&w=${w}&q=70`;

  // which stock photo to show for each cuisine group
  const CUISINE_PHOTO = {
    italian: ['pizza', 'food4', 'plated'],
    indian: ['food3', 'spread', 'food5'],
    french: ['plated', 'interior3', 'macarons'],
    japanese: ['sushi', 'food2', 'salad'],
    mexican: ['street', 'food1', 'spread'],
    thai: ['food5', 'food2', 'salad'],
    american: ['burger', 'steak', 'pancakes'],
    african: ['bbq', 'spread', 'food1'],
    british: ['plated', 'steak', 'interior2'],
    turkish: ['food3', 'spread', 'food5'],
    spanish: ['food1', 'wine', 'spread'],
    peruvian: ['salad', 'food2', 'plated'],
    cafe: ['cafe', 'toast', 'pancakes'],
    seafood: ['food2', 'plated', 'sushi'],
    chinese: ['food5', 'food2', 'street'],
    korean: ['food5', 'food3', 'street'],
    bar: ['bar', 'cocktails', 'cheers'],
    default: ['interior', 'spread', 'interior2', 'food1'],
  };

  const CUISINE_ALIAS = {
    pizza: 'italian', pasta: 'italian', italian_pizza: 'italian',
    burger: 'american', steak_house: 'american', steak: 'american', barbecue: 'american', diner: 'american', american: 'american', regional: 'default',
    sushi: 'japanese', ramen: 'japanese', japanese: 'japanese', noodle: 'asian',
    kebab: 'turkish', lebanese: 'turkish', greek: 'turkish', turkish: 'turkish', arab: 'turkish', middle_eastern: 'turkish', mediterranean: 'turkish', falafel: 'turkish',
    coffee_shop: 'cafe', cafe: 'cafe', breakfast: 'cafe', brunch: 'cafe', bakery: 'cafe', dessert: 'cafe', ice_cream: 'cafe', coffee: 'cafe',
    fish: 'seafood', fish_and_chips: 'british', seafood: 'seafood',
    pub: 'bar', bar: 'bar', cocktails: 'bar', wine_bar: 'bar', beer: 'bar',
    chinese: 'chinese', dim_sum: 'chinese', asian: 'chinese', korean: 'korean', thai: 'thai', vietnamese: 'thai',
    indian: 'indian', curry: 'indian', french: 'french', mexican: 'mexican', tacos: 'mexican',
    spanish: 'spanish', tapas: 'spanish', peruvian: 'peruvian', african: 'african', south_african: 'african', cape_malay: 'african',
    british: 'british', english: 'british',
  };

  const DISHES = {
    italian: ['Margherita pizza', 'Spaghetti carbonara', 'Cacio e pepe', 'Lasagne', 'Burrata', 'Gnocchi', 'Tiramisu', 'Affogato'],
    indian: ['Butter chicken', 'Black daal', 'Garlic naan', 'Lamb biryani', 'Samosas', 'Paneer tikka', 'Masala chai', 'Gulab jamun'],
    french: ['Steak frites', 'French onion soup', 'Duck confit', 'Croque monsieur', 'Escargots', 'Crème brûlée', 'Ratatouille', 'Croissant'],
    japanese: ['Tonkotsu ramen', 'Salmon nigiri', 'Gyoza', 'Chicken katsu', 'Miso soup', 'Tempura', 'Matcha ice cream', 'Edamame'],
    mexican: ['Tacos al pastor', 'Guacamole & chips', 'Tuna tostada', 'Quesadilla', 'Elote', 'Enchiladas', 'Churros', 'Margarita'],
    thai: ['Pad thai', 'Green curry', 'Tom yum soup', 'Papaya salad', 'Massaman curry', 'Satay skewers', 'Mango sticky rice', 'Thai iced tea'],
    american: ['Cheeseburger', 'Fries', 'Mac & cheese', 'Buffalo wings', 'Pastrami on rye', 'Ribs', 'Milkshake', 'Apple pie'],
    african: ['Bobotie', 'Boerewors roll', 'Peri-peri chicken', 'Cape Malay curry', 'Bunny chow', 'Braai platter', 'Malva pudding', 'Biltong'],
    british: ['Fish & chips', 'Sunday roast', 'Full English', 'Pie & mash', 'Scotch egg', 'Bangers & mash', 'Sticky toffee pudding', 'Cornish pasty'],
    turkish: ['Hummus', 'Falafel wrap', 'Lamb kebab', 'Mezze platter', 'Shakshuka', 'Lahmacun', 'Baklava', 'Turkish tea'],
    spanish: ['Patatas bravas', 'Paella', 'Jamón ibérico', 'Croquetas', 'Tortilla española', 'Gambas al ajillo', 'Churros con chocolate', 'Sangria'],
    peruvian: ['Ceviche', 'Lomo saltado', 'Anticuchos', 'Causa limeña', 'Tiradito', 'Ají de gallina', 'Pisco sour', 'Picarrones'],
    cafe: ['Flat white', 'Avocado toast', 'Croissant', 'Eggs benedict', 'Banana bread', 'Iced latte', 'Cinnamon bun', 'Granola bowl'],
    seafood: ['Oysters', 'Grilled prawns', 'Fish tacos', 'Calamari', 'Lobster roll', 'Fish curry', 'Seafood linguine', 'Clam chowder'],
    chinese: ['Dim sum', 'Peking duck', 'Kung pao chicken', 'Dan dan noodles', 'Mapo tofu', 'Egg fried rice', 'Xiaolongbao', 'Spring rolls'],
    korean: ['Bibimbap', 'Korean fried chicken', 'Kimchi jjigae', 'Bulgogi', 'Tteokbokki', 'Japchae', 'Kimbap', 'Bingsu'],
    bar: ['House cocktail', 'Negroni', 'Craft beer', 'Glass of wine', 'Nachos', 'Bar snacks', 'Sharing board', 'Old fashioned'],
    default: ['House special', 'Starter to share', 'Signature main', 'Dessert of the day', 'House cocktail', 'Glass of wine', 'Craft beer', 'Coffee'],
  };

  const ATMOSPHERE = [
    ['Cosy', ''], ['Lively', ''], ['Romantic', ''], ['Family-friendly', ''],
    ['Fancy', ''], ['Casual', ''], ['Quiet', ''], ['Good for groups', ''],
    ['Outdoor / terrace', ''], ['Great music', ''], ['Hidden gem', ''], ['Great views', ''],
  ];

  const LIST_TAGS = ['Brunch', 'Date night', 'Cheap eats', 'Fancy', 'Coffee', 'Dessert', 'Drinks', 'Group dinner', 'Vegan-friendly', 'Late night', 'Views', 'Hidden gem'];

  const GO_BACK = [
    { v: 'yes', label: 'Yes, definitely!', emoji: '' },
    { v: 'maybe', label: 'Maybe', emoji: '' },
    { v: 'no', label: 'Probably not', emoji: '' },
  ];

  // Sample restaurants — real, well-known places used as an offline starter set.
  // Dishes in `sig` are widely-reported signature dishes (suggestions only).
  const R = (id, name, area, city, country, lat, lng, cuisine, photo, sig) =>
    ({ id: 's-' + id, name, address: `${area}, ${city}, ${country}`, city, country, lat, lng, cuisine, photoKey: photo, sig: sig || [], source: 'sample' });
  const RESTAURANTS = [
    R('dishoom-cg', 'Dishoom Covent Garden', 'Covent Garden', 'London', 'United Kingdom', 51.5129, -0.1266, 'indian', 'food3', ['Black daal', 'Bacon naan roll', 'Okra fries', 'Chicken ruby']),
    R('padella', 'Padella', 'Borough Market', 'London', 'United Kingdom', 51.5055, -0.0907, 'italian', 'food4', ['Pici cacio e pepe', 'Pappardelle with beef shin ragù', 'Burrata']),
    R('stjohn', 'St. JOHN', 'Smithfield', 'London', 'United Kingdom', 51.5203, -0.1017, 'british', 'plated', ['Roast bone marrow & parsley salad', 'Eccles cake with Lancashire cheese']),
    R('hawksmoor-7d', 'Hawksmoor Seven Dials', 'Seven Dials', 'London', 'United Kingdom', 51.5133, -0.1273, 'steak', 'steak', ['Rib-eye steak', 'Bone-in prime rib', 'Sticky toffee pudding']),
    R('comptoir', 'Le Comptoir du Relais', 'Saint-Germain', 'Paris', 'France', 48.8514, 2.338, 'french', 'interior3', ['Steak frites', 'Duck confit', 'Crème brûlée']),
    R('asdufallafel', "L'As du Fallafel", 'Le Marais', 'Paris', 'France', 48.8575, 2.359, 'turkish', 'food3', ['Falafel special', 'Hummus plate']),
    R('breizh', 'Breizh Café', 'Le Marais', 'Paris', 'France', 48.8626, 2.3624, 'french', 'pancakes', ['Buckwheat galette', 'Salted-caramel crêpe', 'Breton cider']),
    R('chartier', 'Bouillon Chartier', 'Grands Boulevards', 'Paris', 'France', 48.8721, 2.3433, 'french', 'interior', ['Escargots', 'Steak frites', 'Profiteroles']),
    R('mama-africa', 'Mama Africa', 'Long Street', 'Cape Town', 'South Africa', -33.9235, 18.4169, 'african', 'bbq', ['Game platter', 'Cape Malay curry', 'Biltong']),
    R('kloof-house', 'Kloof Street House', 'Gardens', 'Cape Town', 'South Africa', -33.9318, 18.4119, 'african', 'interior2', ['Sunset cocktails', 'Bobotie', 'Sharing platters']),
    R('potluck', 'The Pot Luck Club', 'Woodstock', 'Cape Town', 'South Africa', -33.9276, 18.4478, 'seafood', 'food1', ['Sharing plates', 'Cocktails with a view']),
    R('truth', 'Truth Coffee Roasting', 'City Bowl', 'Cape Town', 'South Africa', -33.9275, 18.4308, 'cafe', 'cafe', ['Flat white', 'Steampunk-brewed coffee', 'Pastries']),
    R('bokaap-kombuis', 'Bo-Kaap Kombuis', 'Bo-Kaap', 'Cape Town', 'South Africa', -33.921, 18.415, 'african', 'food5', ['Cape Malay curry', 'Bobotie', 'Koeksisters']),
    R('katz', "Katz's Delicatessen", 'Lower East Side', 'New York', 'United States', 40.7223, -73.9874, 'american', 'burger', ['Pastrami on rye', 'Matzo ball soup', 'Reuben sandwich']),
    R('joes-pizza', "Joe's Pizza", 'Greenwich Village', 'New York', 'United States', 40.7306, -74.0021, 'italian', 'pizza', ['Plain cheese slice', 'Pepperoni slice']),
    R('ichiran', 'Ichiran Shibuya', 'Shibuya', 'Tokyo', 'Japan', 35.6612, 139.6989, 'japanese', 'food2', ['Tonkotsu ramen', 'Extra noodles (kaedama)', 'Soft-boiled egg']),
    R('roscioli', 'Roscioli Salumeria con Cucina', 'Centro Storico', 'Rome', 'Italy', 41.894, 12.4725, 'italian', 'food4', ['Carbonara', 'Burrata', 'Charcuterie board']),
    R('catalana', 'Cervecería Catalana', 'Eixample', 'Barcelona', 'Spain', 41.3917, 2.1585, 'spanish', 'food1', ['Patatas bravas', 'Montaditos', 'Jamón ibérico']),
    R('contramar', 'Contramar', 'Roma Norte', 'Mexico City', 'Mexico', 19.4159, -99.1693, 'mexican', 'street', ['Tuna tostadas', 'Pescado a la talla', 'Tacos']),
    R('jayfai', 'Raan Jay Fai', 'Old Town', 'Bangkok', 'Thailand', 13.7527, 100.5047, 'thai', 'food5', ['Crab omelette', 'Drunken noodles', 'Tom yum']),
    R('central', 'Central', 'Barranco', 'Lima', 'Peru', -12.1316, -77.0197, 'peruvian', 'salad', ['Tasting menu', 'Ceviche', 'Pisco sour']),
    R('bills', 'bills Surry Hills', 'Surry Hills', 'Sydney', 'Australia', -33.88, 151.2136, 'cafe', 'toast', ['Ricotta hotcakes', 'Scrambled eggs', 'Flat white']),
    R('gulluoglu', 'Karaköy Güllüoğlu', 'Karaköy', 'Istanbul', 'Türkiye', 41.0227, 28.9763, 'turkish', 'food3', ['Pistachio baklava', 'Turkish tea', 'Su böreği']),
  ];

  // Events — all fictional, for showcase only.
  const day = (n) => { const d = new Date(); d.setDate(d.getDate() + n); d.setHours(18, 30, 0, 0); return d.toISOString(); };
  const EVENTS = [
    { id: 'ct-sundowners', city: 'Cape Town', emoji: '', title: 'Sundowners & Braai on the Rooftop', date: day(21), cost: 120, image: 'capetown',
      blurb: 'Golden-hour rooftop with Table Mountain views, live marimba and a modern South African braai.',
      included: ['2 welcome drinks (local wine or gin & tonic)', 'Braai dinner: boerewors, line fish and sides', 'Malva pudding to finish', 'Further drinks are on you'] },
    { id: 'ct-winelands', city: 'Cape Town', emoji: '', title: 'Winelands Long-Table Lunch', date: day(35), cost: 180, image: 'wine',
      blurb: 'A long communal table among the vines in Stellenbosch, hosted by the winemaker.',
      included: ['3-course lunch', 'Paired tasting of 4 wines', 'Shuttle from the city', 'Extra bottles are on you'] },
    { id: 'ct-bokaap', city: 'Cape Town', emoji: '', title: 'Bo-Kaap Cook & Spice Walk', date: day(14), cost: 90, image: 'food5',
      blurb: 'Stroll the colourful streets of Bo-Kaap, then roll up your sleeves for a Cape Malay cooking demo.',
      included: ['Guided spice tasting walk', 'Hands-on cooking class', '1 welcome drink', 'Take-home spice mix'] },
    { id: 'ldn-streetfood', city: 'London', emoji: '', title: 'Street Food Supper Club', date: day(18), cost: 110, image: 'street',
      blurb: 'A pop-up supper club with four street-food vendors under one roof in East London.',
      included: ['4 small plates, one from each vendor', '2 drinks (beer or cocktail)', 'Dessert bite', 'Extra drinks are on you'] },
    { id: 'ldn-gin', city: 'London', emoji: '', title: 'Gin & Tonic Masterclass', date: day(26), cost: 100, image: 'cocktails',
      blurb: 'Learn to build the perfect G&T with a distiller in a hidden Soho speakeasy.',
      included: ['3 tasting serves', 'Botanicals kit to take home', 'Nibbles', 'Extra drinks are on you'] },
    { id: 'ldn-roast', city: 'London', emoji: '', title: 'Sunday Roast Showdown', date: day(30), cost: 130, image: 'steak',
      blurb: 'Three pubs, one roast. Taste, score and crown the best Yorkshire pudding in town.',
      included: ['Roast dinner with all the trimmings', '1 pint or glass of wine', 'Voting card & bragging rights', 'Further drinks are on you'] },
    { id: 'par-cheese', city: 'Paris', emoji: '', title: 'Midnight Cheese & Wine Crawl', date: day(24), cost: 140, image: 'cheers',
      blurb: 'An after-dark crawl through Le Marais with a fromager and a sommelier as your guides.',
      included: ['3 stops with cheese boards', '2 glasses of wine at each stop', 'Baguette & charcuterie nibbles', 'Extra glasses are on you'] },
    { id: 'par-macarons', city: 'Paris', emoji: '', title: 'Pâtisserie Atelier: Macarons & Champagne', date: day(40), cost: 160, image: 'macarons',
      blurb: 'A hands-on macaron class in a Montmartre atelier, finished with something sparkling.',
      included: ['Macaron masterclass & ingredients', 'Box of 12 macarons to take home', '2 glasses of champagne', 'Extra bubbles are on you'] },
    { id: 'par-picnic', city: 'Paris', emoji: '', title: 'Seine-Side Picnic Dinner', date: day(33), cost: 150, image: 'paris',
      blurb: 'A curated picnic basket on the quay as the Eiffel Tower starts to sparkle.',
      included: ['Picnic dinner for one', '2 drinks', 'Blanket to borrow', 'More drinks are on you'] },
  ];

  const HOME_CHIPS = [
    ['all', 'All'], ['italian', 'Italian'], ['indian', 'Indian'], ['french', 'French'],
    ['japanese', 'Japanese'], ['mexican', 'Mexican'], ['african', 'African'], ['cafe', 'Cafés'], ['turkish', 'Middle Eastern'],
  ];

  function cuisineKey(c) {
    if (!c) return 'default';
    const first = String(c).split(/[;,]/)[0].trim().toLowerCase().replace(/[\s-]+/g, '_');
    const k = CUISINE_ALIAS[first] || first;
    if (k === 'steak') return 'american';
    return DISHES[k] ? k : 'default';
  }
  function hash(s) { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h; }
  function photoFor(r, w = 600) {
    if (r.photoKey) return imgUrl(r.photoKey, w);
    const group = CUISINE_PHOTO[cuisineKey(r.cuisine)] || CUISINE_PHOTO.default;
    return imgUrl(group[hash(r.id || r.name || 'x') % group.length], w);
  }
  function suggestDishes(r) {
    const k = cuisineKey(r.cuisine);
    const base = DISHES[k] || DISHES.default;
    const out = [...(r.sig || [])];
    base.forEach((d) => { if (!out.includes(d)) out.push(d); });
    return out.slice(0, 12);
  }
  function prettyCuisine(c) {
    if (!c) return '';
    return String(c).split(/[;,]/)[0].replace(/_/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase());
  }

  window.MUNCH_DATA = { IMG, imgUrl, RESTAURANTS, EVENTS, ATMOSPHERE, LIST_TAGS, GO_BACK, HOME_CHIPS, cuisineKey, photoFor, suggestDishes, prettyCuisine };
})();
