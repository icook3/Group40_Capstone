import { describe, expect, test } from '@jest/globals';
//focus of the tests
import {buildCrashReport} from '../backend/crash_logging_service/src/models/crashModel.js';
import authenticateReportService from "../backend/crash_logging_service/src/services/authenticateReportService.js";
import express from 'express';

/**
 * You must run the crashlog server first using Docker
 * Set this to the expected URL - it is currently set at the defaults
 */
let serverURL="http://localhost:3000/";
let dummyKey="KEY";
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
        let res = express.response;
        console.log(res.status(401));
        let req=new Request(new URL(serverURL));
        console.log(req);
        req.headers.authorization="Bearer "+dummyKey;
        let next=(()=>{
            return;
        });
        //test authenticating correctly - should return undefined
        process.env.REPORT_API_KEY=dummyKey;
        expect(authenticateReportService(req,res,next)).toBeUndefined();
        //test no bearer
        //res = express.response;
        req.headers.authorization="";
        console.log(res.json);
        if (res.json("")==undefined) {
            console.log("res.json is undefined!");
        }
        let response=authenticateReportService(req,res,next);
        console.log(response);
        
    });
});