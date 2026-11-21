/**
 * Reusable LayerToggle state synchronizer
 */

export function syncLayerToggleButtons(buttons, stateObj) {
  let activeCount = 0;
  buttons.forEach((el) => {
    if (!el) {
      return;
    }
    const isActive = Boolean(stateObj[el.dataset.key]);
    if (isActive) {
      activeCount++;
    }
    el.classList.toggle("active", isActive);
    el.setAttribute("aria-checked", isActive ? "true" : "false");
  });
  return activeCount;
}
