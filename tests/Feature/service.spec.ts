import Manager from '../../src/core/Manager';
import { createConnection  } from 'net';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';

const writeFile = promisify(fs.writeFile);
const unlink = promisify(fs.unlink);
const readDir = promisify(fs.readdir);
const SERVICE_PATH = path.resolve(__dirname, '../../src/services');
