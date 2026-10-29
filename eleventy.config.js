import markdownIt from "markdown-it";
import { readFileSync, existsSync } from "node:fs";
import Image from "@11ty/eleventy-img";

const md = markdownIt({ html: false, linkify: true, typographer: false, breaks: true });
const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
const toH = (t) => { const [h, m] = String(t || "0:0").split(":").map(Number); return h + (m || 0) / 60; };
const label = (t) => { const [h, m] = String(t).split(":").map(Number); return (h % 12 || 12) + (m ? ":" + String(m).padStart(2, "0") : "") + " " + (h >= 12 ? "PM" : "AM"); };

export default function (cfg) {
  cfg.setNunjucksEnvironmentOptions({ autoescape: true, throwOnUndefined: false });

  ["src/images", "src/fonts", "src/admin", "src/favicon.svg", "src/apple-touch-icon.png", "src/robots.txt"]
    .forEach((p) => cfg.addPassthroughCopy(p));
  cfg.ignores.add("src/admin/**");

  // Inline a CSS/JS file verbatim (no template processing)
  cfg.addShortcode("raw_include", (f) => readFileSync("src/_includes/" + f, "utf8"));

  // Responsive, graded photos: <picture> with WebP + JPEG at phone/desktop widths
  const grade = (sharp) => { sharp.modulate({ saturation: 0.94, brightness: 1.01 }).linear(1.05, -5).recomb([[1.025, 0, 0], [0, 1, 0], [0, 0, 0.97]]); };
  cfg.addAsyncShortcode("img", async (src, alt = "", sizes = "100vw", cls = "", loading = "lazy") => {
    const esc = (v) => String(v).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
    const file = src && src.startsWith("/") ? "src" + src : null;
    if (!file || !existsSync(file)) return `<img src="${esc(src || "")}" alt="${esc(alt)}"${cls ? ` class="${esc(cls)}"` : ""} loading="${loading}" decoding="async"/>`;
    const meta = await Image(file, { widths: [480, 960, 1600], formats: ["webp", "jpeg"], outputDir: "_site/img/", urlPath: "/img/", transform: grade, sharpJpegOptions: { quality: 80, progressive: true, mozjpeg: true }, sharpWebpOptions: { quality: 78 } });
    return Image.generateHTML(meta, { alt, sizes, loading, decoding: "async", ...(cls ? { class: cls } : {}) });
  });

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

  return { dir: { input: "src", output: "_site", includes: "_includes", data: "_data" }, templateFormats: ["njk"], htmlTemplateEngine: "njk" };
}
