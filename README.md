# Muhammad Nouman Khan — Portfolio

Personal portfolio site for Muhammad Nouman Khan: AI engineering, MLOps, research and freelance work.

**All content lives in YAML files.** The pages are templates that read those files, so you update the site by editing data, never HTML. Every push to `main` validates the data, builds the site with [Eleventy](https://www.11ty.dev/) and deploys it to GitHub Pages.

## Updating content

Edit the file for what you want to change, then push:

| File | What it holds | Shown on |
|---|---|---|
| `src/_data/profile.yaml` | Name, tagline, summary, links, home stats, community work | Home, nav, footer, About, Contact |
| `src/_data/experience.yaml` | Jobs and internships (newest first) | Experience |
| `src/_data/projects.yaml` | Project categories and cards | Projects |
| `src/_data/skills.yaml` | Skill groups and proficiency bars | Skills |
| `src/_data/research.yaml` | Publications and research interests | Research |
| `src/_data/education.yaml` | Degrees, certifications and awards | About |
| `src/_data/pages.yaml` | Page titles, SEO descriptions, hero text, nav order, page-specific cards | Every page |
| `src/_data/site.yaml` | Public URL and language | `<head>` metadata |

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

**Add a project:** add an entry under `items` in `projects.yaml`. Its `category` must be one of the ids in `categories`. To link a repo or demo, add `links: { github: https://…, demo: https://… }`.

**Add a social link:** add an entry to `links` in `profile.yaml`. It appears on the home page, the contact page and in the footer.

## Validation

Each data file has a JSON Schema in `schemas/`. The build stops with a clear message if anything is wrong, for example:

```
Content validation failed:
  - experience.yaml: /0/start must match pattern "^\d{4}-(0[1-9]|1[0-2])$"
  - projects.yaml: /items/1 category 'vision' is not one of: mlops, llm, cv, genai, edge
```

A broken edit therefore never reaches the live site. In VS Code with the YAML extension, the `# yaml-language-server` line at the top of each file gives you autocomplete and inline errors while editing.

## Running locally

Requires Node 22+.

```bash
npm install
npm start          # dev server with live reload at http://localhost:8080
npm run validate   # check the YAML files only
npm run build      # produce the static site in _site/
```

## Project structure

```text
src/
  _data/              ← content (YAML)
  _includes/
    layouts/base.njk  ← <head>, nav, footer shared by every page
    components/       ← nav, footer, page hero, section heading, icons, project links
  pages/              ← one template per page
  css/style.css       ← design tokens and shared styles
  css/pages/          ← page-specific styles
  js/                 ← nav/scroll behaviour, project filter, skill bars
  profile.jpeg
schemas/              ← JSON Schemas for each data file
scripts/validate.js   ← schema and cross-reference checks, run before every build
eleventy.config.js    ← build config and template filters
.github/workflows/deploy.yml
```

## Deployment

`.github/workflows/deploy.yml` builds and deploys on every push to `main`. Pull requests are built and validated but not deployed. In the repository settings, **Settings → Pages → Source** must be set to **GitHub Actions**.
