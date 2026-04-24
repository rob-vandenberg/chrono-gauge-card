// ─── Editor Version ───────────────────────────────────────────────────────────
const EDITOR_VERSION = '1.0.1';

// ─── Editor Version History ───────────────────────────────────────────────────
// v1.0.1: Initial editor — ChronoGaugeCardEditor with all sections: card, background
//         image, header/footer, scales (sections/ticks/needles), custom fields

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
