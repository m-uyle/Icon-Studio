/**
 * Pure DOM, string sanitization, and clipboard utilities.
 */

export function escapeHtml(str) {
  if (!str) {
    return "";
  }
  return String(str)
    .replace(/&/gu, "&amp;")
    .replace(/</gu, "&lt;")
    .replace(/>/gu, "&gt;")
    .replace(/"/gu, "&quot;")
    .replace(/'/gu, "&#39;");
}

export function sanitizeIdentifier(name, fallbackPrefix = "Icon") {
  let clean = (name || "")
    .replace(/\.svg$/iu, "")
    .replace(/[^a-zA-Z0-9]/gu, "_")
    .replace(/^_+/u, "")
    .replace(/_+$/u, "");
  if (!clean || /^[0-9]/u.test(clean)) {
    clean = `${fallbackPrefix}_${clean || "Component"}`;
  }
  return clean;
}

export function sanitizeFilename(name) {
  return (
    (name || "icon")
      .replace(/\.svg$/iu, "")
      .replace(/[/\\?*:<>"|]/gu, "_")
      .replace(/\.\./gu, "_")
      .trim() || "icon"
  );
}

export function createUniqueId(prefix = "id") {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export async function copyToClipboard(text) {
  if (
    typeof navigator !== "undefined" &&
    navigator.clipboard &&
    window.isSecureContext
  ) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fallback below
    }
  }
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
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
