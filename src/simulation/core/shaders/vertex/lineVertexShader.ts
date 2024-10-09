export const lineVertexShaderSource = `#version 300 es
  precision highp float;

  in float a_position;
  out float vUv;

  void main() {
    vUv = a_position * 0.5 + 0.5;
    gl_Position = vec4(a_position, 0.0, 0.0, 1.0);
  }
`;
