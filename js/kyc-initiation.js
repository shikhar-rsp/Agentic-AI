/* =========================================================================
   KYC Initiation — single-select between "Complete KYC" and "Send link".
   ========================================================================= */

(function () {
  'use strict';

  function init() {
    var tiles = Array.prototype.slice.call(document.querySelectorAll('.kycinit-tile'));
    var submit = document.getElementById('kycinit-submit');
    if (!tiles.length) return;

    var requirements = document.getElementById('kycinit-requirements');
    var submitLabel = document.getElementById('kycinit-submit-label');

    function select(tile) {
      tiles.forEach(function (t) {
        var on = t === tile;
        t.classList.toggle('is-selected', on);
        t.setAttribute('aria-checked', on ? 'true' : 'false');
      });

      // "Send link" hides the agent document checklist and changes the CTA.
      var sendLink = tile.getAttribute('data-option') === 'send-link';
      if (requirements) requirements.style.display = sendLink ? 'none' : '';
      if (submitLabel) {
        submitLabel.textContent = sendLink ? 'Next' : 'Start KYC Verification';
      }
    }

    tiles.forEach(function (tile) {
      tile.addEventListener('click', function () {
        select(tile);
      });
      tile.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          select(tile);
        }
      });
    });

    if (submit) {
      submit.addEventListener('click', function () {
        var selected = document.querySelector('.kycinit-tile.is-selected');
        var option = selected ? selected.getAttribute('data-option') : null;
        // Standalone page — no cross-page navigation by design.
        console.log('Proceed with option:', option);
      });
    }

    // Standalone state file (e.g. kyc-initiation-send-link.html) declares the
    // pre-selected option via <body data-kycinit-state="send-link">.
    var preState = document.body.dataset.kycinitState;
    if (preState) {
      var pre = document.querySelector('.kycinit-tile[data-option="' + preState + '"]');
      if (pre) select(pre);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
