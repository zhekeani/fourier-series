import { mat3, vec2 } from "gl-matrix";
import { debounce } from "lodash";
import { PathShapeNames } from "../components/paths/pathsShapes";
import { Complex, euler, multiplyComplex } from "../utils/complex";
import { PathsData } from "../utils/svg";
import { calcDeltaTime } from "../utils/time";
import { config, SimulationConfig } from "./config";
import { DisplayShaderUniforms } from "./core/shaders/types";
import { getCanvasAspectRatio, resizeCanvas } from "./core/utils/canvas";
import { getWebGLContext, handleWebGLNotSupported } from "./core/utils/context";
import { blit, blitArrow, blitLine, clear } from "./core/utils/fbo-draw";
import { Program } from "./core/utils/program";
import { WebGLExtensions } from "./core/utils/types";
import {
  clearAllTargets,
  frameBufferState,
  initFBO,
  OriPathPositions,
} from "./fbo";
import { blitRotationCircles } from "./fbo-specific";
import { initProgram, SimulationPrograms } from "./program";
import {
  CoefShaderUniforms,
  RotatingArrowShaderUniforms,
  RotationCircleShaderUniforms,
  TraceApproxPathShaderUniforms,
} from "./shaders/types";

interface SimulationGlobalDependencies {
  ctx: { gl: WebGL2RenderingContext; ext: WebGLExtensions } | null;
  programs: SimulationPrograms | null;
  canvas: HTMLCanvasElement | null;
  coefs: Complex[];
  rotationFns: ((t: number) => Complex)[];
  elapsedTime: number;
  rotatingArrows: {
    aspectRatioMatrix: mat3;
    initialCondMatrices: mat3[];
    radii: number[];
    shaftScalingFactors: number[];
  };
}

export const simDependencies: SimulationGlobalDependencies = {
  ctx: null,
  programs: null,
  canvas: null,
  coefs: [],
  rotationFns: [],
  elapsedTime: 0,
  rotatingArrows: {
    aspectRatioMatrix: mat3.create(),
    initialCondMatrices: [],
    radii: [],
    shaftScalingFactors: [],
  },
};

export const startSim = (canvas: HTMLCanvasElement, pathsData: PathsData) => {
  simDependencies.ctx = getWebGLContext(canvas);
  simDependencies.canvas = canvas;

  if (simDependencies.ctx) {
    const { gl, ext } = simDependencies.ctx;
    simDependencies.programs = initProgram(gl);

    const { programs } = simDependencies;
    initFBO(gl, ext, config, pathsData, programs.copyProgram);

    simDependencies.coefs = calcCoefs(gl, programs.coefProgram, config);
    simDependencies.rotationFns = createRotationFns(simDependencies.coefs);

    simDependencies.rotatingArrows.aspectRatioMatrix =
      createAspectRatioMatrix(canvas);

    const absPositions = calcInitialAbsPositions(simDependencies.rotationFns);
    simDependencies.rotatingArrows.initialCondMatrices =
      createInitialConditionMatrices(absPositions);
    simDependencies.rotatingArrows.radii = calcRadii(
      simDependencies.rotatingArrows.initialCondMatrices
    );
    simDependencies.rotatingArrows.shaftScalingFactors =
      calcArrowShaftsScalingFactor(absPositions);

    drawApproxPathMark(
      gl,
      canvas,
      programs.traceApproxPathProgram,
      config.USED_FREQUENCY_COUNT
    );

    const update = () => {
      const dt = calcDeltaTime() / config.DURATION;
      if (!config.PAUSED) {
        simDependencies.elapsedTime = (simDependencies.elapsedTime + dt) % 1;
      }
      const time = simDependencies.elapsedTime;

      step(
        gl,
        ext,
        pathsData,
        programs,
        canvas,
        simDependencies.rotationFns,
        time,
        dt
      );

      requestAnimationFrame(update);
    };

    update();
  } else {
    handleWebGLNotSupported(canvas);
  }
};

