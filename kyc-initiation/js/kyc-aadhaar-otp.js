/* =========================================================================
   Aadhaar OTP Verification — 6-box input, auto-advance focus, paste support,
   Resend, and the same Leave-page confirmation modal as the main Aadhaar
   page. Standalone — Verify OTP is a no-op (no cross-page navigation).
   ========================================================================= */

(function () {
  'use strict';

  function init() {
    var boxes = Array.prototype.slice.call(document.querySelectorAll('.aadhaar-otp__box'));
    var verify = document.getElementById('aadhaar-verify');
    var resend = document.getElementById('aadhaar-resend');

    function otpValue() {
      return boxes.map(function (b) { return b.value || ''; }).join('');
    }
    function isOtpFilled() { return otpValue().length === boxes.length; }
    function syncBoxes() {
      boxes.forEach(function (b) { b.classList.toggle('is-filled', !!b.value); });
    }
    function refreshSubmit() {
      if (verify) verify.disabled = !isOtpFilled();
    }

    boxes.forEach(function (b, i) {
      b.addEventListener('input', function () {
        // Keep numeric and single digit only
        b.value = (b.value || '').replace(/\D/g, '').slice(0, 1);
        if (b.value && i < boxes.length - 1) boxes[i + 1].focus();
        syncBoxes();
        refreshSubmit();
      });
      b.addEventListener('keydown', function (e) {
        if (e.key === 'Backspace' && !b.value && i > 0) {
          boxes[i - 1].focus();
        } else if (e.key === 'ArrowLeft' && i > 0) {
          boxes[i - 1].focus();
        } else if (e.key === 'ArrowRight' && i < boxes.length - 1) {
          boxes[i + 1].focus();
        }
      });
      b.addEventListener('paste', function (e) {
        e.preventDefault();
        var text = (e.clipboardData || window.clipboardData).getData('text') || '';
        var digits = text.replace(/\D/g, '').slice(0, boxes.length - i);
        for (var k = 0; k < digits.length; k++) {
          boxes[i + k].value = digits[k];
        }
        var next = Math.min(i + digits.length, boxes.length - 1);
        boxes[next].focus();
        syncBoxes();
        refreshSubmit();
      });
    });

    if (resend) {
      resend.addEventListener('click', function (e) {
        e.preventDefault();
        boxes.forEach(function (b) { b.value = ''; b.classList.remove('is-filled'); });
        boxes[0].focus();
        refreshSubmit();
        // TODO: trigger a real resend API call when the backend exists.
      });
    }

    if (verify) {
      verify.addEventListener('click', function () {
        if (verify.disabled) return;
        // Standalone page — no cross-page navigation by design.
        console.log('Verify OTP:', otpValue());
      });
    }

    // ---- Leave-page confirmation modal (clicking Back) ----
    var leaveModal = document.getElementById('aadhaar-leave-modal');
    var back = document.getElementById('aadhaar-back');
    function openLeaveModal() {
      if (leaveModal) {
        leaveModal.classList.add('is-open');
        document.body.style.overflow = 'hidden';
      }
    }
    function closeLeaveModal() {
      if (leaveModal) {
        leaveModal.classList.remove('is-open');
        document.body.style.overflow = '';
      }
    }
    if (back) back.addEventListener('click', function (e) { e.preventDefault(); openLeaveModal(); });
    if (leaveModal) {
      leaveModal.addEventListener('click', function (e) {
        if (e.target === leaveModal) closeLeaveModal();
      });
      leaveModal.querySelectorAll('[data-modal-close]').forEach(function (b) {
        b.addEventListener('click', closeLeaveModal);
      });
    }
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeLeaveModal();
    });

    refreshSubmit();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
