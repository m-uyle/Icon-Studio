/**
 * Reusable accessible modal dialog controller using native <dialog>.
 * Complies with modern web guidance (light dismiss, scroll containment, top-layer, focus restoration).
 */
export function initModal(dialogEl, { onClose } = {}) {
  if (!dialogEl) {
    return {
      open: () => {},
      close: () => {},
      isOpen: () => false,
      destroy: () => {},
    };
  }

  const ac = new AbortController();
  const { signal } = ac;

  let previousActiveElement = null;
  let isBackdropClick = false;

  function open() {
    if (typeof dialogEl.showModal === "function" && !dialogEl.open) {
      previousActiveElement = document.activeElement;
      dialogEl.showModal();
      dialogEl.focus?.({ preventScroll: true });
    }
  }

  function close() {
    if (typeof dialogEl.close === "function" && dialogEl.open) {
      dialogEl.close();
    }
  }

  function isOpen() {
    return Boolean(dialogEl.open);
  }

  // Track pointerdown to distinguish true backdrop clicks from text selection drag-outs
  dialogEl.addEventListener(
    "pointerdown",
    (e) => {
      isBackdropClick = e.target === dialogEl;
    },
    { signal }
  );

  // Delegated click handler for [data-modal-close] and backdrop dismiss
  dialogEl.addEventListener(
    "click",
    (e) => {
      const closeBtn = e.target.closest?.("[data-modal-close]");
      if (closeBtn && dialogEl.contains(closeBtn)) {
        close();
        return;
      }
      if (isBackdropClick && e.target === dialogEl) {
        close();
      }
      isBackdropClick = false;
    },
    { signal }
  );

  // Single source of truth for close lifecycle (handles programmatic close, button, and Escape key)
  dialogEl.addEventListener(
    "close",
    () => {
      if (
        previousActiveElement &&
        typeof previousActiveElement.focus === "function"
      ) {
        previousActiveElement.focus({ preventScroll: true });
        previousActiveElement = null;
      }
      onClose?.();
    },
    { signal }
  );

  function destroy() {
    ac.abort();
    if (typeof dialogEl.close === "function" && dialogEl.open) {
      dialogEl.close();
    }
    previousActiveElement = null;
  }

  return {
    open,
    close,
    isOpen,
    destroy,
  };
}
