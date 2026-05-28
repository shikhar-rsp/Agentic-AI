/* =========================================================================
   Send KYC Link form — per-field validation with DS error states, captcha
   refresh, the "link sent" state, and the keyboard mockup demo.

   Review states (hash or query):
     #keyboard  pre-filled + iOS keyboard mockup
     #sent      pre-filled + "link sent" success state
     #errors    invalid values + all field error states shown
   ========================================================================= */

(function () {
  'use strict';

  var EXPECTED_CAPTCHA = '2B3J7y';
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function init() {
    var mobile = document.getElementById('sl-mobile');
    var email = document.getElementById('sl-email');
    var captcha = document.getElementById('sl-captcha');
    var submit = document.getElementById('sl-submit');
    var submitLabel = document.getElementById('sl-submit-label');
    var successToast = document.getElementById('sl-success');
    var refresh = document.getElementById('sl-captcha-refresh');

    function val(el) { return el ? el.value.trim() : ''; }
    function isMobileValid() { return /^\d{10}$/.test(val(mobile)); }
    function isEmailValid() { var v = val(email); return v === '' || EMAIL_RE.test(v); }
    function isCaptchaValid() { return val(captcha).toLowerCase() === EXPECTED_CAPTCHA.toLowerCase(); }
    function allValid() { return isMobileValid() && isEmailValid() && isCaptchaValid(); }

    function fieldOf(el) { return el ? el.closest('.form-field') : null; }
    function setError(el, on) {
      var f = fieldOf(el);
      if (f) f.classList.toggle('is-error', !!on);
    }

    // Don't re-disable once the form has been submitted (button is now "Re-Send").
    function refreshSubmit() {
      if (submit && !submit.classList.contains('btn-secondary')) {
        submit.disabled = !allValid();
      }
    }

    // Validate on blur; clear the error as soon as the value becomes valid.
    function wireField(el, validFn) {
      if (!el) return;
      el.addEventListener('blur', function () { setError(el, !validFn()); });
      el.addEventListener('input', function () {
        var f = fieldOf(el);
        if (f && f.classList.contains('is-error') && validFn()) setError(el, false);
        refreshSubmit();
      });
    }

    // Keep mobile numeric (runs before the validation input handler).
    if (mobile) {
      mobile.addEventListener('input', function () {
        mobile.value = mobile.value.replace(/\D/g, '').slice(0, 10);
      });
    }

    wireField(mobile, isMobileValid);
    wireField(email, isEmailValid);
    wireField(captcha, isCaptchaValid);

    if (refresh) {
      refresh.addEventListener('click', function () {
        var icon = refresh.querySelector('svg, [data-lucide]');
        if (icon) {
          icon.style.transition = 'transform 0.4s ease';
          icon.style.transform = 'rotate(360deg)';
          setTimeout(function () {
            icon.style.transition = '';
            icon.style.transform = '';
          }, 400);
        }
        // TODO: fetch a fresh captcha image from the backend.
      });
    }

    function fillForm() {
      if (mobile) mobile.value = '9999999999';
      if (email) email.value = 'ashok.kumar@email.com';
      if (captcha) captcha.value = '2B3J7y';
      [mobile, email, captcha].forEach(function (el) { setError(el, false); });
      refreshSubmit();
    }

    function markSent() {
      if (successToast) successToast.classList.add('is-visible');
      if (submit) {
        submit.classList.remove('btn-primary');
        submit.classList.add('btn-secondary');
        submit.disabled = false;
      }
      if (submitLabel) submitLabel.textContent = 'Re-Send Link to Customer';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    if (submit) {
      submit.addEventListener('click', function () {
        if (submit.disabled) return;
        markSent();
      });
    }

    // ---- Keyboard-aware: keep the focused field visible.
    var focusables = document.querySelectorAll('.sendlink-card .form-input, .sendlink-card .sendlink-select');
    Array.prototype.forEach.call(focusables, function (el) {
      el.addEventListener('focus', function () {
        setTimeout(function () {
          el.scrollIntoView({ block: 'center', behavior: 'smooth' });
        }, 50);
      });
    });

    // ---- Review states ----
    function showKeyboardDemo() {
      fillForm();
      var kb = document.getElementById('ios-keyboard');
      if (kb) kb.classList.add('is-visible');
      document.body.classList.add('keyboard-open');
      setTimeout(function () {
        if (captcha) captcha.scrollIntoView({ block: 'center' });
      }, 80);
    }

    function showErrors() {
      if (mobile) mobile.value = '999999999';
      if (email) email.value = 'ashok.kumaremail.com';
      if (captcha) captcha.value = '2B3J7';
      setError(mobile, !isMobileValid());
      setError(email, !isEmailValid());
      setError(captcha, !isCaptchaValid());
      refreshSubmit();
    }

    var hash = location.hash + location.search;
    if (/keyboard/.test(hash)) showKeyboardDemo();
    if (/sent/.test(hash)) { fillForm(); markSent(); }
    if (/errors/.test(hash)) showErrors();

    window.kycShowKeyboard = showKeyboardDemo;
    window.kycMarkSent = markSent;
    window.kycShowErrors = showErrors;

    refreshSubmit();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
