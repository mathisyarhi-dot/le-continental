// Maintainer-only content generator — NOT loaded by the deployed site
// (Vercel just serves the static ../index.html and ../en/index.html it
// produces). Regenerates both from this folder's JSON so a price/text edit
// only needs to happen once, not by hand in two HTML files.
//
// Usage: edit the JSON in this folder, then `node content/generate.mjs`
// from the repo root, then commit the regenerated index.html/en/index.html.
// Requires Node.js — see the "Modifier le contenu" section of README.md.
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const menu = JSON.parse(readFileSync(path.join(__dirname, 'menu.json'), 'utf8'));
const gallery = JSON.parse(readFileSync(path.join(__dirname, 'gallery.json'), 'utf8'));
const info = JSON.parse(readFileSync(path.join(__dirname, 'info.json'), 'utf8'));
const reviews = JSON.parse(readFileSync(path.join(__dirname, 'reviews.json'), 'utf8'));
const signature = JSON.parse(readFileSync(path.join(__dirname, 'signature.json'), 'utf8'));
const FR = JSON.parse(readFileSync(path.join(__dirname, 'fr.json'), 'utf8'));
const EN = JSON.parse(readFileSync(path.join(__dirname, 'en.json'), 'utf8'));

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function findPhoto(relPath) {
  for (const ext of ['webp', 'jpg', 'jpeg', 'png']) {
    if (existsSync(path.join(ROOT, relPath + '.' + ext))) return relPath + '.' + ext;
  }
  return null;
}

function mediaSlot({ path: p, ratio, caption, cls = '', variant = '' }) {
  const found = findPhoto(p);
  const classes = ['media-slot', variant === 'on-blue' ? 'media-slot--on-blue' : '', cls].filter(Boolean).join(' ');
  const style = ratio ? ` style="aspect-ratio:${ratio}"` : '';
  const key = ` data-slot-key="${esc(p)}" data-caption="${esc(caption)}"`;
  if (found) {
    return `<div class="${classes}"${style}${key}><img src="/${found}" alt="${esc(caption)}" loading="lazy"></div>`;
  }
  // data-slot-key lets js/main.js offer a local, browser-only "try your own
  // photos" preview (see initMediaSlotUploads) until a real file lands in
  // /photos/ and this slot starts rendering the <img> branch above instead.
  return `<div class="${classes}"${style}${key}><span>${esc(caption)}</span></div>`;
}

function waLink(lang) {
  return `${info.whatsapp.base}?text=${encodeURIComponent(info.whatsapp.prefill[lang])}`;
}

function groupsByCat() {
  const map = {};
  for (const g of menu.groups) (map[g.category] ??= []).push(g);
  return map;
}

