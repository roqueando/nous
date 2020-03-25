import Manager from '../../src/core/Manager';
import { createConnection  } from 'net';
import * as path from 'path';
import helpers from '../helpers';
import * as fs from 'fs';
import Service from '../../src/core/Service';

describe('Service', () => {
    let manager: Manager;
    const PORT = 8080;
    let serviceOne: Service;
    let serviceTwo: Service;
    
    beforeAll(async () => {
        manager = new Manager(PORT);
        await manager.run();

        fs.writeFileSync(helpers.firstFilename, helpers.createService()); 
        fs.writeFileSync(helpers.secondFilename, helpers.createSecondService());
        
        const [firstService, secondService] = helpers.upServices(manager);

        serviceOne = firstService;
        serviceTwo = secondService;
    });

    afterAll((done) => {
        manager.down();
        helpers.downServices([serviceOne, serviceTwo]);

        fs.unlinkSync(helpers.firstFilename);
        fs.unlinkSync(helpers.secondFilename);
        done();
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
