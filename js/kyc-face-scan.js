/* =============================================================================
   kyc-face-scan.js
   All JavaScript for the Face Scan KYC flow:
     - face-scan            (camera capture — desktop card + mobile full-bleed)
     - face-scan-verifying  (UIDAI-style progress)
     - face-scan-review     (review & consents)
     - face-scan-done       (success summary)

   Usage: loaded before the main inline SPA script. Exposes window.ekycFaceScan.
   The main script calls:
     var faceScan = window.ekycFaceScan.init({ goto, $, screenEl, getCurrent });
     // merges faceScan.INITS; delegates submit/actions to faceScan handlers
============================================================================= */
(function () {
  'use strict';

  window.ekycFaceScan = {

    init: function (deps) {
      var goto      = deps.goto;
      var $         = deps.$;
      var screenEl  = deps.screenEl;
      var getCurrent = deps.getCurrent || function () { return null; };

      var INITS = {};

      /* ---- face-scan ---- */
      INITS['face-scan'] = function () {
        var root = screenEl('face-scan');
        if (!root || root.dataset.inited) return;
        root.dataset.inited = '1';

        var page          = document.getElementById('facescan-page');
        var video         = document.getElementById('face-video');
        var videoMobile   = document.getElementById('face-video-mobile');
        var captureBtn    = document.getElementById('face-capture');
        var hint          = document.getElementById('face-hint');
        var hintMobile    = document.getElementById('face-mobile-hint');
        var noCameraEl    = document.getElementById('face-no-camera');
        var frameEl       = document.getElementById('face-frame');
        var mobileCamera  = document.getElementById('face-mobile-camera');
        var tryAgainBtn   = document.getElementById('face-try-again');
        var barCapture    = root.querySelector('.facescan-mobile-bar--capture');
        var barMisaligned = root.querySelector('.facescan-mobile-bar--misaligned');
        var activeStream  = null;
        var scanTimer     = null;
        var mobileAutoTimer = null;

        function isMobileView() {
          return window.matchMedia('(max-width: 767px)').matches;
        }

        function clearMobileAutoTimer() {
          if (mobileAutoTimer) {
            clearTimeout(mobileAutoTimer);
            mobileAutoTimer = null;
          }
        }

        function scheduleMobileAutoVerify() {
          clearMobileAutoTimer();
          if (!isMobileView()) return;
          mobileAutoTimer = setTimeout(function () {
            mobileAutoTimer = null;
            goto('face-scan-verifying');
          }, 5000);
        }

        function showError() {
          clearMobileAutoTimer();
          if (noCameraEl) noCameraEl.hidden = false;
          if (frameEl) frameEl.hidden = true;
          if (hint) hint.hidden = true;
          if (captureBtn) captureBtn.disabled = true;
        }

        function showVideo(stream) {
          activeStream = stream;
          if (video) { video.srcObject = stream; video.play(); }
          if (videoMobile) { videoMobile.srcObject = stream; videoMobile.play(); }
          if (noCameraEl) noCameraEl.hidden = true;
          if (frameEl) frameEl.hidden = false;
          if (hint) hint.hidden = false;
          if (captureBtn) captureBtn.disabled = false;
          scheduleMobileAutoVerify();
        }

        function startCamera() {
          if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            showError();
            return;
          }
          navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false })
            .then(showVideo)
            .catch(showError);
        }

        if (tryAgainBtn) {
          tryAgainBtn.addEventListener('click', startCamera);
        }

        var scanningEl = document.getElementById('face-scanning');
        var scanningMobile = document.getElementById('face-scanning-mobile');
        var progressBar = document.getElementById('face-scan-progress');
        var progressMobile = document.getElementById('face-scan-progress-mobile');

        function setMisalignedMobile(on) {
          if (page) page.classList.toggle('is-misaligned', on);
          if (mobileCamera) mobileCamera.classList.toggle('facescan-camera--error', on);
          if (barCapture) barCapture.hidden = on;
          if (barMisaligned) barMisaligned.hidden = !on;
          if (hintMobile && on) {
            hintMobile.textContent = 'Keep your face centered within frame for a clear scan';
          }
        }

        function resetScanningUI() {
          clearMobileAutoTimer();
          if (scanTimer) { clearInterval(scanTimer); scanTimer = null; }
          if (captureBtn) captureBtn.hidden = false;
          if (scanningEl) scanningEl.hidden = true;
          if (scanningMobile) scanningMobile.hidden = true;
          if (progressBar) progressBar.style.width = '0%';
          if (progressMobile) progressMobile.style.width = '0%';
          if (frameEl) frameEl.classList.remove('is-scanning');
          setMisalignedMobile(false);
        }

        function startFaceScanning() {
          if (captureBtn) captureBtn.hidden = true;
          if (scanningEl) scanningEl.hidden = false;
          if (progressBar) progressBar.style.width = '0%';
          if (frameEl) frameEl.classList.add('is-scanning');
          if (hint) {
            hint.hidden = false;
            hint.textContent = 'Look at the camera and blink once';
          }

          var progress = 0;
          var TICK = 50;
          var STEPS = 4000 / TICK;
          var inc = 100 / STEPS;

          if (scanTimer) clearInterval(scanTimer);
          scanTimer = setInterval(function () {
            progress = Math.min(progress + inc, 100);
            var rounded = Math.round(progress);
            if (progressBar) progressBar.style.width = rounded + '%';
            if (progress >= 100) {
              clearInterval(scanTimer);
              scanTimer = null;
              goto('face-scan-verifying');
            }
          }, TICK);
        }

        if (captureBtn) {
          captureBtn.addEventListener('click', function () {
            if (captureBtn.disabled) return;
            startFaceScanning();
          });
        }

        document.addEventListener('ekyc:enter', function (e) {
          if (!e.detail) return;
          if (e.detail.screen === 'face-scan') {
            resetScanningUI();
            startCamera();
          }
          if (e.detail.screen !== 'face-scan') {
            clearMobileAutoTimer();
            if (activeStream) {
              activeStream.getTracks().forEach(function (t) { t.stop(); });
              activeStream = null;
              if (video) video.srcObject = null;
              if (videoMobile) videoMobile.srcObject = null;
              showError();
              resetScanningUI();
            }
          }
        });

        document.addEventListener('ekyc:face-retry', function () {
          resetScanningUI();
          startCamera();
        });

        startCamera();
      };

      /* ---- face-scan-verifying ---- */
      INITS['face-scan-verifying'] = function () {
        var root = screenEl('face-scan-verifying');
        if (!root) return;

        if (root._verifyTimer) {
          clearInterval(root._verifyTimer);
          root._verifyTimer = null;
        }

        var bar = root.querySelector('#face-verify-progress-bar');
        var pct = root.querySelector('#face-verify-progress-pct');
        if (bar) bar.style.width = '0%';
        if (pct) pct.textContent = '0%';

        var progress = 0;
        var TICK = 50;
        var STEPS = 4000 / TICK;
        var inc = 100 / STEPS;

        root._verifyTimer = setInterval(function () {
          progress = Math.min(progress + inc, 100);
          var rounded = Math.round(progress);
          if (bar) bar.style.width = rounded + '%';
          if (pct) pct.textContent = rounded + '%';
          if (progress >= 100) {
            clearInterval(root._verifyTimer);
            root._verifyTimer = null;
            goto('face-scan-review');
          }
        }, TICK);
      };

      /* ---- face-scan-review ---- */
      INITS['face-scan-review'] = function () {
        var root = screenEl('face-scan-review');
        if (!root || root.dataset.inited) return;
        root.dataset.inited = '1';

        var c1 = $('#face-review-c1', root);
        var c2 = $('#face-review-c2', root);
        var c3 = $('#face-review-c3', root);
        var submit = $('#face-review-submit', root);

        function allChecked() {
          return c1 && c2 && c3 && c1.checked && c2.checked && c3.checked;
        }

        function refresh() {
          if (submit) submit.disabled = !allChecked();
        }

        [c1, c2, c3].forEach(function (cb) {
          if (cb) cb.addEventListener('change', refresh);
        });
        refresh();
      };

      /* ---- face-scan-done ---- */
      INITS['face-scan-done'] = function () { /* static screen */ };

      /* ---- Submit handler (called by main handleSubmit) ---- */
      function handleSubmit(slug, btn) {
        if (slug === 'face-scan-review') {
          if (btn && btn.disabled) return true;
          console.log('[ekyc] Face scan review confirmed');
          goto('face-scan-done');
          return true;
        }
        return false;
      }

      /* ---- Action handler (face-retry, face-flip) ---- */
      function handleAction(action, e) {
        if (action === 'face-retry') {
          if (e && e.preventDefault) e.preventDefault();
          var facescanPage = document.getElementById('facescan-page');
          if (facescanPage) facescanPage.classList.remove('is-misaligned');
          if (getCurrent() !== 'face-scan') goto('face-scan');
          else document.dispatchEvent(new CustomEvent('ekyc:face-retry'));
          return true;
        }
        if (action === 'face-flip') {
          if (e && e.preventDefault) e.preventDefault();
          console.log('[ekyc] flip camera');
          return true;
        }
        return false;
      }

      return {
        INITS:         INITS,
        handleSubmit:  handleSubmit,
        handleAction:  handleAction
      };
    }
  };
})();
