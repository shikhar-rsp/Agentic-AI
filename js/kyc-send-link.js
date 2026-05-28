/* =========================================================================
   Send KYC Link form — enable submit once required fields are filled,
   plus a captcha refresh affordance.
   ========================================================================= */

(function () {
  'use strict';

  function init() {
    var mobile = document.getElementById('sl-mobile');
    var captcha = document.getElementById('sl-captcha');
    var submit = document.getElementById('sl-submit');
    var refresh = document.getElementById('sl-captcha-refresh');

    function validate() {
      if (!submit) return;
      var okMobile = mobile && /^\d{10}$/.test(mobile.value.trim());
      var okCaptcha = captcha && captcha.value.trim().length > 0;
      submit.disabled = !(okMobile && okCaptcha);
    }

    [mobile, captcha].forEach(function (el) {
      if (el) el.addEventListener('input', validate);
    });

    // Keep mobile numeric.
    if (mobile) {
      mobile.addEventListener('input', function () {
        mobile.value = mobile.value.replace(/\D/g, '').slice(0, 10);
      });
    }

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

    if (submit) {
      submit.addEventListener('click', function () {
        // TODO: submit and route to the link-sent confirmation screen.
        console.log('Sending KYC link to customer…');
      });
    }

    // ---- Keyboard-aware: keep the focused field visible when the OS
    // keyboard (or the mockup) covers the lower part of the screen.
    var focusables = document.querySelectorAll('.sendlink-card .form-input, .sendlink-card .sendlink-select');
    Array.prototype.forEach.call(focusables, function (el) {
      el.addEventListener('focus', function () {
        setTimeout(function () {
          el.scrollIntoView({ block: 'center', behavior: 'smooth' });
        }, 50);
      });
    });

    // ---- Demo: #keyboard renders the iOS keyboard mockup with the form
    // pre-filled (so the enabled-button state matches the Figma frame).
    function showKeyboardDemo() {
      if (mobile) mobile.value = '9999999999';
      var email = document.getElementById('sl-email');
      if (email) email.value = 'ashok.kumar@email.com';
      if (captcha) captcha.value = '2B3J7y';
      validate();
      var kb = document.getElementById('ios-keyboard');
      if (kb) kb.classList.add('is-visible');
      document.body.classList.add('keyboard-open');
      setTimeout(function () {
        if (captcha) captcha.scrollIntoView({ block: 'center' });
      }, 80);
    }
    if (/keyboard/.test(location.hash) || /keyboard/.test(location.search)) {
      showKeyboardDemo();
    }
    window.kycShowKeyboard = showKeyboardDemo;

    validate();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
