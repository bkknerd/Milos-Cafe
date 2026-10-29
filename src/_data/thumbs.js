// Small round thumbnails for menu categories (the menu is drawn by script, so URLs are prepared here).
import Image from "@11ty/eleventy-img";
import { readFileSync, existsSync } from "node:fs";

export default async function () {
  const menu = JSON.parse(readFileSync("src/_data/menu.json", "utf8"));
  const out = {};
  for (const tab of ["food", "drinks"]) {
    for (const c of menu[tab] || []) {
      const src = c.image;
      if (!src || out[src] || !src.startsWith("/") || !existsSync("src" + src)) continue;
      const meta = await Image("src" + src, { widths: [160], formats: ["webp"], outputDir: "_site/img/", urlPath: "/img/" });
      out[src] = meta.webp[0].url;
    }
  }
  return out;
}
