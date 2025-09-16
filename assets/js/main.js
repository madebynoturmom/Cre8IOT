// === Mobile nav toggle + submenu handling ===
document.addEventListener('click', (e) => {
  // Hamburger toggle
  const toggleBtn = e.target.closest('.nav-toggle');
  if (toggleBtn) {
    const nav = document.querySelector('#nav');
    if (nav) {
      const open = nav.classList.toggle('open');
      toggleBtn.setAttribute('aria-expanded', String(open));
      document.body.classList.toggle('mobile-nav-open', open);
    }
    return; // prevent running other click logic on same event
  }

  // Close nav on link click (mobile only)
  if (window.innerWidth <= 960 && e.target.closest('.nav-list a')) {
    const nav = document.querySelector('#nav');
    const btn = document.querySelector('.nav-toggle');
    if (nav && btn && nav.classList.contains('open')) {
      nav.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('mobile-nav-open');
    }
    return;
  }

  // Submenu open/close
  const trigger = e.target.closest('.sub-trigger');
  if (trigger) {
    const li = trigger.closest('.has-sub');
    const expanded = trigger.getAttribute('aria-expanded') === 'true';
    trigger.setAttribute('aria-expanded', String(!expanded));
    li.classList.toggle('open', !expanded);

    // Close other submenus
    document.querySelectorAll('.has-sub').forEach(other => {
      if (other !== li) {
        other.classList.remove('open');
        other.querySelector('.sub-trigger')?.setAttribute('aria-expanded', 'false');
      }
    });
    return;
  }

  // Click outside closes any submenu
  document.querySelectorAll('.has-sub').forEach(li => {
    if (!li.contains(e.target)) {
      li.classList.remove('open');
      li.querySelector('.sub-trigger')?.setAttribute('aria-expanded', 'false');
    }
  });
});

// ESC closes any open submenu
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.has-sub').forEach(li => {
      li.classList.remove('open');
      li.querySelector('.sub-trigger')?.setAttribute('aria-expanded', 'false');
    });
  }
});

// === Footer year (after footer partial is injected) ===
const yearObserver = new MutationObserver(() => {
  const y = document.querySelector('[data-year]');
  if (y) {
    y.textContent = new Date().getFullYear();
    yearObserver.disconnect();
  }
});
yearObserver.observe(document.documentElement, { childList: true, subtree: true });

// === Reveal-on-scroll animations (robust to late-injected content) ===
(function revealInit() {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });

  const observeAll = () => document.querySelectorAll('.reveal:not(.in)').forEach(el => io.observe(el));

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', observeAll);
  } else {
    observeAll();
  }

  const mo = new MutationObserver(() => observeAll());
  mo.observe(document.documentElement, { childList: true, subtree: true });
})();

// Close button inside mobile nav
document.addEventListener('click', (e) => {
  const close = e.target.closest('.nav-close');
  if (close) {
    const nav = document.querySelector('#nav');
    const btn = document.querySelector('.nav-toggle');
    if (nav && btn) {
      nav.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('mobile-nav-open');
    }
  }
});

// Theme toggle removed: site uses light theme only

// Hero slider: auto-rotate, progress bar, tab click
document.addEventListener('DOMContentLoaded', function() {
  (function heroSlider() {
  const slides = document.querySelectorAll('.hero-slide');
  if (!slides.length) return;

  let current = 0;
  const duration = 6000; // ms per slide
  let timer = null;


  const go = (idx) => {
    slides.forEach((s,i) => {
      s.classList.toggle('active', i === idx);
      s.setAttribute('aria-hidden', String(i !== idx));
    });
    current = idx;
  };


  // Circular progress logic
  const circle = document.querySelector('.hero-circle-progress .circle-fg');
  const circleLength = 2 * Math.PI * 18; // r=18

  function animateCircleProgress(time) {
    if (!circle) return;
    circle.style.transition = 'none';
    circle.style.strokeDasharray = circleLength;
    circle.style.strokeDashoffset = circleLength;
    // Animate
    setTimeout(() => {
      circle.style.transition = `stroke-dashoffset ${time}ms linear`;
      circle.style.strokeDashoffset = 0;
    }, 20);
  }

  const start = () => {
    stop();
    if (circle) {
      circle.style.transition = 'none';
      circle.style.strokeDashoffset = circleLength;
      // Animate fill
      animateCircleProgress(duration);
    }
    timer = setTimeout(() => next(), duration);
  };

  const stop = () => { if (timer) { clearTimeout(timer); timer = null; } }

  const next = () => { go((current + 1) % slides.length); start(); }

  // init
  go(0); start();
  })();

// === Lazy background images for .lazy-bg ===
  (function lazyBackgrounds(){
  if (!('IntersectionObserver' in window)) {
    // fallback: load all
    document.querySelectorAll('.lazy-bg').forEach(el => {
      const src = el.getAttribute('data-bg'); if (src) el.style.backgroundImage = `url('${src}')`;
    });
    return;
  }

  // Eager-load any hero slide backgrounds that are above-the-fold so the hero never appears empty
  try {
    document.querySelectorAll('.hero-slide .lazy-bg').forEach(el => {
      const src = el.getAttribute('data-bg');
      if (src) {
        el.style.backgroundImage = `url('${src}')`;
        el.classList.remove('lazy-bg');
      }
    });
  } catch (err) { /* defensive: ignore any unexpected errors */ }

  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const el = e.target;
        const src = el.getAttribute('data-bg');
        if (src) {
          el.style.backgroundImage = `url('${src}')`;
          el.classList.remove('lazy-bg');
        }
        obs.unobserve(el);
      }
    });
  }, { rootMargin: '200px 0px' });

  document.querySelectorAll('.lazy-bg').forEach(el => io.observe(el));
  })();
});

// Safety fallback: if any slide-bg elements still don't have a computed background after load, set them.
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.hero-slide .slide-bg').forEach(el => {
    const has = getComputedStyle(el).backgroundImage;
    if ((!has || has === 'none' || has === 'initial') && el.dataset && el.dataset.bg) {
      el.style.backgroundImage = `url('${el.dataset.bg}')`;
      el.classList.remove('lazy-bg');
    }
  });
});


// === Featured Solutions Tab Switcher ===
document.addEventListener('DOMContentLoaded', function() {
  const tabBtns = document.querySelectorAll('.featured-tab-btn');
  const cards = {
    parking: document.getElementById('solution-parking'),
    traffic: document.getElementById('solution-traffic'),
    "air-quality": document.getElementById('solution-air-quality'),
    energy: document.getElementById('solution-energy')
  };
  tabBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      // Remove active from all
      tabBtns.forEach(b => b.classList.remove('active'));
      // Hide all cards
      Object.values(cards).forEach(card => card.style.display = 'none');
      // Activate this
      btn.classList.add('active');
      const key = btn.getAttribute('data-solution');
      if (cards[key]) {
        cards[key].style.display = '';
      }
    });
  });
});