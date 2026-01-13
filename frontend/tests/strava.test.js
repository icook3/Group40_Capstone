// strava.test.js: Basic tests for Strava logic
import * as strava from '../js/strava.js';

describe('strava.js basic exports', () => {
  test('should export Strava class', () => {
    expect(typeof strava.Strava).toBe('function');
  });
  test('Strava instance should have default clientId', () => {
    const s = new strava.Strava();
    expect(s.clientId).toBe('YOUR_STRAVA_CLIENT_ID');
  });
});
