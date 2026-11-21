/**
 * Artwork transform calculation, multi-icon compare selection, and grid column heuristics.
 */

export function getArtworkTransform(
  curIcon,
  W,
  H,
  P,
  liveW,
  liveH,
  options = {}
) {
  const { artFitMode = "canvas", artRotation = 0, artFlipH = false } = options;

  const midX = W / 2;
  const midY = H / 2;
  const vbParts = (curIcon.viewBox || `0 0 ${W} ${H}`)
    .trim()
    .split(/[\s,]+/u)
    .map(Number);
  const [minX, minY, vbW, vbH] =
    vbParts.length === 4 && vbParts.every(Number.isFinite)
      ? vbParts
      : [0, 0, W, H];

  const safeVbW = vbW > 0 ? vbW : W;
  const safeVbH = vbH > 0 ? vbH : H;

  const artX = artFitMode === "canvas" ? 0 : P;
  const artY = artFitMode === "canvas" ? 0 : P;
  const artW = artFitMode === "canvas" ? W : liveW;
  const artH = artFitMode === "canvas" ? H : liveH;

  const scale = Math.min(artW / safeVbW, artH / safeVbH);
  const offsetX = artX + (artW - safeVbW * scale) / 2 - minX * scale;
  const offsetY = artY + (artH - safeVbH * scale) / 2 - minY * scale;

  const isIdentity =
    artRotation === 0 &&
    !artFlipH &&
    Math.abs(scale - 1) < 0.0001 &&
    Math.abs(offsetX) < 0.001 &&
    Math.abs(offsetY) < 0.001;

  if (isIdentity) {
    return {
      transform: "",
      isIdentity: true,
      scale,
      offsetX,
      offsetY,
      rotation: artRotation,
      flipH: artFlipH,
    };
  }

  let transform = `translate(${midX} ${midY}) rotate(${artRotation}) scale(${artFlipH ? -1 : 1}, 1) translate(${-midX} ${-midY})`;
  transform += ` translate(${offsetX.toFixed(4)} ${offsetY.toFixed(4)}) scale(${scale.toFixed(6)})`;

  return {
    transform,
    isIdentity: false,
    scale,
    offsetX,
    offsetY,
    rotation: artRotation,
    flipH: artFlipH,
  };
}

export function getSelectedIconsForDisplay(state) {
  if (state.selectedCompareIndices.size >= 2) {
    return Array.from(state.selectedCompareIndices)
      .sort((a, b) => a - b)
      .map((idx) => ({ icon: state.batchQueue[idx], index: idx }))
      .filter((item) => Boolean(item.icon));
  }
  if (state.batchQueue[state.batchIndex]) {
    return [
      { icon: state.batchQueue[state.batchIndex], index: state.batchIndex },
    ];
  }
  return [];
}

export function getCompareGridCols(count, compareCols = "auto") {
  if (count <= 1) {
    return 1;
  }
  if (compareCols && compareCols !== "auto") {
    const parsed = Number.parseInt(compareCols, 10);
    if (Number.isFinite(parsed)) {
      return Math.min(count, Math.max(1, parsed));
    }
  }
  if (count === 2) {
    return 2;
  }
  if (count === 3) {
    return 3;
  }
  if (count === 4) {
    return 2;
  }
  if (count <= 6) {
    return 3;
  }
  return 4;
}
