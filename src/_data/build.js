// Netlify sets URL at build time; settings.site_url in the CMS overrides it.
export default { url: (process.env.URL || "").replace(/\/$/, ""), date: new Date().toISOString().slice(0, 10) };
