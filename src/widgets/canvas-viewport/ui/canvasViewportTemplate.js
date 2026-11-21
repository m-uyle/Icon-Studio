export const canvasViewportTemplate = `
        <section class="viewport-area" id="viewportArea">
          <div class="pan-zoom-container" id="panZoomContainer">
            <div
              class="canvas-transform-group artboard-stage"
              id="canvasTransformGroup"
            >
              <div class="stage-container" id="stageContainer">
                <svg
                  class="master-svg crisp-stroke"
                  id="masterSvg"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g id="layerGrid"></g>
                  <g id="layerKeylines"></g>
                  <g id="layerIllustrationGuides"></g>
                  <g id="layerArtwork"></g>
                  <g id="layerQaOverlay"></g>
                </svg>
              </div>
            </div>
          </div>

          <!-- Floating HUD Pill Left -->
          <div class="floating-hud-pill viewport-hud-left">
            <button
              aria-pressed="true"
              class="inspect-btn active"
              data-tooltip="Show or hide artboard card"
              id="btnSurfaceMode"
              type="button"
            >
              <span>Card</span>
            </button>
            <button
              aria-pressed="false"
              class="inspect-btn is-hidden"
              data-tooltip="Make icon semi-transparent over grid"
              id="btnDiffMode"
              type="button"
            >
              <span>X-Ray</span>
            </button>
            <div
              aria-label="Icon color mode"
              class="ui-segmented ui-segmented--pill ui-segmented--hud is-hidden"
              id="artColorSegment"
              role="radiogroup"
            >
              <button
                aria-checked="true"
                class="ui-segmented__btn ui-segmented__btn--xs is-active"
                data-tooltip="Theme monochrome"
                id="btnColorMono"
                role="radio"
                type="button"
              >
                Mono
              </button>
              <button
                aria-checked="false"
                class="ui-segmented__btn ui-segmented__btn--xs"
                data-tooltip="High-contrast tint over grid"
                id="btnColorContrast"
                role="radio"
                type="button"
              >
                Contrast
              </button>
              <button
                aria-checked="false"
                class="ui-segmented__btn ui-segmented__btn--xs"
                data-tooltip="Original SVG colors"
                id="btnColorOriginal"
                role="radio"
                type="button"
              >
                Color
              </button>
            </div>
          </div>

          <!-- Floating HUD Pill Right -->
          <div class="floating-hud-pill viewport-hud-right">
            <span class="viewport-zoom-label tnum font-mono" id="labelZoom"
              >1600%</span
            >
            <div
              aria-label="Zoom mode"
              class="view-switch mode-fit"
              role="group"
            >
              <button
                class="view-switch-btn is-active"
                data-tooltip="Fit artboard to viewport"
                id="btnZoomFit"
                type="button"
              >
                Fit
              </button>
              <button
                class="view-switch-btn"
                data-tooltip="Actual 100% pixel scale"
                id="btnZoom100"
                type="button"
              >
                1:1
              </button>
            </div>
          </div>
        </section>
`;
