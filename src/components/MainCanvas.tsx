import { useEffect, useRef, useState } from "react";
import Controller from "./Controller";
import ComplexPlane from "./background/ComplexPlane";

const MainCanvas = () => {
  const [canvasEl, setCanvasEl] = useState<HTMLCanvasElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      setCanvasEl(canvasRef.current);
    }
  }, []);

  return (
    <div className="relative w-full h-full">
      {/* Background */}
      <div className="absolute w-full h-full">
        <ComplexPlane />
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute w-full h-full bg-transparent z-20"
      ></canvas>

      {/* Original path shape */}
      <div className="w-[250px] h-[260px] fixed right-[15px] bottom-[10px] bg-gui-gray/50 z-30 flex flex-col border border-grid-line/50">
        <div className="w-full flex-grow py-1 px-2 bg-gui-black">
          <h4 className=" font-semibold text-[11px]">Original path shape</h4>
        </div>

        <div className="w-full h-full flex items-center justify-center">
          <Controller canvas={canvasEl} />
        </div>
      </div>
    </div>
  );
};

export default MainCanvas;
