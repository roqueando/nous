import Server from './Server';
import CanManage from '../contracts/CanManage';
import fs from 'fs';
import util from 'util';
import path from 'path';

export default class Manager extends Server implements CanManage {
    public services: Array<string> = [];

    public async upServices(): Promise<any> {
        const readdir = util.promisify(fs.readdir);
        const servicesPath = path.join('src', 'services');
        const files = await readdir(servicesPath);
        
        console.log(files);
        return this;
    }

    public getServices(): Array<string> {
        return this.services;
    }
}
