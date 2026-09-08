// Mobile Navigation
const menuBtn = document.getElementById('menuBtn');
const mobileNav = document.getElementById('mobileNav');

if (menuBtn && mobileNav) {
  menuBtn.addEventListener('click', () => {
    mobileNav.classList.toggle('hidden');
  });

  document.querySelectorAll('#mobileNav a').forEach(a => {
    a.addEventListener('click', () => {
      mobileNav.classList.add('hidden');
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

// Press ESC to close modal
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && resumeModal && resumeModal.classList.contains('active')) {
    closeResumeModal();
  }
});