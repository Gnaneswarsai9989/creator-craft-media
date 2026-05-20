/* ============================================================
   CREATOR CRAFT MEDIA — script.js  v5.0
   Updated: New mobile nav, WhatsApp form, improved UX
   ============================================================ */
'use strict';

/* ── PAGE TRANSITIONS REMOVED ── */

/* ── STABLE VIEWPORT HEIGHT ── */
/* Set once, NEVER update on resize — prevents hero reflow when mobile browser chrome shows/hides */
(function setStableVH() {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
})();

/* ── DETECT TOUCH ── */
const isTouch = window.matchMedia('(pointer: coarse)').matches;
if (!isTouch) document.body.classList.add('hide-cursor');

/* ── CUSTOM CURSOR ── */
const cur     = document.getElementById('cur');
const curRing = document.getElementById('curRing');

if (!isTouch && cur && curRing) {
  let mx = 0, my = 0, rx = 0, ry = 0;
  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
  document.addEventListener('mouseleave', () => { cur.style.opacity = '0'; curRing.style.opacity = '0'; });
  document.addEventListener('mouseenter', () => { cur.style.opacity = '1'; curRing.style.opacity = '1'; });
  const tickCursor = () => {
    rx += (mx - rx) * 0.1;
    ry += (my - ry) * 0.1;
    cur.style.left     = mx + 'px';
    cur.style.top      = my + 'px';
    curRing.style.left = rx + 'px';
    curRing.style.top  = ry + 'px';
    requestAnimationFrame(tickCursor);
  };
  tickCursor();
  document.querySelectorAll('a, button, .svc-card, .cc, .wt, .founder-card, .cc-enroll').forEach(el => {
    el.addEventListener('mouseenter', () => {
      cur.style.transform = 'translate(-50%,-50%) scale(2)';
      curRing.style.width = '50px'; curRing.style.height = '50px';
      curRing.style.borderColor = 'rgba(99,102,241,.55)';
    });
    el.addEventListener('mouseleave', () => {
      cur.style.transform = 'translate(-50%,-50%) scale(1)';
      curRing.style.width = '32px'; curRing.style.height = '32px';
      curRing.style.borderColor = 'rgba(99,102,241,.4)';
    });
  });
}

