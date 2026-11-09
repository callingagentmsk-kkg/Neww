/* =========================================================
   LOCAL FALLBACK SITE DATA
   Used when Supabase is not configured yet (SUPABASE_URL /
   SUPABASE_ANON_KEY empty in js/supabase-config.js), and also
   as the very first defaults shown before Supabase data loads.
   Once Supabase is connected, the Admin Panel writes changes
   there and the public site + this fallback stay in sync
   conceptually (same shape of data).
========================================================= */
const SITE_SETTINGS_DEFAULT = {
  logo_url: 'assets/img/logo.webp',
  site_title: 'CWA SCIENCE CLASSES',
  site_tagline: 'Concept with Abhishek',
  about_teacher_name: 'Abhishek Garg Sir',
  about_role: 'Physics • Chemistry • Maths Expert Faculty',
  about_image_url: 'assets/img/teacher.webp',
  about_text: 'CWA SCIENCE CLASSES mein Physics, Chemistry aur Maths — teeno subjects sirf <strong>Abhishek Garg Sir</strong> hi padhate hain. Ek hi teacher se poora PCM padhne ka fayda ye hai ki concepts aapas mein connect hote hain aur students ko subjects better samajh aate hain. Bihar Board ke syllabus par based, simple aur exam-oriented teaching style students ko top score dilane mein madad karta hai.',
  batches_heading: 'Class 9 se 12 tak PCM Batches',
  batches_subheading: 'Har class ke liye Physics, Chemistry aur Maths ke batch — sath mein video lecture aur PDF notes.',
  helpline_number: '+91 6207434940',
  whatsapp_link: 'https://wa.me/916207434940',
  address: 'CWA SCIENCE CLASSES, Patel High School Road Maheshkhunt (Godavari Complex), Bihar - India',
  class_timing: 'Monday - Saturday | 8:00 AM - 8:00 PM',
  email: 'info@cwascienceclasses.com',
  map_embed_url: 'https://www.google.com/maps?q=Bihar,India&output=embed',
  social_youtube: 'https://youtube.com',
  social_facebook: 'https://facebook.com',
  social_instagram: 'https://instagram.com',
  terms_content: 'Terms & Conditions content — edit this from the Admin Panel.',
  policy_content: 'Privacy Policy content — edit this from the Admin Panel.',
  result_validity_days: 3,

  /* ---- Editable website content (Admin Panel -> Website Content) ---- */
  seo_title: 'CWA SCIENCE CLASSES | Concept with Abhishek - Best Coaching for Class 9-12 PCM (Bihar Board)',
  seo_description: 'CWA SCIENCE CLASSES - Concept with Abhishek. Class 9 to 12 Physics, Chemistry, Maths (Bihar Board) taught by Abhishek Garg Sir. Watch batch videos, download PDF notes, check weekly test results online.',
  cta_text: 'Admission',
  cta_link: 'tel:+916207434940',
  nav_links: [
    { label: 'Home', href: '#home', icon: 'fa-solid fa-house', header: true },
    { label: 'Toppers', href: '#toppers', icon: 'fa-solid fa-trophy', header: true },
    { label: 'Batches', href: '#batches', icon: 'fa-solid fa-layer-group', header: true },
    { label: 'Test Result', href: '#result', icon: 'fa-solid fa-chart-simple', header: true },
    { label: 'About', href: '#about', icon: 'fa-solid fa-chalkboard-user', header: true },
    { label: 'Why CWA', href: '#gallery', icon: 'fa-solid fa-star', header: false },
    { label: 'Contact', href: '#contact', icon: 'fa-solid fa-location-dot', header: true }
  ],
  hero_stats: [
    { num: 4, label: 'Classes', suffix: '' },
    { num: 3, label: 'Subjects', suffix: '' },
    { num: 36, label: 'Video Lectures', suffix: '' },
    { num: 500, label: 'Students', suffix: '+' }
  ],
  subject_cards: [
    { name: 'Physics', text: 'Concepts + Numericals + Diagrams', icon: 'fa-solid fa-atom', color: 'physics' },
    { name: 'Chemistry', text: 'Reactions + Equations + Formulas', icon: 'fa-solid fa-flask', color: 'chemistry' },
    { name: 'Maths', text: 'Theorems + Practice + Tricks', icon: 'fa-solid fa-square-root-variable', color: 'maths' }
  ],
  why_cards: [
    { icon: 'fa-solid fa-chalkboard-user', title: 'Single Expert Faculty', text: 'Physics, Chemistry, Maths — teeno Abhishek Garg Sir hi padhate hain, isliye teaching mein consistency milti hai.' },
    { icon: 'fa-solid fa-mobile-screen', title: 'Mobile Friendly Platform', text: 'Video aur PDF dono mobile par easily chalte hain — laptop ki zaroorat nahi.' },
    { icon: 'fa-solid fa-file-pdf', title: 'Free PDF Notes', text: 'Har chapter ke sath detailed PDF notes free milte hain — revision aasan.' },
    { icon: 'fa-solid fa-chart-line', title: 'Weekly Test Analysis', text: 'Har hafte test hota hai aur result online turant dekh sakte hain.' },
    { icon: 'fa-solid fa-book-open-reader', title: 'Bihar Board Focused', text: 'Poora syllabus Bihar Board pattern ke hisaab se design kiya gaya hai.' },
    { icon: 'fa-solid fa-hand-holding-dollar', title: 'Affordable Fees', text: 'Quality education kam fees mein — sabhi students ke liye accessible.' }
  ],
  footer_about: 'Bihar Board Class 9 to 12 ke liye Physics, Chemistry aur Maths ki best online coaching. Ek hi expert faculty — Abhishek Garg Sir.',
  footer_extra_links: [],
  extra_socials: [],

  /* ---- Toppers-Wisdom style design (all editable: Admin -> Website Content) ---- */
  theme_nav: '#16213E',
  theme_accent: '#FFB400',
  theme_primary: '#4338CA',
  header_btn2_text: 'Check Result',
  header_btn2_link: '#result',
  hero_bg_url: '',
  hero_badge_small: "BIHAR BOARD'S",
  hero_badge_sub: 'Class 9 to 12 PCM Coaching',
  hero_tag_name: 'Abhishek Garg Sir',
  hero_tag_role: 'Founder, CWA Science Classes',
  hero_chips: [
    { title: 'Class 9 - 12', sub: 'Bihar Board PCM' },
    { title: 'Weekly Test', sub: 'Online result' },
    { title: 'Free PDF Notes', sub: 'with every chapter' },
    { title: '1 Teacher', sub: 'Physics + Chem + Maths' }
  ],
  achievers_label: 'Hamare Toppers',
  achievers: [
    { name: 'Student Name 1', rank: 'Class 10 - 96%', image_url: '' },
    { name: 'Student Name 2', rank: 'Class 12 - 94%', image_url: '' },
    { name: 'Student Name 3', rank: 'Class 10 - 95%', image_url: '' },
    { name: 'Student Name 4', rank: 'Class 11 - 92%', image_url: '' },
    { name: 'Student Name 5', rank: 'Class 12 - 93%', image_url: '' },
    { name: 'Student Name 6', rank: 'Class 9 - 97%', image_url: '' }
  ],
  subjects_heading: 'Ek Sir. Poora PCM.',
  subjects_sub: 'Physics, Chemistry aur Maths - teeno subjects ek hi expert teacher se, ek hi jagah.',
  promo_title: 'Admission Open!',
  promo_text: 'Class 9 se 12 tak PCM batch - video lectures, PDF notes aur weekly test ke saath.',
  promo_btn_text: 'Abhi Admission Lein',
  promo_btn_link: 'tel:+916207434940',
  promo_banners: [],
  toppers_tag: 'Proud moments',
  toppers_heading: 'With Abhishek Sir',
  proud_moments: [
    { name: 'Student Name', rank: 'Rank 1', sub: 'Class 10 | 96%', image_url: '' },
    { name: 'Student Name', rank: 'Rank 2', sub: 'Class 12 | 94%', image_url: '' },
    { name: 'Student Name', rank: 'Rank 3', sub: 'Class 10 | 93%', image_url: '' },
    { name: 'Student Name', rank: 'Rank 4', sub: 'Class 11 | 92%', image_url: '' }
  ],
  about_tag: 'Meet Your Mentor',
  about_cards: [
    { tag: 'OUR VISION', title: 'Best teacher, har student ke liye', text: 'Gaon ho ya sheher, har student ko top-quality PCM preparation milni chahiye.', image_url: '' },
    { tag: 'OUR MISSION', title: 'Concept clear, result pakka', text: 'Har concept logic se padhate hain taaki student ratta nahi, samajh kar likhe.', image_url: '' },
    { tag: 'OUR PROMISE', title: 'Ek hi teacher, poora PCM', text: 'Physics, Chemistry aur Maths - teeno me consistency aur personal guidance.', image_url: '' },
    { tag: 'OUR WAY', title: 'Video + PDF + Weekly Test', text: 'Roz practice, har hafte test, aur result online - kahin jaane ki zaroorat nahi.', image_url: '' }
  ],
  why_tag: 'Why CWA Science Classes',
  why_heading: 'Hamari Khasiyat',
  join_title: 'Aaj hi CWA Science Classes se judein',
  join_text: 'Video lectures, PDF notes, weekly test aur doubt solving - sab kuch ek hi jagah, mobile par.',
  join_points: [
    { text: 'Free batches se shuruaat karein' },
    { text: 'Hindi medium friendly teaching' },
    { text: 'Roz ki practice, har hafte test' }
  ],
  join_btn_text: 'WhatsApp Par Judein',
  join_btn_link: 'https://wa.me/916207434940',
  join_images: [
    { image_url: 'assets/img/hero-elements.webp' },
    { image_url: 'assets/img/subjects.webp' }
  ],
  contact_heading: 'Hamse Judein'
};

