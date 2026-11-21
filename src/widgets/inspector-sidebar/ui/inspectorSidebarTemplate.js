import { ICONS } from "../../../shared/ui/index.js";

export const inspectorSidebarTemplate = `
      <aside
        aria-label="Inspector and Controls"
        class="ui-panel inspector-sidebar"
        id="inspectorSidebar"
      >
        <div class="inspector-sidebar__tabs-bar">
          <div
            aria-label="Inspector Tabs"
            class="ui-tabs ui-tabs--fill"
            role="tablist"
          >
            <button
              aria-selected="true"
              class="ui-tabs__btn is-active"
              id="tabBtnGrid"
              role="tab"
              type="button"
            >
              <span>Grid</span>
            </button>
            <button
              aria-selected="false"
              class="ui-tabs__btn"
              id="tabBtnInspection"
              role="tab"
              type="button"
            >
              <span>Inspect</span>
              <span class="qa-tab-dot is-hidden" id="tabInspectionDot"></span>
            </button>
          </div>
        </div>

        <!-- TAB 1: Grid & Guides -->
        <div class="inspector-sidebar__pane app-scroll" id="tabPaneGrid">
          <section class="geometry-section">
            <div class="geometry-section__header">
              <span class="geometry-section__title">Canvas</span>
            </div>

            <div class="geometry-property-stack">
              <div class="geometry-property-item">
                <span class="geometry-property-label">Preset</span>
                <div class="geometry-property-ctrl">
                  <div id="presetDropdown"></div>
                </div>
              </div>

              <div class="geometry-property-item">
                <span class="geometry-property-label">Size</span>
                <div class="geometry-property-ctrl">
                  <div class="geometry-dim-inline font-mono">
                    <div
                      aria-label="Canvas Width"
                      aria-valuemax="1024"
                      aria-valuemin="8"
                      aria-valuenow="24"
                      class="dim-scrubber"
                      data-dim="width"
                      role="slider"
                      tabindex="0"
                    >
                      <span class="dim-scrubber__axis">W</span>
                      <span class="dim-scrubber__val tnum">24</span>
                      <input
                        aria-label="Canvas Width Value"
                        class="dim-scrubber__input is-hidden"
                        id="inputCanvasWidth"
                        max="1024"
                        min="8"
                        name="canvasWidth"
                        type="number"
                        value="24"
                      >
                    </div>

                    <button
                      aria-label="Lock aspect ratio"
                      aria-pressed="true"
                      class="geometry-aspect-btn"
                      data-tooltip="Lock / unlock aspect ratio"
                      id="btnLinkAspect"
                      type="button"
                    >
                      <svg
                        class="geometry-aspect-icon"
                        fill="none"
                        id="iconAspectLinked"
                        stroke="currentColor"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        viewBox="0 0 24 24"
                      >
                        <path
                          d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"
                        />
                        <path
                          d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"
                        />
                      </svg>
                      <svg
                        class="geometry-aspect-icon is-hidden"
                        fill="none"
                        id="iconAspectUnlinked"
                        stroke="currentColor"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        viewBox="0 0 24 24"
                      >
                        <path
                          d="m18.84 12.25 1.72-1.71a5 5 0 0 0-7.07-7.07l-1.72 1.71"
                        />
                        <path
                          d="m5.16 11.75-1.72 1.71a5 5 0 0 0 7.07 7.07l1.72-1.71"
                        />
                        <line x1="2" x2="22" y1="2" y2="22" />
                      </svg>
                    </button>

                    <div
                      aria-label="Canvas Height"
                      aria-valuemax="1024"
                      aria-valuemin="8"
                      aria-valuenow="24"
                      class="dim-scrubber"
                      data-dim="height"
                      role="slider"
                      tabindex="0"
                    >
                      <span class="dim-scrubber__axis">H</span>
                      <span class="dim-scrubber__val tnum">24</span>
                      <input
                        aria-label="Canvas Height Value"
                        class="dim-scrubber__input is-hidden"
                        id="inputCanvasHeight"
                        max="1024"
                        min="8"
                        name="canvasHeight"
                        type="number"
                        value="24"
                      >
                    </div>
                  </div>
                </div>
              </div>

              <div class="geometry-property-item">
                <span class="geometry-property-label">Quick Size</span>
                <div class="geometry-property-ctrl">
                  <div
                    aria-label="Quick Canvas Sizes"
                    class="geometry-segment-inline"
                    role="group"
                  >
                    <button class="btn-quick-size" data-size="16" type="button">
                      16
                    </button>
                    <button
                      class="btn-quick-size geometry-active"
                      data-size="24"
                      type="button"
                    >
                      24
                    </button>
                    <button class="btn-quick-size" data-size="32" type="button">
                      32
                    </button>
                    <button class="btn-quick-size" data-size="48" type="button">
                      48
                    </button>
                    <button class="btn-quick-size" data-size="64" type="button">
                      64
                    </button>
                  </div>
                </div>
              </div>

              <div class="geometry-property-item">
                <span class="geometry-property-label">Ratio</span>
                <div class="geometry-property-ctrl">
                  <div
                    aria-label="Aspect Ratio Presets"
                    class="geometry-segment-inline"
                    role="group"
                  >
                    <button
                      class="btn-quick-ratio geometry-active"
                      data-ratio="1:1"
                      type="button"
                    >
                      1:1
                    </button>
                    <button
                      class="btn-quick-ratio"
                      data-ratio="4:3"
                      data-tooltip="Double-click to flip"
                      type="button"
                    >
                      4:3
                    </button>
                    <button
                      class="btn-quick-ratio"
                      data-ratio="16:9"
                      data-tooltip="Double-click to flip"
                      type="button"
                    >
                      16:9
                    </button>
                  </div>
                </div>
              </div>

              <div class="geometry-property-item">
                <span class="geometry-property-label">Safe Margin</span>
                <div class="geometry-property-ctrl">
                  <div
                    aria-label="Safe Margin"
                    class="precision-scrubber geometry-scrubber"
                    data-id="padding"
                    role="group"
                  >
                    <div class="scrubber-bar"></div>
                    <button
                      class="scrubber-step-btn"
                      data-action="dec"
                      tabindex="-1"
                      type="button"
                    >
                      −
                    </button>
                    <div class="scrubber-display">
                      <span class="scrubber-val">2.0</span>
                    </div>
                    <button
                      class="scrubber-step-btn"
                      data-action="inc"
                      tabindex="-1"
                      type="button"
                    >
                      +
                    </button>
                    <input
                      aria-label="Safe Margin Value"
                      class="scrubber-input is-hidden"
                      id="inputSafeMargin"
                      name="safeMargin"
                      step="0.5"
                      type="number"
                    >
                  </div>
                </div>
              </div>

              <div class="geometry-property-item">
                <span class="geometry-property-label">Corner Radius</span>
                <div class="geometry-property-ctrl">
                  <div
                    aria-label="Corner Radius"
                    class="precision-scrubber geometry-scrubber"
                    data-id="radius"
                    role="group"
                  >
                    <div class="scrubber-bar"></div>
                    <button
                      class="scrubber-step-btn"
                      data-action="dec"
                      tabindex="-1"
                      type="button"
                    >
                      −
                    </button>
                    <div class="scrubber-display">
                      <span class="scrubber-val">2.0</span>
                    </div>
                    <button
                      class="scrubber-step-btn"
                      data-action="inc"
                      tabindex="-1"
                      type="button"
                    >
                      +
                    </button>
                    <input
                      aria-label="Corner Radius Value"
                      class="scrubber-input is-hidden"
                      id="inputCornerRadius"
                      name="cornerRadius"
                      step="0.5"
                      type="number"
                    >
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div class="ui-divider"></div>

          <!-- SECTION: Guide Layers -->
          <section class="inspector-section">
            <div class="inspector-section__header">
              <div class="inspector-section__title-row">
                <span class="inspector-section__title">Guides</span>
                <span
                  class="inspector-section__badge font-mono"
                  id="guideCountBadge"
                  >4 / 13</span
                >
              </div>
              <div
                aria-label="Guide Layer Presets"
                class="ui-chip-group"
                role="group"
              >
                <button class="ui-chip" id="btnGuidesCore" type="button">
                  Core
                </button>
                <button class="ui-chip" id="btnGuidesAll" type="button">
                  All
                </button>
                <button class="ui-chip" id="btnGuidesClear" type="button">
                  None
                </button>
              </div>
            </div>

            <div class="layer-toggle-grid">
              <button
                aria-checked="true"
                class="layer-toggle active"
                data-key="showCircle"
                role="switch"
                type="button"
              >
                <div class="layer-toggle__lead">
                  <svg
                    class="guide-icon guide-color-circle"
                    viewBox="0 0 14 14"
                  >
                    <circle cx="7" cy="7" r="5" />
                  </svg>
                  <span class="truncate">Circle</span>
                </div>
                ${ICONS.check}
              </button>

              <button
                aria-checked="true"
                class="layer-toggle active"
                data-key="showSquare"
                role="switch"
                type="button"
              >
                <div class="layer-toggle__lead">
                  <svg
                    class="guide-icon guide-color-square"
                    viewBox="0 0 14 14"
                  >
                    <rect height="10" rx="0.8" width="10" x="2" y="2" />
                  </svg>
                  <span class="truncate">Square</span>
                </div>
                ${ICONS.check}
              </button>

              <button
                aria-checked="true"
                class="layer-toggle active"
                data-key="showSafeZone"
                role="switch"
                type="button"
              >
                <div class="layer-toggle__lead">
                  <svg
                    class="guide-icon guide-color-safe-zone"
                    viewBox="0 0 14 14"
                  >
                    <rect height="11" width="11" x="1.5" y="1.5" />
                    <rect height="7" width="7" x="3.5" y="3.5" />
                  </svg>
                  <span class="truncate">Safe Margin</span>
                </div>
                ${ICONS.check}
              </button>

              <button
                aria-checked="true"
                class="layer-toggle active"
                data-key="showAxes"
                role="switch"
                type="button"
              >
                <div class="layer-toggle__lead">
                  <svg class="guide-icon guide-color-axes" viewBox="0 0 14 14">
                    <path d="M7 1v12M1 7h12" />
                  </svg>
                  <span class="truncate">Axes</span>
                </div>
                ${ICONS.check}
              </button>

              <button
                aria-checked="false"
                class="layer-toggle"
                data-key="showRectH"
                role="switch"
                type="button"
              >
                <div class="layer-toggle__lead">
                  <svg
                    class="guide-icon guide-color-rect-h"
                    viewBox="0 0 14 14"
                  >
                    <rect height="8" rx="0.7" width="11" x="1.5" y="3" />
                  </svg>
                  <span class="truncate">Wide 4:3</span>
                </div>
                ${ICONS.check}
              </button>

              <button
                aria-checked="false"
                class="layer-toggle"
                data-key="showRectV"
                role="switch"
                type="button"
              >
                <div class="layer-toggle__lead">
                  <svg
                    class="guide-icon guide-color-rect-v"
                    viewBox="0 0 14 14"
                  >
                    <rect height="11" rx="0.7" width="8" x="3" y="1.5" />
                  </svg>
                  <span class="truncate">Tall 3:4</span>
                </div>
                ${ICONS.check}
              </button>

              <button
                aria-checked="false"
                class="layer-toggle"
                data-key="showHarmonicPrimitives"
                role="switch"
                type="button"
              >
                <div class="layer-toggle__lead">
                  <svg
                    class="guide-icon guide-color-harmonic"
                    viewBox="0 0 14 14"
                  >
                    <path d="M7 1.5 12.5 11H1.5L7 1.5Z" />
                  </svg>
                  <span class="truncate">Triangle</span>
                </div>
                ${ICONS.check}
              </button>

              <button
                aria-checked="false"
                class="layer-toggle"
                data-key="showConcentric"
                data-tooltip="50% inner keyline circle"
                role="switch"
                type="button"
              >
                <div class="layer-toggle__lead">
                  <svg
                    class="guide-icon guide-color-concentric"
                    viewBox="0 0 14 14"
                  >
                    <circle cx="7" cy="7" r="5.5" />
                    <circle cx="7" cy="7" r="2.5" />
                  </svg>
                  <span class="truncate">Inner Circle</span>
                </div>
                ${ICONS.check}
              </button>

              <button
                aria-checked="false"
                class="layer-toggle"
                data-key="showRays3060"
                data-tooltip="30° and 60° radial guides"
                role="switch"
                type="button"
              >
                <div class="layer-toggle__lead">
                  <svg class="guide-icon guide-color-rays" viewBox="0 0 14 14">
                    <path d="M1.8 10.1 12.2 4.1M3.9 12.2 10.1 1.8" />
                  </svg>
                  <span class="truncate">Angle Rays</span>
                </div>
                ${ICONS.check}
              </button>

              <button
                aria-checked="false"
                class="layer-toggle"
                data-key="showThirds"
                data-tooltip="Rule of thirds composition grid"
                role="switch"
                type="button"
              >
                <div class="layer-toggle__lead">
                  <svg
                    class="guide-icon guide-color-thirds"
                    viewBox="0 0 14 14"
                  >
                    <path
                      d="M5.17 1.5v11M8.83 1.5v11M1.5 5.17h11M1.5 8.83h11"
                    />
                  </svg>
                  <span class="truncate">Thirds</span>
                </div>
                ${ICONS.check}
              </button>

              <button
                aria-checked="false"
                class="layer-toggle"
                data-key="showDiagonals"
                role="switch"
                type="button"
              >
                <div class="layer-toggle__lead">
                  <svg
                    class="guide-icon guide-color-diagonals"
                    viewBox="0 0 14 14"
                  >
                    <path d="M1.5 1.5 12.5 12.5M12.5 1.5 1.5 12.5" />
                  </svg>
                  <span class="truncate">Diagonals</span>
                </div>
                ${ICONS.check}
              </button>

              <button
                aria-checked="false"
                class="layer-toggle"
                data-key="showPixelGrid"
                role="switch"
                type="button"
              >
                <div class="layer-toggle__lead">
                  <svg class="guide-icon guide-color-pixel" viewBox="0 0 14 14">
                    <path
                      d="M1.5 1.5h11v11h-11zM4.25 1.5v11M7 1.5v11M9.75 1.5v11M1.5 4.25h11M1.5 7h11M1.5 9.75h11"
                    />
                  </svg>
                  <span class="truncate">Pixel Grid</span>
                </div>
                ${ICONS.check}
              </button>

              <button
                aria-checked="false"
                class="layer-toggle layer-toggle--span-2"
                data-key="showIllustrationSpecial"
                data-tooltip="Ground baseline & corner badge zone"
                role="switch"
                type="button"
              >
                <div class="layer-toggle__lead">
                  <svg
                    class="guide-icon guide-color-illustration"
                    viewBox="0 0 14 14"
                  >
                    <line
                      stroke-dasharray="1.5 1"
                      x1="1.5"
                      x2="8.5"
                      y1="10.5"
                      y2="10.5"
                    />
                    <circle cx="10" cy="10" r="2.5" stroke-dasharray="1.5 1" />
                  </svg>
                  <span class="truncate">Baseline & Notch</span>
                </div>
                ${ICONS.check}
              </button>
            </div>
          </section>
        </div>

        <!-- TAB 2: Inspection Pane -->
        <div
          class="inspector-sidebar__pane app-scroll is-hidden"
          id="tabPaneInspection"
        >
          <section class="qa-section">
            <div class="qa-section__header">
              <span class="qa-section__title">Health</span>
              <span class="qa-status-badge is-hidden" id="qaStatusSummary"
                >Passed</span
              >
            </div>

            <div class="qa-empty-state" id="qaEmptyState">
              <svg
                class="qa-empty-state__icon"
                fill="none"
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.75"
                viewBox="0 0 24 24"
              >
                <circle cx="12" cy="12" r="9" />
                <path d="m9 12 2 2 4-4" />
              </svg>
              <span class="qa-empty-state__title">No icon loaded</span>
              <span class="qa-empty-state__sub">Add an SVG to run checks</span>
            </div>

            <div class="qa-health-strip is-hidden" id="qaHealthStrip">
              <div class="qa-metrics-grid">
                <div
                  class="qa-metric-tile"
                  data-tooltip="Nodes off the pixel grid"
                >
                  <span class="qa-metric-tile__label">Subpixel</span>
                  <span
                    class="qa-metric-tile__value truncate"
                    id="qaSubpixelVal"
                    >Clean</span
                  >
                </div>
                <div
                  class="qa-metric-tile"
                  data-tooltip="Pixels extending beyond safe margin"
                >
                  <span class="qa-metric-tile__label">Safe Margin</span>
                  <span class="qa-metric-tile__value truncate" id="qaBleedVal"
                    >Safe</span
                  >
                </div>
                <div
                  class="qa-metric-tile"
                  data-tooltip="Filled area ratio across the canvas"
                >
                  <span class="qa-metric-tile__label">Density</span>
                  <span class="qa-metric-tile__value truncate" id="qaDensityVal"
                    >—</span
                  >
                </div>
                <div
                  class="qa-metric-tile"
                  data-tooltip="Offset between visual center and canvas center"
                >
                  <span class="qa-metric-tile__label">Balance</span>
                  <span class="qa-metric-tile__value truncate" id="qaDriftVal"
                    >Balanced</span
                  >
                </div>
              </div>
            </div>
          </section>

          <div class="ui-divider is-hidden" id="qaGeometryDivider"></div>

          <section class="qa-section is-hidden" id="qaGeometrySection">
            <div class="qa-section__header">
              <span class="qa-section__title">Geometry</span>
            </div>

            <div class="qa-specs-list">
              <div class="qa-specs-row">
                <span class="qa-specs-row__key">Bounds</span>
                <span
                  class="qa-specs-row__val tnum truncate font-mono"
                  id="qaBBoxDetail"
                  >—</span
                >
              </div>
              <div class="qa-specs-row">
                <span class="qa-specs-row__key">Visual Bounds</span>
                <span
                  class="qa-specs-row__val tnum truncate font-mono"
                  id="qaOpticalBoundsDetail"
                  >—</span
                >
              </div>
              <div class="qa-specs-row">
                <span class="qa-specs-row__key">Strokes</span>
                <span
                  class="qa-specs-row__val truncate font-mono"
                  id="qaStrokesDetail"
                  >—</span
                >
              </div>
              <div class="qa-specs-row">
                <span class="qa-specs-row__key">Visual Center</span>
                <span
                  class="qa-specs-row__val tnum font-mono"
                  id="qaCentroidDetail"
                  >—</span
                >
              </div>
            </div>
          </section>

          <div
            class="ui-divider qa-canvas-only is-hidden"
            id="qaMarkersDivider"
          ></div>

          <!-- SECTION: QA Overlays (2x2 clean grid, hidden when queue is empty or in Matrix) -->
          <section
            class="inspector-section qa-canvas-only is-hidden"
            id="qaMarkersSection"
          >
            <div class="inspector-section__header">
              <div class="inspector-section__title-row">
                <span class="inspector-section__title">Overlays</span>
                <span
                  class="inspector-section__badge font-mono"
                  id="qaCountBadge"
                  >4 / 4</span
                >
              </div>
              <div
                aria-label="Overlay Presets"
                class="ui-chip-group"
                role="group"
              >
                <button class="ui-chip" id="btnQaLayersAll" type="button">
                  All
                </button>
                <button class="ui-chip" id="btnQaLayersClear" type="button">
                  None
                </button>
              </div>
            </div>

            <div class="layer-toggle-grid">
              <button
                aria-checked="true"
                class="qa-toggle layer-toggle active"
                data-key="qaShowSubpixel"
                role="switch"
                type="button"
              >
                <div class="layer-toggle__lead">
                  <svg class="guide-icon qa-color-subpixel" viewBox="0 0 14 14">
                    <circle cx="7" cy="7" fill="currentColor" r="2.5" />
                    <path d="M7 1v12M1 7h12" />
                  </svg>
                  <span class="truncate">Off-grid Pts</span>
                </div>
                ${ICONS.check}
              </button>

              <button
                aria-checked="true"
                class="qa-toggle layer-toggle active"
                data-key="qaShowBleed"
                role="switch"
                type="button"
              >
                <div class="layer-toggle__lead">
                  <svg class="guide-icon qa-color-bleed" viewBox="0 0 14 14">
                    <rect height="11" width="11" x="1.5" y="1.5" />
                    <line x1="1.5" x2="12.5" y1="1.5" y2="12.5" />
                  </svg>
                  <span class="truncate">Safe Overflow</span>
                </div>
                ${ICONS.check}
              </button>

              <button
                aria-checked="true"
                class="qa-toggle layer-toggle active"
                data-key="qaShowOpticalBounds"
                role="switch"
                type="button"
              >
                <div class="layer-toggle__lead">
                  <svg
                    class="guide-icon qa-color-optical-bounds"
                    viewBox="0 0 14 14"
                  >
                    <rect
                      height="8"
                      stroke-dasharray="1.5 1"
                      width="8"
                      x="3"
                      y="3"
                    />
                  </svg>
                  <span class="truncate">Visual Box</span>
                </div>
                ${ICONS.check}
              </button>

              <button
                aria-checked="true"
                class="qa-toggle layer-toggle active"
                data-key="qaShowOpticalCenter"
                role="switch"
                type="button"
              >
                <div class="layer-toggle__lead">
                  <svg
                    class="guide-icon qa-color-optical-center"
                    viewBox="0 0 14 14"
                  >
                    <circle cx="7" cy="7" r="4" />
                    <path d="M7 2v10M2 7h10" />
                  </svg>
                  <span class="truncate">Balance</span>
                </div>
                ${ICONS.check}
              </button>
            </div>
          </section>
        </div>
      </aside>
`;
