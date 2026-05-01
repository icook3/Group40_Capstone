import { describe, expect, test } from '@jest/globals';

/**
 * You must run the peer server first using Docker
 * Set this to the expected URL - it is currently set at the defaults
 */
let serverURL="http://localhost:9000/peerServer";
describe('Peer to Peer backend tests', () => {
    test('should return JSON with name, description, website', () => {
        fetch(serverURL).then((value)=> {
            return value.json();
        }).then((value)=> {
            //console.log(value);
            expect(value.name).toBe("PeerJS Server");
        });
    });
});