import { describe, expect, test, fn } from '@jest/globals';
import express from 'express';
//focus of the tests
import {checkRateLimit} from '../backend/achievements_service/src/services/rateLimitService.js'
import { incrementUserCount, decrementUserCount, getAchievementsPercentage, storeAsJSON, getFromJSON, achievements, userCount } from '../backend/achievements_service/src/services/internalStorageService.js';

/**
 * You must run the achievements server first using Docker
 * Set this to the expected URL - it is currently set at the defaults
 */
let serverURL="http://localhost:5000/";
let rateLimit=5;
let rateLimitWindow=10000;
describe('Achievements percentage backend tests', () => {
    test('health returns OK',()=> {
        fetch(serverURL+"achievementsHealth").then((value)=> {
            return value.text();
        }).then((value)=> {
            expect(value).toBe('ok');
        });
    });
    test('rate limit works correctly',()=> {
        process.env.RATE_LIMIT_MAX=rateLimit;
        process.env.RATE_LIMIT_WINDOW_MS=rateLimitWindow;
        //send requests up to RATE_LIMIT_MAX
        //before that amount should not throw an error
        //after that amount should throw an error
        for (let i=0;i<rateLimit;i++) {
            expect(()=>checkRateLimit(1000)).not.toThrowError();
        }
        expect(()=>checkRateLimit(1000)).toThrowError();
    });
    test('get and set JSON',()=> {
        incrementUserCount();
        achievements.set("Test Achievement",2);
        let json = JSON.parse(storeAsJSON());
        expect(json.userCount).toBe(1);
        expect(json.map["Test Achievement"]).toBe(2);
        json.map["Test Achievement"]=3;
        getFromJSON(JSON.stringify(json));
        expect(achievements.get("Test Achievement")).toBe(3);

        //reset the test
        decrementUserCount();
    });
    test('get achievements percentage',()=> {
        incrementUserCount();
        incrementUserCount();
        incrementUserCount();
        incrementUserCount();
        achievements.set("Test Achievement",3);
        expect(JSON.parse(getAchievementsPercentage())["Test Achievement"]).toBe(75);

        //reset the test
        decrementUserCount();
        decrementUserCount();
        decrementUserCount();
        decrementUserCount();
    });
});