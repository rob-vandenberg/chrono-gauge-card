import { LitElement, html, svg, css } from 'https://unpkg.com/lit@2.0.0/index.js?module';
import { live } from 'https://unpkg.com/lit@2.0.0/directives/live.js?module';
import { unsafeHTML } from 'https://unpkg.com/lit@2.0.0/directives/unsafe-html.js?module';

// ─── Library Version ──────────────────────────────────────────────────────────
const LIB_VERSION = '1.0.2';

// ─── Library Version History ──────────────────────────────────────────────────
// v1.0.2: Add svg to Lit import — needed for SVG template literals in card
// v1.0.1: Initial library — cgParseNumber, cgTextField, cgToggleField, cgColorPicker,
//         cgButtonPicker, cgComboboxField, CgTextfield, CgButtonToggleGroup, CgCombobox

// ─── Console log ──────────────────────────────────────────────────────────────
console.info(
  `%c CHRONO-GAUGE-LIB %c v${LIB_VERSION} `,
  'background-color: #29b6cf; color: #fff; font-weight: bold; padding: 2px 4px; border-radius: 3px 0 0 3px;',
  'background-color: #1e1e1e; color: #fff; font-weight: bold; padding: 2px 4px; border-radius: 0 3px 3px 0;'
);

// ─── cgParseNumber ────────────────────────────────────────────────────────────
// Mirrors ha-form-float._handleInput logic exactly.
// Returns the parsed number, undefined if the value is incomplete/invalid,
// or null to signal "return early, do not fire config-changed".
function cgParseNumber(raw) {
  const v = String(raw).replace(',', '.');
  if (v === '-' || v === '-0' || v.endsWith('.')) return null;
  if (v.includes('.') && v.endsWith('0')) return null;
  if (v === '') return undefined;
  const n = parseFloat(v);
  return isNaN(n) ? null : n;
}

// ─── cgTextField ──────────────────────────────────────────────────────────────
// Returns a labeled cg-textfield block.
// opts: { type, step, min, max }
function cgTextField(label, value, onChange, opts = {}) {
  return html`
    <div class="text-field">
      <label>${label}</label>
      <cg-textfield
        .value=${String(value)}
        type=${opts.type || 'text'}
        step=${opts.step || ''}
        min=${opts.min !== undefined ? opts.min : ''}
        max=${opts.max !== undefined ? opts.max : ''}
        @input=${onChange}
      ></cg-textfield>
    </div>
  `;
}

// ─── cgToggleField ────────────────────────────────────────────────────────────
// Returns a labeled ha-switch block.
// extraClass: optional extra CSS class added to the wrapper div.
function cgToggleField(label, checked, onChange, extraClass = '') {
  return html`
    <div class="toggle-field${extraClass ? ' ' + extraClass : ''}">
      <label>${label}</label>
      <ha-switch
        .checked=${checked}
        @change=${onChange}
      ></ha-switch>
    </div>
  `;
}

// ─── cgColorPicker ────────────────────────────────────────────────────────────
// Returns a color field with native color input + cg-textfield for hex entry.
function cgColorPicker(label, value, onChange) {
  const colorValue = /^#[0-9a-fA-F]{6}$/.test(value) ? value : '#ffffff';
  return html`
    <div class="color-field">
      <label>${label}</label>
      <div class="color-row">
        <input
          type="color"
          .value=${colorValue}
          @input=${onChange}
        />
        <cg-textfield
          .value=${value}
          placeholder="#RRGGBB or #RRGGBBAA"
          @input=${onChange}
        ></cg-textfield>
      </div>
    </div>
  `;
}

// ─── cgButtonPicker ───────────────────────────────────────────────────────────
// Returns a cg-button-toggle-group wrapped in a toggle-field div.
// options: array of { label, value }
// align: optional 'end' for justify-self:end
function cgButtonPicker(label, value, options, onChange, align = '') {
  return html`
    <div class="toggle-field" style="${align ? `justify-self:${align}` : ''}">
      ${label ? html`<label>${label}</label>` : ''}
      <cg-button-toggle-group
        .value=${String(value)}
        .options=${options}
        @change=${onChange}
      ></cg-button-toggle-group>
    </div>
  `;
}

// ─── cgComboboxField ──────────────────────────────────────────────────────────
// Thin wrapper — delegates all combobox behaviour to the CgCombobox custom element.
// options: array of { label, value }
// unsafeHTML used for label to allow <br> and other markup in label strings.
function cgComboboxField(label, value, options, onChange) {
  return html`
    <div class="text-field">
      <label>${unsafeHTML(label)}</label>
      <cg-combobox
        .value=${value ?? ''}
        .options=${options}
        @change=${onChange}
      ></cg-combobox>
    </div>
  `;
}

