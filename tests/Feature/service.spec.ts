import Manager from '../../src/core/Manager';
import { createConnection  } from 'net';
import * as path from 'path';
import helpers from '../helpers';

describe('Service', () => {
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
});
