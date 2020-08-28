import {Service} from '../../../src';
import router from './routes/routeTest'

export default class WebService extends Service { 
  constructor(port: number) {
    super(port, router);
    this.type = this.HTTP;
  }
}
