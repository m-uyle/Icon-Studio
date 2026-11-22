const SVG_BLOCK_REGEX = /<svg[\s\S]*?<\/svg>/iu;

/**
 * Extracts the first well-formed <svg>...</svg> block from a string payload.
 *
 * @param {string|null|undefined} payload
 * @returns {string|null} Extracted SVG markup string, or null
 */
function extractSvgFromString(payload) {
  if (!payload || typeof payload !== "string") {
    return null;
  }
  const lower = payload.toLowerCase();
  if (!(lower.includes("<svg") && lower.includes("</svg>"))) {
    return null;
  }
  const match = payload.match(SVG_BLOCK_REGEX);
  return match ? match[0].trim() : null;
}

/**
 * Robustly extracts raw SVG content from clipboard payload across Figma, Adobe Illustrator,
 * browsers (HTML), and plain text.
 *
 * @param {DataTransfer|null} clipboardData
 * @returns {string|null} Extracted SVG markup string, or null if none found
 */
export function extractSvgFromClipboard(clipboardData) {
  if (!clipboardData || typeof clipboardData.getData !== "function") {
    return null;
  }

  // 1. Direct SVG MIME type (image/svg+xml)
  const fromSvgMime = extractSvgFromString(
    clipboardData.getData("image/svg+xml")
  );
  if (fromSvgMime) {
    return fromSvgMime;
  }

  // 2. Plain text (Copy as SVG in Figma, Illustrator with SVG clipboard, code editors)
  const plainText =
    clipboardData.getData("text/plain") || clipboardData.getData("text");
  const fromText = extractSvgFromString(plainText);
  if (fromText) {
    return fromText;
  }

  // 3. HTML payload (Standard Cmd+C in Figma, Adobe web/desktop, browser copy)
  const html = clipboardData.getData("text/html");
  return extractSvgFromString(html);
}
