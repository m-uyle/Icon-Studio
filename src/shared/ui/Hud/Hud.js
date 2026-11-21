/**
 * Reusable HUD ViewSwitch state synchronizer
 */

export function syncViewSwitch(viewSwitchEl, mode, buttons = {}) {
  if (!viewSwitchEl) {
    return;
  }
  const isFit = mode === "fit";
  const is1to1 = mode === "1:1" || mode === "1to1";
  const isManual = mode === "manual";

  viewSwitchEl.classList.toggle("mode-fit", isFit);
  viewSwitchEl.classList.toggle("mode-1to1", is1to1);
  viewSwitchEl.classList.toggle("mode-manual", isManual);

  if (buttons.fitBtn) {
    buttons.fitBtn.classList.toggle("is-active", isFit);
  }
  if (buttons.oneToOneBtn) {
    buttons.oneToOneBtn.classList.toggle("is-active", is1to1);
  }
}
