/**
 * @jest-environment jsdom
 */
//IMPORTING config, to prevent bugs
import * as config from '../frontend/src/js/config/config.js';
import { tcxToBlob,buildTCX } from "../frontend/src/js/rideFile.js";
import { downloadBlob } from "../frontend/src/js/download.js";
import { rideHistory } from "../frontend/src/js/rideHistoryStore.js";
import { constants } from "../frontend/src/js/constants.js";
import { describe, expect, test } from '@jest/globals';


describe('TCX file generation',()=> {
    test('Should export necessary functions',()=> {
        expect (typeof tcxToBlob).toBe('function');
        expect (typeof buildTCX).toBe('function');
        expect (typeof downloadBlob).toBe('function');
    });
    test('Should generate proper TCX format',()=> {
        rideHistory.pushSample(200,200,200,200);
        //get around only being able to push 1 sample per second
        //I need 3 samples to generate a TCX file
        rideHistory.lastSecond=null;
        rideHistory.pushSample(400,400,400,400);
        rideHistory.lastSecond=null;
        rideHistory.pushSample(600,600,600,600);
        let TCX=buildTCX({samples: rideHistory.samples,kmhToMs: (kmh) => constants.kmhToMs(kmh)});
        expect (typeof TCX).toBe('string');
        //check that it is a valid XML file
        let domParser=new DOMParser();
        let dom = domParser.parseFromString(TCX,'text/xml');
        expect(dom.documentElement.nodeName).not.toBe('parsererror');
        //confirm the format
        expect(dom.documentElement.nodeName).toBe('TrainingCenterDatabase');
    });
});