// ─── CgTextfield ──────────────────────────────────────────────────────────────
// Own text field component — replaces ha-textfield removed in HA 2026.5.
// Exposes .value and .type so change handlers work identically to before.
// Uses live() to preserve intermediate input states (e.g. '-', '1.') without
// Lit overwriting the displayed value on re-render.
class CgTextfield extends LitElement {
  static properties = {
    value:       { type: String },
    type:        { type: String },
    step:        { type: String },
    min:         { type: String },
    max:         { type: String },
    placeholder: { type: String },
  };

  static styles = css`
    :host {
      display: block;
      width: 100%;
    }
    input {
      display: block;
      width: 100%;
      box-sizing: border-box;
      height: 56px;
      padding: 0 12px;
      background: var(--input-fill-color, rgba(0,0,0,0.06));
      border: none;
      border-bottom: 1px solid var(--secondary-text-color, #888);
      border-radius: 4px 4px 0 0;
      color: var(--primary-text-color);
      font-size: 16px;
      font-family: inherit;
      outline: none;
      transition: border-bottom-color 0.2s;
    }
    input:focus {
      border-bottom: 2px solid var(--primary-color);
    }
  `;

  render() {
    return html`
      <input
        .value=${live(this.value ?? '')}
        type=${this.type || 'text'}
        step=${this.step || ''}
        min=${this.min || ''}
        max=${this.max || ''}
        @input=${this._onInput}
      />
    `;
  }

  _onInput(e) {
    this.value = e.target.value;
    this.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
  }
}
customElements.define('cg-textfield', CgTextfield);

// ─── CgButtonToggleGroup ──────────────────────────────────────────────────────
// Segmented button control — mimics HA's ha-button-toggle-group appearance.
// Dispatches CustomEvent('change', { detail: { value } }) on selection.
class CgButtonToggleGroup extends LitElement {
  static properties = {
    value:   { type: String },
    options: { type: Array },
  };

  static styles = css`
    :host {
      display: inline-flex;
    }
    button {
      height: 28px;
      min-width: 70px;
      padding: 0 12px;
      border: none;
      border-right: 1px solid var(--ha-color-border-neutral-quiet, #5e5e5e);
      cursor: pointer;
      font-size: 12px;
      font-weight: 500;
      font-family: inherit;
      background: var(--ha-color-fill-primary-normal-resting, #002e3e);
      color: var(--primary-text-color, #e1e1e1);
      transition: background 150ms ease, color 150ms ease;
      border-radius: 0;
    }
    button:last-child {
      border-right: none;
    }
    button.first {
      border-radius: 9999px 0 0 9999px;
    }
    button.last {
      border-radius: 0 9999px 9999px 0;
    }
    button.only {
      border-radius: 9999px;
    }
    button.active {
      background: var(--ha-color-fill-primary-loud-resting, #009ac7);
      color: var(--primary-text-color, #e1e1e1);
    }
    button:hover:not(.active) {
      background: var(--ha-color-fill-primary-quiet-hover, #004156);
    }
  `;

  render() {
    const opts = this.options || [];
    return html`${opts.map((opt, i) => {
      const isFirst  = i === 0;
      const isLast   = i === opts.length - 1;
      const isOnly   = opts.length === 1;
      const isActive = opt.value === this.value;
      const cls = [
        isActive ? 'active' : '',
        isOnly ? 'only' : (isFirst ? 'first' : (isLast ? 'last' : '')),
      ].filter(Boolean).join(' ');
      return html`<button class="${cls}" @click=${() => this._select(opt.value)}>${opt.label}</button>`;
    })}`;
  }

  _select(value) {
    this.value = value;
    this.dispatchEvent(new CustomEvent('change', { detail: { value }, bubbles: true, composed: true }));
  }
}
customElements.define('cg-button-toggle-group', CgButtonToggleGroup);

// ─── CgCombobox ───────────────────────────────────────────────────────────────
// Shadow DOM combobox. Modelled on CgTextfield — host fills grid cell via
// :host { display: block; width: 100%; }. All CSS self-contained in static styles.
// Dispatches CustomEvent('change', { detail: { value } }) on selection or input.
class CgCombobox extends LitElement {
  static properties = {
    value:   { type: String },
    options: { type: Array },
    _open:   { state: true },
    _cursor: { state: true },
  };

