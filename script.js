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
// 3D Tools Stage & Carousel Hover-to-Center Interaction
// ==========================================================================
(function initToolsStageInteraction() {
  const stage = document.querySelector('.tools-3d-stage');
  if (!stage) return;

  const topArc = stage.querySelector('.tools-arc-top');
  const bottomArc = stage.querySelector('.tools-arc-bottom');
  const viewport = stage.querySelector('.tools-stage-viewport');
  const prevBtn = document.getElementById('toolsPrevBtn');
  const nextBtn = document.getElementById('toolsNextBtn');

  const isTouch = window.matchMedia('(pointer: coarse)').matches;
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 3D curved arch profile tables (elevation Y, scale, z-index)
  const topElevationMap = [
    { translateY: -10, scale: 1.30, zIndex: 30 }, // distance 0 (center)
    { translateY: -2,  scale: 1.02, zIndex: 25 }, // distance 1
    { translateY: 6,   scale: 0.97, zIndex: 20 }, // distance 2
    { translateY: 16,  scale: 0.92, zIndex: 15 }, // distance 3
    { translateY: 26,  scale: 0.86, zIndex: 10 }, // distance >= 4
  ];

  const bottomElevationMap = [
    { translateY: 0,   scale: 1.04, zIndex: 22 }, // distance 0 (center)
    { translateY: 4,   scale: 0.98, zIndex: 20 }, // distance 1
    { translateY: 10,  scale: 0.94, zIndex: 18 }, // distance 2
    { translateY: 16,  scale: 0.90, zIndex: 16 }, // distance >= 3
  ];

  let isHovered = false;
  let autoSlideTimer = null;

  function setupArc(arc, elevationMap, defaultCenterIndex) {
    if (!arc) return null;
    const items = Array.from(arc.querySelectorAll('.tool-card-item'));
    if (!items.length) return null;

    let currentIndex = defaultCenterIndex;
    let resetTimer = null;

    function applyCenter(targetIdx, withShift = true) {
      if (!viewport) return;
      const targetItem = items[targetIdx];
      if (!targetItem) return;

      currentIndex = targetIdx;

      // Smooth horizontal shift of the arc to position the target item at the exact viewport center
      if (withShift) {
        const viewportRect = viewport.getBoundingClientRect();
        const viewportCenter = viewportRect.left + viewportRect.width / 2;

        const style = window.getComputedStyle(arc);
        const matrix = new DOMMatrixReadOnly(style.transform);
        const currentTx = matrix.m41 || 0;

        const itemRect = targetItem.getBoundingClientRect();
        const itemCenter = itemRect.left + itemRect.width / 2;

        const delta = viewportCenter - itemCenter;
        const targetTx = currentTx + delta;
        arc.style.transform = `translateX(${targetTx.toFixed(1)}px)`;
      } else {
        arc.style.transform = 'translateX(0px)';
      }

      // 3D elevation, scale, and glow for all items in the arc
      items.forEach((item, idx) => {
        const dist = Math.abs(idx - targetIdx);
        const profile = dist < elevationMap.length ? elevationMap[dist] : elevationMap[elevationMap.length - 1];

        item.style.transform = `translateY(${profile.translateY}px) scale(${profile.scale})`;
        item.style.zIndex = profile.zIndex;

        if (dist === 0) {
          item.classList.add('is-hero-center');
        } else {
          item.classList.remove('is-hero-center');
        }
      });
    }

    // Attach desktop hover listeners
    if (!isTouch) {
      items.forEach((item, idx) => {
        item.addEventListener('mouseenter', () => {
          if (resetTimer) clearTimeout(resetTimer);
          isHovered = true;
          applyCenter(idx, true);
        });
      });

      arc.addEventListener('mouseleave', () => {
        if (resetTimer) clearTimeout(resetTimer);
        resetTimer = setTimeout(() => {
          isHovered = false;
          applyCenter(defaultCenterIndex, false);
        }, 160);
      });
    }

    return {
      items,
      defaultCenterIndex,
      getCurrentIndex: () => currentIndex,
      applyCenter,
      reset: () => applyCenter(defaultCenterIndex, false),
      next: () => {
        const nextIdx = (currentIndex + 1) % items.length;
        applyCenter(nextIdx, true);
      },
      prev: () => {
        const prevIdx = (currentIndex - 1 + items.length) % items.length;
        applyCenter(prevIdx, true);
      }
    };
  }

  const topSetup = setupArc(topArc, topElevationMap, 4);          // Google Ads at index 4
  const bottomSetup = setupArc(bottomArc, bottomElevationMap, 3);    // HubSpot CRM at index 3

  // Navigation Arrow Buttons
  if (prevBtn) {
    prevBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (topSetup) topSetup.prev();
      if (bottomSetup) bottomSetup.prev();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (topSetup) topSetup.next();
      if (bottomSetup) bottomSetup.next();
    });
  }

  // Automatic gentle sliding from RIGHT → LEFT when not hovered
  if (!prefersReduced && !isTouch) {
    const autoInterval = 4000; // calm, luxurious pace

    function startAutoSlide() {
      if (autoSlideTimer) clearInterval(autoSlideTimer);
      autoSlideTimer = setInterval(() => {
        if (isHovered) return;
        if (topSetup) {
          const curr = topSetup.getCurrentIndex();
          // Advance from right to left smoothly
          const next = (curr + 1) % topSetup.items.length;
          topSetup.applyCenter(next, true);
        }
      }, autoInterval);
    }

    stage.addEventListener('mouseenter', () => {
      isHovered = true;
      if (autoSlideTimer) clearInterval(autoSlideTimer);
    });

    stage.addEventListener('mouseleave', () => {
      isHovered = false;
      startAutoSlide();
    });

    startAutoSlide();
  }
})();