/* =========================================================================
   Aadhaar eKYC entry — verification type switch + form validation.
   Standalone page; the Send OTP button is a no-op (no cross-page navigation).
   ========================================================================= */

(function () {
  'use strict';

  var SECURITY_ANSWER = '14'; // What is 5 + 9?

  function init() {
    var radios = Array.prototype.slice.call(document.querySelectorAll('.aadhaar-radio'));
    var numInput = document.getElementById('aadhaar-num');
    var numLabel = document.getElementById('aadhaar-num-label');
    var mobile = document.getElementById('aadhaar-mobile');
    var sec = document.getElementById('aadhaar-sec');
    var card = document.querySelector('.aadhaar-card');
    var consent1 = document.getElementById('aadhaar-c1');
    var consent2 = document.getElementById('aadhaar-c2');
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
    function isSecurityValid() { return sec && (sec.value || '').trim() === SECURITY_ANSWER; }
    function isConsented() { return consent1 && consent2 && consent1.checked && consent2.checked; }

    function fieldOf(el) { return el ? el.closest('.form-field') : null; }
    function setValid(el, ok) {
      var f = fieldOf(el);
      if (f) f.classList.toggle('is-valid', !!ok);
    }

    function validate() {
      // Toggle the success (green check) state on each input.
      setValid(numInput, isAadhaarValid());
      setValid(mobile, isMobileValid());
      setValid(sec, isSecurityValid());

      // Reveal the security + consent sections once Aadhaar + Mobile pass.
      var extended = isAadhaarValid() && isMobileValid();
      if (card) card.classList.toggle('is-extended', extended);

      if (!submit) return;
      submit.disabled = !(extended && isSecurityValid() && isConsented());
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
    if (sec) {
      sec.addEventListener('input', function () {
        sec.value = sec.value.replace(/\D/g, '').slice(0, 3);
        validate();
      });
    }
    [consent1, consent2].forEach(function (cb) {
      if (cb) cb.addEventListener('change', validate);
    });

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
