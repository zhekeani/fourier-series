export const traceApproxPathShaderSource = `#version 300 es
  precision highp float;

  in vec2 vUv;

  uniform vec4 u_color;
  uniform vec2 u_position;
  uniform vec2 u_texelSize;
  uniform float u_aspectRatio;
  uniform float u_radius;

  out vec4 fragColor;

  void main () {
    float radius = u_radius;
    vec2 uv = vec2((vUv -  0.5) * 2.2);
    vec2 position = vec2((u_position - 0.5) * 2.0);
    position.y *= -1.0;

    if (u_aspectRatio > 1.0) {
      uv.x *= u_aspectRatio;
      radius *= u_aspectRatio * u_texelSize.x;
    } else {
      uv.y /= u_aspectRatio;
      radius /= u_aspectRatio / u_texelSize.y;
    }

    float dist = distance(uv, position);

    if (dist < radius) {
      fragColor = u_color;
    } else {
     discard;
    }
  }
`;
