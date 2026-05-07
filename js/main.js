/* ===================================================
   X Consórcios — Main JavaScript
   Particles · Animations · Interactions
=================================================== */

'use strict';

/* ---- PARTICLES CANVAS ---- */
(function initParticles() {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let W, H, particles = [], animId;

  const GOLD   = 'rgba(201,168,76,';
  const SILVER = 'rgba(200,200,216,';

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function randomParticle() {
    const isGold = Math.random() > .45;
    return {
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.4 + .3,
      dx: (Math.random() - .5) * .35,
      dy: (Math.random() - .5) * .35,
      alpha: Math.random() * .5 + .15,
      color: isGold ? GOLD : SILVER,
    };
  }

  function initParticleList() {
    const count = Math.min(Math.floor((W * H) / 14000), 90);
    particles = Array.from({ length: count }, randomParticle);
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // Draw connection lines between nearby particles
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 130) {
          const opacity = (1 - dist / 130) * .12;
          ctx.beginPath();
          ctx.strokeStyle = `rgba(201,168,76,${opacity})`;
          ctx.lineWidth = .6;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }

    // Draw particles
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color + p.alpha + ')';
      ctx.fill();

      p.x += p.dx;
      p.y += p.dy;
      if (p.x < 0 || p.x > W) p.dx *= -1;
      if (p.y < 0 || p.y > H) p.dy *= -1;
    });

    animId = requestAnimationFrame(draw);
  }

  function start() {
    resize();
    initParticleList();
    draw();
  }

  window.addEventListener('resize', () => {
    cancelAnimationFrame(animId);
    resize();
    initParticleList();
    draw();
  });

  // Pause when tab is hidden
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cancelAnimationFrame(animId);
    else draw();
  });

  start();
})();


/* ---- HEADER SCROLL EFFECT ---- */
(function headerScroll() {
  const header = document.getElementById('header');
  if (!header) return;

  let lastY = 0;

  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    header.classList.toggle('scrolled', y > 60);
    lastY = y;
  }, { passive: true });
})();


/* ---- MOBILE HAMBURGER ---- */
(function hamburgerMenu() {
  const btn  = document.getElementById('hamburger');
  const menu = document.getElementById('nav-menu');
  if (!btn || !menu) return;

  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:999;opacity:0;transition:opacity .3s;pointer-events:none;';
  document.body.appendChild(overlay);

  function open() {
    menu.classList.add('open');
    btn.classList.add('open');
    btn.setAttribute('aria-expanded', 'true');
    overlay.style.opacity = '1';
    overlay.style.pointerEvents = 'auto';
    document.body.style.overflow = 'hidden';
  }
  function close() {
    menu.classList.remove('open');
    btn.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
    overlay.style.opacity = '0';
    overlay.style.pointerEvents = 'none';
    document.body.style.overflow = '';
  }

  btn.addEventListener('click', () => menu.classList.contains('open') ? close() : open());
  overlay.addEventListener('click', close);
  menu.querySelectorAll('.nav-link').forEach(l => l.addEventListener('click', close));

  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
})();


/* ---- ACTIVE NAV LINK (Intersection Observer) ---- */
(function activeNav() {
  const sections = document.querySelectorAll('section[id]');
  const links    = document.querySelectorAll('.nav-link');
  if (!sections.length) return;

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        links.forEach(l => l.classList.remove('active'));
        const active = document.querySelector(`.nav-link[href="#${e.target.id}"]`);
        if (active) active.classList.add('active');
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });

  sections.forEach(s => obs.observe(s));
})();


/* ---- AOS SCROLL ANIMATIONS ---- */
(function aos() {
  const els = document.querySelectorAll('[data-aos]');
  if (!els.length) return;

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('aos-animate');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: .1, rootMargin: '0px 0px -60px 0px' });

  els.forEach(el => obs.observe(el));
})();


