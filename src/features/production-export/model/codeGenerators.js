import {
  sanitizeFilename,
  sanitizeIdentifier,
} from "../../../shared/lib/index.js";
import { generateAndroidXmlCode } from "./androidXmlExporter.js";
import { generateReactCode } from "./reactExporter.js";
import { generateExportSvg } from "./svgExporter.js";

export const FORMAT_META = {
  figma: {
    copyLabel: "Copy SVG",
    toastLabel: "SVG",
    ext: "svg",
    mime: "image/svg+xml;charset=utf-8",
  },
  react: {
    copyLabel: "Copy React JSX",
    toastLabel: "React JSX",
    ext: "jsx",
    mime: "text/plain;charset=utf-8",
  },
  androidXml: {
    copyLabel: "Copy Android XML",
    toastLabel: "Android XML",
    ext: "xml",
    mime: "text/xml;charset=utf-8",
  },
};

export function generateDeveloperCode(state, format, iconOverride) {
  const curIcon =
    iconOverride === undefined
      ? state.batchQueue[state.batchIndex]
      : iconOverride;
  const effectiveState =
    format !== "figma" && curIcon ? { ...state, exportTarget: "clean" } : state;
  const svgSource = generateExportSvg(effectiveState, iconOverride);

  if (format === "figma") {
    return svgSource;
  }
  if (format === "react") {
    return generateReactCode(svgSource, state, curIcon);
  }
  if (format === "androidXml") {
    return generateAndroidXmlCode(svgSource, state);
  }

  return svgSource;
}

export function getSingleDownloadSpec(state, format = state.exportCodeFormat) {
  const meta = FORMAT_META[format] || FORMAT_META.figma;
  const curIcon = state.batchQueue[state.batchIndex];
  const baseName = curIcon
    ? sanitizeFilename(curIcon.name)
    : `icon-grid-${state.width}x${state.height}`;
  const code = generateDeveloperCode(state, format);

  let filename = `${baseName}.${meta.ext}`;
  if (format === "androidXml") {
    filename = `ic_${baseName.toLowerCase()}_${state.width}dp.xml`;
  } else if (format === "react") {
    filename = `${sanitizeIdentifier(baseName, "Icon")}.jsx`;
  }

  return { filename, mime: meta.mime, content: code };
}
