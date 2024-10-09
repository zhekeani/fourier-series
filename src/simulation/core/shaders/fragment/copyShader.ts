export const copyShaderSource = `#version 300 es
  precision highp float;

  in vec2 vUv;
  uniform sampler2D u_texture;
  out vec4 fragColor;

  void main() {
    fragColor = texture(u_texture, vUv);
  }
`;
