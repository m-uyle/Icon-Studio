import { getSvgParser, sanitizeIdentifier } from "../../../shared/lib/index.js";

const JSX_ATTR_MAP = {
  class: "className",
  "stroke-width": "strokeWidth",
  "stroke-linecap": "strokeLinecap",
  "stroke-linejoin": "strokeLinejoin",
  "stroke-miterlimit": "strokeMiterlimit",
  "stroke-dasharray": "strokeDasharray",
  "stroke-dashoffset": "strokeDashoffset",
  "stroke-opacity": "strokeOpacity",
  "fill-rule": "fillRule",
  "fill-opacity": "fillOpacity",
  "clip-rule": "clipRule",
  "clip-path": "clipPath",
  "stop-color": "stopColor",
  "stop-opacity": "stopOpacity",
  "vector-effect": "vectorEffect",
  "shape-rendering": "shapeRendering",
  "text-anchor": "textAnchor",
  "dominant-baseline": "dominantBaseline",
  "font-size": "fontSize",
  "font-family": "fontFamily",
  "font-weight": "fontWeight",
  preserveaspectratio: "preserveAspectRatio",
  "xlink:href": "xlinkHref",
  "xmlns:xlink": "xmlnsXlink",
};

function convertStyleStringToJsxObject(styleStr) {
  if (!styleStr) {
    return "";
  }
  const pairs = styleStr
    .split(";")
    .map((p) => p.trim())
    .filter(Boolean);
  const props = pairs
    .map((pair) => {
      const colonIdx = pair.indexOf(":");
      if (colonIdx === -1) {
        return "";
      }
      const k = pair
        .slice(0, colonIdx)
        .trim()
        .replace(/-([a-z])/gu, (_, l) => l.toUpperCase());
      const v = pair.slice(colonIdx + 1).trim();
      return `${k}: '${v.replace(/'/gu, "\\'")}'`;
    })
    .filter(Boolean);
  return props.length ? `{{ ${props.join(", ")} }}` : "";
}

function toJsxAttrName(origName) {
  const lower = origName.toLowerCase();
  if (JSX_ATTR_MAP[lower]) {
    return JSX_ATTR_MAP[lower];
  }
  if (lower.startsWith("data-") || lower.startsWith("aria-")) {
    return origName;
  }
  if (origName.includes("-")) {
    return origName.replace(/-([a-z])/gu, (_, l) => l.toUpperCase());
  }
  return origName;
}

function nodeToJsx(node, indent = 4) {
  const spaces = " ".repeat(indent);
  if (node.nodeType === 3) {
    const text = (node.textContent || "").trim();
    return text ? `${spaces}${text}\n` : "";
  }
  if (node.nodeType === 8) {
    return `${spaces}{/* ${(node.textContent || "").trim()} */}\n`;
  }
  if (node.nodeType !== 1) {
    return "";
  }

  const tagName = node.tagName.toLowerCase();
  if (tagName === "style") {
    const cssContent = (node.textContent || "").replace(/`/gu, "\\`");
    return `${spaces}<style>{\`${cssContent}\`}</style>\n`;
  }

  const attrParts = [];
  Array.from(node.attributes || []).forEach((attr) => {
    const origName = attr.name;
    const origVal = attr.value;
    if (origName.toLowerCase() === "style") {
      const styleObj = convertStyleStringToJsxObject(origVal);
      if (styleObj) {
        attrParts.push(`style=${styleObj}`);
      }
      return;
    }
    const jsxName = toJsxAttrName(origName);
    attrParts.push(`${jsxName}="${origVal.replace(/"/gu, "&quot;")}"`);
  });

  const attrsString = attrParts.length > 0 ? ` ${attrParts.join(" ")}` : "";
  const children = Array.from(node.childNodes || []).filter(
    (n) =>
      n.nodeType === 1 ||
      (n.nodeType === 3 && (n.textContent || "").trim().length > 0)
  );
  if (children.length === 0) {
    return `${spaces}<${tagName}${attrsString} />\n`;
  }

  let inner = "";
  for (const child of children) {
    inner += nodeToJsx(child, indent + 2);
  }
  return `${spaces}<${tagName}${attrsString}>\n${inner}${spaces}</${tagName}>\n`;
}

export function generateReactCode(svgSource, state, curIcon) {
  const W = state.width;
  const H = state.height;
  const parser = getSvgParser();
  let innerJsx = "";

  if (parser) {
    const doc = parser.parseFromString(svgSource, "image/svg+xml");
    const svgEl = doc.querySelector("svg");
    if (svgEl) {
      Array.from(svgEl.childNodes).forEach((child) => {
        if (child.nodeType === 1) {
          innerJsx += nodeToJsx(child, 4);
        }
      });
    }
  }

  const compName = curIcon
    ? sanitizeIdentifier(curIcon.name, "Icon")
    : `Icon_${W}x${H}`;
  const isSquare = W === H;
  const propsSig = isSquare
    ? `{ size = ${W}, className, ...props }`
    : `{ width = ${W}, height = ${H}, className, ...props }`;
  const sizeAttrs = isSquare
    ? "    width={size}\n    height={size}"
    : "    width={width}\n    height={height}";

  return `import React from 'react';\n\nexport const ${compName} = (${propsSig}) => (\n  <svg\n${sizeAttrs}\n    viewBox="0 0 ${W} ${H}"\n    fill="none"\n    xmlns="http://www.w3.org/2000/svg"\n    className={className}\n    {...props}\n  >\n${innerJsx}  </svg>\n);`;
}
