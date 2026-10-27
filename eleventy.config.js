import fs from "node:fs";
import { load as loadYaml } from "js-yaml";
import MarkdownIt from "markdown-it";
import { validate } from "./scripts/validate.js";

const md = new MarkdownIt({ html: false, linkify: false, typographer: false });
const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

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

  eleventyConfig.addPassthroughCopy({ "src/css": "css", "src/js": "js", "src/profile.jpeg": "profile.jpeg" });

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
    const depth = Math.max(0, String(pageUrl).split("/").length - 2);
    const clean = target === "/" ? "index.html" : String(target).replace(/^\//, "");
    return "../".repeat(depth) + clean;
  });

  /* Resolve a stat/card entry to its displayed value */
  eleventyConfig.addFilter("statValue", (item, auto) => (item.auto ? auto[item.auto] : item.value));

  eleventyConfig.addShortcode("year", () => String(new Date().getFullYear()));

  return {
    dir: { input: "src", output: "_site", includes: "_includes", data: "_data" },
    templateFormats: ["njk"],
    htmlTemplateEngine: "njk",
  };
}