/* ---- HERO BAR ANIMATION ---- */
(function heroBars() {
  const fills = document.querySelectorAll('.hero__dashboard .bar-fill');
  if (!fills.length) return;

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        fills.forEach(f => {
          setTimeout(() => { f.style.width = f.style.width || f.getAttribute('style').match(/width:\s*([\d.]+%)/)?.[1] || '0%'; }, 400);
        });
        obs.disconnect();
      }
    });
  }, { threshold: .3 });

  const dashboard = document.querySelector('.hero__dashboard');
  if (dashboard) obs.observe(dashboard);
})();


/* ---- X SCORE COUNTER ANIMATION ---- */
(function xscoreAnim() {
  const section  = document.getElementById('xscore');
  const fills    = document.querySelectorAll('.metric__fill');
  const vals     = document.querySelectorAll('.metric__val');
  const scoreNum = document.getElementById('score-number');
  if (!section) return;

  let animated = false;

  function animateCount(el, target, duration) {
    const start = performance.now();
    function step(now) {
      const p = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(ease * target);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting && !animated) {
        animated = true;

        // Animate fills
        fills.forEach(f => {
          const w = f.dataset.width || '0';
          setTimeout(() => { f.style.width = w + '%'; }, 200);
        });

        // Animate value counters
        vals.forEach(v => {
          const target = parseInt(v.dataset.target || '0', 10);
          setTimeout(() => animateCount(v, target, 1600), 300);
        });

        // Animate main score number (average of all targets)
        if (scoreNum) {
          const targets = [...vals].map(v => parseInt(v.dataset.target || '0', 10));
          const avg = Math.round(targets.reduce((a, b) => a + b, 0) / targets.length);
          setTimeout(() => animateCount(scoreNum, avg, 1800), 300);
        }

        obs.disconnect();
      }
    });
  }, { threshold: .25 });

  obs.observe(section);
})();


