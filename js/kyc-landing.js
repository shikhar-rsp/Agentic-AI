/* =========================================================================
   KYC landing — method selection + "Allow camera access" modal.
   - Clicking a method card selects it (single-select) and reveals its
     "Start KYC" button.
   - Clicking "Start KYC" opens the Allow-camera modal.
   ========================================================================= */

(function () {
  'use strict';

  function init() {
    const cards = Array.from(document.querySelectorAll('.method-card'));
    const modal = document.getElementById('kyc-modal');
    if (!cards.length || !modal) return;

    /* ---- Single-select cards ---- */
    function select(card) {
      cards.forEach((c) => c.classList.toggle('is-selected', c === card));
    }

    cards.forEach((card) => {
      card.addEventListener('click', () => select(card));
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          select(card);
        }
      });
    });

    /* ---- Start KYC -> open modal ---- */
    function openModal() {
      modal.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    }
    function closeModal() {
      modal.classList.remove('is-open');
      document.body.style.overflow = '';
    }

    document.querySelectorAll('.method-card__cta').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation(); // don't re-trigger card selection
        openModal();
      });
    });

    /* ---- Modal dismissal ---- */
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal(); // click on scrim
    });
    modal.querySelectorAll('[data-modal-close]').forEach((b) =>
      b.addEventListener('click', closeModal)
    );
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeModal();
    });

    // Allow Camera -> Face Scan capture screen.
    const allow = document.getElementById('kyc-allow-camera');
    if (allow) {
      allow.addEventListener('click', () => {
        window.location.href = 'face-scan.html';
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
