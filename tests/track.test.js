/**
 * @jest-environment jsdom
 */
import * as config from '../frontend/src/js/config/config.js';
import * as THREE from "three";
import { constants } from "../frontend/src/js/constants.js";
import { describe, expect, test } from '@jest/globals';
import { Track } from "../frontend/src/js/scene/env/Track.js"

const scene = new THREE.Scene();
const track = new Track({ scene: scene });

describe('track generation and properties', () => {

  test('fundamental track properties', () => {
    const MeshStandardMaterial = THREE.MeshStandardMaterial;
    expect(track.path_element.name).toBe("track");
    expect(track.path_element.type).toBe("Group");
    expect(track._ownsPath).toBe(true);
    expect(track.trackMaterial.isMeshStandardMaterial);
    expect(track.trackMaterialDouble.isMeshStandardMaterial);
  });

  test('at least 240 track pieces should be generated to start', () => {
    expect(constants.trackPoints.length).toBeGreaterThan(240);
  });

  test('track should include both curved and straight pieces', () => {
    expect(constants.trackPoints).toEqual(
      expect.arrayContaining([
        expect.objectContaining({length: 5}),
        expect.objectContaining({length: 8.28})
      ])
    );
  });
});
