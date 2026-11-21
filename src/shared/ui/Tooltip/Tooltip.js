/**
 * Delegated pill-tooltip controller for elements with `data-tooltip="..."`.
 * Uses :focus-visible so mouse clicks never leave sticky tooltips behind.
 */

export function initTooltipSystem() {
  const ac = new AbortController();
  const { signal } = ac;

  const tipEl = document.createElement("div");
  tipEl.className = "ui-tooltip";
  tipEl.setAttribute("role", "tooltip");
  tipEl.setAttribute("aria-hidden", "true");
  document.body.appendChild(tipEl);

  let activeTarget = null;
  let showTimer = null;

  function position(target) {
    const rect = target.getBoundingClientRect();
    const tipW = tipEl.offsetWidth;
    const tipH = tipEl.offsetHeight;
    const gap = 8;

    let left = rect.left + rect.width / 2 - tipW / 2;
    left = Math.max(8, Math.min(window.innerWidth - tipW - 8, left));

    let top = rect.top - tipH - gap;
    if (top < 8) {
      top = rect.bottom + gap;
    }

    tipEl.style.left = `${Math.round(left)}px`;
    tipEl.style.top = `${Math.round(top)}px`;
  }

  function show(target) {
    const text = target?.getAttribute("data-tooltip");
    if (!text) {
      return;
    }
    tipEl.textContent = text;
    tipEl.removeAttribute("aria-hidden");
    position(target);
    tipEl.classList.add("is-visible");
  }

  function hide() {
    clearTimeout(showTimer);
    activeTarget = null;
    tipEl.setAttribute("aria-hidden", "true");
    tipEl.classList.remove("is-visible");
  }

  document.addEventListener(
    "pointerover",
    (e) => {
      const target = e.target?.closest?.("[data-tooltip]");
      if (!target || target === activeTarget) {
        return;
      }
      clearTimeout(showTimer);
      activeTarget = target;
      showTimer = setTimeout(() => {
        if (activeTarget === target) {
          show(target);
        }
      }, 180);
    },
    { signal }
  );

  document.addEventListener(
    "pointerout",
    (e) => {
      const target = e.target?.closest?.("[data-tooltip]");
      if (target && target === activeTarget) {
        hide();
      }
    },
    { signal }
  );

  document.addEventListener("pointerdown", () => hide(), { signal });

  document.addEventListener(
    "focusin",
    (e) => {
      const target = e.target?.closest?.("[data-tooltip]");
      if (target?.matches?.(":focus-visible")) {
        show(target);
      }
    },
    { signal }
  );

  document.addEventListener(
    "focusout",
    (e) => {
      const target = e.target?.closest?.("[data-tooltip]");
      if (target && target === activeTarget) {
        hide();
      }
    },
    { signal }
  );

  window.addEventListener(
    "scroll",
    () => {
      if (activeTarget) {
        position(activeTarget);
      }
    },
    { passive: true, signal }
  );

  function destroy() {
    ac.abort();
    clearTimeout(showTimer);
    tipEl.remove();
  }

  return { destroy };
}
