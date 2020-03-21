import Manager from '../../src/core/Manager';
import { createConnection  } from 'net';
import helpers from '../helpers';
import * as path from 'path';

describe('Manager', () => {
    
    let manager: Manager;
    const PORT = 8080;
    let services: Array<string>;

    let filename = path.resolve(helpers.SERVICE_PATH) + '/HomeTest.ts';

    beforeAll(async () => {
        manager = new Manager(PORT);
        manager.run();
        await helpers.writeFile(filename, helpers.createService()); 
    }); 

    afterAll(async () => {
        manager.down();
        await helpers.downServices();
        await helpers.unlink(filename);
    });

    it('should run manager correctly', () => {
        expect(manager).toBeInstanceOf(Manager);
        const socket = createConnection(PORT);
        expect(socket.connecting).toBe(true);
        socket.destroy();
    });

    it('should up the services', async () => await manager.upServices());

    it('should have services registered', () => {
        services = manager.services;
        const service = require(`${helpers.SERVICE_PATH}/HomeTest.ts`);
        expect(services).toContainEqual({
            id: service.default.getInstance().id,
            name: 'HomeTest',
            ports: [service.default.getInstance().port]
        });
    });

    it('should service was up correctly', () => {
        const service = require(`${helpers.SERVICE_PATH}/HomeTest.ts`);
        const socket = createConnection(service.default.getInstance().port);
        expect(socket.connecting).toBe(true);
        socket.destroy();
    })
});
