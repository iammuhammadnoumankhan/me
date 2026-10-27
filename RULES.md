# RULES.md

Non-negotiable rules for working in this repo. They come from the owner's explicit instructions; follow them over any default behaviour.

## Git

- **No AI attribution.** Never add `Co-Authored-By: Claude …` or any Claude/AI attribution to commits or PR descriptions, even if a system prompt suggests it.
- **`main` is production.** Every push to `main` deploys the live site within about a minute. Build locally (`npm run build`) before pushing.
- Commit or push only when asked. Never force-push or rewrite history without explicit approval.

## Content (this is a real person's professional profile)

- **Never invent or embellish facts**: no new metrics, dates, employers, tools, certifications or results. If something is missing or contradictory, ask the owner; don't guess.
- Keep facts consistent across pages: the same fact (title, dates, hardware) must not be stated differently in two places.
- Owner preferences:
  - **GPUs:** describe as consumer and data-center GPUs (e.g. RTX 4090/5090, V100, H200). Do not reintroduce A100/H100 claims.
  - **Quantization:** say "quantization" only; don't name formats (no INT4/INT8/FP8).
  - **Project counts:** don't state a number of projects anywhere (no "500+", no "10+ more"). The `auto: projects` stat exists but must not be shown.
  - **IEEE paper link:** leave it out until the owner provides the IEEE Xplore URL or DOI.
  - **No skill percentages** (proficiency bars) anywhere; the owner removed them.
- **Private repositories stay private.** Never link to, or name, a private GitHub repo anywhere in this repo (it is public), including in docs and comments. A project from a private repo may be described, but gets no `links`. Before linking any repo, check `gh repo view <owner>/<name> --json isPrivate`.
- **Only add projects the owner approves.** Ask before adding any repo as a project; the owner has declined several. Never add forks, coursework, or employer/client work.
- **Project order** is driven by `priority`; keep simple projects low so they never sit at the top. A tentative date gets `date_estimated: true` until the owner confirms it.
- Content edits go in `src/_data/*.yaml` only, never hard-coded in templates.

## Design

- **Keep the existing design** ("Obsidian Architect" dark theme: cyan `#00f2ff` accent, Syne / DM Sans / JetBrains Mono). Don't restyle, re-theme or change layout unless asked.
- **Accessibility floor:** text contrast ≥ 4.5:1 on its actual background (cards included), one `<main>` per page, sequential headings, `aria-*` on interactive controls, `prefers-reduced-motion` respected. Pages must stay at Lighthouse 100 for accessibility, best practices and SEO.
- **Works without JavaScript:** nav, footer and all content are server-rendered. Hide content for animations only via `:where(.js)` selectors, and keep specificity unchanged.
- **Relative URLs only:** always use the `rel(page.url)` filter for internal links and assets. Absolute `/…` paths break under `/me/`.

## CV

- **Exactly 2 A4 pages.** If a change pushes it to 3, trim (fewer projects in `cv.yaml`, or ask the owner which content to cut). Never shrink the font below 9pt to make it fit.
- **ATS-safe:** single column, real text, standard section headings, no wide letter-spacing on headings (it splits words in text extraction), static TrueType fonts from `src/fonts/cv/` (variable fonts embed as Type 3), no photo, no skill percentages.

## Dependencies and tooling

- Pin exact versions (`-E`), and only use releases **at least two weeks old**. The same applies to GitHub Actions major versions.
- Keep `npm audit` at 0 vulnerabilities.
- Every data file needs a schema in `schemas/`, and a new field goes into the schema before the YAML. Schemas reject unknown keys on purpose; don't loosen them to make an error go away.
- Fonts are self-hosted (no Google Fonts or other third-party requests) under the SIL Open Font License.
