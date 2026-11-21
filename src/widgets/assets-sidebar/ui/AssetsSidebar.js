import {
  getCompareGridCols,
  getSelectedIconsForDisplay,
  OpticalAnalyzer,
} from "../../../entities/icon/index.js";
import {
  parseSvgToIconItem,
  readSvgFiles,
} from "../../../features/batch-import/index.js";
import {
  createBatchZipPackage,
  FORMAT_META,
  generateDeveloperCode,
  getSingleDownloadSpec,
} from "../../../features/production-export/index.js";
import {
  copyToClipboard,
  escapeHtml,
  triggerBlobDownload,
} from "../../../shared/lib/index.js";
import { syncSegmentedButtons } from "../../../shared/ui/index.js";

const REMOVE_ICON_SVG =
  '<svg class="batch-item__remove-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>';

/**
 * Left Panel Widget: Laconic Assets Queue (Input) & Production Export (Output)
 * with progressive disclosure for multi-icon compare and disabled empty-queue ZIP state.
 */
export function initAssetsSidebar(
  rootEl,
  {
    getState,
    onBatchChanged,
    onFitModeChanged,
    onTransformArtwork,
    onCompareChanged,
    showToast,
  }
) {
  const ac = new AbortController();
  const { signal } = ac;

  const dropZone = rootEl.querySelector("#dropZone");
  const dropTextLabel = rootEl.querySelector("#dropTextLabel");
  const fileInput = rootEl.querySelector("#fileInput");
  const btnClearSvg = rootEl.querySelector("#btnClearSvg");
  const assetsCountBadge = rootEl.querySelector("#assetsCountBadge");

  const artworkToolbar = rootEl.querySelector("#artworkToolbar");
  const btnFitCanvas = rootEl.querySelector("#btnFitCanvas");
  const btnFitSafe = rootEl.querySelector("#btnFitSafe");
  const btnGridCols = rootEl.querySelector("#btnGridCols");
  const btnRotateArtwork = rootEl.querySelector("#btnRotateArtwork");
  const btnFlipArtwork = rootEl.querySelector("#btnFlipArtwork");

  const batchListCol = rootEl.querySelector("#batchListCol");
  const batchListHeader = rootEl.querySelector("#batchListHeader");
  const batchItemsList = rootEl.querySelector("#batchItemsList");
  const batchCompareActions = rootEl.querySelector("#batchCompareActions");
  const btnCompareAll = rootEl.querySelector("#btnCompareAll");
  const btnCompareReset = rootEl.querySelector("#btnCompareReset");

  const expTargetButtons = [
    { el: rootEl.querySelector("#expTargetGuides"), value: "guides" },
    { el: rootEl.querySelector("#expTargetClean"), value: "clean" },
    { el: rootEl.querySelector("#expTargetComposite"), value: "composite" },
  ];
  const fitModeButtons = [
    { el: btnFitCanvas, value: "canvas" },
    { el: btnFitSafe, value: "safe" },
  ];

  const expFormatButtons = [
    { el: rootEl.querySelector("#expFmtFigma"), value: "figma" },
    { el: rootEl.querySelector("#expFmtReact"), value: "react" },
    { el: rootEl.querySelector("#expFmtAndroid"), value: "androidXml" },
  ];
  const exportTargetRow = rootEl.querySelector("#exportTargetRow");
  const btnCopyDevCode = rootEl.querySelector("#btnCopyDevCode");
  const btnCopyDevCodeLabel = rootEl.querySelector("#btnCopyDevCodeLabel");
  const btnDownloadSingle = rootEl.querySelector("#btnDownloadSingle");
  const btnDownloadSingleLabel = rootEl.querySelector(
    "#btnDownloadSingleLabel"
  );
  const iconDownloadFile = rootEl.querySelector("#iconDownloadFile");
  const iconDownloadZip = rootEl.querySelector("#iconDownloadZip");

  function appendSvgString(raw, filename, shouldNotify = true) {
    const state = getState();
    const item = parseSvgToIconItem(raw, filename, state.width, state.height);
    if (!item) {
      if (shouldNotify) {
        showToast("Invalid SVG content");
      }
      return false;
    }
    const wasEmpty = state.batchQueue.length === 0;
    state.batchQueue.push(item);
    if (shouldNotify) {
      if (wasEmpty && state.exportTarget === "guides") {
        state.exportTarget = "clean";
      }
      state.batchIndex = state.batchQueue.length - 1;
      syncBatchUI();
      onBatchChanged(true);
    }
    return true;
  }

  async function handleIncomingFiles(files) {
    const items = await readSvgFiles(files);
    if (!items.length) {
      return;
    }
    const prevLen = getState().batchQueue.length;
    let added = 0;
    items.forEach((item) => {
      if (appendSvgString(item.raw, item.name, false)) {
        added++;
      }
    });
    if (added > 0) {
      const state = getState();
      if (prevLen === 0 && state.exportTarget === "guides") {
        state.exportTarget = "clean";
      }
      state.batchIndex = prevLen;
      syncBatchUI();
      onBatchChanged(true);
    } else {
      showToast("No valid SVG files found");
    }
  }

  function switchBatchIndex(newIdx) {
    const state = getState();
    if (!state.batchQueue.length) {
      return;
    }
    let target = newIdx;
    if (target < 0) {
      target = state.batchQueue.length - 1;
    }
    if (target >= state.batchQueue.length) {
      target = 0;
    }
    state.batchIndex = target;
    state.artRotation = 0;
    state.artFlipH = false;
    syncBatchUI();
    onBatchChanged(false);
  }

  function removeIconFromBatch(idx) {
    const state = getState();
    if (idx < 0 || idx >= state.batchQueue.length) {
      return;
    }
    const wasMulti = state.selectedCompareIndices.size >= 2;
    state.batchQueue.splice(idx, 1);

    const nextSet = new Set();
    state.selectedCompareIndices.forEach((i) => {
      if (i < idx) {
        nextSet.add(i);
      } else if (i > idx) {
        nextSet.add(i - 1);
      }
    });
    state.selectedCompareIndices = nextSet;

    if (state.batchIndex >= state.batchQueue.length) {
      state.batchIndex = Math.max(0, state.batchQueue.length - 1);
    }
    syncBatchUI();
    const isNowMulti = state.selectedCompareIndices.size >= 2;
    onBatchChanged(wasMulti !== isNowMulti);
  }

  function syncBatchUI() {
    const state = getState();
    const total = state.batchQueue.length;
    const hasItems = total > 0;
    const canCompare = total >= 2;

    dropZone?.classList.toggle("is-compact", hasItems);
    if (dropTextLabel) {
      dropTextLabel.textContent = hasItems
        ? "Add SVGs (or Paste)"
        : "Drop, Select or Paste SVGs";
    }

    artworkToolbar?.classList.toggle("is-hidden", !hasItems);
    batchListCol?.classList.toggle("is-hidden", !hasItems);
    btnClearSvg?.classList.toggle("is-hidden", !hasItems);
    batchListHeader?.classList.toggle("is-hidden", !canCompare);
    batchCompareActions?.classList.toggle("is-hidden", !canCompare);

    const compareCount = state.selectedCompareIndices.size;
    const isComparing = compareCount >= 2;

    if (assetsCountBadge) {
      if (!hasItems) {
        assetsCountBadge.textContent = "";
      } else if (isComparing) {
        assetsCountBadge.textContent = `${compareCount} / ${total} compared`;
      } else {
        assetsCountBadge.textContent = `${state.batchIndex + 1} / ${total}`;
      }
      assetsCountBadge.classList.toggle("is-hidden", !hasItems);
      assetsCountBadge.classList.toggle("is-comparing", isComparing);
    }

    if (btnGridCols) {
      btnGridCols.classList.toggle("is-hidden", !isComparing);
      if (isComparing) {
        const cols = getCompareGridCols(compareCount, state.compareCols);
        const rows = Math.ceil(compareCount / cols);
        btnGridCols.textContent =
          state.compareCols === "auto"
            ? `Auto ${cols}×${rows}`
            : `${cols}×${rows}`;
        btnGridCols.classList.toggle("is-active", state.compareCols !== "auto");
      }
    }

    if (!hasItems && state.exportTarget !== "guides") {
      state.exportTarget = "guides";
    }

    syncExportControls();

    if (hasItems && batchItemsList) {
      batchItemsList.innerHTML = "";
      state.batchQueue.forEach((item, idx) => {
        const isActive = idx === state.batchIndex;
        const isCompared = state.selectedCompareIndices.has(idx);

        const itemEl = document.createElement("div");
        itemEl.className = `batch-item${isActive ? " is-active" : ""}`;
        const checkboxHtml = canCompare
          ? `<input type="checkbox" class="chk-compare-icon" data-index="${idx}" aria-label="Compare ${escapeHtml(item.name)}" ${isCompared ? "checked" : ""}>`
          : "";
        itemEl.innerHTML = `
          <div class="batch-item__lead">
            ${checkboxHtml}
            <span class="batch-item__num tnum">${(idx + 1).toString().padStart(2, "0")}</span>
            <span class="batch-item__name truncate">${escapeHtml(item.name)}</span>
          </div>
          <button type="button" class="batch-item__remove" aria-label="Remove ${escapeHtml(item.name)}" data-tooltip="Remove icon (Delete)">${REMOVE_ICON_SVG}</button>
        `;

        const chk = itemEl.querySelector(".chk-compare-icon");
        if (chk) {
          chk.addEventListener("click", (e) => e.stopPropagation());
          chk.addEventListener("change", (e) => {
            if (e.target.checked) {
              state.selectedCompareIndices.add(idx);
            } else {
              state.selectedCompareIndices.delete(idx);
            }
            syncBatchUI();
            onCompareChanged();
          });
        }

        itemEl.addEventListener("click", () => switchBatchIndex(idx));
        itemEl
          .querySelector(".batch-item__remove")
          .addEventListener("click", (e) => {
            e.stopPropagation();
            removeIconFromBatch(idx);
          });

        batchItemsList.appendChild(itemEl);
      });
      batchItemsList
        .querySelector(".batch-item.is-active")
        ?.scrollIntoView({ block: "nearest" });
    } else {
      if (batchItemsList) {
        batchItemsList.innerHTML = "";
      }
      state.selectedCompareIndices.clear();
    }
  }

  function syncFitMode() {
    syncSegmentedButtons(fitModeButtons, getState().artFitMode, "aria-checked");
  }

  function syncExportControls() {
    const state = getState();
    const hasItems = state.batchQueue.length > 0;
    if (!hasItems && state.exportCodeFormat !== "figma") {
      state.exportCodeFormat = "figma";
    }
    const isSvg = state.exportCodeFormat === "figma";
    const meta = FORMAT_META[state.exportCodeFormat] || FORMAT_META.figma;

    expFormatButtons.forEach(({ el, value }) => {
      if (!el || value === "figma") {
        return;
      }
      el.disabled = !hasItems;
      el.setAttribute(
        "data-tooltip",
        hasItems
          ? value === "react"
            ? "React JSX Component"
            : "Android Vector XML"
          : value === "react"
            ? "Import an SVG to export React JSX"
            : "Import an SVG to export Android XML"
      );
    });

    exportTargetRow?.classList.toggle("is-hidden", !(hasItems && isSvg));
    syncSegmentedButtons(
      expFormatButtons,
      state.exportCodeFormat,
      "aria-checked"
    );
    syncSegmentedButtons(expTargetButtons, state.exportTarget, "aria-checked");

    if (btnCopyDevCodeLabel) {
      if (!hasItems && isSvg) {
        btnCopyDevCodeLabel.textContent = "Copy Grid SVG";
      } else {
        btnCopyDevCodeLabel.textContent = meta.copyLabel || "Copy Code";
      }
    }
    const selectedCount = state.selectedCompareIndices.size;
    const isZipMode = selectedCount >= 2;
    iconDownloadFile?.classList.toggle("is-hidden", isZipMode);
    iconDownloadZip?.classList.toggle("is-hidden", !isZipMode);

    if (btnDownloadSingleLabel) {
      btnDownloadSingleLabel.textContent = isZipMode
        ? `Download ZIP (${selectedCount})`
        : `Download .${meta.ext}`;
    }
    if (btnDownloadSingle) {
      if (isZipMode) {
        const tip =
          state.exportCodeFormat === "androidXml"
            ? `Export ${selectedCount} selected Android XML files as ZIP`
            : `Export ${selectedCount} selected .${meta.ext} files + index.ts as ZIP`;
        btnDownloadSingle.setAttribute("data-tooltip", tip);
      } else if (state.batchQueue.length >= 2) {
        btnDownloadSingle.setAttribute(
          "data-tooltip",
          `Download active .${meta.ext} (select 2+ checkboxes for ZIP)`
        );
      } else {
        btnDownloadSingle.removeAttribute("data-tooltip");
      }
    }
  }

  btnFitCanvas?.addEventListener(
    "click",
    () => {
      getState().artFitMode = "canvas";
      OpticalAnalyzer.clearCache();
      syncFitMode();
      onFitModeChanged();
    },
    { signal }
  );

  btnFitSafe?.addEventListener(
    "click",
    () => {
      getState().artFitMode = "safe";
      OpticalAnalyzer.clearCache();
      syncFitMode();
      onFitModeChanged();
    },
    { signal }
  );

  dropZone?.addEventListener("click", () => fileInput?.click(), { signal });
  dropZone?.addEventListener(
    "keydown",
    (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        fileInput?.click();
      }
    },
    { signal }
  );

  fileInput?.addEventListener(
    "change",
    (e) => {
      const files = Array.from(e.target.files || []);
      e.target.value = "";
      if (files.length) {
        handleIncomingFiles(files);
      }
    },
    { signal }
  );

  ["dragover", "dragenter"].forEach((ev) => {
    dropZone?.addEventListener(
      ev,
      (e) => {
        e.preventDefault();
        dropZone.classList.add("is-dragover");
      },
      { signal }
    );
  });

  ["dragleave", "drop"].forEach((ev) => {
    dropZone?.addEventListener(
      ev,
      (e) => {
        e.preventDefault();
        dropZone.classList.remove("is-dragover");
      },
      { signal }
    );
  });

  dropZone?.addEventListener(
    "drop",
    (e) => {
      const files = Array.from(e.dataTransfer?.files || []);
      if (files.length) {
        handleIncomingFiles(files);
      }
    },
    { signal }
  );

  btnGridCols?.addEventListener(
    "click",
    () => {
      const state = getState();
      const count = getSelectedIconsForDisplay(state).length;
      if (count < 2) {
        return;
      }
      const maxCols = Math.min(count, 4);
      const cycle = ["auto"];
      for (let c = 1; c <= maxCols; c++) {
        cycle.push(String(c));
      }
      const idx = cycle.indexOf(String(state.compareCols));
      state.compareCols = cycle[(idx + 1) % cycle.length];
      syncBatchUI();
      onCompareChanged();
      const cols = getCompareGridCols(count, state.compareCols);
      const rows = Math.ceil(count / cols);
      showToast(
        state.compareCols === "auto"
          ? `Layout: Auto (${cols}×${rows})`
          : `Layout: ${cols}×${rows}`
      );
    },
    { signal }
  );

  btnRotateArtwork?.addEventListener(
    "click",
    () => {
      const state = getState();
      state.artRotation = (state.artRotation + 90) % 360;
      OpticalAnalyzer.clearCache();
      onTransformArtwork();
    },
    { signal }
  );

  btnFlipArtwork?.addEventListener(
    "click",
    () => {
      const state = getState();
      state.artFlipH = !state.artFlipH;
      OpticalAnalyzer.clearCache();
      onTransformArtwork();
    },
    { signal }
  );

  btnCompareAll?.addEventListener(
    "click",
    () => {
      const state = getState();
      state.batchQueue.forEach((_, idx) =>
        state.selectedCompareIndices.add(idx)
      );
      syncBatchUI();
      onCompareChanged();
    },
    { signal }
  );

  btnCompareReset?.addEventListener(
    "click",
    () => {
      const state = getState();
      state.selectedCompareIndices.clear();
      syncBatchUI();
      onCompareChanged();
    },
    { signal }
  );

  btnClearSvg?.addEventListener(
    "click",
    () => {
      const state = getState();
      const wasMulti = state.selectedCompareIndices.size >= 2;
      state.batchQueue = [];
      state.batchIndex = 0;
      state.selectedCompareIndices.clear();
      if (fileInput) {
        fileInput.value = "";
      }
      syncBatchUI();
      onBatchChanged(wasMulti);
    },
    { signal }
  );

  expFormatButtons.forEach(({ el, value }) => {
    el?.addEventListener(
      "click",
      () => {
        getState().exportCodeFormat = value;
        syncExportControls();
      },
      { signal }
    );
  });

  expTargetButtons.forEach(({ el, value }) => {
    el?.addEventListener(
      "click",
      () => {
        getState().exportTarget = value;
        syncExportControls();
      },
      { signal }
    );
  });

  btnCopyDevCode?.addEventListener(
    "click",
    async () => {
      const state = getState();
      const code = generateDeveloperCode(state, state.exportCodeFormat);
      const label = FORMAT_META[state.exportCodeFormat]?.toastLabel || "Code";
      const ok = await copyToClipboard(code);
      showToast(ok ? `${label} copied` : "Failed to copy to clipboard");
    },
    { signal }
  );

  btnDownloadSingle?.addEventListener(
    "click",
    () => {
      const state = getState();
      if (state.selectedCompareIndices.size >= 2) {
        const { archiveName, blob, count } = createBatchZipPackage(state);
        triggerBlobDownload(blob, archiveName);
        showToast(`Exported ZIP (${count} selected)`);
        return;
      }
      const { filename, mime, content } = getSingleDownloadSpec(
        state,
        state.exportCodeFormat
      );
      const blob = new Blob([content], { type: mime });
      triggerBlobDownload(blob, filename);
      showToast(`Downloaded ${filename}`);
    },
    { signal }
  );

  function destroy() {
    ac.abort();
  }

  return {
    appendSvgString,
    switchBatchIndex,
    removeIconFromBatch,
    syncBatchUI,
    syncFitMode,
    syncExportControls,
    destroy,
  };
}
