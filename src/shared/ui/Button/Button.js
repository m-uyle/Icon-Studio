/**
 * UI Button / Chip interactive helpers
 */

export function setButtonDisabled(buttonEl, isDisabled) {
  if (!buttonEl) {
    return;
  }
  buttonEl.disabled = Boolean(isDisabled);
  buttonEl.setAttribute("aria-disabled", isDisabled ? "true" : "false");
}