  static styles = css`
    :host {
      display: block;
      width: 100%;
      min-width: 0;
      position: relative;
    }

    .combobox {
      display: flex;
      align-items: center;
      width: 100%;
      box-sizing: border-box;
      height: 56px;
      background: var(--input-fill-color, rgba(0,0,0,0.06));
      border: none;
      border-bottom: 1px solid var(--secondary-text-color, #888);
      border-radius: 4px 4px 0 0;
      transition: border-bottom-color 0.2s;
    }

    .combobox:focus-within,
    .combobox-open {
      border-bottom: 2px solid var(--primary-color);
    }

    .combobox-input {
      flex: 1;
      height: 100%;
      padding: 0 8px 0 12px;
      background: transparent;
      border: none;
      color: var(--primary-text-color);
      font-size: 16px;
      font-family: inherit;
      outline: none;
      min-width: 0;
      box-sizing: border-box;
    }

    .combobox-chevron {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 100%;
      cursor: pointer;
      color: var(--secondary-text-color);
      font-size: 12px;
      flex-shrink: 0;
      user-select: none;
    }

    .combobox-chevron:hover {
      color: var(--primary-text-color);
    }

    .combobox-dropdown {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      z-index: 9999;
      background: var(--card-background-color, #1c1c1c);
      border: 1px solid var(--divider-color, #444);
      border-radius: 0 0 4px 4px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.4);
      max-height: 240px;
      overflow-y: auto;
      margin-top: 1px;
    }

    .combobox-option {
      padding: 10px 12px;
      font-size: 14px;
      font-family: inherit;
      color: var(--primary-text-color);
      cursor: pointer;
      transition: background 0.1s;
    }

    .combobox-option:hover {
      background: var(--secondary-background-color, rgba(255,255,255,0.08));
    }

    .combobox-option-selected {
      color: var(--primary-color);
    }

    .combobox-option-cursor {
      background: var(--secondary-background-color, rgba(255,255,255,0.08));
    }
  `;

  constructor() {
    super();
    this.value   = '';
    this.options = [];
    this._open   = false;
    this._cursor = -1;
    this._onOutsideClick = this._onOutsideClick.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    document.addEventListener('click', this._onOutsideClick);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('click', this._onOutsideClick);
  }

  _onOutsideClick(e) {
    if (!this.shadowRoot.contains(e.composedPath()[0]) && e.composedPath()[0] !== this) {
      this._open   = false;
      this._cursor = -1;
    }
  }

  _select(value) {
    this.value   = value;
    this._open   = false;
    this._cursor = -1;
    this.dispatchEvent(new CustomEvent('change', {
      detail:   { value },
      bubbles:  true,
      composed: true,
    }));
  }

  _handleKeyDown(e) {
    const opts = this.options ?? [];

    if (!this._open) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        this._open   = true;
        this._cursor = 0;
        e.preventDefault();
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      this._cursor = Math.min(this._cursor + 1, opts.length - 1);
      e.preventDefault();
    } else if (e.key === 'ArrowUp') {
      this._cursor = Math.max(this._cursor - 1, 0);
      e.preventDefault();
    } else if (e.key === 'Enter') {
      if (this._cursor >= 0 && this._cursor < opts.length) {
        this._select(opts[this._cursor].value);
      }
      e.preventDefault();
    } else if (e.key === 'Escape') {
      this._open   = false;
      this._cursor = -1;
      e.preventDefault();
    }
  }

  render() {
    const opts = this.options ?? [];

    return html`
      <div class="combobox ${this._open ? 'combobox-open' : ''}">
        <input
          class="combobox-input"
          .value=${live(this.value ?? '')}
          @input=${e => {
            this.dispatchEvent(new CustomEvent('change', {
              detail:   { value: e.target.value },
              bubbles:  true,
              composed: true,
            }));
          }}
          @blur=${() => { this._open = false; this._cursor = -1; }}
          @keydown=${this._handleKeyDown}
        >
        <div
          class="combobox-chevron"
          @click=${() => {
            this._open = !this._open;
            this._cursor = -1;
            this.shadowRoot.querySelector('.combobox-input').focus();
          }}
          aria-hidden="true"
        >${this._open ? '▴' : '▾'}</div>
      </div>

      ${this._open ? html`
        <div class="combobox-dropdown">
          ${opts.map((opt, i) => html`
            <div
              class="combobox-option
                     ${opt.value === this.value ? 'combobox-option-selected' : ''}
                     ${i === this._cursor       ? 'combobox-option-cursor'   : ''}"
              @mousedown=${(e) => { e.preventDefault(); this._select(opt.value); }}
            >${opt.label}</div>
          `)}
        </div>
      ` : ''}
    `;
  }
}
customElements.define('cg-combobox', CgCombobox);
