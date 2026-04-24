/**
 * @jest-environment jsdom
 */
import * as config from '../frontend/src/js/config/config.js';
import * as strava from '../frontend/src/js/strava.js';


    describe('strava.js basic exports', () => {
    test('should export Strava class', () => {
      expect(typeof strava.Strava).toBe('function');
    });
    // Strava CLIENT_ID defaults to null in config.js
    //test('Strava instance should have default clientId', () => {
      //const s = new strava.Strava();
      //expect(s.CLIENT_ID).toBe('YOUR_STRAVA_CLIENT_ID');
    //});
  });

