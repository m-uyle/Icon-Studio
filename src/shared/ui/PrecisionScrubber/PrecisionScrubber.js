/**
 * Reusable PrecisionScrubber behavior (drag, step +/-, direct numeric input, keyboard arrows/Enter).
 */

export function bindPrecisionScrubber(
  scrubberEl,
  { getValue, getBounds, onChange }
) {
  const input = scrubberEl.querySelector(".scrubber-input");
  let isDragging = false;
  let startX = 0;
  let startVal = 0;
  let didMove = false;

  const openEditor = () => {
    if (!input) {
      return;
    }
    const bounds = getBounds();
    input.step = String(bounds.step);
    input.min = String(bounds.min);
    input.max = String(bounds.max);
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
    const parsed = Number.parseFloat(input.value);
    if (Number.isFinite(parsed)) {
      onChange(parsed);
    }
  };

  scrubberEl.addEventListener("keydown", (e) => {
    if (e.target === input) {
      return;
    }
    const bounds = getBounds();
    const step = bounds.step * (e.shiftKey ? 4 : 1);
    if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      e.preventDefault();
      onChange(getValue() + step);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      e.preventDefault();
      onChange(getValue() - step);
    } else if (e.key === "Enter") {
      e.preventDefault();
      openEditor();
    }
  });

  scrubberEl.addEventListener("pointerdown", (e) => {
    if (e.target.closest(".scrubber-step-btn") || e.target === input) {
      return;
    }
    isDragging = true;
    didMove = false;
    startX = e.clientX;
    startVal = getValue();
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
    const bounds = getBounds();
    const mult = e.shiftKey ? 4 : e.altKey ? 0.2 : 1;
    onChange(startVal + dx * (bounds.step / 5) * mult);
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

  scrubberEl.querySelectorAll(".scrubber-step-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const bounds = getBounds();
      const delta = btn.dataset.action === "inc" ? bounds.step : -bounds.step;
      onChange(getValue() + delta);
    });
  });

  function sync() {
    const val = getValue();
    const bounds = getBounds();
    const valSpan = scrubberEl.querySelector(".scrubber-val");
    const bar = scrubberEl.querySelector(".scrubber-bar");
    if (valSpan) {
      valSpan.textContent = val.toFixed(bounds.decimals);
    }
    if (scrubberEl.getAttribute("role") === "slider") {
      scrubberEl.setAttribute("aria-valuenow", String(val));
      scrubberEl.setAttribute("aria-valuemin", String(bounds.min));
      scrubberEl.setAttribute("aria-valuemax", String(bounds.max));
    } else if (input) {
      input.value = String(val);
      input.min = String(bounds.min);
      input.max = String(bounds.max);
    }
    if (bar) {
      const range = bounds.max - bounds.min;
      const pct =
        range <= 0
          ? 0
          : Math.max(0, Math.min(100, ((val - bounds.min) / range) * 100));
      bar.style.width = `${pct}%`;
    }
  }

  return { sync };
}
