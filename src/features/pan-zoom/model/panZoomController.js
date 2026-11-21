import {
  getCompareGridCols,
  getSelectedIconsForDisplay,
} from "../../../entities/icon/index.js";

const COMPARE_COL_GAP = 20;
const COMPARE_ROW_GAP = 16;
const COMPARE_LABEL_H = 22;
const COMPARE_STAGE_PAD = 32;
const HUD_OFFSET_PX = 52;
const VIEWPORT_MARGIN_PX = 40;
const PAN_THRESHOLD_PX = 3;

/**
 * Pure zoom-to-fit calculation. Correctly subtracts fixed screen-pixel gaps & labels
 * BEFORE dividing by scalable SVG artboard dimensions (fixes multi-compare zoom bug).
 */
function computeFitZoom({
  containerW,
  containerH,
  width,
  height,
  iconCount,
  compareCols = "auto",
}) {
  const usableW = containerW - VIEWPORT_MARGIN_PX;
  const usableH = containerH - VIEWPORT_MARGIN_PX - HUD_OFFSET_PX;
  if (usableW <= 0 || usableH <= 0 || width <= 0 || height <= 0) {
    return { zoom: 100, panX: 0, panY: -Math.round(HUD_OFFSET_PX / 2) };
  }

  const count = Math.max(1, iconCount);
  let zoom;

  if (count >= 2) {
    const cols = getCompareGridCols(count, compareCols);
    const rows = Math.ceil(count / cols);
    const availW = Math.max(
      24,
      usableW - COMPARE_STAGE_PAD - (cols - 1) * COMPARE_COL_GAP
    );
    const availH = Math.max(
      24,
      usableH -
        COMPARE_STAGE_PAD -
        (rows - 1) * COMPARE_ROW_GAP -
        rows * COMPARE_LABEL_H
    );
    zoom = Math.max(
      25,
      Math.min(
        (availW / (cols * width)) * 100,
        (availH / (rows * height)) * 100,
        3200
      )
    );
  } else {
    zoom = Math.max(
      25,
      Math.min((usableW / width) * 100, (usableH / height) * 100, 3200)
    );
  }

  return {
    zoom,
    panX: 0,
    panY: -Math.round(HUD_OFFSET_PX / 2),
  };
}

/**
 * Attaches wheel zoom + pointer drag pan to panZoomContainer.
 */
export function createPanZoomController(
  containerEl,
  { getState, onTransformChange }
) {
  const ac = new AbortController();
  const { signal } = ac;

  let panPending = false;
  let panPointerStartX = 0;
  let panPointerStartY = 0;

  containerEl.addEventListener(
    "wheel",
    (e) => {
      e.preventDefault();
      const state = getState();
      const delta = e.deltaY < 0 ? 1.2 : 0.833;
      const oldZoom = state.zoom;
      const newZoom = Math.max(25, Math.min(6400, Math.round(oldZoom * delta)));
      if (newZoom === oldZoom) {
        return;
      }

      state.zoomMode = "manual";
      const rect = containerEl.getBoundingClientRect();
      const mouseX = e.clientX - rect.left - rect.width / 2;
      const mouseY = e.clientY - rect.top - rect.height / 2;

      state.panX = mouseX - (mouseX - state.panX) * (newZoom / oldZoom);
      state.panY = mouseY - (mouseY - state.panY) * (newZoom / oldZoom);
      state.zoom = newZoom;
      onTransformChange();
    },
    { passive: false, signal }
  );

  containerEl.addEventListener(
    "pointerdown",
    (e) => {
      if (
        e.target.closest(".view-switch-btn") ||
        e.target.closest(".inspect-btn") ||
        e.target.closest(".floating-hud-pill")
      ) {
        return;
      }
      const state = getState();
      if (
        e.button === 0 ||
        e.button === 1 ||
        e.pointerType === "touch" ||
        state.isSpaceDown
      ) {
        panPending = true;
        panPointerStartX = e.clientX;
        panPointerStartY = e.clientY;
        state.startPanX = e.clientX - state.panX;
        state.startPanY = e.clientY - state.panY;
      }
    },
    { signal }
  );

  containerEl.addEventListener(
    "pointermove",
    (e) => {
      const state = getState();
      if (panPending && !state.isPanning) {
        const dist = Math.hypot(
          e.clientX - panPointerStartX,
          e.clientY - panPointerStartY
        );
        if (dist >= PAN_THRESHOLD_PX || state.isSpaceDown) {
          state.isPanning = true;
          containerEl.classList.add("is-grabbing");
          try {
            containerEl.setPointerCapture(e.pointerId);
          } catch {}
        }
      }
      if (state.isPanning) {
        state.panX = e.clientX - state.startPanX;
        state.panY = e.clientY - state.startPanY;
        onTransformChange();
      }
    },
    { signal }
  );

  const stopPan = () => {
    panPending = false;
    const state = getState();
    if (state.isPanning) {
      state.isPanning = false;
      containerEl.classList.remove("is-grabbing");
    }
  };

  containerEl.addEventListener("pointerup", stopPan, { signal });
  containerEl.addEventListener("pointercancel", stopPan, { signal });
  window.addEventListener("pointerup", stopPan, { signal });
  window.addEventListener(
    "blur",
    () => {
      const state = getState();
      state.isSpaceDown = false;
      stopPan();
    },
    { signal }
  );

  function fitToScreen(lockMode = true) {
    const state = getState();
    if (lockMode) {
      state.zoomMode = "fit";
    }
    const displayIcons = getSelectedIconsForDisplay(state);
    const { zoom, panX, panY } = computeFitZoom({
      containerW: containerEl.clientWidth,
      containerH: containerEl.clientHeight,
      width: state.width,
      height: state.height,
      iconCount: displayIcons.length,
      compareCols: state.compareCols,
    });
    state.zoom = zoom;
    state.panX = panX;
    state.panY = panY;
    onTransformChange();
  }

  function setZoom100(lockMode = true) {
    const state = getState();
    if (lockMode) {
      state.zoomMode = "1:1";
    }
    state.zoom = 100;
    state.panX = 0;
    state.panY = -Math.round(HUD_OFFSET_PX / 2);
    onTransformChange();
  }

  function syncZoomOnDimensionChange() {
    const state = getState();
    if (state.zoomMode === "fit") {
      fitToScreen(false);
    } else if (state.zoomMode === "1:1") {
      setZoom100(false);
    } else {
      onTransformChange();
    }
  }

  function destroy() {
    ac.abort();
  }

  return { fitToScreen, setZoom100, syncZoomOnDimensionChange, destroy };
}
