import { describe, expect, test } from '@jest/globals';
/**
 * You must run the crashlog server first using Docker
 * Set this to the expected URL - it is currently set at the defaults
 */
let serverURL="http://localhost:3000/";
describe('Crashlog storage backend tests', () => {
    test('health returns OK',()=> {
        fetch(serverURL+"crashLoggingHealth").then((value)=> {
            return value.text();
        }).then((value)=> {
            //console.log(value);
            expect(value).toBe('ok');
        });
    });
});