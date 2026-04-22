import { describe, expect, test, fn } from '@jest/globals';
import express from 'express';
//focus of the tests
import {buildCrashReport} from '../backend/crash_logging_service/src/models/crashModel.js';
import authenticateReportService from "../backend/crash_logging_service/src/services/authenticateReportService.js";
import { checkRateLimit } from '../backend/crash_logging_service/src/services/rateLimitService.js';
import { storeCrashReport } from '../backend/crash_logging_service/src/services/storageService.js';
import { validateCrashPayload } from '../backend/crash_logging_service/src/services/validationService.js';
/**
 * You must run the crashlog server first using Docker
 * Set this to the expected URL - it is currently set at the defaults
 */
let serverURL="http://localhost:3000/";
let dummyKey="KEY";
let rateLimit=5;
let rateLimitWindow=10000;
describe('Crashlog storage backend tests', () => {
    test('health returns OK',()=> {
        fetch(serverURL+"crashLoggingHealth").then((value)=> {
            return value.text();
        }).then((value)=> {
            //console.log(value);
            expect(value).toBe('ok');
        });
    });
    test('builds crash report correctly',()=> {
        let report = buildCrashReport({errorMessage: "ERROR",stackTrace:"abc.js line 2\ncde.js line 3",otherData1: "DATADATA",otherData2: "OTHERDATA"});
        let idx = report.id.indexOf('_');
        expect(idx).not.toBe(-1);
        //test that the id date part is within a certain range
        expect(Number(report.id.substring(0,idx))).toBeGreaterThanOrEqual(Date.now()-5);
        expect(Number(report.id.substring(0,idx))).toBeLessThanOrEqual(Date.now()+5);
        //check that the ID ends are different every time
        let idEnd=report.id.substring(idx+1);
        expect(idEnd.length).toBe(6);
        let report2 = buildCrashReport({errorMessage: "ERROR2",stackTrace:"abc.js line 1\ncde.js line 5",otherData1: "DATADATA",otherData2: "OTHERDATA"});
        idx = report2.id.indexOf('_');
        expect(idEnd).not.toBe(report2.id.substring(idx+1));
        //check that metadata is filled correctly
        expect(report.metadata.otherData1).toBe("DATADATA");
        expect(report.metadata.otherData2).toBe("OTHERDATA");
    });
    test('authentication works properly',()=> {
        //mock it so it actually works correctly
        let res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };
        let req=new Request(new URL(serverURL));
        req.headers.authorization="Bearer "+dummyKey;
        let next=(()=>{
            return;
        });
        //test authenticating correctly - should return undefined
        process.env.REPORT_API_KEY=dummyKey;
        expect(authenticateReportService(req,res,next)).toBeUndefined();

        //test with no bearer
        req.headers.authorization="";
        let response=authenticateReportService(req,res,next);
        expect(response.status).toHaveBeenCalledWith(401);
        
        //test with incorrect code
        req.headers.authorization="Bearer NOTAKEY";
        response=authenticateReportService(req,res,next);
        expect(response.status).toHaveBeenCalledWith(403);
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
    test('validation service works correctly',()=> {
        let report = {errorMessage: "ERROR",stackTrace:"abc.js line 2\ncde.js line 3",otherData1: "DATADATA",otherData2: "OTHERDATA"};
        //valid paylooad
        expect(validateCrashPayload(report)).toBe(report);
        //invalid payload - errorMessage and stackTrace do not exist
        report = {err:"ERROR?",stk:"THERE IS A PROBLEM"};
        expect(()=>validateCrashPayload(report)).toThrowError();
        //invalid payload - properties are not strings
        report = {errorMessage:1,stackTrace:{OBJECT1: "THIS IS NOT A STRING!"}};
        expect(()=>validateCrashPayload(report)).toThrowError();
        //invalid payload - metadata is not an object
        report = {errorMessage: "ERROR",stackTrace:"abc.js line 2\ncde.js line 3",metadata:"METADATA!"};
        expect(()=>validateCrashPayload(report)).toThrowError();
    });
    test('intake routes return the correct values',()=> {
        fetch(serverURL+"intake",{
            method: 'POST',
            headers:{
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({errorMessage: "ERROR",stackTrace:"abc.js line 2\ncde.js line 3",otherData1: "DATADATA",otherData2: "OTHERDATA"})
        }).then((value)=> {
            return value.text();
        }).then((value)=> {
            //console.log(value);
            expect(value).toBe('ok');
        });
    });
});