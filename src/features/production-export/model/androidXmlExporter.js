import {
  convertShapeToPathData,
  getSvgParser,
} from "../../../shared/lib/index.js";

export function generateAndroidXmlCode(svgSource, state) {
  const W = state.width;
  const H = state.height;
  const parser = getSvgParser();
  let pathXml = "";

  if (parser) {
    const doc = parser.parseFromString(svgSource, "image/svg+xml");
    const elements = Array.from(
      doc.querySelectorAll(
        "path, rect, circle, ellipse, line, polyline, polygon"
      )
    );
    elements.forEach((el) => {
      const d = convertShapeToPathData(el);
      if (!d) {
        return;
      }
      const resolveAttr = (name) =>
        el.getAttribute(name) ??
        (typeof el.closest === "function"
          ? el.closest(`[${name}]`)?.getAttribute(name)
          : null);
      const stroke = resolveAttr("stroke");
      const sw = resolveAttr("stroke-width") || "2";
      const lineCap = resolveAttr("stroke-linecap");
      const lineJoin = resolveAttr("stroke-linejoin");
      const fillRule = resolveAttr("fill-rule");
      const extras = [];
      if (lineCap && ["butt", "round", "square"].includes(lineCap)) {
        extras.push(`        android:strokeLineCap="${lineCap}"`);
      }
      if (lineJoin && ["miter", "round", "bevel"].includes(lineJoin)) {
        extras.push(`        android:strokeLineJoin="${lineJoin}"`);
      }
      if (fillRule === "evenodd") {
        extras.push(`        android:fillType="evenOdd"`);
      }
      const extraStr = extras.length ? `\n${extras.join("\n")}` : "";

      if (stroke && stroke !== "none") {
        pathXml += `    <path\n        android:strokeColor="#FF000000"\n        android:strokeWidth="${sw}"${extraStr}\n        android:pathData="${d}" />\n`;
      } else {
        pathXml += `    <path\n        android:fillColor="#FF000000"${extraStr}\n        android:pathData="${d}" />\n`;
      }
    });
  }

  return `<vector xmlns:android="http://schemas.android.com/apk/res/android"\n    android:width="${W}dp"\n    android:height="${H}dp"\n    android:viewportWidth="${W}"\n    android:viewportHeight="${H}">\n${pathXml}</vector>`;
}
