import { syncTabs } from "../../../shared/ui/index.js";

/**
 * Center Header Widget: App title, Canvas/Matrix switcher, Reset, and circular Theme toggle.
 */
export function initWorkspaceHeader(
  rootEl,
  { getState, onWorkspaceViewChange, onThemeChange, onResetAll }
) {
  const ac = new AbortController();
  const { signal } = ac;

  const viewButtons = [
    { el: rootEl.querySelector("#viewTabCanvas"), value: "canvas" },
    { el: rootEl.querySelector("#viewTabMatrix"), value: "matrix" },
  ];

  const btnResetAll = rootEl.querySelector("#btnResetAll");
  const btnThemeToggle = rootEl.querySelector("#btnThemeToggle");
  const iconThemeMoon = rootEl.querySelector("#iconThemeMoon");
  const iconThemeSun = rootEl.querySelector("#iconThemeSun");

  viewButtons.forEach(({ el, value }) => {
    el?.addEventListener("click", () => onWorkspaceViewChange(value), {
      signal,
    });
  });

  btnThemeToggle?.addEventListener(
    "click",
    () => {
      const nextTheme = getState().theme === "dark" ? "light" : "dark";
      onThemeChange(nextTheme);
    },
    { signal }
  );

  btnResetAll?.addEventListener("click", () => onResetAll(), { signal });

  function sync() {
    const state = getState();
    syncTabs(viewButtons, state.workspaceView);

    const isDark = state.theme === "dark";
    iconThemeMoon?.classList.toggle("is-hidden", isDark);
    iconThemeSun?.classList.toggle("is-hidden", !isDark);
    if (btnThemeToggle) {
      const label = isDark ? "Switch to light theme" : "Switch to dark theme";
      btnThemeToggle.setAttribute("aria-label", label);
      btnThemeToggle.setAttribute("data-tooltip", label);
      btnThemeToggle.setAttribute("aria-pressed", isDark ? "true" : "false");
    }
  }

  function destroy() {
    ac.abort();
  }

  return { sync, destroy };
}
