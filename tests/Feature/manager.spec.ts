import Manager from '../../src/core/Manager';
import { createConnection  } from 'net';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';

const writeFile = promisify(fs.writeFile);
const unlink = promisify(fs.unlink);
const readDir = promisify(fs.readdir);
const SERVICE_PATH = path.resolve(__dirname, '../../src/services');

describe('Manager', ()=> {
    
    let manager: Manager;
    const PORT = 8080;
    let services: Array<string>;

    let filename = path.resolve(SERVICE_PATH) + '/HomeTest.ts';

    beforeAll(async () => {
        manager = new Manager(PORT);
        manager.run();
        await writeFile(filename, createService());
    });

    afterAll(async () => {
        manager.down();
        await downServices();
        await unlink(filename);
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
        const service = require(`${SERVICE_PATH}/HomeTest.ts`);
        expect(services).toContainEqual({
            id: service.default.getInstance().id,
            name: 'HomeTest',
            ports: [service.default.getInstance().port]
        });
    });

    it('should service was up correctly', () => {
        const service = require(`${SERVICE_PATH}/HomeTest.ts`);
        const socket = createConnection(service.default.getInstance().port);
        expect(socket.connecting).toBe(true);
        socket.destroy();
    })
});

function createService() {
    return "import Service from '../core/Service'; export default class HomeTest extends Service {}";
}

async function downServices() {
    const files = await readDir(`${SERVICE_PATH}`);
    files.forEach(async item => {
        const file = require(`${SERVICE_PATH}/${item}`);
        file.default.getInstance().down();
    });
}
