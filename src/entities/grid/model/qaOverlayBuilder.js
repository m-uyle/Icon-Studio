import { CONTRAST_COLORS } from "./presets.js";

/**
 * Pure SVG markup builder for QA overlay markers (subpixel points, BBox, optical bounds,
 * centroids, drift vector, safe-bleed warning box).
 */

export function buildQaOverlayMarkup(curIcon, state) {
  if (!(state.qaOverlay && curIcon)) {
    return "";
  }
  let overlay = "";
  const palette = CONTRAST_COLORS[state.theme] || CONTRAST_COLORS.light;

  if (state.qaShowSubpixel && curIcon.subpixelReport?.subpixelPoints) {
    const haloColor = palette.halo;
    curIcon.subpixelReport.subpixelPoints.slice(0, 48).forEach((pt) => {
      const px = pt.x.toFixed(2);
      const py = pt.y.toFixed(2);
      overlay += `
        <g opacity="0.95">
          <title>Subpixel misalignment: (${pt.origX.toFixed(2)}, ${pt.origY.toFixed(2)}) — Δx=${pt.driftX.toFixed(2)}px, Δy=${pt.driftY.toFixed(2)}px</title>
          <circle cx="${px}" cy="${py}" r="0.22" fill="#EF4444" stroke="${haloColor}" stroke-width="0.15" vector-effect="non-scaling-stroke" />
        </g>
      `;
    });
  }

  if (curIcon.opticalMetrics) {
    const opt = curIcon.opticalMetrics;
    const oc = opt.opticalCentroid;

    if (state.qaShowOpticalBounds && opt.opticalBounds) {
      const ob = opt.opticalBounds;
      const obw = Math.max(0.1, ob.maxX - ob.minX);
      const obh = Math.max(0.1, ob.maxY - ob.minY);
      overlay += `
        <rect x="${ob.minX.toFixed(2)}" y="${ob.minY.toFixed(2)}"
              width="${obw.toFixed(2)}" height="${obh.toFixed(2)}"
              fill="none" stroke="#9333EA" stroke-width="1.1" stroke-dasharray="2 1.5"
              vector-effect="non-scaling-stroke" opacity="0.95">
          <title>Optical Energy Bounds (95% visual mass): [${ob.minX.toFixed(2)}, ${ob.minY.toFixed(2)}] — Size: ${obw.toFixed(2)} × ${obh.toFixed(2)}px</title>
        </rect>
      `;
    }

    if (state.qaShowOpticalCenter) {
      const ocx = oc.x.toFixed(2);
      const ocy = oc.y.toFixed(2);
      const cx = (state.width / 2).toFixed(2);
      const cy = (state.height / 2).toFixed(2);
      const distCenter = Math.hypot(
        oc.x - state.width / 2,
        oc.y - state.height / 2
      );
      const arm = 1.1;
      if (distCenter > 0.15) {
        overlay += `
          <g opacity="0.95">
            <title>Balance shift from canvas center: dx=${(oc.x - state.width / 2).toFixed(2)}, dy=${(oc.y - state.height / 2).toFixed(2)}</title>
            <line x1="${cx}" y1="${cy}" x2="${ocx}" y2="${ocy}" stroke="#FFFFFF" stroke-width="2.2" vector-effect="non-scaling-stroke" />
            <line x1="${cx}" y1="${cy}" x2="${ocx}" y2="${ocy}" stroke="#0891B2" stroke-width="1.2" stroke-dasharray="2 1" vector-effect="non-scaling-stroke" />
          </g>
        `;
      }
      overlay += `
        <g opacity="1">
          <title>Visual Center: (${ocx}, ${ocy})</title>
          <line x1="${(oc.x - arm).toFixed(2)}" y1="${ocy}" x2="${(oc.x + arm).toFixed(2)}" y2="${ocy}" stroke="#FFFFFF" stroke-width="2.4" stroke-linecap="round" vector-effect="non-scaling-stroke" />
          <line x1="${ocx}" y1="${(oc.y - arm).toFixed(2)}" x2="${ocx}" y2="${(oc.y + arm).toFixed(2)}" stroke="#FFFFFF" stroke-width="2.4" stroke-linecap="round" vector-effect="non-scaling-stroke" />
          <line x1="${(oc.x - arm).toFixed(2)}" y1="${ocy}" x2="${(oc.x + arm).toFixed(2)}" y2="${ocy}" stroke="#06B6D4" stroke-width="1.1" stroke-linecap="round" vector-effect="non-scaling-stroke" />
          <line x1="${ocx}" y1="${(oc.y - arm).toFixed(2)}" x2="${ocx}" y2="${(oc.y + arm).toFixed(2)}" stroke="#06B6D4" stroke-width="1.1" stroke-linecap="round" vector-effect="non-scaling-stroke" />
          <circle cx="${ocx}" cy="${ocy}" r="0.4" fill="none" stroke="#06B6D4" stroke-width="1.1" vector-effect="non-scaling-stroke" />
        </g>
      `;
    }

    if (state.qaShowBleed && opt.bleed.exceeds) {
      overlay += `
        <rect x="${opt.bbox.minX.toFixed(2)}" y="${opt.bbox.minY.toFixed(2)}"
              width="${Math.max(0.1, opt.bbox.maxX - opt.bbox.minX).toFixed(2)}"
              height="${Math.max(0.1, opt.bbox.maxY - opt.bbox.minY).toFixed(2)}"
              fill="none" stroke="#E11D48" stroke-width="1.3" vector-effect="non-scaling-stroke">
          <title>Safe Bleed Violation: Icon geometry exceeds safe padding margin</title>
        </rect>
      `;
    }
  }

  return overlay;
}
