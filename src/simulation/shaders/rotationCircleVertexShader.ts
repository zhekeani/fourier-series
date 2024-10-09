export const rotationCircleVertexShaderSource = `#version 300 es
  precision highp float;

  in vec2 a_position;
  in vec2 a_offset;
  in float a_radius;

  uniform float u_aspectRatio;

  out vec2 vUv;
  out float v_radius;

  void main () {
    vec2 offset = (a_offset - 0.5) * 1.8 ;

    vUv = vec2(a_position.x - offset.x, a_position.y + offset.y);
    v_radius = a_radius;

    vec2 position = a_position ;
    
    if (u_aspectRatio > 1.0) {
        position.x /= u_aspectRatio;  
    } else {
        position.y *= u_aspectRatio;
    };

    gl_Position = vec4(position, 0.0, 1.0);
  }
`;
