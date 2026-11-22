export const workspaceHeaderTemplate = `
        <header class="workspace-header" id="workspaceHeader">
          <div class="workspace-header__left">
            <div
              aria-label="Workspace View"
              class="ui-tabs ui-tabs--inline workspace-header__tabs"
              role="tablist"
            >
              <button
                aria-selected="true"
                class="ui-tabs__btn is-active"
                id="viewTabCanvas"
                role="tab"
                type="button"
              >
                <span>Canvas</span>
              </button>
              <button
                aria-selected="false"
                class="ui-tabs__btn"
                id="viewTabMatrix"
                role="tab"
                type="button"
              >
                <span>Matrix</span>
              </button>
            </div>
          </div>

          <h1 class="workspace-header__title">Icon Studio</h1>

          <div class="workspace-header__right">
            <button
              aria-label="Help and shortcuts"
              class="ui-btn ui-btn--icon ui-btn--pill"
              data-tooltip="Help & Shortcuts (?)"
              id="btnHelp"
              type="button"
            >
              <svg
                class="workspace-header__action-icon"
                fill="none"
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                viewBox="0 0 24 24"
              >
                <path d="M8 8a4 4 0 1 1 6.3 3.3c-1.3 1-2.3 1.7-2.3 3.7" />
                <line x1="12" x2="12.01" y1="19" y2="19" />
              </svg>
            </button>

            <button
              aria-label="Reset all settings"
              class="ui-btn ui-btn--icon ui-btn--pill"
              data-tooltip="Reset settings (24×24)"
              id="btnResetAll"
              type="button"
            >
              <svg
                class="workspace-header__action-icon workspace-header__reset-icon"
                fill="none"
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                viewBox="0 0 24 24"
              >
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
              </svg>
            </button>

            <button
              aria-label="Switch to dark theme"
              aria-pressed="false"
              class="ui-btn ui-btn--icon ui-btn--pill"
              data-tooltip="Switch to dark theme"
              id="btnThemeToggle"
              type="button"
            >
              <svg
                class="workspace-header__action-icon"
                fill="none"
                id="iconThemeMoon"
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                viewBox="0 0 24 24"
              >
                <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
              </svg>
              <svg
                class="workspace-header__action-icon is-hidden"
                fill="none"
                id="iconThemeSun"
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                viewBox="0 0 24 24"
              >
                <circle cx="12" cy="12" r="4" />
                <path
                  d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"
                />
              </svg>
            </button>
          </div>
        </header>
`;