/* ---- DIAGNOSTIC FORM → WHATSAPP ---- */
(function diagnosticForm() {
  const form = document.getElementById('diagnostic-form');
  if (!form) return;

  const WA_NUMBER = '5500000000000';

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const data = new FormData(form);
    const nome     = data.get('nome')?.trim()    || '';
    const whatsapp = data.get('whatsapp')?.trim() || '';
    const cidade   = data.get('cidade')?.trim()   || '';
    const interesse = data.get('interesse')       || '';
    const valor    = data.get('valor')?.trim()    || '';
    const lance    = data.get('lance')            || 'Não informado';
    const prazo    = data.get('prazo')            || 'Não informado';

    // Basic validation
    const required = [
      { val: nome,      label: 'Nome' },
      { val: whatsapp,  label: 'WhatsApp' },
      { val: cidade,    label: 'Cidade/Estado' },
      { val: interesse, label: 'Tipo de interesse' },
      { val: valor,     label: 'Valor da carta' },
    ];
    const missing = required.filter(r => !r.val);
    if (missing.length) {
      showFormError(`Por favor preencha: ${missing.map(r => r.label).join(', ')}`);
      return;
    }

    const msg = [
      `Olá, vim pelo site da X Consórcios e quero fazer meu *Diagnóstico Inteligente de Consórcio*. 🎯`,
      ``,
      `*Meus dados:*`,
      `👤 Nome: ${nome}`,
      `📱 WhatsApp: ${whatsapp}`,
      `📍 Cidade/Estado: ${cidade}`,
      `🎯 Interesse: ${interesse}`,
      `💰 Valor da carta: ${valor}`,
      `🏦 Possui lance/entrada: ${lance}`,
      `⏱️ Prazo desejado: ${prazo}`,
    ].join('\n');

    const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank', 'noopener,noreferrer');

    showFormSuccess();
    form.reset();
  });

  function showFormError(msg) {
    removeToast();
    const t = createToast(msg, 'error');
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 5000);
  }

  function showFormSuccess() {
    removeToast();
    const t = createToast('Redirecionando para o WhatsApp... Em breve nossa equipe entrará em contato! ✅', 'success');
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 6000);
  }

  function removeToast() {
    document.querySelector('.x-toast')?.remove();
  }

  function createToast(msg, type) {
    const t = document.createElement('div');
    t.className = 'x-toast x-toast--' + type;
    t.textContent = msg;
    t.style.cssText = `
      position:fixed; bottom:24px; left:50%; transform:translateX(-50%);
      z-index:9999; max-width:420px; width:calc(100% - 32px);
      padding:14px 20px; border-radius:10px; font-size:.875rem;
      font-family:Inter,sans-serif; line-height:1.5;
      background:${type === 'success' ? 'rgba(20,80,40,.95)' : 'rgba(80,20,20,.95)'};
      border:1px solid ${type === 'success' ? 'rgba(74,222,128,.4)' : 'rgba(220,80,80,.4)'};
      color:${type === 'success' ? '#86efac' : '#fca5a5'};
      backdrop-filter:blur(16px);
      box-shadow:0 8px 32px rgba(0,0,0,.5);
      animation:toastIn .3s ease;
    `;
    return t;
  }

  // Inject toast animation
  const style = document.createElement('style');
  style.textContent = '@keyframes toastIn{from{opacity:0;transform:translateX(-50%) translateY(10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}';
  document.head.appendChild(style);

  // Phone mask
  const waTel = document.getElementById('f-whatsapp');
  if (waTel) {
    waTel.addEventListener('input', function () {
      let v = this.value.replace(/\D/g, '').slice(0, 11);
      if (v.length >= 7) {
        v = v.length === 11
          ? `(${v.slice(0,2)}) ${v.slice(2,7)}-${v.slice(7)}`
          : `(${v.slice(0,2)}) ${v.slice(2,6)}-${v.slice(6)}`;
      } else if (v.length >= 3) {
        v = `(${v.slice(0,2)}) ${v.slice(2)}`;
      } else if (v.length >= 1) {
        v = `(${v}`;
      }
      this.value = v;
    });
  }

  // Currency mask for carta value
  const valInput = document.getElementById('f-valor');
  if (valInput) {
    valInput.addEventListener('input', function () {
      let v = this.value.replace(/\D/g, '');
      if (!v) { this.value = ''; return; }
      const n = parseInt(v, 10) / 100;
      this.value = 'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
    });
  }
})();


/* ---- SMOOTH SCROLL ---- */
(function smoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const offset = 80;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();


/* ---- MOBILE CTA VISIBILITY ---- */
(function mobileCta() {
  const cta = document.getElementById('mobile-cta');
  if (!cta) return;

  let shown = false;
  window.addEventListener('scroll', () => {
    const show = window.scrollY > 400;
    if (show !== shown) {
      cta.style.transform = show ? 'translateY(0)' : 'translateY(110%)';
      shown = show;
    }
  }, { passive: true });

  cta.style.transform = 'translateY(110%)';
  cta.style.transition = 'transform .4s cubic-bezier(.4,0,.2,1)';
})();


/* ---- HERO BARS (on load) ---- */
window.addEventListener('load', () => {
  setTimeout(() => {
    document.querySelectorAll('.hero__dashboard .bar-fill').forEach(f => {
      const w = f.style.width;
      f.style.width = '0';
      requestAnimationFrame(() => {
        requestAnimationFrame(() => { f.style.width = w; });
      });
    });
  }, 600);
});


/* ---- COTA CARDS STAGGER (on scroll) ---- */
(function cotaStagger() {
  const cards = document.querySelectorAll('.cota-card');
  if (!cards.length) return;

  const obs = new IntersectionObserver(entries => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        setTimeout(() => {
          e.target.style.opacity = '1';
          e.target.style.transform = 'translateY(0)';
        }, i * 80);
        obs.unobserve(e.target);
      }
    });
  }, { threshold: .1 });

  cards.forEach(c => {
    c.style.opacity = '0';
    c.style.transform = 'translateY(20px)';
    c.style.transition = 'opacity .5s ease, transform .5s ease';
    obs.observe(c);
  });
})();
