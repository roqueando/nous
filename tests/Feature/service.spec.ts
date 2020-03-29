import Manager from '../../src/core/Manager';
import helpers from '../helpers';
import Service from '../../src/core/Service';
import {createConnection, connect} from 'net';

describe('Service', () => {
    let manager: Manager;
    const PORT = 8080;
    let serviceOne: Service;
    let serviceTwo: Service;
    
    beforeAll(() => {
        manager = new Manager(PORT);
        manager.run();
        manager.upServicesListener();

        const [firstService, secondService] = helpers.upServices(manager);

        serviceOne = firstService;
        serviceTwo = secondService;
    });

    afterAll(() => {
        manager.down();
        helpers.downServices([serviceOne, serviceTwo]);
    });

    test('should listener on manager.run up', () => {
        expect(manager.server.listenerCount('connection')).toBe(1);
    });

    test('should send data to a service', () => {

        manager.messenger.send(serviceOne.id, {
            action: 'hello',
            parameters: [
                'john'
            ],
        });
        manager.messenger.send(serviceTwo.id, {
            action: 'say',
            parameters: [
                'Doe'
            ],
        });

        expect(manager.messenger.listenerCount('data service')).toBe(2);
    });
});
