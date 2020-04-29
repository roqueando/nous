import {parse} from 'url';
import * as querystring from 'querystring';
import {HTTPMethods} from '../typos';

export default class Router {

  public handlers = {};
  public handleMethods = {};

  // register an endpoint on handlers object
  public register(method: HTTPMethods, endpoint: string, callback: Function) {
    this.handlers[endpoint] = callback;
    this.handleMethods[endpoint] = method;
  }

  // return a request handler
  public handle(request: any) {
    let url = parse(request.url, true);
    let handler = this.handlers[url.pathname];

    if(request.method !== this.handleMethods[url.pathname]) throw new Error(`Cannot ${request.method} ${url.pathname}`);
    if(!handler || typeof handler === 'undefined') throw new Error("Handler not defined")
    return handler;
  }

  /**
   * @function process
   * @param {Request} req
   * @param {Response} res
   * @param {Function} handler callback with req, res parameters
   *
   * @description process all requests and return a parsed body.
   * *** TODO: apply middlewares too ***
   *
   */
  public process(req: any, res: any, handler: Function) {
    let params = null;
    let body = []
    req.on('data', chunk => {
      body.push(chunk);
    }).on('end', data => {
      let bufferData = Buffer.concat(body).toString('utf8');
      const parsed = querystring.parse(bufferData);
      req.body = parsed;

      return handler.apply(this, [req, res, params]);
    });
  };
}
