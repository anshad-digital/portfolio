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

// Press ESC to close modal
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && resumeModal && resumeModal.classList.contains('active')) {
    closeResumeModal();
  }
});

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