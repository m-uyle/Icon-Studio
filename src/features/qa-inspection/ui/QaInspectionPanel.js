import { QA_KEYS } from "../../../entities/grid/index.js";
import {
  getArtworkTransform,
  getSelectedIconsForDisplay,
  inspectSubpixels,
  OpticalAnalyzer,
} from "../../../entities/icon/index.js";
import { syncLayerToggleButtons } from "../../../shared/ui/index.js";

/**
 * Controller for Inspect Tab: Health checks, Geometry telemetry, and 4 QA Overlays.
 */
export function initQaInspectionPanel(
  rootEl,
  { getState, onQaToggleChange, onMetricsReady, tabDotEl }
) {
  const ac = new AbortController();
  const { signal } = ac;

  const toggleButtons = Array.from(rootEl.querySelectorAll(".qa-toggle"));
  const qaCountBadge = rootEl.querySelector("#qaCountBadge");
  const qaStatusSummary = rootEl.querySelector("#qaStatusSummary");
  const qaEmptyState = rootEl.querySelector("#qaEmptyState");
  const qaHealthStrip = rootEl.querySelector("#qaHealthStrip");
  const qaGeometryDivider = rootEl.querySelector("#qaGeometryDivider");
  const qaGeometrySection = rootEl.querySelector("#qaGeometrySection");
  const qaMarkersDivider = rootEl.querySelector("#qaMarkersDivider");
  const qaMarkersSection = rootEl.querySelector("#qaMarkersSection");

  const qaSubpixelVal = rootEl.querySelector("#qaSubpixelVal");
  const qaBleedVal = rootEl.querySelector("#qaBleedVal");
  const qaDensityVal = rootEl.querySelector("#qaDensityVal");
  const qaDriftVal = rootEl.querySelector("#qaDriftVal");
  const qaBBoxDetail = rootEl.querySelector("#qaBBoxDetail");
  const qaOpticalBoundsDetail = rootEl.querySelector("#qaOpticalBoundsDetail");
  const qaStrokesDetail = rootEl.querySelector("#qaStrokesDetail");
  const qaCentroidDetail = rootEl.querySelector("#qaCentroidDetail");

  let analysisSeqId = 0;

  toggleButtons.forEach((btn) => {
    btn.addEventListener(
      "click",
      () => {
        const state = getState();
        state.qaLayersCustomized = true;
        state[btn.dataset.key] = !state[btn.dataset.key];
        syncToggles();
        onQaToggleChange();
      },
      { signal }
    );
  });

  rootEl.querySelector("#btnQaLayersAll")?.addEventListener(
    "click",
    () => {
      const state = getState();
      state.qaLayersCustomized = true;
      QA_KEYS.forEach((k) => {
        state[k] = true;
      });
      syncToggles();
      onQaToggleChange();
    },
    { signal }
  );

  rootEl.querySelector("#btnQaLayersClear")?.addEventListener(
    "click",
    () => {
      const state = getState();
      state.qaLayersCustomized = true;
      QA_KEYS.forEach((k) => {
        state[k] = false;
      });
      syncToggles();
      onQaToggleChange();
    },
    { signal }
  );

  function setTone(el, tone) {
    if (!el) {
      return;
    }
    el.classList.remove(
      "tone-success",
      "tone-warning",
      "tone-danger",
      "tone-faint"
    );
    if (tone) {
      el.classList.add(tone);
    }
  }

  function syncToggles() {
    const activeCount = syncLayerToggleButtons(toggleButtons, getState());
    if (qaCountBadge) {
      qaCountBadge.textContent = `${activeCount} / ${QA_KEYS.length}`;
    }
  }

  function formatSigned(val) {
    const rounded = Math.round(val * 10) / 10;
    if (Object.is(rounded, -0) || rounded === 0) {
      return "0.0";
    }
    return `${rounded > 0 ? "+" : ""}${rounded.toFixed(1)}`;
  }

  function updateHealthStrip() {
    const state = getState();
    const curIcon = state.batchQueue[state.batchIndex];
    const W = state.width;
    const H = state.height;
    const P = state.padding;

    if (!curIcon) {
      qaEmptyState?.classList.remove("is-hidden");
      qaHealthStrip?.classList.add("is-hidden");
      qaGeometryDivider?.classList.add("is-hidden");
      qaGeometrySection?.classList.add("is-hidden");
      qaMarkersDivider?.classList.add("is-hidden");
      qaMarkersSection?.classList.add("is-hidden");
      qaStatusSummary?.classList.add("is-hidden");
      if (tabDotEl) {
        tabDotEl.classList.add("is-hidden");
      }
      return;
    }

    qaEmptyState?.classList.add("is-hidden");
    qaHealthStrip?.classList.remove("is-hidden");
    qaGeometryDivider?.classList.remove("is-hidden");
    qaGeometrySection?.classList.remove("is-hidden");
    qaMarkersDivider?.classList.remove("is-hidden");
    qaMarkersSection?.classList.remove("is-hidden");
    qaStatusSummary?.classList.remove("is-hidden");

    const liveW = Math.max(2, W - P * 2);
    const liveH = Math.max(2, H - P * 2);
    const tfOpts = {
      artFitMode: state.artFitMode,
      artRotation: state.artRotation,
      artFlipH: state.artFlipH,
    };

    const tfData = getArtworkTransform(curIcon, W, H, P, liveW, liveH, tfOpts);
    curIcon.subpixelReport = inspectSubpixels(curIcon, W, H, P, tfData);
    const sub = curIcon.subpixelReport;

    // Synchronized thresholds: 0 = Clean (green), 1..4 = minor (neutral), >4 = warning (amber)
    if (sub.subpixelCount === 0) {
      qaSubpixelVal.textContent = "Clean";
      setTone(qaSubpixelVal, "tone-success");
    } else if (sub.subpixelCount <= 4) {
      qaSubpixelVal.textContent = `${sub.subpixelCount} off-grid`;
      setTone(qaSubpixelVal, "");
    } else {
      qaSubpixelVal.textContent = `${sub.subpixelCount} off-grid`;
      setTone(qaSubpixelVal, "tone-warning");
    }

    if (qaStrokesDetail) {
      qaStrokesDetail.textContent = sub.strokeSummary || "Fill only";
    }

    const currentToken = ++analysisSeqId;

    const displayIcons = getSelectedIconsForDisplay(state);
    const iconsToMeasure = displayIcons.map((d) => d.icon);
    if (!iconsToMeasure.includes(curIcon)) {
      iconsToMeasure.unshift(curIcon);
    }

    const measurePromises = iconsToMeasure.map((ic) => {
      const icTf =
        ic === curIcon
          ? tfData
          : getArtworkTransform(ic, W, H, P, liveW, liveH, tfOpts);
      if (ic !== curIcon) {
        ic.subpixelReport = inspectSubpixels(ic, W, H, P, icTf);
      }
      return OpticalAnalyzer.measure(ic, W, H, P, icTf).then((m) => {
        if (m) {
          ic.opticalMetrics = m;
        }
        return { icon: ic, metrics: m };
      });
    });

    Promise.all(measurePromises).then((results) => {
      if (currentToken !== analysisSeqId) {
        return;
      }
      const activeEntry = results.find((r) => r.icon === curIcon);
      const metrics = activeEntry?.metrics;
      if (!metrics) {
        return;
      }

      if (metrics.bleed.exceeds) {
        const maxB = Math.max(
          metrics.bleed.top,
          metrics.bleed.bottom,
          metrics.bleed.left,
          metrics.bleed.right
        ).toFixed(1);
        qaBleedVal.textContent = `+${maxB}px over`;
        setTone(qaBleedVal, "tone-danger");
      } else {
        qaBleedVal.textContent = "Safe";
        setTone(qaBleedVal, "tone-success");
      }

      let densityTier = "Optimal";
      if (metrics.densityPercent < 15) {
        densityTier = "Light";
      } else if (metrics.densityPercent > 32) {
        densityTier = "Dense";
      }
      qaDensityVal.textContent = `${metrics.densityPercent.toFixed(1)}% ${densityTier}`;

      const dx = metrics.driftFromCenter.dx;
      const dy = metrics.driftFromCenter.dy;
      const driftDist = Math.hypot(dx, dy);

      // Synchronized thresholds: <0.3 = Balanced (green), 0.3..1.2 = minor (neutral), >1.2 = warning (amber)
      if (driftDist < 0.3) {
        qaDriftVal.textContent = "Balanced";
        setTone(qaDriftVal, "tone-success");
      } else if (driftDist <= 1.2) {
        qaDriftVal.textContent = `${driftDist.toFixed(1)}px off`;
        setTone(qaDriftVal, "");
      } else {
        qaDriftVal.textContent = `${driftDist.toFixed(1)}px off`;
        setTone(qaDriftVal, "tone-warning");
      }

      if (qaBBoxDetail) {
        const bw = (metrics.bbox.maxX - metrics.bbox.minX).toFixed(1);
        const bh = (metrics.bbox.maxY - metrics.bbox.minY).toFixed(1);
        qaBBoxDetail.textContent = `${bw} × ${bh}`;
      }

      if (qaOpticalBoundsDetail) {
        const obw = (
          metrics.opticalBounds.maxX - metrics.opticalBounds.minX
        ).toFixed(1);
        const obh = (
          metrics.opticalBounds.maxY - metrics.opticalBounds.minY
        ).toFixed(1);
        qaOpticalBoundsDetail.textContent = `${obw} × ${obh}`;
      }

      if (qaCentroidDetail) {
        if (Math.abs(dx) < 0.05 && Math.abs(dy) < 0.05) {
          qaCentroidDetail.textContent = "Centered";
        } else {
          qaCentroidDetail.textContent = `X ${formatSigned(dx)}, Y ${formatSigned(dy)}`;
        }
      }

      const hasWarning =
        metrics.bleed.exceeds || sub.subpixelCount > 4 || driftDist > 1.2;
      qaStatusSummary.textContent = hasWarning ? "Warnings" : "Passed";
      setTone(qaStatusSummary, hasWarning ? "tone-warning" : "tone-success");

      if (tabDotEl) {
        tabDotEl.classList.remove("is-hidden");
        tabDotEl.classList.toggle("qa-tab-dot--warning", hasWarning);
      }

      onMetricsReady();
    });
  }

  function destroy() {
    ac.abort();
  }

  return { syncToggles, updateHealthStrip, destroy };
}
