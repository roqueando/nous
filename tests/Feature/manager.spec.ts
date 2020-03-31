import Manager from '../../src/core/Manager';
import { createConnection  } from 'net';
import helpers from '../helpers';
import * as fs from 'fs';
import Service from '../../src/core/Service';
import {Emitter} from '../../src/core/Emitter';

describe('Manager', () => {
    
    let manager: Manager;
    const PORT = 8080;
    let services: Array<string>;
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

    it('should run manager correctly', () => {
        expect(manager).toBeInstanceOf(Manager);
        const socket = createConnection(PORT);
        expect(socket.connecting).toBe(true);
        socket.destroy();
    });

    it('should have services registered', () => {
        services = manager.services;
        expect(services).toContainEqual(
            {
                id: serviceOne.id,
                name: serviceOne.name,
                ports: [serviceOne.port]
            },
        );
        
        expect(services).toContainEqual({
            id: serviceTwo.id,
            name: serviceTwo.name,
            ports: [serviceTwo.port]
        });
    });

    it('should service was up correctly', () => {
        const socket = createConnection(serviceOne.port);
        const socket2 = createConnection(serviceTwo.port);
        
        expect(socket2.connecting).toBe(true);
        expect(socket.connecting).toBe(true);

        socket.destroy();
        socket2.destroy();
    });
});
