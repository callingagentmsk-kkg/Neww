/* =========================================================
   CWA SCIENCE CLASSES — SHARED CONTENT HELPERS
   Used by the home page (js/main.js) AND the class page (js/class.js).

   - CWA.loadBatches()  -> normalized batches (Supabase if configured,
                           else the local fallback in js/batches-data.js)
   - CWA.loadSettings() -> site settings object
   - small helpers (escape, YouTube id, icons, stats, WhatsApp links)

   Normalized shape:
   batch   { id, class, title, subtitle, color, icon, image_url, offer_text,
             price, payment_link, is_free, subjects[] }
   subject { name, icon, chapters[] }
   chapter { title, description, duration, videos[], resources[] }
   video   { title, youtube, duration }
   resource{ type, url, description }
========================================================= */
const CWA = (() => {
  const SUBJECT_META = {
    physics:   { icon: 'atom',                 grad: 'linear-gradient(135deg,#6C63FF,#4C3CE3)', color: '#4C3CE3' },
    chemistry: { icon: 'flask',                grad: 'linear-gradient(135deg,#00D3AA,#009C85)', color: '#00A98F' },
    maths:     { icon: 'square-root-variable', grad: 'linear-gradient(135deg,#FFB84D,#FF8A00)', color: '#F08A00' },
    math:      { icon: 'square-root-variable', grad: 'linear-gradient(135deg,#FFB84D,#FF8A00)', color: '#F08A00' },
    biology:   { icon: 'dna',                  grad: 'linear-gradient(135deg,#34D399,#059669)', color: '#059669' },
    english:   { icon: 'language',             grad: 'linear-gradient(135deg,#F472B6,#DB2777)', color: '#DB2777' }
  };

  function esc(v) {
    return String(v === undefined || v === null ? '' : v)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  // Accepts a full YouTube URL (watch / youtu.be / embed / shorts / live) or a bare 11-char id.
  function ytId(input) {
    const s = String(input || '').trim();
    if (!s) return '';
    const m = s.match(/(?:youtu\.be\/|v=|\/embed\/|\/shorts\/|\/live\/|\/v\/)([A-Za-z0-9_-]{11})/);
    if (m) return m[1];
    if (/^[A-Za-z0-9_-]{11}$/.test(s)) return s;
    return '';
  }

  // "fa-atom" / "atom" / "fa-solid fa-atom" -> "atom"
  function icon(name, fallback) {
    let n = String(name || '').trim().split(/\s+/).pop().replace(/^fa-/, '');
    return /^[a-z0-9-]+$/i.test(n) && n ? n : (fallback || 'book');
  }
  function subjectMeta(name) {
    return SUBJECT_META[String(name || '').trim().toLowerCase()] || { icon: 'book', grad: 'linear-gradient(135deg,#8B8FA8,#5B6078)', color: '#5B6078' };
  }
  function subjectIcon(s) { return icon(s && s.icon, subjectMeta(s && s.name).icon); }
  function safeColor(c, fallback) { return /^#[0-9a-f]{3,8}$/i.test(String(c || '').trim()) ? c.trim() : (fallback || '#4C3CE3'); }
  function safeUrl(u) {
    u = String(u || '').trim();
    return /^(https?:|\/|\.\/|\.\.\/|assets\/|[a-z0-9_\-]+\.html)/i.test(u) ? u : '';
  }

  function stats(batch) {
    let chapters = 0, videos = 0, notes = 0;
    (batch.subjects || []).forEach(s => (s.chapters || []).forEach(c => {
      chapters++; videos += (c.videos || []).length; notes += (c.resources || []).length;
    }));
    return { subjects: (batch.subjects || []).length, chapters, videos, notes };
  }
  function subjectStats(subject) {
    let videos = 0, notes = 0;
    (subject.chapters || []).forEach(c => { videos += (c.videos || []).length; notes += (c.resources || []).length; });
    return { chapters: (subject.chapters || []).length, videos, notes };
  }

  // WhatsApp link with a prefilled message (works with any wa.me / api.whatsapp link)
  function waLink(base, text) {
    base = String(base || '').trim() || 'https://wa.me/916207434940';
    if (!text) return base;
    return base + (base.indexOf('?') > -1 ? '&' : '?') + 'text=' + encodeURIComponent(text);
  }

  const bySort = (a, b) => (a.sort_order || 0) - (b.sort_order || 0);

  /* ---------- normalize Supabase rows ---------- */
  function fromRows(rows, hasVideosTable) {
    return rows.map(b => ({
      id: b.id, class: b.class_name, title: b.title, subtitle: b.subtitle,
      color: b.color, icon: b.icon, image_url: b.image_url,
      offer_text: b.offer_text, price: b.price, payment_link: b.payment_link,
      is_free: b.is_free !== false,
      subjects: (b.subjects || []).slice().sort(bySort).map(s => ({
        name: s.name, icon: s.icon,
        chapters: (s.chapters || []).slice().sort(bySort).map(ch => {
          let videos;
          if (hasVideosTable) {
            videos = (ch.chapter_videos || []).filter(v => v.enabled !== false && ytId(v.youtube_id)).slice().sort(bySort)
              .map(v => ({ title: v.title || 'Video', youtube: ytId(v.youtube_id), duration: v.duration || '' }));
          } else {
            // migration_phase9.sql not run yet -> old single-video-per-chapter behaviour
            videos = (ch.youtube_id && ch.video_enabled !== false && ytId(ch.youtube_id))
              ? [{ title: ch.title, youtube: ytId(ch.youtube_id), duration: ch.duration || '' }] : [];
          }
          return {
            title: ch.title, description: ch.description || '', duration: ch.duration || '',
            videos,
            resources: (ch.chapter_resources || []).filter(r => r.enabled !== false).slice().sort(bySort)
              .map(r => ({ type: r.resource_type, url: r.url, description: r.description || '' }))
          };
        })
      }))
    }));
  }

  /* ---------- normalize local fallback (js/batches-data.js) ---------- */
  function fromLocal() {
    const src = (typeof BATCHES_DATA !== 'undefined' && BATCHES_DATA.batches) ? BATCHES_DATA.batches : [];
    return src.map(b => ({
      id: b.id, class: b.class, title: b.title, subtitle: b.subtitle, color: b.color, icon: b.icon,
      image_url: b.image_url || '', offer_text: b.offer_text || '', price: b.price || '',
      payment_link: b.payment_link || '', is_free: b.is_free !== false,
      subjects: (b.subjects || []).map(s => ({
        name: s.name, icon: s.icon,
        chapters: (s.chapters || []).map(ch => ({
          title: ch.title, description: ch.description || '', duration: ch.duration || '',
          videos: Array.isArray(ch.videos) && ch.videos.length
            ? ch.videos.filter(v => v.youtube).map(v => ({ title: v.title || ch.title, youtube: ytId(v.youtube), duration: v.duration || '' }))
            : (ch.youtube && ch.video_enabled !== false ? [{ title: ch.title, youtube: ytId(ch.youtube), duration: ch.duration || '' }] : []),
          resources: (ch.resources || []).filter(r => r.enabled !== false)
            .map(r => ({ type: r.type, url: r.url, description: r.description || '' }))
        }))
      }))
    }));
  }

  const supaOn = () => (typeof IS_SUPABASE_CONFIGURED !== 'undefined' && IS_SUPABASE_CONFIGURED);

  async function loadBatches() {
    if (supaOn()) {
      try {
        const base = 'batches';
        let res = await supabaseClient.from(base)
          .select('*, subjects(*, chapters(*, chapter_resources(*), chapter_videos(*)))')
          .eq('active', true).order('sort_order');
        let hasVideos = true;
        if (res.error) {
          hasVideos = false;
          res = await supabaseClient.from(base)
            .select('*, subjects(*, chapters(*, chapter_resources(*)))')
            .eq('active', true).order('sort_order');
        }
        if (!res.error && res.data && res.data.length) return { batches: fromRows(res.data, hasVideos), source: 'supabase' };
      } catch (e) { console.warn('Batches fetch failed, using local fallback.', e); }
    }
    return { batches: fromLocal(), source: 'local' };
  }

  async function loadSettings() {
    let s = Object.assign({}, (typeof SITE_SETTINGS_DEFAULT !== 'undefined') ? SITE_SETTINGS_DEFAULT : {});
    if (supaOn()) {
      try {
        const { data } = await supabaseClient.from('site_settings').select('data').eq('id', 1).single();
        if (data && data.data) s = Object.assign({}, s, data.data);
      } catch (e) { console.warn('Settings fetch failed.', e); }
    }
    return s;
  }

  return { esc, ytId, icon, subjectMeta, subjectIcon, safeColor, safeUrl, stats, subjectStats, waLink, loadBatches, loadSettings };
})();
