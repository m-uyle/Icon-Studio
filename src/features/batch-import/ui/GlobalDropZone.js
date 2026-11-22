import { extractSvgFromClipboard } from "../model/clipboardImport.js";

const OVERLAY_MARKUP = `
  <div class="global-drop-overlay is-hidden" id="globalDropOverlay">
    <div class="global-drop-overlay__card">
      <div aria-hidden="true" class="global-drop-overlay__icon">
        <svg fill="none" height="24" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" width="24">
          <path d="M4 16v1a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-1m-4-8-4-4m0 0L8 8m4-4v12" />
        </svg>
      </div>
      <span class="global-drop-overlay__text">Drop SVG files anywhere to import</span>
    </div>
  </div>
`;

/**
 * Initializes global window-level drag-and-drop overlay and clipboard paste importing.
 *
 * @param {Object} [options]
 * @param {HTMLElement} [options.container] - Target DOM container for overlay
 * @param {(files: File[]) => Promise<void>|void} [options.onImportFiles] - Callback when SVG files are dropped or pasted
 * @param {(svgString: string, filename: string) => Promise<void>|void} [options.onImportSvgString] - Callback when raw SVG string is pasted
 * @param {(msg: string) => void} [options.onNotify] - Optional toast/notification callback
 * @returns {{ destroy: () => void }}
 */
export function initGlobalDropZone({
  container = document.body,
  onImportFiles,
  onImportSvgString,
  onNotify,
} = {}) {
  let overlay = container.querySelector("#globalDropOverlay");

  if (overlay?.__dropZoneController) {
    return overlay.__dropZoneController;
  }

  let didInjectOverlay = false;

  if (!overlay) {
    container.insertAdjacentHTML("beforeend", OVERLAY_MARKUP);
    overlay = container.querySelector("#globalDropOverlay");
    didInjectOverlay = true;
  }

  const ac = new AbortController();
  const { signal } = ac;

  let dragCounter = 0;

  window.addEventListener(
    "dragenter",
    (e) => {
      if (e.dataTransfer?.types?.includes("Files")) {
        dragCounter++;
        overlay?.classList.remove("is-hidden");
      }
    },
    { signal }
  );

  window.addEventListener(
    "dragover",
    (e) => {
      if (e.dataTransfer?.types?.includes("Files")) {
        e.preventDefault();
        if (e.dataTransfer) {
          e.dataTransfer.dropEffect = "copy";
        }
      }
    },
    { signal }
  );

  window.addEventListener(
    "dragleave",
    () => {
      dragCounter--;
      if (dragCounter <= 0) {
        dragCounter = 0;
        overlay?.classList.add("is-hidden");
      }
    },
    { signal }
  );

  window.addEventListener(
    "dragend",
    () => {
      dragCounter = 0;
      overlay?.classList.add("is-hidden");
    },
    { signal }
  );

  window.addEventListener(
    "drop",
    async (e) => {
      dragCounter = 0;
      overlay?.classList.add("is-hidden");
      const files = Array.from(e.dataTransfer?.files || []);
      if (!files.length) {
        return;
      }
      e.preventDefault();
      const svgFiles = files.filter(
        (f) =>
          f.name.toLowerCase().endsWith(".svg") ||
          (f.type || "").includes("svg")
      );
      if (!svgFiles.length) {
        onNotify?.("No SVG files found");
        return;
      }
      await onImportFiles?.(svgFiles);
    },
    { signal }
  );

  window.addEventListener(
    "paste",
    async (e) => {
      const active = document.activeElement;
      const isInput =
        ["INPUT", "TEXTAREA", "SELECT"].includes(active?.tagName) ||
        Boolean(active?.isContentEditable);
      if (isInput) {
        return;
      }

      const clipboard = e.clipboardData || window.clipboardData;
      if (!clipboard) {
        return;
      }

      // 1. Handle file paste (e.g. copied .svg files in Finder / Explorer)
      const files = Array.from(clipboard.files || []);
      const svgFiles = files.filter(
        (f) =>
          f.type === "image/svg+xml" || f.name?.toLowerCase().endsWith(".svg")
      );
      if (svgFiles.length > 0) {
        e.preventDefault();
        await onImportFiles?.(svgFiles);
        return;
      }

      // 2. Extract SVG payload from Figma, Illustrator, or HTML/text
      const svgMarkup = extractSvgFromClipboard(clipboard);
      if (svgMarkup) {
        e.preventDefault();
        await onImportSvgString?.(
          svgMarkup,
          `clipboard-${Date.now().toString(36)}.svg`
        );
      }
    },
    { signal }
  );

  function destroy() {
    ac.abort();
    if (overlay) {
      overlay.__dropZoneController = null;
    }
    if (didInjectOverlay && overlay?.parentNode) {
      overlay.parentNode.removeChild(overlay);
    }
  }

  const controller = { destroy };
  if (overlay) {
    overlay.__dropZoneController = controller;
  }

  return controller;
}
