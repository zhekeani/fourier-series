export type TraceOriPathShaderUniforms = {
  u_pathRealTexture: string;
  u_pathImagTexture: string;
  u_texelSize: string;
  u_dt: string;
  u_aspectRatio: string;
  u_radius: string;
};

export type CoefShaderUniforms = {
  u_pathRealTexture: string;
  u_pathImagTexture: string;

  u_texelSize: string;
  u_iCount: string;
  u_isNegative: string;
};

export type TraceApproxPathShaderUniforms = {
  u_position: string;
  u_texelSize: string;
  u_aspectRatio: string;
  u_radius: string;
  u_color: string;
};

export type RotatingArrowShaderUniforms = {
  u_transformMatrix: string;
  u_aspectRatio: string;
};

export type RotationCircleShaderUniforms = {
  u_aspectRatio: string;
  u_strokeWidth: string;
};

export type RotationCircleShaderAttributes = {
  a_position: string;
  a_offset: string;
  a_radius: string;
};
