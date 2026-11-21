/**
 * UI Panel / Card Shell helpers
 */

export function setPanelCollapsed(panelEl, isCollapsed) {
  if (!panelEl) {
    return;
  }
  panelEl.classList.toggle("is-collapsed", Boolean(isCollapsed));
  panelEl.setAttribute("aria-expanded", isCollapsed ? "false" : "true");
}
