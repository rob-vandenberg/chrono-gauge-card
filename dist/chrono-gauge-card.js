import{LitElement,html,css}from"https://unpkg.com/lit@2.0.0/index.js?module";import{live}from"https://unpkg.com/lit@2.0.0/directives/live.js?module";import{unsafeHTML}from"https://unpkg.com/lit@2.0.0/directives/unsafe-html.js?module";const LIB_VERSION="1.0.1";function cgParseNumber(e){const t=String(e).replace(",",".");if("-"===t||"-0"===t||t.endsWith("."))return null;if(t.includes(".")&&t.endsWith("0"))return null;if(""===t)return;const i=parseFloat(t);return isNaN(i)?null:i}function cgTextField(e,t,i,o={}){return html`
    <div class="text-field">
      <label>${e}</label>
      <cg-textfield
        .value=${String(t)}
        type=${o.type||"text"}
        step=${o.step||""}
        min=${void 0!==o.min?o.min:""}
        max=${void 0!==o.max?o.max:""}
        @input=${i}
      ></cg-textfield>
    </div>
  `}function cgToggleField(e,t,i,o=""){return html`
    <div class="toggle-field${o?" "+o:""}">
      <label>${e}</label>
      <ha-switch
        .checked=${t}
        @change=${i}
      ></ha-switch>
    </div>
  `}function cgColorPicker(e,t,i){const o=/^#[0-9a-fA-F]{6}$/.test(t)?t:"#ffffff";return html`
    <div class="color-field">
      <label>${e}</label>
      <div class="color-row">
        <input
          type="color"
          .value=${o}
          @input=${i}
        />
        <cg-textfield
          .value=${t}
          placeholder="#RRGGBB or #RRGGBBAA"
          @input=${i}
        ></cg-textfield>
      </div>
    </div>
  `}function cgButtonPicker(e,t,i,o,n=""){return html`
    <div class="toggle-field" style="${n?`justify-self:${n}`:""}">
      ${e?html`<label>${e}</label>`:""}
      <cg-button-toggle-group
        .value=${String(t)}
        .options=${i}
        @change=${o}
      ></cg-button-toggle-group>
    </div>
  `}function cgComboboxField(e,t,i,o){return html`
    <div class="text-field">
      <label>${unsafeHTML(e)}</label>
      <cg-combobox
        .value=${t??""}
        .options=${i}
        @change=${o}
      ></cg-combobox>
    </div>
  `}console.info("%c CHRONO-GAUGE-LIB %c v1.0.1 ","background-color: #29b6cf; color: #fff; font-weight: bold; padding: 2px 4px; border-radius: 3px 0 0 3px;","background-color: #1e1e1e; color: #fff; font-weight: bold; padding: 2px 4px; border-radius: 0 3px 3px 0;");class CgTextfield extends LitElement{static properties={value:{type:String},type:{type:String},step:{type:String},min:{type:String},max:{type:String},placeholder:{type:String}};static styles=css`
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
  `;render(){return html`
      <input
        .value=${live(this.value??"")}
        type=${this.type||"text"}
        step=${this.step||""}
        min=${this.min||""}
        max=${this.max||""}
        @input=${this._onInput}
      />
    `}_onInput(e){this.value=e.target.value,this.dispatchEvent(new Event("input",{bubbles:!0,composed:!0}))}}customElements.define("cg-textfield",CgTextfield);class CgButtonToggleGroup extends LitElement{static properties={value:{type:String},options:{type:Array}};static styles=css`
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
  `;render(){const e=this.options||[];return html`${e.map((t,i)=>{const o=0===i,n=i===e.length-1,r=1===e.length,a=[t.value===this.value?"active":"",r?"only":o?"first":n?"last":""].filter(Boolean).join(" ");return html`<button class="${a}" @click=${()=>this._select(t.value)}>${t.label}</button>`})}`}_select(e){this.value=e,this.dispatchEvent(new CustomEvent("change",{detail:{value:e},bubbles:!0,composed:!0}))}}customElements.define("cg-button-toggle-group",CgButtonToggleGroup);class CgCombobox extends LitElement{static properties={value:{type:String},options:{type:Array},_open:{state:!0},_cursor:{state:!0}};static styles=css`
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
  `;constructor(){super(),this.value="",this.options=[],this._open=!1,this._cursor=-1,this._onOutsideClick=this._onOutsideClick.bind(this)}connectedCallback(){super.connectedCallback(),document.addEventListener("click",this._onOutsideClick)}disconnectedCallback(){super.disconnectedCallback(),document.removeEventListener("click",this._onOutsideClick)}_onOutsideClick(e){this.shadowRoot.contains(e.composedPath()[0])||e.composedPath()[0]===this||(this._open=!1,this._cursor=-1)}_select(e){this.value=e,this._open=!1,this._cursor=-1,this.dispatchEvent(new CustomEvent("change",{detail:{value:e},bubbles:!0,composed:!0}))}_handleKeyDown(e){const t=this.options??[];this._open?"ArrowDown"===e.key?(this._cursor=Math.min(this._cursor+1,t.length-1),e.preventDefault()):"ArrowUp"===e.key?(this._cursor=Math.max(this._cursor-1,0),e.preventDefault()):"Enter"===e.key?(this._cursor>=0&&this._cursor<t.length&&this._select(t[this._cursor].value),e.preventDefault()):"Escape"===e.key&&(this._open=!1,this._cursor=-1,e.preventDefault()):"ArrowDown"!==e.key&&"ArrowUp"!==e.key||(this._open=!0,this._cursor=0,e.preventDefault())}render(){const e=this.options??[];return html`
      <div class="combobox ${this._open?"combobox-open":""}">
        <input
          class="combobox-input"
          .value=${live(this.value??"")}
          @input=${e=>{this.dispatchEvent(new CustomEvent("change",{detail:{value:e.target.value},bubbles:!0,composed:!0}))}}
          @blur=${()=>{this._open=!1,this._cursor=-1}}
          @keydown=${this._handleKeyDown}
        >
        <div
          class="combobox-chevron"
          @click=${()=>{this._open=!this._open,this._cursor=-1,this.shadowRoot.querySelector(".combobox-input").focus()}}
          aria-hidden="true"
        >${this._open?"▴":"▾"}</div>
      </div>

      ${this._open?html`
        <div class="combobox-dropdown">
          ${e.map((e,t)=>html`
            <div
              class="combobox-option
                     ${e.value===this.value?"combobox-option-selected":""}
                     ${t===this._cursor?"combobox-option-cursor":""}"
              @mousedown=${t=>{t.preventDefault(),this._select(e.value)}}
            >${e.label}</div>
          `)}
        </div>
      `:""}
    `}}customElements.define("cg-combobox",CgCombobox);const EDITOR_VERSION="1.0.1";console.info("%c CHRONO-GAUGE-EDITOR %c v1.0.1 ","background-color: #29b6cf; color: #fff; font-weight: bold; padding: 2px 4px; border-radius: 3px 0 0 3px;","background-color: #1e1e1e; color: #fff; font-weight: bold; padding: 2px 4px; border-radius: 0 3px 3px 0;");const TICK_TYPE_OPTIONS=[{label:"Line",value:"line"},{label:"Number",value:"number"}],LINECAP_OPTIONS=[{label:"Butt",value:"butt"},{label:"Round",value:"round"},{label:"Square",value:"square"}];class ChronoGaugeCardEditor extends LitElement{static properties={hass:{type:Object},_config:{type:Object}};setConfig(e){this._config={...DEFAULT_CONFIG,...e}}_valueChanged(e,t){if(!this._config||!this.hass)return;let i;if(i=void 0!==t.detail?.value?t.detail.value:"HA-SWITCH"===t.target.tagName?t.target.checked:t.target.value,"number"===t.target.type){const e=cgParseNumber(i);if(null==e)return;i=e}this._config={...this._config,[e]:i},this._fireConfig()}_scaleChanged(e,t,i){let o;if(void 0!==i.detail?.value)o=i.detail.value;else if("HA-SWITCH"===i.target.tagName)o=i.target.checked;else if(o=i.target.value,"number"===i.target.type){const e=cgParseNumber(o);if(null==e)return;o=e}const n=this._config.scales.map((i,n)=>n===e?{...i,[t]:o}:i);this._config={...this._config,scales:n},this._fireConfig()}_sectionChanged(e,t,i,o){let n;if(void 0!==o.detail?.value)n=o.detail.value;else if(n=o.target.value,"number"===o.target.type){const e=cgParseNumber(n);if(null==e)return;n=e}const r=this._config.scales.map((o,r)=>{if(r!==e)return o;const a=o.sections.map((e,o)=>o===t?{...e,[i]:n}:e);return{...o,sections:a}});this._config={...this._config,scales:r},this._fireConfig()}_tickChanged(e,t,i,o){let n;if(void 0!==o.detail?.value)n=o.detail.value;else if("HA-SWITCH"===o.target.tagName)n=o.target.checked;else if(n=o.target.value,"number"===o.target.type){const e=cgParseNumber(n);if(null==e)return;n=e}const r=this._config.scales.map((o,r)=>{if(r!==e)return o;const a=o.ticks.map((e,o)=>o===t?{...e,[i]:n}:e);return{...o,ticks:a}});this._config={...this._config,scales:r},this._fireConfig()}_needleChanged(e,t,i,o){let n;if(void 0!==o.detail?.value)n=o.detail.value;else if("HA-SWITCH"===o.target.tagName)n=o.target.checked;else if(n=o.target.value,"number"===o.target.type){const e=cgParseNumber(n);if(null==e)return;n=e}const r=this._config.scales.map((o,r)=>{if(r!==e)return o;const a=o.needles.map((e,o)=>o===t?{...e,[i]:n}:e);return{...o,needles:a}});this._config={...this._config,scales:r},this._fireConfig()}_fieldChanged(e,t,i){let o;if("HA-SWITCH"===i.target.tagName)o=i.target.checked;else if(o=i.target.value,"number"===i.target.type){const e=cgParseNumber(o);if(null==e)return;o=e}const n=this._config.fields.map((i,n)=>n===e?{...i,[t]:o}:i);this._config={...this._config,fields:n},this._fireConfig()}_addScale(){const e=[...this._config.scales||[],{...DEFAULT_SCALE}];this._config={...this._config,scales:e},this._fireConfig()}_removeScale(e){const t=this._config.scales.filter((t,i)=>i!==e);this._config={...this._config,scales:t},this._fireConfig()}_addSection(e){const t=this._config.scales.map((t,i)=>{if(i!==e)return t;const o=[...t.sections||[],{...DEFAULT_SECTION}];return{...t,sections:o}});this._config={...this._config,scales:t},this._fireConfig()}_removeSection(e,t){const i=this._config.scales.map((i,o)=>{if(o!==e)return i;const n=i.sections.filter((e,i)=>i!==t);return{...i,sections:n}});this._config={...this._config,scales:i},this._fireConfig()}_addTick(e){const t=this._config.scales.map((t,i)=>{if(i!==e)return t;const o=[...t.ticks||[],{...DEFAULT_TICK}];return{...t,ticks:o}});this._config={...this._config,scales:t},this._fireConfig()}_removeTick(e,t){const i=this._config.scales.map((i,o)=>{if(o!==e)return i;const n=i.ticks.filter((e,i)=>i!==t);return{...i,ticks:n}});this._config={...this._config,scales:i},this._fireConfig()}_addNeedle(e){const t=this._config.scales.map((t,i)=>{if(i!==e)return t;const o=[...t.needles||[],{...DEFAULT_NEEDLE}];return{...t,needles:o}});this._config={...this._config,scales:t},this._fireConfig()}_removeNeedle(e,t){const i=this._config.scales.map((i,o)=>{if(o!==e)return i;const n=i.needles.filter((e,i)=>i!==t);return{...i,needles:n}});this._config={...this._config,scales:i},this._fireConfig()}_addField(){const e=[...this._config.fields||[],{...DEFAULT_FIELD}];this._config={...this._config,fields:e},this._fireConfig()}_removeField(e){const t=this._config.fields.filter((t,i)=>i!==e);this._config={...this._config,fields:t},this._fireConfig()}_fireConfig(){this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:this._config},bubbles:!0,composed:!0}))}render(){if(!this.hass||!this._config)return html``;const e=this._config;return html`

      <!-- ═══ Card ══════════════════════════════════════════════════════════ -->
      <ha-expansion-panel header="Card" outlined>

        <div class="card-styling-grid">
          ${cgTextField("Size",e.gauge_size,e=>this._valueChanged("gauge_size",e),{type:"number",step:"1",min:"1",max:"100"})}
          ${cgColorPicker("Background",e.background_color||"#ffffff",e=>this._valueChanged("background_color",e))}
          ${cgTextField("Bezel width",e.bezel_width,e=>this._valueChanged("bezel_width",e),{type:"number",step:"1",min:"0"})}
          ${cgColorPicker("Bezel color",e.bezel_color||"#ffffff",e=>this._valueChanged("bezel_color",e))}
        </div>

        <div class="card-toggles-grid">
          ${cgToggleField("Clip",e.clip,e=>this._valueChanged("clip",e))}
          ${cgTextField("Animation (s)",e.rotation_animation_time,e=>this._valueChanged("rotation_animation_time",e),{type:"number",step:"0.1",min:"0"})}
        </div>

      </ha-expansion-panel>

      <!-- ═══ Background image ══════════════════════════════════════════════ -->
      <ha-expansion-panel header="Background image" outlined>

        <div class="bg-toggles-grid">
          ${cgToggleField("Show background image",e.background_image_show,e=>this._valueChanged("background_image_show",e))}
        </div>
        <div class="bg-url-grid">
          ${cgTextField("URL (jinja template allowed)",e.background_image_url,e=>this._valueChanged("background_image_url",e))}
        </div>
        <div class="bg-styling-grid">
          ${cgTextField("X pos",e.background_image_x,e=>this._valueChanged("background_image_x",e),{type:"number",step:"0.5"})}
          ${cgTextField("Y pos",e.background_image_y,e=>this._valueChanged("background_image_y",e),{type:"number",step:"0.5"})}
          ${cgTextField("Scale (%)",e.background_image_scale,e=>this._valueChanged("background_image_scale",e),{type:"number",step:"1",min:"1"})}
          ${cgTextField("Rotate",e.background_image_rotate,e=>this._valueChanged("background_image_rotate",e),{type:"number",step:"1"})}
        </div>

      </ha-expansion-panel>

      <!-- ═══ Header & Footer ═══════════════════════════════════════════════ -->
      <ha-expansion-panel header="Header &amp; Footer" outlined>

        <!-- Header -->
        <div class="hf-toggle-grid">
          ${cgToggleField("Show header",e.header_show,e=>this._valueChanged("header_show",e))}
        </div>
        <div class="hf-text-grid">
          ${cgTextField("Header text (jinja template allowed)",e.header_text,e=>this._valueChanged("header_text",e))}
        </div>
        <div class="hf-styling-grid">
          ${cgTextField("Position",e.header_position,e=>this._valueChanged("header_position",e),{type:"number",step:"1"})}
          ${cgTextField("Font size",e.header_font_size,e=>this._valueChanged("header_font_size",e),{type:"number",step:"0.1"})}
          ${cgTextField("Font weight",e.header_font_weight,e=>this._valueChanged("header_font_weight",e),{type:"number",step:"100",min:"100",max:"900"})}
          ${cgColorPicker("Color",e.header_font_color||"#ffffff",e=>this._valueChanged("header_font_color",e))}
        </div>

        <!-- Footer -->
        <div class="hf-toggle-grid">
          ${cgToggleField("Show footer",e.footer_show,e=>this._valueChanged("footer_show",e))}
        </div>
        <div class="hf-text-grid">
          ${cgTextField("Footer text (jinja template allowed)",e.footer_text,e=>this._valueChanged("footer_text",e))}
        </div>
        <div class="hf-styling-grid">
          ${cgTextField("Position",e.footer_position,e=>this._valueChanged("footer_position",e),{type:"number",step:"1"})}
          ${cgTextField("Font size",e.footer_font_size,e=>this._valueChanged("footer_font_size",e),{type:"number",step:"0.1"})}
          ${cgTextField("Font weight",e.footer_font_weight,e=>this._valueChanged("footer_font_weight",e),{type:"number",step:"100",min:"100",max:"900"})}
          ${cgColorPicker("Color",e.footer_font_color||"#ffffff",e=>this._valueChanged("footer_font_color",e))}
        </div>

      </ha-expansion-panel>

      <!-- ═══ Scales ════════════════════════════════════════════════════════ -->
      <ha-expansion-panel header="Scales" outlined>

        ${(e.scales||[]).map((e,t)=>html`
          <ha-expansion-panel header="Scale ${t+1}" outlined>

            <!-- Scale geometry -->
            <div class="scale-geometry-grid">
              ${cgTextField("Gap position",e.gap_position,e=>this._scaleChanged(t,"gap_position",e),{type:"number",step:"1",min:"0",max:"360"})}
              ${cgTextField("Gap size",e.gap_size,e=>this._scaleChanged(t,"gap_size",e),{type:"number",step:"1",min:"0",max:"360"})}
              ${cgTextField("Rotation",e.arc_rotation,e=>this._scaleChanged(t,"arc_rotation",e),{type:"number",step:"1"})}
              ${cgTextField("Position",e.position,e=>this._scaleChanged(t,"position",e),{type:"number",step:"0.5"})}
            </div>

            <!-- Scale range -->
            <div class="scale-range-grid">
              ${cgTextField("Scale min",e.scale_min,e=>this._scaleChanged(t,"scale_min",e),{type:"number",step:"1"})}
              ${cgTextField("Scale max",e.scale_max,e=>this._scaleChanged(t,"scale_max",e),{type:"number",step:"1"})}
              ${cgTextField("Unit",e.unit,e=>this._scaleChanged(t,"unit",e))}
            </div>

            <!-- Clamp -->
            <div class="scale-clamp-grid">
              ${cgTextField("Clamp min offset",e.clamp_min_offset,e=>this._scaleChanged(t,"clamp_min_offset",e),{type:"number",step:"1",min:"0"})}
              ${cgTextField("Clamp max offset",e.clamp_max_offset,e=>this._scaleChanged(t,"clamp_max_offset",e),{type:"number",step:"1",min:"0"})}
            </div>

            <!-- ── Sections ─────────────────────────────────────────────── -->
            <ha-expansion-panel header="Sections" outlined>

              ${(e.sections||[]).map((e,i)=>html`
                <ha-expansion-panel header="Section ${i+1}" outlined>

                  <div class="section-value-grid">
                    ${cgTextField("Start value",e.value,e=>this._sectionChanged(t,i,"value",e),{type:"number",step:"1"})}
                    ${cgTextField("Width",e.width,e=>this._sectionChanged(t,i,"width",e),{type:"number",step:"0.5",min:"0"})}
                    ${cgTextField("Position",e.position,e=>this._sectionChanged(t,i,"position",e),{type:"number",step:"0.5"})}
                  </div>
                  <div class="section-color-grid">
                    ${cgColorPicker("Color start",e.color_start||"#ffffff",e=>this._sectionChanged(t,i,"color_start",e))}
                    ${cgColorPicker("Color end",e.color_end||"#ffffff",e=>this._sectionChanged(t,i,"color_end",e))}
                  </div>
                  <div class="section-linecap-grid">
                    ${cgButtonPicker("Linecap",e.linecap,LINECAP_OPTIONS,e=>this._sectionChanged(t,i,"linecap",e))}
                  </div>
                  <div class="item-remove-grid">
                    <button class="item-remove-btn" @click=${()=>this._removeSection(t,i)}>Remove section</button>
                  </div>

                </ha-expansion-panel>
              `)}

              <div class="item-add-grid">
                <button class="item-add-btn" @click=${()=>this._addSection(t)}>+ Add section</button>
              </div>

            </ha-expansion-panel>

            <!-- ── Ticks ────────────────────────────────────────────────── -->
            <ha-expansion-panel header="Ticks" outlined>

              ${(e.ticks||[]).map((e,i)=>html`
                <ha-expansion-panel header="Tick tier ${i+1}" outlined>

                  <div class="tick-type-grid">
                    ${cgToggleField("Show",e.show,e=>this._tickChanged(t,i,"show",e))}
                    ${cgComboboxField("Type",e.type,TICK_TYPE_OPTIONS,e=>this._tickChanged(t,i,"type",e))}
                  </div>

                  <div class="tick-common-grid">
                    ${cgTextField("Divisions",e.divisions,e=>this._tickChanged(t,i,"divisions",e),{type:"number",step:"1",min:"1"})}
                    ${cgTextField("Position",e.position,e=>this._tickChanged(t,i,"position",e),{type:"number",step:"0.5"})}
                  </div>

                  ${"number"===e.type?html`
                    <div class="tick-number-grid">
                      ${cgTextField("Font size",e.font_size,e=>this._tickChanged(t,i,"font_size",e),{type:"number",step:"0.5",min:"0"})}
                      ${cgTextField("Font weight",e.font_weight,e=>this._tickChanged(t,i,"font_weight",e),{type:"number",step:"100",min:"100",max:"900"})}
                      ${cgColorPicker("Color",e.font_color||"#ffffff",e=>this._tickChanged(t,i,"font_color",e))}
                    </div>
                  `:html`
                    <div class="tick-line-grid">
                      ${cgTextField("Length",e.length,e=>this._tickChanged(t,i,"length",e),{type:"number",step:"0.1",min:"0"})}
                      ${cgTextField("Width",e.width,e=>this._tickChanged(t,i,"width",e),{type:"number",step:"0.1",min:"0"})}
                      ${cgColorPicker("Color",e.color||"#ffffff",e=>this._tickChanged(t,i,"color",e))}
                      ${cgButtonPicker("Linecap",e.linecap,LINECAP_OPTIONS,e=>this._tickChanged(t,i,"linecap",e))}
                    </div>
                  `}

                  <div class="item-remove-grid">
                    <button class="item-remove-btn" @click=${()=>this._removeTick(t,i)}>Remove tick tier</button>
                  </div>

                </ha-expansion-panel>
              `)}

              <div class="item-add-grid">
                <button class="item-add-btn" @click=${()=>this._addTick(t)}>+ Add tick tier</button>
              </div>

            </ha-expansion-panel>

            <!-- ── Needles ───────────────────────────────────────────────── -->
            <ha-expansion-panel header="Needles" outlined>

              ${(e.needles||[]).map((e,i)=>html`
                <ha-expansion-panel header="Needle ${i+1}" outlined>

                  <div class="needle-toggle-grid">
                    ${cgToggleField("Show",e.show,e=>this._needleChanged(t,i,"show",e))}
                    ${cgToggleField("Invert",e.invert,e=>this._needleChanged(t,i,"invert",e))}
                  </div>

                  <div class="needle-template-grid">
                    ${cgTextField("Value (jinja template)",e.template,e=>this._needleChanged(t,i,"template",e))}
                  </div>

                  <div class="needle-color-grid">
                    ${cgColorPicker("Color 1",e.color_1||"#ffffff",e=>this._needleChanged(t,i,"color_1",e))}
                    ${cgTextField("Pos (%)",e.color_1_pos,e=>this._needleChanged(t,i,"color_1_pos",e),{type:"number",step:"1",min:"0",max:"100"})}
                    ${cgColorPicker("Color 2",e.color_2||"#ffffff",e=>this._needleChanged(t,i,"color_2",e))}
                    ${cgTextField("Pos (%)",e.color_2_pos,e=>this._needleChanged(t,i,"color_2_pos",e),{type:"number",step:"1",min:"0",max:"100"})}
                  </div>

                  <div class="needle-dimensions-grid">
                    ${cgTextField("Height",e.height,e=>this._needleChanged(t,i,"height",e),{type:"number",step:"1",min:"1"})}
                    ${cgTextField("Width",e.width,e=>this._needleChanged(t,i,"width",e),{type:"number",step:"1",min:"1"})}
                    ${cgTextField("Position",e.position,e=>this._needleChanged(t,i,"position",e),{type:"number",step:"1"})}
                    ${cgTextField("Morph",e.morph,e=>this._needleChanged(t,i,"morph",e),{type:"number",step:"1"})}
                    ${cgTextField("Curve",e.curve,e=>this._needleChanged(t,i,"curve",e),{type:"number",step:"1"})}
                  </div>

                  <!-- Needle image -->
                  <div class="needle-image-toggle-grid">
                    ${cgToggleField("Needle image",e.image_show,e=>this._needleChanged(t,i,"image_show",e))}
                  </div>
                  <div class="needle-image-url-grid">
                    ${cgTextField("URL (jinja template allowed)",e.image_url,e=>this._needleChanged(t,i,"image_url",e))}
                  </div>
                  <div class="needle-image-styling-grid">
                    ${cgTextField("X pos",e.image_x,e=>this._needleChanged(t,i,"image_x",e),{type:"number",step:"0.5"})}
                    ${cgTextField("Y pos",e.image_y,e=>this._needleChanged(t,i,"image_y",e),{type:"number",step:"0.5"})}
                    ${cgTextField("Scale (%)",e.image_scale,e=>this._needleChanged(t,i,"image_scale",e),{type:"number",step:"1",min:"1"})}
                    ${cgTextField("Rotate",e.image_rotate,e=>this._needleChanged(t,i,"image_rotate",e),{type:"number",step:"1"})}
                  </div>

                  <div class="item-remove-grid">
                    <button class="item-remove-btn" @click=${()=>this._removeNeedle(t,i)}>Remove needle</button>
                  </div>

                </ha-expansion-panel>
              `)}

              <div class="item-add-grid">
                <button class="item-add-btn" @click=${()=>this._addNeedle(t)}>+ Add needle</button>
              </div>

            </ha-expansion-panel>

            <!-- Remove scale -->
            <div class="item-remove-grid">
              <button class="item-remove-btn" @click=${()=>this._removeScale(t)}>Remove scale</button>
            </div>

          </ha-expansion-panel>
        `)}

        <div class="item-add-grid">
          <button class="item-add-btn" @click=${this._addScale}>+ Add scale</button>
        </div>

      </ha-expansion-panel>

      <!-- ═══ Custom fields ═════════════════════════════════════════════════ -->
      <ha-expansion-panel header="Custom fields" outlined>

        ${(e.fields||[]).map((e,t)=>html`
          <ha-expansion-panel header="Field ${t+1}" outlined>

            <div class="field-toggle-grid">
              ${cgToggleField("Show",e.show,e=>this._fieldChanged(t,"show",e))}
            </div>
            <div class="field-template-grid">
              ${cgTextField("Text (jinja template allowed)",e.template,e=>this._fieldChanged(t,"template",e))}
            </div>
            <div class="field-styling-grid">
              ${cgTextField("Position (%)",e.position,e=>this._fieldChanged(t,"position",e),{type:"number",step:"1"})}
              ${cgTextField("Font size",e.font_size,e=>this._fieldChanged(t,"font_size",e),{type:"number",step:"0.1"})}
              ${cgTextField("Font weight",e.font_weight,e=>this._fieldChanged(t,"font_weight",e),{type:"number",step:"100",min:"100",max:"900"})}
              ${cgColorPicker("Color",e.font_color||"#ffffff",e=>this._fieldChanged(t,"font_color",e))}
            </div>
            <div class="field-unit-grid">
              ${cgTextField("Unit",e.unit,e=>this._fieldChanged(t,"unit",e))}
              ${cgTextField("Font size",e.unit_font_size,e=>this._fieldChanged(t,"unit_font_size",e),{type:"number",step:"0.1"})}
              ${cgTextField("Font weight",e.unit_font_weight,e=>this._fieldChanged(t,"unit_font_weight",e),{type:"number",step:"100",min:"100",max:"900"})}
              ${cgColorPicker("Color",e.unit_font_color||"#ffffff",e=>this._fieldChanged(t,"unit_font_color",e))}
            </div>
            <div class="item-remove-grid">
              <button class="item-remove-btn" @click=${()=>this._removeField(t)}>Remove field</button>
            </div>

          </ha-expansion-panel>
        `)}

        <div class="item-add-grid">
          <button class="item-add-btn" @click=${this._addField}>+ Add field</button>
        </div>

      </ha-expansion-panel>
    `}static styles=css`
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
  `}customElements.define("chrono-gauge-card-editor",ChronoGaugeCardEditor);const CARD_VERSION="1.0.3.1";console.info("%c CHRONO-GAUGE-CARD %c v1.0.3.1 ","background-color: #29b6cf; color: #fff; font-weight: bold; padding: 2px 4px; border-radius: 3px 0 0 3px;","background-color: #1e1e1e; color: #fff; font-weight: bold; padding: 2px 4px; border-radius: 0 3px 3px 0;");const GAUGE_DEFAULT_MARGIN=12,GAUGE_BEZEL_RADIUS="50%",DEFAULT_SECTION={value:0,color_start:"#00AA00",color_end:"#00AA00",width:5,position:0,linecap:"butt"},DEFAULT_TICK={show:!0,type:"line",divisions:10,length:3,width:1.5,position:0,color:"#AAAAAA",linecap:"butt",font_size:10,font_weight:400,font_color:"#AAAAAA"},DEFAULT_NEEDLE={show:!0,template:"{{ states('sensor.temperature') | float(0) }}",color_1:"#FF0000",color_1_pos:50,color_2:"#EEEEEE",color_2_pos:50,width:7,height:40,position:0,morph:40,curve:0,invert:!1,image_show:!1,image_url:"",image_scale:100,image_x:0,image_y:0,image_rotate:0},DEFAULT_FIELD={show:!0,template:"",font_size:1.8,font_weight:400,position:50,font_color:"#FFFFFF",unit:"",unit_font_size:1.4,unit_font_weight:400,unit_font_color:"#FFFFFF"},DEFAULT_SCALE={gap_position:0,gap_size:180,scale_min:0,scale_max:100,arc_rotation:0,position:0,unit:"",clamp_min_offset:0,clamp_max_offset:0,sections:[],ticks:[],needles:[{...DEFAULT_NEEDLE}]},DEFAULT_CONFIG={gauge_size:100,arc_rotation:0,background_color:"#1a1a1a",bezel_width:3,bezel_color:"#444444",background_image_show:!1,background_image_url:"",background_image_scale:100,background_image_x:0,background_image_y:0,background_image_rotate:0,clip:!1,rotation_animation_time:.5,header_show:!1,header_text:"",header_font_size:1,header_font_weight:400,header_font_color:"#FFFFFF",header_position:0,footer_show:!1,footer_text:"",footer_font_size:1,footer_font_weight:400,footer_font_color:"#FFFFFF",footer_position:0,scales:[{...DEFAULT_SCALE}],fields:[]};function cgGapToArc(e,t){const i=t/2;return{arcStart:(180+e-i+360)%360,arcEnd:(180+e+i+360)%360}}function valueToAngle(e,t,i,o,n){return o+(e-t)/(i-t)*((n-o+360)%360)}function angleToPoint(e,t,i,o){const n=(e-90)*Math.PI/180;return{x:i+t*Math.cos(n),y:o+t*Math.sin(n)}}function buildArcPath(e,t,i,o,n){const r=(t-e+360)%360,a=angleToPoint(e,i,o,n),s=angleToPoint(t,i,o,n),l=r>180?1:0;return`M ${a.x},${a.y} A ${i},${i} 0 ${l} 1 ${s.x},${s.y}`}class ChronoGaugeCard extends LitElement{static properties={_fieldValues:{type:Array},_headerValue:{type:String},_footerValue:{type:String},_backgroundImageUrl:{type:String},_needleValues:{type:Array}};constructor(){super(),this._config=null,this._hass=null,this._templateUnsubs=[],this._subscriptionsActive=!1,this._fieldValues=[],this._headerValue="",this._footerValue="",this._backgroundImageUrl="",this._needleValues=[]}set hass(e){this._hass=e,this._config&&!this._subscriptionsActive&&this._setupSubscriptions()}get hass(){return this._hass}setConfig(e){this._config={...DEFAULT_CONFIG,...e};const t=this._config,i=112-(parseFloat(t.gauge_size)??100);this.style.setProperty("--cg-gauge-margin",`${i}%`),this.style.setProperty("--cg-bezel-width",parseFloat(t.bezel_width)/2+"cqi"),this.style.setProperty("--cg-bezel-color",t.bezel_color),this.style.setProperty("--cg-background-color",t.background_color),this.style.setProperty("--cg-bezel-radius","50%"),this.style.setProperty("--cg-animation-duration",`${t.rotation_animation_time}s`),this._hass&&!this._subscriptionsActive&&this._setupSubscriptions()}get config(){return this._config}connectedCallback(){super.connectedCallback(),this._hass&&this._config&&this._setupSubscriptions()}disconnectedCallback(){super.disconnectedCallback(),this._teardownSubscriptions()}_setupSubscriptions(){if(this._teardownSubscriptions(),!this.hass?.connection||!this.config)return;this._subscriptionsActive=!0;const e=(e,t)=>{const i=String(e);if(!i.includes("{{"))return void t(i);const o=this.hass.connection.subscribeMessage(e=>t(e.result),{type:"render_template",template:i});this._templateUnsubs.push(o)};(this.config.fields||[]).forEach((t,i)=>{t.show?e(String(t.template),e=>{const t=[...this._fieldValues];t[i]=String(e),this._fieldValues=t}):this._fieldValues[i]=""}),this.config.header_show&&this.config.header_text?e(this.config.header_text,e=>{this._headerValue=e}):this._headerValue="",this.config.footer_show&&this.config.footer_text?e(this.config.footer_text,e=>{this._footerValue=e}):this._footerValue="",this.config.background_image_show?e(this.config.background_image_url,e=>{this._backgroundImageUrl=e}):this._backgroundImageUrl="",this._needleValues=[],(this.config.scales||[]).forEach((t,i)=>{this._needleValues[i]||(this._needleValues[i]=[]),(t.needles||[]).forEach((t,o)=>{t.show?e(t.template,e=>{const t=parseFloat(e),n=this._needleValues.map(e=>[...e]);n[i][o]=isNaN(t)?void 0:t,this._needleValues=n,this.requestUpdate()}):this._needleValues[i][o]=void 0})})}_teardownSubscriptions(){const e=this._templateUnsubs;this._templateUnsubs=[],this._subscriptionsActive=!1;for(const t of e)Promise.resolve(t).then(e=>e().catch(()=>{})).catch(()=>{})}_renderScale(e,t){const i=50+(parseFloat(e.position)??0),{arcStart:o,arcEnd:n}=cgGapToArc(parseFloat(e.gap_position)??0,parseFloat(e.gap_size)??180),r=buildArcPath(o,n,i,50,50);return html`
      <svg class="gauge-scale-svg" viewBox="0 0 100 100" preserveAspectRatio="none"
           overflow="visible">
        <path
          d="${r}"
          fill="none"
          stroke="#333333"
          stroke-width="1"
          stroke-linecap="butt"
        />
      </svg>
    `}render(){const e=this.config||{};return html`
      <ha-card>
        <div class="gauge-container">

          ${e.header_show?html`
            <div class="card-header-text"
                 style="font-size:${e.header_font_size}em;
                        font-weight:${e.header_font_weight};
                        color:${e.header_font_color};
                        top:calc(${6}cqi - ${e.header_position}cqi);">
              ${this._headerValue.split("<br>").map((e,t,i)=>html`${e}${t<i.length-1?html`<br>`:""}`)}
            </div>
          `:""}

          <div class="gauge-layer">

            <div class="gauge-bezel-layer">
              ${e.background_image_show&&this._backgroundImageUrl?html`
                <img class="gauge-bg-image"
                  src="${this._backgroundImageUrl}"
                  style="transform: translate(-50%, -50%)
                                   translate(${e.background_image_x}%, ${-e.background_image_y}%)
                                   rotate(${e.background_image_rotate}deg)
                                   scale(${e.background_image_scale/100});"
                />
              `:""}

              ${(e.fields||[]).map((e,t)=>e.show?html`
                  <div class="field"
                       style="top:${e.position}%;
                              font-size:${8*e.font_size}cqi;
                              font-weight:${e.font_weight};
                              color:${e.font_color};">
                    ${this._fieldValues[t]??""}
                    ${e.unit?html`<span style="font-size:${8*e.unit_font_size}cqi;
                                               font-weight:${e.unit_font_weight};
                                               color:${e.unit_font_color};">${e.unit}</span>`:""}
                  </div>
                `:html``)}
            </div>

            <div class="gauge-global-rotate-group"
                 style="transform:rotate(${e.arc_rotation}deg)">
              ${(e.scales||[]).map((e,t)=>html`
                <div class="gauge-scale-rotate-group"
                     style="transform:rotate(${e.arc_rotation??0}deg)">
                  ${this._renderScale(e,t)}
                </div>
              `)}
            </div>

          </div>

          ${e.footer_show?html`
            <div class="card-footer-text"
                 style="font-size:${e.footer_font_size}em;
                        font-weight:${e.footer_font_weight};
                        color:${e.footer_font_color};
                        bottom:calc(${6}cqi + ${e.footer_position}cqi);">
              ${this._footerValue.split("<br>").map((e,t,i)=>html`${e}${t<i.length-1?html`<br>`:""}`)}
            </div>
          `:""}

        </div>
      </ha-card>
    `}static styles=css`
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
      position: relative;
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

    .gauge-scale-svg {
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
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
  `;static getCardSize(){return 4}static getConfigElement(){return document.createElement("chrono-gauge-card-editor")}static getStubConfig(){return{...DEFAULT_CONFIG}}}customElements.define("chrono-gauge-card",ChronoGaugeCard),window.customCards=window.customCards||[],window.customCards.push({type:"chrono-gauge-card",name:"Chrono Gauge Card",description:"A flexible multi-scale gauge card with independently styled scales, sections, ticks and needles.",preview:!0});