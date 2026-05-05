import { readJSON, ensureOutputDir } from "./utils/common.js";
import fs from "fs";
import path from "path";

function generate() {
  ensureOutputDir();

  // Read and parse the GeoJSON file directly
  const geo = readJSON("KLA_AC_2026.geojson");

  let minX = Infinity,
    maxX = -Infinity,
    minY = Infinity,
    maxY = -Infinity;

  geo.features.forEach((f) => {
    let allCoords = [];

    // Standardize coordinate extraction to an array of outer rings
    if (f.geometry.type === "Polygon") {
      allCoords = [f.geometry.coordinates[0]];
    } else if (f.geometry.type === "MultiPolygon") {
      allCoords = f.geometry.coordinates.map((p) => p[0]);
    }

    allCoords.forEach((ring) => {
      ring.forEach(([x, y]) => {
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
      });
    });
  });

  const padding = 2;
  const rawWidth = maxX - minX;
  const rawHeight = maxY - minY;

  const viewWidth = 263;
  const viewHeight = 345;
  const scale = Math.min(viewWidth / rawWidth, viewHeight / rawHeight);

  const offsetX = padding;
  const offsetY = padding;
  const flippedMinY = 0;

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${viewWidth} ${viewHeight}" width="${viewWidth}" height="${viewHeight}">\n`;
  svg += `  <style>path { fill: #9ca3af; stroke: #232323; stroke-width: 0.003; }</style>\n`;
  svg += `  <g transform="translate(${offsetX}, ${offsetY}) scale(${scale}) translate(${-minX}, ${-flippedMinY})">\n`;

  geo.features.forEach((feature, idx) => {
    // Updated property keys mapping to the new GeoJSON format
    const qid = feature.properties.AC_QID || `Q${idx}`;
    const name = feature.properties.AC_NAME || "";
    const coords = feature.geometry.coordinates;

    let pathData = "";

    if (feature.geometry.type === "Polygon") {
      const ring = coords[0];
      const points = ring
        .map((coord) => `${coord[0]},${maxY - coord[1]}`)
        .join(" ");
      pathData = `M ${points} Z`;
    } else if (feature.geometry.type === "MultiPolygon") {
      pathData = coords
        .map((polygon) => {
          const ring = polygon[0];
          const points = ring
            .map((coord) => `${coord[0]},${maxY - coord[1]}`)
            .join(" ");
          return `M ${points} Z`;
        })
        .join(" ");
    }

    svg += `    <path id="${qid}" data-qid="${qid}" data-name="${name}" d="${pathData}"/>\n`;
  });

  svg += `  </g>\n`;
  svg += `</svg>`;

  const outputPath = path.join(process.cwd(), "src", "data", "kla-map.svg");
  fs.writeFileSync(outputPath, svg);
  console.log(`Generated: ${outputPath}`);
}

export default generate;
