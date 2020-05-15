import {Payload} from '../typos';
import {Buffer} from 'buffer';
import crypto from 'crypto';

export default class Token {
  protected key: string;
  protected header: any;
  protected bufferedHeader: string;
  protected payload: string;

  constructor(key?: string, data?: any) {
    this.key = key;
    this.header = {
      "typ": "JWT",
      "alg": "HS256"
    }
    this.bufferedHeader = Buffer.from(JSON.stringify(this.header)).toString('base64');
    this.payload = this.createPayload(data);
  }

  public getToken(): string {
    return `${this.bufferedHeader}.${this.payload}.${this.createSignature(this.bufferedHeader, this.payload)}`
  }
  private createSignature(header: string, payload: string): string {
    let signature = crypto.createHmac('sha256', this.key ? this.key : 'default')
      .update(`${header}.${payload}`)
      .digest('base64');

    return Buffer.from(signature).toString('base64');
  }

  public static verify(token: string, key?: string): boolean {
    const [header, payload, signature] = token.split('.');
    let sig = crypto.createHmac('sha256', key ? key : 'default')
      .update(`${header}.${payload}`)
      .digest('base64');

    const valid = Buffer.from(sig).toString('base64');

    return valid === signature;
  }

  public decrypt(key: string, token: string): any {
    const verified = Token.verify(token, key);
    if(!verified) {
      return new Error("Token invalid");
    }

    const [header, payload] = token.split('.');
    const decoded = JSON.parse(Buffer.from(payload, 'base64').toString());
    return decoded;

  }
  private createPayload(data: any): string {
    let initialJWTPayload: Payload = {
      iss: "nous.project",
      iat: Date.now(),
      exp: new Date().setMinutes(21600),
    }
    const finalJWTPayload = {
      ...initialJWTPayload,
      payload: data
    }
    return Buffer.from(JSON.stringify(finalJWTPayload)).toString('base64');
  }
}
