/**
 * GeometryMath — SVG primitive conversion, spec-compliant path tokenizer (including
 * compact SVG arc flags like `a2 2 0 014 0`), 2D affine matrix algebra for SVG
 * `transform` attributes, and exact line-box clipping.
 */

let sharedParser = null;

export function getSvgParser() {
  if (!sharedParser && typeof DOMParser !== "undefined") {
    sharedParser = new DOMParser();
  }
  return sharedParser;
}

export function convertShapeToPathData(el) {
  const tag = (el.tagName || "").toLowerCase();
  if (tag === "path") {
    return el.getAttribute("d") || "";
  }

  if (tag === "rect") {
    const x = Number.parseFloat(el.getAttribute("x")) || 0;
    const y = Number.parseFloat(el.getAttribute("y")) || 0;
    const w = Number.parseFloat(el.getAttribute("width")) || 0;
    const h = Number.parseFloat(el.getAttribute("height")) || 0;
    if (w <= 0 || h <= 0) {
      return "";
    }
    let rx = Number.parseFloat(el.getAttribute("rx")) || 0;
    let ry = Number.parseFloat(el.getAttribute("ry")) || 0;
    if (rx && !ry) {
      ry = rx;
    }
    if (ry && !rx) {
      rx = ry;
    }
    rx = Math.min(Math.max(0, rx), w / 2);
    ry = Math.min(Math.max(0, ry), h / 2);

    if (!(rx || ry)) {
      return `M ${x} ${y} h ${w} v ${h} h ${-w} Z`;
    }
    return `M ${x + rx} ${y} h ${w - 2 * rx} a ${rx} ${ry} 0 0 1 ${rx} ${ry} v ${h - 2 * ry} a ${rx} ${ry} 0 0 1 ${-rx} ${ry} h ${-(w - 2 * rx)} a ${rx} ${ry} 0 0 1 ${-rx} ${-ry} v ${-(h - 2 * ry)} a ${rx} ${ry} 0 0 1 ${rx} ${-ry} Z`;
  }

  if (tag === "circle") {
    const cx = Number.parseFloat(el.getAttribute("cx")) || 0;
    const cy = Number.parseFloat(el.getAttribute("cy")) || 0;
    const r = Number.parseFloat(el.getAttribute("r")) || 0;
    if (r <= 0) {
      return "";
    }
    return `M ${cx - r} ${cy} a ${r} ${r} 0 1 0 ${r * 2} 0 a ${r} ${r} 0 1 0 ${-r * 2} 0 Z`;
  }

  if (tag === "ellipse") {
    const cx = Number.parseFloat(el.getAttribute("cx")) || 0;
    const cy = Number.parseFloat(el.getAttribute("cy")) || 0;
    const rx = Number.parseFloat(el.getAttribute("rx")) || 0;
    const ry = Number.parseFloat(el.getAttribute("ry")) || 0;
    if (rx <= 0 || ry <= 0) {
      return "";
    }
    return `M ${cx - rx} ${cy} a ${rx} ${ry} 0 1 0 ${rx * 2} 0 a ${rx} ${ry} 0 1 0 ${-rx * 2} 0 Z`;
  }

  if (tag === "line") {
    const x1 = Number.parseFloat(el.getAttribute("x1")) || 0;
    const y1 = Number.parseFloat(el.getAttribute("y1")) || 0;
    const x2 = Number.parseFloat(el.getAttribute("x2")) || 0;
    const y2 = Number.parseFloat(el.getAttribute("y2")) || 0;
    return `M ${x1} ${y1} L ${x2} ${y2}`;
  }

  if (tag === "polyline" || tag === "polygon") {
    const rawPts = (el.getAttribute("points") || "").trim();
    if (!rawPts) {
      return "";
    }
    const pts = rawPts
      .split(/[\s,]+/u)
      .map(Number)
      .filter((n) => Number.isFinite(n));
    if (pts.length < 2) {
      return "";
    }
    let d = `M ${pts[0]} ${pts[1]}`;
    for (let i = 2; i + 1 < pts.length; i += 2) {
      d += ` L ${pts[i]} ${pts[i + 1]}`;
    }
    if (tag === "polygon") {
      d += " Z";
    }
    return d;
  }

  return "";
}

