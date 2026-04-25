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
// ─── Editor Version ───────────────────────────────────────────────────────────
const EDITOR_VERSION = '1.0.2';

// ─── Editor Version History ───────────────────────────────────────────────────
// v1.0.2: Add arc_color, arc_width, arc_linecap fields to scale section
// v1.0.1: Initial editor — ChronoGaugeCardEditor with all sections

// ─── Console log ──────────────────────────────────────────────────────────────
console.info(
  `%c CHRONO-GAUGE-EDITOR %c v${EDITOR_VERSION} `,
  'background-color: #29b6cf; color: #fff; font-weight: bold; padding: 2px 4px; border-radius: 3px 0 0 3px;',
  'background-color: #1e1e1e; color: #fff; font-weight: bold; padding: 2px 4px; border-radius: 0 3px 3px 0;'
);

// ─── Tick type options ────────────────────────────────────────────────────────
const TICK_TYPE_OPTIONS = [
  { label: 'Line',   value: 'line'   },
  { label: 'Number', value: 'number' },
];

// ─── Linecap options ──────────────────────────────────────────────────────────
const LINECAP_OPTIONS = [
  { label: 'Butt',   value: 'butt'   },
  { label: 'Round',  value: 'round'  },
  { label: 'Square', value: 'square' },
];

// ─── Visual Editor ────────────────────────────────────────────────────────────
class ChronoGaugeCardEditor extends LitElement {
  static properties = {
    hass:    { type: Object },
    _config: { type: Object },
  };

  setConfig(config) {
    this._config = { ...DEFAULT_CONFIG, ...config };
  }

  // ─── Top-level value changed ───────────────────────────────────────────────
  _valueChanged(key, ev) {
    if (!this._config || !this.hass) return;
    let value;
    if (ev.detail?.value !== undefined) {
      value = ev.detail.value;
    } else if (ev.target.tagName === 'HA-SWITCH') {
      value = ev.target.checked;
    } else {
      value = ev.target.value;
    }
    if (ev.target.type === 'number') {
      const parsed = cgParseNumber(value);
      if (parsed == null) return;
      value = parsed;
    }
    this._config = { ...this._config, [key]: value };
    this._fireConfig();
  }

  // ─── Scale property changed ────────────────────────────────────────────────
  _scaleChanged(si, key, ev) {
    let value;
    if (ev.detail?.value !== undefined) {
      value = ev.detail.value;
    } else if (ev.target.tagName === 'HA-SWITCH') {
      value = ev.target.checked;
    } else {
      value = ev.target.value;
      if (ev.target.type === 'number') {
        const parsed = cgParseNumber(value);
        if (parsed == null) return;
        value = parsed;
      }
    }
    const scales = this._config.scales.map((s, i) =>
      i === si ? { ...s, [key]: value } : s
    );
    this._config = { ...this._config, scales };
    this._fireConfig();
  }

  // ─── Section property changed ──────────────────────────────────────────────
  _sectionChanged(si, secI, key, ev) {
    let value;
    if (ev.detail?.value !== undefined) {
      value = ev.detail.value;
    } else {
      value = ev.target.value;
      if (ev.target.type === 'number') {
        const parsed = cgParseNumber(value);
        if (parsed == null) return;
        value = parsed;
      }
    }
    const scales = this._config.scales.map((s, i) => {
      if (i !== si) return s;
      const sections = s.sections.map((sec, j) =>
        j === secI ? { ...sec, [key]: value } : sec
      );
      return { ...s, sections };
    });
    this._config = { ...this._config, scales };
    this._fireConfig();
  }

  // ─── Tick property changed ─────────────────────────────────────────────────
  _tickChanged(si, ti, key, ev) {
    let value;
    if (ev.detail?.value !== undefined) {
      value = ev.detail.value;
    } else if (ev.target.tagName === 'HA-SWITCH') {
      value = ev.target.checked;
    } else {
      value = ev.target.value;
      if (ev.target.type === 'number') {
        const parsed = cgParseNumber(value);
        if (parsed == null) return;
        value = parsed;
      }
    }
    const scales = this._config.scales.map((s, i) => {
      if (i !== si) return s;
      const ticks = s.ticks.map((t, j) =>
        j === ti ? { ...t, [key]: value } : t
      );
      return { ...s, ticks };
    });
    this._config = { ...this._config, scales };
    this._fireConfig();
  }

  // ─── Needle property changed ───────────────────────────────────────────────
  _needleChanged(si, ni, key, ev) {
    let value;
    if (ev.detail?.value !== undefined) {
      value = ev.detail.value;
    } else if (ev.target.tagName === 'HA-SWITCH') {
      value = ev.target.checked;
    } else {
      value = ev.target.value;
      if (ev.target.type === 'number') {
        const parsed = cgParseNumber(value);
        if (parsed == null) return;
        value = parsed;
      }
    }
    const scales = this._config.scales.map((s, i) => {
      if (i !== si) return s;
      const needles = s.needles.map((n, j) =>
        j === ni ? { ...n, [key]: value } : n
      );
      return { ...s, needles };
    });
    this._config = { ...this._config, scales };
    this._fireConfig();
  }

  // ─── Field property changed ────────────────────────────────────────────────
  _fieldChanged(i, key, ev) {
    let value;
    if (ev.target.tagName === 'HA-SWITCH') {
      value = ev.target.checked;
    } else {
      value = ev.target.value;
      if (ev.target.type === 'number') {
        const parsed = cgParseNumber(value);
        if (parsed == null) return;
        value = parsed;
      }
    }
    const fields = this._config.fields.map((f, idx) =>
      idx === i ? { ...f, [key]: value } : f
    );
    this._config = { ...this._config, fields };
    this._fireConfig();
  }

  // ─── Add / Remove scales ───────────────────────────────────────────────────
  _addScale() {
    const scales = [...(this._config.scales || []), { ...DEFAULT_SCALE }];
    this._config = { ...this._config, scales };
    this._fireConfig();
  }

  _removeScale(si) {
    const scales = this._config.scales.filter((_, i) => i !== si);
    this._config = { ...this._config, scales };
    this._fireConfig();
  }

  // ─── Add / Remove sections ─────────────────────────────────────────────────
  _addSection(si) {
    const scales = this._config.scales.map((s, i) => {
      if (i !== si) return s;
      const sections = [...(s.sections || []), { ...DEFAULT_SECTION }];
      return { ...s, sections };
    });
    this._config = { ...this._config, scales };
    this._fireConfig();
  }

  _removeSection(si, secI) {
    const scales = this._config.scales.map((s, i) => {
      if (i !== si) return s;
      const sections = s.sections.filter((_, j) => j !== secI);
      return { ...s, sections };
    });
    this._config = { ...this._config, scales };
    this._fireConfig();
  }

  // ─── Add / Remove ticks ───────────────────────────────────────────────────
  _addTick(si) {
    const scales = this._config.scales.map((s, i) => {
      if (i !== si) return s;
      const ticks = [...(s.ticks || []), { ...DEFAULT_TICK }];
      return { ...s, ticks };
    });
    this._config = { ...this._config, scales };
    this._fireConfig();
  }

  _removeTick(si, ti) {
    const scales = this._config.scales.map((s, i) => {
      if (i !== si) return s;
      const ticks = s.ticks.filter((_, j) => j !== ti);
      return { ...s, ticks };
    });
    this._config = { ...this._config, scales };
    this._fireConfig();
  }

  // ─── Add / Remove needles ──────────────────────────────────────────────────
  _addNeedle(si) {
    const scales = this._config.scales.map((s, i) => {
      if (i !== si) return s;
      const needles = [...(s.needles || []), { ...DEFAULT_NEEDLE }];
      return { ...s, needles };
    });
    this._config = { ...this._config, scales };
    this._fireConfig();
  }

