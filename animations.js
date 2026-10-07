/**
 * animations.js — Kinetic animations for Anshad Digital Portfolio
 * Techniques: GSAP + ScrollTrigger, Intersection Observer, RAF lerp loop
 * Hardware-accelerated transforms only (no top/left/margin).
 * Fully respects prefers-reduced-motion and disables parallax on touch devices.
 */

(function () {
  'use strict';

  /* ─── 0. Guard: prefers-reduced-motion ─────────────────────────────────── */
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (typeof gsap === 'undefined') return;

  gsap.registerPlugin(ScrollTrigger);

  /* ─── Helper ─────────────────────────────────────────────────────────────── */
  const isTouch = window.matchMedia('(pointer: coarse)').matches;

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  /* ═══════════════════════════════════════════════════════════════════════════
   * 1.  WAVE / RIPPLE KINETIC TYPOGRAPHY — hero heading ONLY
   *     Pure vanilla JS · Math.sin · requestAnimationFrame · zero deps
   * ═══════════════════════════════════════════════════════════════════════════ */
  (function initWaveTypography() {
    const h1  = document.getElementById('hero-heading');
    const hero = document.getElementById('home');
    if (!h1 || !hero || isTouch || !h1.classList.contains('wave-heading')) return;

    /* ── Give the H1 room so waving letters don't clip ──────────────────── */
    h1.style.lineHeight     = '1.3';
    h1.style.paddingTop     = '0.15em';
    h1.style.paddingBottom  = '0.15em';
    h1.style.overflow       = 'visible';
    h1.style.maxWidth       = 'none';

    /* ── Split H1 into per-character wave-letter spans ───────────────────── */
    const allLetters = [];
    const nodes = Array.from(h1.childNodes);
    h1.innerHTML = '';

    nodes.forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        [...node.textContent].forEach((char) => {
          const s = document.createElement('span');
          s.className = 'wave-letter';
          s.style.cssText = char === ' '
            ? 'display:inline-block;width:0.28em;will-change:transform;vertical-align:baseline;'
            : 'display:inline-block;will-change:transform;vertical-align:baseline;';
          s.textContent = char === ' ' ? '\u00A0' : char;
          allLetters.push(s);
          h1.appendChild(s);
        });
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const wrapper = node.cloneNode(true);
        wrapper.style.cssText = 'display:inline-block;will-change:transform;vertical-align:baseline;';
        allLetters.push(wrapper);
        h1.appendChild(wrapper);
      }
    });

    const N          = allLetters.length;
    const AMPLITUDE  = 8;
    const FREQ       = 0.5;
    const LERP_ON    = 0.09;
    const LERP_OFF   = 0.07;

    const currentY = new Float32Array(N);
    const targetY  = new Float32Array(N);

    let phase       = 0;
    let targetPhase = 0;
    let active      = false;
    let rafId       = null;

    function tick() {
      phase += (targetPhase - phase) * 0.075;
      let anyMovement = false;

      for (let i = 0; i < N; i++) {
        targetY[i] = active ? Math.sin(i * FREQ - phase * Math.PI * 3) * AMPLITUDE : 0;
        currentY[i] += (targetY[i] - currentY[i]) * (active ? LERP_ON : LERP_OFF);

        if (Math.abs(currentY[i]) > 0.08 || Math.abs(targetY[i]) > 0.08) {
          anyMovement = true;
        }

        allLetters[i].style.transform = `translateY(${currentY[i].toFixed(2)}px)`;
      }

      rafId = (anyMovement || active) ? requestAnimationFrame(tick) : null;
    }

    function startTick() {
      if (!rafId) rafId = requestAnimationFrame(tick);
    }

    hero.addEventListener('mousemove', (e) => {
      active = true;
      const rect = hero.getBoundingClientRect();
      targetPhase = (e.clientX - rect.left) / rect.width;
      startTick();
    }, { passive: true });

    hero.addEventListener('mouseleave', () => {
      active = false;
      startTick();
    });

  })(); // end initWaveTypography

  /* ═══════════════════════════════════════════════════════════════════════════
   * 2.  CINEMATIC HERO ENTRY & MOUSE PARALLAX
   * ═══════════════════════════════════════════════════════════════════════════ */
  const anshadTypo  = document.querySelector('.hero-text-anshad');
  const digitalTypo = document.querySelector('.hero-text-digital-wrap');
  const heroLower   = document.querySelector('.hero-lower-content');
  const heroGlow    = document.querySelector('.hero-ambient-glow');

  if (anshadTypo || digitalTypo) {
    const heroTl = gsap.timeline({ defaults: { ease: 'power3.out', duration: 1 } });
    if (anshadTypo)  heroTl.fromTo(anshadTypo,  { opacity: 0, scale: 0.94, y: 30 }, { opacity: 1, scale: 1, y: 0 }, 0.1);
    if (digitalTypo) heroTl.fromTo(digitalTypo, { opacity: 0, scale: 0.92, y: 40 }, { opacity: 1, scale: 1, y: 0 }, 0.25);
    if (heroLower)   heroTl.fromTo(heroLower,   { opacity: 0, y: 25 }, { opacity: 1, y: 0, duration: 0.9 }, 0.45);

    if (!isTouch && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const heroSection = document.getElementById('home');
      let mx = 0, my = 0;
      let tx = 0, ty = 0;
      let rafId = null;

      function heroParallax() {
        tx = lerp(tx, mx, 0.05);
        ty = lerp(ty, my, 0.05);

        if (anshadTypo)  gsap.set(anshadTypo,  { x: tx * -16, y: ty * -9 });
        if (digitalTypo) gsap.set(digitalTypo, { x: tx * 10, y: ty * 6 });
        if (heroGlow)    gsap.set(heroGlow,    { x: tx * 22, y: ty * 14 });

        rafId = requestAnimationFrame(heroParallax);
      }

      window.addEventListener('mousemove', (e) => {
        mx = (e.clientX / window.innerWidth) - 0.5;
        my = (e.clientY / window.innerHeight) - 0.5;
      }, { passive: true });

      if (heroSection) {
        const io = new IntersectionObserver((entries) => {
          if (entries[0].isIntersecting) {
            if (!rafId) rafId = requestAnimationFrame(heroParallax);
          } else {
            if (rafId) {
              cancelAnimationFrame(rafId);
              rafId = null;
            }
          }
        }, { threshold: 0.1 });
        io.observe(heroSection);
      }
    }
  }

  /* ═══════════════════════════════════════════════════════════════════════════
   * 2.1 CINEMATIC HERO SCROLL EXIT ANIMATION
   *     Smooth scroll-linked fade out & subtle recession into the background
   * ═══════════════════════════════════════════════════════════════════════════ */
  const heroScene = document.querySelector('.hero-content-scene');
  const heroSection = document.getElementById('home');

  if (heroScene && heroSection) {
    const isMobile = window.innerWidth <= 768 || isTouch;

    const heroScrollTl = gsap.timeline({
      scrollTrigger: {
        trigger: heroSection,
        start: 'top top',
        end: 'bottom top',
        scrub: isMobile ? true : 0.7,
        invalidateOnRefresh: true,
      }
    });

    // Unified composition (ANSHAD, DIGITAL, Person, Left Motto, Right Services, Center Content)
    // fades synchronously: 100% → 80% → 60% → 40% → 20% → smoothly disappears
    heroScrollTl.to(heroScene, {
      opacity: 0,
      y: isMobile ? -30 : -50,
      scale: isMobile ? 0.98 : 0.95,
      ease: 'none',
    }, 0);

    // Atmospheric dimming as user scrolls to the next section
    const heroAtmosphere = document.querySelectorAll('.hero-ambient-glow, .hero-floor-reflection');
    if (heroAtmosphere.length) {
      heroScrollTl.to(heroAtmosphere, {
        opacity: 0.25,
        ease: 'none',
      }, 0);
    }
  }

  /* ═══════════════════════════════════════════════════════════════════════════
   * 3.  MAGNETIC BUTTONS (desktop only)
   * ═══════════════════════════════════════════════════════════════════════════ */
  if (!isTouch) {
    document.querySelectorAll('.magnetic-btn').forEach((btn) => {
      const STRENGTH = 0.32;   // how far the button follows the cursor (0–1)
      const GLOW_CLASS = 'magnetic-glow';

      btn.addEventListener('mouseenter', () => {
        btn.classList.add(GLOW_CLASS);
      });

      btn.addEventListener('mousemove', (e) => {
        const r = btn.getBoundingClientRect();
        const cx = r.left + r.width  / 2;
        const cy = r.top  + r.height / 2;
        const dx = (e.clientX - cx) * STRENGTH;
        const dy = (e.clientY - cy) * STRENGTH;

        gsap.to(btn, {
          x: dx,
          y: dy,
          duration: 0.25,
          ease: 'power2.out',
          overwrite: 'auto',
        });
      });

      btn.addEventListener('mouseleave', () => {
        btn.classList.remove(GLOW_CLASS);
        gsap.to(btn, {
          x: 0,
          y: 0,
          duration: 0.55,
          ease: 'elastic.out(1, 0.42)',
          overwrite: 'auto',
        });
      });
    });
  }

  /* ═══════════════════════════════════════════════════════════════════════════
   * 4.  SCROLL REVEAL — fade-in + slide-up for all major content blocks
   * ═══════════════════════════════════════════════════════════════════════════ */

  // Section labels + titles
  gsap.utils.toArray('.label, .section-title').forEach((el) => {
    gsap.fromTo(el,
      { opacity: 0, y: 28 },
      {
        opacity: 1, y: 0, duration: 0.65, ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 90%', toggleActions: 'play none none none' },
      }
    );
  });

  // Skill, Cert, Testimonial and Project cards — staggered per row
  ['#skills .skill-card', '#certifications .cert-tilt-container', '#testimonials .testimonial-card', '#projects .project-card'].forEach((sel) => {
    const els = gsap.utils.toArray(sel);
    if (!els.length) return;

    ScrollTrigger.batch(els, {
      start: 'top 88%',
      onEnter: (batch) => {
        gsap.fromTo(batch,
          { opacity: 0, y: 44, scale: 0.96 },
          {
            opacity: 1, y: 0, scale: 1,
            duration: 0.6, ease: 'power2.out',
            stagger: 0.09,
          }
        );
      },
      once: true,
    });
  });

  // Tool chips — subtle stagger
  const chips = gsap.utils.toArray('.tool-chip');
  if (chips.length) {
    ScrollTrigger.batch(chips, {
      start: 'top 90%',
      onEnter: (batch) => {
        gsap.fromTo(batch,
          { opacity: 0, y: 18, scale: 0.9 },
          {
            opacity: 1, y: 0, scale: 1,
            duration: 0.45, ease: 'back.out(1.6)',
            stagger: 0.045,
            onComplete: () => {
              gsap.set(batch, { clearProps: 'transform' });
            }
          }
        );
      },
      once: true,
    });
  }

  // About credential cards — slide in from left/right alternating
  gsap.utils.toArray('#about .rounded-3xl').forEach((el, i) => {
    gsap.fromTo(el,
      { opacity: 0, x: i % 2 === 0 ? -28 : 28 },
      {
        opacity: 1, x: 0, duration: 0.65, ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' },
      }
    );
  });

  // Experience card — slide in from left
  const expCard = document.querySelector('#experience .max-w-4xl');
  if (expCard) {
    gsap.fromTo(expCard,
      { opacity: 0, x: -36 },
      {
        opacity: 1, x: 0, duration: 0.7, ease: 'power2.out',
        scrollTrigger: { trigger: expCard, start: 'top 85%', toggleActions: 'play none none none' },
      }
    );
  }

  // Experience bullet points — stagger down
  gsap.utils.toArray('#experience .flex.items-start.gap-3').forEach((el, i) => {
    gsap.fromTo(el,
      { opacity: 0, x: -20 },
      {
        opacity: 1, x: 0, duration: 0.5, ease: 'power2.out',
        delay: i * 0.07,
        scrollTrigger: { trigger: el, start: 'top 90%', toggleActions: 'play none none none' },
      }
    );
  });

  // Resume section info block
  const resumeBlock = document.querySelector('#resume .rounded-3xl');
  if (resumeBlock) {
    gsap.fromTo(resumeBlock,
      { opacity: 0, y: 30 },
      {
        opacity: 1, y: 0, duration: 0.65, ease: 'power2.out',
        scrollTrigger: { trigger: resumeBlock, start: 'top 88%', toggleActions: 'play none none none' },
      }
    );
  }

  // Contact section central card
  const contactCard = document.querySelector('#contact .rounded-\\[2\\.5rem\\]');
  if (contactCard) {
    gsap.fromTo(contactCard,
      { opacity: 0, y: 40, scale: 0.97 },
      {
        opacity: 1, y: 0, scale: 1, duration: 0.75, ease: 'power3.out',
        scrollTrigger: { trigger: contactCard, start: 'top 86%', toggleActions: 'play none none none' },
      }
    );
  }

  // Contact channel cards (email / WhatsApp)
  gsap.utils.toArray('#contact .group.flex.items-center').forEach((el, i) => {
    gsap.fromTo(el,
      { opacity: 0, y: 22 },
      {
        opacity: 1, y: 0, duration: 0.5, ease: 'power2.out',
        delay: i * 0.1,
        scrollTrigger: { trigger: el, start: 'top 90%', toggleActions: 'play none none none' },
      }
    );
  });

})();
