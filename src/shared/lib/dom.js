/**
 * Pure DOM, string sanitization, and clipboard utilities.
 */

const SVG_EXT_REGEX = /\.svg$/iu;
const INVALID_IDENTIFIER_CHARS_REGEX = /[^a-zA-Z0-9]/gu;
const LEADING_UNDERSCORES_REGEX = /^_+/u;
const TRAILING_UNDERSCORES_REGEX = /_+$/u;
const STARTS_WITH_DIGIT_REGEX = /^[0-9]/u;
const INVALID_FILENAME_CHARS_REGEX = /[/\\?*:<>"|]/gu;
const PATH_TRAVERSAL_REGEX = /\.\./gu;
const MAC_PLATFORM_REGEX = /Mac|iPhone|iPad|iPod/iu;

/**
 * Escapes unsafe HTML characters in a string.
 *
 * @param {unknown} str - Input value
 * @returns {string} Sanitized HTML string
 */
export function escapeHtml(str) {
  if (str === null || str === undefined) {
    return "";
  }
  return String(str)
    .replace(/&/gu, "&amp;")
    .replace(/</gu, "&lt;")
    .replace(/>/gu, "&gt;")
    .replace(/"/gu, "&quot;")
    .replace(/'/gu, "&#39;");
}

/**
 * Sanitizes a string into a valid JavaScript / React component identifier.
 *
 * @param {string} name
 * @param {string} [fallbackPrefix='Icon']
 * @returns {string} Valid identifier
 */
export function sanitizeIdentifier(name, fallbackPrefix = "Icon") {
  let clean = String(name ?? "")
    .replace(SVG_EXT_REGEX, "")
    .replace(INVALID_IDENTIFIER_CHARS_REGEX, "_")
    .replace(LEADING_UNDERSCORES_REGEX, "")
    .replace(TRAILING_UNDERSCORES_REGEX, "");
  if (!clean || STARTS_WITH_DIGIT_REGEX.test(clean)) {
    clean = `${fallbackPrefix}_${clean || "Component"}`;
  }
  return clean;
}

/**
 * Sanitizes a filename removing forbidden filesystem and traversal characters.
 *
 * @param {string} name
 * @returns {string} Safe filename
 */
export function sanitizeFilename(name) {
  return (
    String(name || "icon")
      .replace(SVG_EXT_REGEX, "")
      .replace(INVALID_FILENAME_CHARS_REGEX, "_")
      .replace(PATH_TRAVERSAL_REGEX, "_")
      .trim() || "icon"
  );
}

/**
 * Generates a collision-resistant unique DOM identifier.
 *
 * @param {string} [prefix='id']
 * @returns {string} Unique ID
 */
export function createUniqueId(prefix = "id") {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Asynchronously writes text to the clipboard with fallback for non-secure contexts.
 *
 * @param {string} text
 * @returns {Promise<boolean>} Success status
 */
export async function copyToClipboard(text) {
  const content = text ?? "";
  if (
    typeof navigator !== "undefined" &&
    navigator.clipboard &&
    window.isSecureContext
  ) {
    try {
      await navigator.clipboard.writeText(content);
      return true;
    } catch {
      // Fallback below
    }
  }
  try {
    const ta = document.createElement("textarea");
    ta.value = content;
    ta.className = "sr-clipboard-proxy";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return Boolean(ok);
  } catch {
    return false;
  }
}

/**
 * Triggers an immediate browser file download for a Blob object.
 *
 * @param {Blob} blob
 * @param {string} filename
 */
export function triggerBlobDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

/**
 * Detects whether the current environment is running on macOS or iOS.
 *
 * @returns {boolean}
 */
function isMacPlatform() {
  if (typeof navigator === "undefined") {
    return false;
  }
  const platform =
    navigator.userAgentData?.platform ||
    navigator.platform ||
    navigator.userAgent ||
    "";
  return MAC_PLATFORM_REGEX.test(platform);
}

/**
 * Returns the platform-native paste keyboard shortcut label (⌘V for Mac, Ctrl+V for others).
 *
 * @returns {'⌘V' | 'Ctrl+V'}
 */
export function getPasteShortcutLabel() {
  return isMacPlatform() ? "⌘V" : "Ctrl+V";
}