  _removeNeedle(si, ni) {
    const scales = this._config.scales.map((s, i) => {
      if (i !== si) return s;
      const needles = s.needles.filter((_, j) => j !== ni);
      return { ...s, needles };
    });
    this._config = { ...this._config, scales };
    this._fireConfig();
  }

  // ─── Add / Remove fields ───────────────────────────────────────────────────
  _addField() {
    const fields = [...(this._config.fields || []), { ...DEFAULT_FIELD }];
    this._config = { ...this._config, fields };
    this._fireConfig();
  }

  _removeField(i) {
    const fields = this._config.fields.filter((_, idx) => idx !== i);
    this._config = { ...this._config, fields };
    this._fireConfig();
  }

  // ─── Fire config-changed ──────────────────────────────────────────────────
  _fireConfig() {
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail:   { config: this._config },
      bubbles:  true,
      composed: true,
    }));
  }

  render() {
    if (!this.hass || !this._config) return html``;
    const c = this._config;

    return html`

      <!-- ═══ Card ══════════════════════════════════════════════════════════ -->
      <ha-expansion-panel header="Card" outlined>

        <div class="card-styling-grid">
          ${cgTextField('Size', c.gauge_size, e => this._valueChanged('gauge_size', e), { type: 'number', step: '1', min: '1', max: '100' })}
          ${cgColorPicker('Background', c.background_color || '#ffffff', e => this._valueChanged('background_color', e))}
          ${cgTextField('Bezel width', c.bezel_width, e => this._valueChanged('bezel_width', e), { type: 'number', step: '1', min: '0' })}
          ${cgColorPicker('Bezel color', c.bezel_color || '#ffffff', e => this._valueChanged('bezel_color', e))}
        </div>

        <div class="card-toggles-grid">
          ${cgToggleField('Clip', c.clip, e => this._valueChanged('clip', e))}
          ${cgTextField('Animation (s)', c.rotation_animation_time, e => this._valueChanged('rotation_animation_time', e), { type: 'number', step: '0.1', min: '0' })}
        </div>

      </ha-expansion-panel>

      <!-- ═══ Background image ══════════════════════════════════════════════ -->
      <ha-expansion-panel header="Background image" outlined>

        <div class="bg-toggles-grid">
          ${cgToggleField('Show background image', c.background_image_show, e => this._valueChanged('background_image_show', e))}
        </div>
        <div class="bg-url-grid">
          ${cgTextField('URL (jinja template allowed)', c.background_image_url, e => this._valueChanged('background_image_url', e))}
        </div>
        <div class="bg-styling-grid">
          ${cgTextField('X pos', c.background_image_x, e => this._valueChanged('background_image_x', e), { type: 'number', step: '0.5' })}
          ${cgTextField('Y pos', c.background_image_y, e => this._valueChanged('background_image_y', e), { type: 'number', step: '0.5' })}
          ${cgTextField('Scale (%)', c.background_image_scale, e => this._valueChanged('background_image_scale', e), { type: 'number', step: '1', min: '1' })}
          ${cgTextField('Rotate', c.background_image_rotate, e => this._valueChanged('background_image_rotate', e), { type: 'number', step: '1' })}
        </div>

      </ha-expansion-panel>

      <!-- ═══ Header & Footer ═══════════════════════════════════════════════ -->
      <ha-expansion-panel header="Header &amp; Footer" outlined>

        <!-- Header -->
        <div class="hf-toggle-grid">
          ${cgToggleField('Show header', c.header_show, e => this._valueChanged('header_show', e))}
        </div>
        <div class="hf-text-grid">
          ${cgTextField('Header text (jinja template allowed)', c.header_text, e => this._valueChanged('header_text', e))}
        </div>
        <div class="hf-styling-grid">
          ${cgTextField('Position', c.header_position, e => this._valueChanged('header_position', e), { type: 'number', step: '1' })}
          ${cgTextField('Font size', c.header_font_size, e => this._valueChanged('header_font_size', e), { type: 'number', step: '0.1' })}
          ${cgTextField('Font weight', c.header_font_weight, e => this._valueChanged('header_font_weight', e), { type: 'number', step: '100', min: '100', max: '900' })}
          ${cgColorPicker('Color', c.header_font_color || '#ffffff', e => this._valueChanged('header_font_color', e))}
        </div>

        <!-- Footer -->
        <div class="hf-toggle-grid">
          ${cgToggleField('Show footer', c.footer_show, e => this._valueChanged('footer_show', e))}
        </div>
        <div class="hf-text-grid">
          ${cgTextField('Footer text (jinja template allowed)', c.footer_text, e => this._valueChanged('footer_text', e))}
        </div>
        <div class="hf-styling-grid">
          ${cgTextField('Position', c.footer_position, e => this._valueChanged('footer_position', e), { type: 'number', step: '1' })}
          ${cgTextField('Font size', c.footer_font_size, e => this._valueChanged('footer_font_size', e), { type: 'number', step: '0.1' })}
          ${cgTextField('Font weight', c.footer_font_weight, e => this._valueChanged('footer_font_weight', e), { type: 'number', step: '100', min: '100', max: '900' })}
          ${cgColorPicker('Color', c.footer_font_color || '#ffffff', e => this._valueChanged('footer_font_color', e))}
        </div>

      </ha-expansion-panel>

      <!-- ═══ Scales ════════════════════════════════════════════════════════ -->
      <ha-expansion-panel header="Scales" outlined>

        ${(c.scales || []).map((scale, si) => html`
          <ha-expansion-panel header="Scale ${si + 1}" outlined>

            <!-- Scale geometry -->
            <div class="scale-geometry-grid">
              ${cgTextField('Gap position', scale.gap_position, e => this._scaleChanged(si, 'gap_position', e), { type: 'number', step: '1', min: '0', max: '360' })}
              ${cgTextField('Gap size', scale.gap_size, e => this._scaleChanged(si, 'gap_size', e), { type: 'number', step: '1', min: '0', max: '360' })}
              ${cgTextField('Rotation', scale.arc_rotation, e => this._scaleChanged(si, 'arc_rotation', e), { type: 'number', step: '1' })}
              ${cgTextField('Position', scale.position, e => this._scaleChanged(si, 'position', e), { type: 'number', step: '0.5' })}
            </div>

            <!-- Scale range -->
            <div class="scale-range-grid">
              ${cgTextField('Scale min', scale.scale_min, e => this._scaleChanged(si, 'scale_min', e), { type: 'number', step: '1' })}
              ${cgTextField('Scale max', scale.scale_max, e => this._scaleChanged(si, 'scale_max', e), { type: 'number', step: '1' })}
              ${cgTextField('Unit', scale.unit, e => this._scaleChanged(si, 'unit', e))}
            </div>

            <!-- Clamp -->
            <div class="scale-clamp-grid">
              ${cgTextField('Clamp min offset', scale.clamp_min_offset, e => this._scaleChanged(si, 'clamp_min_offset', e), { type: 'number', step: '1', min: '0' })}
              ${cgTextField('Clamp max offset', scale.clamp_max_offset, e => this._scaleChanged(si, 'clamp_max_offset', e), { type: 'number', step: '1', min: '0' })}
            </div>

            <!-- Arc appearance -->
            <div class="scale-arc-grid">
              ${cgColorPicker('Arc color', scale.arc_color || '#333333', e => this._scaleChanged(si, 'arc_color', e))}
              ${cgTextField('Arc width', scale.arc_width, e => this._scaleChanged(si, 'arc_width', e), { type: 'number', step: '1', min: '0' })}
              ${cgButtonPicker('Linecap', scale.arc_linecap, LINECAP_OPTIONS, e => this._scaleChanged(si, 'arc_linecap', e))}
            </div>

            <!-- ── Sections ─────────────────────────────────────────────── -->
            <ha-expansion-panel header="Sections" outlined>

              ${(scale.sections || []).map((sec, secI) => html`
                <ha-expansion-panel header="Section ${secI + 1}" outlined>

                  <div class="section-value-grid">
                    ${cgTextField('Start value', sec.value, e => this._sectionChanged(si, secI, 'value', e), { type: 'number', step: '1' })}
                    ${cgTextField('Width', sec.width, e => this._sectionChanged(si, secI, 'width', e), { type: 'number', step: '0.5', min: '0' })}
                    ${cgTextField('Position', sec.position, e => this._sectionChanged(si, secI, 'position', e), { type: 'number', step: '0.5' })}
                  </div>
                  <div class="section-color-grid">
                    ${cgColorPicker('Color start', sec.color_start || '#ffffff', e => this._sectionChanged(si, secI, 'color_start', e))}
                    ${cgColorPicker('Color end', sec.color_end || '#ffffff', e => this._sectionChanged(si, secI, 'color_end', e))}
                  </div>
                  <div class="section-linecap-grid">
                    ${cgButtonPicker('Linecap', sec.linecap, LINECAP_OPTIONS, e => this._sectionChanged(si, secI, 'linecap', e))}
                  </div>
                  <div class="item-remove-grid">
                    <button class="item-remove-btn" @click=${() => this._removeSection(si, secI)}>Remove section</button>
                  </div>

                </ha-expansion-panel>
              `)}

              <div class="item-add-grid">
                <button class="item-add-btn" @click=${() => this._addSection(si)}>+ Add section</button>
              </div>

            </ha-expansion-panel>

            <!-- ── Ticks ────────────────────────────────────────────────── -->
            <ha-expansion-panel header="Ticks" outlined>

              ${(scale.ticks || []).map((tick, ti) => html`
                <ha-expansion-panel header="Tick tier ${ti + 1}" outlined>

                  <div class="tick-type-grid">
                    ${cgToggleField('Show', tick.show, e => this._tickChanged(si, ti, 'show', e))}
                    ${cgComboboxField('Type', tick.type, TICK_TYPE_OPTIONS, e => this._tickChanged(si, ti, 'type', e))}
                  </div>

                  <div class="tick-common-grid">
                    ${cgTextField('Divisions', tick.divisions, e => this._tickChanged(si, ti, 'divisions', e), { type: 'number', step: '1', min: '1' })}
                    ${cgTextField('Position', tick.position, e => this._tickChanged(si, ti, 'position', e), { type: 'number', step: '0.5' })}
                  </div>

                  ${tick.type === 'number' ? html`
                    <div class="tick-number-grid">
                      ${cgTextField('Font size', tick.font_size, e => this._tickChanged(si, ti, 'font_size', e), { type: 'number', step: '0.5', min: '0' })}
                      ${cgTextField('Font weight', tick.font_weight, e => this._tickChanged(si, ti, 'font_weight', e), { type: 'number', step: '100', min: '100', max: '900' })}
                      ${cgColorPicker('Color', tick.font_color || '#ffffff', e => this._tickChanged(si, ti, 'font_color', e))}
                    </div>
                  ` : html`
                    <div class="tick-line-grid">
                      ${cgTextField('Length', tick.length, e => this._tickChanged(si, ti, 'length', e), { type: 'number', step: '0.1', min: '0' })}
                      ${cgTextField('Width', tick.width, e => this._tickChanged(si, ti, 'width', e), { type: 'number', step: '0.1', min: '0' })}
                      ${cgColorPicker('Color', tick.color || '#ffffff', e => this._tickChanged(si, ti, 'color', e))}
                      ${cgButtonPicker('Linecap', tick.linecap, LINECAP_OPTIONS, e => this._tickChanged(si, ti, 'linecap', e))}
                    </div>
                  `}

                  <div class="item-remove-grid">
                    <button class="item-remove-btn" @click=${() => this._removeTick(si, ti)}>Remove tick tier</button>
                  </div>

                </ha-expansion-panel>
              `)}

              <div class="item-add-grid">
                <button class="item-add-btn" @click=${() => this._addTick(si)}>+ Add tick tier</button>
              </div>

            </ha-expansion-panel>

            <!-- ── Needles ───────────────────────────────────────────────── -->
            <ha-expansion-panel header="Needles" outlined>

              ${(scale.needles || []).map((needle, ni) => html`
                <ha-expansion-panel header="Needle ${ni + 1}" outlined>

                  <div class="needle-toggle-grid">
                    ${cgToggleField('Show', needle.show, e => this._needleChanged(si, ni, 'show', e))}
                    ${cgToggleField('Invert', needle.invert, e => this._needleChanged(si, ni, 'invert', e))}
                  </div>

                  <div class="needle-template-grid">
                    ${cgTextField('Value (jinja template)', needle.template, e => this._needleChanged(si, ni, 'template', e))}
                  </div>

                  <div class="needle-color-grid">
                    ${cgColorPicker('Color 1', needle.color_1 || '#ffffff', e => this._needleChanged(si, ni, 'color_1', e))}
                    ${cgTextField('Pos (%)', needle.color_1_pos, e => this._needleChanged(si, ni, 'color_1_pos', e), { type: 'number', step: '1', min: '0', max: '100' })}
                    ${cgColorPicker('Color 2', needle.color_2 || '#ffffff', e => this._needleChanged(si, ni, 'color_2', e))}
                    ${cgTextField('Pos (%)', needle.color_2_pos, e => this._needleChanged(si, ni, 'color_2_pos', e), { type: 'number', step: '1', min: '0', max: '100' })}
                  </div>

                  <div class="needle-dimensions-grid">
                    ${cgTextField('Height', needle.height, e => this._needleChanged(si, ni, 'height', e), { type: 'number', step: '1', min: '1' })}
                    ${cgTextField('Width', needle.width, e => this._needleChanged(si, ni, 'width', e), { type: 'number', step: '1', min: '1' })}
                    ${cgTextField('Position', needle.position, e => this._needleChanged(si, ni, 'position', e), { type: 'number', step: '1' })}
                    ${cgTextField('Morph', needle.morph, e => this._needleChanged(si, ni, 'morph', e), { type: 'number', step: '1' })}
                    ${cgTextField('Curve', needle.curve, e => this._needleChanged(si, ni, 'curve', e), { type: 'number', step: '1' })}
                  </div>

                  <!-- Needle image -->
                  <div class="needle-image-toggle-grid">
                    ${cgToggleField('Needle image', needle.image_show, e => this._needleChanged(si, ni, 'image_show', e))}
                  </div>
                  <div class="needle-image-url-grid">
                    ${cgTextField('URL (jinja template allowed)', needle.image_url, e => this._needleChanged(si, ni, 'image_url', e))}
                  </div>
                  <div class="needle-image-styling-grid">
                    ${cgTextField('X pos', needle.image_x, e => this._needleChanged(si, ni, 'image_x', e), { type: 'number', step: '0.5' })}
                    ${cgTextField('Y pos', needle.image_y, e => this._needleChanged(si, ni, 'image_y', e), { type: 'number', step: '0.5' })}
                    ${cgTextField('Scale (%)', needle.image_scale, e => this._needleChanged(si, ni, 'image_scale', e), { type: 'number', step: '1', min: '1' })}
                    ${cgTextField('Rotate', needle.image_rotate, e => this._needleChanged(si, ni, 'image_rotate', e), { type: 'number', step: '1' })}
                  </div>

                  <div class="item-remove-grid">
                    <button class="item-remove-btn" @click=${() => this._removeNeedle(si, ni)}>Remove needle</button>
                  </div>

                </ha-expansion-panel>
              `)}

              <div class="item-add-grid">
                <button class="item-add-btn" @click=${() => this._addNeedle(si)}>+ Add needle</button>
              </div>

            </ha-expansion-panel>

            <!-- Remove scale -->
            <div class="item-remove-grid">
              <button class="item-remove-btn" @click=${() => this._removeScale(si)}>Remove scale</button>
            </div>

          </ha-expansion-panel>
        `)}

        <div class="item-add-grid">
          <button class="item-add-btn" @click=${this._addScale}>+ Add scale</button>
        </div>

      </ha-expansion-panel>

      <!-- ═══ Custom fields ═════════════════════════════════════════════════ -->
      <ha-expansion-panel header="Custom fields" outlined>

        ${(c.fields || []).map((f, i) => html`
          <ha-expansion-panel header="Field ${i + 1}" outlined>

            <div class="field-toggle-grid">
              ${cgToggleField('Show', f.show, e => this._fieldChanged(i, 'show', e))}
            </div>
            <div class="field-template-grid">
              ${cgTextField('Text (jinja template allowed)', f.template, e => this._fieldChanged(i, 'template', e))}
            </div>
            <div class="field-styling-grid">
              ${cgTextField('Position (%)', f.position, e => this._fieldChanged(i, 'position', e), { type: 'number', step: '1' })}
              ${cgTextField('Font size', f.font_size, e => this._fieldChanged(i, 'font_size', e), { type: 'number', step: '0.1' })}
              ${cgTextField('Font weight', f.font_weight, e => this._fieldChanged(i, 'font_weight', e), { type: 'number', step: '100', min: '100', max: '900' })}
              ${cgColorPicker('Color', f.font_color || '#ffffff', e => this._fieldChanged(i, 'font_color', e))}
            </div>
            <div class="field-unit-grid">
              ${cgTextField('Unit', f.unit, e => this._fieldChanged(i, 'unit', e))}
              ${cgTextField('Font size', f.unit_font_size, e => this._fieldChanged(i, 'unit_font_size', e), { type: 'number', step: '0.1' })}
              ${cgTextField('Font weight', f.unit_font_weight, e => this._fieldChanged(i, 'unit_font_weight', e), { type: 'number', step: '100', min: '100', max: '900' })}
              ${cgColorPicker('Color', f.unit_font_color || '#ffffff', e => this._fieldChanged(i, 'unit_font_color', e))}
            </div>
            <div class="item-remove-grid">
              <button class="item-remove-btn" @click=${() => this._removeField(i)}>Remove field</button>
            </div>

          </ha-expansion-panel>
        `)}

        <div class="item-add-grid">
          <button class="item-add-btn" @click=${this._addField}>+ Add field</button>
        </div>

      </ha-expansion-panel>
    `;
  }

  static styles = css`
    :host {
      display: block;
      padding: 16px;
    }

    ha-expansion-panel {
      margin-top: 8px;
    }

    ha-expansion-panel > *:first-child {
      margin-top: 16px;
    }

    ha-expansion-panel + ha-expansion-panel > *:first-child {
      margin-top: 24px;
    }

    /* ── Color field ───────────────────────────────────────────────────────── */
    .color-field {
      display: flex;
      flex-direction: column;
      gap: 4px;
      min-width: 0;
    }
    .color-field label {
      font-size: 12px;
      font-weight: 600;
      color: var(--secondary-text-color);
    }
    .color-row {
      display: flex;
      gap: 8px;
      align-items: center;
      background-color: var(--input-fill-color, #1e1e1e);
      border-radius: 4px 4px 0 0;
      padding-left: 8px;
    }
    .color-row input[type="color"] {
      width: 24px;
      height: 40px;
      border: none;
      border-radius: 4px 4px 0 0;
      background: transparent;
      cursor: pointer;
      flex-shrink: 0;
    }
    .color-row cg-textfield {
      flex: 1;
      --input-fill-color: transparent;
    }

    /* ── Text field ────────────────────────────────────────────────────────── */
    .text-field {
      display: flex;
      flex-direction: column;
      gap: 4px;
      min-width: 0;
    }
    .text-field label {
      font-size: 12px;
      font-weight: 600;
      color: var(--secondary-text-color);
    }

    /* ── Toggle field ──────────────────────────────────────────────────────── */
    .toggle-field {
      display: flex;
      flex-direction: row;
      gap: 12px;
      align-items: center;
    }
    .toggle-field label {
      font-size: 12px;
      font-weight: 600;
      color: var(--secondary-text-color);
    }

    cg-textfield {
      display: block;
      width: 100%;
    }

    /* ── Add / Remove buttons ──────────────────────────────────────────────── */
    .item-remove-grid {
      display: flex;
      justify-content: flex-end;
      margin-top: 8px;
      margin-bottom: 4px;
    }
    .item-remove-btn {
      background: none;
      border: none;
      color: var(--error-color, #db4437);
      font-size: 0.875rem;
      font-weight: 500;
      font-family: inherit;
      letter-spacing: 0.0892857em;
      text-transform: uppercase;
      height: 36px;
      padding: 0 8px;
      cursor: pointer;
      border-radius: 4px;
    }
    .item-remove-btn:hover {
      background: rgba(219, 68, 55, 0.08);
    }
    .item-add-grid {
      display: flex;
      justify-content: center;
      margin-top: 12px;
      margin-bottom: 4px;
    }
    .item-add-btn {
      background: none;
      border: none;
      color: var(--primary-color);
      font-size: 0.875rem;
      font-weight: 500;
      font-family: inherit;
      letter-spacing: 0.0892857em;
      text-transform: uppercase;
      height: 36px;
      padding: 0 8px;
      cursor: pointer;
      border-radius: 4px;
    }
    .item-add-btn:hover {
      background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.08);
    }

    /* ── Card section grids ────────────────────────────────────────────────── */
    .card-styling-grid {
      display: grid;
      grid-template-columns: 1fr 2fr 1fr 2fr;
      gap: 8px;
      margin-top: 16px;
      margin-bottom: 8px;
      align-items: end;
    }
    .card-toggles-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      margin-top: 16px;
      margin-bottom: 8px;
      align-items: center;
    }

    /* ── Background image section grids ────────────────────────────────────── */
    .bg-toggles-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 8px;
      margin-top: 16px;
      margin-bottom: 8px;
    }
    .bg-url-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 8px;
      margin-top: 8px;
    }
    .bg-styling-grid {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr 1fr;
      gap: 8px;
      margin-top: 8px;
      margin-bottom: 8px;
      align-items: end;
    }

    /* ── Header & Footer section grids ─────────────────────────────────────── */
    .hf-toggle-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 8px;
      margin-top: 24px;
      margin-bottom: 8px;
    }
    .hf-text-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 8px;
      margin-top: 8px;
    }
    .hf-styling-grid {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr 2fr;
      gap: 8px;
      margin-top: 8px;
      margin-bottom: 8px;
      align-items: end;
    }

    /* ── Scale section grids ───────────────────────────────────────────────── */
    .scale-geometry-grid {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr 1fr;
      gap: 8px;
      margin-top: 16px;
      margin-bottom: 8px;
      align-items: end;
    }
    .scale-range-grid {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 8px;
      margin-top: 8px;
      margin-bottom: 8px;
      align-items: end;
    }
    .scale-clamp-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      margin-top: 8px;
      margin-bottom: 16px;
      align-items: end;
    }

    .scale-arc-grid {
      display: grid;
      grid-template-columns: 2fr 1fr 2fr;
      gap: 8px;
      margin-top: 8px;
      margin-bottom: 16px;
      align-items: end;
    }

    /* ── Section sub-panel grids ───────────────────────────────────────────── */
    .section-value-grid {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr;
      gap: 8px;
      margin-top: 16px;
      margin-bottom: 8px;
      align-items: end;
    }
    .section-color-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      margin-top: 8px;
      margin-bottom: 8px;
      align-items: end;
    }
    .section-linecap-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 8px;
      margin-top: 8px;
      margin-bottom: 8px;
    }

    /* ── Tick sub-panel grids ──────────────────────────────────────────────── */
    .tick-type-grid {
      display: grid;
      grid-template-columns: 1fr 2fr;
      gap: 8px;
      margin-top: 16px;
      margin-bottom: 8px;
      align-items: center;
    }
    .tick-common-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      margin-top: 8px;
      margin-bottom: 8px;
      align-items: end;
    }
    .tick-line-grid {
      display: grid;
      grid-template-columns: 1fr 1fr 2fr 2fr;
      gap: 8px;
      margin-top: 8px;
      margin-bottom: 8px;
      align-items: end;
    }
    .tick-number-grid {
      display: grid;
      grid-template-columns: 1fr 1fr 2fr;
      gap: 8px;
      margin-top: 8px;
      margin-bottom: 8px;
      align-items: end;
    }

    /* ── Needle sub-panel grids ────────────────────────────────────────────── */
    .needle-toggle-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      margin-top: 16px;
      margin-bottom: 8px;
      align-items: center;
    }
    .needle-template-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 8px;
      margin-top: 8px;
      margin-bottom: 8px;
    }
    .needle-color-grid {
      display: grid;
      grid-template-columns: 2fr 1fr 2fr 1fr;
      gap: 8px;
      margin-top: 8px;
      margin-bottom: 8px;
      align-items: end;
    }
    .needle-dimensions-grid {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
      gap: 8px;
      margin-top: 8px;
      margin-bottom: 8px;
      align-items: end;
    }
    .needle-image-toggle-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 8px;
      margin-top: 24px;
      margin-bottom: 8px;
    }
    .needle-image-url-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 8px;
      margin-top: 8px;
    }
    .needle-image-styling-grid {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr 1fr;
      gap: 8px;
      margin-top: 8px;
      margin-bottom: 8px;
      align-items: end;
    }

    /* ── Custom field sub-panel grids ──────────────────────────────────────── */
    .field-toggle-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 8px;
      margin-top: 16px;
      margin-bottom: 8px;
    }
    .field-template-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 8px;
      margin-top: 8px;
    }
    .field-styling-grid {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr 2fr;
      gap: 8px;
      margin-top: 8px;
      margin-bottom: 8px;
      align-items: end;
    }
    .field-unit-grid {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr 2fr;
      gap: 8px;
      margin-top: 8px;
      margin-bottom: 8px;
      align-items: end;
    }
  `;
}

