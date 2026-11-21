/**
 * Reusable Folder Tabs controller & state synchronizer
 */

export function syncTabs(tabButtons, activeValue, attrName = "aria-selected") {
  tabButtons.forEach(({ el, value }) => {
    if (!el) {
      return;
    }
    const isActive = value === activeValue;
    el.classList.toggle("is-active", isActive);
    el.setAttribute(attrName, isActive ? "true" : "false");
  });
}

export function initTabs(containerEl, { tabs, activeTab, onChange }) {
  let currentTab = activeTab;
  const buttons = tabs.map(({ id, btnEl, paneEl }) => ({
    id,
    btnEl: btnEl ?? containerEl.querySelector(`[data-tab="${id}"]`),
    paneEl: paneEl ?? containerEl.querySelector(`[data-tab-pane="${id}"]`),
  }));

  function setTab(tabId) {
    currentTab = tabId;
    buttons.forEach(({ id, btnEl, paneEl }) => {
      const isActive = id === currentTab;
      btnEl?.classList.toggle("is-active", isActive);
      btnEl?.setAttribute("aria-selected", isActive ? "true" : "false");
      paneEl?.classList.toggle("is-hidden", !isActive);
    });
    onChange?.(tabId);
  }

  buttons.forEach(({ id, btnEl }) => {
    btnEl?.addEventListener("click", () => setTab(id));
  });

  setTab(currentTab);

  return {
    setTab,
    getActiveTab: () => currentTab,
  };
}
