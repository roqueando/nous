/**
 * @author roqueando
 */

import {parse, UrlWithParsedQuery} from 'url';
import * as querystring from 'querystring';
import {HTTPMethods} from '../typos';
import Helper from './Helper';
import {setImmediate} from 'timers';

/**
 * @class Router
 * @description Make a router "express-like" for a HTTP service
 */
export default class Router {

  constructor() {

  }
  /**
   * @var handlers
   * @type object
   * @description Contains all routes with respectives functions
   */
  public handlers: object = {};

  /**
   * @var handleMethods
   * @type object
   * @description Contains all HTTP methods from routes
   */
  public handleMethods: object = {};

  /**
   * @var routeParameters
   * @type object
   * @description Contains all parameters from routes
   */
  public routeParameters: object = {};

  /**
   * @var routeHandler
   * @type object
   * @description Contains the route parts if have any parameter
   */
  public routeHandler: object = {};

  /**
   * @var middlewares
   * @type Array<Function>
   * @description Contains all middlewares
   */
  public middlewares: Array<Function> = [];


  /**
   * @method register
   * @param {HTTPMethods} method HTTP method GET POST PUT DELETE
   * @param {string} endpoint Route name like /endpoint
   * @param {Function} callback Handler function for route
   * @return {void}
   */
  public register(method: HTTPMethods, endpoint: string, callback: Function): void {
    this.handlers[endpoint] = callback;
    this.handleMethods[endpoint] = method;

    let parameters = this.getRouteParameters(endpoint);
    let splitedRoutes = this.splitRoute(endpoint);

    this.routeParameters[endpoint] = parameters;
    if(this.routeParameters[endpoint].length > 0) {
      this.routeHandler[endpoint] = splitedRoutes;
    }
  }

  /**
   * @method use
   * @param {Function} middleware A middleware function to all routes
   * @return {void}
   */
  public use(middleware: Function): void {
    if(typeof middleware !== 'function') {
      throw new Error("Middleware must be function!");
    }
    this.middlewares.push(middleware);
  }

  /**
   * @method handle
   * @param {any} request A Incoming Request
   * @return {Function} handler Returns a handler function with request, response
   */
  public handle(request: any): Function {
    if(Object.keys(this.handlers).length > 0 && !Object.keys(this.handlers).includes('/favicon.ico')) {
      this.register(HTTPMethods.GET, '/favicon.ico', (_, res) => {
        if(res) {
          res.writeHead(204).end()
        }
      })
    }
    let url = parse(request.url, true);

    let handler = this.handlers[url.pathname];

    const pathname = url.pathname;
    let endpoint = this.returnEndpoint(pathname);

    if(endpoint === 404) {
      this.error(`Route ${pathname} is not defined`);
    }
    if(this.routeParameters[endpoint].length > 0) {
      let path = `/${this.routeHandler[endpoint].join('/')}`;

      if(request.method !== this.handleMethods[endpoint]) throw new Error(`Cannot ${request.method} ${path}`);
      handler = this.handlers[endpoint];
      return handler;
    }

    if(request.method !== this.handleMethods[url.pathname]) throw new Error(`Cannot ${request.method} ${url.pathname}`);
    if(!handler || typeof handler === 'undefined') throw new Error("Handler not defined")
    return handler;
  }

  /**
   * @method process
   * @param {Request} req Incoming Request
   * @param {Response} res Incoming Server Response
   * @param {Function} handler callback with req, res parameters
   *
   * @description process all requests and return a parsed body, parsed parameters.
   * @return {void}
   */
  public process(req: any, res: any, handler: Function): void {
    const url = parse(req.url, true);
    let params = {};
    let body = []

    this.processMiddleware(req, res);

    const route = this.getFirstRoute(url.pathname);
    const endpoint = this.returnEndpoint(url.pathname);

    if(endpoint === 404) {
      this.error(`Route ${url.pathname} does not exist`);
    }

    params = this.handleRequestParameters(endpoint, url, route, params);

    req.on('data', (chunk: any) => {
      body.push(chunk);
    }).on('end', () => {
      // get all body by buffer data
      // and parse the querystring
      let bufferData = Buffer.concat(body).toString('utf8');
      const parsed = querystring.parse(bufferData);

      // init req.body object inside Incoming Request
      req.body = {};

      // get the possible JSON request
      const jsonData = Object.keys(parsed)[0];

      // if not JSON request, just put the body
      // on req.body and params on req.params
      if(!Helper.isJson(jsonData)) {
        req.body = parsed;
        req.params = params;

        res.writeHead(200, {"Content-Type": "application/json"});
        return handler.apply(this, [req, res, params]);
      }

      // if JSON request, parse that
      // and create a key for all JSON request keys into
      // req.body
      const parsedJsonData = JSON.parse(jsonData);
      Object.keys(parsedJsonData).forEach(jsonKey => {
        req.body[jsonKey] = parsedJsonData[jsonKey];
      });
      req.params = params;

      res.writeHead(200, {"Content-Type": "application/json"});

      return handler.apply(this, [req, res, params]);
    });
  };

