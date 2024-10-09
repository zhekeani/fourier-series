import { PathShapeNames } from "../components/paths/pathsShapes";

export interface SimulationConfig {
  ACTIVE_PATH: PathShapeNames;
  ITERATION_COUNT: number;
  FREQUENCY_COUNT: number;
  USED_FREQUENCY_COUNT: number;
  DURATION: number;
  ROTATING_ARROWS: boolean;
  PAUSED: boolean;
}

export const initialPathShape: PathShapeNames = PathShapeNames.eightNotes;
export const initialICount = 1000;
export const initialFreqCount = 200;
export const initialUsedFreqCount = 100;
export const initialDuration = 10;
export const initialRotatingArrows = true;
export const initialPaused = false;

export const config: SimulationConfig = {
  ACTIVE_PATH: initialPathShape,
  ITERATION_COUNT: initialICount,
  FREQUENCY_COUNT: initialFreqCount,
  USED_FREQUENCY_COUNT: initialUsedFreqCount,
  DURATION: initialDuration,
  ROTATING_ARROWS: initialRotatingArrows,
  PAUSED: initialPaused,
};
