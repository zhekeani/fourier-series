export const rotationCircleShaderSource = `#version 300 es
  precision highp float;

  in vec2 vUv;
  in float v_radius;

  uniform float u_aspectRatio;
  uniform float u_strokeWidth;

  out vec4 fragColor;

  void main () {
    vec4 color = vec4(0.976, 0.961, 0.071, 0.6);

    vec2 position = vUv;

    float distSquared = dot(position, position);

    float radiusSquared = v_radius * v_radius;
    float radiusInnerSquared = (v_radius - u_strokeWidth) * (v_radius - u_strokeWidth);

    float outerEdge = step(distSquared, radiusSquared);
    float innerEdge = step(radiusInnerSquared, distSquared);

    float alpha = outerEdge * innerEdge;

    fragColor = vec4(color.rgb, alpha * color.a);

    if (alpha == 0.0) {
        discard;
    }
  }
`;
