import { escapeHtml, getSvgParser } from "../../../shared/lib/index.js";

const MAX_CACHE_ENTRIES_PER_ICON = 16;
const NON_PAINT_TAGS = new Set([
  "defs",
  "clippath",
  "mask",
  "filter",
  "style",
  "lineargradient",
  "radialgradient",
  "pattern",
]);
const SHAPE_TAGS = new Set([
  "path",
  "rect",
  "circle",
  "ellipse",
  "polygon",
  "polyline",
  "text",
  "line",
]);
const ROOT_STROKE_ATTRS = [
  "stroke-width",
  "stroke-linecap",
  "stroke-linejoin",
  "stroke-miterlimit",
  "stroke-dasharray",
];

/**
 * Rewrites SVG artwork paint attributes for theme/contrast/original preview modes
 * with bounded per-icon caching.
 */
export function getColoredArtworkMarkup(iconItem, colorMode, targetColor) {
  const rawInner = iconItem?.rawInner || iconItem?.svg;
  if (!rawInner) {
    return "";
  }

  const rootStrokeAttrs = {};
  if (iconItem.rootAttrs) {
    ROOT_STROKE_ATTRS.forEach((k) => {
      if (iconItem.rootAttrs[k]) {
        rootStrokeAttrs[k] = iconItem.rootAttrs[k];
      }
    });
  }
  const rootStrokeStr = Object.entries(rootStrokeAttrs)
    .map(([k, v]) => `${k}="${escapeHtml(v)}"`)
    .join(" ");

  if (colorMode === "original") {
    const attrsStr = iconItem.rootAttrs
      ? Object.entries(iconItem.rootAttrs)
          .map(([k, v]) => `${k}="${escapeHtml(v)}"`)
          .join(" ")
      : "";
    return attrsStr ? `<g ${attrsStr}>${rawInner}</g>` : rawInner;
  }

  if (!iconItem.cachedColorMarkups) {
    iconItem.cachedColorMarkups = {};
  }
  const cacheKey = `${colorMode}_${targetColor}`;
  if (iconItem.cachedColorMarkups[cacheKey]) {
    return iconItem.cachedColorMarkups[cacheKey];
  }

  const parser = getSvgParser();
  if (!parser) {
    return rawInner;
  }

  const rootWrap = iconItem.rootAttrs
    ? Object.entries(iconItem.rootAttrs)
        .map(([k, v]) => `${k}="${escapeHtml(v)}"`)
        .join(" ")
    : "";
  const doc = parser.parseFromString(
    `<svg xmlns="http://www.w3.org/2000/svg" ${rootWrap}>${rawInner}</svg>`,
    "image/svg+xml"
  );
  const svg = doc.querySelector("svg");
  if (!svg) {
    return rawInner;
  }

  const rootStroke = svg.getAttribute("stroke");
  const rootFill = svg.getAttribute("fill");
  const rootHasStroke = Boolean(rootStroke && rootStroke !== "none");
  const rootFillIsNone = rootFill === "none";

  svg.querySelectorAll("*").forEach((el) => {
    const tag = el.tagName.toLowerCase();
    if (NON_PAINT_TAGS.has(tag)) {
      return;
    }

    const fillAttr = el.getAttribute("fill");
    const strokeAttr = el.getAttribute("stroke");
    const fillStyle = el.style?.fill || "";
    const strokeStyle = el.style?.stroke || "";

    const hasExplicitStroke =
      (strokeAttr && strokeAttr !== "none") ||
      (strokeStyle && strokeStyle !== "none");
    const isExplicitFillNone = fillAttr === "none" || fillStyle === "none";
    const hasExplicitFill =
      (fillAttr && fillAttr !== "none") || (fillStyle && fillStyle !== "none");
    const isShape = SHAPE_TAGS.has(tag);

    if (hasExplicitStroke || (rootHasStroke && !strokeAttr)) {
      el.setAttribute("stroke", targetColor);
      if (el.style?.stroke) {
        el.style.stroke = targetColor;
      }
    }

    if (
      isExplicitFillNone ||
      (!hasExplicitFill &&
        rootFillIsNone &&
        (hasExplicitStroke || rootHasStroke))
    ) {
      el.setAttribute("fill", "none");
      if (el.style?.fill) {
        el.style.fill = "none";
      }
    } else if (
      hasExplicitFill ||
      (isShape && !rootFillIsNone && !hasExplicitStroke && !rootHasStroke)
    ) {
      el.setAttribute("fill", targetColor);
      if (el.style?.fill) {
        el.style.fill = targetColor;
      }
    }
  });

  let processedMarkup = svg.innerHTML;
  if (rootStrokeStr) {
    processedMarkup = `<g ${rootStrokeStr}>${processedMarkup}</g>`;
  }

  const keys = Object.keys(iconItem.cachedColorMarkups);
  if (keys.length >= MAX_CACHE_ENTRIES_PER_ICON) {
    delete iconItem.cachedColorMarkups[keys[0]];
  }
  iconItem.cachedColorMarkups[cacheKey] = processedMarkup;
  return processedMarkup;
}