const step = (
  gl: WebGL2RenderingContext,
  ext: WebGLExtensions,
  pathsData: PathsData,
  programs: SimulationPrograms,
  canvas: HTMLCanvasElement,
  rotationFns: ((t: number) => Complex)[],
  time: number,
  dt: number
) => {
  if (resizeCanvas(canvas)) {
    resetElapsedTime();
    clearAllTargets(gl);
    initFBO(gl, ext, config, pathsData, programs.copyProgram);
    simDependencies.rotatingArrows.aspectRatioMatrix =
      createAspectRatioMatrix(canvas);

    debounce(() => {
      drawApproxPathMark(
        gl,
        canvas,
        programs.traceApproxPathProgram,
        config.USED_FREQUENCY_COUNT
      );
    }, 500)();
  }

  if (!config.PAUSED) {
    // drawOriPathShape(gl, canvas, programs.traceOriPathProgram, time, dt);

    const positions = calcPositions(rotationFns, time);
    drawApproxPathShape(
      gl,
      canvas,
      programs.traceApproxPathProgram,
      positions,
      time,
      dt
    );

    drawRotatingArrows(
      gl,
      canvas,
      programs.rotatingArrowProgram,
      programs.rotationCircleProgram,
      positions,
      time
    );
  }

  render(gl, programs.displayProgram);
};

const drawRotatingArrows = (
  gl: WebGL2RenderingContext,
  canvas: HTMLCanvasElement,
  rotatingArrowProgram: Program<RotatingArrowShaderUniforms>,
  rotationCircleProgram: Program<RotationCircleShaderUniforms>,
  positions: Complex[],
  time: number
) => {
  const { rotatingArrows } = frameBufferState;

  if (rotatingArrows) {
    clear(gl, rotatingArrows);

    if (config.ROTATING_ARROWS) {
      const aspectRatio = getCanvasAspectRatio(canvas);
      const {
        radii,
        aspectRatioMatrix,
        initialCondMatrices,
        shaftScalingFactors,
      } = simDependencies.rotatingArrows;

      const arrowCount = Math.min(config.USED_FREQUENCY_COUNT + 1, 50);

      drawRotationCircle(
        gl,
        rotationCircleProgram,
        aspectRatio,
        positions,
        radii
      );

      for (let i = 0; i < arrowCount; i++) {
        const frequency = i === 0 ? 0 : i % 2 === 0 ? i / 2 : -(i + 1) / 2;
        const shaftScalingFactor = shaftScalingFactors[i];

        const position: Complex =
          i === 0 ? { real: 0.5, imag: 0.5 } : positions[i - 1];
        const translation = calcPositionTranslation(position);

        const initialCondMatrix = initialCondMatrices[i];
        initialCondMatrix[6] = translation.real;
        initialCondMatrix[7] = translation.imag;

        const transformationMatrix = mat3.create();
        mat3.multiply(
          transformationMatrix,
          aspectRatioMatrix,
          initialCondMatrix
        );

        drawArrow(
          gl,
          rotatingArrowProgram,
          aspectRatio,
          transformationMatrix,
          shaftScalingFactor,
          frequency,
          time
        );
      }
    }
  }
};

const drawRotationCircle = (
  gl: WebGL2RenderingContext,
  rotationCircleProgram: Program<RotationCircleShaderUniforms>,
  aspectRatio: number,
  positions: Complex[],
  radii: number[]
) => {
  const { rotatingArrows } = frameBufferState;

  if (rotatingArrows) {
    const maxArrowCount = Math.min(config.USED_FREQUENCY_COUNT, 30);

    rotationCircleProgram.bind();

    gl.uniform1f(rotationCircleProgram.uniforms.u_aspectRatio, aspectRatio);
    gl.uniform1f(rotationCircleProgram.uniforms.u_strokeWidth, 0.005);

    blitRotationCircles(
      gl,
      rotationCircleProgram,
      rotatingArrows,
      positions,
      radii,
      maxArrowCount,
      false
    );
  }
};

const drawArrow = (
  gl: WebGL2RenderingContext,
  rotatingArrowProgram: Program<RotatingArrowShaderUniforms>,
  aspectRatio: number,
  transformationMatrix: mat3,
  shaftScalingFactor: number,
  frequency: number,
  time: number
) => {
  const { rotatingArrows } = frameBufferState;

  if (rotatingArrows) {
    const rotation = Math.PI * 2 * frequency * time;

    mat3.rotate(transformationMatrix, transformationMatrix, rotation);

    rotatingArrowProgram.bind();

    gl.uniform1f(rotatingArrowProgram.uniforms.u_aspectRatio, aspectRatio);
    gl.uniformMatrix3fv(
      rotatingArrowProgram.uniforms.u_transformMatrix,
      false,
      transformationMatrix
    );

    blitArrow(gl, rotatingArrows, false, shaftScalingFactor);
  }
};

