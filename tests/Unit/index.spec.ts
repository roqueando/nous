import Manager from '../../src/core/Manager';
import { createConnection, Socket  } from 'net';
import helpers from '../helpers';
import Service from '../../src/core/Service';
import * as json from '../Fixtures/services/db/db.json';
import Helper from '../../src/core/Helper';

describe('nous tests', () => {
    let manager: Manager;
    const PORT = 8080;
    let serviceOne: Service;
    let serviceTwo: Service;

    beforeAll(() => {
        manager = new Manager(PORT);
        manager.run();

        const [firstService, secondService] = helpers.upServices();
        serviceOne = firstService;
        serviceTwo = secondService;
    })

    afterAll(() => {
        manager.down();
        helpers.downServices([serviceOne, serviceTwo]);
    })
    test('should send JSON to a service', (done) => {
        const client = createConnection({ port: manager.port  });
        client.write(JSON.stringify({
            service: 'HomeTest',
            action: 'data service',
            isService: false,
            payload: {
                action: 'getJson',
                parameters: []
            }
        }));
        client.on('data', payload => {
            expect(Helper.decode(payload.toString())).toStrictEqual(json);
            done();
        });
    });

})
