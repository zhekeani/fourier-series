/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  setupArrowGeometry,
  setupLineGeometry,
  setupQuadGeometry,
} from "./fbo-geometry";
import { FrameBuffer } from "./types";

export const blitArrow = (
  gl: WebGL2RenderingContext,
  target: any,
  clear: boolean = false,
  scalingFactor: number = 1
) => {
  const indicesLength = setupArrowGeometry(gl, scalingFactor);

  if (!target) {
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

  CHECK_FRAMEBUFFER_STATUS(gl);
  gl.drawElements(gl.TRIANGLES, indicesLength, gl.UNSIGNED_SHORT, 0);
};

export const blitLine = (
  gl: WebGL2RenderingContext,
  target: FrameBuffer,
  clear: boolean = false
) => {
  setupLineGeometry(gl, target.width);

  gl.viewport(0, 0, target.width, target.height);
  gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo);

  if (clear) {
    gl.clearColor(0.0, 0.0, 0.0, 0.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
  }

  CHECK_FRAMEBUFFER_STATUS(gl);
  gl.drawArrays(gl.POINTS, 0, target.width);
};

/**
 * Blits (renders) a full-screen quad to the given target (framebuffer or screen).
 * It ensures that the quad geometry is set up only once, and draws either to the screen
 * (if `target` is null) or to a specified framebuffer.
 *
 */
export const blit = (
  gl: WebGL2RenderingContext,
  target: any,
  clear = false
) => {
  // Ensure quad geometry and index buffers are initialized
  setupQuadGeometry(gl);

  // Set rendering target (screen or framebuffer)
  if (target == null) {
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  } else {
    gl.viewport(0, 0, target.width, target.height);
    gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo);
  }

  // Optionally clear the color buffer
  if (clear) {
    gl.clearColor(0.0, 0.0, 0.0, 0.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
  }

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  // Draw full-screen quad
  CHECK_FRAMEBUFFER_STATUS(gl);
  gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
};

export const clear = (
  gl: WebGL2RenderingContext,
  target: FrameBuffer | null
) => {
  // Set the clear color to transparent (rgba(0, 0, 0, 0))
  gl.clearColor(0.0, 0.0, 0.0, 0.0);

  // Bind the target framebuffer, or null for the default framebuffer (screen)
  if (target) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo);
    gl.viewport(0, 0, target.width, target.height);
  } else {
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
  }

  // Clear the color buffer
  gl.clear(gl.COLOR_BUFFER_BIT);
};

/**
 * Checks the status of the current framebuffer to ensure it is complete and ready for rendering.
 * Logs an error trace if the framebuffer is not complete.
 */
const CHECK_FRAMEBUFFER_STATUS = (gl: WebGL2RenderingContext) => {
  const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
  if (status != gl.FRAMEBUFFER_COMPLETE) {
    console.trace("Framebuffer error: " + status);
  }
};