const calcPositionTranslation = (targetPosition: Complex) => {
  const matrix = mat3.create();
  const point = vec2.fromValues(1.0, 0.0);

  const adjustedPosition: Complex = {
    real: (targetPosition.real - 0.5) * 1.8,
    imag: (targetPosition.imag - 0.5) * 1.8,
  };

  matrix[0] = adjustedPosition.real;
  matrix[1] = -adjustedPosition.imag;
  matrix[3] = adjustedPosition.imag;
  matrix[4] = adjustedPosition.real;

  vec2.transformMat3(point, point, matrix);
  const translation: Complex = { real: point[0], imag: point[1] };

  return translation;
};

export const reInitRotatingArrowsDependencies = () => {
  const absPositions = calcInitialAbsPositions(simDependencies.rotationFns);
  simDependencies.rotatingArrows.initialCondMatrices =
    createInitialConditionMatrices(absPositions);
  simDependencies.rotatingArrows.radii = calcRadii(
    simDependencies.rotatingArrows.initialCondMatrices
  );
  simDependencies.rotatingArrows.shaftScalingFactors =
    calcArrowShaftsScalingFactor(absPositions);
};

export const reInitCoefsAndRotationFns = () => {
  const { ctx, programs } = simDependencies;

  if (ctx && programs) {
    simDependencies.coefs = calcCoefs(ctx.gl, programs.coefProgram, config);
    simDependencies.rotationFns = createRotationFns(simDependencies.coefs);
  }
};

const calcArrowShaftsScalingFactor = (absPosition: Complex[]) => {
  const shaftsScalingFactor: number[] = [];

  absPosition.forEach((absPosition) => {
    const magnitude = Math.sqrt(absPosition.real ** 2 + absPosition.imag ** 2);
    shaftsScalingFactor.push(magnitude);
  });
  return shaftsScalingFactor;
};

const calcRadii = (matrices: mat3[]) => {
  const radii: number[] = [];

  matrices.forEach((matrix) => {
    const point = vec2.fromValues(1.0, 0.0);

    vec2.transformMat3(point, point, matrix);
    const radius = Math.sqrt(point[0] ** 2 + point[1] ** 2);
    radii.push(radius);
  });

  return radii;
};

const createInitialConditionMatrices = (absPositions: Complex[]) => {
  const matrices: mat3[] = [];

  absPositions.forEach((absPosition) => {
    const matrix = mat3.create();

    matrix[0] = absPosition.real;
    matrix[1] = -absPosition.imag;
    matrix[3] = absPosition.imag;
    matrix[4] = absPosition.real;

    matrices.push(matrix);
  });

  return matrices;
};

const createAspectRatioMatrix = (canvas: HTMLCanvasElement) => {
  const aspectRatio = getCanvasAspectRatio(canvas);
  const matrix = mat3.create();

  if (aspectRatio > 1.0) {
    mat3.scale(matrix, matrix, [1 / aspectRatio, 1]);
  } else {
    mat3.scale(matrix, matrix, [1, aspectRatio]);
  }

  return matrix;
};

export const drawApproxPathMark = (
  gl: WebGL2RenderingContext,
  canvas: HTMLCanvasElement,
  traceApproxPathProgram: Program<TraceApproxPathShaderUniforms>,
  frequencyCount: number
) => {
  const { approxPathTraceMark } = frameBufferState;

  if (approxPathTraceMark) {
    const color = [0.8, 0.8, 0.8, 0.6];
    const aspectRatio = getCanvasAspectRatio(canvas);
    const traceCount = 1000;

    clear(gl, approxPathTraceMark);

    traceApproxPathProgram.bind();

    gl.uniform4fv(traceApproxPathProgram.uniforms.u_color, color);

    gl.uniform2f(
      traceApproxPathProgram.uniforms.u_texelSize,
      approxPathTraceMark.texelSizeX,
      approxPathTraceMark.texelSizeY
    );

    gl.uniform1f(traceApproxPathProgram.uniforms.u_aspectRatio, aspectRatio);
    gl.uniform1f(traceApproxPathProgram.uniforms.u_radius, 5);

    for (let i = 0; i < traceCount; i++) {
      const time = i / traceCount;
      const position = calcSinglePointPosition(
        simDependencies.rotationFns,
        frequencyCount,
        time
      );

      gl.uniform2f(
        traceApproxPathProgram.uniforms.u_position,
        position.real,
        position.imag
      );

      blit(gl, approxPathTraceMark, false);
    }
  }
};

