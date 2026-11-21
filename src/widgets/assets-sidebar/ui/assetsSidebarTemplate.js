export const assetsSidebarTemplate = `
      <aside
        aria-label="Assets and Exports"
        class="ui-panel assets-sidebar"
        id="assetsSidebar"
      >
        <div class="assets-sidebar__body">
          <!-- SECTION 1: Assets (Input & Queue) -->
          <section class="assets-section">
            <div class="assets-section__header">
              <div class="assets-section__title-row">
                <span class="assets-section__title">Assets</span>
                <span
                  class="assets-section__count tnum is-hidden"
                  id="assetsCountBadge"
                ></span>
              </div>
              <button
                aria-label="Clear queue"
                class="assets-clear-btn is-hidden"
                data-tooltip="Clear queue"
                id="btnClearSvg"
                type="button"
              >
                <svg
                  class="assets-clear-icon"
                  fill="none"
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M3 6h18" />
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                </svg>
              </button>
            </div>

            <input
              accept=".svg,image/svg+xml"
              aria-label="Upload SVG icon files"
              class="is-hidden"
              id="fileInput"
              multiple
              type="file"
            >
            <button
              aria-label="Drop or Select SVGs"
              class="dropzone"
              id="dropZone"
              type="button"
            >
              <div class="dropzone__title">
                <svg
                  class="dropzone__icon"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" x2="12" y1="3" y2="15" />
                </svg>
                <span id="dropTextLabel">Drop or Select SVGs</span>
              </div>
            </button>

            <!-- Queue List -->
            <div class="batch-list-col is-hidden" id="batchListCol">
              <div
                class="batch-list-col__header is-hidden"
                id="batchListHeader"
              >
                <span class="batch-list-col__label">Compare</span>
                <div
                  aria-label="Compare Selection"
                  class="ui-chip-group is-hidden"
                  id="batchCompareActions"
                  role="group"
                >
                  <button
                    class="ui-chip"
                    data-tooltip="Compare all icons side by side"
                    id="btnCompareAll"
                    type="button"
                  >
                    All
                  </button>
                  <button
                    class="ui-chip"
                    data-tooltip="Exit multi-compare"
                    id="btnCompareReset"
                    type="button"
                  >
                    None
                  </button>
                </div>
              </div>
              <div
                class="batch-items-list app-scroll"
                id="batchItemsList"
              ></div>
            </div>

            <!-- Bottom Artwork Fit, Compare Layout & Orientation Bar (hidden when empty) -->
            <div class="artwork-toolbar is-hidden" id="artworkToolbar">
              <div
                aria-label="Sizing mode"
                class="ui-segmented"
                role="radiogroup"
              >
                <button
                  aria-checked="true"
                  class="ui-segmented__btn ui-segmented__btn--xs is-active"
                  data-tooltip="Original size (1:1)"
                  id="btnFitCanvas"
                  role="radio"
                  type="button"
                >
                  1:1
                </button>
                <button
                  aria-checked="false"
                  class="ui-segmented__btn ui-segmented__btn--xs"
                  data-tooltip="Fit inside safe margin"
                  id="btnFitSafe"
                  role="radio"
                  type="button"
                >
                  Safe
                </button>
              </div>
              <div class="artwork-toolbar__transforms">
                <button
                  aria-label="Cycle compare grid layout"
                  class="artwork-grid-btn tnum is-hidden"
                  data-tooltip="Change grid layout"
                  id="btnGridCols"
                  type="button"
                >
                  Auto
                </button>
                <button
                  aria-label="Rotate 90 degrees"
                  class="artwork-transform-btn"
                  data-tooltip="Rotate 90°"
                  id="btnRotateArtwork"
                  type="button"
                >
                  <svg
                    class="artwork-transform-icon"
                    fill="none"
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"
                    />
                    <path d="M21 3v5h-5" />
                  </svg>
                </button>
                <button
                  aria-label="Flip horizontally"
                  class="artwork-transform-btn"
                  data-tooltip="Flip horizontally"
                  id="btnFlipArtwork"
                  type="button"
                >
                  <svg
                    class="artwork-transform-icon"
                    fill="none"
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8 3H5a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h3" />
                    <path d="M16 3h3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-3" />
                    <path d="M12 20v2" />
                    <path d="M12 14v2" />
                    <path d="M12 8v2" />
                    <path d="M12 2v2" />
                  </svg>
                </button>
              </div>
            </div>
          </section>

          <div class="ui-divider"></div>

          <!-- SECTION 2: Export (Output) -->
          <section class="export-section">
            <div class="assets-section__header">
              <span class="assets-section__title">Export</span>
            </div>

            <div
              aria-label="Export Format"
              class="ui-segmented ui-segmented--grid-3"
              role="radiogroup"
            >
              <button
                aria-checked="true"
                class="ui-segmented__btn ui-segmented__btn--22 is-active"
                data-tooltip="Figma & Web SVG"
                id="expFmtFigma"
                role="radio"
                type="button"
              >
                SVG
              </button>
              <button
                aria-checked="false"
                class="ui-segmented__btn ui-segmented__btn--22"
                data-tooltip="React JSX Component"
                id="expFmtReact"
                role="radio"
                type="button"
              >
                JSX
              </button>
              <button
                aria-checked="false"
                class="ui-segmented__btn ui-segmented__btn--22"
                data-tooltip="Android Vector XML"
                id="expFmtAndroid"
                role="radio"
                type="button"
              >
                XML
              </button>
            </div>

            <div
              aria-label="SVG Export Content"
              class="ui-segmented ui-segmented--grid-3 is-hidden"
              id="exportTargetRow"
              role="radiogroup"
            >
              <button
                aria-checked="false"
                class="ui-segmented__btn ui-segmented__btn--22"
                data-tooltip="Icon only"
                id="expTargetClean"
                role="radio"
                type="button"
              >
                Icon
              </button>
              <button
                aria-checked="true"
                class="ui-segmented__btn ui-segmented__btn--22 is-active"
                data-tooltip="Grid template only"
                id="expTargetGuides"
                role="radio"
                type="button"
              >
                Grid
              </button>
              <button
                aria-checked="false"
                class="ui-segmented__btn ui-segmented__btn--22"
                data-tooltip="Icon with grid"
                id="expTargetComposite"
                role="radio"
                type="button"
              >
                Both
              </button>
            </div>

            <div class="export-actions">
              <button
                class="ui-btn ui-btn--primary ui-btn--lg"
                id="btnCopyDevCode"
                type="button"
              >
                <svg
                  class="export-btn-icon"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"
                  />
                  <rect height="4" rx="1" ry="1" width="8" x="8" y="2" />
                </svg>
                <span id="btnCopyDevCodeLabel">Copy Grid SVG</span>
              </button>
              <button class="ui-btn" id="btnDownloadSingle" type="button">
                <svg
                  class="export-btn-icon"
                  fill="none"
                  id="iconDownloadFile"
                  stroke="currentColor"
                  stroke-width="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" x2="12" y1="15" y2="3" />
                </svg>
                <svg
                  class="export-btn-icon is-hidden"
                  fill="none"
                  id="iconDownloadZip"
                  stroke="currentColor"
                  stroke-width="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M21 8v13H3V8" />
                  <path d="M1 3h22v5H1z" />
                  <path d="M10 12h4" />
                </svg>
                <span id="btnDownloadSingleLabel">Download .svg</span>
              </button>
            </div>
          </section>
        </div>
      </aside>
`;
