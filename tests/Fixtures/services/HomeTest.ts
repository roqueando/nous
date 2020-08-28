import {Service} from '../../../src'
import * as json from './db/db.json';

export default class HomeTest extends Service {
  hello(name: string) {
    return ("Hello " + name);
  }

  getJson() {
    return json;
  }

  getBool(){
    return true;
  }

  async asynchronousFunc() {
    return "Running async";
  }
}

