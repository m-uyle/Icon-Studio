import { getColoredArtworkMarkup } from "./colorizer.js";

/**
 * Pure pixel-buffer optical metrics computation (testable in Node.js without Canvas/DOM).
 */
function computeOpticalMetricsFromAlpha(
  alphaBuffer,
  canvasW,
  canvasH,
  scale,
  W,
  H,
  P,
  domBbox = null
) {
  let totalAlpha = 0;
  let sumX = 0;
  let sumY = 0;
  let solidCount = 0;
  let minX = canvasW;
  let minY = canvasH;
  let maxX = -1;
  let maxY = -1;

  const alphaProjX = new Float64Array(canvasW);
  const alphaProjY = new Float64Array(canvasH);

  for (let y = 0; y < canvasH; y++) {
    const rowOffset = y * canvasW;
    for (let x = 0; x < canvasW; x++) {
      const a = alphaBuffer[rowOffset + x];
      if (a >= 12) {
        solidCount++;
        totalAlpha += a;
        sumX += (x + 0.5) * a;
        sumY += (y + 0.5) * a;
        alphaProjX[x] += a;
        alphaProjY[y] += a;
        if (x < minX) {
          minX = x;
        }
        if (x + 1 > maxX) {
          maxX = x + 1;
        }
        if (y < minY) {
          minY = y;
        }
        if (y + 1 > maxY) {
          maxY = y + 1;
        }
      }
    }
  }

  const totalPixels = canvasW * canvasH;
  const densityPercent = totalPixels > 0 ? (solidCount / totalPixels) * 100 : 0;

  if (totalAlpha === 0 || solidCount === 0) {
    return {
      densityPercent: 0,
      opticalCentroid: { x: W / 2, y: H / 2 },
      bboxCenter: { x: W / 2, y: H / 2 },
      bbox: { minX: P, minY: P, maxX: W - P, maxY: H - P },
      opticalBounds: { minX: P, minY: P, maxX: W - P, maxY: H - P },
      bleed: { exceeds: false, left: 0, top: 0, right: 0, bottom: 0 },
      driftFromCenter: { dx: 0, dy: 0 },
      opticalVsBBoxOffset: { dx: 0, dy: 0 },
    };
  }

  const opticalCentroid = {
    x: Math.round((sumX / totalAlpha / scale) * 100) / 100,
    y: Math.round((sumY / totalAlpha / scale) * 100) / 100,
  };

  const rasterBbox = {
    minX: minX / scale,
    minY: minY / scale,
    maxX: maxX / scale,
    maxY: maxY / scale,
  };

  let bbox;
  if (
    domBbox &&
    Number.isFinite(domBbox.x) &&
    Number.isFinite(domBbox.y) &&
    domBbox.width > 0 &&
    domBbox.height > 0
  ) {
    bbox = {
      minX: Math.round(Math.min(domBbox.x, rasterBbox.minX) * 100) / 100,
      minY: Math.round(Math.min(domBbox.y, rasterBbox.minY) * 100) / 100,
      maxX:
        Math.round(Math.max(domBbox.x + domBbox.width, rasterBbox.maxX) * 100) /
        100,
      maxY:
        Math.round(
          Math.max(domBbox.y + domBbox.height, rasterBbox.maxY) * 100
        ) / 100,
    };
  } else {
    bbox = {
      minX: Math.round(rasterBbox.minX * 100) / 100,
      minY: Math.round(rasterBbox.minY * 100) / 100,
      maxX: Math.round(rasterBbox.maxX * 100) / 100,
      maxY: Math.round(rasterBbox.maxY * 100) / 100,
    };
  }

  const bboxCenter = {
    x: Math.round(((bbox.minX + bbox.maxX) / 2) * 100) / 100,
    y: Math.round(((bbox.minY + bbox.maxY) / 2) * 100) / 100,
  };

  const bleedLeft = P - bbox.minX;
  const bleedTop = P - bbox.minY;
  const bleedRight = bbox.maxX - (W - P);
  const bleedBottom = bbox.maxY - (H - P);
  const hasBleed =
    bleedLeft > 0.05 ||
    bleedTop > 0.05 ||
    bleedRight > 0.05 ||
    bleedBottom > 0.05;

  const bleed = {
    exceeds: hasBleed,
    left: Math.max(0, Math.round(bleedLeft * 100) / 100),
    top: Math.max(0, Math.round(bleedTop * 100) / 100),
    right: Math.max(0, Math.round(bleedRight * 100) / 100),
    bottom: Math.max(0, Math.round(bleedBottom * 100) / 100),
  };

  // Fixed quantile scan using explicit boolean flags (prevents overwrite bug when minX === 0)
  let optMinX = minX;
  let optMaxX = maxX;
  let optMinY = minY;
  let optMaxY = maxY;
  const cutoffLow = totalAlpha * 0.025;
  const cutoffHigh = totalAlpha * 0.975;

  let accX = 0;
  let foundLowX = false;
  for (let x = minX; x < maxX; x++) {
    accX += alphaProjX[x];
    if (!foundLowX && accX >= cutoffLow) {
      optMinX = x;
      foundLowX = true;
    }
    if (accX >= cutoffHigh) {
      optMaxX = x + 1;
      break;
    }
  }

  let accY = 0;
  let foundLowY = false;
  for (let y = minY; y < maxY; y++) {
    accY += alphaProjY[y];
    if (!foundLowY && accY >= cutoffLow) {
      optMinY = y;
      foundLowY = true;
    }
    if (accY >= cutoffHigh) {
      optMaxY = y + 1;
      break;
    }
  }

  const opticalBounds = {
    minX: Math.round((optMinX / scale) * 100) / 100,
    minY: Math.round((optMinY / scale) * 100) / 100,
    maxX: Math.round((optMaxX / scale) * 100) / 100,
    maxY: Math.round((optMaxY / scale) * 100) / 100,
  };

  return {
    densityPercent,
    opticalCentroid,
    bboxCenter,
    bbox,
    opticalBounds,
    bleed,
    driftFromCenter: {
      dx: Math.round((opticalCentroid.x - W / 2) * 100) / 100,
      dy: Math.round((opticalCentroid.y - H / 2) * 100) / 100,
    },
    opticalVsBBoxOffset: {
      dx: Math.round((opticalCentroid.x - bboxCenter.x) * 100) / 100,
      dy: Math.round((opticalCentroid.y - bboxCenter.y) * 100) / 100,
    },
  };
}

