import {ResponseService} from '../typos';
import {Socket} from 'net';
import Helper from '../core/Helper';

export default function ActionResponseService(data: ResponseService, clients: Array<Socket>) {
    const filteredClients = clients.filter(client => data.payload.remotePort === client.remotePort);

    const str = JSON.stringify(data.payload.result);
    const pureStr = data.payload.result;

    if(Helper.isJson(pureStr) || Helper.isJson(str)) {
      return filteredClients[0].write(Buffer.from(str));
    }
    return filteredClients[0].write(Buffer.from(data.payload.result));
}
