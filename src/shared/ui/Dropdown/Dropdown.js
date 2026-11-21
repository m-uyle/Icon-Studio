/**
 * Accessible Design-System Dropdown component (replaces native <select>).
 * Supports grouped options, keyboard navigation (ArrowUp/Down/Home/End/Enter/Space/Escape),
 * viewport-aware flip positioning, and click-outside dismissal.
 */

import { escapeHtml } from "../../lib/index.js";

const CHECK_SVG =
  '<svg class="ui-dropdown__check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';

const CHEVRON_SVG =
  '<svg class="ui-dropdown__chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>';

export function createDropdown(
  hostEl,
  {
    options = [],
    value = "",
    ariaLabel = "Select option",
    standalone = false,
    menuWidth = null,
    signal = null,
    onChange = () => {},
  }
) {
  if (!hostEl) {
    return {
      getValue: () => value,
      setValue: () => {},
      close: () => {},
      destroy: () => {},
    };
  }

  const internalAc = signal ? null : new AbortController();
  const activeSignal = signal || internalAc.signal;

  // Flatten selectable items for keyboard indexing
  const flatItems = [];
  options.forEach((entry) => {
    if (entry.group && Array.isArray(entry.items)) {
      entry.items.forEach((item) => flatItems.push(item));
    } else if (entry.value !== undefined) {
      flatItems.push(entry);
    }
  });

  let currentValue = value || flatItems[0]?.value || "";
  let isOpen = false;
  let highlightedIdx = -1;

  hostEl.className = `ui-dropdown${standalone ? " ui-dropdown--standalone" : ""}`;
  hostEl.innerHTML = `
    <button type="button" class="ui-dropdown__trigger" aria-haspopup="listbox" aria-expanded="false">
      <span class="ui-dropdown__label truncate"></span>
      ${CHEVRON_SVG}
    </button>
  `;

  const triggerBtn = hostEl.querySelector(".ui-dropdown__trigger");
  const triggerLabel = hostEl.querySelector(".ui-dropdown__label");

  // Portal menu to document.body so it is never clipped by overflow:hidden panels
  const menuEl = document.createElement("div");
  menuEl.className = "ui-dropdown__menu app-scroll is-hidden";
  menuEl.setAttribute("role", "listbox");
  menuEl.setAttribute("aria-label", ariaLabel);
  document.body.appendChild(menuEl);

  const optionButtons = [];

  function buildMenu() {
    menuEl.innerHTML = "";
    optionButtons.length = 0;

    const appendOption = (item) => {
      const idx = optionButtons.length;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "ui-dropdown__option";
      btn.setAttribute("role", "option");
      btn.dataset.value = item.value;
      btn.dataset.index = String(idx);
      const metaHtml = item.meta
        ? `<span class="ui-dropdown__option-meta font-mono">${escapeHtml(item.meta)}</span>`
        : "";
      btn.innerHTML = `
        <span class="ui-dropdown__option-text truncate">${escapeHtml(item.label)}</span>
        ${metaHtml}
        ${CHECK_SVG}
      `;
      btn.addEventListener(
        "click",
        (e) => {
          e.stopPropagation();
          selectValue(item.value, true);
          close();
          triggerBtn.focus();
        },
        { signal: activeSignal }
      );
      btn.addEventListener("pointerenter", () => setHighlight(idx), {
        signal: activeSignal,
      });
      menuEl.appendChild(btn);
      optionButtons.push(btn);
    };

    options.forEach((entry) => {
      if (entry.group && Array.isArray(entry.items)) {
        const grp = document.createElement("div");
        grp.className = "ui-dropdown__group-label";
        grp.textContent = entry.group;
        menuEl.appendChild(grp);
        entry.items.forEach(appendOption);
      } else if (entry.value !== undefined) {
        appendOption(entry);
      }
    });
  }

  function syncSelectionUI() {
    const activeItem =
      flatItems.find((i) => i.value === currentValue) || flatItems[0];
    if (triggerLabel && activeItem) {
      triggerLabel.textContent = activeItem.shortLabel || activeItem.label;
      triggerBtn.title = activeItem.meta
        ? `${activeItem.label} (${activeItem.meta})`
        : activeItem.label;
    }
    optionButtons.forEach((btn) => {
      const selected = btn.dataset.value === currentValue;
      btn.classList.toggle("is-selected", selected);
      btn.setAttribute("aria-selected", selected ? "true" : "false");
    });
  }

  function setHighlight(idx) {
    if (idx < 0 || idx >= optionButtons.length) {
      return;
    }
    highlightedIdx = idx;
    optionButtons.forEach((btn, i) => {
      btn.classList.toggle("is-highlighted", i === highlightedIdx);
    });
    optionButtons[highlightedIdx]?.scrollIntoView({ block: "nearest" });
  }

  function positionMenu() {
    const rect = triggerBtn.getBoundingClientRect();
    const desiredW = menuWidth
      ? Math.max(rect.width, menuWidth)
      : Math.max(rect.width, 220);
    const clampedW = Math.min(desiredW, window.innerWidth - 16);
    menuEl.style.width = `${clampedW}px`;

    // Align right edge if near right viewport edge
    let left = rect.left;
    if (left + clampedW > window.innerWidth - 8) {
      left = Math.max(8, rect.right - clampedW);
    }
    menuEl.style.left = `${Math.round(left)}px`;

    const menuH = Math.min(menuEl.scrollHeight || 240, 288);
    const spaceBelow = window.innerHeight - rect.bottom - 8;
    const spaceAbove = rect.top - 8;

    if (spaceBelow >= menuH || spaceBelow >= spaceAbove) {
      menuEl.style.top = `${Math.round(rect.bottom + 4)}px`;
    } else {
      menuEl.style.top = `${Math.round(Math.max(8, rect.top - menuH - 4))}px`;
    }
  }

  function open() {
    if (isOpen) {
      return;
    }
    isOpen = true;
    hostEl.classList.add("is-open");
    triggerBtn.setAttribute("aria-expanded", "true");
    menuEl.classList.remove("is-hidden");
    positionMenu();
    const selIdx = optionButtons.findIndex(
      (b) => b.dataset.value === currentValue
    );
    setHighlight(Math.max(selIdx, 0));
  }

  function close() {
    if (!isOpen) {
      return;
    }
    isOpen = false;
    hostEl.classList.remove("is-open");
    triggerBtn.setAttribute("aria-expanded", "false");
    menuEl.classList.add("is-hidden");
  }

  function selectValue(nextVal, emit = false) {
    currentValue = nextVal;
    syncSelectionUI();
    if (emit) {
      onChange(currentValue);
    }
  }

  triggerBtn.addEventListener(
    "click",
    (e) => {
      e.stopPropagation();
      if (isOpen) {
        close();
      } else {
        open();
      }
    },
    { signal: activeSignal }
  );

  triggerBtn.addEventListener(
    "keydown",
    (e) => {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        if (isOpen) {
          const dir = e.key === "ArrowDown" ? 1 : -1;
          setHighlight(
            (highlightedIdx + dir + optionButtons.length) % optionButtons.length
          );
        } else {
          open();
        }
      } else if (e.key === "Home" && isOpen) {
        e.preventDefault();
        setHighlight(0);
      } else if (e.key === "End" && isOpen) {
        e.preventDefault();
        setHighlight(optionButtons.length - 1);
      } else if ((e.key === "Enter" || e.key === " ") && isOpen) {
        e.preventDefault();
        const target = optionButtons[highlightedIdx];
        if (target) {
          selectValue(target.dataset.value, true);
        }
        close();
      } else if (e.key === "Escape" && isOpen) {
        e.preventDefault();
        close();
      }
    },
    { signal: activeSignal }
  );

  document.addEventListener(
    "pointerdown",
    (e) => {
      if (!isOpen) {
        return;
      }
      if (!(hostEl.contains(e.target) || menuEl.contains(e.target))) {
        close();
      }
    },
    { signal: activeSignal }
  );

  window.addEventListener(
    "resize",
    () => {
      if (isOpen) {
        positionMenu();
      }
    },
    { signal: activeSignal }
  );

  buildMenu();
  syncSelectionUI();

  function destroy() {
    if (internalAc) {
      internalAc.abort();
    }
    menuEl.remove();
  }

  return {
    getValue: () => currentValue,
    setValue: (v) => selectValue(v, false),
    close,
    destroy,
  };
}
