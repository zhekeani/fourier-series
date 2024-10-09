export const quadVertexShaderSource = `#version 300 es
  precision highp float;

  in vec2 a_position;
  out vec2 vUv;

  void main() {
    vUv = a_position * 0.5 + 0.5;
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;
