/* =========================================================
   CWA SCIENCE CLASSES — CLASS PAGE (class.html#<batchId>)
   Class -> Subject cards -> Chapters (accordion) -> Videos (with names) + PPT/PDF
   PAID batch  = lock on every chapter + "Unlock" popup (payment / WhatsApp / call)
   FREE batch  = everything open
   Data comes from Supabase (admin panel) or the local fallback via CWA.loadBatches().
========================================================= */
document.addEventListener('DOMContentLoaded', async () => {
  const app = document.getElementById('classApp');
  const E = CWA.esc;
  let batches = [], settings = {}, current = null, subjectIdx = 0;

  /* ---------- header drawer ---------- */
  const hb = document.getElementById('hamburger'), dr = document.getElementById('mobileDrawer'), ov = document.getElementById('drawerOverlay');
  const toggleDrawer = (open) => { hb.classList.toggle('open', open); dr.classList.toggle('open', open); ov.classList.toggle('open', open); document.body.style.overflow = open ? 'hidden' : ''; };
  hb.addEventListener('click', () => toggleDrawer(!dr.classList.contains('open')));
  ov.addEventListener('click', () => toggleDrawer(false));
  dr.querySelectorAll('a').forEach(a => a.addEventListener('click', () => toggleDrawer(false)));
  document.getElementById('year').textContent = new Date().getFullYear();

  /* ---------- load data ---------- */
  [settings, { batches }] = await Promise.all([CWA.loadSettings(), CWA.loadBatches()]);
  applySettings();

  function applySettings() {
    const s = settings;
    const logo = CWA.safeUrl(s.logo_url);
    if (logo) document.getElementById('headerLogo').src = logo;
    if (s.site_title) document.getElementById('brandMain').textContent = s.site_title;
    if (s.site_tagline) { const b = document.querySelector('.brand-sub'); if (b) b.textContent = s.site_tagline; }
    const tel = s.helpline_number ? 'tel:' + s.helpline_number.replace(/\s+/g, '') : '';
    if (tel) {
      document.getElementById('navCta').setAttribute('href', tel);
      const dc = document.getElementById('drawerCta'); dc.setAttribute('href', tel);
      dc.innerHTML = '<i class="fa-solid fa-phone"></i> Call Now: ' + E(s.helpline_number);
    }
    if (s.whatsapp_link) document.getElementById('floatingWhatsapp').setAttribute('href', s.whatsapp_link);
    if (s.theme_nav) document.documentElement.style.setProperty('--nav', s.theme_nav);
    if (s.theme_accent) document.documentElement.style.setProperty('--gold', s.theme_accent);
  }

  /* ---------- routing: #class9  or  #class9/1 (subject index) ---------- */
  function parseHash() {
    const h = decodeURIComponent(location.hash.replace(/^#/, ''));
    const [id, si] = h.split('/');
    return { id, si: parseInt(si, 10) || 0 };
  }
  function route() {
    if (!batches.length) { renderEmpty(); return; }
    const { id, si } = parseHash();
    current = batches.find(b => b.id === id) || batches.find(b => String(b.class) === String(id).replace(/^class/i, '')) || null;
    if (!current) { renderPicker(); return; }
    subjectIdx = Math.min(Math.max(si, 0), Math.max((current.subjects || []).length - 1, 0));
    renderClass();
  }
  window.addEventListener('hashchange', () => { route(); window.scrollTo({ top: 0 }); });

  /* ---------- views ---------- */
  function renderEmpty() {
    document.title = 'Batches | CWA SCIENCE CLASSES';
    app.innerHTML = `<div class="cp-empty"><i class="fa-solid fa-layer-group"></i><h2>Abhi koi batch available nahi hai</h2><a class="btn btn-gold" href="index.html">Home Par Jayein</a></div>`;
  }

  function switcher() {
    return `<div class="cp-switch" role="tablist">${batches.map(b => {
      const free = b.is_free !== false;
      return `<a class="cp-sw ${current && b.id === current.id ? 'on' : ''}" role="tab" href="#${encodeURIComponent(b.id)}">
        <span>Class ${E(b.class)}</span><i class="fa-solid fa-${free ? 'lock-open' : 'lock'} ${free ? 'f' : 'p'}"></i></a>`;
    }).join('')}</div>`;
  }

  function renderPicker() {
    document.title = 'Apni Class Chunein | CWA SCIENCE CLASSES';
    app.innerHTML = `<section class="cp-hero"><div class="cp-wrap">
      <a class="cp-back" href="index.html#batches"><i class="fa-solid fa-arrow-left"></i> Home</a>
      <h1>Apni <span>Class</span> Chunein</h1>
      <p>Batch chunein aur subject-wise chapters, videos aur notes dekhein.</p>
      ${switcher()}</div></section>`;
  }

  function renderClass() {
    const b = current, free = b.is_free !== false, st = CWA.stats(b);
    const col = CWA.safeColor(b.color, '#4C3CE3');
    document.title = `${b.title} | CWA SCIENCE CLASSES`;
    const subs = b.subjects || [];
    app.innerHTML = `
    <section class="cp-hero" style="--c:${col}">
      <div class="cp-wrap">
        <a class="cp-back" href="index.html#batches"><i class="fa-solid fa-arrow-left"></i> Sabhi Batches</a>
        <div class="cp-hero-grid">
          <div>
            <span class="cp-badge ${free ? 'free' : 'paid'}"><i class="fa-solid fa-${free ? 'lock-open' : 'lock'}"></i> ${free ? 'FREE BATCH' : 'PAID BATCH'}</span>
            <h1>${E(b.title)}</h1>
            <p>${E(b.subtitle || '')}</p>
            ${b.offer_text ? `<p class="cp-offer"><i class="fa-solid fa-tags"></i> ${E(b.offer_text)}</p>` : ''}
            <div class="cp-stats">
              <div><b>${st.subjects}</b><small>Subjects</small></div>
              <div><b>${st.chapters}</b><small>Chapters</small></div>
              <div><b>${st.videos}</b><small>Videos</small></div>
              <div><b>${st.notes}</b><small>PPT / PDF</small></div>
            </div>
          </div>
          <div class="cp-hero-card">
            ${CWA.safeUrl(b.image_url) ? `<img src="${E(CWA.safeUrl(b.image_url))}" alt="${E(b.title)}">` : `<span class="cp-big">${E(b.class)}</span><small>CLASS</small>`}
          </div>
        </div>
        ${switcher()}
      </div>
    </section>

    <section class="cp-body"><div class="cp-wrap">
      ${free ? '' : `<div class="cp-paid-bar">
        <div class="pb-ic"><i class="fa-solid fa-lock"></i></div>
        <div class="pb-t"><b>Ye batch PAID hai - sab chapters locked hain</b><small>Enroll karte hi saare videos aur notes unlock ho jayenge.${b.price ? ` Fees: <strong>₹${E(b.price)}</strong>` : ''}</small></div>
        <button class="btn btn-gold" id="barUnlock"><i class="fa-solid fa-unlock-keyhole"></i> Unlock Karein</button>
      </div>`}

      ${subs.length ? `
      <h2 class="cp-h2">Subject Chunein</h2>
      <div class="cp-subjects">${subs.map((s, i) => {
        const m = CWA.subjectMeta(s.name), ss = CWA.subjectStats(s);
        return `<button class="cp-sub ${i === subjectIdx ? 'on' : ''}" data-i="${i}" style="--sc:${m.color}">
          <span class="cp-sub-ic" style="background:${m.grad}"><i class="fa-solid fa-${CWA.subjectIcon(s)}"></i></span>
          <span class="cp-sub-t"><b>${E(s.name)}</b><small>${ss.chapters} Chapters • ${ss.videos} Videos • ${ss.notes} Notes</small></span>
          <i class="fa-solid fa-${free ? 'chevron-right' : 'lock'} cp-sub-go"></i>
        </button>`;
      }).join('')}</div>
      <div id="chapters"></div>` : `<div class="cp-empty"><i class="fa-solid fa-book-open"></i><h2>Is batch mein abhi subjects add nahi hue</h2></div>`}
    </div></section>`;

    const bar = document.getElementById('barUnlock'); if (bar) bar.onclick = openUnlock;
    app.querySelectorAll('.cp-sub').forEach(btn => btn.addEventListener('click', () => {
      subjectIdx = +btn.dataset.i;
      history.replaceState(null, '', `#${encodeURIComponent(b.id)}/${subjectIdx}`);
      app.querySelectorAll('.cp-sub').forEach(x => x.classList.toggle('on', x === btn));
      renderChapters(true);
    }));
    if (subs.length) renderChapters(false);
  }

  /* ---------- chapters of selected subject ---------- */
  function renderChapters(scroll) {
    const b = current, free = b.is_free !== false, sub = b.subjects[subjectIdx];
    const m = CWA.subjectMeta(sub.name);
    const box = document.getElementById('chapters');
    const chs = sub.chapters || [];
    box.innerHTML = `
      <div class="cp-chap-head" style="--sc:${m.color}">
        <span class="cp-sub-ic" style="background:${m.grad}"><i class="fa-solid fa-${CWA.subjectIcon(sub)}"></i></span>
        <div><h2>${E(sub.name)} - Chapters</h2><small>${chs.length} chapter${chs.length !== 1 ? 's' : ''}${free ? '' : ' • unlock karne ke liye enroll karein'}</small></div>
      </div>
      <div class="cp-chaps">${chs.length ? chs.map((c, i) => chapterHtml(c, i, free)).join('') : '<div class="cp-empty small"><i class="fa-solid fa-hourglass-half"></i><h3>Chapters jaldi aa rahe hain</h3></div>'}</div>`;

    // accordion
    box.querySelectorAll('.cp-chap-top').forEach(top => top.addEventListener('click', () => {
      const card = top.closest('.cp-chap');
      if (!free) { openUnlock(); return; }
      const open = !card.classList.contains('open');
      if (!open) stopPlayer(card);
      card.classList.toggle('open', open);
      top.setAttribute('aria-expanded', open);
    }));
    // locked items -> popup
    box.querySelectorAll('[data-locked]').forEach(el => el.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); openUnlock(); }));
    // video rows
    box.querySelectorAll('.cp-vid:not([data-locked])').forEach(row => row.addEventListener('click', () => playVideo(row)));
    // open the first chapter automatically on free batches
    if (free) { const first = box.querySelector('.cp-chap'); if (first) { first.classList.add('open'); first.querySelector('.cp-chap-top').setAttribute('aria-expanded', 'true'); } }
    if (scroll) box.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function chapterHtml(c, i, free) {
    const vids = c.videos || [], res = c.resources || [];
    const lockAttr = free ? '' : ' data-locked="1"';
    const empty = !vids.length && !res.length;
    return `
    <article class="cp-chap ${free ? '' : 'locked'}">
      <button class="cp-chap-top" aria-expanded="false">
        <span class="cp-num">${String(i + 1).padStart(2, '0')}</span>
        <span class="cp-chap-t">
          <b>${E(c.title)}</b>
          <small>
            <span><i class="fa-solid fa-circle-play"></i> ${vids.length} Video${vids.length !== 1 ? 's' : ''}</span>
            <span><i class="fa-solid fa-file-lines"></i> ${res.length} Notes</span>
          </small>
        </span>
        <i class="fa-solid fa-${free ? 'chevron-down' : 'lock'} cp-chap-ic"></i>
      </button>
      <div class="cp-chap-body"><div class="cp-chap-in">
        ${c.description ? `<p class="cp-desc">${E(c.description)}</p>` : ''}
        ${empty ? '<p class="cp-soon"><i class="fa-solid fa-hourglass-half"></i> Content aane wala hai...</p>' : ''}

        ${vids.length ? `<div class="cp-player" hidden></div>
        <h4 class="cp-sec"><i class="fa-solid fa-circle-play"></i> Video Lectures</h4>
        <div class="cp-vids">${vids.map((v, n) => `
          <div class="cp-vid" ${lockAttr} data-yt="${E(v.youtube)}" data-title="${E(v.title)}" role="button" tabindex="0">
            <span class="cp-thumb"><img src="https://i.ytimg.com/vi/${E(v.youtube)}/mqdefault.jpg" alt="" loading="lazy"><i class="fa-solid fa-${free ? 'play' : 'lock'}"></i></span>
            <span class="cp-vid-t"><b>${E(v.title)}</b><small>${v.duration ? `<i class="fa-regular fa-clock"></i> ${E(v.duration)}` : `Video ${n + 1}`}</small></span>
            <span class="cp-vid-go">${free ? '<i class="fa-solid fa-play"></i>' : '<i class="fa-solid fa-lock"></i>'}</span>
          </div>`).join('')}</div>` : ''}

        ${res.length ? `<h4 class="cp-sec"><i class="fa-solid fa-file-lines"></i> Class PPT / PDF Notes</h4>
        <div class="cp-notes">${res.map(r => {
          const url = CWA.safeUrl(r.url);
          const ppt = /ppt|slide/i.test(r.type || '');
          return free && url
            ? `<a class="cp-note" href="${E(url)}" target="_blank" rel="noopener">
                <span class="cp-note-ic ${ppt ? 'ppt' : ''}"><i class="fa-solid fa-${ppt ? 'file-powerpoint' : 'file-pdf'}"></i></span>
                <span class="cp-note-t"><b>${E(r.type || 'PDF Notes')}</b>${r.description ? `<small>${E(r.description)}</small>` : ''}</span>
                <span class="cp-note-go"><i class="fa-solid fa-arrow-up-right-from-square"></i> Open</span></a>`
            : `<a class="cp-note" href="#" data-locked="1">
                <span class="cp-note-ic ${ppt ? 'ppt' : ''}"><i class="fa-solid fa-${ppt ? 'file-powerpoint' : 'file-pdf'}"></i></span>
                <span class="cp-note-t"><b>${E(r.type || 'PDF Notes')}</b>${r.description ? `<small>${E(r.description)}</small>` : ''}</span>
                <span class="cp-note-go"><i class="fa-solid fa-lock"></i></span></a>`;
        }).join('')}</div>` : ''}
      </div></div>
    </article>`;
  }

  /* ---------- video player (inside the chapter, with the video name) ---------- */
  function stopPlayer(card) {
    const p = card.querySelector('.cp-player');
    if (p) { p.hidden = true; p.innerHTML = ''; }
    card.querySelectorAll('.cp-vid.playing').forEach(v => v.classList.remove('playing'));
  }
  function playVideo(row) {
    const card = row.closest('.cp-chap'), player = card.querySelector('.cp-player');
    // only one video plays on the page
    app.querySelectorAll('.cp-chap').forEach(c => { if (c !== card) stopPlayer(c); });
    const same = row.classList.contains('playing');
    stopPlayer(card);
    if (same) return;
    row.classList.add('playing');
    const id = row.dataset.yt, title = row.dataset.title;
    player.hidden = false;
    player.innerHTML = `
      <div class="cp-player-head"><span><i class="fa-solid fa-circle-play"></i> ${E(title)}</span>
        <button type="button" class="cp-player-x" aria-label="Close video"><i class="fa-solid fa-xmark"></i></button></div>
      <div class="cp-frame"><iframe src="https://www.youtube.com/embed/${E(id)}?autoplay=1&rel=0&playsinline=1&modestbranding=1" title="${E(title)}"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>
      <a class="cp-yt" href="https://www.youtube.com/watch?v=${E(id)}" target="_blank" rel="noopener"><i class="fa-brands fa-youtube"></i> YouTube par dekhein</a>`;
    player.querySelector('.cp-player-x').onclick = () => stopPlayer(card);
    setTimeout(() => player.scrollIntoView({ behavior: 'smooth', block: 'center' }), 80);
  }
  app.addEventListener('keydown', (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.classList.contains('cp-vid')) { e.preventDefault(); e.target.click(); }
  });

  /* ---------- unlock popup (paid batch) ---------- */
  const modal = document.getElementById('unlockModal');
  function openUnlock() {
    const b = current; if (!b) return;
    const s = settings;
    document.getElementById('unlockTitle').textContent = `${b.title} PAID hai`;
    document.getElementById('unlockPrice').innerHTML = b.price ? `Fees: <b>₹${E(b.price)}</b>${b.offer_text ? ` <span>${E(b.offer_text)}</span>` : ''}` : (b.offer_text ? `<span>${E(b.offer_text)}</span>` : '');
    const pay = document.getElementById('unlockPay'), pl = CWA.safeUrl(b.payment_link);
    pay.style.display = pl ? '' : 'none'; if (pl) pay.href = pl;
    document.getElementById('unlockWa').href = CWA.waLink(s.whatsapp_link, `Namaste, mujhe ${b.title} mein admission lena hai. Kripya details batayein.`);
    const tel = s.helpline_number ? 'tel:' + s.helpline_number.replace(/\s+/g, '') : '#';
    document.getElementById('unlockCall').href = tel;
    modal.classList.add('show'); modal.setAttribute('aria-hidden', 'false');
  }
  function closeUnlock() { modal.classList.remove('show'); modal.setAttribute('aria-hidden', 'true'); }
  document.getElementById('unlockClose').onclick = closeUnlock;
  modal.addEventListener('click', (e) => { if (e.target === modal) closeUnlock(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeUnlock(); });

  route();
});
