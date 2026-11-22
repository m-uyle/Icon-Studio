import {
  buildGridMarkup,
  buildIllustrationGuidesMarkup,
  buildKeylinesSvgMarkup,
  buildQaOverlayMarkup,
  CONTRAST_COLORS,
} from "../../../entities/grid/index.js";
import {
  getArtworkTransform,
  getColoredArtworkMarkup,
  getCompareGridCols,
  getSelectedIconsForDisplay,
} from "../../../entities/icon/index.js";
import { createPanZoomController } from "../../../features/pan-zoom/index.js";
import { escapeHtml } from "../../../shared/lib/index.js";
import {
  syncSegmentedButtons,
  syncViewSwitch,
} from "../../../shared/ui/index.js";

/**
 * Interactive Artboard Viewport Widget: Single & Multi-Compare SVG rendering,
 * Pan/Zoom controller, and Floating HUD Pills (including working Grid Cols cycler).
 */
export function initCanvasViewport(
  rootEl,
  { getState, showToast, inspectorEl } = {}
) {
  if (!rootEl) {
    return {
      render: () => {},
      updateTransform: () => {},
      refreshQaOverlaysOnly: () => {},
      fitToScreen: () => {},
      setZoom100: () => {},
      syncZoomOnDimensionChange: () => {},
      dismissPrompt: () => {},
      resetPromptDismissed: () => {},
      destroy: () => {},
    };
  }

  const ac = new AbortController();
  const { signal } = ac;

  const panZoomContainer = rootEl.querySelector("#panZoomContainer");
  const canvasTransformGroup = rootEl.querySelector("#canvasTransformGroup");
  const stageContainer = rootEl.querySelector("#stageContainer");
  const viewportEmptyState = rootEl.querySelector("#viewportEmptyState");

  let isPromptDismissed = false;

  function dismissPrompt() {
    if (!isPromptDismissed) {
      isPromptDismissed = true;
      viewportEmptyState?.classList.add("is-hidden");
    }
  }

  // Dismiss empty prompt as soon as user begins interacting with the right sidebar
  const rightSidebar =
    inspectorEl || document.querySelector("#inspectorSidebar");
  if (rightSidebar) {
    const handleInspectorInteract = () => {
      dismissPrompt();
    };
    rightSidebar.addEventListener("pointerdown", handleInspectorInteract, {
      signal,
      passive: true,
    });
    rightSidebar.addEventListener("keydown", handleInspectorInteract, {
      signal,
      passive: true,
    });
    rightSidebar.addEventListener("input", handleInspectorInteract, {
      signal,
      passive: true,
    });
  }

  const btnSurfaceMode = rootEl.querySelector("#btnSurfaceMode");
  const btnDiffMode = rootEl.querySelector("#btnDiffMode");
  const artColorSegment = rootEl.querySelector("#artColorSegment");
  const colorModeButtons = [
    { el: rootEl.querySelector("#btnColorMono"), value: "theme" },
    { el: rootEl.querySelector("#btnColorContrast"), value: "contrast" },
    { el: rootEl.querySelector("#btnColorOriginal"), value: "original" },
  ];
  const btnZoomFit = rootEl.querySelector("#btnZoomFit");
  const btnZoom100 = rootEl.querySelector("#btnZoom100");
  const labelZoom = rootEl.querySelector("#labelZoom");

  const panZoom = createPanZoomController(panZoomContainer, {
    getState,
    onTransformChange: updateTransform,
  });

  function updateZoomHudUI() {
    const state = getState();
    if (labelZoom) {
      labelZoom.textContent = `${Math.round(state.zoom)}%`;
    }
    const viewSwitch = btnZoomFit?.closest(".view-switch");
    if (viewSwitch) {
      syncViewSwitch(viewSwitch, state.zoomMode, {
        fitBtn: btnZoomFit,
        oneToOneBtn: btnZoom100,
      });
    }
  }

  function updateHudButtons() {
    const state = getState();
    const hasIcon = state.batchQueue.length > 0;

    if (btnSurfaceMode) {
      const cardVisible = !state.surfaceMode;
      btnSurfaceMode.classList.remove("is-hidden");
      btnSurfaceMode.classList.toggle("active", cardVisible);
      btnSurfaceMode.setAttribute(
        "aria-pressed",
        cardVisible ? "true" : "false"
      );
    }

    if (btnDiffMode) {
      btnDiffMode.classList.toggle("is-hidden", !hasIcon);
      btnDiffMode.classList.toggle("active", state.artDiffMode);
      btnDiffMode.setAttribute(
        "aria-pressed",
        state.artDiffMode ? "true" : "false"
      );
    }

    if (artColorSegment) {
      artColorSegment.classList.toggle("is-hidden", !hasIcon);
      syncSegmentedButtons(
        colorModeButtons,
        state.artColorMode,
        "aria-checked"
      );
    }

    panZoomContainer?.classList.toggle(
      "inspection-mode",
      state.activeTab === "inspection"
    );
  }

  function updateTransform() {
    updateZoomHudUI();
    const state = getState();
    const displayIcons = getSelectedIconsForDisplay(state);
    const isMultiCompare = displayIcons.length >= 2;
    const scaledW = `${Math.round(state.width * (state.zoom / 100))}px`;
    const scaledH = `${Math.round(state.height * (state.zoom / 100))}px`;

    if (isMultiCompare) {
      for (const cell of stageContainer.querySelectorAll(".artboard-cell")) {
        cell.style.width = scaledW;
        cell.style.height = scaledH;
      }
    } else {
      const curMasterSvg = stageContainer.querySelector("#masterSvg");
      if (curMasterSvg) {
        curMasterSvg.style.width = scaledW;
        curMasterSvg.style.height = scaledH;
      }
    }

    canvasTransformGroup.style.transform = `translate3d(${Math.round(state.panX)}px, ${Math.round(state.panY)}px, 0)`;
  }

  function refreshQaOverlaysOnly() {
    const state = getState();
    const displayIcons = getSelectedIconsForDisplay(state);
    if (displayIcons.length >= 2) {
      const qaLayers = stageContainer.querySelectorAll(".layer-qa");
      let i = 0;
      for (const { icon } of displayIcons) {
        if (qaLayers[i]) {
          qaLayers[i].innerHTML = buildQaOverlayMarkup(icon, state);
        }
        i++;
      }
    } else {
      const qaGroup = stageContainer.querySelector("#layerQaOverlay");
      const curIcon = state.batchQueue[state.batchIndex];
      if (qaGroup) {
        qaGroup.innerHTML = curIcon ? buildQaOverlayMarkup(curIcon, state) : "";
      }
    }
  }

  function render() {
    const state = getState();
    const hasIcons = state.batchQueue.length > 0;
    viewportEmptyState?.classList.toggle(
      "is-hidden",
      hasIcons || isPromptDismissed
    );

    const W = state.width;
    const H = state.height;
    const P = state.padding;
    const liveW = Math.max(2, W - P * 2);
    const liveH = Math.max(2, H - P * 2);
    const c = CONTRAST_COLORS[state.theme] || CONTRAST_COLORS.light;

    updateHudButtons();

    const displayIcons = getSelectedIconsForDisplay(state);
    const isMultiCompare = displayIcons.length >= 2;
    const keylines = buildKeylinesSvgMarkup(state);
    const illustr = buildIllustrationGuidesMarkup(state);
    const grid = buildGridMarkup(state);
    const targetColor =
      state.artColorMode === "contrast" ? c.artContrast : c.artDefault;
    const blendClass = state.artDiffMode ? "art-xray" : "";
    const tfOpts = {
      artFitMode: state.artFitMode,
      artRotation: state.artRotation,
      artFlipH: state.artFlipH,
    };

    canvasTransformGroup.classList.toggle("surface-mode", state.surfaceMode);
    canvasTransformGroup.classList.toggle("is-multi-compare", isMultiCompare);

    if (isMultiCompare) {
      const cols = getCompareGridCols(displayIcons.length, state.compareCols);
      let galleryHtml = "";

      for (const { icon } of displayIcons) {
        const processedSvg = getColoredArtworkMarkup(
          icon,
          state.artColorMode,
          targetColor
        );
        const { transform } = getArtworkTransform(
          icon,
          W,
          H,
          P,
          liveW,
          liveH,
          tfOpts
        );
        const qa = buildQaOverlayMarkup(icon, state);
        const cellClass = state.surfaceMode
          ? "artboard-cell surface-mode"
          : "artboard-cell with-board";
        const tfAttr = transform ? ` transform="${transform}"` : "";

        galleryHtml += `
          <div class="stage-gallery-item">
            <div class="${cellClass}">
              <svg viewBox="0 0 ${W} ${H}" width="100%" height="100%" class="master-svg crisp-stroke" xmlns="http://www.w3.org/2000/svg">
                <g class="layer-grid">${grid}</g>
                <g class="layer-keylines">${keylines}</g>
                <g class="layer-illustration">${illustr}</g>
                <g class="layer-artwork">
                  <g class="${blendClass}"${tfAttr}>${processedSvg}</g>
                </g>
                <g class="layer-qa">${qa}</g>
              </svg>
            </div>
            <span class="stage-gallery-item__label font-mono truncate">${escapeHtml(icon.name)}</span>
          </div>
        `;
      }

      stageContainer.className = "stage-container stage-container--gallery";
      stageContainer.style.gridTemplateColumns = `repeat(${cols}, auto)`;
      stageContainer.innerHTML = galleryHtml;
    } else {
      stageContainer.className = "stage-container";
      stageContainer.style.gridTemplateColumns = "";

      let masterSvg = stageContainer.querySelector("#masterSvg");
      if (masterSvg) {
        masterSvg.setAttribute("viewBox", `0 0 ${W} ${H}`);
      } else {
        stageContainer.innerHTML = `
          <svg id="masterSvg" class="master-svg crisp-stroke" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}">
            <g id="layerGrid"></g>
            <g id="layerKeylines"></g>
            <g id="layerIllustrationGuides"></g>
            <g id="layerArtwork"></g>
            <g id="layerQaOverlay"></g>
          </svg>
        `;
        masterSvg = stageContainer.querySelector("#masterSvg");
      }

      const curLayerGrid = stageContainer.querySelector("#layerGrid");
      const curLayerKeylines = stageContainer.querySelector("#layerKeylines");
      const curLayerIllustr = stageContainer.querySelector(
        "#layerIllustrationGuides"
      );
      const curLayerArtwork = stageContainer.querySelector("#layerArtwork");
      const curLayerQa = stageContainer.querySelector("#layerQaOverlay");

      if (curLayerGrid) {
        curLayerGrid.innerHTML = grid;
      }
      if (curLayerKeylines) {
        curLayerKeylines.innerHTML = keylines;
      }
      if (curLayerIllustr) {
        curLayerIllustr.innerHTML = illustr;
      }

      const curIcon = state.batchQueue[state.batchIndex];
      if (curIcon && curLayerArtwork) {
        const processedSvg = getColoredArtworkMarkup(
          curIcon,
          state.artColorMode,
          targetColor
        );
        const { transform } = getArtworkTransform(
          curIcon,
          W,
          H,
          P,
          liveW,
          liveH,
          tfOpts
        );
        const tfAttr = transform ? ` transform="${transform}"` : "";

        curLayerArtwork.innerHTML = `
          <g id="custom-user-svg" class="${blendClass}"${tfAttr}>
            ${processedSvg}
          </g>
        `;
        if (curLayerQa) {
          curLayerQa.innerHTML = buildQaOverlayMarkup(curIcon, state);
        }
      } else {
        if (curLayerArtwork) {
          curLayerArtwork.innerHTML = "";
        }
        if (curLayerQa) {
          curLayerQa.innerHTML = "";
        }
      }
    }

    updateTransform();
  }

  // HUD event listeners
  btnZoomFit?.addEventListener(
    "click",
    () => {
      panZoom.fitToScreen(true);
      showToast?.("Zoom: Fit");
    },
    { signal }
  );

  btnZoom100?.addEventListener(
    "click",
    () => {
      panZoom.setZoom100(true);
      showToast?.("Zoom: 1:1");
    },
    { signal }
  );

  btnSurfaceMode?.addEventListener(
    "click",
    () => {
      const state = getState();
      state.surfaceMode = !state.surfaceMode;
      render();
      showToast?.(
        state.surfaceMode ? "Artboard Card: Hidden" : "Artboard Card: Visible"
      );
    },
    { signal }
  );

  btnDiffMode?.addEventListener(
    "click",
    () => {
      const state = getState();
      state.artDiffMode = !state.artDiffMode;
      render();
    },
    { signal }
  );

  for (const { el, value } of colorModeButtons) {
    el?.addEventListener(
      "click",
      () => {
        getState().artColorMode = value;
        render();
      },
      { signal }
    );
  }

  function destroy() {
    ac.abort();
    panZoom.destroy();
  }

  return {
    render,
    updateTransform,
    refreshQaOverlaysOnly,
    fitToScreen: panZoom.fitToScreen,
    setZoom100: panZoom.setZoom100,
    syncZoomOnDimensionChange: panZoom.syncZoomOnDimensionChange,
    dismissPrompt,
    resetPromptDismissed: () => {
      isPromptDismissed = false;
      render();
    },
    destroy,
  };
}
