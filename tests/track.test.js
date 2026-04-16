/**
 * @jest-environment jsdom
 */

const THREE = global.THREE = require('three');
import { __getRider} from "../frontend/src/js/scene/env/Track.js"

test('getRider functionality', () => {
  //expect(sum(1, 2))
  expect(__getRider()).toBeInstanceOf(THREE.Group());
});