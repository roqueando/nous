import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';

const writeFile = promisify(fs.writeFile);
const unlink = promisify(fs.unlink);
const readDir = promisify(fs.readdir);
const SERVICE_PATH = path.resolve(__dirname, '../src/services');

const helpers = {
    writeFile,
    SERVICE_PATH,
    unlink,
    readDir,
    createService: () => {
        return "import Service from '../core/Service'; export default class HomeTest extends Service {}";
    },
    downServices: async () => {
        const files = await readDir(`${SERVICE_PATH}`);
        files.forEach(async (item: any) => {
            const file = require(`${SERVICE_PATH}/${item}`);
            file.default.getInstance().down();
        });
    }

};

export default helpers;
