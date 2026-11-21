/**
 * Grid presets, guide/QA keys, contrast palettes, stroke hierarchy, and dynamic scrubber bounds.
 */

export const CONTRAST_COLORS = {
  light: {
    safeZone: "#E11D48",
    circle: "#6366F1",
    square: "#2563EB",
    rectH: "#059669",
    rectV: "#10B981",
    harmonic: "#D97706",
    concentric: "#4F46E5",
    rays: "#9333EA",
    thirds: "#EA580C",
    axes: "#0891B2",
    diagonals: "#64748B",
    pixel: "#CBD5E1",
    illustration: "#D946EF",
    artDefault: "#18181B",
    artContrast: "#FF0055",
    halo: "#FFFFFF",
  },
  dark: {
    safeZone: "#FB7185",
    circle: "#818CF8",
    square: "#60A5FA",
    rectH: "#34D399",
    rectV: "#6EE7B7",
    harmonic: "#FBBF24",
    concentric: "#93C5FD",
    rays: "#C084FC",
    thirds: "#FB923C",
    axes: "#22D3EE",
    diagonals: "#94A3B8",
    pixel: "#2E3039",
    illustration: "#F472B6",
    artDefault: "#F4F4F5",
    artContrast: "#00FF66",
    halo: "#09090B",
  },
};

export const STROKE_HIERARCHY = {
  safeZone: 1.5,
  primaryKeylines: 1.5,
  rectangles: 1.2,
  advancedPrimitives: 1.2,
  axes: 1.0,
  rays: 0.9,
  diagonals: 1.0,
  pixelGrid: 1.0,
  illustration: 1.2,
};

export const PRESETS = {
  figma: { width: 24, height: 24, padding: 2.0, radius: 2.0, special: false },
  apple: { width: 24, height: 24, padding: 2.0, radius: 3.0, special: false },
  carbon16: {
    width: 16,
    height: 16,
    padding: 1.0,
    radius: 1.0,
    special: false,
  },
  carbon32: {
    width: 32,
    height: 32,
    padding: 2.0,
    radius: 2.0,
    special: false,
  },
  android48: {
    width: 48,
    height: 48,
    padding: 4.0,
    radius: 4.0,
    special: false,
  },
  spotIllustration: {
    width: 80,
    height: 60,
    padding: 4.0,
    radius: 6.0,
    special: true,
    type: "shelf",
  },
  featureCard64: {
    width: 64,
    height: 64,
    padding: 6.0,
    radius: 6.0,
    special: true,
    type: "shelf",
  },
  avatarBadge32: {
    width: 32,
    height: 32,
    padding: 2.0,
    radius: 4.0,
    special: true,
    type: "badge",
  },
  appSquircle64: {
    width: 64,
    height: 64,
    padding: 6.0,
    radius: 14.0,
    special: true,
    type: "squircle",
  },
  bannerWide: {
    width: 160,
    height: 90,
    padding: 8.0,
    radius: 8.0,
    special: false,
  },
  macos: {
    width: 512,
    height: 512,
    padding: 40.0,
    radius: 90.0,
    special: true,
    type: "squircle",
  },
};

export const GUIDE_KEYS = [
  "showCircle",
  "showSquare",
  "showSafeZone",
  "showAxes",
  "showRectH",
  "showRectV",
  "showHarmonicPrimitives",
  "showConcentric",
  "showRays3060",
  "showThirds",
  "showDiagonals",
  "showPixelGrid",
  "showIllustrationSpecial",
];

export const CORE_GUIDE_KEYS = [
  "showCircle",
  "showSquare",
  "showSafeZone",
  "showAxes",
];

export const QA_KEYS = [
  "qaShowSubpixel",
  "qaShowBleed",
  "qaShowOpticalBounds",
  "qaShowOpticalCenter",
];

export const CORE_QA_KEYS = [...QA_KEYS];

export function getScrubberBounds(id, width, height, padding) {
  const minDim = Math.min(width, height);
  if (id === "padding") {
    return {
      min: 0,
      max: Math.max(0, Math.floor((minDim - 2) / 2)),
      step: minDim >= 128 ? 1 : 0.5,
      decimals: 1,
    };
  }
  if (id === "radius") {
    const liveMin = Math.max(0, minDim - padding * 2);
    return {
      min: 0,
      max: Math.max(0, Math.floor(liveMin / 2)),
      step: minDim >= 128 ? 1 : 0.5,
      decimals: 1,
    };
  }
  return { min: 0, max: 32, step: 0.5, decimals: 1 };
}
