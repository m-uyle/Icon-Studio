import {
  createUniqueId,
  getSvgParser,
  sanitizeSvgNode,
} from "../../../shared/lib/index.js";

const PRESERVED_ROOT_ATTRS = [
  "fill",
  "stroke",
  "stroke-width",
  "stroke-linecap",
  "stroke-linejoin",
  "stroke-miterlimit",
  "stroke-dasharray",
];

/**
 * Parses and sanitizes an SVG string into a normalized icon queue entry.
 */
export function parseSvgToIconItem(
  raw,
  filename,
  defaultWidth = 24,
  defaultHeight = 24
) {
  if (!raw || typeof raw !== "string") {
    return null;
  }
  const cleanRaw = raw
    .replace(/<!DOCTYPE[\s\S]*?>/giu, "")
    .replace(/<\?xml[\s\S]*?\?>/giu, "");

  const parser = getSvgParser();
  if (!parser) {
    return null;
  }

  const doc = parser.parseFromString(cleanRaw, "image/svg+xml");
  if (doc.querySelector("parsererror")) {
    return null;
  }

  const svg = doc.querySelector("svg");
  if (!svg) {
    return null;
  }

  sanitizeSvgNode(svg);

  const rawW = Number.parseFloat(svg.getAttribute("width"));
  const rawH = Number.parseFloat(svg.getAttribute("height"));
  const vb =
    svg.getAttribute("viewBox") ||
    `0 0 ${Number.isFinite(rawW) && rawW > 0 ? rawW : defaultWidth} ${Number.isFinite(rawH) && rawH > 0 ? rawH : defaultHeight}`;

  const rootAttrs = {};
  PRESERVED_ROOT_ATTRS.forEach((attr) => {
    if (svg.hasAttribute(attr)) {
      rootAttrs[attr] = svg.getAttribute(attr);
    }
  });

  return {
    id: createUniqueId("icon"),
    name: filename || `icon-${Date.now().toString().slice(-4)}.svg`,
    rawInner: svg.innerHTML,
    viewBox: vb,
    rootAttrs,
    cachedColorMarkups: {},
    subpixelReport: null,
    opticalMetrics: null,
  };
}

export async function readSvgFiles(fileList) {
  const svgFiles = Array.from(fileList || []).filter(
    (f) =>
      f.name.toLowerCase().endsWith(".svg") || (f.type || "").includes("svg")
  );
  if (!svgFiles.length) {
    return [];
  }

  const results = await Promise.all(
    svgFiles.map(
      (file) =>
        new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) =>
            resolve({ raw: e.target.result, name: file.name });
          reader.onerror = () => resolve(null);
          reader.readAsText(file);
        })
    )
  );

  return results.filter((item) => Boolean(item?.raw));
}
