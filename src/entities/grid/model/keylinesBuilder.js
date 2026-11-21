import { clipRayThroughCenter } from "../../../shared/lib/index.js";
import { CONTRAST_COLORS, STROKE_HIERARCHY } from "./presets.js";

/**
 * Pure SVG markup builders for keylines, spot-illustration guides, and pixel grid.
 */

export function buildKeylinesSvgMarkup(state) {
  const W = state.width;
  const H = state.height;
  const P = state.padding;
  const liveW = Math.max(2, W - P * 2);
  const liveH = Math.max(2, H - P * 2);
  const minDim = Math.min(W, H);
  const minLive = Math.min(liveW, liveH);
  const midX = W / 2;
  const midY = H / 2;
  const c = CONTRAST_COLORS[state.theme] || CONTRAST_COLORS.light;
  const h = STROKE_HIERARCHY;

  let keylinesMarkup = "";

  if (state.showSafeZone && P > 0) {
    keylinesMarkup += `<rect x="${P}" y="${P}" width="${liveW}" height="${liveH}" fill="none" stroke="${c.safeZone}" stroke-width="${h.safeZone}" vector-effect="non-scaling-stroke" class="crisp-stroke" />`;
  }

  if (state.showAxes) {
    keylinesMarkup += `
      <line x1="${midX}" y1="0" x2="${midX}" y2="${H}" stroke="${c.axes}" stroke-width="${h.axes}" vector-effect="non-scaling-stroke" class="crisp-stroke" />
      <line x1="0" y1="${midY}" x2="${W}" y2="${midY}" stroke="${c.axes}" stroke-width="${h.axes}" vector-effect="non-scaling-stroke" class="crisp-stroke" />
    `;
  }

  if (state.showDiagonals) {
    keylinesMarkup += `
      <line x1="0" y1="0" x2="${W}" y2="${H}" stroke="${c.diagonals}" stroke-width="${h.diagonals}" vector-effect="non-scaling-stroke" class="crisp-stroke" />
      <line x1="${W}" y1="0" x2="0" y2="${H}" stroke="${c.diagonals}" stroke-width="${h.diagonals}" vector-effect="non-scaling-stroke" class="crisp-stroke" />
    `;
  }

  if (state.showRays3060) {
    const angles = [Math.PI / 6, -Math.PI / 6, Math.PI / 3, -Math.PI / 3];
    for (const angle of angles) {
      const seg = clipRayThroughCenter(midX, midY, angle, W, H);
      keylinesMarkup += `
        <line x1="${seg.x1.toFixed(3)}" y1="${seg.y1.toFixed(3)}" x2="${seg.x2.toFixed(3)}" y2="${seg.y2.toFixed(3)}" stroke="${c.rays}" stroke-width="${h.rays}" vector-effect="non-scaling-stroke" class="crisp-stroke" stroke-dasharray="2 1.5" />
      `;
    }
  }

  if (state.showThirds) {
    const t1X = P + liveW / 3;
    const t2X = P + (2 * liveW) / 3;
    const t1Y = P + liveH / 3;
    const t2Y = P + (2 * liveH) / 3;
    keylinesMarkup += `
      <line x1="${t1X}" y1="${P}" x2="${t1X}" y2="${P + liveH}" stroke="${c.thirds}" stroke-width="${h.rays}" vector-effect="non-scaling-stroke" class="crisp-stroke" stroke-dasharray="2 1.5" />
      <line x1="${t2X}" y1="${P}" x2="${t2X}" y2="${P + liveH}" stroke="${c.thirds}" stroke-width="${h.rays}" vector-effect="non-scaling-stroke" class="crisp-stroke" stroke-dasharray="2 1.5" />
      <line x1="${P}" y1="${t1Y}" x2="${P + liveW}" y2="${t1Y}" stroke="${c.thirds}" stroke-width="${h.rays}" vector-effect="non-scaling-stroke" class="crisp-stroke" stroke-dasharray="2 1.5" />
      <line x1="${P}" y1="${t2Y}" x2="${P + liveW}" y2="${t2Y}" stroke="${c.thirds}" stroke-width="${h.rays}" vector-effect="non-scaling-stroke" class="crisp-stroke" stroke-dasharray="2 1.5" />
    `;
  }

  if (state.showCircle) {
    const rCircle = minLive / 2;
    keylinesMarkup += `<circle cx="${midX}" cy="${midY}" r="${rCircle}" fill="none" stroke="${c.circle}" stroke-width="${h.primaryKeylines}" vector-effect="non-scaling-stroke" class="crisp-stroke" />`;
  }

  if (state.showConcentric) {
    const rCore = minLive * 0.25;
    keylinesMarkup += `<circle cx="${midX}" cy="${midY}" r="${rCore}" fill="none" stroke="${c.concentric}" stroke-width="${h.advancedPrimitives}" vector-effect="non-scaling-stroke" class="crisp-stroke" />`;
  }

  if (state.showHarmonicPrimitives) {
    const triH = Math.max(2, Math.round((minLive * 0.866) / 2) * 2);
    const triTopY = midY - triH / 2;
    const triBotY = midY + triH / 2;
    const triL = midX - minLive / 2;
    const triR = midX + minLive / 2;
    keylinesMarkup += `
      <polygon points="${midX},${triTopY} ${triR},${triBotY} ${triL},${triBotY}" fill="none" stroke="${c.harmonic}" stroke-width="${h.advancedPrimitives}" vector-effect="non-scaling-stroke" class="crisp-stroke" />
      <polygon points="${midX},${P} ${P + liveW},${midY} ${midX},${P + liveH} ${P},${midY}" fill="none" stroke="${c.harmonic}" stroke-width="${h.advancedPrimitives}" vector-effect="non-scaling-stroke" class="crisp-stroke" stroke-dasharray="2 2" />
    `;
  }

  if (state.showSquare) {
    let sqSide = Math.max(1, Math.round(minLive * 0.886));
    if ((minDim - sqSide) % 2 !== 0) {
      sqSide = sqSide + 1 <= minLive ? sqSide + 1 : Math.max(1, sqSide - 1);
    }
    const sqOffsetX = (W - sqSide) / 2;
    const sqOffsetY = (H - sqSide) / 2;
    const rad = Math.min(state.radius, sqSide / 2);
    keylinesMarkup += `<rect x="${sqOffsetX}" y="${sqOffsetY}" width="${sqSide}" height="${sqSide}" rx="${rad}" fill="none" stroke="${c.square}" stroke-width="${h.primaryKeylines}" vector-effect="non-scaling-stroke" class="crisp-stroke" />`;
  }

  if (state.showRectH) {
    const targetRatio = 4 / 3;
    let rectW =
      liveW / liveH >= targetRatio ? Math.round(liveH * targetRatio) : liveW;
    let rectH =
      liveW / liveH >= targetRatio ? liveH : Math.round(liveW / targetRatio);
    if ((W - rectW) % 2 !== 0) {
      rectW = Math.max(1, rectW - 1);
    }
    if ((H - rectH) % 2 !== 0) {
      rectH = Math.max(1, rectH - 1);
    }
    const rectX = (W - rectW) / 2;
    const rectY = (H - rectH) / 2;
    const rad = Math.min(state.radius, rectH / 2, rectW / 2);
    keylinesMarkup += `<rect x="${rectX}" y="${rectY}" width="${rectW}" height="${rectH}" rx="${rad}" fill="none" stroke="${c.rectH}" stroke-width="${h.rectangles}" vector-effect="non-scaling-stroke" class="crisp-stroke" />`;
  }

  if (state.showRectV) {
    const targetRatio = 3 / 4;
    let rectW =
      liveW / liveH >= targetRatio ? Math.round(liveH * targetRatio) : liveW;
    let rectH =
      liveW / liveH >= targetRatio ? liveH : Math.round(liveW / targetRatio);
    if ((W - rectW) % 2 !== 0) {
      rectW = Math.max(1, rectW - 1);
    }
    if ((H - rectH) % 2 !== 0) {
      rectH = Math.max(1, rectH - 1);
    }
    const rectX = (W - rectW) / 2;
    const rectY = (H - rectH) / 2;
    const rad = Math.min(state.radius, rectW / 2, rectH / 2);
    keylinesMarkup += `<rect x="${rectX}" y="${rectY}" width="${rectW}" height="${rectH}" rx="${rad}" fill="none" stroke="${c.rectV}" stroke-width="${h.rectangles}" vector-effect="non-scaling-stroke" class="crisp-stroke" />`;
  }

  return keylinesMarkup;
}

