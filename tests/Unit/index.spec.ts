import Manager from '../../src/core/Manager';
import helpers from '../helpers';
import Service from '../../src/core/Service';
import Token from '../../src/core/Token';
import * as json from '../Fixtures/services/db/db.json';
import Client from '../../src/core/Client';
import * as http from 'http';
import TestCase from '../TestCase'
import {jsonServiceTest} from './client.spec'

describe('nous tests', () => {
  let serviceOne: Service;
  let serviceTwo: Service;
  let webService: Service;
  let client: Client;
  let Case: TestCase = new TestCase();

  beforeAll(async () => {
    Case.init()

    serviceOne = await Case.loadFixtureService('HomeTest');
    serviceTwo = await Case.loadFixtureService('SecondTest');
    webService = await Case.loadFixtureService('WebService');
    client = new Client();
  })

  afterAll(() => {
    Case.down();
  })
  test('should send JSON to a service', (done) => jsonServiceTest(Case, done));

  test('should hit on /test/1 correctly', async (done) => {
    http.get(`http://127.0.0.1:${webService.port}/test/1`, res => {
      res.on('data', chunk => {
      expect(chunk.toString()).toBe('Test 1!')
      done();
    })
    });
  })
  test('should get route parameters with more routes', async (done) => {
    http.get(`http://127.0.0.1:${webService.port}/test/1/edit/john`, res => {
      res.on('data', chunk => {
      expect(chunk.toString()).toBe('Test john 1')
      done();
    })
    });
  });

  test('should hit a POST request on webService',  (done) => {
    const postData = JSON.stringify({
      name: "John"
    });
    const opts = {
      port: webService.port,
      path: '/say',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    const req = http.request(opts, (res) => {
      res.setEncoding('utf8');
      res.on('data', chunk => {
        expect(chunk).toBe('Aloha John');
        done();
      })
    })

    req.write(postData);
    req.end();
  });

  test('should execute an async function', (done) => {
    setTimeout(async () => {
      const result = await client.send("HomeTest", {
        action: 'asynchronousFunc',
        parameters: []
      });
      expect(result).toStrictEqual('Running async');
      done();
    }, 10);
  });

  test('should create a Token with some payload and return decrypt', () => {
    const tokenObject = new Token("ABC123", {
      id: 1,
      role: 'user'
    });

    const token = tokenObject.getToken();
    const decoded = tokenObject.decrypt("ABC123", token);
    expect(decoded.payload).toStrictEqual({id: 1, role: 'user'});
  });

  test('should show middleware request parameter', (done) => {
    http.get(`http://127.0.0.1:${webService.port}/middle`, res => {
      res.on('data', chunk => {
      expect(chunk.toString()).toBe('Hey middleware testing');
      done();
    })
    });
  });

  test('should hit a /test/:id/post', (done) => {
    const postData = JSON.stringify({
      name: "John"
    });
    const opts = {
      port: webService.port,
      path: '/test/1/post',
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    const req = http.request(opts, (res) => {
      res.setEncoding('utf8');
      res.on('data', chunk => {
        expect(chunk).toBe('Deleting id: 1');
        done();
      })
    })
    req.write(postData);
    req.end();
  });

  test('should favicon not disturb anymore', async (done) => {
    http.get(`http://127.0.0.1:${webService.port}/favicon.ico`, res => {
      expect(res.statusCode).toBe(204);
      done();
    });
  });
  
  test('should hit a 2 parameters route', (done) => {
    http.get(`http://127.0.0.1:${webService.port}/test/1/post/2`, res => {
      res.on('data', chunk => {
        expect(chunk.toString()).toBe(`Get id: 1 the post id: 2`);
        done();
      })
    });
  });

  test('should able to support websocket calls', () => {

  });
});
