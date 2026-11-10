/* =========================================================
   CWA SCIENCE CLASSES - Main JS
   Handles: preloader, nav, hero slider, marquee, batches render,
   video modal, result lookup, animations, counters.

   DATA SOURCE STRATEGY
   ---------------------
   If Supabase is configured (js/supabase-config.js has a URL +
   anon key), all editable content (hero slides, notices, about,
   batches, footer/site settings) is fetched live from Supabase.
   Otherwise it falls back to the local defaults in js/site-data.js
   and js/batches-data.js so the site keeps working out of the box.
========================================================= */

document.addEventListener('DOMContentLoaded', async () => {

  /* ---------- PRELOADER ---------- */
  const preloader = document.getElementById('preloader');
  window.addEventListener('load', () => {
    setTimeout(() => preloader.classList.add('hide'), 400);
  });
  setTimeout(() => preloader && preloader.classList.add('hide'), 2500);

  /* ---------- AOS INIT ---------- */
  if (window.AOS) {
    AOS.init({ duration: 800, once: true, offset: 60, easing: 'ease-out-cubic' });
  }

  /* ---------- MOBILE DRAWER ---------- */
  const hamburger = document.getElementById('hamburger');
  const mobileDrawer = document.getElementById('mobileDrawer');
  const drawerOverlay = document.getElementById('drawerOverlay');

  function openDrawer() {
    hamburger.classList.add('open');
    mobileDrawer.classList.add('open');
    drawerOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeDrawer() {
    hamburger.classList.remove('open');
    mobileDrawer.classList.remove('open');
    drawerOverlay.classList.remove('open');
    document.body.style.overflow = '';
  }
  hamburger.addEventListener('click', () => {
    mobileDrawer.classList.contains('open') ? closeDrawer() : openDrawer();
  });
  drawerOverlay.addEventListener('click', closeDrawer);
  document.querySelectorAll('.mdrawer-link, .mdrawer-cta').forEach(link => {
    link.addEventListener('click', closeDrawer);
  });

  /* ---------- NAV ACTIVE LINK ON SCROLL ---------- */
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');
  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(sec => {
      const top = sec.offsetTop - 120;
      if (window.scrollY >= top) current = sec.getAttribute('id');
    });
    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === '#' + current) link.classList.add('active');
    });

    // header shadow
    const header = document.getElementById('siteHeader');
    if (window.scrollY > 10) header.style.boxShadow = '0 4px 24px rgba(20,20,43,0.12)';
    else header.style.boxShadow = '0 2px 18px rgba(20,20,43,0.06)';
  });

  /* =========================================================
     LOAD DYNAMIC CONTENT (Supabase if configured, else fallback)
  ========================================================= */
  let siteSettings = Object.assign({}, (typeof SITE_SETTINGS_DEFAULT !== 'undefined') ? SITE_SETTINGS_DEFAULT : {});
  let heroSlides = (typeof HERO_SLIDES_DEFAULT !== 'undefined') ? HERO_SLIDES_DEFAULT.slice() : [];
  let notices = (typeof NOTICES_DEFAULT !== 'undefined') ? NOTICES_DEFAULT.slice() : [];
  let batchesData = (typeof BATCHES_DATA !== 'undefined') ? BATCHES_DATA : { batches: [] };

  if (typeof IS_SUPABASE_CONFIGURED !== 'undefined' && IS_SUPABASE_CONFIGURED) {
    try {
      const { data: settingsRow } = await supabaseClient.from('site_settings').select('data').eq('id', 1).single();
      if (settingsRow && settingsRow.data) siteSettings = Object.assign({}, siteSettings, settingsRow.data);

      const { data: slidesRows } = await supabaseClient.from('hero_slides').select('*').eq('active', true).order('sort_order');
      if (slidesRows && slidesRows.length) {
        heroSlides = slidesRows.map(s => ({
          eyebrow: s.eyebrow, line1: s.line1, line2: s.line2, highlight: s.highlight,
          description: s.description, image_url: s.image_url,
          btn1_text: s.btn1_text, btn1_link: s.btn1_link, btn2_text: s.btn2_text, btn2_link: s.btn2_link
        }));
      }

      const { data: noticeRows } = await supabaseClient.from('notices').select('*').eq('active', true).order('sort_order');
      if (noticeRows && noticeRows.length) notices = noticeRows.map(n => n.text);

    } catch (err) {
      console.warn('Supabase fetch failed, using local fallback data.', err);
    }
  }

  // Batches (class -> subject -> chapter -> videos/notes) come from the shared loader (js/content.js)
  try { batchesData = await CWA.loadBatches(); } catch (e) { console.warn('Batches load failed', e); }

  /* ---------- APPLY SITE SETTINGS TO DOM ---------- */
  function applySiteSettings() {
    const s = siteSettings;
    const setSrc = (id, val) => { const el = document.getElementById(id); if (el && val) el.src = val; };
    const setHtml = (id, val) => { const el = document.getElementById(id); if (el && val) el.innerHTML = val; };
    const setText = (id, val) => { const el = document.getElementById(id); if (el && val) el.textContent = val; };
    const setHref = (id, val) => { const el = document.getElementById(id); if (el && val) el.setAttribute('href', val); };

    setSrc('headerLogo', s.logo_url);
    setSrc('footerLogo', s.logo_url);
    setSrc('aboutImg', s.about_image_url);
    setText('aboutName', s.about_teacher_name);
    setText('aboutRole', s.about_role);
    setHtml('aboutText', s.about_text);

    setHtml('batchesHeading', s.batches_heading);
    setText('batchesSubheading', s.batches_subheading);

    setHref('contactHelpline', s.helpline_number ? 'tel:' + s.helpline_number.replace(/\s+/g,'') : null);
    setText('contactHelpline', s.helpline_number);
    setHref('contactWhatsapp', s.whatsapp_link);
    setText('contactAddress', s.address);
    setText('contactTiming', s.class_timing);

    setHref('footerPhone', s.helpline_number ? 'tel:' + s.helpline_number.replace(/\s+/g,'') : null);
    setText('footerPhone', s.helpline_number);
    setText('footerAddress', s.address);
    setText('footerEmail', s.email);
    const footerTiming = document.getElementById('footerTiming');
    if (footerTiming && s.class_timing) footerTiming.innerHTML = `<i class="fa-solid fa-clock"></i> ${s.class_timing}`;

    // Map: admin's custom embed URL wins; the old generic "Bihar,India" default is replaced by a zoomed map of the address.
    const mapFrame = document.getElementById('contactMapFrame');
    if (mapFrame) {
      const custom = s.map_embed_url && !/q=Bihar,?\s*India/i.test(s.map_embed_url);
      if (custom) mapFrame.src = s.map_embed_url;
      else if (s.address) mapFrame.src = 'https://www.google.com/maps?q=' + encodeURIComponent(s.address) + '&z=16&output=embed';
    }

    // Contact section extras (quick cards + directions)
    setHref('cxCall', s.helpline_number ? 'tel:' + s.helpline_number.replace(/\s+/g,'') : null);
    setText('cxMailText', s.email);
    setHref('cxMail', s.email ? 'mailto:' + s.email : null);
    const mapOpen = document.getElementById('mapOpen');
    if (mapOpen && s.address) mapOpen.setAttribute('href', 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(s.address));

    const waFloat = document.getElementById('floatingWhatsapp');
    if (waFloat && s.whatsapp_link) waFloat.setAttribute('href', s.whatsapp_link);

    // Socials (both contact section + footer + drawer)
    document.querySelectorAll('.social-btn.yt, .float-social .fs.yt, .footer-socials a[aria-label="YouTube"], .mdrawer-social a[aria-label="YouTube"]')
      .forEach(a => { if (s.social_youtube) a.href = s.social_youtube; });
    document.querySelectorAll('.social-btn.fb, .float-social .fs.fb, .footer-socials a[aria-label="Facebook"], .mdrawer-social a[aria-label="Facebook"]')
      .forEach(a => { if (s.social_facebook) a.href = s.social_facebook; });
    document.querySelectorAll('.social-btn.ig, .float-social .fs.ig, .footer-socials a[aria-label="Instagram"], .mdrawer-social a[aria-label="Instagram"]')
      .forEach(a => { if (s.social_instagram) a.href = s.social_instagram; });
  }
  applySiteSettings();

  /* ---------- EDITABLE WEBSITE CONTENT (Admin Panel -> Website Content) ---------- */
  function escHtml(v) {
    return String(v === undefined || v === null ? '' : v)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  // Only allow safe link schemes (blocks javascript: etc.)
  function safeHref(u) {
    u = String(u || '').trim();
    if (!u) return '#';
    if (/^(https?:|tel:|mailto:|#|\/|\.\/|\.\.\/|[a-z0-9_\-]+\.html)/i.test(u)) return u;
    return '#';
  }
  function safeIcon(c) {
    return /^[a-z0-9\- ]+$/i.test(c || '') ? c : 'fa-solid fa-link';
  }
  function renderSiteContent() {
    const s = siteSettings;
    const q = (sel) => document.querySelector(sel);

    // ---- Theme colours (Admin -> Website Content -> Design colours)
    const root = document.documentElement.style;
    if (s.theme_nav) root.setProperty('--nav', s.theme_nav);
    if (s.theme_accent) root.setProperty('--gold', s.theme_accent);
    if (s.theme_primary) { root.setProperty('--primary', s.theme_primary); }

    // ---- SEO / page title
    if (s.seo_title) document.title = s.seo_title;
    if (s.seo_description) {
      const md = q('meta[name="description"]');
      if (md) md.setAttribute('content', s.seo_description);
    }

    // ---- Brand
    const brandMain = document.getElementById('brandMain');
    if (brandMain && s.site_title) brandMain.textContent = s.site_title;
    const joinLogo = document.getElementById('joinLogo');
    if (joinLogo && s.logo_url) joinLogo.src = s.logo_url;

    // ---- Simple text boxes: any element with data-s="key" (text) / data-sh="key" (link)
    document.querySelectorAll('[data-s]').forEach(el => {
      const v = s[el.getAttribute('data-s')];
      if (v !== undefined && v !== null && v !== '') el.textContent = v;
    });
    document.querySelectorAll('[data-sh]').forEach(el => {
      const v = s[el.getAttribute('data-sh')];
      if (v) el.setAttribute('href', safeHref(v));
    });
    const promoLink = s.promo_btn_link;

    // ---- Header: menu + 2 buttons (desktop) / drawer (mobile)
    const ctaText = s.cta_text || 'Admission';
    const ctaHref = safeHref(s.cta_link || 'tel:+916207434940');
    const navCta = document.getElementById('navCta');
    if (navCta) { navCta.textContent = ctaText; navCta.setAttribute('href', ctaHref); }
    const navBtn2 = document.getElementById('navBtn2');
    if (navBtn2) {
      if (s.header_btn2_text) {
        navBtn2.style.display = '';
        navBtn2.querySelector('span').textContent = s.header_btn2_text;
        navBtn2.setAttribute('href', safeHref(s.header_btn2_link || '#result'));
      } else navBtn2.style.display = 'none';
    }
    if (Array.isArray(s.nav_links) && s.nav_links.length) {
      const mainNav = document.getElementById('mainNav');
      const drawer = document.getElementById('mobileDrawer');
      if (mainNav) {
        mainNav.innerHTML = s.nav_links.filter(n => n.header !== false).map((n, i) =>
          `<a href="${escHtml(safeHref(n.href))}" class="nav-link ${i === 0 ? 'active' : ''}">${escHtml(n.label)}</a>`).join('');
      }
      if (drawer) {
        const social = drawer.querySelector('.mdrawer-social');
        const socialHtml = social ? social.outerHTML : '';
        drawer.innerHTML = s.nav_links.map(n =>
          `<a href="${escHtml(safeHref(n.href))}" class="mdrawer-link"><i class="${escHtml(safeIcon(n.icon))}"></i> ${escHtml(n.label)}</a>`).join('') +
          `<a href="${escHtml(ctaHref)}" class="mdrawer-cta"><i class="fa-solid fa-phone"></i> ${escHtml(ctaText)}${s.helpline_number && /^tel:/i.test(ctaHref) ? ': ' + escHtml(s.helpline_number.replace('+91','').trim()) : ''}</a>` + socialHtml;
        drawer.querySelectorAll('.mdrawer-link, .mdrawer-cta').forEach(l => l.addEventListener('click', closeDrawer));
      }
    }

    // ---- Hero background photo (optional)
    const heroBg = document.getElementById('heroBgImg');
    if (heroBg && s.hero_bg_url) heroBg.style.backgroundImage = `url("${String(s.hero_bg_url).replace(/"/g, '%22')}")`;

    // ---- Toppers ticker (pills)
    const ticker = document.getElementById('tickerTrack');
    const tickerSec = document.getElementById('tickerSection');
    const ach = (Array.isArray(s.achievers) ? s.achievers : []).filter(a => a && (a.name || a.rank));
    if (ticker && tickerSec) {
      if (!ach.length) tickerSec.style.display = 'none';
      else {
        tickerSec.style.display = '';
        const pill = a => `<div class="ticker-pill">
          ${a.image_url ? `<img src="${escHtml(a.image_url)}" alt="" loading="lazy">` : `<span class="tp-av">${escHtml((a.name || '?').trim().charAt(0).toUpperCase())}</span>`}
          <span class="tp-t"><b>${escHtml(a.name)}</b><small>${escHtml(a.rank)}</small></span></div>`;
        const one = ach.map(pill).join('');
        ticker.innerHTML = one + one + one;
      }
    }

    // ---- Subject cards
    const sc = document.getElementById('subjectCards');
    if (sc && Array.isArray(s.subject_cards) && s.subject_cards.length) {
      sc.innerHTML = s.subject_cards.map((c, i) => `
        <div class="subject-card" data-aos="fade-up" data-aos-delay="${i * 80}">
          <div class="subject-icon-3d ${['physics','chemistry','maths'].includes(c.color) ? c.color : 'physics'}"><i class="${escHtml(safeIcon(c.icon))}"></i></div>
          <div><h3>${escHtml(c.name)}</h3><p>${escHtml(c.text)}</p></div>
        </div>`).join('');
    }

    // ---- Promo banner: image banners if admin added any, else text banner
    const promoBox = document.getElementById('promoBox');
    const promoSec = document.getElementById('promoSection');
    if (promoBox) {
      const banners = (Array.isArray(s.promo_banners) ? s.promo_banners : []).filter(b => b && b.image_url);
      if (banners.length) {
        promoBox.innerHTML = banners.map(b => {
          const img = `<img src="${escHtml(b.image_url)}" alt="${escHtml(b.title || 'Banner')}" loading="lazy">`;
          return `<div class="promo-img">${b.link ? `<a href="${escHtml(safeHref(b.link))}" ${/^https?:/i.test(b.link) ? 'target="_blank" rel="noopener"' : ''}>${img}</a>` : img}</div>`;
        }).join('');
      } else if (s.promo_title || s.promo_text) {
        promoBox.innerHTML = `<div class="promo-text">
          <div><h3>${escHtml(s.promo_title)}</h3><p>${escHtml(s.promo_text)}</p></div>
          ${s.promo_btn_text ? `<a class="btn btn-gold" href="${escHtml(safeHref(promoLink))}" ${/^https?:/i.test(promoLink || '') ? 'target="_blank" rel="noopener"' : ''}>${escHtml(s.promo_btn_text)}</a>` : ''}
        </div>`;
      } else if (promoSec) promoSec.style.display = 'none';
    }

    // ---- Proud moments (topper photo cards)
    const pg = document.getElementById('proudGrid');
    const tsec = document.getElementById('toppers');
    const pm = (Array.isArray(s.proud_moments) ? s.proud_moments : []).filter(p => p && (p.name || p.image_url));
    if (pg && tsec) {
      if (!pm.length) tsec.style.display = 'none';
      else {
        tsec.style.display = '';
        pg.innerHTML = pm.map((p, i) => `
          <div class="proud-card" data-aos="fade-up" data-aos-delay="${(i % 4) * 80}">
            <div class="proud-img">${p.image_url
              ? `<img src="${escHtml(p.image_url)}" alt="${escHtml(p.name)}" loading="lazy">`
              : `<div class="proud-ph"><i class="fa-solid fa-user-graduate"></i></div>`}</div>
            <div class="proud-cap">
              ${p.rank ? `<span class="proud-rank">${escHtml(p.rank)}</span>` : ''}
              <b>${escHtml(p.name)}</b>
              ${p.sub ? `<small>${escHtml(p.sub)}</small>` : ''}
            </div>
          </div>`).join('');
      }
    }

    // ---- About: 4 vision cards
    const ac = document.getElementById('aboutCards');
    if (ac) {
      const cards = Array.isArray(s.about_cards) ? s.about_cards.filter(c => c && (c.title || c.text)) : [];
      ac.innerHTML = cards.map(c => `
        <div class="about-card" ${c.image_url ? `style="background-image:url('${String(c.image_url).replace(/'/g, '%27')}')"` : ''}>
          <div class="about-card-in">
            ${c.tag ? `<span class="ac-tag">${escHtml(c.tag)}</span>` : ''}
            <h4>${escHtml(c.title)}</h4>
            <p>${escHtml(c.text)}</p>
          </div>
        </div>`).join('');
      ac.style.display = cards.length ? '' : 'none';
    }
    const aboutCta = document.getElementById('aboutCta');
    if (aboutCta && s.helpline_number) aboutCta.setAttribute('href', 'tel:' + s.helpline_number.replace(/\s+/g, ''));

    // ---- Why cards
    const whyGrid = q('.why-grid');
    if (whyGrid && Array.isArray(s.why_cards) && s.why_cards.length) {
      whyGrid.innerHTML = s.why_cards.map((c, i) => `
        <div class="why-card" data-aos="fade-up" data-aos-delay="${(i % 3) * 80}">
          <div class="why-icon"><i class="${escHtml(safeIcon(c.icon))}"></i></div>
          <h3>${escHtml(c.title)}</h3>
          <p>${escHtml(c.text)}</p>
        </div>`).join('');
    }

    // ---- Join section: points + image carousel
    const jp = document.getElementById('joinPoints');
    if (jp) jp.innerHTML = (Array.isArray(s.join_points) ? s.join_points : []).filter(p => p && p.text)
      .map(p => `<li><i class="fa-solid fa-circle-check"></i> ${escHtml(p.text)}</li>`).join('');
    const jc = document.getElementById('joinCarousel');
    const jimgs = (Array.isArray(s.join_images) ? s.join_images : []).filter(i => i && i.image_url);
    if (jc) {
      if (!jimgs.length) jc.style.display = 'none';
      else {
        jc.style.display = '';
        jc.innerHTML = `<div class="jc-stage">${jimgs.map((i, n) => `<img class="jc-slide ${n === 0 ? 'active' : ''}" src="${escHtml(i.image_url)}" alt="" loading="lazy">`).join('')}</div>
          <div class="jc-dots">${jimgs.map((_, n) => `<span class="${n === 0 ? 'active' : ''}"></span>`).join('')}</div>`;
        let cur = 0;
        const slides = jc.querySelectorAll('.jc-slide'), dots = jc.querySelectorAll('.jc-dots span');
        clearInterval(window.__jcTimer);
        const go = (n) => { slides[cur].classList.remove('active'); dots[cur].classList.remove('active'); cur = n; slides[cur].classList.add('active'); dots[cur].classList.add('active'); };
        dots.forEach((d, n) => d.addEventListener('click', () => go(n)));
        if (jimgs.length > 1) window.__jcTimer = setInterval(() => go((cur + 1) % jimgs.length), 3600);
      }
    }

    // ---- Footer text + brand
    const fa = q('.footer-about');
    if (fa && s.footer_about) fa.textContent = s.footer_about;
    if (s.site_title) { const fh = q('.footer-logo h3'); if (fh) fh.textContent = s.site_title; }
    if (s.site_tagline) {
      const fp = q('.footer-logo p'); if (fp) fp.textContent = s.site_tagline;
      const bs = q('.brand-sub'); if (bs) bs.textContent = s.site_tagline;
    }

    // ---- Footer "Links" column: standard links + extra admin-added links
    const linkCol = q('.footer-col:nth-child(2) ul');
    if (linkCol && Array.isArray(s.footer_extra_links) && s.footer_extra_links.length) {
      linkCol.innerHTML += s.footer_extra_links.map(l =>
        `<li><a href="${escHtml(safeHref(l.href))}" ${/^https?:/i.test(l.href || '') ? 'target="_blank" rel="noopener"' : ''}>${escHtml(l.label)}</a></li>`).join('');
    }

    // ---- Extra social icons (Telegram, X, LinkedIn ... any FontAwesome brand)
    if (Array.isArray(s.extra_socials) && s.extra_socials.length) {
      const mk = (cls) => s.extra_socials.map(x =>
        `<a href="${escHtml(safeHref(x.url))}" target="_blank" rel="noopener" aria-label="${escHtml(x.label || '')}" class="${cls}"${cls === 'social-btn' ? ' style="background:#4338CA"' : ''}><i class="${escHtml(safeIcon(x.icon))}"></i></a>`).join('');
      const cs = document.getElementById('contactSocials');
      if (cs) cs.insertAdjacentHTML('beforeend', mk('social-btn'));
      const fs = document.getElementById('footerSocials');
      if (fs) fs.insertAdjacentHTML('beforeend', mk(''));
      const ds = q('.mdrawer-social');
      if (ds) ds.insertAdjacentHTML('beforeend', mk(''));
      const fl = document.getElementById('floatSocial');
      if (fl) fl.insertAdjacentHTML('beforeend', mk('fs gen'));
    }
  }
  renderSiteContent();

  /* ---------- COUNTER ANIMATION (declared early; used by renderHero) ---------- */
  let counterObserver;
  function setupCounters() {
    if (counterObserver) counterObserver.disconnect();
    const counters = document.querySelectorAll('.num[data-count]');
    counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach(c => counterObserver.observe(c));
  }

  function animateCounter(el) {
    const target = parseInt(el.getAttribute('data-count'), 10);
    let count = 0;
    const duration = 1400;
    const stepTime = Math.max(Math.floor(duration / target), 12);
    const timer = setInterval(() => {
      count++;
      el.textContent = count;
      if (count >= target) {
        el.textContent = target;
        clearInterval(timer);
      }
    }, stepTime);
  }

  /* =========================================================
     HERO SLIDER (built dynamically from heroSlides)
  ========================================================= */
  const heroSlider = document.getElementById('heroSlider');
  const dotsContainer = document.getElementById('heroDots');
  let currentSlide = 0;
  let sliderInterval;

  function renderHero() {
    const st = siteSettings;
    const chips = Array.isArray(st.hero_chips) ? st.hero_chips.filter(c => c && c.title) : [];
    const stats = Array.isArray(st.hero_stats) ? st.hero_stats.filter(x => x && (x.label || x.num)) : [];
    let html = '';
    heroSlides.forEach((slide, i) => {
      html += `<div class="hero-slide ${i === 0 ? 'active' : ''}" data-slide="${i}">
        <div class="hero-content">
          <div class="hero-badge">
            <span class="hb-medal"><i class="fa-solid fa-award"></i></span>
            <span class="hb-t">
              <small>${escHtml(st.hero_badge_small || '')}</small>
              <b>${slide.eyebrow || escHtml(st.hero_badge_sub || '')}</b>
            </span>
          </div>
          <h1 class="hero-title">
            <span class="line1">${slide.line1 || ''}</span>
            <span class="line2">${slide.line2 || ''} <span class="highlight">${slide.highlight || ''}</span></span>
          </h1>
          <p class="hero-desc">${slide.description || ''}</p>
          <div class="hero-btns">
            ${slide.btn1_text ? `<a href="${escHtml(safeHref(slide.btn1_link))}" class="btn btn-gold">${slide.btn1_text}</a>` : ''}
            ${slide.btn2_text ? `<a href="${escHtml(safeHref(slide.btn2_link))}" class="btn btn-outline">${slide.btn2_text}</a>` : ''}
          </div>
          ${stats.length ? `<div class="hero-stats">
            ${stats.map(x => `<div class="stat"><b><span class="num" data-count="${parseInt(x.num, 10) || 0}">0</span>${escHtml(x.suffix || '')}</b><small>${escHtml(x.label || '')}</small></div>`).join('')}
          </div>` : ''}
        </div>
        <div class="hero-visual">
          <div class="hero-circle"><img src="${escHtml(slide.image_url || 'assets/img/teacher.webp')}" alt="${escHtml(slide.line1 || 'CWA Science Classes')}" class="hero-float-img"></div>
          ${chips.slice(0, 4).map((c, n) => `<div class="hero-chip hc${n + 1}"><b>${escHtml(c.title)}</b><small>${escHtml(c.sub || '')}</small></div>`).join('')}
          ${st.hero_tag_name ? `<div class="hero-nametag"><b>${escHtml(st.hero_tag_name)}</b><small>${escHtml(st.hero_tag_role || '')}</small></div>` : ''}
        </div>
      </div>`;
    });
    heroSlider.innerHTML = html;

    dotsContainer.innerHTML = '';
    heroSlides.forEach((_, i) => {
      const dot = document.createElement('span');
      dot.classList.add('dot');
      if (i === 0) dot.classList.add('active');
      dot.addEventListener('click', () => goToSlide(i));
      dotsContainer.appendChild(dot);
    });
    dotsContainer.style.display = heroSlides.length > 1 ? '' : 'none';

    // (re)start counter observation for any new .num elements
    setupCounters();
  }

  function goToSlide(index) {
    const slides = document.querySelectorAll('.hero-slide');
    const dots = document.querySelectorAll('.hero-dots .dot');
    if (!slides.length) return;
    slides[currentSlide].classList.remove('active');
    dots[currentSlide].classList.remove('active');
    currentSlide = index;
    slides[currentSlide].classList.add('active');
    dots[currentSlide].classList.add('active');
  }
  function nextSlide() {
    const slides = document.querySelectorAll('.hero-slide');
    if (!slides.length) return;
    goToSlide((currentSlide + 1) % slides.length);
  }
  function startSlider() {
    clearInterval(sliderInterval);
    sliderInterval = setInterval(nextSlide, 5500);
  }

  renderHero();
  startSlider();

  const heroSection = document.getElementById('home');
  heroSection.addEventListener('mouseenter', () => clearInterval(sliderInterval));
  heroSection.addEventListener('mouseleave', startSlider);

  /* =========================================================
     NOTICE MARQUEE (built dynamically from notices)
  ========================================================= */
  const marqueeTrack = document.getElementById('marqueeTrack');
  if (marqueeTrack) {
    const itemsHtml = notices.map(n => `<span>${n} &nbsp;•&nbsp;</span>`).join('');
    // duplicate for seamless loop
    marqueeTrack.innerHTML = itemsHtml + itemsHtml;
  }

  /* ---------- FOOTER YEAR ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* =========================================================
     FOOTER "CLASSES" LIST (extensible beyond Class 12)
  ========================================================= */
  const footerClasses = document.getElementById('footerClasses');
  if (footerClasses && batchesData.batches && batchesData.batches.length) {
    footerClasses.innerHTML = batchesData.batches
      .map(b => `<li><a href="class.html#${encodeURIComponent(b.id)}">${CWA.esc(b.title)}</a></li>`).join('');
  }

  /* =========================================================
     CLASS CARDS (Class 9 / 10 / 11 / 12)
     Card par click -> alag page: class.html#<batchId>
     (Class -> 3 subjects -> chapters -> videos + PPT/PDF).
     Paid class = lock badge, Free class = open badge.
  ========================================================= */
  const classGrid = document.getElementById('classGrid');
  function renderClassCards() {
    if (!classGrid) return;
    const list = (batchesData && batchesData.batches) || [];
    if (!list.length) {
      classGrid.innerHTML = '<p class="cls-empty">Batches jaldi aa rahe hain...</p>';
      return;
    }
    classGrid.innerHTML = list.map((b, i) => {
      const free = b.is_free !== false;
      const st = CWA.stats(b);
      const col = CWA.safeColor(b.color, '#4C3CE3');
      const img = CWA.safeUrl(b.image_url);
      return `
      <a class="cls-card ${free ? 'is-free' : 'is-paid'}" href="class.html#${encodeURIComponent(b.id)}" style="--c:${col}" data-aos="fade-up" data-aos-delay="${(i % 4) * 70}">
        <div class="cls-top">
          ${img ? `<img class="cls-cover" src="${CWA.esc(img)}" alt="" loading="lazy">` : ''}
          <span class="cls-ghost">${CWA.esc(b.class)}</span>
          <span class="cls-pill ${free ? 'free' : 'paid'}"><i class="fa-solid fa-${free ? 'lock-open' : 'lock'}"></i> ${free ? 'FREE' : 'PAID'}</span>
          <div class="cls-top-in">
            <small>CLASS</small>
            <b>${CWA.esc(b.class)}</b>
          </div>
          ${free ? '' : '<span class="cls-lockbadge"><i class="fa-solid fa-lock"></i></span>'}
        </div>
        <div class="cls-body">
          <h3>${CWA.esc(b.title)}</h3>
          <p class="cls-sub">${CWA.esc(b.subtitle || '')}</p>
          ${b.offer_text ? `<p class="cls-offer"><i class="fa-solid fa-tags"></i> ${CWA.esc(b.offer_text)}</p>` : ''}
          <div class="cls-subjects">
            ${(b.subjects || []).map(s => `<span style="--sc:${CWA.subjectMeta(s.name).color}"><i class="fa-solid fa-${CWA.subjectIcon(s)}"></i>${CWA.esc(s.name)}</span>`).join('')}
          </div>
          <div class="cls-stats">
            <span><b>${st.chapters}</b> Chapters</span>
            <span><b>${st.videos}</b> Videos</span>
            <span><b>${st.notes}</b> Notes</span>
          </div>
          <div class="cls-foot">
            ${!free && b.price ? `<span class="cls-price">₹${CWA.esc(b.price)}</span>` : `<span class="cls-price ${free ? 'free' : ''}">${free ? 'Bilkul Free' : 'Paid Batch'}</span>`}
            <span class="cls-go">${free ? 'Batch Kholein' : 'Batch Dekhein'} <i class="fa-solid fa-arrow-right"></i></span>
          </div>
        </div>
      </a>`;
    }).join('');
    if (window.AOS) AOS.refreshHard();
  }
  renderClassCards();

  /* =========================================================
     WEEKLY TEST RESULT LOOKUP
     -----------------------------------------------------------
     Duplicate-mobile-safe: the same mobile number can legitimately
     belong to more than one student (siblings in different classes,
     or two students sharing a guardian's phone). We therefore:
       1. Look up ALL students matching (class + mobile).
       2. If exactly one match -> show it directly.
       3. If more than one match -> ask the user to pick their name
          before showing the result (keys on class+mobile+name).
     When Supabase is configured this calls the get_public_result()
     RPC function (which also enforces the 3-day validity window).
     Otherwise it uses the local RESULTS_DATA fallback (no expiry).
  ========================================================= */
  const resultForm = document.getElementById('resultForm');
  const resultOutput = document.getElementById('resultOutput');
  const resultError = document.getElementById('resultError');
  const resultTableBody = document.getElementById('resultTableBody');
  const resultSummary = document.getElementById('resultSummary');

  const gradeColors = {
    'A+': '#00C2A8', 'A': '#4C3CE3', 'B+': '#6C63FF',
    'B': '#FFA630', 'C': '#FF8E53', 'D': '#FF6B6B'
  };

  // Simple name-picker UI injected right above the result output
  let namePickerBox = document.getElementById('namePickerBox');
  if (!namePickerBox) {
    namePickerBox = document.createElement('div');
    namePickerBox.id = 'namePickerBox';
    namePickerBox.style.display = 'none';
    namePickerBox.style.marginTop = '20px';
    namePickerBox.innerHTML = `<p style="font-weight:700;margin-bottom:10px;color:var(--dark2);">Is number ke sath multiple students milte hain. Apna naam chunein:</p>
      <div id="namePickerList" style="display:flex;flex-wrap:wrap;gap:10px;"></div>`;
    resultForm.parentNode.insertBefore(namePickerBox, resultOutput);
  }

  // Normalizes a test's subject-marks into a flexible array whether it came
  // from the new Supabase jsonb `subjects` field or the OLD local-fallback
  // fixed physics/chemistry/maths format (js/results-data.js) — so the
  // rendering code below only ever needs to loop over `t.subjects`.
  function normalizeTestSubjects(t) {
    if (t.subjects && t.subjects.length) return t.subjects;
    if (t.physics !== undefined || t.chemistry !== undefined || t.maths !== undefined) {
      const per = Math.round((t.outOf || 75) / 3);
      return [
        { name: 'Physics', marks: t.physics, max_marks: per },
        { name: 'Chemistry', marks: t.chemistry, max_marks: per },
        { name: 'Maths', marks: t.maths, max_marks: per }
      ];
    }
    return [];
  }

  async function fetchMatches(cls, mobile) {
    if (typeof IS_SUPABASE_CONFIGURED !== 'undefined' && IS_SUPABASE_CONFIGURED) {
      const { data, error } = await supabaseClient.rpc('get_public_result', { p_class: cls, p_mobile: mobile });
      if (error) { console.warn(error); return []; }
      return (data || []).map(row => ({
        name: row.student_name, class: row.student_class, mobile: row.student_mobile, tests: row.tests || []
      }));
    }
    if (typeof RESULTS_DATA === 'undefined') return [];
    return RESULTS_DATA.students.filter(s => s.class === cls && s.mobile === mobile);
  }

  // Builds the result table's <thead> dynamically based on the union of
  // subjects appearing across this student's tests (instead of a hardcoded
  // Physics/Chemistry/Maths header) — supports Weekly Tests that cover just
  // 1, 2, or any number of subjects.
  function buildResultThead(tests) {
    const subjectNames = [];
    tests.forEach(t => normalizeTestSubjects(t).forEach(s => { if (!subjectNames.includes(s.name)) subjectNames.push(s.name); }));
    const thead = document.querySelector('.result-table thead');
    if (!thead) return subjectNames;
    thead.innerHTML = `<tr>
      <th>Test</th>
      <th>Date</th>
      ${subjectNames.map(n => `<th>${n}</th>`).join('')}
      <th>Total</th>
      <th>%</th>
      <th>Grade</th>
    </tr>`;
    return subjectNames;
  }

  function showStudentResult(student) {
    document.getElementById('rName').textContent = student.name;
    document.getElementById('rMeta').textContent = `Class ${student.class} | Mobile: ${student.mobile}`;

    const tests = student.tests || [];
    const subjectNames = buildResultThead(tests);

    let rowsHtml = '';
    let totalPct = 0;
    tests.forEach(t => {
      totalPct += Number(t.percentage) || 0;
      const color = gradeColors[t.grade] || '#4C3CE3';
      const subjects = normalizeTestSubjects(t);
      const marksByName = {};
      subjects.forEach(s => { marksByName[s.name] = { marks: s.marks, max: s.max_marks }; });
      rowsHtml += `
        <tr>
          <td>${t.testName}</td>
          <td>${formatDate(t.date)}</td>
          ${subjectNames.map(n => {
            const m = marksByName[n];
            return `<td>${m ? `${m.marks ?? '-'}${m.max ? `<small>/${m.max}</small>` : ''}` : '-'}</td>`;
          }).join('')}
          <td><strong>${t.total}</strong>${t.outOf ? `<small>/${t.outOf}</small>` : ''}</td>
          <td>${t.percentage}%</td>
          <td><span class="grade-pill" style="background:${color}">${t.grade}</span></td>
        </tr>`;
    });
    resultTableBody.innerHTML = rowsHtml;

    const testCount = (student.tests || []).length || 1;
    const avgPct = (totalPct / testCount).toFixed(1);
    const bestTest = (student.tests && student.tests.length)
      ? student.tests.reduce((a, b) => (a.percentage > b.percentage ? a : b))
      : { percentage: 0, grade: '-' };

    resultSummary.innerHTML = `
      <div class="summary-item"><div class="val">${(student.tests || []).length}</div><div class="lab">Tests Taken</div></div>
      <div class="summary-item"><div class="val">${avgPct}%</div><div class="lab">Average Score</div></div>
      <div class="summary-item"><div class="val">${bestTest.percentage}%</div><div class="lab">Best Score</div></div>
      <div class="summary-item"><div class="val">${bestTest.grade}</div><div class="lab">Best Grade</div></div>
    `;

    namePickerBox.style.display = 'none';
    resultOutput.style.display = 'block';
    resultOutput.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  // Class chooser buttons (9 / 10 / 11 / 12) -> hidden #resultClass
  const classChoice = document.getElementById('classChoice');
  const classHidden = document.getElementById('resultClass');
  if (classChoice) {
    classChoice.addEventListener('click', (ev) => {
      const btn = ev.target.closest('.cc-btn');
      if (!btn) return;
      classChoice.querySelectorAll('.cc-btn').forEach(b => b.classList.remove('on'));
      btn.classList.add('on');
      classHidden.value = btn.dataset.v;
      classChoice.classList.remove('shake');
    });
  }

  resultForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const cls = classHidden.value.trim();
    const mobile = document.getElementById('resultMobile').value.trim();
    if (!cls) {
      classChoice.classList.remove('shake'); void classChoice.offsetWidth; classChoice.classList.add('shake');
      return;
    }
    if (!/^\d{10}$/.test(mobile)) { document.getElementById('resultMobile').focus(); return; }
    const submitBtn = resultForm.querySelector('.btn-primary');
    const btnOriginalHtml = submitBtn.innerHTML;

    resultOutput.style.display = 'none';
    resultError.style.display = 'none';
    namePickerBox.style.display = 'none';

    // Small animated "loading" state so the button gives instant feedback
    submitBtn.classList.add('loading');
    submitBtn.innerHTML = '<i class="fa-solid fa-circle-notch"></i> Result Dhoondh Rahe Hain...';

    // tiny artificial delay so the loading animation is visible even on
    // instant local-fallback lookups (feels more alive / responsive)
    const [matches] = await Promise.all([
      fetchMatches(cls, mobile),
      new Promise(res => setTimeout(res, 450))
    ]);

    submitBtn.classList.remove('loading');
    submitBtn.innerHTML = btnOriginalHtml;

    if (!matches || matches.length === 0) {
      resultError.style.display = 'flex';
      resultError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    if (matches.length === 1) {
      showStudentResult(matches[0]);
      return;
    }

    // Multiple students share this class+mobile -> let them pick by name
    const listEl = document.getElementById('namePickerList');
    listEl.innerHTML = matches.map((m, i) =>
      `<button type="button" class="btn btn-outline name-pick-btn" data-idx="${i}" style="color:var(--primary);border-color:var(--primary);background:rgba(76,60,227,0.08);">${m.name}</button>`
    ).join('');
    listEl.querySelectorAll('.name-pick-btn').forEach(btn => {
      btn.addEventListener('click', () => showStudentResult(matches[parseInt(btn.dataset.idx, 10)]));
    });
    namePickerBox.style.display = 'block';
    namePickerBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });

  function formatDate(dateStr) {
    const d = new Date(dateStr);
    if (isNaN(d)) return dateStr;
    const options = { day: '2-digit', month: 'short', year: 'numeric' };
    return d.toLocaleDateString('en-IN', options);
  }

  // Only allow digits in mobile input
  const mobileInput = document.getElementById('resultMobile');
  mobileInput.addEventListener('input', () => {
    mobileInput.value = mobileInput.value.replace(/\D/g, '').slice(0, 10);
  });

  /* =========================================================
     CONTACT FORM -> WhatsApp (message prefilled, no backend needed)
  ========================================================= */
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    const cfMobile = document.getElementById('cfMobile');
    cfMobile.addEventListener('input', () => { cfMobile.value = cfMobile.value.replace(/\D/g, '').slice(0, 10); });
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const err = document.getElementById('cfErr');
      const name = document.getElementById('cfName').value.trim();
      const mobile = cfMobile.value.trim();
      const cls = document.getElementById('cfClass').value;
      const msg = document.getElementById('cfMsg').value.trim();
      err.textContent = '';
      if (!name) { err.textContent = 'Kripya apna naam likhein.'; return; }
      if (!/^\d{10}$/.test(mobile)) { err.textContent = 'Sahi 10 digit mobile number daalein.'; return; }
      const text = `Namaste, main ${name} hoon.\n` + (cls ? `Class: ${cls}\n` : '') + `Mobile: ${mobile}\n` + (msg ? `Message: ${msg}` : 'Mujhe admission ke bare mein jaankari chahiye.');
      window.open(CWA.waLink(siteSettings.whatsapp_link, text), '_blank', 'noopener');
    });
  }

});
