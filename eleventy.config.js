import fs from "node:fs";
import { load as loadYaml } from "js-yaml";
import path from "node:path";
import MarkdownIt from "markdown-it";
import Image from "@11ty/eleventy-img";
import { validate } from "./scripts/validate.js";
import { buildCvPdf } from "./scripts/cv-pdf.js";

const md = new MarkdownIt({ html: false, linkify: false, typographer: false });
const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

/* "../" prefix that leads from a page URL back to the site root */
const relPrefix = (pageUrl) => "../".repeat(Math.max(0, String(pageUrl).split("/").length - 2));

const readData = (name) => loadYaml(fs.readFileSync(`src/_data/${name}.yaml`, "utf8"));

const escapeHtml = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

/* "2025-08" -> "AUG 2025", "2025" -> "2025" */
function monthYear(value) {
  const [y, m] = String(value).split("-");
  return m ? `${MONTHS[Number(m) - 1]} ${y}` : y;
}

/* Values that stats can ask for with `auto:` instead of hard-coding them */
function autoValues() {
  const experience = readData("experience");
  const projects = readData("projects");
  const earliest = experience.map((x) => x.start).sort()[0];
  const [y, m] = earliest.split("-").map(Number);
  const now = new Date();
  const years = Math.floor((now.getFullYear() * 12 + now.getMonth() - (y * 12 + m - 1)) / 12);
  return {
    years_experience: `${years}+`,
    roles: `${experience.length}+`,
    projects: `${projects.items.length}`,
  };
}

