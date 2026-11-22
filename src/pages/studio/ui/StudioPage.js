import { OpticalAnalyzer, SAMPLE_ICONS } from "../../../entities/icon/index.js";
import { initGlobalDropZone } from "../../../features/batch-import/index.js";
import { initWelcomeModal } from "../../../features/onboarding/index.js";
import {
  createToastController,
  initTooltipSystem,
} from "../../../shared/ui/index.js";
import {
  assetsSidebarTemplate,
  initAssetsSidebar,
} from "../../../widgets/assets-sidebar/index.js";
import {
  canvasViewportTemplate,
  initCanvasViewport,
} from "../../../widgets/canvas-viewport/index.js";
import {
  initInspectorSidebar,
  inspectorSidebarTemplate,
} from "../../../widgets/inspector-sidebar/index.js";
import {
  initMatrixDashboard,
  matrixDashboardTemplate,
} from "../../../widgets/matrix-dashboard/index.js";
import {
  initWorkspaceHeader,
  workspaceHeaderTemplate,
} from "../../../widgets/workspace-header/index.js";

/**
 * StudioPage — Composes all 5 widgets and wires cross-widget events via callback inversion.
 */
export function mountStudioPage(
  rootEl,
  { getState, setState, subscribe, resetState } = {}
) {
  if (!rootEl) {
    return { unmount: () => {} };
  }

  const ac = new AbortController();
  const { signal } = ac;

  if (!rootEl.querySelector(".studio-shell")) {
    rootEl.innerHTML = `
      <div class="studio-shell">
        ${assetsSidebarTemplate}
        <main class="ui-panel studio-main">
          ${workspaceHeaderTemplate}
          ${canvasViewportTemplate}
          ${matrixDashboardTemplate}
        </main>
        ${inspectorSidebarTemplate}
      </div>
      <div aria-live="polite" class="ui-toast" id="toast" role="status">
        <span id="toastMsg">Ready</span>
      </div>
    `;
  }
  const toast = createToastController(
    rootEl.querySelector("#toast"),
    rootEl.querySelector("#toastMsg")
  );
  const tooltip = initTooltipSystem();

  const viewportArea = rootEl.querySelector("#viewportArea");
  const matrixArea = rootEl.querySelector("#matrixArea");

  let assetsSidebar;
  let workspaceHeader;
  let canvasViewport;
  let matrixDashboard;
  let inspectorSidebar;
  let preMatrixTab = null;

  function renderActiveWorkspace() {
    const state = getState();
    inspectorSidebar.updateQaHealthStrip();
    if (state.workspaceView === "matrix") {
      matrixDashboard.render();
    } else {
      canvasViewport.render();
    }
  }

  function syncWorkspaceViewUI(viewMode) {
    const isCanvas = viewMode === "canvas";
    viewportArea?.classList.toggle("is-hidden", !isCanvas);
    matrixArea?.classList.toggle("is-hidden", isCanvas);
    const inspEl = rootEl.querySelector("#inspectorSidebar");
    inspEl?.classList.toggle("is-matrix-mode", !isCanvas);
    workspaceHeader?.sync();
  }

  function setWorkspaceView(viewMode) {
    const state = getState();
    const prevView = state.workspaceView;
    const isCanvas = viewMode === "canvas";
    if (!isCanvas && prevView === "canvas") {
      preMatrixTab = state.activeTab;
      if (state.activeTab !== "inspection") {
        inspectorSidebar.switchTab("inspection");
      }
    } else if (isCanvas && prevView === "matrix" && preMatrixTab) {
      if (state.activeTab !== preMatrixTab) {
        inspectorSidebar.switchTab(preMatrixTab);
      }
      preMatrixTab = null;
    }
    if (setState) {
      setState({ workspaceView: viewMode });
    } else {
      state.workspaceView = viewMode;
      syncWorkspaceViewUI(viewMode);
      renderActiveWorkspace();
    }
  }

  function setTheme(newTheme) {
    const state = getState();
    for (const item of state.batchQueue) {
      item.cachedColorMarkups = {};
      item.subpixelReport = null;
      item.opticalMetrics = null;
    }
    OpticalAnalyzer.clearCache();
    if (setState) {
      setState({ theme: newTheme });
    } else {
      state.theme = newTheme;
      document.documentElement.setAttribute("data-theme", newTheme);
      workspaceHeader.sync();
      renderActiveWorkspace();
    }
  }

  function handleResetAll() {
    resetState();
    OpticalAnalyzer.clearCache();
    canvasViewport.fitToScreen(true);
    canvasViewport.resetPromptDismissed?.();
    setWorkspaceView("canvas");
    toast.show("Settings reset to 24 × 24 px");
  }

  function handleLoadSampleIcons() {
    let added = 0;
    for (const sample of SAMPLE_ICONS) {
      if (assetsSidebar.appendSvgString(sample.raw, sample.name, false)) {
        added++;
      }
    }
    if (added > 0) {
      assetsSidebar.switchBatchIndex(0);
      assetsSidebar.syncBatchUI();
      renderActiveWorkspace();
      toast.show(`Loaded ${added} demo icons`);
    }
  }

  const welcomeModal = initWelcomeModal({
    onLoadSamples: handleLoadSampleIcons,
  });
  welcomeModal.maybeAutoOpen();

  canvasViewport = initCanvasViewport(viewportArea, {
    getState,
    showToast: toast.show,
    inspectorEl: rootEl.querySelector("#inspectorSidebar"),
  });

  matrixDashboard = initMatrixDashboard(matrixArea, {
    getState,
    onLoadSamples: handleLoadSampleIcons,
  });

  workspaceHeader = initWorkspaceHeader(
    rootEl.querySelector("#workspaceHeader"),
    {
      getState,
      onWorkspaceViewChange: setWorkspaceView,
      onThemeChange: setTheme,
      onResetAll: handleResetAll,
      onOpenHelp: () => welcomeModal.open(),
    }
  );

  inspectorSidebar = initInspectorSidebar(
    rootEl.querySelector("#inspectorSidebar"),
    {
      getState,
      onGeometryChange: (isDimChange) => {
        if (isDimChange) {
          canvasViewport.syncZoomOnDimensionChange();
        }
        renderActiveWorkspace();
      },
      onPresetApplied: () => {
        canvasViewport.syncZoomOnDimensionChange();
        renderActiveWorkspace();
      },
      onLayerChange: () => {
        renderActiveWorkspace();
      },
      onTabChange: () => {
        renderActiveWorkspace();
      },
      onQaMetricsReady: () => {
        if (getState().workspaceView === "canvas") {
          canvasViewport.refreshQaOverlaysOnly();
        }
      },
      showToast: toast.show,
    }
  );

  assetsSidebar = initAssetsSidebar(rootEl.querySelector("#assetsSidebar"), {
    getState,
    onBatchChanged: (shouldRefit) => {
      if (shouldRefit && getState().zoomMode === "fit") {
        canvasViewport.fitToScreen(false);
      }
      renderActiveWorkspace();
    },
    onFitModeChanged: () => {
      renderActiveWorkspace();
    },
    onTransformArtwork: () => {
      renderActiveWorkspace();
    },
    onCompareChanged: () => {
      if (getState().zoomMode === "fit") {
        canvasViewport.fitToScreen(false);
      }
      renderActiveWorkspace();
    },
    showToast: toast.show,
  });

  window.addEventListener(
    "keydown",
    (e) => {
      const isDialogOpen = Boolean(document.querySelector("dialog[open]"));
      if (isDialogOpen) {
        return;
      }

      const state = getState();
      const target = e.target;
      const isInteractive =
        ["INPUT", "BUTTON", "SELECT", "TEXTAREA"].includes(target?.tagName) ||
        target?.isContentEditable ||
        Boolean(
          target?.closest(
            '[role="button"], [role="slider"], [role="textbox"], .dim-scrubber, .precision-scrubber'
          )
        );

      if (e.key === "Escape" && state.workspaceView === "matrix") {
        e.preventDefault();
        setWorkspaceView("canvas");
        return;
      }

      if (
        e.code === "Space" &&
        !state.isSpaceDown &&
        !isInteractive &&
        state.workspaceView === "canvas"
      ) {
        e.preventDefault();
        state.isSpaceDown = true;
      }

      if (
        state.batchQueue.length > 1 &&
        !isInteractive &&
        !e.metaKey &&
        !e.ctrlKey &&
        !e.altKey
      ) {
        if (e.key === "[") {
          assetsSidebar.switchBatchIndex(state.batchIndex - 1);
        }
        if (e.key === "]") {
          assetsSidebar.switchBatchIndex(state.batchIndex + 1);
        }
      }

      if (
        (e.key === "Delete" || e.key === "Backspace") &&
        !isInteractive &&
        !e.metaKey &&
        !e.ctrlKey &&
        !e.altKey &&
        state.batchQueue.length > 0
      ) {
        e.preventDefault();
        assetsSidebar.removeIconFromBatch(state.batchIndex);
        toast.show("Icon deleted from queue");
      }

      if (e.key === "?" && !isInteractive) {
        e.preventDefault();
        welcomeModal.open();
      }
    },
    { signal }
  );

  window.addEventListener(
    "keyup",
    (e) => {
      if (e.code === "Space") {
        getState().isSpaceDown = false;
      }
    },
    { signal }
  );

  const globalDropZone = initGlobalDropZone({
    container: rootEl,
    onImportFiles: async (svgFiles) => {
      const fileTexts = await Promise.all(
        svgFiles.map(async (file) => ({
          name: file.name,
          text: await file.text(),
        }))
      );
      let added = 0;
      for (const item of fileTexts) {
        if (assetsSidebar.appendSvgString(item.text, item.name, false)) {
          added++;
        }
      }
      if (added > 0) {
        assetsSidebar.syncBatchUI();
        renderActiveWorkspace();
        toast.show(`Imported ${added} SVG${added > 1 ? "s" : ""}`);
      }
    },
    onImportSvgString: (svgMarkup, filename) => {
      assetsSidebar.appendSvgString(svgMarkup, filename, true);
    },
    onNotify: (msg) => toast.show(msg),
  });

  window.addEventListener(
    "resize",
    () => {
      const state = getState();
      if (state.workspaceView !== "canvas") {
        return;
      }
      if (state.zoomMode === "fit") {
        canvasViewport.fitToScreen(false);
      } else {
        canvasViewport.updateTransform();
      }
    },
    { signal }
  );

  window.addEventListener(
    "beforeunload",
    (e) => {
      if (getState().batchQueue.length > 0) {
        e.preventDefault();
        e.returnValue = "";
      }
    },
    { signal }
  );

  const unsubStore = subscribe?.((_state, changedKeys) => {
    if (changedKeys.includes("theme")) {
      document.documentElement.setAttribute("data-theme", getState().theme);
      workspaceHeader.sync();
    }
    if (changedKeys.includes("workspaceView")) {
      syncWorkspaceViewUI(getState().workspaceView);
    }
    if (
      changedKeys.includes("width") ||
      changedKeys.includes("height") ||
      changedKeys.includes("padding") ||
      changedKeys.includes("radius") ||
      changedKeys.includes("aspectLocked")
    ) {
      inspectorSidebar.syncAll();
      canvasViewport.syncZoomOnDimensionChange();
    }
    if (
      changedKeys.includes("artFitMode") ||
      changedKeys.includes("batchQueue") ||
      changedKeys.includes("batchIndex") ||
      changedKeys.includes("exportCodeFormat")
    ) {
      assetsSidebar.syncFitMode();
      assetsSidebar.syncExportControls();
      assetsSidebar.syncBatchUI();
    }
    renderActiveWorkspace();
  });

  inspectorSidebar.syncAll();
  assetsSidebar.syncFitMode();
  assetsSidebar.syncExportControls();
  assetsSidebar.syncBatchUI();
  setTheme(getState().theme);
  canvasViewport.fitToScreen(true);
  renderActiveWorkspace();

  function unmount() {
    unsubStore?.();
    ac.abort();
    welcomeModal.destroy();
    globalDropZone.destroy();
    workspaceHeader.destroy();
    canvasViewport.destroy();
    matrixDashboard.destroy();
    inspectorSidebar.destroy();
    assetsSidebar.destroy();
    toast.destroy();
    tooltip.destroy();
  }

  return { unmount };
}
