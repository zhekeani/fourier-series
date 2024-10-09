import { useMeasure } from "react-use";
import Axes from "./Axes";
import GridLines from "./GridLines";

const ComplexPlane = () => {
  const [ctrRef, { width, height }] = useMeasure<HTMLDivElement>();

  return (
    <div
      ref={ctrRef}
      className="w-full h-full flex items-center justify-center"
    >
      <svg width="100%" height="100%">
        {/* Grid lines */}
        <GridLines ctrWidth={width} ctrHeigh={height} />

        {/* Axes */}
        <Axes ctrWidth={width} ctrHeight={height} />
      </svg>
    </div>
  );
};

export default ComplexPlane;
