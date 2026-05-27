/* =========================================================================
   Face Scan — scan-state handling.
   States:
     - "searching" (default): empty oval, white ring, lighting guidance.
     - "misaligned": red ring, camera feed visible, "keep centred" guidance.
   In production these are driven by the face-detection result; here the state
   can be forced via ?state=misaligned for review, or toggled with setState().
   ========================================================================= */

(function () {
  'use strict';

  var HINTS = {
    searching: "Make sure you're in well-lit area with plain background",
    misaligned: 'Keep your face centered within frame for a clear scan',
  };

  function setState(state) {
    var camera = document.getElementById('facescan-camera');
    var hint = document.getElementById('facescan-hint');
    if (!camera || !hint) return;
    var isError = state === 'misaligned';
    camera.classList.toggle('facescan-camera--error', isError);
    hint.textContent = isError ? HINTS.misaligned : HINTS.searching;
  }

  function stateFromUrl() {
    // Hash survives clean-URL redirects (e.g. `serve` dropping ?query); prefer it.
    var hash = (window.location.hash || '').replace('#', '');
    if (hash) return hash;
    var params = new URLSearchParams(window.location.search);
    return params.get('state') || 'searching';
  }

  function init() {
    setState(stateFromUrl());
    window.addEventListener('hashchange', function () {
      setState(stateFromUrl());
    });
    // Expose for prototyping/QA from the console.
    window.faceScanSetState = setState;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
