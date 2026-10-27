// Screenshots the built social card page (_site/og-card.html) to a 1200×630 PNG
// used as the og:image / twitter:image. Runs after every production build.
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import puppeteer from "puppeteer-core";
import { findChrome } from "./cv-pdf.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export async function buildSocialCard(outDir = path.join(root, "_site")) {
  const output = path.join(outDir, "og-card.png");
  const browser = await puppeteer.launch({ executablePath: findChrome(), args: ["--no-sandbox"] });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 1 });
    await page.goto(pathToFileURL(path.join(outDir, "og-card.html")).href, { waitUntil: "networkidle0" });
    await page.evaluate(async () => {
      await document.fonts.ready;
      await Promise.all([...document.images].map((img) => img.decode()));
    });
    await page.screenshot({ path: output, type: "png" });
  } finally {
    await browser.close();
  }
  return output;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const out = await buildSocialCard();
  console.log(`✓ Social card written to ${path.relative(root, out)}`);
}
