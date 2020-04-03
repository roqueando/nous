import Manager from '../../src/core/Manager';
import { createConnection, Socket  } from 'net';
import helpers from '../helpers';
import Service from '../../src/core/Service';

describe('Manager', () => {
    
    let manager: Manager;
    const PORT = 8080;
    let services: Array<string>;
    let serviceOne: Service;
    let serviceTwo: Service;
    let client: Socket;

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
    beforeEach((done) => {
        client = createConnection(manager.port); 
        client.on('connect', () => {
            done();
        });
    });

    afterEach((done) => {
        done();
        client.destroy();
    });

    it('should service was up correctly', () => {
        const socket = createConnection(serviceOne.port);
        const socket2 = createConnection(serviceTwo.port);
        
        expect(socket2.connecting).toBe(true);
        expect(socket.connecting).toBe(true);

    });
    
    it('should have services registered', () => {
        expect(manager.services).toContainEqual(
            {
                id: manager.services[0].id,
                name: manager.services[0].name,
                port: manager.services[0].port
            },
        );

        expect(manager.services).toContainEqual({
            id: manager.services[1].id,
            name: manager.services[1].name,
            port: manager.services[1].port
        });
    });
});
