import { PathData, PathsData } from "../utils/svg";
import { SimulationConfig } from "./config";
import { CopyShaderUniforms } from "./core/shaders/types";
import { getResolution } from "./core/utils/canvas";
import { createFBO, resizeFBO } from "./core/utils/fbo";
import { clear } from "./core/utils/fbo-draw";
import { Program } from "./core/utils/program";
import { FrameBuffer, WebGLExtensions } from "./core/utils/types";

interface FrameBufferState {
  eightNotesPath: OriPathPositions;
  trebleClefPath: OriPathPositions;
  capitalLetterFPath: OriPathPositions;
  greekLetterPi: OriPathPositions;
  greekLetterOmega: OriPathPositions;
  oriPathTrace: FrameBuffer | null;
  coefficientPositive: FrameBuffer | null;
  coefficientNegative: FrameBuffer | null;
  approxPathTrace: FrameBuffer | null;
  approxPathTraceMark: FrameBuffer | null;
  rotatingArrows: FrameBuffer | null;
}

export interface OriPathPositions {
  real: FrameBuffer | null;
  imag: FrameBuffer | null;
}

export const frameBufferState: FrameBufferState = {
  eightNotesPath: {
    real: null,
    imag: null,
  },
  trebleClefPath: {
    real: null,
    imag: null,
  },
  capitalLetterFPath: {
    real: null,
    imag: null,
  },
  greekLetterPi: {
    real: null,
    imag: null,
  },
  greekLetterOmega: {
    real: null,
    imag: null,
  },
  oriPathTrace: null,
  coefficientPositive: null,
  coefficientNegative: null,
  approxPathTrace: null,
  approxPathTraceMark: null,
  rotatingArrows: null,
};

export const initFBO = (
  gl: WebGL2RenderingContext,
  ext: WebGLExtensions,
  config: SimulationConfig,
  pathsData: PathsData,
  copyProgram: Program<CopyShaderUniforms>
): void => {
  const displayRes = getResolution(1024, gl);

  const frequencyCount = config.FREQUENCY_COUNT;

  const texType = ext.floatTexType;
  const rgba = ext.formatRGBA;
  const rg = ext.formatRG;
  const r = ext.formatR;

  const filtering = ext.supportLinearFiltering ? gl.LINEAR : gl.NEAREST;

  const {
    oriPathTrace,
    approxPathTrace,
    approxPathTraceMark,
    coefficientNegative,
    coefficientPositive,
    rotatingArrows,
  } = frameBufferState;

  const lineFboWidth = frequencyCount + 1;
  const lineFboHeight = 1;

  if (rgba && rg && r && texType) {
    createOriPathFBOs(gl, pathsData, texType, r, filtering);

    if (!oriPathTrace) {
      frameBufferState.oriPathTrace = createFBO(
        gl,
        displayRes.width,
        displayRes.height,
        rgba.internalFormat,
        rgba.format,
        texType,
        filtering
      );
    } else {
      frameBufferState.oriPathTrace = resizeFBO(
        gl,
        oriPathTrace,
        displayRes.width,
        displayRes.height,
        rgba.internalFormat,
        rgba.format,
        texType,
        filtering,
        copyProgram
      );
    }

    if (!approxPathTrace) {
      frameBufferState.approxPathTrace = createFBO(
        gl,
        displayRes.width,
        displayRes.height,
        rgba.internalFormat,
        rgba.format,
        texType,
        filtering
      );
    } else {
      frameBufferState.approxPathTrace = resizeFBO(
        gl,
        approxPathTrace,
        displayRes.width,
        displayRes.height,
        rgba.internalFormat,
        rgba.format,
        texType,
        filtering,
        copyProgram
      );
    }

    if (!approxPathTraceMark) {
      frameBufferState.approxPathTraceMark = createFBO(
        gl,
        displayRes.width,
        displayRes.height,
        rgba.internalFormat,
        rgba.format,
        texType,
        filtering
      );
    } else {
      frameBufferState.approxPathTraceMark = resizeFBO(
        gl,
        approxPathTraceMark,
        displayRes.width,
        displayRes.height,
        rgba.internalFormat,
        rgba.format,
        texType,
        filtering,
        copyProgram
      );
    }

    if (!coefficientPositive) {
      frameBufferState.coefficientPositive = createFBO(
        gl,
        lineFboWidth,
        lineFboHeight,
        rg.internalFormat,
        rg.format,
        texType,
        filtering
      );
    }

    if (!coefficientNegative) {
      frameBufferState.coefficientNegative = createFBO(
        gl,
        lineFboWidth,
        lineFboHeight,
        rg.internalFormat,
        rg.format,
        texType,
        filtering
      );
    }

    if (!rotatingArrows) {
      frameBufferState.rotatingArrows = createFBO(
        gl,
        displayRes.width,
        displayRes.height,
        rgba.internalFormat,
        rgba.format,
        texType,
        filtering
      );
    } else {
      frameBufferState.rotatingArrows = resizeFBO(
        gl,
        rotatingArrows,
        displayRes.width,
        displayRes.height,
        rgba.internalFormat,
        rgba.format,
        texType,
        filtering,
        copyProgram
      );
    }
  }
};

export const clearAllTargets = (gl: WebGL2RenderingContext) => {
  const { oriPathTrace, approxPathTrace } = frameBufferState;

  if (oriPathTrace && approxPathTrace) {
    clear(gl, oriPathTrace);
    clear(gl, approxPathTrace);

    clear(gl, null);
  }
};

const createOriPathFBOs = (
  gl: WebGL2RenderingContext,
  pathsData: PathsData,
  texType: number,
  r: {
    internalFormat: number;
    format: number;
  },
  filtering: number
) => {
  const frameBufferKeys = [
    "eightNotesPath",
    "trebleClefPath",
    "capitalLetterFPath",
    "greekLetterPi",
    "greekLetterOmega",
  ] as const;
  const pathsDataArray = Object.values(pathsData);

  frameBufferKeys.forEach((key, index) => {
    const pathFBO = frameBufferState[key];
    const pathData = pathsDataArray[index];

    if ((!pathFBO.real || !pathFBO.imag) && pathData) {
      const FBOs = createPathFBOs(gl, pathData, texType, r, filtering);

      frameBufferState[key] = {
        real: FBOs.real,
        imag: FBOs.imag,
      };
    }
  });
};

const createPathFBOs = (
  gl: WebGL2RenderingContext,
  pathData: PathData,
  texType: number,
  r: {
    internalFormat: number;
    format: number;
  },
  filtering: number
): { real: FrameBuffer; imag: FrameBuffer } => {
  const realPaths = pathData.paths.map((path) => path.x);
  const imagPaths = pathData.paths.map((path) => path.y);

  const realVertices = new Float32Array(realPaths);
  const imagVertices = new Float32Array(imagPaths);

  return {
    real: createFBO(
      gl,
      realVertices.length,
      1,
      r.internalFormat,
      r.format,
      texType,
      filtering,
      realVertices
    ),
    imag: createFBO(
      gl,
      imagVertices.length,
      1,
      r.internalFormat,
      r.format,
      texType,
      filtering,
      imagVertices
    ),
  };
};
