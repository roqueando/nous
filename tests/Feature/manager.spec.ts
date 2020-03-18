import Manager from '../../src/core/Manager';
import { createConnection  } from 'net';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';

const writeFile = promisify(fs.writeFile);
const unlink = promisify(fs.unlink);
const readDir = promisify(fs.readdir);
const SERVICE_PATH = path.resolve(__dirname, '../../src/services');

describe('Manager', () => {
    
    let manager: Manager;
    const PORT = 8080;

    let filename = path.resolve(SERVICE_PATH) + '/HomeTest.ts';

    beforeEach(async () => {
        manager = new Manager(PORT);
        manager.run();
        await writeFile(filename, createService());
    });

    afterEach(async () => {
        manager.down();
        downServices();
        await unlink(filename);
    });
    it('should run manager correctly', () => {
        expect(manager).toBeInstanceOf(Manager);
        const socket = createConnection(PORT);
        expect(socket.connecting).toBe(true);
        socket.destroy();
    });

    it('should up the services', async () => {
       await manager.upServices();
       const services = manager.getServices();
       expect(services).toContain('HomeTest');
    });

});

function createService() {
    return "import Service from '../core/Service'; export default class HomeTest extends Service {}";
}

function downServices() {
    const files = fs.readdirSync(SERVICE_PATH);
    files.forEach( item => {
        const file = require(`${SERVICE_PATH}/${item}`);
        const service = new file.default(0);
        //service.down();
    });
}
