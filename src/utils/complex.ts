export interface Complex {
  real: number;
  imag: number;
}

export const multiplyComplex = (z1: Complex, z2: Complex): Complex => {
  const real = z1.real * z2.real - z1.imag * z2.imag;
  const imag = z1.real * z2.imag + z1.imag * z2.real;

  return {
    real,
    imag,
  };
};

// Euler's formula for full rotation: e^(i * 2π * scale)
export const euler = (scale: number, t: number = 1): Complex => {
  const theta = 2 * Math.PI * scale * t;

  return {
    real: Math.cos(theta),
    imag: Math.sin(theta),
  };
};

export const integralComplexFn = (
  fn: (t: number) => Complex,
  interval: [number, number] = [0, 1],
  iCount: number = 100
): Complex => {
  const dt = Math.abs(interval[1] - interval[0]) / iCount;
  const acc: Complex = {
    real: 0,
    imag: 0,
  };

  for (let i = 0; i < iCount; i++) {
    const t = interval[0] + dt * i;
    const value = fn(t);
    acc.real += value.real * dt;
    acc.imag += value.imag * dt;
  }

  return acc;
};
