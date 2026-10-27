/* shared.js — nav tint, mobile menu, scroll reveal */
(function () {

  /* ── Nav scroll tint ── */
  const nav = document.querySelector('nav');
  if (nav) {
    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 48);
    }, { passive: true });
  }

  /* ── Hamburger ── */
  const ham = document.querySelector('.nav-hamburger');
  const drawer = document.querySelector('.nav-drawer');
  if (ham && drawer) {
    const setOpen = (open) => {
      ham.classList.toggle('open', open);
      drawer.classList.toggle('open', open);
      ham.setAttribute('aria-expanded', String(open));
    };
    ham.addEventListener('click', () => setOpen(!drawer.classList.contains('open')));
    drawer.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setOpen(false)));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') setOpen(false); });
  }

  /* ── Scroll reveal ── */
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.07, rootMargin: '0px 0px -32px 0px' });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

})();