/* Simple text boxes shown in Admin -> Website Content ("Section Headings & Texts").
   Every key here is applied to any element carrying data-s="key" on the site. */
const SITE_TEXT_FIELDS = [
  { k: 'hero_badge_small', l: 'Hero badge - upar chhota text' },
  { k: 'hero_badge_sub', l: 'Hero badge - neeche text' },
  { k: 'hero_tag_name', l: 'Hero photo ke neeche naam' },
  { k: 'hero_tag_role', l: 'Hero photo ke neeche designation' },
  { k: 'subjects_heading', l: 'Subjects section heading' },
  { k: 'subjects_sub', l: 'Subjects section sub-text' },
  { k: 'promo_title', l: 'Promo banner title' },
  { k: 'promo_text', l: 'Promo banner text' },
  { k: 'promo_btn_text', l: 'Promo banner button text' },
  { k: 'promo_btn_link', l: 'Promo banner button link' },
  { k: 'toppers_tag', l: 'Proud moments - chhota tag' },
  { k: 'toppers_heading', l: 'Proud moments - heading' },
  { k: 'about_tag', l: 'About section tag' },
  { k: 'why_tag', l: 'Khasiyat section tag' },
  { k: 'why_heading', l: 'Khasiyat section heading' },
  { k: 'join_title', l: 'Join section heading' },
  { k: 'join_text', l: 'Join section text' },
  { k: 'join_btn_text', l: 'Join button text' },
  { k: 'join_btn_link', l: 'Join button link' },
  { k: 'contact_heading', l: 'Contact section heading' },
  { k: 'header_btn2_text', l: 'Header 2nd button text' },
  { k: 'header_btn2_link', l: 'Header 2nd button link' }
];