export function buildIllustrationGuidesMarkup(state) {
  if (!state.showIllustrationSpecial) {
    return "";
  }
  const W = state.width;
  const H = state.height;
  const P = state.padding;
  const c = CONTRAST_COLORS[state.theme] || CONTRAST_COLORS.light;
  const h = STROKE_HIERARCHY.illustration;

  let markup = "";
  const shelfY = Math.round(H - P - H * 0.14);
  markup += `
    <line x1="${P}" y1="${shelfY}" x2="${W - P}" y2="${shelfY}" stroke="${c.illustration}" stroke-width="${h}" stroke-dasharray="3 2" vector-effect="non-scaling-stroke" class="crisp-stroke" />
  `;

  const badgeR = Math.max(3, Math.round(Math.min(W, H) * 0.22));
  const badgeCx = W - P - badgeR / 2;
  const badgeCy = H - P - badgeR / 2;
  markup += `
    <circle cx="${badgeCx}" cy="${badgeCy}" r="${badgeR}" fill="none" stroke="${c.illustration}" stroke-width="${h}" stroke-dasharray="2 2" vector-effect="non-scaling-stroke" class="crisp-stroke" />
  `;

  return markup;
}

export function buildGridMarkup(state) {
  const W = state.width;
  const H = state.height;
  const maxDim = Math.max(W, H);
  const c = CONTRAST_COLORS[state.theme] || CONTRAST_COLORS.light;
  const h = STROKE_HIERARCHY;

  if (!state.showPixelGrid || maxDim > 128) {
    return "";
  }

  let path = "";
  for (let x = 0; x <= W; x++) {
    path += `M ${x} 0 L ${x} ${H} `;
  }
  for (let y = 0; y <= H; y++) {
    path += `M 0 ${y} L ${W} ${y} `;
  }

  return `<path d="${path}" fill="none" stroke="${c.pixel}" stroke-width="${h.pixelGrid}" vector-effect="non-scaling-stroke" class="pixel-stroke" opacity="0.85" />`;
}
