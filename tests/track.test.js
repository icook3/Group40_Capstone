/**
 * @jest-environment jsdom
 */

import {Track} from "../frontend/src/js/scene/env/Track.js";
import {expect, jest, test, MeshStandardMaterial} from '@jest/globals';

//import * as scene from "../frontend/src/js/scene/index.js"
//import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
const THREE = global.THREE = require('three');

// you probably have to make a whole new scene and then put crap in it for this to work.
const scene = new THREE.Scene();
const track = new Track({ scene: scene });



test('fundamental track properties', () => {
  // path element - name track, type group parent scene
  //track children??
  const MeshStandardMaterial = THREE.MeshStandardMaterial;
  expect(track.path_element.name).toBe("track");
  expect(track.path_element.type).toBe("Group");
  expect(track._ownsPath).toBe(true);
  expect(track.trackMaterial.isMeshStandardMaterial);
  expect(track.trackMaterialDouble.isMeshStandardMaterial);
});

test('generate track pieces', () => {
  // go through constants - functions in track don't return right w/o the whole scene initialized


});