import { Complex } from "../utils/complex";
import { setupQuadGeometry } from "./core/utils/fbo-geometry";
import { Program } from "./core/utils/program";
import { FrameBuffer } from "./core/utils/types";
import {
  RotationCircleShaderAttributes,
  RotationCircleShaderUniforms,
} from "./shaders/types";

export const blitRotationCircles = (
  gl: WebGL2RenderingContext,
  rotationCircleProgram: Program<
    RotationCircleShaderUniforms,
    RotationCircleShaderAttributes
  >,
  target: FrameBuffer,
  positions: Complex[],
  radii: number[],
  maxArrowCount: number,
  clear: boolean = false
) => {
  const positionLocation = rotationCircleProgram.attributes.a_offset;
  const radiusLocation = rotationCircleProgram.attributes.a_radius;

  if (positionLocation && radiusLocation) {
    const slicedPositions: Complex[] = [
      { real: 0.5, imag: 0.5 },
      ...positions.slice(0, maxArrowCount),
    ];

    const adjustedPositions: number[] = slicedPositions.flatMap(Object.values);

    const instancePositions = new Float32Array(adjustedPositions);
    const instanceRadii = new Float32Array(radii);

    setupQuadGeometry(gl);

    const instancePositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, instancePositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, instancePositions, gl.STATIC_DRAW);

    const instanceRadiusBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, instanceRadiusBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, instanceRadii, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, instancePositionBuffer);
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
    gl.vertexAttribDivisor(positionLocation, 1);

    gl.bindBuffer(gl.ARRAY_BUFFER, instanceRadiusBuffer);
    gl.enableVertexAttribArray(radiusLocation);
    gl.vertexAttribPointer(radiusLocation, 1, gl.FLOAT, false, 0, 0);
    gl.vertexAttribDivisor(radiusLocation, 1);

    if (target == null) {
      gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    } else {
      gl.viewport(0, 0, target.width, target.height);
      gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo);
    }

    if (clear) {
      gl.clearColor(0.0, 0.0, 0.0, 0.0);
      gl.clear(gl.COLOR_BUFFER_BIT);
    }

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    const numInstances = instancePositions.length / 2;
    gl.drawElementsInstanced(
      gl.TRIANGLES,
      6,
      gl.UNSIGNED_SHORT,
      0,
      numInstances
    );
  }
};
