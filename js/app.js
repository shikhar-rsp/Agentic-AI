/* =========================================================================
   bajaj-ekyc — project glue.
   The Atlas bundle (assets/atlas/atlas.js) self-initializes all interactive
   components on DOMContentLoaded and watches for dynamically added DOM, so
   you normally do NOT init components here.

   This file is for:
     - rendering Lucide icons
     - page-specific navigation / form handling
   ========================================================================= */

(function () {
  'use strict';

  function renderIcons() {
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  function init() {
    renderIcons();
    // Re-render icons when Atlas (or anything) injects new DOM.
    const obs = new MutationObserver(() => renderIcons());
    obs.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
