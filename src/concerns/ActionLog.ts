import {Log} from '../typos';
import {Socket} from 'net';
import Manager from '../core/Manager';
import Helper from '../core/Helper';

export default function ActionLog (data: Log, conn: Socket, services: Array<any>, manager: Manager) {
  if(!data.payload.service) {
    const obj = {
      services,
      manager: {
        port: manager.port,
        id: '#',
        name: 'Manager',
        host: manager.server.address()
      }
    }
    conn.write(JSON.stringify(obj));
  } else {
    const node = services.filter(
      service => Helper.toTitleCase(service.name) === Helper.toTitleCase(data.payload.service)
    );
    const obj = {
      name: node[0].name,
      ports: node.map(service => service.port).join("\n"),
      nodes: node.length,
    }

    conn.write(JSON.stringify(obj));
  }
}
