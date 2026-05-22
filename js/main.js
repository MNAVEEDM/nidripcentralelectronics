/* ================================================================
   NI DRIP CENTRAL ELECTRONICS — Main JavaScript
   ================================================================ */

'use strict';

/* ---------------------------------------------------------------
   1. Navbar — scroll effect + mobile toggle
--------------------------------------------------------------- */
const navbar   = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => {
    const open = hamburger.classList.toggle('open');
    navLinks.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });

  navLinks.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', closeMenu);
  });

  document.addEventListener('click', e => {
    if (!navbar.contains(e.target)) closeMenu();
  });
}

function closeMenu() {
  hamburger && hamburger.classList.remove('open');
  navLinks  && navLinks.classList.remove('open');
  document.body.style.overflow = '';
}

/* ---------------------------------------------------------------
   2. Active nav link — highlight current page
--------------------------------------------------------------- */
(function markActive() {
  const page = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(a => {
    const href = a.getAttribute('href') || '';
    a.classList.toggle('active', href === page || (page === '' && href === 'index.html'));
  });
})();

/* ---------------------------------------------------------------
   3. Scroll-reveal animations (Intersection Observer)
--------------------------------------------------------------- */
(function initAOS() {
  const els = document.querySelectorAll('[data-aos]');
  if (!els.length) return;

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('anim');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -48px 0px' });

  els.forEach(el => io.observe(el));
})();

/* ---------------------------------------------------------------
   4. Counter animation
--------------------------------------------------------------- */
(function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el  = e.target;
      const end = parseInt(el.dataset.count, 10);
      const dur = 1800;
      const t0  = performance.now();

      (function tick(now) {
        const p = Math.min((now - t0) / dur, 1);
        const v = Math.floor((1 - Math.pow(1 - p, 3)) * end);
        el.textContent = v.toLocaleString();
        if (p < 1) requestAnimationFrame(tick);
        else el.textContent = end.toLocaleString();
      })(t0);

      io.unobserve(el);
    });
  }, { threshold: 0.5 });

  counters.forEach(c => io.observe(c));
})();

/* ---------------------------------------------------------------
   5. Contact form — simulated submit
--------------------------------------------------------------- */
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', e => {
    e.preventDefault();
    const btn  = contactForm.querySelector('[type="submit"]');
    const orig = btn.innerHTML;

    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending…';
    btn.disabled  = true;

    setTimeout(() => {
      btn.innerHTML = '<i class="fas fa-check"></i> Message Sent!';
      btn.style.background = 'var(--success)';
      btn.style.borderColor = 'var(--success)';

      setTimeout(() => {
        btn.innerHTML = orig;
        btn.disabled  = false;
        btn.style.background  = '';
        btn.style.borderColor = '';
        contactForm.reset();
      }, 3500);
    }, 1600);
  });
}

/* ---------------------------------------------------------------
   6. Product filter (products page)
--------------------------------------------------------------- */
(function initFilter() {
  const checks = document.querySelectorAll('.js-filter');
  const cards  = document.querySelectorAll('.product-card[data-cat]');
  if (!checks.length || !cards.length) return;

  checks.forEach(cb => cb.addEventListener('change', run));

  function run() {
    const active = [...checks].filter(c => c.checked).map(c => c.value);
    cards.forEach(card => {
      const show = !active.length || active.includes(card.dataset.cat);
      card.style.display = show ? '' : 'none';
    });
    // update count
    const visible = [...cards].filter(c => c.style.display !== 'none').length;
    const cnt = document.getElementById('productCount');
    if (cnt) cnt.textContent = visible;
  }
})();

/* ---------------------------------------------------------------
   7. Sort select (products page)
--------------------------------------------------------------- */
(function initSort() {
  const sel   = document.getElementById('sortSelect');
  const grid  = document.getElementById('productsGrid');
  if (!sel || !grid) return;

  sel.addEventListener('change', () => {
    const cards = [...grid.querySelectorAll('.product-card')];
    const val   = sel.value;

    cards.sort((a, b) => {
      const pa = parseFloat(a.dataset.price || 0);
      const pb = parseFloat(b.dataset.price || 0);
      if (val === 'price-asc')  return pa - pb;
      if (val === 'price-desc') return pb - pa;
      return 0; // featured — keep original
    });

    cards.forEach(c => grid.appendChild(c));
  });
})();

/* ---------------------------------------------------------------
   8. Smooth scroll for in-page anchors
--------------------------------------------------------------- */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    if (id === '#') return;
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    const offset = parseInt(getComputedStyle(document.documentElement)
                             .getPropertyValue('--nav-h'), 10) || 72;
    window.scrollTo({ top: target.getBoundingClientRect().top + scrollY - offset, behavior: 'smooth' });
  });
});
