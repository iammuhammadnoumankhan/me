/* skills.js — animate proficiency bars when they come into view */
(function () {
  const pb = document.getElementById('prof-band');
  if (!pb) return;
  const pbObserver = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.querySelectorAll('.pb-fill').forEach(f => f.classList.add('animated'));
        pbObserver.unobserve(e.target);
      }
    });
  }, { threshold: 0.3 });
  pbObserver.observe(pb);
})();
