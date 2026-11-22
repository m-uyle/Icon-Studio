import { getPasteShortcutLabel } from "../../../shared/lib/index.js";
import {
  initModal,
  renderCheckbox,
  renderTag,
} from "../../../shared/ui/index.js";

const FTUX_KEY = "icon_studio_ftux_seen";

/**
 * Controller for the onboarding guide modal.
 *
 * @param {Object} [options]
 * @param {Function} [options.onLoadSamples] - Callback when user clicks 'Try Demo Icons'
 * @returns {Object} Modal controller interface { open, close, maybeAutoOpen, destroy }
 */
export function initWelcomeModal({ onLoadSamples } = {}) {
  let dialog = document.querySelector("#welcomeDialog");

  if (dialog?.__welcomeModalController) {
    return dialog.__welcomeModalController;
  }

  if (!dialog) {
    const pasteShortcut = getPasteShortcutLabel();
    const dialogMarkup = `
      <dialog
        aria-labelledby="welcomeTitle"
        class="ui-dialog"
        id="welcomeDialog"
        tabindex="-1"
      >
        <div class="ui-modal ui-modal--md">
          <header class="ui-modal__header">
            <div class="ui-modal__titles">
              <h2 class="ui-modal__title" id="welcomeTitle">Welcome to Icon Studio</h2>
              <p class="ui-modal__description">
                Parametric grid tooling and production QA for SVG icons.
              </p>
            </div>
            <button
              aria-label="Close dialog"
              class="ui-modal__close"
              data-modal-close
              type="button"
            >
              <svg fill="none" height="16" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" width="16">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </header>

          <div class="ui-modal__body">
            <div class="welcome-feature">
              <div aria-hidden="true" class="welcome-feature__icon-wrap">
                <svg class="crisp-stroke" fill="none" height="28" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" width="28">
                  <path d="M4 16v1a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-1m-4-8-4-4m0 0L8 8m4-4v12" />
                </svg>
              </div>
              <div class="welcome-feature__content">
                <h3 class="welcome-feature__title">Instant Import</h3>
                <p class="welcome-feature__desc">
                  Drop SVG files onto the window, or paste vectors directly from Figma or Illustrator with ${renderTag({ text: pasteShortcut, as: "kbd" })}.
                </p>
              </div>
            </div>

            <div class="welcome-feature">
              <div aria-hidden="true" class="welcome-feature__icon-wrap">
                <svg class="crisp-stroke" fill="none" height="28" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" width="28">
                  <circle cx="11" cy="11" r="7" />
                  <path d="m21 21-4.35-4.35" />
                  <path d="m9 9 4 4m0-4-4 4" />
                </svg>
              </div>
              <div class="welcome-feature__content">
                <h3 class="welcome-feature__title">Keylines & Quality Inspection</h3>
                <p class="welcome-feature__desc">
                  Check keyline alignment and safe margin bleeds, catch stray subpixel points, and balance optical weight.
                </p>
              </div>
            </div>

            <div class="welcome-feature">
              <div aria-hidden="true" class="welcome-feature__icon-wrap">
                <svg class="crisp-stroke" fill="none" height="28" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" width="28">
                  <path d="M12 3 2 9l10 6 10-6-10-6Z" />
                  <path d="m2 15 10 6 10-6" />
                </svg>
              </div>
              <div class="welcome-feature__content">
                <h3 class="welcome-feature__title">UI Testing & Production Export</h3>
                <p class="welcome-feature__desc">
                  Preview 16–48px rendering across live contexts, then export SVG (clean or with guides), React, or Android XML.
                </p>
              </div>
            </div>
          </div>

          <footer class="ui-modal__footer">
            ${renderCheckbox({
              id: "chkWelcomeDismiss",
              label: "Don't show this again",
            })}
            <div class="ui-modal__actions">
              <button
                class="ui-btn ui-btn--ghost ui-btn--pill"
                id="btnWelcomeSamples"
                type="button"
              >
                Try Demo Icons
              </button>
              <button
                class="ui-btn ui-btn--primary ui-btn--pill"
                id="btnWelcomeStart"
                type="button"
              >
                Get Started
              </button>
            </div>
          </footer>
        </div>
      </dialog>
    `;
    document.body.insertAdjacentHTML("beforeend", dialogMarkup);
    dialog = document.querySelector("#welcomeDialog");
  }

  const ac = new AbortController();
  const { signal } = ac;

  const chkDismiss = dialog.querySelector("#chkWelcomeDismiss");
  const btnStart = dialog.querySelector("#btnWelcomeStart");
  const btnSamples = dialog.querySelector("#btnWelcomeSamples");

  function syncDismissState() {
    if (!chkDismiss) {
      return;
    }
    try {
      chkDismiss.checked = localStorage.getItem(FTUX_KEY) === "true";
    } catch {
      // ignore
    }
  }

  function savePreference() {
    try {
      if (chkDismiss?.checked) {
        localStorage.setItem(FTUX_KEY, "true");
      } else {
        localStorage.removeItem(FTUX_KEY);
      }
    } catch {
      // ignore storage errors in private mode
    }
  }

  const modal = initModal(dialog, {
    onClose: savePreference,
  });

  btnStart?.addEventListener(
    "click",
    () => {
      savePreference();
      modal.close();
    },
    { signal }
  );

  btnSamples?.addEventListener(
    "click",
    () => {
      savePreference();
      modal.close();
      onLoadSamples?.();
    },
    { signal }
  );

  function open() {
    syncDismissState();
    modal.open();
  }

  function maybeAutoOpen() {
    try {
      const seen = localStorage.getItem(FTUX_KEY);
      if (!seen) {
        open();
      }
    } catch {
      // ignore
    }
  }

  function destroy() {
    ac.abort();
    modal.destroy();
    if (dialog) {
      dialog.__welcomeModalController = null;
    }
  }

  const controller = {
    open,
    close: modal.close,
    maybeAutoOpen,
    destroy,
  };

  if (dialog) {
    dialog.__welcomeModalController = controller;
  }

  return controller;
}
