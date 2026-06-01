/* =========================================================================
   Aadhaar eKYC entry — verification type switch + form validation.
   Standalone page; the Send OTP button is a no-op (no cross-page navigation).
   ========================================================================= */

(function () {
  'use strict';

  function init() {
    var radios = Array.prototype.slice.call(document.querySelectorAll('.aadhaar-radio'));
    var numInput = document.getElementById('aadhaar-num');
    var numLabel = document.getElementById('aadhaar-num-label');
    var mobile = document.getElementById('aadhaar-mobile');
    var submit = document.getElementById('aadhaar-submit');

    function selectRadio(node) {
      radios.forEach(function (r) {
        var on = r === node;
        r.classList.toggle('is-selected', on);
        var input = r.querySelector('input[type="radio"]');
        if (input) input.checked = on;
      });
      // Update Aadhaar Number field label/placeholder for VID vs Aadhaar
      if (numLabel && numInput) {
        var isVid = node.getAttribute('data-vtype') === 'vid';
        if (isVid) {
          numLabel.textContent = 'Virtual ID';
          numInput.setAttribute('placeholder', 'Enter 16-digit Virtual ID');
          numInput.setAttribute('maxlength', '16');
        } else {
          numLabel.textContent = 'Aadhaar Number';
          numInput.setAttribute('placeholder', 'Enter 12-digit Aadhaar Number');
          numInput.setAttribute('maxlength', '12');
        }
        // Clear value when switching type
        numInput.value = '';
        validate();
      }
    }

    radios.forEach(function (r) {
      r.addEventListener('click', function (e) {
        // Prevent label's default behavior (which would toggle the hidden input)
        if (e.target.tagName !== 'INPUT') {
          selectRadio(r);
        } else {
          selectRadio(r);
        }
      });
    });

    function isAadhaarValid() {
      var isVid = document.querySelector('.aadhaar-radio.is-selected').getAttribute('data-vtype') === 'vid';
      var len = isVid ? 16 : 12;
      return new RegExp('^\\d{' + len + '}$').test((numInput.value || '').trim());
    }
    function isMobileValid() { return /^\d{10}$/.test((mobile.value || '').trim()); }

    function validate() {
      if (!submit) return;
      submit.disabled = !(isAadhaarValid() && isMobileValid());
    }

    // Keep inputs numeric
    if (numInput) {
      numInput.addEventListener('input', function () {
        var max = parseInt(numInput.getAttribute('maxlength') || '12', 10);
        numInput.value = numInput.value.replace(/\D/g, '').slice(0, max);
        validate();
      });
    }
    if (mobile) {
      mobile.addEventListener('input', function () {
        mobile.value = mobile.value.replace(/\D/g, '').slice(0, 10);
        validate();
      });
    }

    if (submit) {
      submit.addEventListener('click', function () {
        if (submit.disabled) return;
        // Standalone page — no cross-page navigation by design.
        console.log('Send OTP with', { vtype: document.querySelector('.aadhaar-radio.is-selected').getAttribute('data-vtype'), num: numInput.value, mobile: mobile.value });
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
