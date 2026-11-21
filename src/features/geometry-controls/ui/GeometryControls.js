import { getScrubberBounds, PRESETS } from "../../../entities/grid/index.js";
import { OpticalAnalyzer } from "../../../entities/icon/index.js";
import {
  bindDimensionScrubber,
  bindPrecisionScrubber,
  createDropdown,
} from "../../../shared/ui/index.js";

const PRESET_OPTIONS = [
  {
    group: "UI Icons",
    items: [
      {
        value: "figma",
        label: "UI Standard",
        shortLabel: "UI Standard",
        meta: "24×24",
      },
      {
        value: "apple",
        label: "Apple SF",
        shortLabel: "Apple SF",
        meta: "24×24, r3",
      },
      {
        value: "carbon16",
        label: "Compact 16",
        shortLabel: "Compact 16",
        meta: "16×16",
      },
      {
        value: "carbon32",
        label: "Medium 32",
        shortLabel: "Medium 32",
        meta: "32×32",
      },
      {
        value: "android48",
        label: "Large 48",
        shortLabel: "Large 48",
        meta: "48×48",
      },
    ],
  },
  {
    group: "Micro-Illustrations & App Icons",
    items: [
      {
        value: "spotIllustration",
        label: "Spot 4:3",
        shortLabel: "Spot 4:3",
        meta: "80×60",
      },
      {
        value: "featureCard64",
        label: "Feature 64",
        shortLabel: "Feature 64",
        meta: "64×64",
      },
      {
        value: "avatarBadge32",
        label: "Avatar & Badge",
        shortLabel: "Avatar 32",
        meta: "32×32",
      },
      {
        value: "appSquircle64",
        label: "App Squircle",
        shortLabel: "Squircle 64",
        meta: "64×64",
      },
      {
        value: "bannerWide",
        label: "Wide Banner",
        shortLabel: "Banner 16:9",
        meta: "160×90",
      },
      {
        value: "macos",
        label: "macOS Icon",
        shortLabel: "macOS 512",
        meta: "512×512",
      },
    ],
  },
  { value: "custom", label: "Custom", shortLabel: "Custom" },
];

/**
 * Controller for Canvas & Geometry controls (Design-System Preset Dropdown,
 * W/H dim scrubbers, Aspect Lock, Quick Sizes, Ratios with double-click flip,
 * Safe Margin & Keyline Radius scrubbers).
 */