customElements.define('chrono-gauge-card-editor', ChronoGaugeCardEditor);
// ─── Card Version ─────────────────────────────────────────────────────────────
const CARD_VERSION = '1.0.15';

// ─── Card Version History ─────────────────────────────────────────────────────
// v1.0.15: Replace canvas sections with SVG clipPath + foreignObject + CSS conic-gradient —
//          stays in SVG, true arc gradient, no canvas needed
// v1.0.14: Move section canvases to gauge-container as direct siblings of gauge-layer
// v1.0.13: Size canvas to gauge-container to allow sections to extend beyond gauge-layer;
//          center canvas over gauge-layer center; gauge-scale-layer overflow:visible
// v1.0.12: Replace SVG sections with Canvas 2D — use createConicGradient for
//          true along-arc color gradients; _drawAllSections called after setConfig
// v1.0.11: Move arc sections SVG out of gauge-bezel-layer to sibling position —
//          sections now render freely outside circle; overflow:hidden stays on bezel
// v1.0.10: Deep-merge scales/needles/sections/ticks/fields with defaults in setConfig
//          — fixes NaN angles caused by missing properties not in user YAML
// v1.0.9: Add needle rendering — _buildNeedlePath, _renderScaleOverlay with per-needle
//         SVG; value clamped, converted via valueToAngle; gradient support
// v1.0.8: Add sections rendering — sorted arc bands per scale, each with own
//         color, width, position; last section extends to scale_max
// v1.0.7: Add arc_color, arc_width, arc_linecap to DEFAULT_SCALE; use in _renderScaleArc
// v1.0.6: Move arc SVG inside gauge-bezel-layer for correct clipping; fix inward-only
//         stroke by drawing arc at r - strokeWidth/2; split _renderScale into
//         _renderScaleArc (inside bezel) and _renderScaleOverlay (in rotate group)
// v1.0.5: Fix cgGapToArc formula — arc now correctly renders top half for gap_position:0,
//         gap_size:180; increase default arc stroke-width to 16
// v1.0.4: Remove import statement; add gauge-scale-layer wrapper div around SVG
//         matching compass-ticks-layer pattern to fix SVG rendering in rotate group
// v1.0.3: Add arc rendering — angleToPoint, _renderScale, SVG arc path per scale
//         inside gauge-scale-rotate-group; arc drawn at r=50 with scale.position offset
// v1.0.2: Fix bezel-radius — set --cg-bezel-radius CSS var in setConfig; replace
//         invalid css` interpolation with var(--cg-bezel-radius, 50%)
// v1.0.1: Initial card shell — constants, defaults, setConfig, lifecycle, render,
//         CSS layer hierarchy, card registration

