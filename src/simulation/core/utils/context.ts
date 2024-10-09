import { WebGLExtensions } from "./types";

/**
 * Initializes the WebGL context for a given canvas element and checks if WebGL 2 is supported.
 * It sets the necessary extensions and texture formats required for the application.
 */
export const getWebGLContext = (
  canvas: HTMLCanvasElement,
  isHalfFloat: boolean = false
): { gl: WebGL2RenderingContext; ext: WebGLExtensions } | null => {
  const params = {
    alpha: true,
    depth: false,
    stencil: false,
    antialias: false,
    preserveDrawingBuffer: false,
  };

  const gl = canvas.getContext(
    "webgl2",
    params
  ) as WebGL2RenderingContext | null;

  if (!gl) {
    return null;
  }

  // Extensions and texture format support
  gl.getExtension("EXT_color_buffer_float");
  const supportLinearFiltering = !!gl.getExtension("OES_texture_float_linear");

  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  let formatRGBA: {
    internalFormat: number;
    format: number;
  } | null = null;
  let formatRG: {
    internalFormat: number;
    format: number;
  } | null = null;
  let formatR: {
    internalFormat: number;
    format: number;
  } | null = null;

  let floatTexType: number;

  if (isHalfFloat) {
    floatTexType = gl.HALF_FLOAT;
    formatRGBA = getHalFloatSupportedFormat(
      gl,
      gl.RGBA16F,
      gl.RGBA,
      floatTexType
    );
    formatRG = getHalFloatSupportedFormat(gl, gl.RG16F, gl.RG, floatTexType);
    formatR = getHalFloatSupportedFormat(gl, gl.R16F, gl.RED, floatTexType);
  } else {
    floatTexType = gl.FLOAT;
    formatRGBA = getFloatSupportedFormat(gl, gl.RGBA32F, gl.RGBA, floatTexType);
    formatRG = getFloatSupportedFormat(gl, gl.RG32F, gl.RG, floatTexType);
    formatR = getFloatSupportedFormat(gl, gl.R32F, gl.RED, floatTexType);
  }

  return {
    gl,
    ext: {
      formatRGBA,
      formatRG,
      formatR,
      floatTexType,
      supportLinearFiltering,
    },
  };
};

export function getFloatSupportedFormat(
  gl: WebGL2RenderingContext,
  internalFormat: number,
  format: number,
  type: number
) {
  if (!supportRenderTextureFormat(gl, internalFormat, format, type)) {
    switch (internalFormat) {
      case gl.R32F:
        return getFloatSupportedFormat(gl, gl.RG32F, gl.RG, type);
      case gl.RG32F:
        return getFloatSupportedFormat(gl, gl.RGBA32F, gl.RGBA, type);
      default:
        return null;
    }
  }

  return {
    internalFormat,
    format,
  };
}

/**
 * Checks if a specific internal format is supported by the WebGL context
 * by attempting to create and use it in a framebuffer object (FBO).
 */
export function getHalFloatSupportedFormat(
  gl: WebGL2RenderingContext,
  internalFormat: number,
  format: number,
  type: number
) {
  if (!supportRenderTextureFormat(gl, internalFormat, format, type)) {
    switch (internalFormat) {
      case gl.R16F:
        return getHalFloatSupportedFormat(gl, gl.RG16F, gl.RG, type);
      case gl.RG16F:
        return getHalFloatSupportedFormat(gl, gl.RGBA16F, gl.RGBA, type);
      default:
        return null;
    }
  }

  return {
    internalFormat,
    format,
  };
}

/**
 * Verifies if the WebGL context can render to a texture with the specified internal format.
 */
export function supportRenderTextureFormat(
  gl: WebGL2RenderingContext,
  internalFormat: number,
  format: number,
  type: number
): boolean {
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, 4, 4, 0, format, type, null);

  const fbo = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
  gl.framebufferTexture2D(
    gl.FRAMEBUFFER,
    gl.COLOR_ATTACHMENT0,
    gl.TEXTURE_2D,
    texture,
    0
  );

  const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
  return status == gl.FRAMEBUFFER_COMPLETE;
}

/**
 * Handle the case were WebGL2 is not supported.
 */
export const handleWebGLNotSupported = (canvas: HTMLCanvasElement) => {
  // Clear canvas and display a user-friendly message
  const context = canvas.getContext("2d");
  if (context) {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.font = "20px Arial";
    context.fillStyle = "red";
    context.fillText("WebGL2 is not supported in your browser.", 20, 50);
  }

  // Display an alert with more information
  alert(`
    WebGL2 is not supported in your browser or on your machine. 
    Possible reasons include:
    - Your browser is outdated. Please update to the latest version.
    - WebGL2 might be disabled in your browser settings.
    - Your GPU drivers are outdated. Please update to the latest drivers.
    - Your machine's hardware may not support WebGL2.
    
    You can try using a different browser such as Chrome or Firefox, or update your current one.
  `);

  // Optionally log the issue for debugging
  console.error(
    "WebGL2 is not supported. Please check browser and hardware compatibility."
  );
};
