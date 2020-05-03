import {parse} from 'url';
import * as querystring from 'querystring';
import {HTTPMethods} from '../typos';

export default class Router {

  public handlers: object = {};
  public handleMethods: object = {};
  public routeParameters: object = {};
  public routeHandler: object = {};
  public ranking: object = {};
  public association: object = {};

  // register an endpoint on handlers object
  public register(method: HTTPMethods, endpoint: string, callback: Function) {
    this.handlers[endpoint] = callback;
    this.handleMethods[endpoint] = method;
    let parameters = this.getRouteParameters(endpoint);
    let route = this.getFirstRoute(endpoint);

    // TODO: turn that split into a private function
    let splitedRoutes = endpoint.split('/').filter(item => item !== '');

    this.routeParameters[endpoint] = parameters;
    if(this.routeParameters[endpoint].length > 0) {
      this.routeHandler[endpoint] = splitedRoutes;
    }
    let keys = Object.keys(this.handlers);
    const rank = this.classify(keys);
    this.ranking = rank;
  }

  // return a request handler
  public handle(request: any) {
    let url = parse(request.url, true);
    let handler = this.handlers[url.pathname];
    let route = this.getFirstRoute(url.pathname);

    const path = url.pathname;
    let endpoint = this.returnEndpoint(route, path);

    if(this.routeParameters[endpoint].length > 0) {
      // get parameters and put
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
   * *** TODO: apply middlewares too ***
   *
   */
  public process(req: any, res: any, handler: Function) {
    let url = parse(req.url, true);
    let params = {};
    let body = []

    const route = this.getFirstRoute(url.pathname);

    let endpoint = this.returnEndpoint(route, url.pathname);
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
      req.body = parsed;
      req.params = params;

      return handler.apply(this, [req, res, params]);
    });
  };

  private getFirstRoute(endpoint: string): string {
    return endpoint.split('/').filter(string => !string.includes(':') && string !== '')[0];
  }

  private getRouteParameters(endpoint: string): Array<string> {
    return endpoint.split('/').filter(string => string.includes(':'));
  }

  private classify(routes: Array<string>) {
    const classification = {};

    routes.forEach((route) => {
      let ranking = 0;
      route.split('/')
        .filter(path => path.length)
        .forEach(path => {
          if(path.startsWith(':')) {
            ranking += 60;
          } else {
            ranking += 60
          }
        });

        if(classification[ranking]) {
          classification[ranking].push(route);
        } else {
          classification[ranking] = [route];
        }
    })

    return classification;
  }

  private returnEndpoint(route: string, path: string) {

    let matcher = {};

    let keys = Object.keys(this.handlers);
    for(let key of keys) {
      // solved for non-parameters routes
      if(key == path) {
        matcher[path] = key;
        break;
      }

      // parameters routes
      let splitted = key.split('/').filter(item => item !== '');
      for(let part of splitted) {
        if(part.includes(':')) {
          matcher[path] = key;
          break;
        }
      }
    }
    let endpoint = matcher[path];
    return endpoint;
  }

}