// ─── Console log ──────────────────────────────────────────────────────────────
console.info(
  `%c CHRONO-GAUGE-CARD %c v${CARD_VERSION} `,
  'background-color: #29b6cf; color: #fff; font-weight: bold; padding: 2px 4px; border-radius: 3px 0 0 3px;',
  'background-color: #1e1e1e; color: #fff; font-weight: bold; padding: 2px 4px; border-radius: 0 3px 3px 0;'
);

// ─── Layout Constants ─────────────────────────────────────────────────────────
const GAUGE_DEFAULT_MARGIN = 12;
const GAUGE_BEZEL_RADIUS   = '50%';

// ─── Default Section ──────────────────────────────────────────────────────────
const DEFAULT_SECTION = {
  value:       0,
  color_start: '#00AA00',
  color_end:   '#00AA00',
  width:       5,
  position:    0,
  linecap:     'butt',
};

// ─── Default Tick ─────────────────────────────────────────────────────────────
const DEFAULT_TICK = {
  show:      true,
  type:      'line',
  divisions: 10,
  length:    3,
  width:     1.5,
  position:  0,
  color:     '#AAAAAA',
  linecap:   'butt',
  font_size: 10,
  font_weight: 400,
  font_color: '#AAAAAA',
};

// ─── Default Needle ───────────────────────────────────────────────────────────
const DEFAULT_NEEDLE = {
  show:         true,
  template:     "{{ states('sensor.temperature') | float(0) }}",
  color_1:      '#FF0000',
  color_1_pos:  50,
  color_2:      '#EEEEEE',
  color_2_pos:  50,
  width:        7,
  height:       40,
  position:     0,
  morph:        40,
  curve:        0,
  invert:       false,
  image_show:   false,
  image_url:    '',
  image_scale:  100,
  image_x:      0,
  image_y:      0,
  image_rotate: 0,
};

