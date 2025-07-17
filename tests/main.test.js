// main.test.js: Basic tests for main.js (state management)
import * as main from '../js/main.js';

describe('main.js basic exports', () => {
  test('should export initZlowApp function', () => {
    expect(typeof main.initZlowApp).toBe('function');
  });
  test('initZlowApp should initialize and return internals', () => {
    // Mock DOM elements, including scene with appendChild
    const elements = {
      'pacer-speed': { value: '20', addEventListener: jest.fn() },
      'keyboard-btn': { textContent: '', addEventListener: jest.fn() },
      'connect-btn': { disabled: false, addEventListener: jest.fn() },
      'strava-btn': { addEventListener: jest.fn() },
      'gpx-btn': { addEventListener: jest.fn() },
      'power': { textContent: '' },
      'speed': { textContent: '' },
      'distance': { textContent: '0' },
      'time': { textContent: '' },
      'scene': { appendChild: jest.fn() },
      'avatar': { children: [], setAttribute: jest.fn(), getAttribute: jest.fn(() => ({ x: 0, y: 1, z: 0 })) },
      'pacer': { setAttribute: jest.fn() },
      'terrain': {},
      'pacer-sync-btn': { addEventListener: jest.fn() }
    };
    const getElement = (id) => elements[id];
    const app = main.initZlowApp({ getElement, requestAnimationFrameFn: fn => {} });
    expect(app).toHaveProperty('trainer');
    expect(app).toHaveProperty('scene');
    expect(app).toHaveProperty('hud');
    expect(app).toHaveProperty('strava');
    expect(typeof app.getRiderState).toBe('function');
  });
});
