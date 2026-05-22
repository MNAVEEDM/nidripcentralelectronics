/* ================================================================
   NI DRIP CENTRAL ELECTRONICS — main.js v2
   Loading bar · Mobile drawer · Scroll animations · FABs ·
   Toast · Counters · Product filter/sort · Form
   ================================================================ */

'use strict';

/* ================================================================
   1. PAGE LOADING BAR
   ================================================================ */
const loader = document.getElementById('pageLoader');
if (loader) {
  loader.style.width = '70%';
  window.addEventListener('load', () => {
    loader.classList.add('done');
    setTimeout(() => loader.remove(), 700);
  });
}

/* ================================================================
   2. NAVBAR — scroll effect
   ================================================================ */
const navbar = document.getElementById('navbar');
if (navbar) {
  const onScroll = () => navbar.classList.toggle('scrolled', window.scrollY > 44);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ================================================================
   3. MOBILE DRAWER
   ================================================================ */
const hamburger = document.getElementById('hamburger');
const drawer    = document.getElementById('navDrawer');

function openDrawer() {
  if (!drawer || !hamburger) return;
  drawer.style.display = 'flex';
  requestAnimationFrame(() => {
    drawer.classList.add('open');
    hamburger.classList.add('open');
  });
  document.body.style.overflow = 'hidden';
}

function closeDrawer() {
  if (!drawer || !hamburger) return;
  drawer.classList.remove('open');
  hamburger.classList.remove('open');
  document.body.style.overflow = '';
  setTimeout(() => {
    if (!drawer.classList.contains('open')) drawer.style.display = 'none';
  }, 420);
}

if (hamburger && drawer) {
  drawer.style.display = 'none';
  hamburger.addEventListener('click', () =>
    drawer.classList.contains('open') ? closeDrawer() : openDrawer()
  );
  drawer.querySelectorAll('a').forEach(a => a.addEventListener('click', closeDrawer));
  document.addEventListener('click', e => {
    if (drawer.classList.contains('open') && !navbar.contains(e.target) && !drawer.contains(e.target))
      closeDrawer();
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeDrawer(); });
}

/* ================================================================
   4. ACTIVE NAV LINK
   ================================================================ */
(function markActive() {
  const page = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link, .drawer-link').forEach(a => {
    const href = (a.getAttribute('href') || '').split('?')[0];
    const match = href === page || (page === '' && href === 'index.html');
    a.classList.toggle('active', match);
  });
})();

/* ================================================================
   5. SCROLL REVEAL (Intersection Observer)
   ================================================================ */
(function initReveal() {
  const els = document.querySelectorAll('[data-aos]');
  if (!els.length) return;
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('anim'); io.unobserve(e.target); }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
  els.forEach(el => io.observe(el));
})();

/* ================================================================
   6. COUNTER ANIMATION
   ================================================================ */
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
      const tick = now => {
        const p = Math.min((now - t0) / dur, 1);
        el.textContent = Math.floor((1 - Math.pow(1 - p, 3)) * end).toLocaleString();
        if (p < 1) requestAnimationFrame(tick);
        else el.textContent = end.toLocaleString();
      };
      requestAnimationFrame(tick);
      io.unobserve(el);
    });
  }, { threshold: 0.5 });
  counters.forEach(c => io.observe(c));
})();

/* ================================================================
   7. TOAST NOTIFICATIONS
   ================================================================ */
function showToast(msg, type = 'success') {
  let wrap = document.getElementById('toastWrap');
  if (!wrap) {
    wrap = document.createElement('div');
    wrap.id = 'toastWrap';
    wrap.className = 'toast-wrap';
    document.body.appendChild(wrap);
  }
  const icons = { success: 'fa-circle-check', error: 'fa-circle-xmark', info: 'fa-circle-info' };
  const t = document.createElement('div');
  t.className = `toast toast--${type}`;
  t.innerHTML = `<i class="fas ${icons[type] || icons.info}"></i><span>${msg}</span>`;
  wrap.appendChild(t);

  const remove = () => {
    t.classList.add('leaving');
    t.addEventListener('animationend', () => t.remove(), { once: true });
  };
  const timer = setTimeout(remove, 4200);
  t.addEventListener('click', () => { clearTimeout(timer); remove(); });
}