// ─── Default Field ────────────────────────────────────────────────────────────
const DEFAULT_FIELD = {
  show:            true,
  template:        '',
  font_size:       1.8,
  font_weight:     400,
  position:        50,
  font_color:      '#FFFFFF',
  unit:            '',
  unit_font_size:  1.4,
  unit_font_weight: 400,
  unit_font_color: '#FFFFFF',
};

// ─── Default Scale ────────────────────────────────────────────────────────────
const DEFAULT_SCALE = {
  gap_position:     0,
  gap_size:         180,
  scale_min:        0,
  scale_max:        100,
  arc_rotation:     0,
  position:         0,
  unit:             '',
  clamp_min_offset: 0,
  clamp_max_offset: 0,
  arc_color:        '#333333',
  arc_width:        16,
  arc_linecap:      'butt',
  sections:         [],
  ticks:            [],
  needles:          [{ ...DEFAULT_NEEDLE }],
};

// ─── Default Configuration ────────────────────────────────────────────────────
const DEFAULT_CONFIG = {
  gauge_size:              100,
  arc_rotation:            0,
  background_color:        '#1a1a1a',
  bezel_width:             3,
  bezel_color:             '#444444',
  background_image_show:   false,
  background_image_url:    '',
  background_image_scale:  100,
  background_image_x:      0,
  background_image_y:      0,
  background_image_rotate: 0,
  clip:                    false,
  rotation_animation_time: 0.5,
  header_show:             false,
  header_text:             '',
  header_font_size:        1.0,
  header_font_weight:      400,
  header_font_color:       '#FFFFFF',
  header_position:         0,
  footer_show:             false,
  footer_text:             '',
  footer_font_size:        1.0,
  footer_font_weight:      400,
  footer_font_color:       '#FFFFFF',
  footer_position:         0,
  scales:                  [{ ...DEFAULT_SCALE }],
  fields:                  [],
};

