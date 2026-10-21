// Mobile Navigation
const menuBtn = document.getElementById('menuBtn');
const mobileNav = document.getElementById('mobileNav');

if (menuBtn && mobileNav) {
  menuBtn.addEventListener('click', () => {
    const isExpanded = menuBtn.getAttribute('aria-expanded') === 'true';
    menuBtn.setAttribute('aria-expanded', String(!isExpanded));
    mobileNav.classList.toggle('hidden');
  });

  document.querySelectorAll('#mobileNav a').forEach(a => {
    a.addEventListener('click', () => {
      mobileNav.classList.add('hidden');
      menuBtn.setAttribute('aria-expanded', 'false');
    });
  });
}

// Modern Resume Modal Viewer
const resumeModal = document.getElementById('resumeModal');
const closeResumeModalBtn = document.getElementById('closeResumeModalBtn');
const resumeViewerFrame = document.getElementById('resumeViewerFrame');
const resumeButtons = document.querySelectorAll('.open-resume-btn');

function openResumeModal() {
  if (!resumeModal) return;

  // Lazy-load PDF into iframe if not already loaded
  if (resumeViewerFrame && (!resumeViewerFrame.src || resumeViewerFrame.src === 'about:blank' || !resumeViewerFrame.src.includes('.pdf'))) {
    const pdfSrc = resumeViewerFrame.getAttribute('data-src') || 'ANSHAD_S_Digital_Marketing_ATS_Resume-2.pdf';
    resumeViewerFrame.src = pdfSrc + '#toolbar=1&navpanes=0&view=FitH';
  }

  resumeModal.classList.add('active');
  resumeModal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('overflow-hidden');
}

function closeResumeModal() {
  if (!resumeModal) return;
  resumeModal.classList.remove('active');
  resumeModal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('overflow-hidden');
}

resumeButtons.forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    openResumeModal();
  });
});

if (closeResumeModalBtn) {
  closeResumeModalBtn.addEventListener('click', closeResumeModal);
}

// Click outside modal content to close
if (resumeModal) {
  resumeModal.addEventListener('click', (e) => {
    if (e.target === resumeModal) {
      closeResumeModal();
    }
  });
}

// Press ESC to close modals
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (resumeModal && resumeModal.classList.contains('active')) {
      closeResumeModal();
    }
    if (confirmationModal && confirmationModal.classList.contains('active')) {
      closeConfirmationModal();
    }
  }
});

// Google Forms Contact Submission & Confirmation Modal
const contactForm = document.getElementById('contactForm');
const contactSubmitBtn = document.getElementById('contactSubmitBtn');
const submitBtnText = document.getElementById('submitBtnText');
const confirmationModal = document.getElementById('confirmationModal');
const closeConfirmationBtn = document.getElementById('closeConfirmationBtn');

const GOOGLE_FORM_ENDPOINT = 'https://docs.google.com/forms/u/0/d/e/1FAIpQLSciFLG1uoopzJ3so7rgr0NYkGmANT6Y90FoSBLK1gzxnt9xTA/formResponse';

function openConfirmationModal() {
  if (!confirmationModal) return;
  confirmationModal.classList.add('active');
  confirmationModal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('overflow-hidden');
}

function closeConfirmationModal() {
  if (!confirmationModal) return;
  confirmationModal.classList.remove('active');
  confirmationModal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('overflow-hidden');
}

if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (contactSubmitBtn) {
      contactSubmitBtn.disabled = true;
      if (submitBtnText) submitBtnText.textContent = 'Sending...';
    }

    const formData = new FormData(contactForm);

    try {
      await fetch(GOOGLE_FORM_ENDPOINT, {
        method: 'POST',
        mode: 'no-cors',
        body: formData
      });

      contactForm.reset();
      openConfirmationModal();
    } catch (err) {
      console.error('Contact form submission failed:', err);
      showToast('Error sending message. Please reach out via email or WhatsApp.');
    } finally {
      if (contactSubmitBtn) {
        contactSubmitBtn.disabled = false;
        if (submitBtnText) submitBtnText.textContent = 'Send Message';
      }
    }
  });
}