/* ================================================================
   8. CONTACT FORM
   ================================================================ */
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', e => {
    e.preventDefault();
    const btn  = contactForm.querySelector('[type="submit"]');
    const orig = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending…';
    btn.disabled  = true;

    setTimeout(() => {
      btn.innerHTML = '<i class="fas fa-check"></i> Sent!';
      btn.style.background  = 'var(--green)';
      btn.style.borderColor = 'var(--green)';
      showToast('Message sent! We\'ll be in touch shortly.', 'success');
      contactForm.reset();
      setTimeout(() => {
        btn.innerHTML = orig;
        btn.disabled  = false;
        btn.style.background  = '';
        btn.style.borderColor = '';
      }, 3500);
    }, 1600);
  });
}

/* ================================================================
   9. PRODUCT FILTER
   ================================================================ */
(function initFilter() {
  const checks = document.querySelectorAll('.js-filter');
  const grid   = document.getElementById('productsGrid');
  const cntEl  = document.getElementById('productCount');
  if (!checks.length || !grid) return;

  checks.forEach(cb => cb.addEventListener('change', run));

  function run() {
    const active = [...checks].filter(c => c.checked).map(c => c.value);
    let visible  = 0;
    grid.querySelectorAll('.product-card[data-cat]').forEach(card => {
      const show = !active.length || active.includes(card.dataset.cat);
      card.style.display = show ? '' : 'none';
      if (show) visible++;
    });
    if (cntEl) cntEl.textContent = visible;
  }
})();

/* ================================================================
   10. PRODUCT SORT
   ================================================================ */
(function initSort() {
  const sel  = document.getElementById('sortSelect');
  const grid = document.getElementById('productsGrid');
  if (!sel || !grid) return;
  sel.addEventListener('change', () => {
    const cards = [...grid.querySelectorAll('.product-card')];
    const val   = sel.value;
    cards.sort((a, b) => {
      const pa = parseFloat(a.dataset.price || 0);
      const pb = parseFloat(b.dataset.price || 0);
      if (val === 'price-asc')  return pa - pb;
      if (val === 'price-desc') return pb - pa;
      return 0;
    });
    cards.forEach(c => grid.appendChild(c));
  });
})();

/* ================================================================
   11. FLOATING BUTTONS — WhatsApp & Back to Top
   ================================================================ */
(function initFABs() {
  const fabTop = document.getElementById('fabTop');
  if (!fabTop) return;

  window.addEventListener('scroll', () => {
    fabTop.classList.toggle('visible', window.scrollY > 500);
  }, { passive: true });

  fabTop.addEventListener('click', () =>
    window.scrollTo({ top: 0, behavior: 'smooth' })
  );
})();

/* ================================================================
   12. SMOOTH ANCHOR SCROLL
   ================================================================ */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    if (id === '#') return;
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    const navH = parseInt(getComputedStyle(document.documentElement)
      .getPropertyValue('--nav-h'), 10) || 72;
    window.scrollTo({ top: target.getBoundingClientRect().top + scrollY - navH, behavior: 'smooth' });
  });
});

/* ================================================================
   13. PHONE CLICK — copy to clipboard
   ================================================================ */
document.querySelectorAll('a[href^="tel:"]').forEach(a => {
  a.addEventListener('click', () => {
    const num = a.getAttribute('href').replace('tel:', '');
    if (navigator.clipboard) {
      navigator.clipboard.writeText(num).then(() =>
        showToast('Phone number copied!', 'info')
      ).catch(() => {});
    }
  });
});

/* ================================================================
   14. CATEGORY CARD CURSOR
   ================================================================ */
document.querySelectorAll('.cat-card').forEach(card => {
  card.style.cursor = 'pointer';
});

/* ================================================================
   15. PRODUCT CARD — inject hover enquiry overlay
   ================================================================ */
document.querySelectorAll('.product-card .p-img').forEach(pImg => {
  if (pImg.querySelector('.p-hover-cta')) return;
  const div = document.createElement('div');
  div.className = 'p-hover-cta';
  div.innerHTML = '<a href="contact.html">Enquire Now</a>';
  pImg.appendChild(div);
});

/* ================================================================
   16. LAZY IMAGE FADE-IN
   ================================================================ */
(function initImgFade() {
  const style = document.createElement('style');
  style.textContent = `
    img[loading="lazy"] { opacity: 0; transition: opacity .5s ease; }
    img[loading="lazy"].loaded { opacity: 1; }
  `;
  document.head.appendChild(style);

  document.querySelectorAll('img[loading="lazy"]').forEach(img => {
    if (img.complete) { img.classList.add('loaded'); return; }
    img.addEventListener('load', () => img.classList.add('loaded'));
  });
})();
