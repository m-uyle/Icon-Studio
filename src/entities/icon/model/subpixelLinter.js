import {
  applyMatrixToPoint,
  convertShapeToPathData,
  extractPathPoints,
  getSvgParser,
  IDENTITY_MATRIX,
  multiplyMatrices,
  parseSvgTransformAttr,
} from "../../../shared/lib/index.js";

const SHAPE_TAGS = new Set([
  "path",
  "rect",
  "circle",
  "ellipse",
  "line",
  "polyline",
  "polygon",
]);

function extractNumericStyleProp(styleStr, propName) {
  if (!styleStr) {
    return null;
  }
  const targetKey = propName.toLowerCase();
  for (const part of styleStr.split(";")) {
    const colonIdx = part.indexOf(":");
    if (colonIdx === -1) {
      continue;
    }
    const key = part.slice(0, colonIdx).trim().toLowerCase();
    if (key === targetKey) {
      const val = Number.parseFloat(part.slice(colonIdx + 1).trim());
      return Number.isFinite(val) ? val : null;
    }
  }
  return null;
}

/**
 * Inspects SVG vector anchor points against the target pixel grid (integer & half-pixel),
 * properly applying nested SVG `transform` matrices as well as artwork fit/rotation/flip.
 */
export function inspectSubpixels(iconItem, W, H, _P, transformData) {
  if (!iconItem?.rawInner) {
    return {
      subpixelPoints: [],
      subpixelCount: 0,
      strokeSummary: "",
    };
  }

  const parser = getSvgParser();
  if (!parser) {
    return {
      subpixelPoints: [],
      subpixelCount: 0,
      strokeSummary: "Fill only",
    };
  }

  const { scale, offsetX, offsetY, rotation, flipH } = transformData;
  const midX = W / 2;
  const midY = H / 2;
  const radRot = (rotation * Math.PI) / 180;
  const cosR = Math.cos(radRot);
  const sinR = Math.sin(radRot);

  const doc = parser.parseFromString(
    `<svg xmlns="http://www.w3.org/2000/svg">${iconItem.rawInner}</svg>`,
    "image/svg+xml"
  );
  const rootSvg = doc.querySelector("svg");
  if (!rootSvg) {
    return {
      subpixelPoints: [],
      subpixelCount: 0,
      strokeSummary: "Fill only",
    };
  }

  const strokeWidths = new Set();
  const rawPoints = [];

  const rootSw = Number.parseFloat(iconItem.rootAttrs?.["stroke-width"]);
  if (Number.isFinite(rootSw) && rootSw > 0) {
    strokeWidths.add(rootSw);
  }

  const walk = (node, parentMatrix) => {
    if (node?.nodeType !== 1) {
      return;
    }
    const tag = node.tagName.toLowerCase();
    if (tag === "defs" || tag === "clippath" || tag === "mask") {
      return;
    }

    const ownTransform = node.getAttribute("transform");
    const curMatrix = ownTransform
      ? multiplyMatrices(parentMatrix, parseSvgTransformAttr(ownTransform))
      : parentMatrix;

    if (SHAPE_TAGS.has(tag)) {
      const swAttr = Number.parseFloat(node.getAttribute("stroke-width"));
      const swStyle = extractNumericStyleProp(
        node.getAttribute("style"),
        "stroke-width"
      );
      if (Number.isFinite(swAttr) && swAttr > 0) {
        strokeWidths.add(swAttr);
      } else if (Number.isFinite(swStyle) && swStyle > 0) {
        strokeWidths.add(swStyle);
      }

      const pathD = convertShapeToPathData(node);
      if (pathD) {
        const pts = extractPathPoints(pathD);
        pts.forEach((p) => {
          const transformed = applyMatrixToPoint(curMatrix, p.x, p.y);
          rawPoints.push({
            x: transformed.x,
            y: transformed.y,
            origX: p.x,
            origY: p.y,
          });
        });
      }
    }

    Array.from(node.children || []).forEach((child) => walk(child, curMatrix));
  };

  walk(rootSvg, IDENTITY_MATRIX);

  const subpixelPoints = [];
  const seenCoords = new Set();

  rawPoints.forEach((pt) => {
    // Map point into target artboard coordinates
    let gx = offsetX + pt.x * scale;
    let gy = offsetY + pt.y * scale;

    let rx = gx - midX;
    const ry = gy - midY;
    if (flipH) {
      rx = -rx;
    }
    const rotX = rx * cosR - ry * sinR;
    const rotY = rx * sinR + ry * cosR;
    gx = rotX + midX;
    gy = rotY + midY;

    // Evaluate off-grid drift on target artboard coordinates (0.0 and 0.5 grid stops)
    const fracX = Math.abs(gx - Math.round(gx));
    const fracY = Math.abs(gy - Math.round(gy));
    const distIntHalfX = Math.min(fracX, Math.abs(fracX - 0.5));
    const distIntHalfY = Math.min(fracY, Math.abs(fracY - 0.5));

    if (distIntHalfX > 0.015 || distIntHalfY > 0.015) {
      const coordKey = `${gx.toFixed(2)}_${gy.toFixed(2)}`;
      if (!seenCoords.has(coordKey)) {
        seenCoords.add(coordKey);
        subpixelPoints.push({
          x: gx,
          y: gy,
          origX: gx,
          origY: gy,
          driftX: distIntHalfX,
          driftY: distIntHalfY,
        });
      }
    }
  });

  return {
    subpixelPoints,
    subpixelCount: subpixelPoints.length,
    strokeSummary: strokeWidths.size
      ? Array.from(strokeWidths)
          .sort((a, b) => a - b)
          .map((s) => `${s}px`)
          .join(", ")
      : "Fill only",
  };
}