/* ── CANVAS BACKGROUND ── */
const canvas = document.getElementById('bgCanvas');
if (canvas) {
  const ctx = canvas.getContext('2d');
  let W, H;
  const resize = () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; };
  resize();
  window.addEventListener('resize', resize, { passive: true });

  const COLS = ['rgba(99,102,241,', 'rgba(129,140,248,', 'rgba(165,180,252,'];
  class Dot {
    constructor(init) { this.reset(init); }
    reset(init) {
      this.x = Math.random() * (W || 1200);
      this.y = init ? Math.random() * (H || 800) : (H || 800) + 10;
      this.r = Math.random() * 1.3 + 0.2;
      this.vx = (Math.random() - 0.5) * 0.22;
      this.vy = -(Math.random() * 0.4 + 0.1);
      this.alpha = Math.random() * 0.5 + 0.08;
      this.col = COLS[Math.floor(Math.random() * COLS.length)];
      this.life = 1; this.decay = Math.random() * 0.0012 + 0.0007;
    }
    update() {
      this.x += this.vx; this.y += this.vy; this.life -= this.decay;
      if (this.life <= 0 || this.y < -10) this.reset(false);
    }
    draw() {
      ctx.beginPath(); ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = this.col + (this.alpha * this.life) + ')'; ctx.fill();
    }
  }

  /* Fewer dots on touch/mobile to reduce GPU load during scroll */
  const DOT_COUNT = isTouch ? 40 : 90;
  const dots = Array.from({ length: DOT_COUNT }, (_, i) => new Dot(true));
  const CONN = 85;
  let t = 0;

  /* Pause canvas during active scroll on mobile to avoid competing with compositor */
  let scrollPaused = false;
  let scrollTimer  = null;
  if (isTouch) {
    window.addEventListener('scroll', () => {
      scrollPaused = true;
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => { scrollPaused = false; }, 200);
    }, { passive: true });
  }

  const animCanvas = () => {
    requestAnimationFrame(animCanvas);
    if (scrollPaused) return; /* skip frame during scroll on mobile */

    ctx.clearRect(0, 0, W, H);
    t += 0.007;
    const g1 = ctx.createRadialGradient(W*.72+Math.sin(t)*28, H*.18+Math.cos(t)*18, 0, W*.72+Math.sin(t)*28, H*.18+Math.cos(t)*18, 320);
    g1.addColorStop(0, 'rgba(99,102,241,0.045)'); g1.addColorStop(1, 'rgba(99,102,241,0)');
    ctx.fillStyle = g1; ctx.fillRect(0, 0, W, H);
    const g2 = ctx.createRadialGradient(W*.18+Math.cos(t*.65)*22, H*.72+Math.sin(t*.65)*18, 0, W*.18+Math.cos(t*.65)*22, H*.72+Math.sin(t*.65)*18, 260);
    g2.addColorStop(0, 'rgba(99,102,241,0.03)'); g2.addColorStop(1, 'rgba(99,102,241,0)');
    ctx.fillStyle = g2; ctx.fillRect(0, 0, W, H);

    /* Skip expensive connection lines on mobile */
    if (!isTouch) {
      for (let i = 0; i < dots.length; i++) {
        for (let j = i + 1; j < dots.length; j++) {
          const dx = dots[i].x - dots[j].x, dy = dots[i].y - dots[j].y;
          const d = Math.sqrt(dx*dx + dy*dy);
          if (d < CONN) {
            ctx.beginPath(); ctx.moveTo(dots[i].x, dots[i].y); ctx.lineTo(dots[j].x, dots[j].y);
            ctx.strokeStyle = `rgba(99,102,241,${0.045*(1-d/CONN)})`; ctx.lineWidth = 0.5; ctx.stroke();
          }
        }
      }
    }
    dots.forEach(d => { d.update(); d.draw(); });
  };
  animCanvas();
}

/* ── NAVBAR SCROLL — direction-aware, always visible on scroll-up ── */
const nav = document.getElementById('nav');
let navStuck    = false;
let lastScrollY = window.scrollY;

window.addEventListener('scroll', () => {
  const y   = window.scrollY;
  const dir = y > lastScrollY ? 'down' : 'up';
  lastScrollY = y;

  if (!navStuck && y > 60) {
    /* Scrolled down past threshold → show full nav background */
    navStuck = true;
    nav.classList.add('stuck');
  } else if (navStuck && dir === 'up' && y < 60) {
    /* Scrolled back near top → remove stuck only near top */
    navStuck = false;
    nav.classList.remove('stuck');
  }
  /* While navStuck=true and scrolling UP: keep .stuck — nav stays fully opaque */
}, { passive: true });

/* ══════════════════════════════════════
   MOBILE NAV — New Floating Panel Logic
══════════════════════════════════════ */
const burger      = document.getElementById('burger');
const mobOverlay  = document.getElementById('mobOverlay');
const mobNavPanel = document.getElementById('mobNavPanel');
const mobNavClose = document.getElementById('mobNavClose');

const openMobileNav = () => {
  mobNavPanel.classList.add('open');
  mobOverlay.style.display = 'block';
  // Trigger reflow for transition
  mobOverlay.offsetHeight;
  mobOverlay.classList.add('open');
  burger.classList.add('open');
  document.body.style.overflow = 'hidden';
};

const closeMobileNav = () => {
  mobNavPanel.classList.remove('open');
  mobOverlay.classList.remove('open');
  burger.classList.remove('open');
  document.body.style.overflow = '';
  // Hide overlay after transition
  setTimeout(() => {
    if (!mobOverlay.classList.contains('open')) {
      mobOverlay.style.display = '';
    }
  }, 420);
};

burger.addEventListener('click', () => {
  if (mobNavPanel.classList.contains('open')) {
    closeMobileNav();
  } else {
    openMobileNav();
  }
});

mobNavClose.addEventListener('click', closeMobileNav);
mobOverlay.addEventListener('click', closeMobileNav);
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMobileNav(); });

