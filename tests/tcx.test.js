/**
 * @jest-environment jsdom
 */
//IMPORTING config, to prevent bugs
import * as config from '../frontend/src/js/config/config.js';
import { rideHistory } from "../frontend/src/js/rideHistoryStore.js";
import { constants } from "../frontend/src/js/constants.js";
import { describe, expect, test } from '@jest/globals';

//FOCUS of the tests
import { tcxToBlob,buildTCX } from "../frontend/src/js/rideFile.js";
import { downloadBlob } from "../frontend/src/js/download.js";

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
        let activitiesNode=dom.documentElement.children.item(0);
        expect(activitiesNode.nodeName).toBe('Activities');
        let activityNode = activitiesNode.children.item(0);
        expect(activityNode.nodeName).toBe('Activity');
        //confirm that it has an ID and a Lap
        expect(activityNode.getElementsByTagName("Id").length).toBeGreaterThan(0);
        expect(activityNode.getElementsByTagName("Lap").length).toBeGreaterThan(0);
        //for each lap
        for (let i=0;i<activityNode.getElementsByTagName("Lap").length;i++) {
            let lap = activityNode.getElementsByTagName("Lap")[i];
            //get the tracks
            expect(lap.getElementsByTagName("Track").length).toBeGreaterThan(0);
            for (let j=0;j<lap.getElementsByTagName("Track");j++) {
                let track = lap.getElementsByTagName("Track")[j];
                expect(track.getElementsByTagName("Trackpoint").length).toBeGreaterThan(0);
                for (let k=0;k<track.getElementsByTagName("Trackpoint").length;k++) {
                    let trackpoint=track.getElementsByTagName("Trackpoint")[k];
                    //each trackpoint has Time, Position, DistanceMeters, and Extensions
                    expect(trackpoint.getElementsByTagName("Time").length).toBe(1);
                    expect(trackpoint.getElementsByTagName("Position").length).toBe(1);
                    expect(trackpoint.getElementsByTagName("DistanceMeters").length).toBe(1);
                    expect(trackpoint.getElementsByTagName("Extensions").length).toBe(1);
                }
            }
        }
    });
    test('Should transform TCX into Blob',()=> {
        //generate the TCX file
        rideHistory.pushSample(200,200,200,200);
        //get around only being able to push 1 sample per second
        //I need 3 samples to generate a TCX file
        rideHistory.lastSecond=null;
        rideHistory.pushSample(400,400,400,400);
        rideHistory.lastSecond=null;
        rideHistory.pushSample(600,600,600,600);
        let TCX=buildTCX({samples: rideHistory.samples,kmhToMs: (kmh) => constants.kmhToMs(kmh)});

        //generate the Blob
        let TCXBlob = tcxToBlob(TCX);
        expect (TCXBlob.type).toBe('application/vnd.garmin.tcx+xml');
        expect (TCXBlob instanceof Blob).toBeTruthy();
    });
});