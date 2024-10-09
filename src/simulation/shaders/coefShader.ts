export const coefShaderSource = `#version 300 es
  precision highp float;

  in float vUv;

  uniform sampler2D u_pathRealTexture;
  uniform sampler2D u_pathImagTexture;
  uniform vec2 u_texelSize;
  uniform float u_iCount;
  uniform bool u_isNegative;

  out vec4 fragColor;

  void main() {
    float pi = 3.141592654;
    float dt = 1.0 / u_iCount;
    float n = u_isNegative ? -1.0 : 1.0;
    float frequency = vUv / u_texelSize.x * n;

    float accReal = 0.0;
    float accImag = 0.0;

    for (int i = 0; i < int(u_iCount + 1.0); i++) {
      float t = dt * float(i);
      float theta = 2.0 * pi * -frequency * t;

      float pathReal = texture(u_pathRealTexture, vec2(t, 0.0)).x;
      float pathImag = texture(u_pathImagTexture, vec2(t, 0.0)).x;

      vec2 euler = vec2(
        cos(theta),
        sin(theta)
      );

      float real = pathReal * euler.x - pathImag * euler.y;
      float imag = pathReal * euler.y + pathImag * euler.x;

      accReal += (real * dt);
      accImag += (imag * dt);
    }


    fragColor = vec4(accReal, accImag, 0.0, 1.0);
  }
`;
