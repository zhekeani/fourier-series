export interface FrameBuffer {
  texture: WebGLTexture;
  fbo: WebGLFramebuffer;
  width: number;
  height: number;
  texelSizeX: number;
  texelSizeY: number;
  attach: (id: number) => number;
}

export interface DoubleFrameBuffer {
  width: number;
  height: number;
  texelSizeX: number;
  texelSizeY: number;
  read: FrameBuffer;
  write: FrameBuffer;
  swap: () => void;
}

export interface WebGLExtensions {
  formatRGBA: {
    internalFormat: number;
    format: number;
  } | null;
  formatRG: {
    internalFormat: number;
    format: number;
  } | null;
  formatR: {
    internalFormat: number;
    format: number;
  } | null;
  floatTexType: number | null;
  supportLinearFiltering: boolean | null;
}
