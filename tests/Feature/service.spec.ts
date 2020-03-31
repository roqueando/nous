import Manager from '../../src/core/Manager';
import helpers from '../helpers';
import Service from '../../src/core/Service';
import {createConnection, connect} from 'net';
import {Emitter} from '../../src/core/Emitter';  

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
        Emitter.emit('data service', {
            serviceId: serviceOne.id,
            payload: {
                action: 'hello',
                parameters: [
                    'john'
                ]
            }
        });
        Emitter.emit('data service', {
            serviceId: serviceTwo.id,
            payload: {
                action: 'say',
                parameters: [
                    'Doe'
                ]
            }
        });

        expect(Emitter.listenerCount('data service')).toBe(2);
    });
});
