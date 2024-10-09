let lastUpdateTime = performance.now();

export const calcDeltaTime = (): number => {
  const now = performance.now();

  let deltaTime = (now - lastUpdateTime) / 1000;
  deltaTime = Math.min(deltaTime, 0.016666);
  lastUpdateTime = now;

  return deltaTime;
};
