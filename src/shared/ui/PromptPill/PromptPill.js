import { escapeHtml } from "../../lib/dom.js";
import { renderTag } from "../Tag/Tag.js";

/**
 * Renders an elevated floating prompt pill (e.g. canvas import hint).
 *
 * @param {Object} [options]
 * @param {string} [options.id='viewportEmptyState'] - Element ID
 * @param {string} [options.text='Drop SVG or paste'] - Prompt message text
 * @param {string} [options.shortcut=''] - Keyboard shortcut label
 * @param {string} [options.className=''] - Additional CSS classes
 * @returns {string} HTML markup string
 */
export function renderPromptPill({
  id = "viewportEmptyState",
  text = "Drop SVG or paste",
  shortcut = "",
  className = "",
} = {}) {
  const shortcutMarkup = shortcut
    ? renderTag({
        text: shortcut,
        as: "kbd",
        className: "ui-prompt-pill__tag",
      })
    : "";
  const extraClasses = className ? ` ${escapeHtml(className)}` : "";
  const safeId = escapeHtml(id);
  const textMarkup = text
    ? `<span class="ui-prompt-pill__text">${escapeHtml(text)}</span>`
    : "";

  return `
    <div class="ui-prompt-pill${extraClasses}" id="${safeId}" role="status">
      ${textMarkup}
      ${shortcutMarkup}
    </div>
  `.trim();
}
