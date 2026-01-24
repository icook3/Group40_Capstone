import { powerToSpeed, kmhToMs, msToKmh } from '../js/main.js';

describe('powerToSpeed', () => {
  it('returns realistic speed for 200W (default params)', () => {
    const speed = powerToSpeed({ power: 200 });
    // 200W should be about 8.3 m/s (30 km/h)
    expect(msToKmh(speed)).toBeGreaterThan(28);
    expect(msToKmh(speed)).toBeLessThan(32);
  });

  it('returns realistic speed for 200W at 5% grade', () => {
    const speed = powerToSpeed({ power: 200, slope: 0.05 });
    // 200W at 5% grade should be about 16 km/h
    expect(msToKmh(speed)).toBeGreaterThan(14);
    expect(msToKmh(speed)).toBeLessThan(18);
  });

  it('returns lower speed for higher drag', () => {
    const speedLow = powerToSpeed({ power: 200, cda: 0.5 });
    const speedHigh = powerToSpeed({ power: 200, cda: 0.2 });
    expect(speedLow).toBeLessThan(speedHigh);
  });

  it('returns lower speed for higher mass', () => {
    const speedLow = powerToSpeed({ power: 200, mass: 100 });
    const speedHigh = powerToSpeed({ power: 200, mass: 60 });
    expect(speedLow).toBeLessThan(speedHigh);
  });

  it('returns lower speed for uphill slope', () => {
    const speedFlat = powerToSpeed({ power: 200, slope: 0 });
    const speedUp = powerToSpeed({ power: 200, slope: 0.05 });
    expect(speedUp).toBeLessThan(speedFlat);
  });

  it('returns higher speed for downhill slope', () => {
    const speedFlat = powerToSpeed({ power: 200, slope: 0 });
    const speedDown = powerToSpeed({ power: 200, slope: -0.05 });
    expect(speedDown).toBeGreaterThan(speedFlat);
  });
});
