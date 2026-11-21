# Icon Studio

Parametric grid tooling and production QA for SVG icons. Runs entirely in the browser with no external runtime dependencies.

## Features

### Parametric Grids & Keylines

- **Presets**: Standard 24×24, Apple SF, Compact 16, Medium 32, Large 48, Spot 4:3, Squircle 64, macOS 512.
- **Geometry controls**: canvas dimensions (16–512px), safe margin padding, corner radius, and aspect ratios (1:1, 4:3, 16:9).
- **13 guide overlays**: pixel grid, outer/inner safe zones, center crosshairs, diagonals, rule of thirds, geometric keylines (circle, square, horizontal/vertical rectangles), and golden ratio lines.

### Vector QA & Inspection

- **Subpixel linter**: parses SVG path coordinates to detect and highlight nodes not snapped to the integer pixel grid.
- **Safe margin check**: detects geometry that bleeds outside boundary margins.
- **Optical balance**: calculates the visual center of mass and measures displacement against the geometric center.
- **Canvas overlays**: toggleable visual indicators for off-grid points, safe margin bounds, visual bounding box, and balance crosshairs.

### Testing Matrix

- **Size scale**: previews icons across 16px to 48px to verify stroke clarity and visual weight at small sizes.
- **Pixel Loupe**: integer magnification lens to inspect rasterized pixels and anti-aliasing.
- **Silhouette blur**: simulates peripheral vision and low-contrast conditions to test shape recognition.
- **UI surfaces**: previews on light, dark, accent, glass, and disabled surfaces, plus mock UI components (buttons, input fields, navigation tabs).

### Batch Queue & Comparison

- **Import**: drag-and-drop multiple SVG files or paste raw SVG code directly from clipboard (`Ctrl+V`).
- **Side-by-side comparison**: auto-fitting grid with synchronized display modes (1:1 pixel size or fitted to safe area).
- **Transforms**: rotate 90°, flip horizontally, or auto-fit paths into safe boundaries.

### Export

- **Formats**: clean optimized SVG, React JSX component, and Android Vector XML.
- **Batch packaging**: downloads selected icons as a ZIP archive with sanitized filenames and an auto-generated TypeScript barrel export (`index.ts`).

## Shortcuts

| Shortcut               | Action                          |
| ---------------------- | ------------------------------- |
| `Space + Drag`         | Pan canvas                      |
| `[` / `]`              | Previous / next icon in queue   |
| `Delete` / `Backspace` | Remove active icon              |
| `Ctrl+V` / `Cmd+V`     | Paste SVG from clipboard        |
| `Escape`               | Close Matrix / return to Canvas |

---

[MIT License](./LICENSE)
