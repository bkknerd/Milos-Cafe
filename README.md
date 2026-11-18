# Milo's Cafe website

Eleventy site with **Decap CMS** at `/admin`. All text, photos, the menu (including drink-layer cups), hours, FAQ, reviews and weather messages live in `src/_data/*.json` and are edited in the CMS. Each save commits to GitHub, and Netlify rebuilds the site in about a minute.

## Go live (one-time)

1. **GitHub.** Push this folder to the `main` branch of the site's repo.
2. **Netlify.** Add a new site → Import an existing project → pick the repo. Build settings come from `netlify.toml` (`npm run build` → `_site`).
3. **Identity.** In the site's settings open **Identity** → Enable, then set Registration to **Invite only**.
4. **Git Gateway.** Identity → Services → **Git Gateway** → Enable.
5. **Invite editors.** Identity → Invite users. The invite link opens the site, which forwards to `/admin` to set a password.
6. **Domain.** Once the custom domain is live, enter it in **CMS → Business info & SEO → Website address** so link previews use full image URLs.

## Page structure

| Section | CMS entry | Notes |
|---|---|---|
| Header | Header & phone bar | One bar: logo, links, today's hours, Order |
| Top of page | Top of page + Live patio | Headline, then the live patio scene (real Morrisville weather) |
| Story | Story | Storefront photo, story, specialties, award, mood pairing |
| Menu | Menu | Bistro menu card; category photos; drink-layer cups on hover/tap |
| Reviews | Reviews | First quote shown large |
| Instagram | Instagram gallery | Staggered grid |
| Inside and out | Visit: photos & footer | First photo large |
| FAQ | FAQ | "Add opening hours" pulls hours in automatically |
| Footer / Visit | Visit: photos & footer, Opening hours | Address, hours, phone, map, order buttons |

Hours are entered once (Opening hours) and feed the header, footer, FAQ, patio scene and Google business data.

## Photos

Upload any photo through the CMS. At build time every photo gets the same gentle colour grade and is converted to WebP + JPEG at 480 / 960 / 1600 px, so phones download small files. Originals stay in `src/images`.

## Motion

Two signature effects only: drink cups pour (and hot drinks steam) on hover or tap, and the patio sky follows the real time and weather. Both stop when the visitor's device asks for reduced motion.

## Local editing

```bash
npm install
npm run dev     # site at http://localhost:8080
npm run cms     # second terminal: local CMS backend
```
Open `http://localhost:8080/admin/`. `local_backend: true` in `src/admin/config.yml` makes the CMS write straight to your files, no login.

## Files

```
src/_data/        content (what the CMS edits); thumbs.js makes menu-category thumbnails
src/index.njk     page template
src/_includes/    styles.css, menu.js, patio.js, fx.js, patio-svg.njk, map-svg.njk
src/admin/        Decap CMS (config.yml = every editable field)
src/images/       original photos; CMS uploads go to images/uploads
src/fonts/        Fraunces (trimmed) + Instrument Sans, with licences
```

Netlify keeps Git Gateway running but only gives it maintenance updates. If it's ever retired, change `backend.name` in `src/admin/config.yml` to `github` (editors would then log in with GitHub accounts).