const HERO_SLIDES_DEFAULT = [
  {
    eyebrow: '🎓 Bihar Board | Class 9 to 12',
    line1: 'CWA <em>SCIENCE</em> CLASSES',
    line2: 'Concept with',
    highlight: 'Abhishek',
    description: 'Physics • Chemistry • Maths ki best online coaching — Abhishek Garg Sir ke saath. Batch video, PDF notes aur weekly test — sab ek hi jagah!',
    image_url: 'assets/img/teacher.webp',
    btn1_text: 'Batches Dekhein', btn1_link: '#batches',
    btn2_text: 'Test Result', btn2_link: '#result'
  },
  {
    eyebrow: '📚 Har Batch Ke Saath',
    line1: 'Video + PDF',
    line2: 'Ek Hi',
    highlight: 'Batch Mein',
    description: 'Har chapter ka HD video lecture + downloadable PDF notes. Mobile se kabhi bhi, kahin bhi padhai karein.',
    image_url: 'assets/img/subjects.webp',
    btn1_text: 'Video Dekhein', btn1_link: '#batches',
    btn2_text: 'Sir Ke Baare Mein', btn2_link: '#about'
  },
  {
    eyebrow: '📝 Weekly Test Result',
    line1: 'Apna Result',
    line2: 'Turant',
    highlight: 'Check Karein',
    description: 'Class aur mobile number daal kar apna weekly test result online dekhein — kahin jaane ki zaroorat nahi!',
    image_url: 'assets/img/hero-elements.webp',
    btn1_text: 'Result Dekhein', btn1_link: '#result',
    btn2_text: '', btn2_link: ''
  }
];

const NOTICES_DEFAULT = [
  '🎉 New Batch (Class 9 to 12 PCM) admission open now!',
  '📅 Weekly Test every Sunday - Check your result online',
  '📞 Admission Helpline: +91 6207434940 (24/7 Available)',
  '📚 Free PDF Notes with every video lecture',
  '🏆 Bihar Board Physics, Chemistry, Maths - Best Result Guaranteed',
  '🎓 Only Faculty: Abhishek Garg Sir (PCM Expert)'
];