const drawApproxPathShape = (
  gl: WebGL2RenderingContext,
  canvas: HTMLCanvasElement,
  traceApproxPathProgram: Program<TraceApproxPathShaderUniforms>,
  positions: Complex[],
  time: number,
  dt: number
) => {
  const { approxPathTrace } = frameBufferState;
  const usedFreqCount = Math.min(
    config.USED_FREQUENCY_COUNT,
    positions.length - 1
  );
  const position = positions[usedFreqCount];

  if (approxPathTrace) {
    const aspectRatio = getCanvasAspectRatio(canvas);
    const color = [1.0, 1.0, 1.0, 0.8];

    traceApproxPathProgram.bind();

    gl.uniform4fv(traceApproxPathProgram.uniforms.u_color, color);

    gl.uniform2f(
      traceApproxPathProgram.uniforms.u_position,
      position.real,
      position.imag
    );
    gl.uniform2f(
      traceApproxPathProgram.uniforms.u_texelSize,
      approxPathTrace.texelSizeX,
      approxPathTrace.texelSizeY
    );

    gl.uniform1f(traceApproxPathProgram.uniforms.u_aspectRatio, aspectRatio);
    gl.uniform1f(traceApproxPathProgram.uniforms.u_radius, 5);

    const clear = time + dt >= 1;
    blit(gl, approxPathTrace, clear);
  }
};

const calcInitialAbsPositions = (rotationFns: ((t: number) => Complex)[]) => {
  const absPositions: Complex[] = [];

  for (let i = 0; i < rotationFns.length; i++) {
    let adjustedPosition: Complex = { real: 0, imag: 0 };
    const fn = rotationFns[i];
    const position = fn(0);
    if (i === 0) {
      adjustedPosition = {
        real: (position.real - 0.5) * 1.8,
        imag: (position.imag - 0.5) * 1.8,
      };
    } else {
      adjustedPosition = {
        real: position.real * 1.8,
        imag: position.imag * 1.8,
      };
    }
    absPositions.push(adjustedPosition);
  }

  return absPositions;
};

const calcSinglePointPosition = (
  rotationFns: ((t: number) => Complex)[],
  frequencyCount: number,
  time: number
) => {
  const usedFreqCount = Math.min(frequencyCount + 1, rotationFns.length);
  const acc: Complex = {
    real: 0,
    imag: 0,
  };

  for (let i = 0; i < usedFreqCount; i++) {
    const dComplex = rotationFns[i](time);

    acc.real += dComplex.real;
    acc.imag += dComplex.imag;
  }

  return acc;
};

const calcPositions = (
  rotationFns: ((t: number) => Complex)[],
  time: number
) => {
  const positions: Complex[] = [];
  const acc: Complex = {
    real: 0,
    imag: 0,
  };

  rotationFns.forEach((fn) => {
    const dComplex = fn(time);

    acc.real += dComplex.real;
    acc.imag += dComplex.imag;

    const position: Complex = { real: acc.real, imag: acc.imag };
    positions.push(position);
  });

  return positions;
};

const createRotationFns = (coefs: Complex[]) => {
  const rotationsFn: ((t: number) => Complex)[] = [];

  for (let i = 0; i < coefs.length; i++) {
    const isNegative = i % 2 === 0;
    const coef = coefs[i];

    const frequency = isNegative ? i / 2 : (i + 1) / 2;
    const n = isNegative ? -1 : 1;

    rotationsFn.push((t: number) => {
      const rotation = multiplyComplex(euler(frequency * n, t), coef);

      return {
        real: rotation.real,
        imag: rotation.imag,
      };
    });
  }

  return rotationsFn;
};

const calcCoefs = (
  gl: WebGL2RenderingContext,
  coefProgram: Program<CoefShaderUniforms>,
  config: SimulationConfig
) => {
  const posCoefs = calcHalfCoefs(gl, coefProgram, config, false);
  const negCoefs = calcHalfCoefs(gl, coefProgram, config, true);

  const coefs: Complex[] = [];

  if (posCoefs && negCoefs) {
    coefs.push({
      real: posCoefs[0].real,
      imag: posCoefs[0].imag,
    });
    for (let i = 1; i < posCoefs.length; i++) {
      coefs.push({
        real: posCoefs[i].real,
        imag: posCoefs[i].imag,
      });
      coefs.push({
        real: negCoefs[i].real,
        imag: negCoefs[i].imag,
      });
    }
  }

  return coefs;
};