// ─── cgGapToArc ───────────────────────────────────────────────────────────────
// Converts user-facing gap_position + gap_size to internal arc_start + arc_end.
// gap_position: 0–360, where 0 = gap centered at south, clockwise positive.
// gap_size: 0–360, where 0 = full circle, 360 = no arc.
// Returns { arcStart, arcEnd } in compass degrees (0 = north, clockwise).
function cgGapToArc(gap_position, gap_size) {
  const halfGap  = gap_size / 2;
  const arcStart = ((180 + gap_position + halfGap) + 360) % 360;
  const arcEnd   = ((180 + gap_position - halfGap) + 360) % 360;
  return { arcStart, arcEnd };
}

// ─── valueToAngle ─────────────────────────────────────────────────────────────
// Converts a real-world value to a rotation angle in degrees.
// arcStart/arcEnd are compass degrees (0 = north, clockwise).
// Handles wrap-around when arcEnd < arcStart numerically.
function valueToAngle(value, scaleMin, scaleMax, arcStart, arcEnd) {
  const arcSpan = ((arcEnd - arcStart) + 360) % 360;
  const ratio   = (value - scaleMin) / (scaleMax - scaleMin);
  return arcStart + ratio * arcSpan;
}

// ─── angleToPoint ─────────────────────────────────────────────────────────────
// Converts a compass angle (0=north, clockwise) to an SVG point on a circle.
// cx, cy: center of circle. r: radius. All in 100×100 coordinate space.
function angleToPoint(angleDeg, r, cx, cy) {
  const rad = (angleDeg - 90) * Math.PI / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

// ─── buildArcPath ─────────────────────────────────────────────────────────────
// Builds an SVG arc path string from arcStart to arcEnd (compass degrees).
// r: radius. cx, cy: center. All in 100×100 coordinate space.
function buildArcPath(arcStart, arcEnd, r, cx, cy) {
  const arcSpan  = ((arcEnd - arcStart) + 360) % 360;
  const start    = angleToPoint(arcStart, r, cx, cy);
  const end      = angleToPoint(arcEnd,   r, cx, cy);
  const largeArc = arcSpan > 180 ? 1 : 0;
  return `M ${start.x},${start.y} A ${r},${r} 0 ${largeArc} 1 ${end.x},${end.y}`;
}

// ─── Main Card ────────────────────────────────────────────────────────────────
class ChronoGaugeCard extends LitElement {
  static properties = {
    _fieldValues:        { type: Array },
    _headerValue:        { type: String },
    _footerValue:        { type: String },
    _backgroundImageUrl: { type: String },
    _needleValues:       { type: Array },
  };

  constructor() {
    super();
    this._config             = null;
    this._hass               = null;
    this._templateUnsubs     = [];
    this._subscriptionsActive = false;
    this._fieldValues        = [];
    this._headerValue        = '';
    this._footerValue        = '';
    this._backgroundImageUrl = '';
    this._needleValues       = [];
  }

  set hass(hass) {
    this._hass = hass;
    if (this._config && !this._subscriptionsActive) {
      this._setupSubscriptions();
    }
  }

  get hass() {
    return this._hass;
  }

  setConfig(config) {
    this._config = { ...DEFAULT_CONFIG, ...config };

    // Deep-merge nested arrays with their defaults so every property is always defined.
    // A shallow spread of config only replaces top-level keys — nested objects inside
    // scales[], needles[], sections[], ticks[] and fields[] would be missing any
    // property the user did not specify in YAML, causing NaN in calculations.
    this._config.scales = (config.scales || [{ ...DEFAULT_SCALE }]).map(s => ({
      ...DEFAULT_SCALE,
      ...s,
      sections: (s.sections || []).map(sec => ({ ...DEFAULT_SECTION, ...sec })),
      ticks:    (s.ticks    || []).map(t   => ({ ...DEFAULT_TICK,    ...t   })),
      needles:  (s.needles  || []).map(n   => ({ ...DEFAULT_NEEDLE,  ...n   })),
    }));
    this._config.fields = (config.fields || []).map(f => ({ ...DEFAULT_FIELD, ...f }));

    // Set all CSS custom properties once — browser handles all resizing from here
    const c            = this._config;
    const gaugeMargin  = (100 + GAUGE_DEFAULT_MARGIN) - (parseFloat(c.gauge_size) ?? 100);
    this.style.setProperty('--cg-gauge-margin',       `${gaugeMargin}%`);
    this.style.setProperty('--cg-bezel-width',        `${parseFloat(c.bezel_width) / 2}cqi`);
    this.style.setProperty('--cg-bezel-color',         c.bezel_color);
    this.style.setProperty('--cg-background-color',    c.background_color);
    this.style.setProperty('--cg-bezel-radius',        GAUGE_BEZEL_RADIUS);
    this.style.setProperty('--cg-animation-duration', `${c.rotation_animation_time}s`);

    if (this._hass && !this._subscriptionsActive) {
      this._setupSubscriptions();
    }
  }

  get config() {
    return this._config;
  }

  connectedCallback() {
    super.connectedCallback();
    if (this._hass && this._config) {
      this._setupSubscriptions();
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._teardownSubscriptions();
  }

  _setupSubscriptions() {
    this._teardownSubscriptions();
    if (!this.hass?.connection || !this.config) return;
    this._subscriptionsActive = true;

    const sub = (template, callback) => {
      const tmpl = String(template);
      if (!tmpl.includes('{{')) {
        callback(tmpl);
        return;
      }
      const unsub = this.hass.connection.subscribeMessage(
        (msg) => callback(msg.result),
        { type: 'render_template', template: tmpl }
      );
      this._templateUnsubs.push(unsub);
    };

    // Custom fields
    (this.config.fields || []).forEach((f, i) => {
      if (!f.show) {
        this._fieldValues[i] = '';
        return;
      }
      sub(String(f.template), (result) => {
        const newValues  = [...this._fieldValues];
        newValues[i]     = String(result);
        this._fieldValues = newValues;
      });
    });

    // Header and footer
    if (this.config.header_show && this.config.header_text) {
      sub(this.config.header_text, (result) => { this._headerValue = result; });
    } else {
      this._headerValue = '';
    }

    if (this.config.footer_show && this.config.footer_text) {
      sub(this.config.footer_text, (result) => { this._footerValue = result; });
    } else {
      this._footerValue = '';
    }

    // Background image URL
    if (this.config.background_image_show) {
      sub(this.config.background_image_url, (result) => { this._backgroundImageUrl = result; });
    } else {
      this._backgroundImageUrl = '';
    }

    // Needle values — iterate scales[].needles[]
    this._needleValues = [];
    (this.config.scales || []).forEach((scale, si) => {
      if (!this._needleValues[si]) this._needleValues[si] = [];
      (scale.needles || []).forEach((needle, ni) => {
        if (!needle.show) {
          this._needleValues[si][ni] = undefined;
          return;
        }
        sub(needle.template, (result) => {
          const raw = parseFloat(result);
          const newValues         = this._needleValues.map(a => [...a]);
          newValues[si][ni]       = isNaN(raw) ? undefined : raw;
          this._needleValues      = newValues;
          this.requestUpdate();
        });
      });
    });
  }

  _teardownSubscriptions() {
    const unsubs          = this._templateUnsubs;
    this._templateUnsubs  = [];
    this._subscriptionsActive = false;
    for (const unsub of unsubs) {
      Promise.resolve(unsub).then(fn => fn().catch(() => {})).catch(() => {});
    }
  }

  _renderScaleArc(scale, si) {
    const cx          = 50;
    const cy          = 50;
    const strokeWidth = parseFloat(scale.arc_width) ?? 16;
    // Inward-only growth: outer edge sits at r, inner edge at r - strokeWidth.
    // Draw path at r - strokeWidth/2 so stroke is centered there,
    // making outer edge exactly at r.
    const r           = (50 + (parseFloat(scale.position) ?? 0)) - strokeWidth / 2;
    const { arcStart, arcEnd } = cgGapToArc(
      parseFloat(scale.gap_position) ?? 0,
      parseFloat(scale.gap_size)     ?? 180
    );
    const arcPath = buildArcPath(arcStart, arcEnd, r, cx, cy);

    return html`
      <div class="gauge-scale-layer">
        <svg class="gauge-scale-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path
            d="${arcPath}"
            fill="none"
            stroke="${scale.arc_color || '#333333'}"
            stroke-width="${strokeWidth}"
            stroke-linecap="${scale.arc_linecap || 'butt'}"
          />
        </svg>
      </div>
    `;
  }

  _renderScaleSections(scale, si) {
    const sections = scale.sections || [];
    if (sections.length === 0) return html``;

    const cx       = 50;
    const cy       = 50;
    const scaleMin = parseFloat(scale.scale_min) || 0;
    const scaleMax = parseFloat(scale.scale_max) || 100;
    const { arcStart, arcEnd } = cgGapToArc(
      parseFloat(scale.gap_position) || 0,
      parseFloat(scale.gap_size)     || 180
    );

    // Sort sections by value ascending
    const sorted = [...sections].sort((a, b) => parseFloat(a.value) - parseFloat(b.value));

    return html`
      <div class="gauge-scale-layer">
        <svg class="gauge-scale-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            ${sorted.map((sec, i) => {
              const secStart    = parseFloat(sec.value);
              const secEnd      = i < sorted.length - 1
                ? parseFloat(sorted[i + 1].value)
                : scaleMax;
              const angleStart  = valueToAngle(secStart, scaleMin, scaleMax, arcStart, arcEnd);
              const angleEnd    = valueToAngle(secEnd,   scaleMin, scaleMax, arcStart, arcEnd);
              const strokeWidth = parseFloat(sec.width)    || 16;
              const position    = parseFloat(sec.position) || 0;
              const r           = (50 + position) - strokeWidth / 2;
              const arcPath     = buildArcPath(angleStart, angleEnd, r, cx, cy);
              const clipId      = `section-clip-${si}-${i}`;
              return svg`
                <clipPath id="${clipId}" clipPathUnits="userSpaceOnUse">
                  <path
                    d="${arcPath}"
                    fill="none"
                    stroke="white"
                    stroke-width="${strokeWidth}"
                    stroke-linecap="${sec.linecap || 'butt'}"
                  />
                </clipPath>
              `;
            })}
          </defs>

          ${sorted.map((sec, i) => {
            const secStart    = parseFloat(sec.value);
            const secEnd      = i < sorted.length - 1
              ? parseFloat(sorted[i + 1].value)
              : scaleMax;
            const angleStart  = valueToAngle(secStart, scaleMin, scaleMax, arcStart, arcEnd);
            const angleEnd    = valueToAngle(secEnd,   scaleMin, scaleMax, arcStart, arcEnd);
            const clipId      = `section-clip-${si}-${i}`;

            // CSS conic-gradient: starts from north (-90deg in CSS = 0° compass).
            // angleStart and angleEnd are compass degrees — convert to CSS degrees
            // by subtracting 90.
            const cssStart    = angleStart - 90;
            const cssEnd      = angleEnd   - 90;

            return svg`
              <g clip-path="url(#${clipId})">
                <foreignObject x="0" y="0" width="100" height="100">
                  <div
                    xmlns="http://www.w3.org/1999/xhtml"
                    style="width:100%;height:100%;background:conic-gradient(from ${cssStart}deg at 50% 50%, ${sec.color_start || '#ffffff'} 0deg, ${sec.color_end || sec.color_start || '#ffffff'} ${cssEnd - cssStart}deg);"
                  ></div>
                </foreignObject>
              </g>
            `;
          })}
        </svg>
      </div>
    `;
  }

  _buildNeedlePath(morph, curve, invert, position, width, height) {
    const hw = width / 2;
    let points = [
      { x: 50,      y: 0              },  // P1: tip
      { x: 50 - hw, y: height         },  // P2: base left
      { x: 50,      y: height + morph },  // P3: tail
      { x: 50 + hw, y: height         },  // P4: base right
    ];

    const curveNormalized = (curve / 50) * 0.5523;
    const cHoriz = curveNormalized * hw;
    const cUp    = curveNormalized * height;
    const cDown  = curveNormalized * morph;

    let controlDirections = [
      { in: { x:  1, y:  0 }, out: { x: -1, y:  0 }, inDist: cHoriz, outDist: cHoriz },
      { in: { x:  0, y: -1 }, out: { x:  0, y:  1 }, inDist: cUp,    outDist: cDown  },
      { in: { x: -1, y:  0 }, out: { x:  1, y:  0 }, inDist: cHoriz, outDist: cHoriz },
      { in: { x:  0, y:  1 }, out: { x:  0, y: -1 }, inDist: cDown,  outDist: cUp    },
    ];

    if (invert) {
      points.forEach(p => { p.y = height - p.y; });
      controlDirections.forEach(d => {
        d.in.y  = -d.in.y;
        d.out.y = -d.out.y;
      });
    }

    points.forEach(p => { p.y += (50 - height) - position; });

    const controls = points.map((p, i) => ({
      in:  { x: p.x + controlDirections[i].in.x  * controlDirections[i].inDist,
             y: p.y + controlDirections[i].in.y  * controlDirections[i].inDist  },
      out: { x: p.x + controlDirections[i].out.x * controlDirections[i].outDist,
             y: p.y + controlDirections[i].out.y * controlDirections[i].outDist },
    }));

    let path = `M ${points[0].x},${points[0].y}`;
    for (let i = 0; i < points.length; i++) {
      const next = (i + 1) % points.length;
      path += ` C ${controls[i].out.x},${controls[i].out.y} ${controls[next].in.x},${controls[next].in.y} ${points[next].x},${points[next].y}`;
    }
    path += ' Z';
    return path;
  }

  _renderScaleOverlay(scale, si) {
    const scaleMin   = parseFloat(scale.scale_min) ?? 0;
    const scaleMax   = parseFloat(scale.scale_max) ?? 100;
    const clampMin   = scaleMin - (parseFloat(scale.clamp_min_offset) ?? 0);
    const clampMax   = scaleMax + (parseFloat(scale.clamp_max_offset) ?? 0);
    const { arcStart, arcEnd } = cgGapToArc(
      parseFloat(scale.gap_position) ?? 0,
      parseFloat(scale.gap_size)     ?? 180
    );

    return html`
      ${(scale.needles || []).map((needle, ni) => {
        if (!needle.show) return html``;
        const rawValue = this._needleValues?.[si]?.[ni];
        if (rawValue === undefined) return html``;

        // Clamp value to effective range
        const clampedValue = Math.min(Math.max(rawValue, clampMin), clampMax);

        // Convert to rotation angle
        const angle  = valueToAngle(clampedValue, scaleMin, scaleMax, arcStart, arcEnd);

        const path   = this._buildNeedlePath(
          parseFloat(needle.morph),
          parseFloat(needle.curve),
          needle.invert,
          parseFloat(needle.position),
          parseFloat(needle.width),
          parseFloat(needle.height)
        );
        const gradId = `needleGradient-${si}-${ni}`;
        const g1     = needle.invert ? needle.color_2 : needle.color_1;
        const g1pos  = needle.invert ? 100 - parseFloat(needle.color_2_pos) : parseFloat(needle.color_1_pos);
        const g2     = needle.invert ? needle.color_1 : needle.color_2;
        const g2pos  = needle.invert ? 100 - parseFloat(needle.color_1_pos) : parseFloat(needle.color_2_pos);

        return html`
          <div class="gauge-needle-layer" style="transform:rotate(${angle}deg)">
            <svg class="gauge-needle-svg"
                 viewBox="0 0 100 100"
                 preserveAspectRatio="none">
              <defs>
                <linearGradient id="${gradId}" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"        stop-color="${g1}" />
                  <stop offset="${g1pos}%" stop-color="${g1}" />
                  <stop offset="${g2pos}%" stop-color="${g2}" />
                  <stop offset="100%"      stop-color="${g2}" />
                </linearGradient>
              </defs>
              <path d="${path}" fill="url(#${gradId})" />
            </svg>
          </div>
        `;
      })}
    `;
  }

  render() {
    const c = this.config || {};

    return html`
      <ha-card>
        <div class="gauge-container">

          ${c.header_show ? html`
            <div class="card-header-text"
                 style="font-size:${c.header_font_size}em;
                        font-weight:${c.header_font_weight};
                        color:${c.header_font_color};
                        top:calc(${GAUGE_DEFAULT_MARGIN / 2}cqi - ${c.header_position}cqi);">
              ${this._headerValue.split('<br>').map((line, i, arr) =>
                html`${line}${i < arr.length - 1 ? html`<br>` : ''}`
              )}
            </div>
          ` : ''}

          <div class="gauge-layer">

            <div class="gauge-bezel-layer">
              ${c.background_image_show && this._backgroundImageUrl ? html`
                <img class="gauge-bg-image"
                  src="${this._backgroundImageUrl}"
                  style="transform: translate(-50%, -50%)
                                   translate(${c.background_image_x}%, ${-c.background_image_y}%)
                                   rotate(${c.background_image_rotate}deg)
                                   scale(${c.background_image_scale / 100});"
                />
              ` : ''}

              ${(c.fields || []).map((f, i) => {
                if (!f.show) return html``;
                return html`
                  <div class="field"
                       style="top:${f.position}%;
                              font-size:${f.font_size * 8}cqi;
                              font-weight:${f.font_weight};
                              color:${f.font_color};">
                    ${this._fieldValues[i] ?? ''}
                    ${f.unit ? html`<span style="font-size:${f.unit_font_size * 8}cqi;
                                               font-weight:${f.unit_font_weight};
                                               color:${f.unit_font_color};">${f.unit}</span>` : ''}
                  </div>
                `;
              })}
            </div>

            ${(c.scales || []).map((scale, si) => html`
              ${this._renderScaleArc(scale, si)}
              ${this._renderScaleSections(scale, si)}
            `)}

            <div class="gauge-global-rotate-group"
                 style="transform:rotate(${c.arc_rotation}deg)">
              ${(c.scales || []).map((scale, si) => html`
                <div class="gauge-scale-rotate-group"
                     style="transform:rotate(${scale.arc_rotation ?? 0}deg)">
                  ${this._renderScaleOverlay(scale, si)}
                </div>
              `)}
            </div>

          </div>

          ${c.footer_show ? html`
            <div class="card-footer-text"
                 style="font-size:${c.footer_font_size}em;
                        font-weight:${c.footer_font_weight};
                        color:${c.footer_font_color};
                        bottom:calc(${GAUGE_DEFAULT_MARGIN / 2}cqi + ${c.footer_position}cqi);">
              ${this._footerValue.split('<br>').map((line, i, arr) =>
                html`${line}${i < arr.length - 1 ? html`<br>` : ''}`
              )}
            </div>
          ` : ''}

        </div>
      </ha-card>
    `;
  }

  static styles = css`
    ha-card {
      padding: 0;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      box-sizing: border-box;
    }

    .card-header-text {
      position: absolute;
      left: 0;
      width: 100%;
      text-align: center;
      box-sizing: border-box;
      line-height: 1.3;
      transform: translateY(-50%);
      pointer-events: none;
    }

    .card-footer-text {
      position: absolute;
      left: 0;
      width: 100%;
      text-align: center;
      box-sizing: border-box;
      line-height: 1.3;
      transform: translateY(50%);
      pointer-events: none;
    }

    .gauge-container {
      position: relative;
      width: 100%;
      aspect-ratio: 1 / 1;
      margin: 0 auto;
      overflow: hidden;
      box-sizing: border-box;
      container-type: inline-size;
    }

    .gauge-layer {
      position: absolute;
      top:    var(--cg-gauge-margin, 12%);
      left:   var(--cg-gauge-margin, 12%);
      right:  var(--cg-gauge-margin, 12%);
      bottom: var(--cg-gauge-margin, 12%);
      container-type: inline-size;
      overflow: visible;
    }

    .gauge-bezel-layer {
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      border-radius: var(--cg-bezel-radius, 50%);
      background-color: var(--cg-background-color, #1a1a1a);
      border: var(--cg-bezel-width, 1.5cqi) solid var(--cg-bezel-color, #444444);
      box-sizing: border-box;
      overflow: hidden;
      container-type: inline-size;
    }

    .gauge-bg-image {
      position: absolute;
      top: 50%;
      left: 50%;
      height: 100%;
      width: auto;
      max-width: none;
      transform-origin: center center;
      pointer-events: none;
      z-index: 0;
    }

    .gauge-global-rotate-group {
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      transition: transform var(--cg-animation-duration, 0.5s) ease-out;
    }

    .gauge-scale-rotate-group {
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      transition: transform var(--cg-animation-duration, 0.5s) ease-out;
    }

    .gauge-scale-layer {
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      pointer-events: none;
      overflow: visible;
    }

    .gauge-scale-svg {
      position: absolute;
      width: 100%;
      height: 100%;
      overflow: visible;
    }

    .gauge-needle-layer {
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      pointer-events: none;
    }

    .gauge-needle-svg {
      position: absolute;
      width: 100%;
      height: 100%;
      overflow: visible;
    }

    .field {
      position: absolute;
      left: 0;
      width: 100%;
      text-align: center;
      z-index: 1;
      line-height: 1.15;
      display: flex;
      justify-content: center;
      align-items: baseline;
      gap: 0.1em;
      transform: translateY(-50%);
      white-space: nowrap;
    }
  `;

  static getCardSize() {
    return 4;
  }

  static getConfigElement() {
    return document.createElement('chrono-gauge-card-editor');
  }

  static getStubConfig() {
    return { ...DEFAULT_CONFIG };
  }
}

customElements.define('chrono-gauge-card', ChronoGaugeCard);

// ─── Card registration ────────────────────────────────────────────────────────
window.customCards = window.customCards || [];
window.customCards.push({
  type:        'chrono-gauge-card',
  name:        'Chrono Gauge Card',
  description: 'A flexible multi-scale gauge card with independently styled scales, sections, ticks and needles.',
  preview:     true,
});
