import {ResponseService} from '../typos';
import {Socket} from 'net';

export default function ActionResponseService(data: ResponseService, clients: Array<Socket>) {
    const filteredClients = clients.filter(client => data.payload.remotePort === client.remotePort);
    filteredClients[0].write(data.payload.result);
}