const calcHalfCoefs = (
  gl: WebGL2RenderingContext,
  coefProgram: Program<CoefShaderUniforms>,
  config: SimulationConfig,
  isNegative: boolean
) => {
  const { coefficientNegative, coefficientPositive } = frameBufferState;
  const activePathFBO = getActivePathFBO(config.ACTIVE_PATH);

  if (
    coefficientNegative &&
    coefficientPositive &&
    activePathFBO.imag &&
    activePathFBO.real
  ) {
    const coefFBO = isNegative ? coefficientNegative : coefficientPositive;

    coefProgram.bind();

    gl.uniform1i(
      coefProgram.uniforms.u_pathRealTexture,
      activePathFBO.real.attach(0)
    );
    gl.uniform1i(
      coefProgram.uniforms.u_pathImagTexture,
      activePathFBO.imag.attach(1)
    );

    gl.uniform2f(
      coefProgram.uniforms.u_texelSize,
      coefFBO.texelSizeX,
      coefFBO.texelSizeY
    );

    gl.uniform1f(coefProgram.uniforms.u_iCount, config.ITERATION_COUNT);
    gl.uniform1f(coefProgram.uniforms.u_isNegative, isNegative ? 1 : 0);

    blitLine(gl, coefFBO, true);

    return getCoefsFromShader(gl, coefFBO.width);
  }
};

const getCoefsFromShader = (
  gl: WebGL2RenderingContext,
  targetWidth: number
) => {
  const pixels = new Float32Array(targetWidth * 4);

  gl.readPixels(0, 0, targetWidth, 1, gl.RGBA, gl.FLOAT, pixels);

  const coefs: Complex[] = [];
  for (let i = 0; i < pixels.length; i += 4) {
    const coef: Complex = {
      real: pixels[i],
      imag: pixels[i + 1],
    };
    coefs.push(coef);
  }

  return coefs;
};

const getActivePathFBO = (activePath: PathShapeNames): OriPathPositions => {
  const {
    eightNotesPath,
    trebleClefPath,
    capitalLetterFPath,
    greekLetterOmega,
    greekLetterPi,
  } = frameBufferState;

  switch (activePath) {
    case PathShapeNames.eightNotes:
      return eightNotesPath;

    case PathShapeNames.trebleClef:
      return trebleClefPath;

    case PathShapeNames.capitalLetterF:
      return capitalLetterFPath;

    case PathShapeNames.greekLetterPi:
      return greekLetterPi;

    case PathShapeNames.greekLetterOmega:
      return greekLetterOmega;
  }
};

const render = (
  gl: WebGL2RenderingContext,
  displayProgram: Program<DisplayShaderUniforms>
) => {
  const { oriPathTrace, approxPathTrace, approxPathTraceMark, rotatingArrows } =
    frameBufferState;

  if (
    oriPathTrace &&
    approxPathTrace &&
    rotatingArrows &&
    approxPathTraceMark
  ) {
    displayProgram.bind();

    gl.uniform1i(displayProgram.uniforms.u_texture, oriPathTrace.attach(0));
    blit(gl, null, true);

    gl.uniform1i(
      displayProgram.uniforms.u_texture,
      approxPathTraceMark.attach(0)
    );
    blit(gl, null, false);

    gl.uniform1i(displayProgram.uniforms.u_texture, approxPathTrace.attach(0));
    blit(gl, null, false);

    gl.uniform1i(displayProgram.uniforms.u_texture, rotatingArrows.attach(0));
    blit(gl, null, false);
  }
};

export const resetElapsedTime = () => {
  simDependencies.elapsedTime = 0;
};

// const drawOriPathShape = (
//   gl: WebGL2RenderingContext,
//   canvas: HTMLCanvasElement,
//   traceOriPathProgram: Program<TraceOriPathShaderUniforms>,
//   time: number,
//   dt: number
// ) => {
//   const { oriPathTrace } = frameBufferState;
//   const activePathFBO = getActivePathFBO(config.ACTIVE_PATH);

//   if (oriPathTrace && activePathFBO.real && activePathFBO.imag) {
//     const aspectRatio = getCanvasAspectRatio(canvas);

//     traceOriPathProgram.bind();

//     gl.uniform1i(
//       traceOriPathProgram.uniforms.u_pathRealTexture,
//       activePathFBO.real.attach(0)
//     );
//     gl.uniform1i(
//       traceOriPathProgram.uniforms.u_pathImagTexture,
//       activePathFBO.imag.attach(1)
//     );

//     gl.uniform2f(
//       traceOriPathProgram.uniforms.u_texelSize,
//       oriPathTrace.texelSizeX,
//       oriPathTrace.texelSizeY
//     );
//     gl.uniform1f(traceOriPathProgram.uniforms.u_dt, time);
//     gl.uniform1f(traceOriPathProgram.uniforms.u_radius, 8);
//     gl.uniform1f(traceOriPathProgram.uniforms.u_aspectRatio, aspectRatio);

//     const clear = time + dt >= 1;
//     blit(gl, oriPathTrace, clear);
//   }
// };
