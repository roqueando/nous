import WebSocketSupportTest from './websocket-support.spec';
import TestCase from '../TestCase'

const Case = new TestCase();
describe('Unit', () => {
  beforeAll(() => Case.init())
  afterAll(() => Case.down())
  it('should allow connect via WebSocket class client', async () => (new WebSocketSupportTest).connectToManagerTest())
});
