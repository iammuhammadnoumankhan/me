/* nav.js — inject shared nav + footer */
(function () {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  const root = path === 'index.html' || path === '' ? '' : '../';

  /* ── NAV ── */
  const navHTML = `
<nav>
  <a href="${root}index.html" class="nav-logo">MNK.PORTFOLIO</a>
  <ul class="nav-links">
    <li><a href="${root}index.html">Home</a></li>
    <li><a href="${root}pages/about.html">About</a></li>
    <li><a href="${root}pages/experience.html">Experience</a></li>
    <li><a href="${root}pages/skills.html">Skills</a></li>
    <li><a href="${root}pages/projects.html">Projects</a></li>
    <li><a href="${root}pages/research.html">Research</a></li>
  </ul>
  <a href="${root}pages/contact.html" class="nav-cta">CONTACT</a>
  <button class="nav-hamburger" aria-label="Menu">
    <span></span><span></span><span></span>
  </button>
</nav>
<div class="nav-drawer">
  <a href="${root}index.html">Home</a>
  <a href="${root}pages/about.html">About</a>
  <a href="${root}pages/experience.html">Experience</a>
  <a href="${root}pages/skills.html">Skills</a>
  <a href="${root}pages/projects.html">Projects</a>
  <a href="${root}pages/research.html">Research</a>
  <a href="${root}pages/contact.html" class="nav-cta">Contact</a>
</div>`;

  /* ── FOOTER ── */
  const currentYear = new Date().getFullYear();

  const footerHTML = `
<footer>
  <div class="footer-left">© ${currentYear} Muhammad Nouman Khan</div>
  <div class="footer-right">
    <a href="https://github.com/iammuhammadnoumankhan" target="_blank" rel="noopener noreferrer">GitHub</a>
    <a href="https://www.linkedin.com/in/muhammad-nouman-khan-248530233/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
    <a href="https://www.fiverr.com/s/qDaY9a5" target="_blank" rel="noopener noreferrer">Fiverr</a>
    <a href="https://www.upwork.com/freelancers/~012aab2bdb181fe4b1?mp_source=share" target="_blank" rel="noopener noreferrer">Upwork</a>
    <a href="mailto:iammuhammadnoumankhan@gmail.com">Email</a>
    <span style="color:var(--on-surface-dim)">·</span>
    <span>Hosted on <span style="color:var(--primary)">GitHub Pages</span></span>
  </div>
</footer>`;

  document.body.insertAdjacentHTML('afterbegin', navHTML);
  document.body.insertAdjacentHTML('beforeend', footerHTML);
})();
