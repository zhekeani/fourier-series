import GUI, { Controller as GuiController } from "lil-gui";
import { debounce } from "lodash";
import { useEffect, useState } from "react";
import {
  config,
  initialDuration,
  initialFreqCount,
  initialICount,
  initialPathShape,
} from "../simulation/config";
import { clearAllTargets } from "../simulation/fbo";
import {
  drawApproxPathMark,
  reInitCoefsAndRotationFns,
  reInitRotatingArrowsDependencies,
  resetElapsedTime,
  simDependencies,
  startSim,
} from "../simulation/simulation";
import { loadPathJsonFile, PathsData } from "../utils/svg";
import OriPathPreview from "./OriPathPreview";
import { PathShapeNames } from "./paths/pathsShapes";

interface Props {
  canvas: HTMLCanvasElement | null;
}

const Controller = ({ canvas }: Props) => {
  const [pathShape, setPathShape] = useState<PathShapeNames>(initialPathShape);
  const [pathsData, setPathsData] = useState<PathsData | null>(null);
  const [isSimCalled, setIsSimCalled] = useState(false);

  useEffect(() => {
    if (canvas && pathsData && !isSimCalled) {
      setupGUI(setPathShape);
      startSim(canvas, pathsData);
      setIsSimCalled(true);
    }
  }, [canvas, pathsData, isSimCalled]);

  useEffect(() => {
    loadPathsFromJson().then((loadedPathsData) => {
      if (loadedPathsData) setPathsData(loadedPathsData);
    });
  }, []);

  return (
    <div className="w-full h-full flex items-center justify-center p-3">
      <OriPathPreview activePath={pathShape} />
    </div>
  );
};

const setupGUI = (setPathShape: (pathShape: PathShapeNames) => void) => {
  const gui = new GUI();
  const controllers: GuiController[] = [];

  const resetFBOs = () => {
    if (simDependencies.ctx) {
      clearAllTargets(simDependencies.ctx.gl);
    }
  };

  const redrawApproxPathMark = () => {
    const { ctx, programs, canvas } = simDependencies;
    if (ctx && programs && canvas) {
      drawApproxPathMark(
        ctx.gl,
        canvas,
        programs.traceApproxPathProgram,
        config.USED_FREQUENCY_COUNT
      );
    }
  };

  const debounceRedraw = debounce(() => {
    redrawApproxPathMark();
  }, 300);

  const activePathController = gui
    .add(config, "ACTIVE_PATH", {
      "Eight notes": PathShapeNames.eightNotes,
      "Treble clef": PathShapeNames.trebleClef,
      "Capital letter F": PathShapeNames.capitalLetterF,
      "Greek letter pi": PathShapeNames.greekLetterPi,
      "Greek letter Omega": PathShapeNames.greekLetterOmega,
    })
    .name("Path shape")
    .onChange((pathShape: PathShapeNames) => {
      reInitCoefsAndRotationFns();
      reInitRotatingArrowsDependencies();
      resetFBOs();
      resetElapsedTime();
      debounceRedraw();

      setPathShape(pathShape);
    });
  controllers.push(activePathController);

  const iCountController = gui
    .add(config, "ITERATION_COUNT", 300, 3000)
    .step(1)
    .name("Coef iteration count")
    .onChange(() => {
      resetFBOs();
      reInitCoefsAndRotationFns();
      reInitRotatingArrowsDependencies();
      debounceRedraw();
    });
  controllers.push(iCountController);

  const freqCountController = gui
    .add(config, "USED_FREQUENCY_COUNT", 1, config.FREQUENCY_COUNT * 2)
    .step(1)
    .name("Frequency count")
    .onChange(() => {
      resetFBOs();
      debounceRedraw();
    });
  controllers.push(freqCountController);

  const durationController = gui
    .add(config, "DURATION", 1, 30)
    .name("Duration (s)");
  controllers.push(durationController);

  gui.add(config, "ROTATING_ARROWS").name("Rotating arrows");

  gui.add(config, "PAUSED").name("Paused");

  const reset = {
    function: () => {
      config.ACTIVE_PATH = PathShapeNames.eightNotes;
      setPathShape(initialPathShape);

      config.ITERATION_COUNT = initialICount;
      config.FREQUENCY_COUNT = initialFreqCount;
      config.DURATION = initialDuration;

      controllers.forEach((controller) => controller.updateDisplay());

      reInitCoefsAndRotationFns();
      reInitRotatingArrowsDependencies();
      resetFBOs();
      resetElapsedTime();
      redrawApproxPathMark();
    },
  };

  gui.add(reset, "function").name("Reset").updateDisplay();
};

const loadPathsFromJson = async (): Promise<PathsData | null> => {
  const [
    eightNotesData,
    trebleClefData,
    capitalFData,
    greekLetterPiData,
    greekLetterOmegaData,
  ] = await Promise.all([
    loadPathJsonFile("/fourier-series/shapes/eight-notes.json"),
    loadPathJsonFile("/fourier-series/shapes/treble-clef.json"),
    loadPathJsonFile("/fourier-series/shapes/capital-letter-f.json"),
    loadPathJsonFile("/fourier-series/shapes/greek-letter-pi.json"),
    loadPathJsonFile("/fourier-series/shapes/greek-letter-Omega.json"),
  ]);

  if (
    eightNotesData &&
    trebleClefData &&
    capitalFData &&
    greekLetterOmegaData &&
    greekLetterPiData
  ) {
    return {
      eightNotesData,
      trebleClefData,
      capitalFData,
      greekLetterPiData,
      greekLetterOmegaData,
    };
  }

  return null;
};

export default Controller;
