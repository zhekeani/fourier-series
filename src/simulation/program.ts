import {
  CopyShaderUniforms,
  DisplayShaderUniforms,
} from "./core/shaders/types";
import { lineVertexShaderSource } from "./core/shaders/vertex/lineVertexShader";
import { quadVertexShaderSource } from "./core/shaders/vertex/quadVertexShader";
import { transformedQuadVertexShaderSource } from "./core/shaders/vertex/transformedQuadVertexShader";
import {
  createCopyProgram,
  createDisplayProgram,
  Program,
} from "./core/utils/program";
import { coefShaderSource } from "./shaders/coefShader";
import { rotatingArrowShaderSource } from "./shaders/rotatingArrowShader";
import { rotationCircleShaderSource } from "./shaders/rotationCircleShader";
import { rotationCircleVertexShaderSource } from "./shaders/rotationCircleVertexShader";
import { traceApproxPathShaderSource } from "./shaders/traceApproxPathShader";
import { traceOriPathShaderSource } from "./shaders/traceOriPathShader";
import {
  CoefShaderUniforms,
  RotatingArrowShaderUniforms,
  RotationCircleShaderAttributes,
  RotationCircleShaderUniforms,
  TraceApproxPathShaderUniforms,
  TraceOriPathShaderUniforms,
} from "./shaders/types";

export interface SimulationPrograms {
  copyProgram: Program<CopyShaderUniforms>;
  displayProgram: Program<DisplayShaderUniforms>;
  traceOriPathProgram: Program<TraceOriPathShaderUniforms>;
  coefProgram: Program<CoefShaderUniforms>;
  traceApproxPathProgram: Program<TraceApproxPathShaderUniforms>;
  rotatingArrowProgram: Program<RotatingArrowShaderUniforms>;
  rotationCircleProgram: Program<
    RotationCircleShaderUniforms,
    RotationCircleShaderAttributes
  >;
}

export const initProgram = (gl: WebGL2RenderingContext): SimulationPrograms => {
  const copyProgram = createCopyProgram(gl);
  const displayProgram = createDisplayProgram(gl);

  const traceOriPathProgram = new Program<TraceOriPathShaderUniforms>(
    gl,
    quadVertexShaderSource,
    traceOriPathShaderSource
  );

  const coefProgram = new Program<CoefShaderUniforms>(
    gl,
    lineVertexShaderSource,
    coefShaderSource
  );

  const traceApproxPathProgram = new Program<TraceApproxPathShaderUniforms>(
    gl,
    quadVertexShaderSource,
    traceApproxPathShaderSource
  );

  const rotatingArrowProgram = new Program<RotatingArrowShaderUniforms>(
    gl,
    transformedQuadVertexShaderSource,
    rotatingArrowShaderSource
  );

  const rotationCircleProgram = new Program<RotationCircleShaderUniforms>(
    gl,
    rotationCircleVertexShaderSource,
    rotationCircleShaderSource
  );

  return {
    copyProgram,
    displayProgram,
    traceOriPathProgram,
    coefProgram,
    traceApproxPathProgram,
    rotatingArrowProgram,
    rotationCircleProgram,
  };
};