/**
 * Spec-compliant SVG path argument reader that correctly parses compact arc flags
 * (e.g. `a2 2 0 014 0` -> [2, 2, 0, 0, 1, 4, 0]).
 */
function parseArcArgs(raw) {
  const result = [];
  let idx = 0;
  const len = raw.length;
  const numRe = /^[+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?/u;

  const skipSep = () => {
    while (
      idx < len &&
      (raw[idx] === " " ||
        raw[idx] === "\t" ||
        raw[idx] === "\n" ||
        raw[idx] === "\r" ||
        raw[idx] === ",")
    ) {
      idx++;
    }
  };

  while (idx < len) {
    skipSep();
    if (idx >= len) {
      break;
    }

    const paramPos = result.length % 7;
    if (paramPos === 3 || paramPos === 4) {
      // large-arc-flag or sweep-flag: strictly single digit '0' or '1'
      const ch = raw[idx];
      if (ch === "0" || ch === "1") {
        result.push(ch === "1" ? 1 : 0);
        idx++;
        continue;
      }
      break;
    }

    const slice = raw.slice(idx);
    const m = numRe.exec(slice);
    if (!m) {
      break;
    }
    result.push(Number.parseFloat(m[0]));
    idx += m[0].length;
  }

  return result;
}

export function extractPathPoints(pathD) {
  if (!pathD) {
    return [];
  }
  const commandRegex = /([a-df-z])([^a-df-z]*)/giu;
  const numberRegex = /[+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?/gu;

  const points = [];
  let currX = 0;
  let currY = 0;
  let startX = 0;
  let startY = 0;
  let match;

  while ((match = commandRegex.exec(pathD)) !== null) {
    const cmd = match[1];
    const isRel = cmd === cmd.toLowerCase();
    const type = cmd.toUpperCase();

    if (type === "Z") {
      currX = startX;
      currY = startY;
      points.push({ x: currX, y: currY, isAnchor: true });
      continue;
    }

    const args =
      type === "A"
        ? parseArcArgs(match[2])
        : (match[2].match(numberRegex) || [])
            .map(Number.parseFloat)
            .filter(Number.isFinite);

    let i = 0;
    switch (type) {
      case "M":
        while (i + 1 < args.length) {
          const x = isRel ? currX + args[i] : args[i];
          const y = isRel ? currY + args[i + 1] : args[i + 1];
          if (i === 0) {
            startX = x;
            startY = y;
          }
          currX = x;
          currY = y;
          points.push({ x, y, isAnchor: true });
          i += 2;
        }
        break;

      case "L":
      case "T":
        while (i + 1 < args.length) {
          currX = isRel ? currX + args[i] : args[i];
          currY = isRel ? currY + args[i + 1] : args[i + 1];
          points.push({ x: currX, y: currY, isAnchor: true });
          i += 2;
        }
        break;

      case "H":
        while (i < args.length) {
          currX = isRel ? currX + args[i] : args[i];
          points.push({ x: currX, y: currY, isAnchor: true });
          i++;
        }
        break;

      case "V":
        while (i < args.length) {
          currY = isRel ? currY + args[i] : args[i];
          points.push({ x: currX, y: currY, isAnchor: true });
          i++;
        }
        break;

      case "C":
        while (i + 5 < args.length) {
          currX = isRel ? currX + args[i + 4] : args[i + 4];
          currY = isRel ? currY + args[i + 5] : args[i + 5];
          points.push({ x: currX, y: currY, isAnchor: true });
          i += 6;
        }
        break;

      case "S":
      case "Q":
        while (i + 3 < args.length) {
          currX = isRel ? currX + args[i + 2] : args[i + 2];
          currY = isRel ? currY + args[i + 3] : args[i + 3];
          points.push({ x: currX, y: currY, isAnchor: true });
          i += 4;
        }
        break;

      case "A":
        while (i + 6 < args.length) {
          currX = isRel ? currX + args[i + 5] : args[i + 5];
          currY = isRel ? currY + args[i + 6] : args[i + 6];
          points.push({ x: currX, y: currY, isAnchor: true });
          i += 7;
        }
        break;
    }
  }

  return points;
}

/* --- 2D Affine Matrix Helpers [a, b, c, d, e, f] --- */
export const IDENTITY_MATRIX = [1, 0, 0, 1, 0, 0];

export function multiplyMatrices(m1, m2) {
  return [
    m1[0] * m2[0] + m1[2] * m2[1],
    m1[1] * m2[0] + m1[3] * m2[1],
    m1[0] * m2[2] + m1[2] * m2[3],
    m1[1] * m2[2] + m1[3] * m2[3],
    m1[0] * m2[4] + m1[2] * m2[5] + m1[4],
    m1[1] * m2[4] + m1[3] * m2[5] + m1[5],
  ];
}

export function applyMatrixToPoint(m, x, y) {
  return {
    x: m[0] * x + m[2] * y + m[4],
    y: m[1] * x + m[3] * y + m[5],
  };
}

export function parseSvgTransformAttr(transformStr) {
  if (!transformStr) {
    return IDENTITY_MATRIX;
  }
  const fnRe = /(matrix|translate|scale|rotate|skewX|skewY)\s*\(([^)]*)\)/giu;
  let mat = IDENTITY_MATRIX;
  let m;

  while ((m = fnRe.exec(transformStr)) !== null) {
    const fn = m[1].toLowerCase();
    const args = (
      m[2].match(/[+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?/gu) || []
    ).map(Number.parseFloat);
    let next = IDENTITY_MATRIX;

    if (fn === "translate" && args.length >= 1) {
      next = [1, 0, 0, 1, args[0], args[1] ?? 0];
    } else if (fn === "scale" && args.length >= 1) {
      next = [args[0], 0, 0, args[1] ?? args[0], 0, 0];
    } else if (fn === "rotate" && args.length >= 1) {
      const rad = (args[0] * Math.PI) / 180;
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);
      if (args.length >= 3) {
        const [, cx, cy] = args;
        next = multiplyMatrices(
          [1, 0, 0, 1, cx, cy],
          multiplyMatrices([cos, sin, -sin, cos, 0, 0], [1, 0, 0, 1, -cx, -cy])
        );
      } else {
        next = [cos, sin, -sin, cos, 0, 0];
      }
    } else if (fn === "skewx" && args.length >= 1) {
      next = [1, 0, Math.tan((args[0] * Math.PI) / 180), 1, 0, 0];
    } else if (fn === "skewy" && args.length >= 1) {
      next = [1, Math.tan((args[0] * Math.PI) / 180), 0, 1, 0, 0];
    } else if (fn === "matrix" && args.length >= 6) {
      next = args.slice(0, 6);
    }

    mat = multiplyMatrices(mat, next);
  }

  return mat;
}

/**
 * Clips an infinite line through (cx, cy) at angle `angleRad` strictly to the
 * rectangle [0, W] x [0, H]. Prevents 30°/60° rays from leaking outside artboards.
 */
export function clipRayThroughCenter(cx, cy, angleRad, W, H) {
  const dx = Math.cos(angleRad);
  const dy = Math.sin(angleRad);
  let tMin = Number.NEGATIVE_INFINITY;
  let tMax = Number.POSITIVE_INFINITY;

  if (Math.abs(dx) > 1e-9) {
    const tx1 = (0 - cx) / dx;
    const tx2 = (W - cx) / dx;
    tMin = Math.max(tMin, Math.min(tx1, tx2));
    tMax = Math.min(tMax, Math.max(tx1, tx2));
  }
  if (Math.abs(dy) > 1e-9) {
    const ty1 = (0 - cy) / dy;
    const ty2 = (H - cy) / dy;
    tMin = Math.max(tMin, Math.min(ty1, ty2));
    tMax = Math.min(tMax, Math.max(ty1, ty2));
  }

  return {
    x1: cx + tMin * dx,
    y1: cy + tMin * dy,
    x2: cx + tMax * dx,
    y2: cy + tMax * dy,
  };
}
