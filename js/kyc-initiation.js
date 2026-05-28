/* =========================================================================
   KYC Initiation — single-select between "Complete KYC" and "Send link".
   ========================================================================= */

(function () {
  'use strict';

  function init() {
    var tiles = Array.prototype.slice.call(document.querySelectorAll('.kycinit-tile'));
    var submit = document.getElementById('kycinit-submit');
    if (!tiles.length) return;

    function select(tile) {
      tiles.forEach(function (t) {
        var on = t === tile;
        t.classList.toggle('is-selected', on);
        t.setAttribute('aria-checked', on ? 'true' : 'false');
      });
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
        // TODO: route to the chosen flow when those screens exist.
        console.log('Start KYC Verification with option:', option);
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
