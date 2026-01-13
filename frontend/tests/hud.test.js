// hud.test.js: Basic tests for HUD logic
import * as hud from '../js/hud.js';

describe('hud.js basic exports', () => {
  test('should export HUD class', () => {
    expect(typeof hud.HUD).toBe('function');
  });
  test('HUD instance should update HUD fields', () => {
    // Mock DOM elements
    const elements = {
      'power': { textContent: '' },
      'speed': { textContent: '' },
      'distance': { textContent: '' },
      'time': { textContent: '' }
    };
    const getElement = (id) => elements[id];
    const hudInstance = new hud.HUD({ getElement });
    hudInstance.update({ power: 100, speed: 25 }, 1);
    expect(elements.power.textContent).toBe(100);
    expect(elements.speed.textContent).toBe('25.0');
    expect(elements.distance.textContent).toBe('0.01');
    expect(typeof elements.time.textContent).toBe('string');
  });
});
