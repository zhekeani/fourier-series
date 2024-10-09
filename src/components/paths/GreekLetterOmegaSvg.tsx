import { useEffect, useRef } from "react";
import { generateJsonPaths } from "../../utils/svg";

const isGeneratePath = false;

const GreekLetterOmegaSvg = () => {
  const pathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    if (pathRef.current && isGeneratePath) {
      generateJsonPaths(pathRef.current, "greek-letter-Omega");
    }
  }, []);
  return (
    <svg
      width="80%"
      height="80%"
      viewBox="0 0 300.00003 299.99997"
      version="1.1"
      id="svg1"
      xmlSpace="preserve"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs id="defs1" />
      <g id="layer1" transform="translate(-1526.4773,-594.95311)">
        <g id="g14" transform="translate(461.15927,688.85025)">
          <rect
            style={{ opacity: 0, fill: "#ffffff", strokeWidth: 3.65385 }}
            id="rect8"
            width="300"
            height="300"
            x="1065.3181"
            y="-93.897186"
          />
          <path
            ref={pathRef}
            style={{ fill: "none", stroke: "white", strokeWidth: 1 }}
            d="m 1094.8845,205.44937 c -0.2461,-0.39874 -3.4127,-15.31604 -7.0364,-33.14957 -3.6237,-17.83353 -6.767,-33.00086 -6.9849,-33.70519 -0.3527,-1.13991 0.1991,-1.28061 5.0157,-1.28061 h 5.4121 l 1.6265,8.09666 c 2.1261,10.58273 4.8022,19.72062 7.2582,24.78287 3.5693,7.35648 7.0514,8.08985 38.4412,8.09574 l 22.5604,0.006 -0.5133,-2.37826 c -0.9971,-4.6211 -5.4549,-16.04875 -9.426,-24.16435 -4.9477,-10.11155 -12.324,-22.3478 -26.1272,-43.34208 -14.2202,-21.628138 -19.5662,-30.638338 -25.5156,-43.003328 -10.5512,-21.92883 -14.6647,-40.865991 -13.1189,-60.3920905 3.9368,-49.7226895 50.0378,-90.7101805 110.4226,-98.1744805 8.9902,-1.11128 29.3573,-0.93972 39.0342,0.32877 44.1326,5.7853 81.6779,30.287912 98.8307,64.498491 12.5276,24.9857095 13.0774,52.516639 1.6329,81.78543 -6.2706,16.03727 -12.1257,26.3867 -31.9192,56.420748 -15.0923,22.90023 -22.002,34.5795 -26.911,45.48618 -2.8808,6.40108 -6.7919,16.9762 -7.7594,20.98073 l -0.5003,2.07052 25.4578,-0.30358 c 17.0496,-0.20328 26.3567,-0.5943 28.1794,-1.18391 5.3197,-1.72084 6.8561,-3.79254 10.006,-13.49205 1.5931,-4.9057 3.6848,-12.70642 4.6482,-17.33491 l 1.7515,-8.41544 5.255,-0.2149 c 2.8902,-0.1181 5.2547,-0.0672 5.2547,0.11312 0,0.37946 -12.9693,64.40415 -13.5468,66.87644 l -0.3847,1.64649 -35.2943,-0.0318 c -35.0581,-0.0315 -41.0601,-0.35236 -42.3816,-2.26445 -0.3963,-0.5734 -0.5365,-5.65852 -0.3302,-11.97333 0.6937,-21.23983 5.8222,-41.89188 21.6256,-87.08149 17.2824,-49.418508 21.5041,-67.598698 21.4961,-92.569798 0,-10.5315905 -0.3438,-15.4115805 -1.5325,-21.9754705 -4.1152,-22.7244995 -14.2869,-41.6186695 -29.4151,-54.6386835 -13.2411,-11.395865 -29.1352,-18.191947 -46.8942,-20.051427 -17.9734,-1.88192 -37.6411,3.00484 -53.1089,13.19577 -20.0726,13.224791 -32.7678,32.581901 -38.3701,58.504701 -2.4311,11.2488995 -2.763,32.425199 -0.7283,46.45637 2.0617,14.21587 6.8033,32.58049 12.8728,49.85699 23.1373,65.859528 28.9645,88.095918 29.1891,111.385128 0.066,6.96618 -0.1189,8.40208 -1.2272,9.51312 -1.2147,1.21703 -3.9357,1.32389 -38.9011,1.52815 -24.2804,0.14188 -37.7539,-0.0371 -38.0435,-0.50539 z"
            id="path14"
          />
        </g>
      </g>
    </svg>
  );
};

export default GreekLetterOmegaSvg;