// Close on nav link click
document.querySelectorAll('.msl').forEach(a => {
  a.addEventListener('click', () => {
    closeMobileNav();
  });
});

/* ── ACTIVE NAV HIGHLIGHT ── */
const navLinks = document.querySelectorAll('.nl');
const sections = document.querySelectorAll('section[id]');
sections.forEach(s => {
  new IntersectionObserver(([e]) => {
    if (!e.isIntersecting) return;
    navLinks.forEach(l => {
      l.classList.toggle('active', l.getAttribute('href') === '#' + s.id);
    });
  }, { threshold: 0.35 }).observe(s);
});

/* ── REVEAL ON SCROLL ── */
const revEls = document.querySelectorAll('.reveal');
const revObs = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const siblings = [...entry.target.parentElement.querySelectorAll('.reveal')];
    const idx      = siblings.indexOf(entry.target);
    /* On touch: no stagger delay — prevents animation fighting scroll direction */
    const delay = isTouch ? 0 : Math.min(idx * 80, 360);
    setTimeout(() => entry.target.classList.add('in'), delay);
    revObs.unobserve(entry.target);
  });
}, {
  threshold: 0.05,
  rootMargin: '0px 0px 0px 0px' /* no negative margin — fire only when truly visible */
});
revEls.forEach(el => revObs.observe(el));

