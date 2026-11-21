/**
 * Centralized reactive application store with selective subscriptions.
 */

function createInitialState() {
  return {
    theme: "light",
    workspaceView: "canvas",
    activeTab: "grid",
    width: 24,
    height: 24,
    aspectLocked: true,
    padding: 2.0,
    radius: 2.0,

    surfaceMode: false,
    qaOverlay: false,

    // Guide Layers (13)
    showCircle: true,
    showSquare: true,
    showSafeZone: true,
    showAxes: true,
    showRectH: false,
    showRectV: false,
    showHarmonicPrimitives: false,
    showConcentric: false,
    showRays3060: false,
    showThirds: false,
    showDiagonals: false,
    showPixelGrid: false,
    showIllustrationSpecial: false,

    // QA & Bounds Layers (7)
    qaShowSubpixel: true,
    qaShowOpticalBounds: true,
    qaShowOpticalCenter: true,
    qaShowBleed: true,
    qaLayersCustomized: false,

    artFitMode: "canvas",
    artDiffMode: false,
    artColorMode: "theme",
    exportTarget: "guides",
    exportCodeFormat: "figma",

    batchQueue: [],
    batchIndex: 0,
    selectedCompareIndices: new Set(),
    compareCols: "auto",
    artRotation: 0,
    artFlipH: false,

    zoomMode: "fit",
    zoom: 1600,
    panX: 0,
    panY: 0,
    isPanning: false,
    startPanX: 0,
    startPanY: 0,
    isSpaceDown: false,
  };
}

export function createAppStore() {
  const state = createInitialState();
  const listeners = new Set();

  function getState() {
    return state;
  }

  function subscribe(listener, filter) {
    const filterSet = filter
      ? new Set(Array.isArray(filter) ? filter : [filter])
      : null;

    const wrapped = (changedKeys) => {
      if (filterSet && changedKeys.length > 0) {
        const hasMatch = changedKeys.some((k) => filterSet.has(k));
        if (!hasMatch) {
          return;
        }
      }
      listener(state, changedKeys);
    };

    listeners.add(wrapped);
    return () => listeners.delete(wrapped);
  }

  function setState(updates) {
    const diff = typeof updates === "function" ? updates(state) : updates;
    if (!diff || typeof diff !== "object") {
      return;
    }
    const changedKeys = [];
    for (const [k, v] of Object.entries(diff)) {
      if (state[k] !== v) {
        state[k] = v;
        changedKeys.push(k);
      }
    }
    if (changedKeys.length > 0) {
      listeners.forEach((fn) => fn(changedKeys));
    }
  }

  function notify(keys = []) {
    const changedKeys = Array.isArray(keys) ? keys : [keys];
    listeners.forEach((fn) => fn(changedKeys));
  }

  function resetSettings() {
    const fresh = createInitialState();
    // Preserve loaded batchQueue, batchIndex, selectedCompareIndices, and theme
    const keepTheme = state.theme;
    const keepQueue = state.batchQueue;
    const keepIndex = state.batchIndex;
    const keepCompare = state.selectedCompareIndices;

    const changedKeys = Object.keys(fresh);
    Object.assign(state, fresh);
    state.theme = keepTheme;
    state.batchQueue = keepQueue;
    state.batchIndex = keepIndex;
    state.selectedCompareIndices = keepCompare;
    state.compareCols = "auto";
    state.exportTarget = state.batchQueue.length > 0 ? "clean" : "guides";

    listeners.forEach((fn) => fn(changedKeys));
  }

  return { getState, setState, subscribe, notify, resetSettings };
}
