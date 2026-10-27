// Prints the built CV page (_site/cv.html) to PDF with headless Chrome.
// Runs after every production build; also usable on its own: `npm run cv`.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { load as loadYaml } from "js-yaml";
import puppeteer from "puppeteer-core";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  "/usr/bin/google-chrome",
  "/usr/bin/google-chrome-stable",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
];

export function findChrome() {
  const found = CHROME_CANDIDATES.find((p) => p && fs.existsSync(p));
  if (!found) throw new Error("CV PDF: Chrome not found. Install Google Chrome or set CHROME_PATH.");
  return found;
}

export async function buildCvPdf(outDir = path.join(root, "_site")) {
  const { variants } = loadYaml(fs.readFileSync(path.join(root, "src/_data/cv.yaml"), "utf8"));
  const outputs = [];
  const browser = await puppeteer.launch({ executablePath: findChrome(), args: ["--no-sandbox"] });
  try {
    const page = await browser.newPage();
    // Same URL scheme as cv.njk's permalink: first variant is cv.html, the rest cv-<id>.html
    for (const [i, v] of variants.entries()) {
      const input = path.join(outDir, i === 0 ? "cv.html" : `cv-${v.id}.html`);
      const output = path.join(outDir, v.filename);
      await page.goto(pathToFileURL(input).href, { waitUntil: "networkidle0" });
      await page.evaluate(() => document.fonts.ready);
      await page.pdf({ path: output, preferCSSPageSize: true, printBackground: true });
      outputs.push(output);
    }
  } finally {
    await browser.close();
  }
  return outputs;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  for (const out of await buildCvPdf()) console.log(`✓ CV written to ${path.relative(root, out)}`);
}
