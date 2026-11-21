import {
  buildIllustrationGuidesMarkup,
  buildKeylinesSvgMarkup,
  CONTRAST_COLORS,
} from "../../../entities/grid/index.js";
import {
  getArtworkTransform,
  getColoredArtworkMarkup,
} from "../../../entities/icon/index.js";

export function generateExportSvg(state, iconOverride) {
  const W = state.width;
  const H = state.height;
  const P = state.padding;
  const liveW = Math.max(2, W - P * 2);
  const liveH = Math.max(2, H - P * 2);
  const target = state.exportTarget;
  const curIcon =
    iconOverride === undefined
      ? state.batchQueue[state.batchIndex]
      : iconOverride;

  let guidesContent = "";
  let artworkContent = "";

  if (target === "guides" || target === "composite") {
    const keylines = buildKeylinesSvgMarkup(state).trim();
    const illustr = buildIllustrationGuidesMarkup(state).trim();
    const combinedGuides = [keylines, illustr].filter(Boolean).join("\n    ");
    if (combinedGuides) {
      guidesContent = `\n  <g id="_guides" opacity="0.85">\n    ${combinedGuides}\n  </g>`;
    }
  }

  if ((target === "clean" || target === "composite") && curIcon) {
    const palette = CONTRAST_COLORS[state.theme] || CONTRAST_COLORS.light;
    const targetColor =
      target === "clean"
        ? "currentColor"
        : state.artColorMode === "contrast"
          ? palette.artContrast
          : palette.artDefault;

    const processedSvg = getColoredArtworkMarkup(
      curIcon,
      target === "clean" ? "contrast" : state.artColorMode,
      targetColor
    );
    const { transform } = getArtworkTransform(curIcon, W, H, P, liveW, liveH, {
      artFitMode: state.artFitMode,
      artRotation: state.artRotation,
      artFlipH: state.artFlipH,
    });
    const tfAttr = transform ? ` transform="${transform}"` : "";
    artworkContent = `\n  <g id="icon-content"${tfAttr}>\n    ${processedSvg.trim()}\n  </g>`;
  }

  return `<?xml version="1.0" encoding="UTF-8"?>\n<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" fill="none" xmlns="http://www.w3.org/2000/svg">${guidesContent}${artworkContent}\n</svg>`.trim();
}
