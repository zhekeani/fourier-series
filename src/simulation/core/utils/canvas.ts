/**
 * Resizes the canvas based on the device's pixel ratio.
 */
export const resizeCanvas = (canvas: HTMLCanvasElement) => {
  const width = scaleByPixelRatio(canvas.clientWidth);
  const height = scaleByPixelRatio(canvas.clientHeight);

  if (canvas.width != width || canvas.height != height) {
    canvas.width = width;
    canvas.height = height;
    return true;
  }
  return false;
};

/**
 * Scales values based on the device's pixel ratio.
 */
export const scaleByPixelRatio = (input: number): number => {
  const pixelRatio = window.devicePixelRatio || 1;
  return Math.floor(input * pixelRatio);
};

/**
 * Gets the resolution for the canvas based on aspect ration.
 */
export const getResolution = (
  resolution: number,
  gl: WebGL2RenderingContext
): { width: number; height: number } => {
  let aspectRatio = gl.drawingBufferWidth / gl.drawingBufferHeight;
  if (aspectRatio < 1) aspectRatio = 1.0 / aspectRatio;

  const min = Math.round(resolution);
  const max = Math.round(resolution * aspectRatio);

  if (gl.drawingBufferWidth > gl.drawingBufferHeight) {
    return { width: max, height: min };
  } else {
    return { width: min, height: max };
  }
};

/**
 * Calculates texture scale relative to canvas dimensions.
 */
export const getTextureScale = (
  texture: { width: number; height: number },
  width: number,
  height: number
): { x: number; y: number } => {
  return {
    x: width / texture.width,
    y: height / texture.height,
  };
};

export const getCanvasAspectRatio = (canvas: HTMLCanvasElement) => {
  return canvas.clientWidth / canvas.clientHeight;
};
