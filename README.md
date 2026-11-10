# CWA SCIENCE CLASSES — Concept with Abhishek

Static website (HTML/CSS/JS) + Supabase backend + Admin Panel at `/Avinash`.
No build step. Hosted on Cloudflare Pages, code on GitHub.

## Site structure
- `index.html` — Home: hero, Class 9/10/11/12 cards, Result portal, About, **Contact (Hamse Judein)**
- `class.html#class9` (..10/11/12) — **Class ka alag page**: 3 subjects -> chapters -> videos (naam ke saath) + PPT/PDF.
  PAID class = har chapter par lock + "Unlock" popup (Pay / WhatsApp / Call). FREE class = sab khula.
- `Avinash.html` (`/Avinash`) — Admin Panel

## Admin Panel (`/Avinash`)
Login default: **Username `AVINASH` / Password `AVINASH`** -> turant **Change Login** se badal dein.

| Menu | Kya badal sakte hain |
|---|---|
| Hero Slider | Slide image (upload), text, button text + link |
| Notice Marquee | Scrolling notice |
| About / Mentor | Teacher photo (upload), naam, intro |
| Batches | Class -> Subject -> Chapter -> **multiple named YouTube videos** + PPT/PDF (upload), FREE/PAID, price, payment link, ON/OFF, up/down reorder |
| Site Settings | Logo (upload), phone, WhatsApp, email, address, timing, map, YouTube/Facebook/Instagram links |
| **Website Content** | Menu links, header button + link, hero numbers, subject cards, Khasiyat cards, footer links, extra social icons (Telegram etc.), SEO title |
| **Website Content (Toppers-Wisdom design)** | Header/button/menu rang, hero chips, toppers ticker (photo), promo banner (image), proud-moments photo grid, About vision cards (photo), join-section images + tick points, headings aur buttons ke text - sab image **Upload ya URL** se |
| Terms & Policy | Terms / Privacy text |
| Student Data / Results | Students aur weekly test marks |
| Change Login | Username + password (current password poochta hai) |

## Pehli baar setup (sirf ek baar)
Supabase Dashboard -> SQL Editor -> New query me in files ko order me run karein:
1. `supabase/schema.sql` (naya project ho tab)
2. `supabase/fix_admin_login.sql`
3. `supabase/migration_phase6.sql`, `migration_phase7.sql`
4. **`supabase/migration_phase8.sql`** (image / PDF upload ke liye zaroori)
5. **`supabase/migration_phase9.sql`** (ek chapter me **multiple videos (naam ke saath)** ke liye zaroori — purane videos apne-aap copy ho jate hain)

Phir `js/supabase-config.js` me apna `SUPABASE_URL` aur `SUPABASE_ANON_KEY` daalein
(anon key public hoti hai, safe hai. **service_role key kabhi mat daalein**).

## Cloudflare Pages par live karna (GitHub se)
1. https://dash.cloudflare.com -> **Workers & Pages** -> **Create** -> **Pages** -> **Connect to Git**
2. GitHub authorize karein -> repo `Neww` chunein -> **Begin setup**
3. Settings:
   - Production branch: `main`
   - Framework preset: `None`
   - Build command: *(khali)*
   - Build output directory: `/`
4. **Save and Deploy** -> 1 minute me `https://<project>.pages.dev` live.
5. Custom domain: Pages project -> **Custom domains** -> **Set up a domain**.

Uske baad har baar GitHub `main` par push/merge hone par site apne-aap update hoti hai.
Admin Panel ke changes (image, link, text) code push ke bina turant live hote hain (Supabase se).

## Important
- Admin URL `https://<site>/Avinash` hai (`/avinash` bhi chalta hai).
- Password bhoolne par: Supabase -> Authentication -> Users -> `avinash@cwa-admin.local` -> Reset password.
