// scene.test.js: Basic tests for scene.js
import * as scene from '../js/scene.js';

describe('scene.js basic exports', () => {
  test('should export ZlowScene class', () => {
    expect(typeof scene.ZlowScene).toBe('function');
  });
  test('ZlowScene instance should set pacer speed', () => {
    // Mock DOM elements with appendChild for scene
    const elements = {
      'avatar': {},
      'pacer': {},
      'terrain': {},
      'scene': { appendChild: jest.fn() }
    };
    const getElement = (id) => elements[id];
    const zlowScene = new scene.ZlowScene(20, { getElement });
    expect(zlowScene.pacerSpeed).toBe(20);
    zlowScene.setPacerSpeed(30);
    expect(zlowScene.pacerSpeed).toBe(30);
  });
});
