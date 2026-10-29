# Milo's Cafe website

Eleventy site with **Decap CMS** at `/admin`. Every piece of text, every photo, the menu, the hours, the FAQ, the reviews and the weather messages live in `src/_data/*.json` and can be edited in the CMS. Each save commits to GitHub, and Netlify rebuilds the site in about 30 seconds.

## Go live (one-time, ~10 minutes)

1. **GitHub.** Create an empty repo and push this folder to the `main` branch.
2. **Netlify.** Add a new site → Import an existing project → pick the repo. The build settings come from `netlify.toml` (`npm run build` → `_site`), so there's nothing to fill in.
3. **Identity.** In the site's settings open **Identity** → Enable. Under Registration, choose **Invite only**.
4. **Git Gateway.** Identity → Services → **Git Gateway** → Enable.
5. **Invite editors.** Identity → Invite users → enter the owner's email. The invite link opens the site, which forwards them to `/admin` to set a password.
6. **Domain.** Once the custom domain is connected, put it in **CMS → Business info & SEO → Website address** so link previews use full image URLs.

Editors then go to `https://<site>/admin`, log in, edit and press **Publish → Publish now**.

## What's editable

| CMS section | Covers |
|---|---|
| Business info & SEO | Name, address, map coordinates, phone, ordering link, social links, Google title/description, link-preview image, logo |
| Opening hours | Each day's open and close times or Closed, plus the holiday note. Feeds the Visit section, the FAQ, the top bar, the patio scene and the Google business data |
| Top bar, menu bar & loader | Loading-screen text, nav links, order buttons, phone bottom bar |
| Hero | Headline, intro, buttons, photo, badge, scrolling words, fact strip |
| About / The kitchen | Story, three cards, award, mood-pairing moods and suggestions |
| Menu | Food and drink categories and items, with price, description, ★ favorite and meat flag |
| Reviews | Rating, sources, quotes, often-mentioned list, notes |
| Instagram gallery | Photos and captions |
| FAQ | Questions and answers; "Add opening hours" adds the live hours under an answer |
| Live patio | Intro, labels, every weather message |
| Visit | Labels, patio note, photo strip, blue call-to-action box and its buttons |
| Footer & 404 page | Footer tagline, signature, 404 copy |

Every section except the hero has a **Show this section** switch, which also removes its menu links.

## Local editing

```bash
npm install
npm run dev     # site at http://localhost:8080
npm run cms     # in a second terminal: local CMS backend
```

Open `http://localhost:8080/admin/`. `local_backend: true` in `src/admin/config.yml` makes the CMS write straight to your files with no login.

## Structure

```
src/_data/        content (what the CMS edits)
src/index.njk     page template
src/_includes/    CSS, scripts, patio illustration
src/admin/        Decap CMS (config.yml = every editable field)
src/images/       photos; CMS uploads go to images/uploads
```

Note: Netlify keeps Git Gateway running but only gives it maintenance updates. If it's ever retired, change `backend.name` in `src/admin/config.yml` to `github` (editors would then log in with GitHub accounts).
