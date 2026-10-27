# Muhammad Nouman Khan — Portfolio

Personal portfolio site for Muhammad Nouman Khan: AI engineering, MLOps, research and freelance work.

**All content lives in YAML files.** The pages are templates that read those files, so you update the site by editing data, never HTML. Every push to `main` validates the data, builds the site with [Eleventy](https://www.11ty.dev/), generates a matching **PDF CV**, and deploys both to GitHub Pages. The website and CV come from the same data, so they never disagree.

## Updating content

Edit the file for what you want to change, then push:

| File | What it holds | Shown on |
|---|---|---|
| `src/_data/profile.yaml` | Name, tagline, summary, links, home stats, community work | Home, nav, footer, About, Contact |
| `src/_data/experience.yaml` | Jobs and internships (newest first) | Experience |
| `src/_data/projects.yaml` | Project categories and cards | Projects |
| `src/_data/skills.yaml` | Skill groups (`core` skills are highlighted) | Skills, CV, search-engine data |
| `src/_data/research.yaml` | Publications and research interests | Research |
| `src/_data/education.yaml` | Degrees, certifications and awards | About |
| `src/_data/pages.yaml` | Page titles, SEO descriptions, hero text, nav order, page-specific cards | Every page |
| `src/_data/site.yaml` | Public URL and language | `<head>` metadata, sitemap |
| `src/_data/cv.yaml` | CV file name, headline and which projects to include | The PDF CV |

Each file has a comment at the top explaining its fields. Some conventions:

- **Dates** are quoted `"YYYY-MM"`, for example `start: "2025-08"`. Leave `end` out for a current role.
- **Inline formatting:** descriptions and bullet points accept markdown such as `**bold**` and `[links](https://…)`.
- **Hero titles** in `pages.yaml`: wrap the cyan part in `[[double brackets]]` and use `\n` for a line break.
- **Computed stats:** `auto: years_experience`, `auto: roles` or `auto: projects` calculates the value from the data, so it never goes stale.

### Common tasks

**Add a job:** add an entry to the top of `experience.yaml`:

```yaml
- role: Senior MLOps Engineer
  company: Example Corp
  type: full-time        # full-time | part-time | contract | freelance | internship
  location: Islamabad, Pakistan
  start: "2026-11"
  highlights:
    - Built **something impressive** with measurable impact.
  tags: [Kubernetes, vLLM]
```

**Add a project:** add an entry under `items` in `projects.yaml` with a `date` (`"YYYY-MM"`) and a `priority` (1–100; higher shows first, so keep simple projects low). Its `category` must be one of the ids in `categories`. To link a **public** repo or demo, add `links: { github: https://…, demo: https://… }`; never link a private repo. Mark a guessed date with `date_estimated: true` so it's easy to find and confirm later.

**Add a social link:** add an entry to `links` in `profile.yaml`. It appears on the home page, the contact page and in the footer.

## The PDF CV

The build turns `src/pages/cv.njk` into `cv.html`, then prints it to `Muhammad-Nouman-Khan-CV.pdf` with headless Chrome. The site links to it from the home page and the contact page with "Download CV" buttons.

- **Content** comes from `profile`, `experience`, `skills`, `projects`, `research` and `education`, so editing those updates the CV too.
- **`cv.yaml`** sets the file name, the headline under your name, and which projects appear (keep it to 4–6 so the CV stays at two pages).
- **ATS-friendly:** single column, real selectable text, standard section headings, embedded TrueType fonts, clickable links.
- **Preview locally:** run `npm run cv`, then open `_site/Muhammad-Nouman-Khan-CV.pdf`, or open `_site/cv.html` in a browser.

If you add content and the CV grows to three pages, drop a project from `cv.yaml` or trim a bullet point.

## Validation

Each data file has a JSON Schema in `schemas/`. The build stops with a clear message if anything is wrong, for example:

```
Content validation failed:
  - experience.yaml: /0/start must match pattern "^\d{4}-(0[1-9]|1[0-2])$"
  - projects.yaml: /items/1 category 'vision' is not one of: mlops, llm, cv, genai, edge
```

A broken edit therefore never reaches the live site. In VS Code with the YAML extension, the `# yaml-language-server` line at the top of each file gives you autocomplete and inline errors while editing.

## Running locally

Requires Node 22+ and Google Chrome (used to print the CV; set `CHROME_PATH` if Chrome is installed somewhere unusual).

```bash
npm install
npm start          # dev server with live reload at http://localhost:8080 (no PDF)
npm run validate   # check the YAML files only
npm run build      # produce the static site, the CV PDF and the social card in _site/
npm run cv         # same as build; handy after editing the CV template
```

## Project structure

```text
src/
  _data/              ← content (YAML)
  _includes/
    layouts/base.njk  ← <head>, nav, footer shared by every page
    components/       ← nav, footer, page hero, section heading, icons, project links
  pages/              ← one template per page, plus cv.njk (the CV), og-card.njk (social preview) and sitemap.njk
  css/style.css       ← design tokens and shared styles
  css/pages/          ← page-specific styles
  js/                 ← nav/scroll behaviour, project filter, skill bars
  fonts/              ← self-hosted Syne, DM Sans, JetBrains Mono (+ static cuts in fonts/cv/ for the PDF)
  assets/             ← favicon and app icons, copied to the site root
  profile.jpeg        ← resized and converted to WebP/JPEG at build time
schemas/              ← JSON Schemas for each data file
scripts/validate.js   ← schema and cross-reference checks, run before every build
scripts/cv-pdf.js     ← prints cv.html to PDF after every production build
scripts/social-card.js ← screenshots og-card.html to og-card.png (link previews on LinkedIn, WhatsApp, X…)
eleventy.config.js    ← build config and template filters
.github/workflows/deploy.yml
```

## Deployment

`.github/workflows/deploy.yml` builds and deploys on every push to `main`. Pull requests are built and validated but not deployed. In the repository settings, **Settings → Pages → Source** must be set to **GitHub Actions**.
