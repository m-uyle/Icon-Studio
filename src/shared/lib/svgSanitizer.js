/**
 * SVG Security Sanitizer — strips active content, external URLs, and event handlers.
 */

const DANGEROUS_SVG_TAGS = [
  "script",
  "foreignobject",
  "iframe",
  "object",
  "embed",
  "meta",
  "link",
  "base",
  "applet",
  "animate",
  "set",
  "use",
  "math",
  "cursor",
  "image",
  "feimage",
];

const EXTERNAL_URL_RE = /url\s*\(\s*['"]?(?:https?:|\/\/|data:)/iu;
const DANGEROUS_SCHEME_RE = /^(?:javascript|vbscript|data|https?:|\/\/)/iu;
const URL_ATTRS = new Set([
  "href",
  "xlink:href",
  "src",
  "data",
  "action",
  "formaction",
]);

export function sanitizeSvgNode(rootNode) {
  if (!rootNode || typeof rootNode.querySelectorAll !== "function") {
    return rootNode;
  }

  DANGEROUS_SVG_TAGS.forEach((tag) => {
    rootNode.querySelectorAll(tag).forEach((el) => el.remove());
  });

  rootNode.querySelectorAll("style").forEach((styleEl) => {
    const css = styleEl.textContent || "";
    if (/@import/iu.test(css) || EXTERNAL_URL_RE.test(css)) {
      styleEl.remove();
    }
  });

  const stripElementAttrs = (el) => {
    Array.from(el.attributes || []).forEach((attr) => {
      const name = attr.name.toLowerCase();
      const val = attr.value.trim().toLowerCase();

      if (name.startsWith("on")) {
        el.removeAttribute(attr.name);
        return;
      }
      if (URL_ATTRS.has(name) && DANGEROUS_SCHEME_RE.test(val)) {
        el.removeAttribute(attr.name);
        return;
      }
      if (
        name === "style" &&
        (val.includes("expression(") ||
          val.includes("javascript:") ||
          EXTERNAL_URL_RE.test(val))
      ) {
        el.removeAttribute("style");
      }
    });
  };

  stripElementAttrs(rootNode);
  rootNode.querySelectorAll("*").forEach(stripElementAttrs);

  return rootNode;
}
