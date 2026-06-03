/* =============================================================================
   kyc-aadhaar.js
   All JavaScript for the Aadhaar eKYC flow:
     - aadhaar form   (screen: aadhaar)
     - OTP entry      (screen: aadhaar-otp)
     - Review & submit(screen: aadhaar-review)
     - Done / success (screen: aadhaar-done)

   Usage: loaded before the main inline SPA script. Exposes window.ekycAadhaar.
   The main script calls:
     var aadhaar = window.ekycAadhaar.init({ goto, openModal, $, $$, screenEl });
     // then merges aadhaar.INITS and delegates aadhaar submit to aadhaar.handleSubmit
============================================================================= */
(function () {
  'use strict';

  window.ekycAadhaar = {

    init: function (deps) {
      var goto      = deps.goto;
      var openModal = deps.openModal;
      var $         = deps.$;
      var $$        = deps.$$;
      var screenEl  = deps.screenEl;

      /* ---- OTP state ---- */
      var CORRECT_OTP    = '000000';
      var otpAttemptsLeft = 3;

      /* ---- Helpers ---- */
      function collectAadhaar() {
        return {
          'verification-type':   (document.querySelector('input[name="verification-type"]:checked') || {}).value,
          'aadhaar-number':      ($('#aadhaar-num')    || {}).value,
          'aadhaar-mobile':      ($('#aadhaar-mobile') || {}).value,
          'security-answer':     ($('#aadhaar-sec')    || {}).value,
          'consent-data-sharing':($('#aadhaar-c1')     || {}).checked,
          'consent-uidai-terms': ($('#aadhaar-c2')     || {}).checked
        };
      }

      function collectOtp() {
        return $$('#screen-aadhaar-otp .aadhaar-otp__box')
          .map(function (b) { return b.value || ''; })
          .join('');
      }

      function startOtpVerifying() {
        var formBody   = document.getElementById('otp-form-body');
        var verifyBody = document.getElementById('otp-verifying-body');
        var bar        = document.getElementById('otp-progress-bar');
        var pct        = document.getElementById('otp-progress-pct');

        if (formBody)   formBody.hidden   = true;
        if (verifyBody) verifyBody.hidden = false;
        if (bar)  bar.style.width    = '0%';
        if (pct)  pct.textContent    = '0%';

        var progress = 0;
        var TICK  = 50;
        var STEPS = 4000 / TICK;
        var inc   = 100 / STEPS;

        var timer = setInterval(function () {
          progress = Math.min(progress + inc, 100);
          var rounded = Math.round(progress);
          if (bar) bar.style.width   = rounded + '%';
          if (pct) pct.textContent   = rounded + '%';
          if (progress >= 100) {
            clearInterval(timer);
            goto('aadhaar-review');
          }
        }, TICK);
      }

      /* ---- Submit handler (called by main handleSubmit) ---- */
      function handleSubmit(slug, btn) {
        if (slug === 'aadhaar') {
          otpAttemptsLeft = 3;
          console.log('[ekyc] Aadhaar form submit', collectAadhaar());
          goto('aadhaar-otp');
          return true;
        }

        if (slug === 'aadhaar-review') {
          console.log('[ekyc] Review confirmed');
          goto('aadhaar-done');
          return true;
        }

        if (slug === 'aadhaar-otp') {
          var entered     = collectOtp();
          var otpWrap     = document.querySelector('#screen-aadhaar-otp .aadhaar-otp');
          var otpError    = document.getElementById('otp-error');
          var attemptsSpan = document.getElementById('otp-attempts-left');

          if (entered === CORRECT_OTP) {
            if (otpWrap)  otpWrap.classList.remove('is-error');
            if (otpError) otpError.hidden = true;
            console.log('[ekyc] OTP verified');
            startOtpVerifying();
            return true;
          }

          otpAttemptsLeft -= 1;
          if (otpWrap) otpWrap.classList.add('is-error');

          if (otpAttemptsLeft <= 0) {
            if (otpError) otpError.hidden = true;
            if (otpWrap)  otpWrap.classList.remove('is-error');
            openModal('otp-maxattempts-modal');
            otpAttemptsLeft = 3;
          } else {
            if (attemptsSpan) attemptsSpan.textContent = otpAttemptsLeft;
            if (otpError)     otpError.hidden = false;
          }
          return true;
        }

        return false; // not an aadhaar slug — let main script handle
      }

      /* ---- Resend OTP action ---- */
      function handleResendOtp() {
        $$('#screen-aadhaar-otp .aadhaar-otp__box').forEach(function (b) {
          b.value = '';
          b.classList.remove('is-filled');
        });
        var otpWrapR  = document.querySelector('#screen-aadhaar-otp .aadhaar-otp');
        var otpErrorR = document.getElementById('otp-error');
        if (otpWrapR)  otpWrapR.classList.remove('is-error');
        if (otpErrorR) otpErrorR.hidden = true;
        otpAttemptsLeft = 3;
        var first = $('#screen-aadhaar-otp .aadhaar-otp__box');
        if (first) first.focus();
        var v = $('#otp-verify');
        if (v) v.disabled = true;
      }

      /* ---- Per-screen init functions ---- */
      var INITS = {};

      /* ---- aadhaar ---- */
      INITS['aadhaar'] = function () {
        var root = screenEl('aadhaar');
        if (root.dataset.inited) return; root.dataset.inited = '1';

        var SECURITY_ANSWER = '14';
        var radios   = $$('.aadhaar-radio', root);
        var numInput = $('#aadhaar-num',    root);
        var numLabel = $('#aadhaar-num-label', root);
        var numError = $('#aadhaar-num-error', root);
        var mobile   = $('#aadhaar-mobile', root);
        var sec      = $('#aadhaar-sec',    root);
        var card     = $('.aadhaar-card',   root);
        var consent1 = $('#aadhaar-c1',     root);
        var consent2 = $('#aadhaar-c2',     root);
        var submit   = $('#aadhaar-submit', root);

        function selectRadio(node) {
          radios.forEach(function (r) {
            var on = r === node;
            r.classList.toggle('is-selected', on);
            var input = r.querySelector('input[type="radio"]');
            if (input) input.checked = on;
          });
          if (numLabel && numInput) {
            var isVid = node.getAttribute('data-vtype') === 'vid';
            if (isVid) {
              numLabel.textContent = 'Virtual ID';
              numInput.setAttribute('placeholder', 'Enter 16-digit Virtual ID');
              numInput.setAttribute('maxlength', '16');
              if (numError) numError.textContent = 'Invalid Virtual ID Number';
            } else {
              numLabel.textContent = 'Aadhaar Number';
              numInput.setAttribute('placeholder', 'Enter 12-digit Aadhaar Number');
              numInput.setAttribute('maxlength', '12');
              if (numError) numError.textContent = 'Invalid Aadhaar Number';
            }
            numInput.value = '';
            validate();
          }
        }
        radios.forEach(function (r) {
          r.addEventListener('click', function () { selectRadio(r); });
        });

        function isAadhaarValid() {
          var sel = $('.aadhaar-radio.is-selected', root);
          var isVid = sel && sel.getAttribute('data-vtype') === 'vid';
          var len = isVid ? 16 : 12;
          return new RegExp('^\\d{' + len + '}$').test((numInput.value || '').trim());
        }
        function isMobileValid()   { return /^\d{10}$/.test((mobile.value || '').trim()); }
        function isSecurityValid() { return sec && (sec.value || '').trim() === SECURITY_ANSWER; }
        function isConsented()     { return consent1 && consent2 && consent1.checked && consent2.checked; }
        function fieldOf(el)       { return el ? el.closest('.form-field') : null; }
        function setValid(el, ok)  { var f = fieldOf(el); if (f) f.classList.toggle('is-valid', !!ok); }
        function setError(el, on) {
          var f = fieldOf(el);
          if (!f) return;
          f.classList.toggle('is-error', !!on);
          if (on) f.classList.remove('is-valid');
        }
        function validate() {
          setValid(numInput, isAadhaarValid());
          setValid(mobile,   isMobileValid());
          setValid(sec,      isSecurityValid());
          if (isAadhaarValid())  setError(numInput, false);
          if (isMobileValid())   setError(mobile,   false);
          if (isSecurityValid()) setError(sec,       false);
          var extended = isAadhaarValid() && isMobileValid();
          var secured  = extended && isSecurityValid();
          if (card) card.classList.toggle('is-extended', extended);
          if (card) card.classList.toggle('is-secured',  secured);
          if (!submit) return;
          submit.disabled = !(isAadhaarValid() && secured && isConsented());
        }

        if (numInput) {
          numInput.addEventListener('input', function () {
            var max = parseInt(numInput.getAttribute('maxlength') || '12', 10);
            numInput.value = numInput.value.replace(/\D/g, '').slice(0, max);
            validate();
          });
          numInput.addEventListener('blur', function () {
            if (numInput.value.length > 0 && !isAadhaarValid()) setError(numInput, true);
          });
        }
        if (mobile) {
          mobile.addEventListener('input', function () {
            mobile.value = mobile.value.replace(/\D/g, '').slice(0, 10);
            validate();
          });
          mobile.addEventListener('blur', function () {
            if (mobile.value.length > 0 && !isMobileValid()) setError(mobile, true);
          });
        }
        if (sec) {
          sec.addEventListener('input', function () {
            sec.value = sec.value.replace(/\D/g, '').slice(0, 3);
            validate();
          });
          sec.addEventListener('blur', function () {
            if (sec.value.length > 0 && !isSecurityValid()) setError(sec, true);
          });
        }
        [consent1, consent2].forEach(function (cb) { if (cb) cb.addEventListener('change', validate); });

        var readmoreToggle = $('#aadhaar-readmore-toggle', root);
        var readmoreExtra  = root.querySelector('.aadhaar-readmore__extra');
        if (readmoreToggle && readmoreExtra) {
          readmoreToggle.addEventListener('click', function (e) {
            e.preventDefault();
            var expanded = readmoreExtra.hidden === false;
            readmoreExtra.hidden = expanded;
            readmoreToggle.textContent = expanded ? 'Read More' : 'Read Less';
            readmoreToggle.setAttribute('aria-expanded', expanded ? 'false' : 'true');
          });
        }

        validate();
      };

      /* ---- aadhaar-otp ---- */
      INITS['aadhaar-otp'] = function () {
        var root  = screenEl('aadhaar-otp');
        if (root.dataset.inited) return; root.dataset.inited = '1';
        var boxes  = $$('.aadhaar-otp__box', root);
        var verify = $('#otp-verify', root);

        function otpValue()    { return boxes.map(function (b) { return b.value || ''; }).join(''); }
        function isOtpFilled() { return otpValue().length === boxes.length; }
        function syncBoxes()   { boxes.forEach(function (b) { b.classList.toggle('is-filled', !!b.value); }); }
        function refreshSubmit() { if (verify) verify.disabled = !isOtpFilled(); }

        boxes.forEach(function (b, i) {
          b.addEventListener('input', function () {
            b.value = (b.value || '').replace(/\D/g, '').slice(0, 1);
            if (b.value && i < boxes.length - 1) boxes[i + 1].focus();
            syncBoxes(); refreshSubmit();
          });
          b.addEventListener('keydown', function (e) {
            if      (e.key === 'Backspace'   && !b.value && i > 0)               boxes[i - 1].focus();
            else if (e.key === 'ArrowLeft'   && i > 0)                           boxes[i - 1].focus();
            else if (e.key === 'ArrowRight'  && i < boxes.length - 1)            boxes[i + 1].focus();
          });
          b.addEventListener('paste', function (e) {
            e.preventDefault();
            var text   = (e.clipboardData || window.clipboardData).getData('text') || '';
            var digits = text.replace(/\D/g, '').slice(0, boxes.length - i);
            for (var k = 0; k < digits.length; k++) boxes[i + k].value = digits[k];
            var next = Math.min(i + digits.length, boxes.length - 1);
            boxes[next].focus();
            syncBoxes(); refreshSubmit();
          });
        });
        refreshSubmit();
        var firstEmpty = boxes.find ? boxes.find(function (b) { return !b.value; }) : null;
        if (firstEmpty) setTimeout(function () { firstEmpty.focus(); }, 60);
      };

      /* ---- aadhaar-review ---- */
      INITS['aadhaar-review'] = function () {
        var root = screenEl('aadhaar-review');
        if (root.dataset.inited) return; root.dataset.inited = '1';
        var c1     = $('#review-c1', root);
        var c2     = $('#review-c2', root);
        var c3     = $('#review-c3', root);
        var submit = $('#review-submit', root);
        function allChecked() { return c1 && c2 && c3 && c1.checked && c2.checked && c3.checked; }
        function refresh()    { if (submit) submit.disabled = !allChecked(); }
        [c1, c2, c3].forEach(function (cb) { if (cb) cb.addEventListener('change', refresh); });
        refresh();
      };

      /* ---- aadhaar-done ---- */
      INITS['aadhaar-done'] = function () { /* static screen — no interactive logic */ };

      return {
        INITS:          INITS,
        handleSubmit:   handleSubmit,
        handleResendOtp: handleResendOtp
      };
    }
  };

})();