  /**
   * @private
   * @method handleRequestParameters
   * @description Handle if route have parameters, and put in request params like req.params
   */
  private handleRequestParameters(endpoint: string, url: UrlWithParsedQuery, route: string, params: object): object {

    if(this.routeParameters[endpoint].length > 0) {
      const routeParts = url.pathname.split('/').filter((part: string) => part !== '');
      let spreadRoutes = this.routeHandler[endpoint].filter((route: string) => !route.includes(':') && route !== '');
      let spreadParameters = this.routeHandler[endpoint].filter((parameter: string) => parameter.includes(':'));

      let counter = 0;
      routeParts.forEach((part: any) => {
        if(!(part == route || spreadRoutes.includes(part))) {
          let param = spreadParameters[counter].replace(':', '');
          params[param] = part;
          counter++;
        }
      })

      return params;
    }
  }

  /**
   * @private
   * @method processMiddleware
   * @param {any} request HTTP request
   * @param {any} response HTTP response
   * @description Process all registered middlewares
   * @return {void}
   */
  private processMiddleware(request: any, response: any): void {
    let index = 0;
    if(this.middlewares.length > 0) {
      const next = (err = null) => {
        if(err !== null) {
          return setImmediate(() => new Error(err));
        }
        const layer = this.middlewares[index++];

        try {
          layer(request, response, next);
        } catch(error) {
          next(error);
        }
      }
      next();
    }
  }

  private returnEndpoint(path: string) {

    let matcher = {};

    let routes = Object.keys(this.handlers);

    for(let route of routes) {

      // if route on routes have parameter
      if(route.includes(':')) {
        let routeLength = this.splitRoute(route).length;
        let pathLength = this.splitRoute(path).length;

        if(routeLength !== pathLength) {
          continue;
        }
        let splitCurrentRoute = this.splitRoute(path);
        let routeWithoutParameters = this.splitRouteWithoutParameters(route);
        let intersection = this.intersection(splitCurrentRoute, routeWithoutParameters);

        if(this.isEquals(intersection, routeWithoutParameters)) {
          matcher[path] = route;
          break;
        }
        matcher[path] = 404;
        continue;
      }
      // check if current request path
      // exists on routes array
      if(routes.includes(path)) {
        if(route === path) {
          matcher[path] = route;
          break;
        }
      }

      // check if the request is a simple
      // path like /customers and if that is not include
      // return 404
      if(path.split('/').filter(item => item !== '').length == 1) {
        if(!routes.includes(path)) {
          matcher[path] = 404;
          break;
        }
      }

    }
    let endpoint = matcher[path];
    return endpoint;
  }

  private splitRoute(route: string): Array<string> {
    return route.split('/').filter(path => path !== '');
  }

  private splitRouteWithoutParameters(route: string): Array<string> {
    return route.split('/').filter(item => !item.includes(':') && item !== '');
  }

  private getFirstRoute(endpoint: string): string {
    return endpoint.split('/').filter(string => !string.includes(':') && string !== '')[0];
  }

  private getRouteParameters(endpoint: string): Array<string> {
    return endpoint.split('/').filter(string => string.includes(':'));
  }
  /**
   * @private
   * @function intersection
   * @description Make a intersection between two arrays
   * @return Array<string>
   */
  private intersection(route: Array<string>, compareRoute: Array<string>): Array<string> {
    return route.filter(part => compareRoute.includes(part));
  }

  /**
   * @private
   * @method isEquals
   * @description Check if array A is equal array B
   * @return {boolean}
   */
  private isEquals(arr1: Array<string>, arr2: Array<string>): boolean {
    return JSON.stringify(arr1) == JSON.stringify(arr2);
  }

  /**
   * @protected
   * @method error
   * @description Throw a new error based in a message
   * @throws {Error}
   */
  protected error(message: string) {
    throw new Error(message);
  }
}
