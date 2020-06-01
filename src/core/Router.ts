import {parse} from 'url';
import * as querystring from 'querystring';
import {HTTPMethods} from '../typos';
import Helper from './Helper';
import {setImmediate} from 'timers';

export default class Router {

  public handlers: object = {};
  public handleMethods: object = {}; public routeParameters: object = {};
  public routeHandler: object = {};
  public association: object = {};
  public middlewares: Array<Function> = [];

  // register an endpoint on handlers object
  public register(method: HTTPMethods, endpoint: string, callback: Function) {
    this.handlers[endpoint] = callback;
    this.handleMethods[endpoint] = method;
    let parameters = this.getRouteParameters(endpoint);

    // TODO: turn that split into a private function
    let splitedRoutes = endpoint.split('/').filter(item => item !== '');

    this.routeParameters[endpoint] = parameters;
    if(this.routeParameters[endpoint].length > 0) {
      this.routeHandler[endpoint] = splitedRoutes;
    }
  }

  public use(middleware: Function) {
    if(typeof middleware !== 'function') {
      throw new Error("Middleware must be function!");
    }
    this.middlewares.push(middleware);
  }

  // return a request handler
  public handle(request: any) {
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
   * @function process
   * @param {Request} req
   * @param {Response} res
   * @param {Function} handler callback with req, res parameters
   *
   * @description process all requests and return a parsed body.
   *
   */
  public process(req: any, res: any, handler: Function) {
    let index = 0;
    let url = parse(req.url, true);
    let params = {};
    let body = []

    if(this.middlewares.length > 0) {
      const next = (err = null) => {
        if(err !== null) {
          return setImmediate(() => new Error(err));
        }
        const layer = this.middlewares[index++];

        try {
          layer(req, res, next);
        } catch(error) {
          next(error);
        }
      }
      next();
    }
    const route = this.getFirstRoute(url.pathname);

    let endpoint = this.returnEndpoint(url.pathname);
    if(endpoint === 404) {
      this.error(`Route ${url.pathname} does not exiss`);
    }
    if(this.routeParameters[endpoint].length > 0) {
      const routeParts = url.pathname.split('/').filter(item => item !== '');
      let spreadRoutes = this.routeHandler[endpoint].filter(item => !item.includes(':') && item !== '');
      let spreadParameters = this.routeHandler[endpoint].filter(item => item.includes(':'));

      let counter = 0;
      routeParts.forEach((item, index) => {
        if(!(item == route || spreadRoutes.includes(item))) {
          let param = spreadParameters[counter].replace(':', '');
          params[param] = item;
          counter++;
        }
      })
    }

    req.on('data', chunk => {
      body.push(chunk);
    }).on('end', data => {
      let bufferData = Buffer.concat(body).toString('utf8');
      const parsed = querystring.parse(bufferData);

      req.body = {};
      const jsonData = Object.keys(parsed)[0];
      if(!Helper.isJson(jsonData)) {
        req.body = parsed;
        req.params = params;

        res.writeHead(200, {"Content-Type": "application/json"});
        return handler.apply(this, [req, res, params]);
      }

      const parsedJsonData = JSON.parse(jsonData);
      Object.keys(parsedJsonData).forEach(jsonKey => {
        req.body[jsonKey] = parsedJsonData[jsonKey];
      });
      req.params = params;

      res.writeHead(200, {"Content-Type": "application/json"});

      return handler.apply(this, [req, res, params]);
    });
  };

  private getFirstRoute(endpoint: string): string {
    return endpoint.split('/').filter(string => !string.includes(':') && string !== '')[0];
  }

  private getRouteParameters(endpoint: string): Array<string> {
    return endpoint.split('/').filter(string => string.includes(':'));
  }

  private ranking(routes: Array<string>) {
    const classification: object = {};

    routes.forEach(route => {
      let rankingPoints: number = 0;
      route.split('/')
        .filter(path => path.length)
        .forEach(path => {
          if(path.startsWith(':')) {
            rankingPoints += 70;
          } else {
            rankingPoints += 60;
          }
        });

        if(classification[rankingPoints]) {
          classification[rankingPoints].push(route);
        } else {
          classification[rankingPoints] = [route];
        }
    });
    return classification;
  }

  private returnEndpoint(path: string) {

    let matcher = {};

    let routes = Object.keys(this.handlers);
    /*
    routes.sort((a,b) => {
      let first = this.getParametersCount(a);
      let second = this.getParametersCount(b);
      if(first > second) {
        return -1;
      }
      return 1;
    });
    */

    const prioritedRoutes = this.getHighPointRankedRoute(routes);

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

  private getParametersCount(route: string) {
    return route.split(':').length - 1;
  }
  private getHighPointRankedRoute(routes: Array<string>): Array<string> {
    const rankedRoutes = this.ranking(routes);
    const rankedRoutesObjectKeys = Object.keys(rankedRoutes);
    const highPointRoutes = rankedRoutes[rankedRoutesObjectKeys[rankedRoutesObjectKeys.length - 1]];
    return highPointRoutes;
  }
  private splitRoute(route: string): Array<string> {
    return route.split('/').filter(path => path !== '');
  }

  private splitRouteWithoutParameters(route: string): Array<string> {
    return route.split('/').filter(item => !item.includes(':') && item !== '');
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

  private isEquals(arr1: Array<string>, arr2: Array<string>) {
    return JSON.stringify(arr1) == JSON.stringify(arr2);
  }

  protected error(message: string) {
    throw new Error(message);
  }
}
