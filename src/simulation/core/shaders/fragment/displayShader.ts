export const displayShaderSource = `#version 300 es
  precision highp float;
  precision highp sampler2D;

  in vec2 vUv;
  uniform sampler2D u_texture;
  out vec4 fragColor;

  void main() {
    vec3 color = texture(u_texture, vUv).rgb;
    float alpha = max(color.r, max(color.g, color.b));

    if (alpha > 0.0) {
      fragColor = vec4(color, alpha);
    } else {
      discard; 
    }
  }
`;
