import {DownService} from '../typos';
import {Socket, createConnection} from 'net';
import Token from '../core/Token';
import Manager from 'core/Manager';

export default function ActionDown(data: DownService, services: Array<any>, conn: Socket, manager: Manager) {

    const verified = Token.verify(data.payload.from);
    if(verified) {
      services.forEach((item: any) => {
        const socket = createConnection({port: item.port});
        socket.write(JSON.stringify({
          action: 'down',
        }));
        conn.write('OK');
        manager.down();
      })
    }
}