/* ── COUNTERS ── */
document.querySelectorAll('.cnt').forEach(el => {
  new IntersectionObserver(([e], obs) => {
    if (!e.isIntersecting) return;
    const end = parseInt(el.dataset.to, 10), dur = 1800, t0 = performance.now();
    const tick = now => {
      const p = Math.min((now - t0) / dur, 1);
      el.textContent = Math.round((1 - Math.pow(1 - p, 3)) * end);
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    obs.unobserve(el);
  }, { threshold: 0.5 }).observe(el);
});

/* ── PHONE 3D TILT ── */
const phoneScene = document.getElementById('phoneScene');
if (phoneScene && !isTouch) {
  document.addEventListener('mousemove', e => {
    const rx = ((e.clientY / innerHeight) - 0.5) * 12;
    const ry = ((e.clientX / innerWidth) - 0.5) * 12;
    phoneScene.style.transform = `rotateX(${-rx}deg) rotateY(${ry}deg)`;
    phoneScene.style.transition = 'transform 0.1s ease';
  });
}

/* ── WHY TILES STAGGER ── */
document.querySelectorAll('.wt').forEach((t, idx) => {
  t.style.cssText += 'opacity:0;transform:translateY(20px) scale(0.97);transition:opacity .6s ease,transform .6s ease,border-color .28s,box-shadow .28s';
  new IntersectionObserver(([e], obs) => {
    if (!e.isIntersecting) return;
    const all = [...e.target.parentElement.querySelectorAll('.wt')];
    setTimeout(() => { e.target.style.opacity = '1'; e.target.style.transform = 'translateY(0) scale(1)'; }, all.indexOf(e.target) * 90);
    obs.unobserve(e.target);
  }, { threshold: 0.1 }).observe(t);
});

/* ── SERVICE CARDS STAGGER ── */
document.querySelectorAll('.svc-card').forEach(c => {
  c.style.cssText += 'opacity:0;transform:translateY(24px);transition:opacity .6s ease,transform .6s ease,border-color .28s,box-shadow .28s';
  new IntersectionObserver(([e], obs) => {
    if (!e.isIntersecting) return;
    const all = [...e.target.parentElement.querySelectorAll('.svc-card')];
    setTimeout(() => { e.target.style.opacity = '1'; e.target.style.transform = 'translateY(0)'; }, all.indexOf(e.target) * 75);
    obs.unobserve(e.target);
  }, { threshold: 0.07 }).observe(c);
});

/* ── COURSE CARDS STAGGER ── */
document.querySelectorAll('.cc').forEach(c => {
  c.style.cssText += 'opacity:0;transform:translateY(32px);transition:opacity .7s ease,transform .7s ease,border-color .28s,box-shadow .28s';
  new IntersectionObserver(([e], obs) => {
    if (!e.isIntersecting) return;
    const all = [...e.target.parentElement.querySelectorAll('.cc')];
    setTimeout(() => { e.target.style.opacity = '1'; e.target.style.transform = 'translateY(0)'; }, all.indexOf(e.target) * 95);
    obs.unobserve(e.target);
  }, { threshold: 0.05 }).observe(c);
});

/* ── FOUNDER CARDS ── */
document.querySelectorAll('.founder-card').forEach(c => {
  c.style.cssText += 'opacity:0;transform:translateY(36px);transition:opacity .8s ease,transform .8s ease,border-color .28s,box-shadow .28s';
  new IntersectionObserver(([e], obs) => {
    if (!e.isIntersecting) return;
    e.target.style.opacity = '1'; e.target.style.transform = 'translateY(0)';
    obs.unobserve(e.target);
  }, { threshold: 0.05 }).observe(c);
});

/* ── FLAGSHIP ENTRANCE ── */
const flCard = document.querySelector('.flagship-card');
if (flCard) {
  flCard.style.cssText += 'opacity:0;transform:translateY(36px) scale(0.99);transition:opacity .8s ease,transform .8s ease';
  new IntersectionObserver(([e], obs) => {
    if (!e.isIntersecting) return;
    e.target.style.opacity = '1'; e.target.style.transform = 'translateY(0) scale(1)';
    obs.unobserve(e.target);
  }, { threshold: 0.04 }).observe(flCard);
}

/* ── TOGETHER STRIP ── */
const ts = document.querySelector('.together-strip');
if (ts) {
  ts.style.cssText += 'opacity:0;transform:translateY(20px);transition:opacity .7s ease,transform .7s ease';
  new IntersectionObserver(([e], obs) => {
    if (!e.isIntersecting) return;
    e.target.style.opacity = '1'; e.target.style.transform = 'translateY(0)';
    obs.unobserve(e.target);
  }, { threshold: 0.15 }).observe(ts);
}

/* ── TOOL ICON HOVER GLOW ── */
document.querySelectorAll('.t-item, .t-item2').forEach(item => {
  item.addEventListener('mouseenter', () => {
    const icon = item.querySelector('.tool-icon');
    if (icon) icon.style.boxShadow = '0 0 20px rgba(99,102,241,.5)';
  });
  item.addEventListener('mouseleave', () => {
    const icon = item.querySelector('.tool-icon');
    if (icon) icon.style.boxShadow = '';
  });
});

/* ── BUTTON RIPPLE ── */
document.head.insertAdjacentHTML('beforeend', '<style>@keyframes rpl{from{transform:scale(0);opacity:1}to{transform:scale(2.8);opacity:0}}</style>');
document.querySelectorAll('.btn-vi, .btn-am, .cc-enroll, .fl-btn').forEach(btn => {
  btn.addEventListener('click', function(e) {
    const rect = this.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const rip  = document.createElement('span');
    rip.style.cssText = `position:absolute;border-radius:50%;pointer-events:none;background:rgba(255,255,255,.16);width:${size}px;height:${size}px;top:${e.clientY-rect.top-size/2}px;left:${e.clientX-rect.left-size/2}px;animation:rpl .55s ease forwards;`;
    this.style.position = 'relative'; this.style.overflow = 'hidden';
    this.appendChild(rip);
    setTimeout(() => rip.remove(), 600);
  });
});

/* ── HERO HEADLINE HOVER GLITCH ── */
document.querySelectorAll('.hl').forEach(line => {
  line.addEventListener('mouseenter', () => {
    line.style.cssText += 'letter-spacing:-0.01em;text-shadow:2px 0 0 rgba(99,102,241,.4),-2px 0 0 rgba(129,140,248,.25);transition:letter-spacing .18s,text-shadow .18s';
  });
  line.addEventListener('mouseleave', () => {
    line.style.letterSpacing = ''; line.style.textShadow = '';
  });
});

/* ── SMOOTH SCROLL — with navbar offset fix ── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href').slice(1);
    if (!id) return;
    const target = document.getElementById(id);
    if (!target) return;
    e.preventDefault();

    // Get navbar height dynamically (it may change on scroll)
    const navEl  = document.getElementById('nav');
    const offset = navEl ? navEl.offsetHeight : 0;

    // Calculate exact position below navbar
    const targetTop = target.getBoundingClientRect().top + window.scrollY - offset;

    // Use instant scroll on touch devices to avoid momentum jump bug
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({
      top:      Math.max(0, targetTop),
      behavior: prefersReduced ? 'instant' : 'smooth'
    });
  });
});

/* ══════════════════════════════════════
   CONTACT FORM → WHATSAPP
   Sends all fields as pre-filled WhatsApp message
══════════════════════════════════════ */
const cForm = document.getElementById('cForm');
if (cForm) {
  cForm.addEventListener('submit', e => {
    e.preventDefault();

    const name    = (document.getElementById('fname')   || {}).value || '';
    const phone   = (document.getElementById('fphone')  || {}).value || '';
    const service = (document.getElementById('fservice') || {}).value || 'Not selected';
    const message = (document.getElementById('fmsg')    || {}).value || '';

    const text = [
      `Hi Creator Craft Media!`,
      ``,
      `Name: ${name}`,
      `Phone: ${phone}`,
      `Service: ${service}`,
      message ? `Message: ${message}` : '',
      ``,
      `I'd like to know more about enrolling. Please get back to me!`
    ].filter(Boolean).join('\n');

    const encoded = encodeURIComponent(text);
    const waURL   = `https://wa.me/919700505046?text=${encoded}`;

    // Open WhatsApp in new tab
    window.open(waURL, '_blank');

    // Visual feedback
    const btn = cForm.querySelector('button[type="submit"]');
    const orig = btn.textContent;
    btn.textContent = 'Opening WhatsApp…';
    btn.disabled = true; btn.style.opacity = '.8';
    setTimeout(() => {
      btn.textContent = orig; btn.disabled = false; btn.style.opacity = '1';
    }, 2500);
  });
}

/* ── INPUT FOCUS LIFT ── */
document.querySelectorAll('.fg input, .fg select, .fg textarea').forEach(el => {
  const wrap = el.parentElement;
  wrap.style.transition = 'transform .18s ease';
  el.addEventListener('focus',  () => { wrap.style.transform = 'translateY(-2px)'; });
  el.addEventListener('blur',   () => { wrap.style.transform = ''; });
});

/* ── MARQUEE PAUSE ON HOVER ── */
const mqTrack = document.querySelector('.mq-track');
if (mqTrack) {
  mqTrack.parentElement.addEventListener('mouseenter', () => mqTrack.style.animationPlayState = 'paused');
  mqTrack.parentElement.addEventListener('mouseleave', () => mqTrack.style.animationPlayState = 'running');
}

/* ── SCROLL PROGRESS BAR ── */
const progBar = document.createElement('div');
progBar.style.cssText = 'position:fixed;top:0;left:0;height:2px;z-index:9999;background:linear-gradient(90deg,#6366f1,#a5b4fc);width:0%;pointer-events:none;transition:width .1s linear;';
document.body.appendChild(progBar);
window.addEventListener('scroll', () => {
  progBar.style.width = Math.min((window.scrollY / (document.body.scrollHeight - innerHeight)) * 100, 100) + '%';
}, { passive: true });

/* ══════════════════════════════════════
   iPHONE HOVER TILT — Magnetic 3D effect
══════════════════════════════════════ */
const iphScene = document.getElementById('iphScene');
if (iphScene && !isTouch) {
  const heroRight = iphScene.closest('.hero-right');
  let animPaused = false;
  let rafId = null;

  heroRight.addEventListener('mouseenter', () => {
    animPaused = true;
    iphScene.style.animationPlayState = 'paused';
  });

  heroRight.addEventListener('mouseleave', () => {
    animPaused = false;
    iphScene.style.animationPlayState = 'running';
    iphScene.style.transform = '';
  });

  heroRight.addEventListener('mousemove', e => {
    if (!animPaused) return;
    const rect = heroRight.getBoundingClientRect();
    const cx   = rect.left + rect.width  / 2;
    const cy   = rect.top  + rect.height / 2;
    const dx   = (e.clientX - cx) / (rect.width  / 2);
    const dy   = (e.clientY - cy) / (rect.height / 2);
    
    // Subtle hover offset (base angles are now explicitly set on the phones in CSS)
    const rotX = -dy * 8;
    const rotY = dx * 10;
    
    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(() => {
      iphScene.style.transform =
        `translate(-50%,-50%) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
    });
  });
}

/* ══════════════════════════════════════
   iPHONE FLOATING PARTICLES CANVAS
══════════════════════════════════════ */
const iphCanvas = document.getElementById('iphParticles');
if (iphCanvas) {
  const ctx2 = iphCanvas.getContext('2d');
  let W2, H2;
  const setSize = () => {
    const r = iphCanvas.parentElement.getBoundingClientRect();
    W2 = iphCanvas.width  = r.width  + 120;
    H2 = iphCanvas.height = r.height + 120;
  };
  setSize();
  window.addEventListener('resize', setSize, { passive: true });

  const PCOLS = ['rgba(224,112,32,', 'rgba(248,192,112,', 'rgba(255,140,40,'];
  class Particle {
    constructor() { this.reset(true); }
    reset(init) {
      this.x  = Math.random() * (W2 || 500);
      this.y  = init ? Math.random() * (H2 || 600) : (H2 || 600) + 5;
      this.r  = Math.random() * 1.8 + 0.3;
      this.vx = (Math.random() - 0.5) * 0.3;
      this.vy = -(Math.random() * 0.5 + 0.15);
      this.a  = Math.random() * 0.55 + 0.1;
      this.col = PCOLS[Math.floor(Math.random() * PCOLS.length)];
      this.life = 1;
      this.decay = Math.random() * 0.0015 + 0.0005;
    }
    update() {
      this.x += this.vx; this.y += this.vy; this.life -= this.decay;
      if (this.life <= 0 || this.y < -5) this.reset(false);
    }
    draw() {
      ctx2.beginPath();
      ctx2.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx2.fillStyle = this.col + (this.a * this.life) + ')';
      ctx2.fill();
    }
  }

  const particles = Array.from({ length: 55 }, () => new Particle());

  const animParticles = () => {
    requestAnimationFrame(animParticles);
    ctx2.clearRect(0, 0, W2, H2);
    particles.forEach(p => { p.update(); p.draw(); });
  };
  animParticles();
}

/* ══════════════════════════════════════
   CINEMATIC SHOWCASE — Swipe / Drag / Arrows / Dots
══════════════════════════════════════ */
(function initShowcaseSlider() {
  const slider = document.getElementById('showcaseSlider');
  const dotsWrap = document.getElementById('showcaseDots');
  const prevBtn  = document.querySelector('.showcase-prev');
  const nextBtn  = document.querySelector('.showcase-next');
  if (!slider) return;

  const cards = () => [...slider.querySelectorAll('.video-card-wrap')];

  /* ── Build dots ── */
  function buildDots() {
    if (!dotsWrap) return;
    dotsWrap.innerHTML = '';
    cards().forEach((_, i) => {
      const d = document.createElement('span');
      d.className = 'showcase-dot' + (i === 0 ? ' active' : '');
      d.addEventListener('click', () => scrollToCard(i));
      dotsWrap.appendChild(d);
    });
  }
  buildDots();

  /* ── Scroll to card by index ── */
  function scrollToCard(idx) {
    const c = cards()[idx];
    if (!c) return;
    slider.scrollTo({ left: c.offsetLeft - 40, behavior: 'smooth' });
  }

  /* ── Active dot sync ── */
  function updateDots() {
    if (!dotsWrap) return;
    const mid = slider.scrollLeft + slider.clientWidth / 2;
    let active = 0;
    cards().forEach((c, i) => {
      if (c.offsetLeft + c.offsetWidth / 2 < mid) active = i;
    });
    dotsWrap.querySelectorAll('.showcase-dot').forEach((d, i) =>
      d.classList.toggle('active', i === active)
    );
  }
  slider.addEventListener('scroll', updateDots, { passive: true });

  /* ── Arrow buttons ── */
  const cardW = () => (cards()[0]?.offsetWidth || 300) + 24;
  if (prevBtn) prevBtn.addEventListener('click', () =>
    slider.scrollBy({ left: -cardW(), behavior: 'smooth' })
  );
  if (nextBtn) nextBtn.addEventListener('click', () =>
    slider.scrollBy({ left: cardW(), behavior: 'smooth' })
  );

  /* ── Mouse drag-to-scroll ── */
  let isDragging = false, startX = 0, scrollStart = 0;
  slider.addEventListener('mousedown', e => {
    isDragging = true;
    startX = e.pageX;
    scrollStart = slider.scrollLeft;
    slider.classList.add('dragging');
  });
  window.addEventListener('mousemove', e => {
    if (!isDragging) return;
    slider.scrollLeft = scrollStart - (e.pageX - startX);
  });
  window.addEventListener('mouseup', () => {
    if (!isDragging) return;
    isDragging = false;
    slider.classList.remove('dragging');
  });

  /* ── Swipe hint on load — nudge right then back ── */
  setTimeout(() => {
    slider.scrollBy({ left: 80, behavior: 'smooth' });
    setTimeout(() => slider.scrollBy({ left: -80, behavior: 'smooth' }), 600);
  }, 1200);
})();

/* ══════════════════════════════════════
   ORBIT RING PARTICLES — bubbles rise from the ring line
══════════════════════════════════════ */
(function initOrbitParticles() {
  const canvas = document.getElementById('orbitParticles');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  /* Match canvas resolution to its CSS size */
  function resize() {
    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;
    canvas.width  = w * (window.devicePixelRatio || 1);
    canvas.height = h * (window.devicePixelRatio || 1);
    ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
  }
  resize();
  window.addEventListener('resize', resize);

  /* Ring geometry — must match CSS --orbit-r: 220px and canvas = 560px */
  const RING_R   = 220;   /* orbit ring radius in CSS px */
  const COLORS   = ['#a5b4fc', '#818cf8', '#67e8f9', '#c4b5fd', '#e0e7ff'];
  const MAX_P    = 35;    /* max simultaneous particles */

  function cx() { return canvas.offsetWidth  / 2; }
  function cy() { return canvas.offsetHeight / 2; }

  /* Create one particle at a random point ON the ring */
  function spawnParticle() {
    const angle = Math.random() * Math.PI * 2;
    return {
      x     : cx() + RING_R * Math.cos(angle),
      y     : cy() + RING_R * Math.sin(angle),
      r     : 1.5 + Math.random() * 2.5,          /* radius 1.5–4px */
      alpha : 0.7 + Math.random() * 0.3,
      vy    : -(0.4 + Math.random() * 0.8),        /* upward speed */
      vx    : (Math.random() - 0.5) * 0.4,         /* slight sideways drift */
      life  : 0,
      maxLife: 60 + Math.random() * 80,             /* frames alive */
      color : COLORS[Math.floor(Math.random() * COLORS.length)],
      wobble: Math.random() * Math.PI * 2,          /* wobble phase */
    };
  }

  let particles = Array.from({ length: MAX_P }, spawnParticle);

  function draw() {
    ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

    particles.forEach((p, i) => {
      p.life++;
      const progress = p.life / p.maxLife;          /* 0 → 1 over lifetime */

      /* Fade in for first 20% then fade out */
      const fadeIn  = Math.min(p.life / (p.maxLife * 0.2), 1);
      const fadeOut = 1 - Math.max((progress - 0.6) / 0.4, 0);
      const alpha   = p.alpha * fadeIn * fadeOut;

      /* Move upward + wobble */
      p.wobble += 0.04;
      p.x += p.vx + Math.sin(p.wobble) * 0.3;
      p.y += p.vy;

      /* Draw glowing bubble */
      const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 2.5);
      grad.addColorStop(0, p.color);
      grad.addColorStop(1, 'transparent');

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.shadowColor = p.color;
      ctx.shadowBlur  = 8;
      ctx.fill();
      ctx.restore();

      /* Recycle when dead */
      if (p.life >= p.maxLife) particles[i] = spawnParticle();
    });

    requestAnimationFrame(draw);
  }

  draw();
})();