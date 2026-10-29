import markdownIt from "markdown-it";
import { readFileSync } from "node:fs";

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
