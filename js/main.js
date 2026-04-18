/* ================================================================
   SURYANSH SHARMA — PORTFOLIO SCRIPTS
   - Custom cursor
   - Particle canvas (hero)
   - Scroll-triggered reveals
   - Animated counters
   - Nav scroll state
   ================================================================ */

(function () {
  'use strict';

  /* ======================== CURSOR ======================== */
  const cursor = document.getElementById('cursor');
  const trail  = document.getElementById('cursorTrail');
  let mx = 0, my = 0, tx = 0, ty = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
    cursor.style.left = mx + 'px';
    cursor.style.top  = my + 'px';
  });

  function animateTrail() {
    tx += (mx - tx) * 0.12;
    ty += (my - ty) * 0.12;
    trail.style.left = tx + 'px';
    trail.style.top  = ty + 'px';
    requestAnimationFrame(animateTrail);
  }
  animateTrail();

  document.querySelectorAll('a, button, .contact-card, .skill-block, .exp-card-inner, .why-card').forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursor.style.width  = '20px';
      cursor.style.height = '20px';
      trail.style.width  = '60px';
      trail.style.height = '60px';
      trail.style.borderColor = 'rgba(245,166,35,0.8)';
    });
    el.addEventListener('mouseleave', () => {
      cursor.style.width  = '12px';
      cursor.style.height = '12px';
      trail.style.width  = '36px';
      trail.style.height = '36px';
      trail.style.borderColor = 'rgba(245,166,35,0.5)';
    });
  });

  /* ======================== NAV ======================== */
  const nav = document.getElementById('nav');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 80);
  }, { passive: true });

  /* ======================== HERO CANVAS — PARTICLE GRID ======================== */
  const canvas = document.getElementById('heroCanvas');
  const ctx    = canvas.getContext('2d');
  let W, H, particles = [];

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
    initParticles();
  }

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x  = Math.random() * W;
      this.y  = Math.random() * H;
      this.vx = (Math.random() - 0.5) * 0.4;
      this.vy = (Math.random() - 0.5) * 0.4;
      this.r  = Math.random() * 1.8 + 0.4;
      this.a  = Math.random() * 0.5 + 0.1;
      this.life = Math.random() * 200 + 100;
      this.age  = 0;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.age++;
      if (this.age > this.life || this.x < 0 || this.x > W || this.y < 0 || this.y > H) this.reset();
    }
    draw() {
      const fade = Math.sin(Math.PI * this.age / this.life);
      ctx.globalAlpha = this.a * fade;
      ctx.fillStyle   = '#f5a623';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function initParticles() {
    particles = Array.from({ length: 120 }, () => new Particle());
  }

  function drawConnections() {
    const maxDist = 110;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const d  = Math.sqrt(dx * dx + dy * dy);
        if (d < maxDist) {
          ctx.globalAlpha = (1 - d / maxDist) * 0.12;
          ctx.strokeStyle = '#f5a623';
          ctx.lineWidth   = 0.5;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
  }

  let animFrame;
  function animate() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    drawConnections();
    ctx.globalAlpha = 1;
    animFrame = requestAnimationFrame(animate);
  }

  window.addEventListener('resize', resize, { passive: true });
  resize();
  animate();

  /* Parallax on hero canvas */
  window.addEventListener('scroll', () => {
    const hero = document.getElementById('hero');
    if (!hero) return;
    const prog = Math.min(window.scrollY / hero.offsetHeight, 1);
    canvas.style.transform = `translateY(${prog * 80}px)`;
  }, { passive: true });

  /* ======================== SCROLL REVEAL ======================== */
  const revealEls = document.querySelectorAll(
    '.reveal-fade, .reveal-card, .exp-card, .skill-block, .why-card'
  );

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  revealEls.forEach(el => observer.observe(el));

  /* ======================== ANIMATED COUNTERS ======================== */
  const counters = document.querySelectorAll('.stat-num');

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(el => counterObserver.observe(el));

  function animateCounter(el) {
    const target   = parseInt(el.dataset.target, 10);
    const duration = 1600;
    const start    = performance.now();

    function step(now) {
      const t    = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      el.textContent = Math.floor(ease * target);
      if (t < 1) requestAnimationFrame(step);
      else el.textContent = target;
    }
    requestAnimationFrame(step);
  }

  /* ======================== MARQUEE PAUSE ON HOVER ======================== */
  const marquee = document.querySelector('.marquee-track');
  if (marquee) {
    const wrapper = marquee.parentElement;
    wrapper.addEventListener('mouseenter', () => {
      marquee.style.animationPlayState = 'paused';
    });
    wrapper.addEventListener('mouseleave', () => {
      marquee.style.animationPlayState = 'running';
    });
  }

  /* ======================== ACTIVE NAV HIGHLIGHTING ======================== */
  const sections  = document.querySelectorAll('section[id]');
  const navLinks  = document.querySelectorAll('.nav-links a');

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(a => a.classList.remove('active'));
        const link = document.querySelector(`.nav-links a[href="#${entry.target.id}"]`);
        if (link) link.classList.add('active');
      }
    });
  }, { threshold: 0.4 });

  sections.forEach(s => sectionObserver.observe(s));

  /* ======================== GLITCH EFFECT ON HERO NAMES ======================== */
  const nameLines = document.querySelectorAll('.name-line');

  nameLines.forEach(el => {
    el.addEventListener('mouseenter', () => {
      el.classList.add('glitch');
      setTimeout(() => el.classList.remove('glitch'), 500);
    });
  });

  /* Inject glitch keyframes dynamically */
  const glitchStyle = document.createElement('style');
  glitchStyle.textContent = `
    .name-line.glitch {
      animation: glitchAnim 0.4s steps(1) forwards !important;
    }
    @keyframes glitchAnim {
      0%   { clip-path: inset(0 0 90% 0); transform: translateX(-3px) skewX(-5deg); }
      10%  { clip-path: inset(80% 0 0 0); transform: translateX(3px) skewX(3deg); }
      20%  { clip-path: inset(40% 0 40% 0); transform: translateX(-2px); }
      30%  { clip-path: inset(60% 0 20% 0); transform: translateX(4px) skewX(-2deg); }
      40%  { clip-path: inset(0 0 60% 0); transform: translateX(0); }
      50%  { clip-path: inset(20% 0 70% 0); transform: translateX(-4px); }
      60%  { clip-path: inset(0 0 0 0); transform: translateX(0); }
      70%  { clip-path: inset(0 0 0 0); transform: translateX(2px) skewX(1deg); }
      100% { clip-path: inset(0 0 0 0); transform: translateX(0) skewX(0deg); }
    }

    .nav-links a.active { color: var(--text) !important; }
    .nav-links a.active::after { width: 100% !important; }
  `;
  document.head.appendChild(glitchStyle);

  /* ======================== SMOOTH ANCHOR SCROLLING ======================== */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  /* ======================== TYPEWRITER IN MONITOR ======================== */
  const codeSnippets = [
    ['Hello, World!', 'function greet() {', '  console.log("Hi");', '}'],
    ['class Customer {', '  resolve(issue) {', '    return happiness;', '  }', '}'],
    ['// Always listen first', 'empathize();', 'solve(problem);', 'follow_up();'],
  ];

  let snippetIndex = 0;
  const codeLines = document.querySelectorAll('.code-lines span');

  function cycleCodeLines() {
    const snippet = codeSnippets[snippetIndex % codeSnippets.length];
    codeLines.forEach((line, i) => {
      if (snippet[i]) {
        setTimeout(() => {
          line.style.opacity = '0.8';
        }, i * 120);
      }
    });
    snippetIndex++;
  }

  setInterval(cycleCodeLines, 4000);

  /* ======================== TILT EFFECT ON CARDS ======================== */
  document.querySelectorAll('.exp-card-inner, .skill-block, .why-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect   = card.getBoundingClientRect();
      const x      = e.clientX - rect.left;
      const y      = e.clientY - rect.top;
      const cx     = rect.width  / 2;
      const cy     = rect.height / 2;
      const rotX   = ((y - cy) / cy) * -6;
      const rotY   = ((x - cx) / cx) * 6;
      card.style.transform = `perspective(600px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-4px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });

  console.log(
    '%c 👋 Hey Recruiter! %c\nSuryansh built this with care.\nEmail: 1923.suryansh@gmail.com',
    'background:#f5a623;color:#0a0a0a;font-size:14px;font-weight:bold;padding:4px 8px;',
    'color:#f5a623;font-size:12px;'
  );

})();
