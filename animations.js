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
    if (!h1 || !hero || isTouch) return;

    /* ── Give the H1 room so waving letters don't clip ──────────────────── */
    // Increase line-height so letters lifted by wave amplitude don't overlap
    // the badge above or the tagline below. Keep overflow visible.
    h1.style.lineHeight     = '1.3';
    h1.style.paddingTop     = '0.15em';
    h1.style.paddingBottom  = '0.15em';
    h1.style.overflow       = 'visible';
    // Remove width cap so split inline-block spans don't truncate at max-w-3xl
    h1.style.maxWidth       = 'none';

    /* ── Split H1 into per-character wave-letter spans ───────────────────── */
    const allLetters = [];

    // Snapshot original children: text node "Anshad S — " + span.gradient-text
    const nodes = Array.from(h1.childNodes);
    h1.innerHTML = '';

    nodes.forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        // Plain white text: split "Anshad S — " into individual letter spans
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
        // Gradient-text span: keep as ONE animatable unit so background-clip:text
        // continues to work (splitting into child inline-blocks breaks it — the
        // parent background only clips to its own text, not descendant text).
        const wrapper = node.cloneNode(true); // preserves class + text + gradient CSS
        wrapper.style.cssText = 'display:inline-block;will-change:transform;vertical-align:baseline;';
        allLetters.push(wrapper); // whole gradient phrase waves as one block
        h1.appendChild(wrapper);
      }
    });

    /* ── Animation constants ──────────────────────────────────────────────── */
    const N          = allLetters.length;
    const AMPLITUDE  = 8;      // max px lift — stays within padded line-height at all sizes
    const FREQ       = 0.5;    // spatial wave frequency (rad / letter)
    const LERP_ON    = 0.09;   // smoothing factor when wave is active
    const LERP_OFF   = 0.07;   // smoothing factor while settling back

    const currentY = new Float32Array(N); // live Y positions (lerped)
    const targetY  = new Float32Array(N); // destination Y positions

    let phase       = 0;       // current spatial phase of wave (driven by mouseX)
    let targetPhase = 0;       // where phase should lerp toward
    let active      = false;   // true while mouse is inside the hero section
    let rafId       = null;

    /* ── RAF loop ─────────────────────────────────────────────────────────── */
    function tick() {
      // Smoothly drive phase toward target mouse position
      phase += (targetPhase - phase) * 0.075;

      let anyMovement = false;

      for (let i = 0; i < N; i++) {
        // Sine wave: each letter oscillates at phase offset = index × FREQ
        // Subtracting phase * π*3 makes the wave travel in the mouse direction
        targetY[i] = active
          ? Math.sin(i * FREQ - phase * Math.PI * 3) * AMPLITUDE
          : 0;

        currentY[i] += (targetY[i] - currentY[i]) * (active ? LERP_ON : LERP_OFF);

        if (Math.abs(currentY[i]) > 0.08 || Math.abs(targetY[i]) > 0.08) {
          anyMovement = true;
        }

        // GPU-only transform — no layout reflow
        allLetters[i].style.transform = `translateY(${currentY[i].toFixed(2)}px)`;
      }

      // Kill the loop when all letters have settled back to zero
      rafId = (anyMovement || active) ? requestAnimationFrame(tick) : null;
    }

    function startTick() {
      if (!rafId) rafId = requestAnimationFrame(tick);
    }

    /* ── Hero section event listeners ────────────────────────────────────── */
    hero.addEventListener('mousemove', (e) => {
      active = true;
      // Normalise mouse X to [0, 1] relative to hero bounds
      const rect = hero.getBoundingClientRect();
      targetPhase = (e.clientX - rect.left) / rect.width;
      startTick();
    }, { passive: true });

    hero.addEventListener('mouseleave', () => {
      active = false;
      startTick(); // keep ticking until all letters settle to Y=0
    });

  })(); // end initWaveTypography

  /* ═══════════════════════════════════════════════════════════════════════════
   * 2.  HERO ENTRY ANIMATION — staggered reveal on first load
   * ═══════════════════════════════════════════════════════════════════════════ */
  const badge    = document.getElementById('hero-badge');
  const heading  = document.getElementById('hero-heading');
  const tagline  = document.getElementById('hero-tagline');
  const actions  = document.getElementById('hero-actions');
  const meta     = document.getElementById('hero-meta');
  const card     = document.getElementById('hero-profile-card');

  const entryTl = gsap.timeline({
    defaults: { ease: 'power3.out', duration: 0.75 }
  });

  if (badge)   entryTl.fromTo(badge,   { opacity: 0, y: 22 }, { opacity: 1, y: 0 });
  if (heading) entryTl.fromTo(heading, { opacity: 0, y: 38 }, { opacity: 1, y: 0, duration: 0.85 }, '-=0.45');
  if (tagline) entryTl.fromTo(tagline, { opacity: 0, y: 22 }, { opacity: 1, y: 0 }, '-=0.5');
  if (actions) entryTl.fromTo(actions, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.55 }, '-=0.4');
  if (meta)    entryTl.fromTo(meta,    { opacity: 0 },         { opacity: 1, duration: 0.5 }, '-=0.3');
  if (card)    entryTl.fromTo(card,    { opacity: 0, x: 45, scale: 0.94 }, { opacity: 1, x: 0, scale: 1, duration: 0.9 }, '-=0.75');

  /* ═══════════════════════════════════════════════════════════════════════════
   * 2.  MOUSE PARALLAX — hero heading / card follow cursor (desktop only)
   * ═══════════════════════════════════════════════════════════════════════════ */
  if (!isTouch && heading && card) {
    // Enable 3-D perspective on the card's parent grid column
    const cardParent = card.parentElement;
    if (cardParent) cardParent.style.perspective = '900px';

    let mx = 0, my = 0;       // raw normalised mouse position (-0.5 → 0.5)
    let tx = 0, ty = 0;       // lerped position
    let rafId = null;
    let heroActive = false;

    function parallaxLoop() {
      tx = lerp(tx, mx, 0.055);
      ty = lerp(ty, my, 0.055);

      // Heading drifts gently with mouse — X only (wave animation owns Y)
      gsap.set(heading, { x: tx * 14, willChange: 'transform' });

      // Tagline + badge move at a shallower depth
      if (tagline) gsap.set(tagline, { x: tx * 8,  y: ty * 4 });
      if (badge)   gsap.set(badge,   { x: tx * 5,  y: ty * 3 });

      // Profile card tilts in 3-D (counter-direction for parallax depth)
      gsap.set(card, {
        x:       tx * -12,
        y:       ty * -6,
        rotateY: tx * 6,
        rotateX: ty * -4,
        willChange: 'transform',
        transformOrigin: 'center center',
      });

      rafId = requestAnimationFrame(parallaxLoop);
    }

    document.addEventListener('mousemove', (e) => {
      mx = (e.clientX / window.innerWidth)  - 0.5;
      my = (e.clientY / window.innerHeight) - 0.5;
    }, { passive: true });

    // Only run the RAF loop while the hero section is visible
    const heroSection = document.getElementById('home');
    if (heroSection) {
      const io = new IntersectionObserver((entries) => {
        heroActive = entries[0].isIntersecting;
        if (heroActive && !rafId) {
          rafId = requestAnimationFrame(parallaxLoop);
        } else if (!heroActive && rafId) {
          cancelAnimationFrame(rafId);
          rafId = null;
          // Smoothly reset to neutral — heading only needs X reset (wave resets Y)
          gsap.to(heading, { x: 0, duration: 0.6, ease: 'power2.out' });
          gsap.to([tagline, badge], { x: 0, y: 0, duration: 0.6, ease: 'power2.out' });
          gsap.to(card, { x: 0, y: 0, rotateY: 0, rotateX: 0, duration: 0.6, ease: 'power2.out' });
        }
      }, { threshold: 0.1 });
      io.observe(heroSection);
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

  // Skill, Cert and Project cards — staggered per row
  ['#skills .skill-card', '#certifications .cert-tilt-container', '#projects .project-card'].forEach((sel) => {
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