function page(lang) {
  const t = lang === 'fr' ? FR : EN;
  const otherLang = lang === 'fr' ? 'en' : 'fr';
  const selfPath = lang === 'fr' ? '/' : '/en/';
  const siteUrl = 'https://lecontinental.ma';
  const wa = waLink(lang);
  const groups = groupsByCat();
  const firstCatId = menu.categories[0].id;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: 'Le Continental Sea Palace',
    image: `${siteUrl}/og.jpg`,
    telephone: info.phone,
    priceRange: '$$',
    servesCuisine: ['Marocaine', 'Japonaise', 'Internationale'],
    address: {
      '@type': 'PostalAddress',
      streetAddress: '1er, Résidence la Perle de, Entrée Corniche, Rte de Mehdia',
      addressLocality: info.address.locality,
      postalCode: info.address.postalCode,
      addressCountry: info.address.country,
    },
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      opens: info.hours.open,
      closes: info.hours.close,
    },
    sameAs: [info.social.instagram, info.social.facebook],
    hasMenu: `${siteUrl}/#carte`,
    url: `${siteUrl}${selfPath}`,
  };

  const title =
    lang === 'fr'
      ? 'Le Continental Sea Palace — Restaurant & bar à sushi, corniche de Mehdia'
      : 'Le Continental Sea Palace — Restaurant & Sushi Bar, Mehdia Seafront';
  const description =
    lang === 'fr'
      ? "Café-restaurant et bar à sushi face à l'Atlantique, à l'entrée de la corniche de Mehdia (Kénitra). Dix formules petit-déjeuner, sushis, pizzas et pâtisseries maison. Réservation par WhatsApp ou téléphone."
      : 'Café-restaurant and sushi bar facing the Atlantic, at the entrance of the Mehdia seafront (Kénitra, Morocco). Ten breakfast sets, sushi, wood-fired pizza and house pastries. Book by WhatsApp or phone.';

  const navItems = [
    ['#top', t.navHome],
    ['#carte', t.navMenu],
    ['#galerie', t.navGallery],
    ['#reservation', t.navBook],
    ['#contact', t.navContact],
  ];

  const cssPrefix = lang === 'fr' ? '' : '../';

  const header = `
<header class="site-header">
  <div class="wrap header-inner">
    <a href="#top" class="logo-link"><img src="${cssPrefix}assets/logo-lockup-gold.png" alt="Le Continental Sea Palace" width="220" height="44" class="logo-img"></a>
    <nav class="nav-desktop" aria-label="${lang === 'fr' ? 'Navigation principale' : 'Main navigation'}">
      ${navItems.map(([href, label]) => `<a href="${href}">${esc(label)}</a>`).join('\n      ')}
    </nav>
    <div class="header-actions">
      <div class="lang-switch" role="group" aria-label="${lang === 'fr' ? 'Langue' : 'Language'}">
        <a href="/" class="lang-btn${lang === 'fr' ? ' active' : ''}"${lang === 'fr' ? ' aria-current="page"' : ''}>FR</a>
        <a href="/en/" class="lang-btn${lang === 'en' ? ' active' : ''}"${lang === 'en' ? ' aria-current="page"' : ''}>EN</a>
      </div>
      <a href="${wa}" target="_blank" rel="noopener" class="btn btn-primary cta-desktop">${esc(t.ctaBook)}</a>
      <button type="button" class="burger" id="burger-btn" aria-label="Menu" aria-expanded="false" aria-controls="mobile-nav">≡</button>
    </div>
  </div>
  <nav id="mobile-nav" class="mobile-nav" aria-label="${lang === 'fr' ? 'Navigation mobile' : 'Mobile navigation'}" hidden>
    ${navItems.map(([href, label]) => `<a href="${href}" class="mobile-link">${esc(label)}</a>`).join('\n    ')}
  </nav>
</header>`;

  const topbar = `
<div class="topbar">
  <span>${esc(t.topAddress)}</span>
  <span class="dot" aria-hidden="true"></span>
  <span id="open-badge">${lang === 'fr' ? 'Tous les jours · 9h00 — 00h00' : 'Every day · 9:00 am — 12:00 am'}</span>
</div>`;

  const heroCaptions =
    lang === 'fr'
      ? { main: "Photo principale — la terrasse face à l'océan, fin de journée" }
      : { main: 'Main photo — the terrace facing the ocean, end of day' };

  const hero = `
<section id="top" class="hero">
  <div class="wrap hero-grid">
    <div class="hero-copy">
      <p class="kicker">${esc(t.heroKicker)}</p>
      <h1><span>${esc(t.heroTitleA)}</span> <em>${esc(t.heroTitleB)}</em></h1>
      <p class="hero-sub">${esc(t.heroSub)}</p>
      <div class="hero-ctas">
        <a href="${wa}" target="_blank" rel="noopener" class="btn btn-primary">${esc(t.ctaWhats)}</a>
        <a href="#carte" class="btn btn-ghost">${esc(t.ctaMenu)}</a>
      </div>
      <div class="hero-facts">
        <span>${esc(t.heroFact1)}</span><span class="sep">·</span><span>${esc(t.heroFact2)}</span><span class="sep">·</span><span>${esc(t.heroFact3)}</span>
      </div>
    </div>
    <div class="hero-media">
      ${mediaSlot({ path: 'photos/hero-terrasse', ratio: '4/5', caption: heroCaptions.main, cls: 'hero-media-main' })}
    </div>
  </div>
</section>`;

  const pillars = `
<section class="pillars">
  <div class="wrap pillars-grid">
    <div><div class="pillar-num">01</div><h3 class="pillar-title">${esc(t.p1t)}</h3><p class="pillar-desc">${esc(t.p1d)}</p></div>
    <div><div class="pillar-num">02</div><h3 class="pillar-title">${esc(t.p2t)}</h3><p class="pillar-desc">${esc(t.p2d)}</p></div>
    <div><div class="pillar-num">03</div><h3 class="pillar-title">${esc(t.p3t)}</h3><p class="pillar-desc">${esc(t.p3d)}</p></div>
  </div>
</section>`;

  const breakfasts = `
<section class="breakfasts">
  <div class="wrap">
    <div class="section-head">
      <img src="${cssPrefix}assets/logo-mark-gold.png" alt="" width="66" height="48" class="mark">
      <p class="kicker">${esc(t.bfKicker)}</p>
      <h2>${esc(t.bfTitle)}</h2>
      <p class="section-sub">${esc(t.bfSub)}</p>
    </div>
    <div class="bf-grid">
      ${signature.items
        .map((item) => {
          const name = item[lang].name;
          const desc = item[lang].desc;
          const caption = lang === 'fr' ? `Le plat « ${item.fr.name} »` : `The dish "${item.en.name}"`;
          return `<div class="card bf-card">
        ${mediaSlot({ path: `photos/${item.photo}`, caption })}
        <div class="bf-body">
          <div class="bf-row"><h3 class="bf-name">${esc(name)}</h3><span class="bf-price">${esc(item.price)}</span></div>
          <p class="bf-desc">${esc(desc)}</p>
        </div>
      </div>`;
        })
        .join('\n      ')}
    </div>
    <div class="bf-cta-wrap"><a href="#carte" class="underline-link">${esc(t.bfCta)}</a></div>
  </div>
</section>`;

  const sushiCaption = lang === 'fr' ? 'Le comptoir du bar à sushi, le chef en action' : 'The sushi bar counter, the chef at work';
  const sushibar = `
<section class="sushi">
  <div class="wrap sushi-grid">
    ${mediaSlot({ path: 'photos/sushi-comptoir', caption: sushiCaption, cls: 'sushi-media', variant: 'on-blue' })}
    <div>
      <p class="kicker kicker-on-blue">${esc(t.sushiKicker)}</p>
      <h3 class="sushi-title">${esc(t.sushiTitle)}</h3>
      <p class="sushi-body">${esc(t.sushiBody)}</p>
      <div class="sushi-tags">
        <span class="chip">${esc(t.sushiTag1)}</span>
        <span class="chip">${esc(t.sushiTag2)}</span>
        <span class="chip">${esc(t.sushiTag3)}</span>
      </div>
      <a href="${wa}" target="_blank" rel="noopener" class="btn btn-on-blue">${esc(t.sushiCta)}</a>
    </div>
  </div>
</section>`;

  const tabs = menu.categories
    .map(
      (cat) =>
        `<button type="button" class="pill" role="tab" data-cat-btn="${cat.id}" aria-selected="${cat.id === firstCatId}" aria-controls="panel-${cat.id}" id="tab-${cat.id}">${esc(cat[lang])}</button>`
    )
    .join('\n      ');

  const panels = menu.categories
    .map((cat) => {
      const grps = groups[cat.id] || [];
      const body = grps
        .map((g) => {
          const items = g.items
            .map(
              (item) => `<div class="menu-item">
            <div>
              <div class="menu-item-name">${esc(item[lang].name)}</div>
              ${item[lang].desc ? `<div class="menu-item-desc">${esc(item[lang].desc)}</div>` : ''}
            </div>
            <div class="menu-item-price">${esc(item.price)}</div>
          </div>`
            )
            .join('\n          ');
          const note = g.note ? `<div class="menu-note">${esc(g.note[lang])}</div>` : '';
          return `<div class="menu-group">
          <div class="menu-group-head"><div class="menu-group-title">${esc(g[lang])}</div><div class="menu-group-rule"></div></div>
          <div class="menu-items">
          ${items}
          </div>
          ${note}
        </div>`;
        })
        .join('\n        ');
      return `<div class="menu-panel" data-cat-panel="${cat.id}" role="tabpanel" id="panel-${cat.id}" aria-labelledby="tab-${cat.id}"${cat.id === firstCatId ? '' : ' hidden'}>
        ${body}
      </div>`;
    })
    .join('\n      ');

  const menuSection = `
<section id="carte" class="menu">
  <div class="wrap-narrow">
    <div class="section-head">
      <p class="kicker">${esc(t.menuKicker)}</p>
      <h2>${esc(t.menuTitle)}</h2>
      ${t.menuSub ? `<p class="section-sub">${esc(t.menuSub)}</p>` : ''}
    </div>
    <div class="tabs" role="tablist" aria-label="${lang === 'fr' ? 'Catégories de la carte' : 'Menu categories'}">
      ${tabs}
    </div>
    ${panels}
    <div class="menu-cta-wrap"><a href="${wa}" target="_blank" rel="noopener" class="btn btn-primary">${esc(t.ctaBook)}</a></div>
  </div>
</section>`;

  const shapeMeta = { wide: { ratio: '3/2', cls: 'gal-wide' }, tall: { ratio: '3/4', cls: 'gal-tall' }, square: { ratio: '1/1', cls: 'gal-square' } };
  const galleryItems = gallery.items
    .map((item) => {
      const meta = shapeMeta[item.shape];
      const caption = item[lang];
      return mediaSlot({ path: `photos/${item.file}`, ratio: meta.ratio, caption, cls: meta.cls });
    })
    .join('\n      ');

  const gallerySection = `
<section id="galerie" class="gallery">
  <div class="wrap">
    <div class="gallery-head">
      <div><p class="kicker">${esc(t.galKicker)}</p><h3>${esc(t.galTitle)}</h3></div>
      <a href="https://www.instagram.com/lecontinentalseapalace/" target="_blank" rel="noopener" class="underline-link">${esc(t.galInsta)}</a>
    </div>
    <div class="gallery-grid">
      ${galleryItems}
    </div>
  </div>
</section>`;

  const ratingDisplay = info.rating.value.toFixed(1).replace('.', lang === 'fr' ? ',' : '.');
  const reviewsSection = `
<section class="reviews">
  <div class="wrap-narrow">
    <div class="reviews-head">
      <div class="rating-num">${ratingDisplay}</div>
      <div class="stars">★★★★☆</div>
      <div class="rating-note">${esc(t.revNote)}</div>
    </div>
    <div class="reviews-grid">
      ${reviews.items
        .map(
          (r) => `<div class="card review-card">
        <div class="stars stars-sm">${'★'.repeat(r.stars)}</div>
        <p class="review-text">${esc(r[lang].text)}</p>
        <div class="review-who">${esc(r.source)} · ${esc(r[lang].who)}</div>
      </div>`
        )
        .join('\n      ')}
    </div>
  </div>
</section>`;

  const mapsQuery = encodeURIComponent(info.address.full);
  const booking = `
<section id="reservation" class="booking">
  <div class="wrap booking-grid">
    <div class="booking-copy">
      <p class="kicker">${esc(t.bookKicker)}</p>
      <h3>${esc(t.bookTitle)}</h3>
      <p class="booking-body">${esc(t.bookBody)}</p>
      <div class="booking-ctas">
        <a href="${wa}" target="_blank" rel="noopener" class="btn btn-primary booking-btn">${esc(t.ctaWhats)}</a>
        <a href="tel:${info.phone}" class="btn btn-ghost booking-btn">${esc(info.phoneDisplay)}</a>
      </div>
      <div class="booking-info">
        <div><div class="label">${esc(t.hoursLabel)}</div><div class="booking-value">${esc(info.hours.label[lang])}</div></div>
        <div><div class="label">${esc(t.payLabel)}</div><div class="booking-value">${esc(info.payment[lang])}</div></div>
        <div><div class="label">${esc(t.groupLabel)}</div><div class="booking-value">${esc(t.groupValue)}</div></div>
      </div>
    </div>
    <div id="contact" class="booking-contact">
      <div class="card address-card">
        <div class="label">${esc(t.addrLabel)}</div>
        <div class="address-lines">${info.address.lines.map(esc).join('<br>')}</div>
        <a href="https://www.google.com/maps/search/?api=1&query=${mapsQuery}" target="_blank" rel="noopener" class="underline-link">${esc(t.mapsCta)}</a>
      </div>
      <div class="map-frame">
        <iframe src="https://www.google.com/maps?q=${mapsQuery}&z=16&output=embed" loading="lazy" title="${lang === 'fr' ? 'Carte' : 'Map'}"></iframe>
      </div>
    </div>
  </div>
</section>`;

  const footer = `
<footer class="site-footer">
  <div class="wrap footer-grid">
    <div>
      <img src="${cssPrefix}assets/logo-lockup-cream.png" alt="Le Continental Sea Palace" width="220" height="46" class="footer-logo">
      <p class="footer-tag">${esc(t.footTag)}</p>
    </div>
    <div>
      <div class="footer-label">${esc(t.hoursLabel)}</div>
      <p class="footer-text">${esc(t.footHours1)}<br>${esc(t.footHours2)}</p>
    </div>
    <div>
      <div class="footer-label">${esc(t.navContact)}</div>
      <div class="footer-links">
        <a href="tel:${info.phone}">${esc(info.phoneDisplay)}</a>
        <a href="${wa}" target="_blank" rel="noopener">WhatsApp</a>
        <a href="${info.social.instagram}" target="_blank" rel="noopener">Instagram</a>
        <a href="${info.social.facebook}" target="_blank" rel="noopener">Facebook</a>
      </div>
    </div>
    <div>
      <div class="footer-label">${esc(t.payLabel)}</div>
      <p class="footer-text">${esc(info.payment[lang])}</p>
    </div>
  </div>
  <div class="wrap footer-bottom">
    <span>© 2026 Le Continental Sea Palace — ${esc(info.domain)}</span>
    <span>${esc(t.footCredit)}</span>
    <button type="button" id="reset-demo-photos" class="reset-photos-btn" hidden>${lang === 'fr' ? 'Réinitialiser les photos importées' : 'Reset imported photos'}</button>
  </div>
</footer>`;

  const mobileActionBar = `
<div class="mobile-action-bar">
  <a href="tel:${info.phone}" class="mab-item">${esc(t.barCall)}</a>
  <a href="${wa}" target="_blank" rel="noopener" class="mab-item mab-whatsapp">WhatsApp</a>
  <a href="#carte" class="mab-item mab-menu">${esc(t.navMenu)}</a>
</div>`;

  return `<!doctype html>
<html lang="${lang}" data-lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${siteUrl}${selfPath}">
<link rel="alternate" hreflang="fr" href="${siteUrl}/">
<link rel="alternate" hreflang="en" href="${siteUrl}/en/">
<link rel="alternate" hreflang="x-default" href="${siteUrl}/">

<link rel="icon" type="image/png" sizes="32x32" href="${cssPrefix}favicon-32.png">
<link rel="icon" type="image/png" sizes="16x16" href="${cssPrefix}favicon-16.png">
<link rel="apple-touch-icon" href="${cssPrefix}apple-touch-icon.png">

<meta property="og:type" content="website">
<meta property="og:site_name" content="Le Continental Sea Palace">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:image" content="${siteUrl}/og.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:url" content="${siteUrl}${selfPath}">
<meta property="og:locale" content="${lang === 'fr' ? 'fr_FR' : 'en_US'}">
<meta name="twitter:card" content="summary_large_image">

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Archivo:wght@300;400;500;600&family=JetBrains+Mono:wght@400&display=swap" rel="stylesheet">

<link rel="stylesheet" href="${cssPrefix}css/style.css">

<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
</head>
<body>
${topbar}
${header}
<main>
${hero}
${pillars}
${breakfasts}
${sushibar}
${menuSection}
${gallerySection}
${reviewsSection}
${booking}
</main>
${footer}
${mobileActionBar}
<script src="${cssPrefix}js/main.js"></script>
</body>
</html>
`;
}

writeFileSync(path.join(ROOT, 'index.html'), page('fr'));
mkdirSync(path.join(ROOT, 'en'), { recursive: true });
writeFileSync(path.join(ROOT, 'en', 'index.html'), page('en'));
console.log('Generated index.html and en/index.html');
