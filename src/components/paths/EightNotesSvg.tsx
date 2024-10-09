import { useEffect, useRef } from "react";
import { generateJsonPaths } from "../../utils/svg";

const isGeneratePath = false;

const EightNotesSvg = () => {
  const pathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    if (pathRef.current && isGeneratePath) {
      generateJsonPaths(pathRef.current, "eight-notes");
    }
  }, []);

  return (
    <svg
      width="80%"
      height="80%"
      viewBox="0 0 300 300.00003"
      version="1.1"
      id="svg1"
      xmlSpace="preserve"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs id="defs1" />
      <g id="layer1" transform="translate(366.74653,-572.44713)">
        <g id="g7" transform="translate(-116.82655,157.07947)">
          <rect
            style={{ opacity: 0, fill: "#ffffff", strokeWidth: 3.65385 }}
            id="rect6"
            width="300"
            height="300"
            x="-249.92"
            y="415.36765"
          />
          <path
            ref={pathRef}
            style={{ fill: "none", stroke: "white", strokeWidth: 1 }}
            d="m -166.96423,712.08176 c -20.5254,-8.01518 -28.7743,-28.88263 -19.09532,-48.30574 14.32019,-28.73696 54.01446,-42.93432 81.22606,-29.05199 6.379516,3.25454 6.379516,3.25454 6.379516,-108.05092 0,-111.30546 0,-111.30546 6.13154,-111.30546 6.13148,0 6.13148,0 7.1889,8.46306 2.08724,16.70569 8.50237,26.60307 31.704092,48.91343 46.1320699,44.35987 55.0921599,82.64916 29.89179,127.73758 -7.3542,13.15807 -12.41215,14.4352 -6.97993,1.76242 18.5966,-43.3841 1.88661,-86.57738 -42.288262,-109.30991 -13.02134,-6.70082 -13.02134,-6.70082 -13.03017,83.73939 -0.006,60.0345 -0.58461,92.56277 -1.7206,96.75358 -8.10365,29.88709 -49.836466,50.20208 -79.407616,38.65456 z"
            id="path7"
          />
        </g>
      </g>
    </svg>
  );
};

export default EightNotesSvg;
