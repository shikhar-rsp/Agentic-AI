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

    validate();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
