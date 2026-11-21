/**
 * Reusable SegmentedControl state synchronizer (eliminates duplicated className toggles across widgets).
 */

export function syncSegmentedButtons(
  buttons,
  activeValue,
  attrName = "aria-checked"
) {
  buttons.forEach(({ el, value }) => {
    if (!el) {
      return;
    }
    const isActive = value === activeValue;
    el.classList.toggle("is-active", isActive);
    el.setAttribute(attrName, isActive ? "true" : "false");
  });
}
