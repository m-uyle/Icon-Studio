import { CORE_GUIDE_KEYS, GUIDE_KEYS } from "../../../entities/grid/index.js";
import { syncLayerToggleButtons } from "../../../shared/ui/index.js";

/**
 * Controller for the 13 Guide Layer switches and Core/All/None quick actions.
 */
export function initGuideLayersPanel(rootEl, { getState, onChange }) {
  const ac = new AbortController();
  const { signal } = ac;

  const toggleButtons = Array.from(
    rootEl.querySelectorAll(".layer-toggle:not(.qa-toggle)")
  );
  const badgeEl = rootEl.querySelector("#guideCountBadge");

  toggleButtons.forEach((btn) => {
    btn.addEventListener(
      "click",
      () => {
        const state = getState();
        state[btn.dataset.key] = !state[btn.dataset.key];
        sync();
        onChange();
      },
      { signal }
    );
  });

  rootEl.querySelector("#btnGuidesCore")?.addEventListener(
    "click",
    () => {
      const state = getState();
      GUIDE_KEYS.forEach((k) => {
        state[k] = CORE_GUIDE_KEYS.includes(k);
      });
      sync();
      onChange();
    },
    { signal }
  );

  rootEl.querySelector("#btnGuidesAll")?.addEventListener(
    "click",
    () => {
      const state = getState();
      GUIDE_KEYS.forEach((k) => {
        state[k] = true;
      });
      sync();
      onChange();
    },
    { signal }
  );

  rootEl.querySelector("#btnGuidesClear")?.addEventListener(
    "click",
    () => {
      const state = getState();
      GUIDE_KEYS.forEach((k) => {
        state[k] = false;
      });
      sync();
      onChange();
    },
    { signal }
  );

  function sync() {
    const activeCount = syncLayerToggleButtons(toggleButtons, getState());
    if (badgeEl) {
      badgeEl.textContent = `${activeCount} / ${GUIDE_KEYS.length}`;
    }
  }

  function destroy() {
    ac.abort();
  }

  return { sync, destroy };
}
