import markdownIt from "markdown-it";
import { readFileSync, existsSync } from "node:fs";
import Image from "@11ty/eleventy-img";

const md = markdownIt({ html: false, linkify: true, typographer: false, breaks: true });
const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
const toH = (t) => { const [h, m] = String(t || "0:0").split(":").map(Number); return h + (m || 0) / 60; };
const label = (t) => { const [h, m] = String(t).split(":").map(Number); return (h % 12 || 12) + (m ? ":" + String(m).padStart(2, "0") : "") + " " + (h >= 12 ? "PM" : "AM"); };

export default function (cfg) {
  cfg.setNunjucksEnvironmentOptions({ autoescape: true, throwOnUndefined: false });

  ["src/images", "src/fonts", "src/admin", "src/favicon.svg", "src/apple-touch-icon.png"]
    .forEach((p) => cfg.addPassthroughCopy(p));
  cfg.ignores.add("src/admin/**");

  // Inline a CSS/JS file verbatim (no template processing)
  cfg.addShortcode("raw_include", (f) => readFileSync("src/_includes/" + f, "utf8"));

  // Responsive, graded photos: <picture> with WebP + JPEG at phone/desktop widths
  // House photo treatment (applies to every photo, including CMS uploads): matte, warm,
  // slightly lifted blacks and a soft cobalt tint in the shadows, to sit with the illustration.
  const cobaltTile = readFileSync("src/_includes/cobalt-tile.png");
  const grade = (sharp) => {
    sharp.modulate({ saturation: 0.9 }).linear(0.95, 8)
      .recomb([[1.035, 0.01, 0], [0, 1, 0], [0, 0.01, 0.95]])
      .composite([{ input: cobaltTile, tile: true, blend: "screen" }]);
  };
  cfg.addAsyncShortcode("img", async (src, alt = "", sizes = "100vw", cls = "", loading = "lazy") => {
    const esc = (v) => String(v).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
    const file = src && src.startsWith("/") ? "src" + src : null;
    if (!file || !existsSync(file)) return `<img src="${esc(src || "")}" alt="${esc(alt)}"${cls ? ` class="${esc(cls)}"` : ""} loading="${loading}" decoding="async"/>`;
    const meta = await Image(file, { widths: [480, 960, 1600], formats: ["webp", "jpeg"], outputDir: "_site/img/", urlPath: "/img/", transform: grade, sharpJpegOptions: { quality: 80, progressive: true, mozjpeg: true }, sharpWebpOptions: { quality: 78 } });
    return Image.generateHTML(meta, { alt, sizes, loading, decoding: "async", ...(cls ? { class: cls } : {}) });
  });

  // Logo: WebP + PNG fallback at display sizes, no photo grade (keeps brand colors exact)
  cfg.addAsyncShortcode("logo", async (src, alt = "", loading = "lazy", cls = "", sizes = "160px") => {
    const file = src && src.startsWith("/") ? "src" + src : null;
    const attrs = { alt, loading, decoding: "async", sizes, ...(cls ? { class: cls } : {}) };
    if (!file || !existsSync(file)) return `<img src="${src}" alt="${alt}"${cls ? ` class="${cls}"` : ""} loading="${loading}" decoding="async"/>`;
    const meta = await Image(file, { widths: [320, 480, 760], formats: ["webp", "png"], outputDir: "_site/img/", urlPath: "/img/" });
    return Image.generateHTML(meta, attrs);
  });

  // schema.org priceRange from the menu, e.g. "$5–$16"
  cfg.addFilter("priceRange", (menu) => {
    const p = [];
    for (const tab of ["food", "drinks"]) for (const c of (menu && menu[tab]) || []) for (const i of c.items || []) if (typeof i.price === "number" && i.price > 0) p.push(i.price);
    return p.length ? "$" + Math.floor(Math.min(...p)) + "–$" + Math.ceil(Math.max(...p)) : "$";
  });

  // Look up a menu item by name: { tab, price }
  cfg.addFilter("menuItem", (menu, name) => {
    for (const tab of ["food", "drinks"]) for (const c of (menu && menu[tab]) || []) for (const i of c.items || [])
      if (i.name === name) return { tab, price: typeof i.price === "number" && i.price > 0 ? "$" + i.price.toFixed(2) : "" };
    return { tab: "food", price: "" };
  });
  cfg.addFilter("slug", (s) => "i-" + String(s || "").toLowerCase().replace(/[^a-z0-9]+/g, "-"));

  // Markdown: block and inline
  cfg.addFilter("md", (s) => md.render(s || ""));
  cfg.addFilter("mdi", (s) => md.renderInline(s || ""));
  // JSON safe to drop inside <script>
  cfg.addFilter("json", (v) => JSON.stringify(v ?? null).replace(/</g, "\\u003c"));
  cfg.addFilter("enc", (s) => encodeURIComponent(s || ""));
  cfg.addFilter("nl2br", (s) => String(s || "").split(/\r?\n/));

  // Hours grouped for display: [{days:"Monday–Thursday", time:"7 AM–4 PM"}]
  cfg.addFilter("hoursGroups", (days) => {
    const out = [];
    (days || []).forEach((d) => {
      const time = d.closed ? "Closed" : label(d.open) + "–" + label(d.close);
      const last = out[out.length - 1];
      if (last && last.time === time) { last.to = d.day; } else out.push({ from: d.day, to: d.day, time });
    });
    return out.map((g) => ({ days: g.from === g.to ? g.from : g.from + "–" + g.to, time: g.time }));
  });
  // Hours for scripts, indexed Sun..Sat: [open, close] in decimal hours, or null when closed
  cfg.addFilter("hoursJS", (days) => {
    const by = Object.fromEntries((days || []).map((d) => [d.day, d]));
    return ["Sunday", ...DAYS.slice(0, 6)].map((n) => { const d = by[n]; return !d || d.closed ? null : [toH(d.open), toH(d.close)]; });
  });
  // schema.org openingHoursSpecification
  cfg.addFilter("hoursSchema", (days) => (days || []).filter((d) => !d.closed)
    .map((d) => ({ "@type": "OpeningHoursSpecification", dayOfWeek: d.day, opens: d.open, closes: d.close })));

  // schema.org areaServed from a plain list of town names
  cfg.addFilter("areaServed", (towns, state) => (towns || []).map((n) => ({ "@type": "City", name: state ? `${n}, ${state}` : n })));
  // FAQPage for search and answer engines: plain-text answers, hours spelled out where the item asks for them
  cfg.addFilter("faqSchema", (items, hours) => {
    const strip = (s) => md.renderInline(s || "").replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&#39;|&rsquo;/g, "’").replace(/&quot;/g, '"').trim();
    const groups = cfg.getFilter("hoursGroups")((hours && hours.days) || []);
    return (items || []).filter((f) => f.question).map((f) => {
      let a = strip(f.answer);
      if (f.show_hours) a = (a ? a + " " : "") + groups.map((g) => `${g.days}: ${g.time}`).join(". ") + "." + (hours && hours.note ? " " + hours.note : "");
      return { "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: a } };
    }).filter((q) => q.acceptedAnswer.text);
  });

  // schema.org ItemList for the press page: each piece of coverage with its publisher
  cfg.addFilter("pressSchema", (press) => ((press && press.items) || []).filter((i) => i.url && i.title).map((i, n) => ({
    "@type": "ListItem", position: n + 1,
    item: Object.assign({ "@type": "CreativeWork", name: i.title, url: i.url, publisher: { "@type": "Organization", name: i.outlet } },
      i.summary ? { description: i.summary } : {}, /^\d{4}(-\d\d){0,2}$/.test(i.date || "") ? { datePublished: i.date } : {})
  })));

  cfg.addFilter("fixed2", (n) => (typeof n === "number" ? n.toFixed(2) : n));
  // schema.org Menu: sections and dishes with descriptions
  cfg.addFilter("menuSchema", (menu, siteUrl) => {
    const sec = (cats) => (cats || []).map((c) => ({ "@type": "MenuSection", name: c.category,
      hasMenuItem: (c.items || []).map((i) => Object.assign({ "@type": "MenuItem", name: i.name }, i.description ? { description: i.description } : {})) }));
    return { "@type": "Menu", name: "Milo’s Cafe menu", url: (siteUrl || "") + "/#menu",
      hasMenuSection: [{ "@type": "MenuSection", name: "Food", hasMenuSection: sec(menu.food) }, { "@type": "MenuSection", name: "Drinks", hasMenuSection: sec(menu.drinks) }] };
  });

  return { dir: { input: "src", output: "_site", includes: "_includes", data: "_data" }, templateFormats: ["njk"], htmlTemplateEngine: "njk" };
}
