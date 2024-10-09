export const setupArrowGeometry = (
  gl: WebGL2RenderingContext,
  scalingFactor: number = 1
) => {
  const shaftScale = 1 / scalingFactor;

  const widthRatio = { shaft: 4, head: 1 };
  const totalRatio = widthRatio.shaft + widthRatio.head;
  const shaftHeight = 0.004 * shaftScale;
  const headHeight = 0.18;

  const shaftWidth = (1 * widthRatio.shaft) / totalRatio;
  const headPlacement = shaftWidth + widthRatio.head / totalRatio;
  const shaftHalfHeight = shaftHeight / 2;
  const headHalfHeight = headHeight / 2;

  /*prettier-ignore */
  const vertices = new Float32Array([
    // Arrow shaft (rectangle)
    0.0 , shaftHalfHeight,        // Top-left of shaft
    shaftWidth, shaftHalfHeight,  // Top-right of shaft
    shaftWidth, -shaftHalfHeight, // Bottom-right of shaft
    0.0 , -shaftHalfHeight,       // Bottom-left of shaft

    // Arrowhead (triangle)
    shaftWidth, headHalfHeight,   // Top of arrowhead
    headPlacement, 0.0,           // Tip of arrowhead
    shaftWidth, -headHalfHeight,  // Bottom of arrowhead
  ])

  const arrowVertexBuffer = gl.createBuffer();
  if (!arrowVertexBuffer) {
    throw new Error("Failed to create arrow vertex buffer.");
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, arrowVertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  /*prettier-ignore*/
  const indices = new Uint16Array([
    0, 1, 2, 0, 2, 3,     // Arrow shaft (rectangle)

    4, 5, 6,              // Arrowhead (triangle)
  ])

  const arrowIndexBuffer = gl.createBuffer();
  if (!arrowIndexBuffer) {
    throw new Error("Failed to create arrow index buffer.");
  }

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, arrowIndexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(0);

  return indices.length;
};

export const setupQuadGeometry = (gl: WebGL2RenderingContext): void => {
  const quadVertexBuffer = gl.createBuffer();
  if (!quadVertexBuffer) {
    throw new Error("Failed to create quad vertex buffer.");
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, quadVertexBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]),
    gl.STATIC_DRAW
  );

  const quadIndexBuffer = gl.createBuffer();
  if (!quadIndexBuffer) {
    throw new Error("Failed to create quad index buffer.");
  }
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, quadIndexBuffer);
  gl.bufferData(
    gl.ELEMENT_ARRAY_BUFFER,
    new Uint16Array([0, 1, 2, 0, 2, 3]),
    gl.STATIC_DRAW
  );

  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(0);
};

export const setupLineGeometry = (
  gl: WebGL2RenderingContext,
  targetWidth: number
) => {
  const lineVertexBuffer = gl.createBuffer();
  if (!lineVertexBuffer) {
    throw new Error("Failed to create line vertex buffer.");
  }

  const vertices = new Float32Array(targetWidth);
  for (let i = 0; i < targetWidth + 1; i++) {
    vertices[i] = (i / targetWidth) * 2 - 1;
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, lineVertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  gl.vertexAttribPointer(0, 1, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(0);
};
