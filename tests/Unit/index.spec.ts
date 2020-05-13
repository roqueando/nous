import Manager from '../../src/core/Manager';
import helpers from '../helpers';
import Service from '../../src/core/Service';
import * as json from '../Fixtures/services/db/db.json';
import Client from '../../src/core/Client';
import * as http from 'http';

describe('nous tests', () => {
    let manager: Manager;
    const PORT = 8080;
    let serviceOne: Service;
    let serviceTwo: Service;
    let webService: Service;
    let client: Client;

    beforeAll(() => {
        manager = new Manager(PORT);
        manager.run();

        const [firstService, secondService, thirdService] = helpers.upServices();
        serviceOne = firstService;
        serviceTwo = secondService;
        webService = thirdService;
        client = new Client();
    })

    afterAll(() => {
        manager.down();
        helpers.downServices([serviceOne, serviceTwo]);
    })
    test('should send JSON to a service', async (done) => {
        setTimeout(async () => {
            const result = await client.send("HomeTest", {
                action: 'getJson',
                parameters: []
            });
            expect(result.data).toStrictEqual(json.data);
            done();
        }, 10);
    });

    test('should hit on /test/1 correctly', async (done) => {
        http.get(`http://127.0.0.1:${webService.port}/test/1`, res => {
            res.on('data', chunk => {
                expect(chunk.toString()).toBe('Test 1!')
                done();
            })
        });
    })
    test('should get route parameters with more routes', async (done) => {
        http.get(`http://127.0.0.1:${webService.port}/test/john/edit/1`, res => {
            res.on('data', chunk => {
                expect(chunk.toString()).toBe('Test john 1')
                done();
            })
        });
    });

    test('should hit a POST request on webService',  (done) => {
        const postData = JSON.stringify({
            name: "John"
        });
        const opts = {
            port: webService.port,
            path: '/say',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };
        const req = http.request(opts, (res) => {
            res.setEncoding('utf8');
            res.on('data', chunk => {
                expect(chunk).toBe('Aloha John');
                done();
            })
        })

        req.write(postData);
        req.end();
    });

    test('should execute an async function', (done) => {
        setTimeout(async () => {
            const result = await client.send("HomeTest", {
                action: 'asynchronousFunc',
                parameters: []
            });
            expect(result).toStrictEqual('Running async');
            done();
        }, 10);
    });
})
