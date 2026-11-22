import { escapeHtml } from "../../lib/dom.js";

/**
 * Renders an accessible, borderless pill badge / tag markup string.
 *
 * @param {Object} [options]
 * @param {string|number} [options.text=''] - Tag label text
 * @param {'span' | 'kbd' | 'code'} [options.as='span'] - HTML tag name ('span' | 'kbd' | 'code')
 * @param {string} [options.className=''] - Additional CSS classes
 * @param {string} [options.ariaLabel] - Accessible label for screen readers
 * @param {string} [options.title] - Tooltip description
 * @returns {string} HTML markup string
 */
export function renderTag({
  text = "",
  as = "span",
  className = "",
  ariaLabel,
  title,
} = {}) {
  const tag = as === "kbd" ? "kbd" : as === "code" ? "code" : "span";
  const classAttr = className ? ` ${escapeHtml(className)}` : "";
  const ariaAttr = ariaLabel ? ` aria-label="${escapeHtml(ariaLabel)}"` : "";
  const titleAttr = title ? ` title="${escapeHtml(title)}"` : "";
  const content = text ?? "";

  return `<${tag} class="ui-tag${classAttr}"${ariaAttr}${titleAttr}>${escapeHtml(content)}</${tag}>`;
}
