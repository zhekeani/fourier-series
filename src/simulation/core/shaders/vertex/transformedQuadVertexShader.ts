export const transformedQuadVertexShaderSource = `#version 300 es
  precision highp float;

  in vec2 a_position;

  uniform mat3 u_transformMatrix;
  uniform float u_aspectRatio;

  out vec2 vUv;

void main() {
    vec3 position = vec3(a_position, 1.0);
    vec3 transformedPosition = u_transformMatrix * position;

    vUv = transformedPosition.xy * 0.5 + 0.5;

    gl_Position = vec4(transformedPosition.xy, 0.0, 1.0);
}
`;
