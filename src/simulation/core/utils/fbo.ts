import { CopyShaderUniforms } from "../shaders/types";
import { blit } from "./fbo-draw";
import { Program } from "./program";
import { DoubleFrameBuffer, FrameBuffer } from "./types";

/**
 * Create a single framebuffer object (FBO)
 */
export const createFBO = (
  gl: WebGL2RenderingContext,
  w: number,
  h: number,
  internalFormat: number,
  format: number,
  type: number,
  param: number,
  textureData: Float32Array | null = null
): FrameBuffer => {
  gl.activeTexture(gl.TEXTURE0);

  const texture = gl.createTexture();
  if (!texture) {
    throw new Error("Failed to create WebGL texture");
  }

  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, param);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, param);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    internalFormat,
    w,
    h,
    0,
    format,
    type,
    textureData
  );

  const fbo = gl.createFramebuffer();
  if (!fbo) {
    throw new Error("Failed to create WebGL framebuffer");
  }

  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
  gl.framebufferTexture2D(
    gl.FRAMEBUFFER,
    gl.COLOR_ATTACHMENT0,
    gl.TEXTURE_2D,
    texture,
    0
  );

  // Set the viewport to match the FBO size and clear the buffer
  gl.viewport(0, 0, w, h);

  if (!textureData) {
    gl.clear(gl.COLOR_BUFFER_BIT);
  }

  const texelSizeX = 1.0 / w;
  const texelSizeY = 1.0 / h;

  return {
    texture,
    fbo,
    width: w,
    height: h,
    texelSizeX,
    texelSizeY,
    attach(id: number) {
      gl.activeTexture(gl.TEXTURE0 + id);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      return id;
    },
  };
};

/**
 * Creates a double framebuffer object (FBO) for reading and writing
 */
export const createDoubleFBO = (
  gl: WebGL2RenderingContext,
  w: number,
  h: number,
  internalFormat: number,
  format: number,
  type: number,
  param: number,
  textureData: Float32Array | null = null
): DoubleFrameBuffer => {
  const fbo1 = createFBO(
    gl,
    w,
    h,
    internalFormat,
    format,
    type,
    param,
    textureData
  );
  const fbo2 = createFBO(gl, w, h, internalFormat, format, type, param);

  return {
    width: w,
    height: h,
    texelSizeX: fbo1.texelSizeX,
    texelSizeY: fbo1.texelSizeY,
    read: fbo1,
    write: fbo2,
    swap() {
      [this.read, this.write] = [this.write, this.read];
    },
  };
};

/**
 * Resizes a framebuffer object (FBO) by creating a new FBO with the new size and copying the data from the old FBO.
 */
export const resizeFBO = (
  gl: WebGL2RenderingContext,
  target: FrameBuffer,
  w: number,
  h: number,
  internalFormat: number,
  format: number,
  type: number,
  param: number,
  copyProgram: Program<CopyShaderUniforms>
) => {
  const newFBO = createFBO(gl, w, h, internalFormat, format, type, param);

  copyProgram.bind();
  gl.uniform1i(copyProgram.uniforms.u_texture, target.attach(0));
  blit(gl, newFBO);

  return newFBO;
};

/**
 * Resize a double framebuffer object (with read and write buffers) and preserves data in the read buffer.
 */
export function resizeDoubleFBO(
  gl: WebGL2RenderingContext,
  target: DoubleFrameBuffer,
  width: number,
  height: number,
  internalFormat: number,
  format: number,
  type: number,
  param: number,
  copyProgram: Program<CopyShaderUniforms>
): DoubleFrameBuffer {
  // If no resize is needed, return the target
  if (target.width === width && target.height === height) {
    return target;
  }

  // Resize the read FBO and copy the data
  target.read = resizeFBO(
    gl,
    target.read,
    width,
    height,
    internalFormat,
    format,
    type,
    param,
    copyProgram
  );

  // Create a new write FBO without copying data
  target.write = createFBO(
    gl,
    width,
    height,
    internalFormat,
    format,
    type,
    param
  );

  // Update the dimensions and texel size
  target.width = width;
  target.height = height;
  target.texelSizeX = 1.0 / width;
  target.texelSizeY = 1.0 / height;

  return target;
}
