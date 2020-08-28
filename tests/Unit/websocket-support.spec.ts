import TestCase from '../TestCase';
import WebSocket from 'ws';

export default class WebsocketSupportTest extends TestCase {
  async connectToManagerTest() {
    const ws = new WebSocket(`ws://localhost:${this.managerPort}`);
      console.log(ws);
    ws.on('error', (err) => {
      console.log(err)
    })
  }
}
