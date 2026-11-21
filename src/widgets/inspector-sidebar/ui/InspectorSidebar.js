import { CORE_QA_KEYS, QA_KEYS } from "../../../entities/grid/index.js";
import { initGeometryControls } from "../../../features/geometry-controls/index.js";
import { initGuideLayersPanel } from "../../../features/guide-layers/index.js";
import { initQaInspectionPanel } from "../../../features/qa-inspection/index.js";
import { syncTabs } from "../../../shared/ui/index.js";

/**
 * Right Panel Widget: Grid & Guides Tab + Inspection QA Tab.
 */
export function initInspectorSidebar(
  rootEl,
  {
    getState,
    onGeometryChange,
    onPresetApplied,
    onLayerChange,
    onTabChange,
    onQaMetricsReady,
    showToast,
  }
) {
  const ac = new AbortController();
  const { signal } = ac;

  const tabBtnGrid = rootEl.querySelector("#tabBtnGrid");
  const tabBtnInspection = rootEl.querySelector("#tabBtnInspection");
  const tabPaneGrid = rootEl.querySelector("#tabPaneGrid");
  const tabPaneInspection = rootEl.querySelector("#tabPaneInspection");
  const tabInspectionDot = rootEl.querySelector("#tabInspectionDot");

  const tabButtons = [
    { el: tabBtnGrid, value: "grid" },
    { el: tabBtnInspection, value: "inspection" },
  ];

  const geometry = initGeometryControls(rootEl, {
    getState,
    onGeometryChange,
    onPresetApplied: (key) => {
      guides.sync();
      onPresetApplied(key);
    },
    showToast,
  });

  const guides = initGuideLayersPanel(rootEl, {
    getState,
    onChange: onLayerChange,
  });

  const qa = initQaInspectionPanel(rootEl, {
    getState,
    onQaToggleChange: onLayerChange,
    onMetricsReady: onQaMetricsReady,
    tabDotEl: tabInspectionDot,
  });

  function switchTab(tabName) {
    const state = getState();
    state.activeTab = tabName;
    const isGrid = tabName === "grid";

    syncTabs(tabButtons, tabName);
    tabPaneGrid?.classList.toggle("is-hidden", !isGrid);
    tabPaneInspection?.classList.toggle("is-hidden", isGrid);

    if (isGrid) {
      state.qaOverlay = false;
    } else {
      state.qaOverlay = true;
      if (!state.qaLayersCustomized) {
        QA_KEYS.forEach((k) => {
          state[k] = CORE_QA_KEYS.includes(k);
        });
      }
      qa.syncToggles();
    }

    onTabChange(tabName);
  }

  tabBtnGrid?.addEventListener("click", () => switchTab("grid"), { signal });
  tabBtnInspection?.addEventListener("click", () => switchTab("inspection"), {
    signal,
  });

  function syncAll() {
    const state = getState();
    syncTabs(tabButtons, state.activeTab);
    tabPaneGrid?.classList.toggle("is-hidden", state.activeTab !== "grid");
    tabPaneInspection?.classList.toggle(
      "is-hidden",
      state.activeTab === "grid"
    );
    geometry.sync();
    guides.sync();
    qa.syncToggles();
  }

  function destroy() {
    ac.abort();
    geometry.destroy();
    guides.destroy();
    qa.destroy();
  }

  return {
    switchTab,
    syncAll,
    setPresetValue: geometry.setPresetValue,
    updateQaHealthStrip: qa.updateHealthStrip,
    destroy,
  };
}
