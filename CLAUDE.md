# CLAUDE.md

Personal portfolio + CV of **Muhammad Nouman Khan** (AI / MLOps engineer). Static site built with Eleventy from YAML data; live at https://iammuhammadnoumankhan.github.io/me/ (GitHub Pages, served under `/me/`).

@RULES.md
@CONTRACTS.md

## How it works

- **Content** lives only in `src/_data/*.yaml`. Templates in `src/pages/*.njk` and `src/_includes/` render it. Never put content in templates.
- **Validation:** `scripts/validate.js` checks every data file against `schemas/<name>.schema.json` plus cross-file references. It runs before every build (`eleventy.before` hook), so a bad edit fails the build and never deploys.
- **CV:** `src/pages/cv.njk` renders `cv.html` from the same data; `scripts/cv-pdf.js` prints it to the PDF named in `cv.yaml` after production builds (`runMode === "build"`) using headless Chrome (puppeteer-core, system Chrome).
- **Deploy:** push to `main` → `.github/workflows/deploy.yml` → `npm ci && npm run build` → GitHub Pages (source: GitHub Actions). PRs build and validate but don't deploy.

## Commands

```bash
npm start          # dev server, live reload, http://localhost:8080 (no PDF)
npm run validate   # schema + cross-reference checks only (fast)
npm run build      # full build into _site/, including the CV PDF
npm run cv         # same as build; use after editing cv.njk
```

`_site/` and `node_modules/` are gitignored build output. Never edit `_site/`.

## Making changes

| Task | Where |
|---|---|
| Add/edit a job, project, skill, paper, cert, award | the matching `src/_data/*.yaml` |
| Page titles, hero text, nav order, page-specific cards | `src/_data/pages.yaml` |
| Which projects appear on the CV, CV headline | `src/_data/cv.yaml` |
| New field in a data file | add it to the schema in `schemas/` **first**, then the YAML, then the template |
| Shared look (tokens, nav, footer, buttons, cards) | `src/css/style.css`, `src/_includes/` |
| One page's look | `src/css/pages/<page>.css` + `src/pages/<page>.njk` |
| Template helpers (`md`, `accent`, `rel`, `dateRange`, `cvSkills`…) | `eleventy.config.js` |

Key template filters (all in `eleventy.config.js`):
- `rel(page.url)`: makes every internal link relative. **Always** use it for internal URLs and assets (the site lives under `/me/`; absolute `/…` links break).
- `md`: inline markdown for text fields; `accent`: hero titles (`[[cyan]]`, `\n`).
- `statValue(auto)`: resolves `value:` or `auto: years_experience | roles | projects`.
- `{% photo %}`: responsive WebP/JPEG via `@11ty/eleventy-img`.

## Verifying a change

1. `npm run build`: must pass validation and print `Wrote N files`.
2. For content changes, grep the built HTML in `_site/` for the new text.
3. For CV-affecting changes, check the PDF is still **2 pages** and headings extract cleanly:
   ```bash
   python3 -c "from pypdf import PdfReader; print(len(PdfReader('_site/Muhammad-Nouman-Khan-CV.pdf').pages))"
   pdftotext -layout _site/Muhammad-Nouman-Khan-CV.pdf - | head -40
   pdffonts _site/Muhammad-Nouman-Khan-CV.pdf   # must be CID TrueType, never Type 3
   ```
4. For visual/CSS changes, serve `_site` under a `/me/` path (e.g. copy into `<tmp>/me/` and `python3 -m http.server`) and screenshot; audit with Lighthouse (target 100 accessibility / best practices / SEO).
5. After pushing, watch the run: `gh run list -R iammuhammadnoumankhan/me -L 1`, then `gh run watch <id> --exit-status`.