export default function (eleventyConfig) {
  eleventyConfig.addDataExtension("yaml,yml", (contents) => loadYaml(contents));

  // Fail the build (and the deploy) if any content file breaks its schema
  eleventyConfig.on("eleventy.before", () => validate());
  eleventyConfig.addWatchTarget("./schemas/");

  eleventyConfig.addGlobalData("auto", autoValues);

  eleventyConfig.addPassthroughCopy({ "src/css": "css", "src/js": "js", "src/fonts": "fonts", "src/assets": "." });

  // The CV PDF is printed from the built cv.html on production builds (`npm run cv` for dev)
  eleventyConfig.on("eleventy.after", async ({ runMode }) => {
    if (runMode === "build") await buildCvPdf();
  });

  /* Responsive, optimised photo: WebP + JPEG at 1x/2x, with stable file names */
  const photoOptions = {
    widths: [300, 600],
    formats: ["webp", "jpeg"],
    outputDir: "_site/img/",
    filenameFormat: (id, src, width, format) => `${path.parse(src).name}-${width}.${format}`,
  };
  eleventyConfig.addAsyncShortcode("photo", async function (src, alt, attrs = {}) {
    const meta = await Image(`src/${src}`, { ...photoOptions, urlPath: relPrefix(this.page.url) + "img/" });
    return Image.generateHTML(meta, { alt, sizes: "300px", decoding: "async", ...attrs });
  });
  /* Absolute URL of the 600px JPEG, for social previews */
  eleventyConfig.addFilter("photoUrl", (src, siteUrl) => `${siteUrl}/img/${path.parse(src).name}-600.jpeg`);

  /* Inline markdown: **bold**, *italic*, [link](url) */
  eleventyConfig.addFilter("md", (s) => (s ? md.renderInline(String(s)) : ""));

  /* Hero titles: "\n" -> line break, [[text]] -> highlighted span */
  eleventyConfig.addFilter("accent", (s) =>
    escapeHtml(s)
      .replace(/\\n/g, "<br>")
      .replace(/\[\[(.+?)\]\]/g, "<span>$1</span>")
  );

  eleventyConfig.addFilter("monthYear", monthYear);
  eleventyConfig.addFilter("monthYearLong", (v) => {
    const [y, m] = String(v).split("-");
    return m ? new Date(Number(y), Number(m) - 1).toLocaleString("en-US", { month: "long" }) + ` ${y}` : y;
  });
  eleventyConfig.addFilter("dateRange", (start, end) => `${monthYear(start)} — ${end ? monthYear(end) : "PRESENT"}`);
  /* IEEE citation style: "Dec. 2024", "May 2024" */
  eleventyConfig.addFilter("citationDate", (v) => {
    const [y, m] = String(v).split("-");
    if (!m) return y;
    const mon = MONTHS[Number(m) - 1];
    return `${mon[0]}${mon.slice(1).toLowerCase()}${mon === "MAY" ? "" : "."} ${y}`;
  });
  eleventyConfig.addFilter("year", (v) => String(v).split("-")[0]);
  eleventyConfig.addFilter("pad2", (n) => String(n).padStart(2, "0"));

  /* Relative link from the current page, so the site works under any path (e.g. /me/ on GitHub Pages) */
  eleventyConfig.addFilter("rel", (target, pageUrl) => {
    const clean = target === "/" ? "index.html" : String(target).replace(/^\//, "");
    return relPrefix(pageUrl) + clean;
  });

  /* Resolve a stat/card entry to its displayed value */
  eleventyConfig.addFilter("statValue", (item, auto) => (item.auto ? auto[item.auto] : item.value));

  /* ── CV helpers ── */
  eleventyConfig.addFilter("cvDate", (v) => {
    const [y, m] = String(v).split("-");
    return m ? `${MONTHS[Number(m) - 1][0]}${MONTHS[Number(m) - 1].slice(1).toLowerCase()} ${y}` : y;
  });
  eleventyConfig.addFilter("displayUrl", (url) =>
    String(url).replace(/^https?:\/\/(www\.)?/, "").replace(/\?.*$/, "").replace(/\/$/, "")
  );
  /* Contact links for the CV header: email, LinkedIn, GitHub (freelance profiles stay on the site) */
  eleventyConfig.addFilter("cvLinks", (links) =>
    ["email", "linkedin", "github"]
      .map((id) => links.find((l) => l.id === id))
      .filter(Boolean)
      .map((l) => ({
        id: l.id,
        url: l.url,
        text: l.id === "email" ? l.handle : l.url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, ""),
      }))
  );
  /* Skill groups with readable titles ("GPU_INFRASTRUCTURE & HPC" -> "GPU Infrastructure & HPC")
     and each skill listed only once across groups */
  eleventyConfig.addFilter("cvSkills", (groups) => {
    const seen = new Set();
    const SPECIAL = { MLOPS: "MLOps", LLMS: "LLMs" };
    const word = (w) =>
      SPECIAL[w.toUpperCase()] ?? (/[a-z]/.test(w) || w.length <= 3 ? w : w[0] + w.slice(1).toLowerCase());
    return groups.map((g) => ({
      title: g.title.replace(/_/g, " ").split(" ").map(word).join(" "),
      skills: g.skills
        .map((s) => (typeof s === "string" ? s : s.name))
        .filter((n) => !seen.has(n) && seen.add(n)),
    }));
  });
  /* Projects: highest priority first, newest first on ties */
  eleventyConfig.addFilter("byPriority", (items = []) =>
    [...items].sort((a, b) => b.priority - a.priority || String(b.date).localeCompare(String(a.date)))
  );
  /* "MAR 2025", or "JUL 2026 — PRESENT" for ongoing projects */
  eleventyConfig.addFilter("projectDate", (p) => monthYear(p.date) + (p.ongoing ? " — PRESENT" : ""));

  eleventyConfig.addFilter("pickByName", (items, names = []) =>
    names.map((n) => items.find((i) => i.name === n)).filter(Boolean)
  );

  eleventyConfig.addShortcode("year", () => String(new Date().getFullYear()));

  return {
    dir: { input: "src", output: "_site", includes: "_includes", data: "_data" },
    templateFormats: ["njk"],
    htmlTemplateEngine: "njk",
  };
}
