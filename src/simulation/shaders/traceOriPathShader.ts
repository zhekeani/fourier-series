export const traceOriPathShaderSource = `#version 300 es
  precision highp float;

  in vec2 vUv;

  uniform sampler2D u_pathRealTexture;
  uniform sampler2D u_pathImagTexture;
  uniform vec2 u_texelSize;
  uniform float u_dt;
  uniform float u_aspectRatio;
  uniform float u_radius;

  out vec4 fragColor;

  void main () {
    float radius = u_radius ;
    vec2 uv = (vUv - 0.5) * 2.4;

    if (u_aspectRatio > 1.0) {
        uv.x *= u_aspectRatio;
        radius *= u_aspectRatio * u_texelSize.x;
      } else {
        uv.y /= u_aspectRatio;
        radius /= u_aspectRatio / u_texelSize.y;
    }

    float xPosition = (texture(u_pathRealTexture, vec2(u_dt, 0.0)).x - 0.5) * 2.0;
    float yPosition = (texture(u_pathImagTexture, vec2(u_dt, 0.0)).x - 0.5) * -2.0;
    vec2 position = vec2(xPosition, yPosition);

    float dist = distance(uv, position);

    if (dist < radius) {
      fragColor = vec4(0.8, 0.8, 0.8, 1.0);
    } else {
      discard;
    }
  }
`;
