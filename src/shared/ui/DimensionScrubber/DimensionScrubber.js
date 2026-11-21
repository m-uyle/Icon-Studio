/**
 * Reusable DimensionScrubber behavior (drag, direct integer input, full keyboard + ARIA support).
 */

export function bindDimensionScrubber(
  scrubberEl,
  { min = 8, max = 1024, getValue, onDragStart, onChange }
) {
  const input = scrubberEl.querySelector(".dim-scrubber__input");
  let isDragging = false;
  let startX = 0;
  let startSnapshot = null;
  let didMove = false;

  const openEditor = () => {
    if (!input) {
      return;
    }
    input.classList.remove("is-hidden");
    input.value = String(getValue());
    input.focus();
    input.select();
  };

  const commitEditor = () => {
    if (!input || input.classList.contains("is-hidden")) {
      return;
    }
    input.classList.add("is-hidden");
    let parsed = Number.parseInt(input.value, 10);
    if (!Number.isFinite(parsed)) {
      parsed = getValue();
    }
    parsed = Math.max(min, Math.min(max, parsed));
    onChange(parsed, null);
  };

  scrubberEl.addEventListener("keydown", (e) => {
    if (e.target === input) {
      return;
    }
    const step = e.shiftKey ? 8 : 1;
    if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      e.preventDefault();
      onChange(Math.max(min, Math.min(max, getValue() + step)), null);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      e.preventDefault();
      onChange(Math.max(min, Math.min(max, getValue() - step)), null);
    } else if (e.key === "Enter") {
      e.preventDefault();
      openEditor();
    }
  });

  scrubberEl.addEventListener("pointerdown", (e) => {
    if (e.target === input) {
      return;
    }
    isDragging = true;
    didMove = false;
    startX = e.clientX;
    startSnapshot = onDragStart ? onDragStart() : { value: getValue() };
    try {
      scrubberEl.setPointerCapture(e.pointerId);
    } catch {}
  });

  scrubberEl.addEventListener("pointermove", (e) => {
    if (!isDragging) {
      return;
    }
    const dx = e.clientX - startX;
    if (!didMove && Math.abs(dx) > 2) {
      didMove = true;
    }
    if (!didMove) {
      return;
    }
    const mult = e.shiftKey ? 4 : e.altKey ? 0.25 : 1;
    const delta = Math.round((dx / 3) * mult);
    const nextVal = Math.max(min, Math.min(max, startSnapshot.value + delta));
    onChange(nextVal, startSnapshot);
  });

  const endDrag = (e) => {
    if (!isDragging) {
      return;
    }
    isDragging = false;
    try {
      scrubberEl.releasePointerCapture(e.pointerId);
    } catch {}
    if (!didMove && e.type === "pointerup") {
      openEditor();
    }
  };

  scrubberEl.addEventListener("pointerup", endDrag);
  scrubberEl.addEventListener("pointercancel", endDrag);

  if (input) {
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        commitEditor();
      } else if (e.key === "Escape") {
        e.preventDefault();
        input.classList.add("is-hidden");
        scrubberEl.focus();
      }
    });
    input.addEventListener("blur", commitEditor);
  }

  function sync() {
    const val = getValue();
    const valEl = scrubberEl.querySelector(".dim-scrubber__val");
    if (valEl) {
      valEl.textContent = String(val);
    }
    scrubberEl.setAttribute("aria-valuenow", String(val));
    scrubberEl.setAttribute("aria-valuemin", String(min));
    scrubberEl.setAttribute("aria-valuemax", String(max));
  }

  return { sync };
}
