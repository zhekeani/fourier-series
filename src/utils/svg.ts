export interface PathPoint {
  x: number;
  y: number;
}

export interface PathData {
  paths: PathPoint[];
}

export interface PathsData {
  eightNotesData: PathData;
  trebleClefData: PathData;
  capitalFData: PathData;
  greekLetterPiData: PathData;
  greekLetterOmegaData: PathData;
}

export const loadPathJsonFile = async (path: string) => {
  try {
    const response = await fetch(path);
    const data: PathData = await response.json();

    return data;
  } catch (error) {
    console.error("Error fetching or parsing JSON:", error);
  }
};

export const generateJsonPaths = (
  pathElement: SVGPathElement,
  filename: string
) => {
  const bbox = pathElement.getBBox();

  const minX = bbox.x;
  const maxX = bbox.x + bbox.width;
  const minY = bbox.y;
  const maxY = bbox.y + bbox.height;

  const paths: { x: number; y: number }[] = [];
  const maxSize = Math.max(bbox.width, bbox.height);

  const pointCount = 10000;
  const xPadding =
    bbox.height > bbox.width ? (bbox.height - bbox.width) / 2 : 0;
  const yPadding =
    bbox.width > bbox.height ? (bbox.width - bbox.height) / 2 : 0;

  for (let i = 0; i < pointCount; i++) {
    const t = i / pointCount;
    const point = getPathPointAt(pathElement, t);
    const adjustedPoint = {
      x: (point.x - minX + xPadding) / maxSize,
      y: (point.y - minY + yPadding) / maxSize,
    };
    paths.push(adjustedPoint);
  }

  const shape = { paths };
  const jsonString = JSON.stringify(shape);

  downloadJsonFile(jsonString, filename);

  // Output the values
  console.log(`Min X: ${minX}, Max X: ${maxX}`);
  console.log(`Min Y: ${minY}, Max Y: ${maxY}`);
  console.log(paths);
};

export const getPathPointAt = (pathElement: SVGPathElement, t: number) => {
  const totalLength = pathElement.getTotalLength();
  const lengthAtT = t * totalLength;

  const point = pathElement.getPointAtLength(lengthAtT);
  return { x: point.x, y: point.y };
};

const downloadJsonFile = (json: string, fileName: string) => {
  const blob = new Blob([json], { type: "application/json" });

  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${fileName}.json`;

  document.body.appendChild(link);
  link.click();

  document.body.removeChild(link);
};
