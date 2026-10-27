# CONTRACTS.md

The interfaces between the data, the templates, the build and the outputs. The JSON Schemas in `schemas/` are the enforced source of truth for data shape; this file explains them and records the guarantees a schema can't express. If this file and a schema disagree, fix whichever is wrong in the same change.

## 1. Data contracts (`src/_data/*.yaml`)

Conventions shared by every file:
- Every YAML file `X.yaml` has `schemas/X.schema.json`; a data file without a schema fails the build.
- Objects reject unknown keys (`additionalProperties: false`), so a typo is a build error.
- **Dates** are quoted strings: `"YYYY-MM"` for experience and publications, `"YYYY"` or `"YYYY-MM"` for education. An omitted `end` means current or ongoing.
- **Text** fields are non-empty strings and accept inline markdown (`**bold**`, `*italic*`, `[link](url)`). Raw HTML is not rendered.
- **URLs** must start with `http://`, `https://` or `mailto:`.
- Shared definitions live in `schemas/_defs.schema.json` (`text`, `url`, `yearMonth`, `stat`, `section`, …).

| File | Shape | Required | Notes |
|---|---|---|---|
| `site.yaml` | object | `url` (no trailing slash), `lang` | `url` drives canonical, Open Graph and sitemap URLs |
| `profile.yaml` | object | `name`, `first_name`, `last_name`, `logo`, `headline`, `tagline`, `roles[]`, `summary`, `location`, `email`, `photo`, `links[]`, `stats[]` | `links[].id` ∈ `github, linkedin, fiverr, upwork, email` (also picks the icon); `portrait_stats` ≤ 2 items; `community[]` optional |
| `experience.yaml` | array, newest first | `role`, `company`, `location`, `start`, `highlights[]` (≥1) | `type` ∈ `full-time, part-time, contract, freelance, internship`; `remote: true` renders "Remote (location)"; `tags[]` optional |
| `projects.yaml` | object | `categories[]` (`id`, `label`), `items[]` (`name`, `category`, `date`, `priority` 1–100, `description`, `tags[]`) | sorted by `priority` (desc), then `date` (newest); featured items always lead; `ongoing: true` shows "— PRESENT"; `date_estimated: true` marks tentative dates (not displayed); `featured: true` makes it the wide card (with `stats[]`); `label` overrides `PROJECT_NN`; `links` ⊂ `{github, demo, paper}`, **public repos only** |
| `skills.yaml` | object | `groups[]` (`title`, `skills[]`) | a skill is a string or `{name, core: true}`; `core` skills also feed `knowsAbout` in the home page JSON-LD. No proficiency percentages (removed by the owner) |
| `research.yaml` | object | per publication: `title`, `authors[]`, `venue`, `publisher`, `date` | `authors[].me: true` bolds the owner; `url` and `doi` are optional (adds READ_PAPER / DOI buttons) |
| `education.yaml` | object | per degree: `degree`, `school`, `start` | `certifications[]` (`name`, `issuer`, optional `icon`, `url`), `awards[]` (`rank`, `title`, optional `detail`) |
| `pages.yaml` | object keyed by page id | ids `home, about, experience, skills, projects, research, contact`; each needs `nav`, `url` (starts with `/`), `title`, `description` | key order = nav order; `nav_cta: true` = outlined nav button; hero titles use `[[accent]]` and `\n` |
| `cv.yaml` | object | `filename` (`*.pdf`, safe characters only) | `headline` overrides `profile.headline`; `projects[]` are exact project names; `show_tech` toggles experience "Tech:" lines |

### Cross-file rules (enforced in `scripts/validate.js`)

- `projects.items[].category` must be one of `projects.categories[].id`.
- `cv.projects[]` must each match a `projects.items[].name` exactly.
- `pages.home.explore[].page` must be a page id in `pages.yaml`.
- `experience[].end` must not be before `start`.

### Computed values

`stats`, `portrait_stats`, `pages.*.highlights` and `pages.experience.sidebar` entries take either `value:` (literal) or `auto:` (exactly one):
- `years_experience`: whole years since the earliest `experience[].start`, shown as `N+`
- `roles`: number of experience entries, shown as `N+`
- `projects`: number of projects (**not to be displayed**; see RULES.md)

## 2. Template contracts

- Every page template sets `layout: layouts/base.njk`, a `pageId` that matches a `pages.yaml` key, an optional `pageCss` (loads `css/pages/<pageCss>.css`), optional `pageScripts` (loads `js/<name>.js`), and an explicit `permalink`.
- **Public URLs are stable:** `/index.html`, `/pages/{about,experience,skills,projects,research,contact}.html`, `/cv.html`, `/sitemap.xml`, `/<cv.filename>`, `/og-card.png`. Changing one breaks inbound links; avoid it.
- Internal links and asset paths go through `rel(page.url)` and must resolve under any base path.
- `base.njk` provides, on every page: `<title>`, meta description, canonical URL, Open Graph / Twitter tags (image = `og-card.png`, 1200×630), favicons, font preloads, server-rendered nav and footer, a single `<main class="page-wrapper">`, and `html.js` set before first paint. The home page also gets a schema.org `Person` JSON-LD block built from profile, experience, education and skills.
- `og-card.njk` is the social preview: standalone, `noindex`, excluded from collections; it must fit 1200×630 with nothing clipped.
- `.reveal` content is hidden only under `:where(.js)`. Without JavaScript everything is visible.
- `cv.njk` is standalone: it doesn't use the base layout, is `noindex`, and is excluded from collections and the sitemap.

## 3. Build contract

`npm run build` must, in order:
1. Validate all data (abort with every error listed if any check fails).
2. Render all pages into `_site/` and copy `css/`, `js/`, `fonts/` and `assets/*` (icons at the site root).
3. Generate `img/<photo>-{300,600}.{webp,jpeg}` from `profile.photo`; a missing photo fails the build.
4. Production builds only (needs Chrome or `CHROME_PATH`): print `_site/cv.html` to `_site/<cv.filename>`, then screenshot `_site/og-card.html` to `_site/og-card.png`.

CI (`deploy.yml`) runs exactly `npm ci && npm run build` and deploys `_site/` only from `main`.

## 4. Output guarantees

**Website**
- Lighthouse 100 for accessibility, best practices and SEO on every page; no layout shift from fonts (preloaded, self-hosted).
- Fully usable without JavaScript; respects `prefers-reduced-motion`.

**CV PDF**
- A4, exactly **2 pages**, single column, selectable text.
- Fonts embedded as CID TrueType (never Type 3); text extraction yields these section headings in order: `SUMMARY, EXPERIENCE, SKILLS, SELECTED PROJECTS, PUBLICATIONS, EDUCATION, CERTIFICATIONS & AWARDS` (sections with no data are omitted).
- Header links (email, LinkedIn, GitHub, portfolio) are clickable; freelance profiles (Fiverr, Upwork) stay on the website only.
- Skill group titles are humanised (`GPU_INFRASTRUCTURE & HPC` becomes `GPU Infrastructure & HPC`) and each skill appears once.
