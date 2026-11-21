export const matrixDashboardTemplate = `
        <section class="matrix-area app-scroll is-hidden" id="matrixArea">
          <div class="matrix-container">
            <!-- SECTION 1: Scale & Raster -->
            <div class="matrix-card">
              <div class="matrix-card__header">
                <h3 class="matrix-card__title">Sizes & Pixels</h3>
                <div class="matrix-card__controls">
                  <button
                    aria-pressed="false"
                    class="matrix-blur-btn"
                    data-tooltip="Blur silhouette to check clarity"
                    id="btnMatrixSquint"
                    type="button"
                  >
                    Blur
                  </button>
                  <div
                    aria-label="Preview ground"
                    class="ui-segmented ui-segmented--pill ui-segmented--compact"
                    role="radiogroup"
                  >
                    <button
                      aria-checked="true"
                      class="ui-segmented__btn ui-segmented__btn--xs is-active"
                      id="btnSizeBgLight"
                      role="radio"
                      type="button"
                    >
                      Light
                    </button>
                    <button
                      aria-checked="false"
                      class="ui-segmented__btn ui-segmented__btn--xs"
                      id="btnSizeBgDark"
                      role="radio"
                      type="button"
                    >
                      Dark
                    </button>
                    <button
                      aria-checked="false"
                      class="ui-segmented__btn ui-segmented__btn--xs"
                      id="btnSizeBgCheckers"
                      role="radio"
                      type="button"
                    >
                      Alpha
                    </button>
                  </div>
                </div>
              </div>

              <div class="matrix-scale-layout">
                <div
                  class="matrix-scale-ground matrix-scale-ground--light"
                  id="sizeScaleGround"
                >
                  <button
                    class="matrix-scale-cell is-loupe-target"
                    data-loupe-size="16"
                    data-tooltip="Inspect 16px raster"
                    type="button"
                  >
                    <span class="matrix-scale-cell__px font-mono">16px</span>
                    <div class="matrix-scale-cell__stage">
                      <div
                        class="matrix-scale-cell__slot matrix-scale-cell__slot--16"
                        id="sizeSlot16"
                      ></div>
                    </div>
                  </button>

                  <button
                    class="matrix-scale-cell"
                    data-loupe-size="20"
                    data-tooltip="Inspect 20px raster"
                    type="button"
                  >
                    <span class="matrix-scale-cell__px font-mono">20px</span>
                    <div class="matrix-scale-cell__stage">
                      <div
                        class="matrix-scale-cell__slot matrix-scale-cell__slot--20"
                        id="sizeSlot20"
                      ></div>
                    </div>
                  </button>

                  <button
                    class="matrix-scale-cell"
                    data-loupe-size="24"
                    data-tooltip="Inspect 24px raster"
                    type="button"
                  >
                    <span class="matrix-scale-cell__px font-mono">24px</span>
                    <div class="matrix-scale-cell__stage">
                      <div
                        class="matrix-scale-cell__slot matrix-scale-cell__slot--24"
                        id="sizeSlot24"
                      ></div>
                    </div>
                  </button>

                  <button
                    class="matrix-scale-cell"
                    data-loupe-size="32"
                    data-tooltip="Inspect 32px raster"
                    type="button"
                  >
                    <span class="matrix-scale-cell__px font-mono">32px</span>
                    <div class="matrix-scale-cell__stage">
                      <div
                        class="matrix-scale-cell__slot matrix-scale-cell__slot--32"
                        id="sizeSlot32"
                      ></div>
                    </div>
                  </button>

                  <button
                    class="matrix-scale-cell"
                    data-loupe-size="48"
                    data-tooltip="Inspect 48px raster"
                    type="button"
                  >
                    <span class="matrix-scale-cell__px font-mono">48px</span>
                    <div class="matrix-scale-cell__stage">
                      <div
                        class="matrix-scale-cell__slot matrix-scale-cell__slot--48"
                        id="sizeSlot48"
                      ></div>
                    </div>
                  </button>
                </div>

                <!-- Interactive Pixel Loupe -->
                <div class="matrix-loupe-card">
                  <div class="matrix-loupe-card__head">
                    <span class="matrix-loupe-card__title">Pixel Loupe</span>
                    <span
                      class="matrix-loupe-card__target font-mono"
                      id="matrixLoupeTargetLabel"
                      >16px</span
                    >
                  </div>
                  <div class="matrix-loupe-card__frame bg-checkers">
                    <canvas
                      class="matrix-loupe-card__canvas render-crisp-1x"
                      id="matrixLoupeCanvas"
                    ></canvas>
                  </div>
                </div>
              </div>
            </div>

            <!-- SECTION 2: Surfaces & States -->
            <div class="matrix-card">
              <div class="matrix-card__header">
                <h3 class="matrix-card__title">Surfaces</h3>
              </div>

              <div class="matrix-surface-grid">
                <div class="surface-swatch surface-swatch--white">
                  <div class="surface-swatch__slot" id="surfSlotWhite"></div>
                  <span class="surface-swatch__label">Light</span>
                </div>

                <div class="surface-swatch surface-swatch--dark">
                  <div class="surface-swatch__slot" id="surfSlotDark"></div>
                  <span class="surface-swatch__label">Dark</span>
                </div>

                <div class="surface-swatch surface-swatch--brand">
                  <div class="surface-swatch__slot" id="surfSlotBrand"></div>
                  <span class="surface-swatch__label">Accent</span>
                </div>

                <div class="surface-swatch surface-swatch--glass">
                  <div class="surface-swatch__slot" id="surfSlotGlass"></div>
                  <span class="surface-swatch__label">Glass</span>
                </div>

                <div class="surface-swatch surface-swatch--disabled">
                  <div class="surface-swatch__slot" id="surfSlotDisabled"></div>
                  <span class="surface-swatch__label">Disabled</span>
                </div>
              </div>
            </div>

            <!-- SECTION 3: Real UI Contexts -->
            <div class="matrix-card">
              <div class="matrix-card__header">
                <h3 class="matrix-card__title">In UI</h3>
              </div>

              <div class="matrix-insitu-grid">
                <div class="insitu-cell">
                  <span class="insitu-cell__label">Buttons</span>
                  <div aria-hidden="true" class="insitu-btn-row">
                    <div class="insitu-solid-btn">
                      <div class="insitu-icon-slot" id="inSituButtonIcon"></div>
                      <span>Confirm</span>
                    </div>
                    <div class="insitu-ghost-btn">
                      <div class="insitu-icon-slot" id="inSituGhostIcon"></div>
                      <span>Action</span>
                    </div>
                  </div>
                </div>

                <div class="insitu-cell">
                  <span class="insitu-cell__label">Input</span>
                  <div aria-hidden="true" class="insitu-input-mock">
                    <div class="insitu-icon-slot" id="inSituInputIcon"></div>
                    <span class="insitu-input-mock__placeholder"
                      >Search components...</span
                    >
                  </div>
                </div>

                <div class="insitu-cell">
                  <span class="insitu-cell__label">Tab Bar</span>
                  <div aria-hidden="true" class="insitu-tabbar">
                    <div class="insitu-tabbar__item">
                      <svg
                        class="insitu-tabbar__peer"
                        fill="none"
                        stroke="currentColor"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        viewBox="0 0 24 24"
                      >
                        <path
                          d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
                        />
                      </svg>
                      <span>Home</span>
                    </div>
                    <div class="insitu-tabbar__item is-active">
                      <div
                        class="insitu-icon-slot insitu-icon-slot--20"
                        id="inSituTabIcon"
                      ></div>
                      <span>Active</span>
                    </div>
                    <div class="insitu-tabbar__item">
                      <svg
                        class="insitu-tabbar__peer"
                        fill="none"
                        stroke="currentColor"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        viewBox="0 0 24 24"
                      >
                        <circle cx="12" cy="8" r="4" />
                        <path d="M20 21a8 8 0 0 0-16 0" />
                      </svg>
                      <span>Profile</span>
                    </div>
                  </div>
                </div>

                <div class="insitu-cell">
                  <span class="insitu-cell__label">Icon Controls</span>
                  <div aria-hidden="true" class="insitu-controls-row">
                    <div class="insitu-controls-group">
                      <div class="insitu-icon-circle">
                        <div
                          class="insitu-icon-slot"
                          id="inSituCircleIcon"
                        ></div>
                      </div>
                      <div class="insitu-icon-circle insitu-icon-circle--solid">
                        <div
                          class="insitu-icon-slot"
                          id="inSituCircleSolidIcon"
                        ></div>
                      </div>
                      <div class="insitu-icon-square">
                        <div
                          class="insitu-icon-slot"
                          id="inSituSquareIcon"
                        ></div>
                        <span class="insitu-notif-dot"></span>
                      </div>
                    </div>
                    <div class="insitu-controls-group">
                      <div class="insitu-tag-chip">
                        <div
                          class="insitu-icon-slot insitu-icon-slot--14"
                          id="inSituTagIcon"
                        ></div>
                        <span>Badge</span>
                      </div>
                      <div class="insitu-mini-bar">
                        <div class="insitu-mini-bar__btn is-active">
                          <div
                            class="insitu-icon-slot insitu-icon-slot--14"
                            id="inSituBarIcon"
                          ></div>
                        </div>
                        <div class="insitu-mini-bar__btn">
                          <svg
                            class="insitu-mini-bar__peer"
                            fill="none"
                            stroke="currentColor"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            viewBox="0 0 24 24"
                          >
                            <circle cx="12" cy="12" r="1" />
                            <circle cx="19" cy="12" r="1" />
                            <circle cx="5" cy="12" r="1" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
`;