const SHAPE_TAGS = new Set([
  "path",
  "rect",
  "circle",
  "ellipse",
  "line",
  "polygon",
  "polyline",
]);

export const OpticalAnalyzer = {
  cache: new Map(),

  clearCache() {
    this.cache.clear();
  },

  measure(iconItem, W, H, P, transformData) {
    if (!iconItem?.rawInner) {
      return Promise.resolve(null);
    }

    const itemKey = iconItem.id || iconItem.name;
    const cacheKey = `${itemKey}_${W}x${H}_${P}_${transformData.transform || "id"}`;
    if (this.cache.has(cacheKey)) {
      return Promise.resolve(this.cache.get(cacheKey));
    }

    return new Promise((resolve) => {
      const processedInner = getColoredArtworkMarkup(
        iconItem,
        "theme",
        "#000000"
      );

      let domBbox = null;
      try {
        const tempSvg = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "svg"
        );
        tempSvg.setAttribute("viewBox", `0 0 ${W} ${H}`);
        tempSvg.setAttribute("width", String(W));
        tempSvg.setAttribute("height", String(H));
        tempSvg.setAttribute("class", "svg-measure-stage");

        const outerGroup = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "g"
        );
        const innerGroup = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "g"
        );
        if (transformData.transform) {
          innerGroup.setAttribute("transform", transformData.transform);
        }
        innerGroup.innerHTML = processedInner;

        innerGroup.querySelectorAll("*").forEach((el) => {
          const tag = el.tagName.toLowerCase();
          if (!SHAPE_TAGS.has(tag)) {
            return;
          }
          const fill = (el.getAttribute("fill") || "").toLowerCase();
          const stroke = (el.getAttribute("stroke") || "").toLowerCase();
          const op = el.getAttribute("opacity");
          const vis = (el.getAttribute("visibility") || "").toLowerCase();
          const disp = (el.getAttribute("display") || "").toLowerCase();
          const isFillNone = fill === "none" || fill === "transparent";
          const isStrokeNone =
            !stroke || stroke === "none" || stroke === "transparent";
          if (
            (isFillNone && isStrokeNone) ||
            op === "0" ||
            vis === "hidden" ||
            disp === "none"
          ) {
            el.remove();
          }
        });

        outerGroup.appendChild(innerGroup);
        tempSvg.appendChild(outerGroup);
        document.body.appendChild(tempSvg);

        if (outerGroup.getBBox) {
          try {
            domBbox = outerGroup.getBBox({
              stroke: true,
              fill: true,
              markers: true,
            });
          } catch {
            domBbox = outerGroup.getBBox();
          }
        }
        document.body.removeChild(tempSvg);
      } catch {
        // Fallback to raster-only bbox
      }

      // Adaptive supersampling: up to 8x on 24px icons (0.125px precision), 1x–2x on 512px
      const scale = Math.max(1, Math.min(8, Math.round(192 / Math.max(W, H))));
      const canvasW = Math.round(W * scale);
      const canvasH = Math.round(H * scale);

      const canvas = document.createElement("canvas");
      canvas.width = canvasW;
      canvas.height = canvasH;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) {
        return resolve(null);
      }

      const tfAttr = transformData.transform
        ? ` transform="${transformData.transform}"`
        : "";
      const svgString = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${canvasW}" height="${canvasH}">
          <g${tfAttr}>${processedInner}</g>
        </svg>
      `;

      const blob = new Blob([svgString], {
        type: "image/svg+xml;charset=utf-8",
      });
      const url = URL.createObjectURL(blob);
      const img = new Image();

      img.onload = () => {
        ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(url);

        const data = ctx.getImageData(0, 0, canvasW, canvasH).data;
        const alphaBuffer = new Uint8Array(canvasW * canvasH);
        for (let i = 0; i < alphaBuffer.length; i++) {
          alphaBuffer[i] = data[i * 4 + 3];
        }

        const result = computeOpticalMetricsFromAlpha(
          alphaBuffer,
          canvasW,
          canvasH,
          scale,
          W,
          H,
          P,
          domBbox
        );

        if (this.cache.size > 64) {
          this.cache.clear();
        }
        this.cache.set(cacheKey, result);
        resolve(result);
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(null);
      };

      img.src = url;
    });
  },
};
