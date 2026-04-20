/**
 * @jest-environment jsdom
 */
import * as config from '../frontend/src/js/config/config.js';
import { describe, expect, test } from '@jest/globals';
import * as THREE from "three";
import {ViewManager} from "../frontend/src/js/views/viewManager.js";

import { AvatarCreator } from '../frontend/src/js/avatarCreator.js';
describe('Avatar Creation',()=> {
    test('Avatar is created, and not null',()=> {
        let avatar = new AvatarCreator('Avatar');
        expect(avatar).not.toBeNull();
    });
});