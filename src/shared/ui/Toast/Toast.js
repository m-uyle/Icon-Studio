/**
 * Reusable accessible Toast component with lifecycle cleanup.
 */

export function createToastController(rootEl, msgEl) {
  let timer = null;

  function show(text, durationMs = 1600) {
    if (!(rootEl && msgEl)) {
      return;
    }
    msgEl.textContent = text;
    rootEl.classList.add("is-visible");
    clearTimeout(timer);
    timer = setTimeout(() => {
      rootEl.classList.remove("is-visible");
    }, durationMs);
  }

  function destroy() {
    clearTimeout(timer);
    if (rootEl) {
      rootEl.classList.remove("is-visible");
    }
  }

  return { show, destroy };
}
