MILO'S CAFE — NETLIFY DEPLOY

Files:
- index.html: standalone website
- netlify.toml: Netlify publish directory and basic response headers

Deploy:
1. Open https://app.netlify.com/drop
2. Drag the milos-cafe-netlify folder (or the ZIP containing these files) into the drop area.
3. Netlify will publish the site and give you a temporary *.netlify.app URL.
4. Once you choose the final domain, add that domain in Netlify > Domain management. Then add the canonical URL and social preview image metadata using that real domain.

Notes:
- No build command is needed; this is a static HTML site.
- The logo is embedded in the HTML, so no separate image asset is required for it.
- Google Fonts, the map embed, online ordering, and weather feature use external services.
- Please verify menu prices, hours, links, and the online ordering URL before going live.
