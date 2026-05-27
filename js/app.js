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

  var observer = null;

  function renderIcons() {
    if (!window.lucide || typeof window.lucide.createIcons !== 'function') return;
    // createIcons() replaces <i data-lucide> with <svg>, which is itself a DOM
    // mutation. Disconnect the observer around the call so it can't re-trigger
    // itself into an infinite loop.
    if (observer) observer.disconnect();
    window.lucide.createIcons();
    if (observer) observer.observe(document.body, { childList: true, subtree: true });
  }

  function init() {
    // Re-render icons when Atlas (or anything) injects new DOM.
    observer = new MutationObserver(function () {
      renderIcons();
    });
    renderIcons();
    observer.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
