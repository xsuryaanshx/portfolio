/* ================================================================
   MAIN.JS — Interactions, scroll reveals, cursor, counters
   ================================================================ */

(function () {
  'use strict';

  /* ── CURSOR ── */
  const cursor = document.getElementById('cursor');
  const ring   = document.getElementById('cursorRing');
  let mx = 0, my = 0, rx = 0, ry = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    if (cursor) { cursor.style.left = mx + 'px'; cursor.style.top = my + 'px'; }
  });

  (function loopRing() {
    rx += (mx - rx) * .11;
    ry += (my - ry) * .11;
    if (ring) { ring.style.left = rx + 'px'; ring.style.top = ry + 'px'; }
    requestAnimationFrame(loopRing);
  })();

  document.querySelectorAll('a, button, .cert-card, .about-card, .edu-card, .stag').forEach(el => {
    el.addEventListener('mouseenter', () => {
      if (cursor) { cursor.style.width = '16px'; cursor.style.height = '16px'; }
      if (ring)   { ring.style.width = '56px'; ring.style.height = '56px'; ring.style.borderColor = 'rgba(0,229,255,.8)'; }
    });
    el.addEventListener('mouseleave', () => {
      if (cursor) { cursor.style.width = '8px'; cursor.style.height = '8px'; }
      if (ring)   { ring.style.width = '34px'; ring.style.height = '34px'; ring.style.borderColor = 'rgba(0,229,255,.5)'; }
    });
  });

  /* ── NAV SCROLL ── */
  const nav = document.getElementById('nav');
  window.addEventListener('scroll', () => {
    if (nav) nav.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });

  /* ── HERO CANVAS (particle field) ── */
  const heroCanvas = document.getElementById('bgCanvas');
  if (heroCanvas) {
    const ctx = heroCanvas.getContext('2d');
    let W, H, pts = [];

    function resize() {
      W = heroCanvas.width  = heroCanvas.offsetWidth;
      H = heroCanvas.height = heroCanvas.offsetHeight;
      pts = Array.from({ length: 80 }, () => ({
        x: Math.random() * W, y: Math.random() * H,
        vx: (Math.random() - .5) * .3, vy: (Math.random() - .5) * .3,
        r: Math.random() * 1.5 + .3, a: Math.random() * .4 + .1,
        life: Math.random() * 200 + 100, age: 0
      }));
    }

    function drawHero() {
      ctx.clearRect(0, 0, W, H);
      pts.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.age++;
        if (p.age > p.life || p.x < 0 || p.x > W || p.y < 0 || p.y > H) {
          Object.assign(p, { x: Math.random() * W, y: Math.random() * H, age: 0 });
        }
        const fade = Math.sin(Math.PI * p.age / p.life);
        ctx.globalAlpha = p.a * fade;
        ctx.fillStyle = '#00e5ff';
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      });

      // connections
      for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
        const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 100) {
          ctx.globalAlpha = (1 - d / 100) * .1;
          ctx.strokeStyle = '#00e5ff'; ctx.lineWidth = .5;
          ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y); ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;
      requestAnimationFrame(drawHero);
    }

    window.addEventListener('resize', resize, { passive: true });
    resize(); drawHero();
  }

  /* ── SCROLL REVEALS ── */
  const revealEls = document.querySelectorAll(
    '.reveal, .about-card, .exp-item, .edu-card, .skill-row, .stag, .lang-row, .cert-card, .contact-item, .contact-right'
  );

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
    });
  }, { threshold: .12 });

  revealEls.forEach(el => io.observe(el));

  /* ── SKILL BARS ── */
  // Set CSS variable --w for each bar based on data-w attr
  document.querySelectorAll('.sk-fill').forEach(bar => {
    bar.style.setProperty('--w', bar.dataset.w || '0');
  });

  /* ── COUNTERS ── */
  const counters = document.querySelectorAll('.stat-n');
  const cio = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const el = e.target;
        const target = parseInt(el.dataset.t, 10);
        const start = performance.now();
        const dur = 1600;
        (function step(now) {
          const t = Math.min((now - start) / dur, 1);
          const ease = 1 - Math.pow(1 - t, 3);
          el.textContent = Math.floor(ease * target);
          if (t < 1) requestAnimationFrame(step);
          else el.textContent = target;
        })(start);
        cio.unobserve(el);
      }
    });
  }, { threshold: .5 });
  counters.forEach(el => cio.observe(el));

  /* ── TICKER PAUSE ── */
  const ticker = document.querySelector('.ticker');
  const inner  = document.querySelector('.ticker-inner');
  if (ticker && inner) {
    ticker.addEventListener('mouseenter', () => inner.style.animationPlayState = 'paused');
    ticker.addEventListener('mouseleave', () => inner.style.animationPlayState = 'running');
  }

  /* ── SMOOTH ANCHORS ── */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const t = document.querySelector(a.getAttribute('href'));
      if (!t) return;
      e.preventDefault();
      t.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  /* ── ACTIVE NAV ── */
  const sections = document.querySelectorAll('section[id]');
  const navAs    = document.querySelectorAll('.nav-links a');
  const aio = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        navAs.forEach(a => a.style.color = '');
        const link = document.querySelector(`.nav-links a[href="#${e.target.id}"]`);
        if (link) link.style.color = 'var(--accent)';
      }
    });
  }, { threshold: .4 });
  sections.forEach(s => aio.observe(s));

  /* ── CERT CARD HOVER TILT ── */
  document.querySelectorAll('.cert-card, .edu-card, .about-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = e.clientX - r.left, y = e.clientY - r.top;
      const rx2 = ((y - r.height / 2) / r.height) * -8;
      const ry2 = ((x - r.width  / 2) / r.width ) *  8;
      card.style.transform = `perspective(500px) rotateX(${rx2}deg) rotateY(${ry2}deg) translateY(-4px)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });

  /* ── HERO NAME GLITCH ── */
  const style = document.createElement('style');
  style.textContent = `
    .hn-line:hover { animation: glitch .35s steps(1) forwards !important; }
    @keyframes glitch {
      0%  { clip-path:inset(0 0 90% 0); transform: translateX(-4px) skewX(-6deg); }
      15% { clip-path:inset(80% 0 0 0); transform: translateX(4px); }
      30% { clip-path:inset(40% 0 40% 0); transform: translateX(-2px) skewX(3deg); }
      50% { clip-path:inset(0 0 0 0); transform: translateX(0); }
      70% { clip-path:inset(60% 0 20% 0); transform: translateX(3px); }
      100%{ clip-path:inset(0 0 0 0); transform: translateX(0) skewX(0); }
    }
  `;
  document.head.appendChild(style);

  console.log(
    '%c 👋 Hello Recruiter! %c\nSuryansh Sharma — Customer Support Specialist\nEmail: 1923.suryansh@gmail.com',
    'background:#00e5ff;color:#080c10;font-weight:bold;padding:4px 10px;font-size:13px',
    'color:#00e5ff;font-size:11px'
  );

})();
