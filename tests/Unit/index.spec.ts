import Manager from '../../src/core/Manager';
import { createConnection, Socket  } from 'net';
import helpers from '../helpers';
import Service from '../../src/core/Service';
import * as json from '../Fixtures/services/db/db.json';
import Helper from '../../src/core/Helper';
import Client from '../../src/core/Client';

describe('nous tests', () => {
    let manager: Manager;
    const PORT = 8080;
    let serviceOne: Service;
    let serviceTwo: Service;
    let client: Client;

    beforeAll(() => {
        manager = new Manager(PORT);
        manager.run();

        const [firstService, secondService] = helpers.upServices();
        serviceOne = firstService;
        serviceTwo = secondService;
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
})
