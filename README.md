# Muhammad Nouman Khan Portfolio

A multi-page personal portfolio website for Muhammad Nouman Khan, focused on AI engineering, MLOps, research, and freelance work.

## Overview

This project is a static HTML, CSS, and JavaScript portfolio designed with a dark editorial style inspired by the "Obsidian Architect" direction in [design.md](/home/nouman/personal/ME/MY-CV/design.md).

The site includes:

- A landing page with hero section, stats, and quick navigation
- Dedicated pages for about, experience, skills, projects, research, and contact
- Shared navigation and footer injected with JavaScript
- Social links for GitHub, LinkedIn, Fiverr, Upwork, and email

## Project Structure

```text
.
├── index.html
├── design.md
├── profile.jpeg
├── css/
│   └── style.css
├── js/
│   ├── nav.js
│   └── shared.js
└── pages/
    ├── about.html
    ├── contact.html
    ├── experience.html
    ├── projects.html
    ├── research.html
    └── skills.html
```

## Run Locally

Because this is a static site, you can preview it with any simple local server.

Example with Python:

```bash
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

## Where To Edit Content

- Home page: [index.html](/home/nouman/personal/ME/MY-CV/index.html)
- Shared styles: [css/style.css](/home/nouman/personal/ME/MY-CV/css/style.css)
- Shared nav and footer: [js/nav.js](/home/nouman/personal/ME/MY-CV/js/nav.js)
- Shared interactions and reveal effects: [js/shared.js](/home/nouman/personal/ME/MY-CV/js/shared.js)
- Contact details: [pages/contact.html](/home/nouman/personal/ME/MY-CV/pages/contact.html)
- Other content pages: [pages/](/home/nouman/personal/ME/MY-CV/pages)

## Social Links

Current social and freelance links are defined in these places:

- Homepage social chips in [index.html](/home/nouman/personal/ME/MY-CV/index.html)
- Contact page cards in [pages/contact.html](/home/nouman/personal/ME/MY-CV/pages/contact.html)
- Shared footer in [js/nav.js](/home/nouman/personal/ME/MY-CV/js/nav.js)

## Notes

- Navigation and footer are injected with JavaScript, so they depend on `js/nav.js`.
- The design language and visual direction are documented in [design.md](/home/nouman/personal/ME/MY-CV/design.md).
- `profile.jpeg` is used on the homepage portrait card.