if (closeConfirmationBtn) {
  closeConfirmationBtn.addEventListener('click', closeConfirmationModal);
}

if (confirmationModal) {
  confirmationModal.addEventListener('click', (e) => {
    if (e.target === confirmationModal) {
      closeConfirmationModal();
    }
  });
}

// Copy Email to Clipboard with Toast Notification
function showToast(message) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'fixed bottom-6 right-6 z-50 rounded-2xl border border-violet-400/30 bg-slate-900/95 px-5 py-3 text-sm font-semibold text-white shadow-2xl backdrop-blur-md flex items-center gap-2.5';
    document.body.appendChild(toast);
  }
  toast.innerHTML = `
    <svg class="h-4 w-4 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
      <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
    </svg>
    <span>${message}</span>
  `;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 2800);
}

document.querySelectorAll('.copy-email-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    const email = 'anshaad.s@gmail.com';
    navigator.clipboard.writeText(email).then(() => {
      showToast('Email copied: anshaad.s@gmail.com');
    }).catch(() => {
      showToast('Contact: anshaad.s@gmail.com');
    });
  });
});

// ==========================================================================
// 3D Planetary Orbital Simulation Engine
// ==========================================================================
(function initTools3DPlanetaryOrbit() {
  const stage = document.getElementById('toolsOrbitStage');
  const container = document.getElementById('toolsOrbitContainer');
  if (!stage || !container) return;

  const svgTracks = document.getElementById('orbitalTracksSvg');
  const ring1Svg = document.getElementById('orbitRing1');
  const ring2Svg = document.getElementById('orbitRing2');
  const ring3Svg = document.getElementById('orbitRing3');
  const prevBtn = document.getElementById('toolsPrevBtn');
  const nextBtn = document.getElementById('toolsNextBtn');

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const allItems = Array.from(container.querySelectorAll('.tool-card-item'));
  const ringItems = {
    1: allItems.filter(item => item.getAttribute('data-ring') === '1'),
    2: allItems.filter(item => item.getAttribute('data-ring') === '2'),
    3: allItems.filter(item => item.getAttribute('data-ring') === '3')
  };

  const rings = [
    {
      id: 1, // Inner Orbit (4 tools: Looker Studio, Canva, Mailchimp, HTML/CSS)
      items: ringItems[1],
      radiusRatio: 0.46,
      speed: 0.00030, // rad/ms (smooth planetary rotation)
      angle: 0.0,
      phaseOffset: 0.0
    },
    {
      id: 2, // Middle Orbit (5 tools: SEMrush, Ahrefs, Screaming Frog, GSC, Google Maps)
      items: ringItems[2],
      radiusRatio: 0.72,
      speed: 0.00020,
      angle: 0.4,
      phaseOffset: 0.4
    },
    {
      id: 3, // Outer Orbit (7 tools: WordPress, Google Ads, Amazon, Shopify, HubSpot, Meta, GA4)
      items: ringItems[3],
      radiusRatio: 1.0,
      speed: 0.00014,
      angle: 0.8,
      phaseOffset: 0.8
    }
  ];

  let stageWidth = 0;
  let stageHeight = 0;
  let centerX = 0;
  let centerY = 0;
  let maxRx = 0;
  let tiltRatio = 0.34;

  function updateDimensions() {
    const rect = stage.getBoundingClientRect();
    stageWidth = rect.width;
    stageHeight = rect.height;
    centerX = stageWidth / 2;
    centerY = stageHeight / 2;

    const w = window.innerWidth;
    if (w < 768) {
      maxRx = Math.max(115, Math.min(centerX - 35, 155));
      tiltRatio = 0.35;
    } else if (w < 1024) {
      maxRx = Math.max(220, Math.min(centerX - 50, 340));
      tiltRatio = 0.32;
    } else {
      maxRx = Math.max(340, Math.min(centerX - 70, 520));
      tiltRatio = 0.30;
    }

    const ringMap = { 1: ring1Svg, 2: ring2Svg, 3: ring3Svg };
    rings.forEach(r => {
      const rx = maxRx * r.radiusRatio;
      const ry = rx * tiltRatio;
      const el = ringMap[r.id];
      if (el) {
        el.setAttribute('cx', centerX.toFixed(1));
        el.setAttribute('cy', centerY.toFixed(1));
        el.setAttribute('rx', rx.toFixed(1));
        el.setAttribute('ry', ry.toFixed(1));
      }
    });

    if (svgTracks) {
      svgTracks.setAttribute('viewBox', `0 0 ${stageWidth} ${stageHeight}`);
    }
  }

  updateDimensions();
  window.addEventListener('resize', updateDimensions);
  if (window.ResizeObserver) {
    new ResizeObserver(updateDimensions).observe(stage);
  }

  let lastTime = performance.now();
  let targetSpeed = prefersReduced ? 0 : 1.0;
  let currentSpeed = prefersReduced ? 0 : 1.0;
  let impulse = 0.0;
  let hoveredItem = null;
  let animationFrameId = null;

  function renderFrame(now) {
    const dt = Math.min(now - lastTime, 64);
    lastTime = now;

    if (!prefersReduced) {
      currentSpeed += (targetSpeed - currentSpeed) * 0.07;
      impulse *= 0.93;
      if (Math.abs(impulse) < 0.000005) impulse = 0;
    }

    const w = window.innerWidth;
    const frontThreshold = (w < 768) ? 0.94 : 0.80;

    rings.forEach(r => {
      if (!prefersReduced) {
        const dTheta = (r.speed * currentSpeed + impulse) * dt;
        r.angle = (r.angle + dTheta) % (Math.PI * 2);
      }

      const rx = maxRx * r.radiusRatio;
      const ry = rx * tiltRatio;
      const count = r.items.length;
      const step = (Math.PI * 2) / count;

      r.items.forEach((item, idx) => {
        const theta = r.angle + r.phaseOffset + idx * step;
        const cos = Math.cos(theta);
        const sin = Math.sin(theta);

        const x = centerX + rx * cos;
        const y = centerY + ry * sin;

        // Depth calculation: sin(theta) = 1 at front (bottom), -1 at back (top)
        const d = (sin + 1) * 0.5;

        const isHovered = (hoveredItem === item);

        let scale = 0.68 + d * 0.48; // 0.68 (back) to 1.16 (front)
        let opacity = 0.60 + d * 0.40; // 0.60 (back) to 1.0 (front)
        let blur = (1 - d) * 1.1; // 1.1px (back) to 0px (front)
        let zIndex = Math.round(20 + d * 100);

        if (isHovered) {
          scale *= 1.20;
          opacity = 1.0;
          blur = 0;
          zIndex = 999;
        }

        if (d > frontThreshold) {
          item.classList.add('is-orbit-front');
        } else {
          item.classList.remove('is-orbit-front');
        }

        const itemW = item.offsetWidth || 76;
        const itemH = item.offsetHeight || 100;
        const posX = x - itemW / 2;
        const posY = y - itemH / 2;

        item.style.transform = `translate3d(${posX.toFixed(1)}px, ${posY.toFixed(1)}px, 0) scale(${scale.toFixed(3)})`;
        item.style.zIndex = zIndex;
        item.style.opacity = opacity.toFixed(2);
        item.style.filter = blur > 0.1 ? `blur(${blur.toFixed(1)}px)` : 'none';
      });
    });

    animationFrameId = requestAnimationFrame(renderFrame);
  }

  animationFrameId = requestAnimationFrame(renderFrame);

  // Hover interactions: smoothly slow down rotation and highlight hovered card
  allItems.forEach(item => {
    item.addEventListener('mouseenter', () => {
      hoveredItem = item;
      if (!prefersReduced) targetSpeed = 0.05;
      item.classList.add('is-orbit-hovered');
    });

    item.addEventListener('mouseleave', () => {
      if (hoveredItem === item) hoveredItem = null;
      if (!prefersReduced) targetSpeed = 1.0;
      item.classList.remove('is-orbit-hovered');
    });
  });

  // Navigation Arrow Buttons: apply momentum impulse
  if (prevBtn) {
    prevBtn.addEventListener('click', (e) => {
      e.preventDefault();
      impulse -= 0.0016;
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', (e) => {
      e.preventDefault();
      impulse += 0.0016;
    });
  }

  // Touch Swipe on mobile
  let touchStartX = null;
  stage.addEventListener('touchstart', (e) => {
    if (e.touches && e.touches[0]) {
      touchStartX = e.touches[0].clientX;
    }
  }, { passive: true });

  stage.addEventListener('touchmove', (e) => {
    if (touchStartX !== null && e.touches && e.touches[0]) {
      const currentX = e.touches[0].clientX;
      const dx = currentX - touchStartX;
      touchStartX = currentX;
      impulse += dx * 0.00008;
    }
  }, { passive: true });

  stage.addEventListener('touchend', () => {
    touchStartX = null;
  }, { passive: true });
})();

