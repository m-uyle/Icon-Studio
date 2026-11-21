import {
  getArtworkTransform,
  getColoredArtworkMarkup,
} from "../../../entities/icon/index.js";
import { syncSegmentedButtons } from "../../../shared/ui/index.js";

const SIZE_SLOTS = [
  { id: "sizeSlot16", size: 16 },
  { id: "sizeSlot20", size: 20 },
  { id: "sizeSlot24", size: 24 },
  { id: "sizeSlot32", size: 32 },
  { id: "sizeSlot48", size: 48 },
];

/**
 * Embedded Matrix Workspace Widget: Interactive Scale & Raster Loupe (16–48px),
 * Silhouette Squint Test, Production Surfaces (including Disabled 38%), and 4 In-Situ UI Contexts.
 */
export function initMatrixDashboard(rootEl, { getState }) {
  const ac = new AbortController();
  const { signal } = ac;

  const sizeScaleGround = rootEl.querySelector("#sizeScaleGround");
  const scaleCells = Array.from(
    rootEl.querySelectorAll(".matrix-scale-cell[data-loupe-size]")
  );
  const loupeCanvas = rootEl.querySelector("#matrixLoupeCanvas");
  const loupeTargetLabel = rootEl.querySelector("#matrixLoupeTargetLabel");
  const loupeFrame = loupeCanvas?.closest(".matrix-loupe-card__frame");
  const btnMatrixSquint = rootEl.querySelector("#btnMatrixSquint");

  const groundButtons = [
    { el: rootEl.querySelector("#btnSizeBgLight"), value: "light" },
    { el: rootEl.querySelector("#btnSizeBgDark"), value: "dark" },
    { el: rootEl.querySelector("#btnSizeBgCheckers"), value: "checkers" },
  ];

  let sizeScaleGroundMode = "light";
  let loupeTargetPx = 16;
  let squintMode = false;
  let loupeSeqId = 0;

  function applyGroundClass() {
    syncSegmentedButtons(groundButtons, sizeScaleGroundMode, "aria-checked");
    if (!sizeScaleGround) {
      return;
    }
    sizeScaleGround.classList.remove(
      "matrix-scale-ground--light",
      "matrix-scale-ground--dark",
      "bg-checkers"
    );
    if (sizeScaleGroundMode === "light") {
      sizeScaleGround.classList.add("matrix-scale-ground--light");
    } else if (sizeScaleGroundMode === "dark") {
      sizeScaleGround.classList.add("matrix-scale-ground--dark");
    } else {
      sizeScaleGround.classList.add("bg-checkers");
    }
    if (loupeFrame) {
      loupeFrame.classList.remove(
        "matrix-loupe-card__frame--light",
        "matrix-loupe-card__frame--dark"
      );
      if (sizeScaleGroundMode === "light") {
        loupeFrame.classList.add("matrix-loupe-card__frame--light");
      } else if (sizeScaleGroundMode === "dark") {
        loupeFrame.classList.add("matrix-loupe-card__frame--dark");
      }
    }
  }

  function syncLoupeSelectionUI() {
    scaleCells.forEach((cell) => {
      const sz = Number(cell.dataset.loupeSize);
      cell.classList.toggle("is-loupe-target", sz === loupeTargetPx);
      cell.setAttribute(
        "aria-pressed",
        sz === loupeTargetPx ? "true" : "false"
      );
    });
    if (loupeTargetLabel) {
      loupeTargetLabel.textContent = `${loupeTargetPx}px`;
    }
  }

  function setSizeScaleGround(mode) {
    sizeScaleGroundMode = mode;
    applyGroundClass();
    render();
  }

  groundButtons.forEach(({ el, value }) => {
    el?.addEventListener("click", () => setSizeScaleGround(value), { signal });
  });

  scaleCells.forEach((cell) => {
    cell.addEventListener(
      "click",
      () => {
        const nextSize = Number(cell.dataset.loupeSize);
        if (!Number.isFinite(nextSize) || nextSize === loupeTargetPx) {
          return;
        }
        loupeTargetPx = nextSize;
        syncLoupeSelectionUI();
        render();
      },
      { signal }
    );
  });

  btnMatrixSquint?.addEventListener(
    "click",
    () => {
      squintMode = !squintMode;
      btnMatrixSquint.classList.toggle("is-active", squintMode);
      btnMatrixSquint.setAttribute(
        "aria-pressed",
        squintMode ? "true" : "false"
      );
      rootEl.classList.toggle("is-squint-mode", squintMode);
    },
    { signal }
  );

  function buildSampleCircle(W, H, strokeColor) {
    const r = Math.min(W, H) / 3;
    return `<circle cx="${W / 2}" cy="${H / 2}" r="${r}" stroke="${strokeColor}" stroke-width="2" fill="none"/>`;
  }

  function renderLoupeCanvas(targetPx, W, H, inner, strokeCol, tfAttr) {
    if (!loupeCanvas) {
      return;
    }
    const token = ++loupeSeqId;
    // Strict integer scale factor per raster pixel so every cell is an exact 1:1 square
    const cellScale = Math.max(4, Math.ceil(160 / targetPx));
    const displaySize = targetPx * cellScale;

    loupeCanvas.width = displaySize;
    loupeCanvas.height = displaySize;

    const ctx = loupeCanvas.getContext("2d");
    if (!ctx) {
      return;
    }

    const offscreen = document.createElement("canvas");
    offscreen.width = targetPx;
    offscreen.height = targetPx;
    const offCtx = offscreen.getContext("2d");
    if (!offCtx) {
      return;
    }

    const svgString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${targetPx}" height="${targetPx}" preserveAspectRatio="xMidYMid meet">
      <g stroke="${strokeCol}" fill="none"${tfAttr}>${inner}</g>
    </svg>`;

    const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(url);
      if (token !== loupeSeqId) {
        return;
      }

      offCtx.clearRect(0, 0, targetPx, targetPx);
      offCtx.drawImage(img, 0, 0);

      // Paint exact integer cellScale x cellScale squares from raster ImageData (zero resampling drift)
      const imgData = offCtx.getImageData(0, 0, targetPx, targetPx).data;
      ctx.clearRect(0, 0, displaySize, displaySize);

      for (let y = 0; y < targetPx; y++) {
        for (let x = 0; x < targetPx; x++) {
          const idx = (y * targetPx + x) * 4;
          const a = imgData[idx + 3];
          if (a === 0) {
            continue;
          }
          ctx.fillStyle = `rgba(${imgData[idx]}, ${imgData[idx + 1]}, ${imgData[idx + 2]}, ${a / 255})`;
          ctx.fillRect(x * cellScale, y * cellScale, cellScale, cellScale);
        }
      }

      if (cellScale >= 5) {
        const isDark =
          sizeScaleGroundMode === "dark" ||
          (sizeScaleGroundMode === "checkers" && getState().theme === "dark");
        ctx.strokeStyle = isDark
          ? "rgba(255, 255, 255, 0.12)"
          : "rgba(0, 0, 0, 0.08)";
        ctx.lineWidth = 1;

        for (let i = 1; i < targetPx; i++) {
          const pos = i * cellScale + 0.5;
          ctx.beginPath();
          ctx.moveTo(pos, 0);
          ctx.lineTo(pos, displaySize);
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(0, pos);
          ctx.lineTo(displaySize, pos);
          ctx.stroke();
        }
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
    };

    img.src = url;
  }

  function renderSlot(el, size, W, H, curIcon, strokeColor, tfAttr) {
    if (!el) {
      return;
    }
    const inner = curIcon
      ? getColoredArtworkMarkup(curIcon, "contrast", strokeColor)
      : buildSampleCircle(W, H, strokeColor);
    el.innerHTML = `<svg viewBox="0 0 ${W} ${H}" width="${size}" height="${size}" preserveAspectRatio="xMidYMid meet" class="crisp-stroke matrix-svg-preview" stroke="${strokeColor}" fill="none"><g${tfAttr}>${inner}</g></svg>`;
  }

  function render() {
    applyGroundClass();
    syncLoupeSelectionUI();

    const state = getState();
    const curIcon = state.batchQueue[state.batchIndex];
    const W = state.width;
    const H = state.height;
    const P = state.padding;
    const liveW = Math.max(2, W - P * 2);
    const liveH = Math.max(2, H - P * 2);
    const isDarkTheme = state.theme === "dark";

    let tfAttr = "";
    if (curIcon) {
      const { transform } = getArtworkTransform(
        curIcon,
        W,
        H,
        P,
        liveW,
        liveH,
        {
          artFitMode: state.artFitMode,
          artRotation: state.artRotation,
          artFlipH: state.artFlipH,
        }
      );
      if (transform) {
        tfAttr = ` transform="${transform}"`;
      }
    }

    const defaultStroke = isDarkTheme ? "#F4F4F5" : "#18181B";
    const mutedStroke = isDarkTheme ? "#A1A1AA" : "#71717A";

    const scaleColor =
      sizeScaleGroundMode === "dark"
        ? "#F4F4F5"
        : sizeScaleGroundMode === "light"
          ? "#18181B"
          : defaultStroke;

    const scaleSvgInner = curIcon
      ? getColoredArtworkMarkup(curIcon, "contrast", scaleColor)
      : buildSampleCircle(W, H, scaleColor);

    SIZE_SLOTS.forEach(({ id, size }) => {
      const el = rootEl.querySelector(`#${id}`);
      if (el) {
        el.innerHTML = `<svg viewBox="0 0 ${W} ${H}" width="${size}" height="${size}" preserveAspectRatio="xMidYMid meet" class="crisp-stroke matrix-svg-preview" stroke="${scaleColor}" fill="none"><g${tfAttr}>${scaleSvgInner}</g></svg>`;
      }
    });

    renderLoupeCanvas(loupeTargetPx, W, H, scaleSvgInner, scaleColor, tfAttr);

    // 5 Production Surfaces (Light, Dark, Accent, Glass, Disabled 38%)
    const surfaceSlots = [
      { id: "surfSlotWhite", strokeColor: "#18181B" },
      { id: "surfSlotDark", strokeColor: "#F4F4F5" },
      { id: "surfSlotBrand", strokeColor: "#FFFFFF" },
      { id: "surfSlotGlass", strokeColor: defaultStroke },
      { id: "surfSlotDisabled", strokeColor: defaultStroke },
    ];
    surfaceSlots.forEach(({ id, strokeColor }) => {
      renderSlot(
        rootEl.querySelector(`#${id}`),
        24,
        W,
        H,
        curIcon,
        strokeColor,
        tfAttr
      );
    });

    // 4 Real UI Contexts
    const solidBtnIconColor = isDarkTheme ? "#18181B" : "#FFFFFF";
    renderSlot(
      rootEl.querySelector("#inSituButtonIcon"),
      16,
      W,
      H,
      curIcon,
      solidBtnIconColor,
      tfAttr
    );
    renderSlot(
      rootEl.querySelector("#inSituGhostIcon"),
      16,
      W,
      H,
      curIcon,
      defaultStroke,
      tfAttr
    );
    renderSlot(
      rootEl.querySelector("#inSituInputIcon"),
      16,
      W,
      H,
      curIcon,
      mutedStroke,
      tfAttr
    );
    renderSlot(
      rootEl.querySelector("#inSituTabIcon"),
      20,
      W,
      H,
      curIcon,
      defaultStroke,
      tfAttr
    );
    renderSlot(
      rootEl.querySelector("#inSituCircleIcon"),
      18,
      W,
      H,
      curIcon,
      defaultStroke,
      tfAttr
    );
    renderSlot(
      rootEl.querySelector("#inSituCircleSolidIcon"),
      18,
      W,
      H,
      curIcon,
      solidBtnIconColor,
      tfAttr
    );
    renderSlot(
      rootEl.querySelector("#inSituSquareIcon"),
      16,
      W,
      H,
      curIcon,
      defaultStroke,
      tfAttr
    );
    renderSlot(
      rootEl.querySelector("#inSituTagIcon"),
      14,
      W,
      H,
      curIcon,
      defaultStroke,
      tfAttr
    );
    renderSlot(
      rootEl.querySelector("#inSituBarIcon"),
      14,
      W,
      H,
      curIcon,
      defaultStroke,
      tfAttr
    );
  }

  function destroy() {
    ac.abort();
  }

  return { render, setSizeScaleGround, destroy };
}
