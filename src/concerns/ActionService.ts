import {DataService} from '../typos';
import {createConnection, Socket} from 'net';
import Helper from '../core/Helper';

export default function ActionService(data: DataService, services: Array<any>, conn: Socket) {
    const filtered = services.length > 0
      ? services.filter(
        service => service && (Helper.toTitleCase(service.name) === Helper.toTitleCase(data.service))
      )
        : [];

    if(filtered.length > 0) {
      const node = filtered[Math.floor(Math.random() * filtered.length)]; // basic balance
      const service = createConnection({port: node.port});
      service.write(JSON.stringify({
        serviceId: node.id,
        payload: {
          action: data.payload.action,
          remotePort: conn.remotePort,
          parameters: data.payload.parameters
        }
      }));
    }
}