// Enhanced Smooth Scrolling for Navbar Links (including animated #about)
(function initNavbarSmoothScroll() {
  document.querySelectorAll('header a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (!targetId || targetId === '#') return;
      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();

      let targetTop = target.getBoundingClientRect().top + window.pageYOffset;

      // For pinned #about section, scroll directly to ScrollTrigger pin start
      if (targetId === '#about' && typeof ScrollTrigger !== 'undefined') {
        const st = ScrollTrigger.getAll().find(s => s.trigger === target);
        if (st) {
          targetTop = st.start;
        }
      } else {
        targetTop -= 70; // Header height offset
      }

      window.scrollTo({
        top: Math.max(0, targetTop),
        behavior: 'smooth'
      });

      // Close mobile drawer if open
      const mobileNav = document.getElementById('mobileNav');
      const menuBtn = document.getElementById('menuBtn');
      if (mobileNav && !mobileNav.classList.contains('hidden')) {
        mobileNav.classList.add('hidden');
        if (menuBtn) menuBtn.setAttribute('aria-expanded', 'false');
      }
    });
  });
})();

// ==========================================================================
// NEW CERTIFICATIONS STAGGERED SCROLL-REVEAL ANIMATION
// ==========================================================================
function initCertificationsReveal() {
  if (window.__certificationsRevealInit) return;
  window.__certificationsRevealInit = true;

  const cards = Array.from(
    document.querySelectorAll('#certifications .cert-reveal-card')
  );

  if (!cards.length) return;

  // Safe fallback for reduced-motion or environments without IntersectionObserver
  const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!('IntersectionObserver' in window) || prefersReduced) {
    cards.forEach(card => card.classList.add('is-revealed'));
    return;
  }

  let remainingCards = cards.length;
  let batchIndex = 0;
  let batchTimer = null;

  const certObserver = new IntersectionObserver((entries) => {
    // Filter currently intersecting cards that have not been revealed
    const intersectingEntries = entries.filter(
      entry => entry.isIntersecting && !entry.target.classList.contains('is-revealed')
    );

    if (!intersectingEntries.length) return;

    // Calculate stagger delay based on cards entering the viewport in this batch
    intersectingEntries.forEach((entry) => {
      const card = entry.target;
      certObserver.unobserve(card);
      remainingCards--;

      const staggerDelay = batchIndex * 150;
      batchIndex++;

      setTimeout(() => {
        card.classList.add('is-revealed');
      }, staggerDelay);
    });

    // Reset batchIndex after current viewport batch is scheduled
    if (batchTimer) clearTimeout(batchTimer);
    batchTimer = setTimeout(() => {
      batchIndex = 0;
    }, 250);

    // Disconnect observer once all certificate cards are revealed
    if (remainingCards <= 0) {
      certObserver.disconnect();
    }
  }, {
    threshold: 0.08,
    rootMargin: '0px 0px -20px 0px'
  });

  cards.forEach(card => certObserver.observe(card));
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCertificationsReveal, { once: true });
} else {
  initCertificationsReveal();
}
