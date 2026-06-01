/* =========================================================================
   Choose your KYC Method — single-select tile + CTA label sync.
   Standalone page; the Proceed button is a no-op (no cross-page navigation).
   ========================================================================= */

(function () {
  'use strict';

  function init() {
    var tiles = Array.prototype.slice.call(document.querySelectorAll('.method-tile'));
    var ctaLabel = document.getElementById('km-cta-label');
    var cta = document.getElementById('km-cta');

    if (!tiles.length) return;

    function select(tile) {
      tiles.forEach(function (t) {
        var on = t === tile;
        t.classList.toggle('is-selected', on);
        t.setAttribute('aria-checked', on ? 'true' : 'false');
      });
      // Sync the CTA label with the selected method.
      var label = tile.getAttribute('data-label');
      if (ctaLabel && label) {
        ctaLabel.textContent = 'Proceed with ' + label;
      }
    }

    tiles.forEach(function (tile) {
      tile.addEventListener('click', function () { select(tile); });
      tile.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          select(tile);
        }
      });
    });

    if (cta) {
      cta.addEventListener('click', function () {
        var selected = document.querySelector('.method-tile.is-selected');
        var option = selected ? selected.getAttribute('data-method') : null;
        // Standalone page — no cross-page navigation by design.
        console.log('Proceed with method:', option);
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
