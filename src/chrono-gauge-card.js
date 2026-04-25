// ─── Card Version ─────────────────────────────────────────────────────────────
const CARD_VERSION = '1.0.17.1';

// ─── Card Version History ─────────────────────────────────────────────────────
// v1.0.17: Fix section gradient angles (+90 compass→CSS) and re-apply clipPath to foreignObject
// v1.0.16: Fix clipPath using filled ring segment path; full-container foreignObject
// v1.0.15: Replace canvas sections with SVG clipPath + foreignObject + CSS conic-gradient
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

// ─── buildRingPath ────────────────────────────────────────────────────────────
// Builds a filled ring segment path — the area between outer radius rOuter and
// inner radius rInner, from arcStart to arcEnd (compass degrees).
// Used as clipPath geometry for section gradients.
function buildRingPath(arcStart, arcEnd, rOuter, rInner, cx, cy) {
  const arcSpan    = ((arcEnd - arcStart) + 360) % 360;
  const largeArc   = arcSpan > 180 ? 1 : 0;
  const p1         = angleToPoint(arcStart, rOuter, cx, cy);
  const p2         = angleToPoint(arcEnd,   rOuter, cx, cy);
  const p3         = angleToPoint(arcEnd,   rInner, cx, cy);
  const p4         = angleToPoint(arcStart, rInner, cx, cy);
  // Outer arc forward, line to inner, inner arc backward, close
  return `M ${p1.x},${p1.y} A ${rOuter},${rOuter} 0 ${largeArc} 1 ${p2.x},${p2.y} L ${p3.x},${p3.y} A ${rInner},${rInner} 0 ${largeArc} 0 ${p4.x},${p4.y} Z`;
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
        <svg class="gauge-scale-svg" viewBox="0 0 100 100" preserveAspectRatio="none" overflow="visible">
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
              const rOuter      = 50 + position;
              const rInner      = rOuter - strokeWidth;
              const ringPath    = buildRingPath(angleStart, angleEnd, rOuter, rInner, cx, cy);
              const clipId      = `section-clip-${si}-${i}`;
              return svg`
                <clipPath id="${clipId}" clipPathUnits="userSpaceOnUse">
                  <path d="${ringPath}" />
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
            const strokeWidth = parseFloat(sec.width)    || 16;
            const position    = parseFloat(sec.position) || 0;
            const clipId      = `section-clip-${si}-${i}`;
            const colorStart  = sec.color_start || '#ffffff';
            const colorEnd    = sec.color_end   || colorStart;

            // Solid color optimization — no gradient needed
            if (colorStart === colorEnd) {
              const rOuter  = 50 + position;
              const rInner  = rOuter - strokeWidth;
              const ringPath = buildRingPath(angleStart, angleEnd, rOuter, rInner, cx, cy);
              return svg`<path d="${ringPath}" fill="${colorStart}" />`;
            }

            // Gradient — no clip for testing, correct compass→CSS angle offset (+90)
            return svg`
              <foreignObject x="0" y="0" width="100" height="100">
                <div
                  xmlns="http://www.w3.org/1999/xhtml"
                  style="width:100%;height:100%;background:conic-gradient(transparent ${angleStart + 90}deg, ${colorStart} ${angleStart + 90}deg, ${colorEnd} ${angleEnd + 90}deg, transparent ${angleEnd + 90}deg);"
                ></div>
              </foreignObject>
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
