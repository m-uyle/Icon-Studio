import { escapeHtml } from "../../lib/dom.js";

/**
 * Renders an accessible design-system checkbox markup string.
 *
 * @param {Object} options
 * @param {string} [options.id] - Element ID (optional if wrapping label)
 * @param {string} [options.name] - Form field name
 * @param {string} [options.label] - Visible text label
 * @param {string} [options.ariaLabel] - Accessible label when visible label is omitted
 * @param {string} [options.value] - Input value attribute
 * @param {boolean} [options.checked=false] - Initial checked state
 * @param {boolean} [options.disabled=false] - Disabled state
 * @param {string} [options.className=''] - Additional CSS classes
 * @returns {string} HTML markup string
 */
export function renderCheckbox({
  id,
  name,
  label,
  ariaLabel,
  value,
  checked = false,
  disabled = false,
  className = "",
} = {}) {
  const checkedAttr = checked ? " checked" : "";
  const disabledAttr = disabled ? " disabled" : "";
  const nameAttr = name ? ` name="${escapeHtml(name)}"` : "";
  const valueAttr = value ? ` value="${escapeHtml(value)}"` : "";
  const ariaAttr = ariaLabel ? ` aria-label="${escapeHtml(ariaLabel)}"` : "";
  const idAttr = id ? ` id="${escapeHtml(id)}"` : "";
  const forAttr = id ? ` for="${escapeHtml(id)}"` : "";
  const disabledClass = disabled ? " is-disabled" : "";
  const classAttr = className ? ` ${escapeHtml(className)}` : "";

  const labelMarkup = label
    ? `<span class="ui-checkbox__label">${escapeHtml(label)}</span>`
    : "";

  return `
    <label class="ui-checkbox${disabledClass}${classAttr}"${forAttr}>
      <input
        class="ui-checkbox__input"${idAttr}${nameAttr}${valueAttr}${checkedAttr}${disabledAttr}${ariaAttr}
        type="checkbox"
      >
      ${labelMarkup}
    </label>
  `.trim();
}