export function initGeometryControls(
  rootEl,
  { getState, onGeometryChange, onPresetApplied, showToast }
) {
  const ac = new AbortController();
  const { signal } = ac;

  const presetHost = rootEl.querySelector("#presetDropdown");
  const btnLinkAspect = rootEl.querySelector("#btnLinkAspect");
  const iconAspectLinked = rootEl.querySelector("#iconAspectLinked");
  const iconAspectUnlinked = rootEl.querySelector("#iconAspectUnlinked");

  const padScrubberEl = rootEl.querySelector(
    '.precision-scrubber[data-id="padding"]'
  );
  const radScrubberEl = rootEl.querySelector(
    '.precision-scrubber[data-id="radius"]'
  );
  const widthScrubberEl = rootEl.querySelector(
    '.dim-scrubber[data-dim="width"]'
  );
  const heightScrubberEl = rootEl.querySelector(
    '.dim-scrubber[data-dim="height"]'
  );

  function clampScrubbers() {
    const state = getState();
    const padBounds = getScrubberBounds(
      "padding",
      state.width,
      state.height,
      state.padding
    );
    state.padding = Math.max(
      padBounds.min,
      Math.min(padBounds.max, state.padding)
    );

    const radBounds = getScrubberBounds(
      "radius",
      state.width,
      state.height,
      state.padding
    );
    state.radius = Math.max(
      radBounds.min,
      Math.min(radBounds.max, state.radius)
    );
  }

  function applyPreset(key) {
    const p = PRESETS[key];
    if (!p) {
      return;
    }
    const state = getState();
    state.width = p.width;
    state.height = p.height;
    state.padding = p.padding;
    state.radius = p.radius;
    state.showIllustrationSpecial = Boolean(p.special);

    clampScrubbers();
    OpticalAnalyzer.clearCache();
    sync();
    onPresetApplied(key);
    const matchedOpt = PRESET_OPTIONS.flatMap((g) =>
      g.items ? g.items : [g]
    ).find((o) => o.value === key);
    showToast(`Preset: ${matchedOpt?.label || key}`);
  }

  const presetDropdown = createDropdown(presetHost, {
    options: PRESET_OPTIONS,
    value: "figma",
    ariaLabel: "System Icon & Illustration Presets",
    menuWidth: 252,
    signal,
    onChange: (val) => applyPreset(val),
  });

  function setScrubberValue(id, rawVal) {
    const state = getState();
    const bounds = getScrubberBounds(
      id,
      state.width,
      state.height,
      state.padding
    );
    let clamped = Math.max(bounds.min, Math.min(bounds.max, rawVal));
    clamped = Math.round(clamped / bounds.step) * bounds.step;
    state[id] = Number.parseFloat(clamped.toFixed(bounds.decimals));

    if (id === "padding") {
      const radBounds = getScrubberBounds(
        "radius",
        state.width,
        state.height,
        state.padding
      );
      if (state.radius > radBounds.max) {
        state.radius = radBounds.max;
      }
    }

    OpticalAnalyzer.clearCache();
    sync();
    onGeometryChange(false);
  }

  const padScrubber = padScrubberEl
    ? bindPrecisionScrubber(padScrubberEl, {
        getValue: () => getState().padding,
        getBounds: () => {
          const s = getState();
          return getScrubberBounds("padding", s.width, s.height, s.padding);
        },
        onChange: (val) => setScrubberValue("padding", val),
      })
    : null;

  const radScrubber = radScrubberEl
    ? bindPrecisionScrubber(radScrubberEl, {
        getValue: () => getState().radius,
        getBounds: () => {
          const s = getState();
          return getScrubberBounds("radius", s.width, s.height, s.padding);
        },
        onChange: (val) => setScrubberValue("radius", val),
      })
    : null;

  const triggerDimChange = () => {
    presetDropdown.setValue("custom");
    clampScrubbers();
    OpticalAnalyzer.clearCache();
    sync();
    onGeometryChange(true);
  };

  const widthScrubber = widthScrubberEl
    ? bindDimensionScrubber(widthScrubberEl, {
        getValue: () => getState().width,
        onDragStart: () => {
          const s = getState();
          return { value: s.width, startW: s.width, startH: s.height };
        },
        onChange: (newW, snap) => {
          const s = getState();
          if (newW === s.width && snap) {
            return;
          }
          const baseW = snap ? snap.startW : s.width;
          const baseH = snap ? snap.startH : s.height;
          s.width = newW;
          if (s.aspectLocked && baseW > 0) {
            s.height = Math.max(
              8,
              Math.min(1024, Math.round((baseH / baseW) * newW))
            );
          }
          triggerDimChange();
        },
      })
    : null;

  const heightScrubber = heightScrubberEl
    ? bindDimensionScrubber(heightScrubberEl, {
        getValue: () => getState().height,
        onDragStart: () => {
          const s = getState();
          return { value: s.height, startW: s.width, startH: s.height };
        },
        onChange: (newH, snap) => {
          const s = getState();
          if (newH === s.height && snap) {
            return;
          }
          const baseW = snap ? snap.startW : s.width;
          const baseH = snap ? snap.startH : s.height;
          s.height = newH;
          if (s.aspectLocked && baseH > 0) {
            s.width = Math.max(
              8,
              Math.min(1024, Math.round((baseW / baseH) * newH))
            );
          }
          triggerDimChange();
        },
      })
    : null;

  btnLinkAspect?.addEventListener(
    "click",
    () => {
      const state = getState();
      state.aspectLocked = !state.aspectLocked;
      sync();
      showToast(
        state.aspectLocked ? "Aspect ratio locked" : "Aspect ratio unlinked"
      );
    },
    { signal }
  );

  rootEl.querySelectorAll(".btn-quick-size").forEach((btn) => {
    btn.addEventListener(
      "click",
      () => {
        const sz = Number.parseInt(btn.dataset.size, 10);
        const state = getState();
        state.width = sz;
        state.height = sz;
        triggerDimChange();
      },
      { signal }
    );
  });

  rootEl.querySelectorAll(".btn-quick-ratio").forEach((btn) => {
    btn.addEventListener(
      "click",
      () => {
        const r = btn.dataset.ratio;
        const state = getState();
        const curMin = Math.min(state.width, state.height);
        const clampDim = (v) => Math.max(8, Math.min(1024, Math.round(v)));
        if (r === "1:1") {
          state.width = clampDim(curMin);
          state.height = clampDim(curMin);
        } else if (r === "4:3") {
          const w = clampDim(curMin * (4 / 3));
          state.width = w;
          state.height = clampDim(w * (3 / 4));
        } else if (r === "16:9") {
          const w = clampDim(curMin * (16 / 9));
          state.width = w;
          state.height = clampDim(w * (9 / 16));
        }
        triggerDimChange();
      },
      { signal }
    );

    btn.addEventListener(
      "dblclick",
      (e) => {
        e.preventDefault();
        const state = getState();
        const temp = state.width;
        state.width = state.height;
        state.height = temp;
        triggerDimChange();
        showToast(`Flipped: ${state.width} × ${state.height}`);
      },
      { signal }
    );
  });

  function sync() {
    const state = getState();
    clampScrubbers();
    widthScrubber?.sync();
    heightScrubber?.sync();
    padScrubber?.sync();
    radScrubber?.sync();

    if (iconAspectLinked && iconAspectUnlinked && btnLinkAspect) {
      iconAspectLinked.classList.toggle("is-hidden", !state.aspectLocked);
      iconAspectUnlinked.classList.toggle("is-hidden", state.aspectLocked);
      btnLinkAspect.classList.toggle("is-unlinked", !state.aspectLocked);
      btnLinkAspect.setAttribute(
        "aria-pressed",
        state.aspectLocked ? "true" : "false"
      );
    }

    rootEl.querySelectorAll(".btn-quick-size").forEach((btn) => {
      const sz = Number.parseInt(btn.dataset.size, 10);
      btn.classList.toggle(
        "geometry-active",
        state.width === sz && state.height === sz
      );
    });

    rootEl.querySelectorAll(".btn-quick-ratio").forEach((btn) => {
      const r = btn.dataset.ratio;
      let match = false;
      let isPortrait = false;
      if (r === "1:1") {
        match = state.width === state.height;
        btn.textContent = "1:1";
        btn.setAttribute("data-tooltip", "Square (1:1)");
      } else if (r === "4:3") {
        const isL = Math.abs(state.width / state.height - 4 / 3) < 0.05;
        const isP = Math.abs(state.width / state.height - 3 / 4) < 0.05;
        match = isL || isP;
        isPortrait = isP;
        btn.textContent = isPortrait ? "3:4" : "4:3";
        btn.setAttribute(
          "data-tooltip",
          isPortrait
            ? "Portrait 3:4 (Double-click to flip)"
            : "Landscape 4:3 (Double-click to flip)"
        );
      } else if (r === "16:9") {
        const isL = Math.abs(state.width / state.height - 16 / 9) < 0.05;
        const isP = Math.abs(state.width / state.height - 9 / 16) < 0.05;
        match = isL || isP;
        isPortrait = isP;
        btn.textContent = isPortrait ? "9:16" : "16:9";
        btn.setAttribute(
          "data-tooltip",
          isPortrait
            ? "Portrait 9:16 (Double-click to flip)"
            : "Landscape 16:9 (Double-click to flip)"
        );
      }
      btn.classList.toggle("geometry-active", match);
    });
  }

  function setPresetValue(val) {
    presetDropdown.setValue(val);
  }

  function destroy() {
    ac.abort();
    presetDropdown.destroy();
  }

  return { sync, setPresetValue, applyPreset, destroy };
}
