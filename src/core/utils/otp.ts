import crypto from 'crypto'
import * as config from 'config'

export function GenerateOTP(secret: string): string {
  let timestamp = (Math.floor(Math.round(Date.now() / 1000) / 30)).toString(16);
  let buffer = Buffer.from(('0'.repeat(16) + timestamp).slice(-16), 'hex');
  let key = Buffer.from(base32tohex(secret), 'hex');
  let hmac = crypto.createHmac('sha1', key);
  hmac.setEncoding('hex');
  hmac.update(buffer);
  hmac.end();

  let hmacString: string = <string>hmac.read();
  let lastCharValue = parseInt(hmacString.slice(-1), 16);
  let fullValue = parseInt(hmacString.substr(lastCharValue * 2, 8), 16);
  let last6Digits = ((fullValue & 2147483647) + '').slice(-6);
  return last6Digits;
}

export const randomSecret = () => randomBase32(16);
export const generateUrl = (userCredentials: string, secretKey: string) => 'https://chart.googleapis.com/chart?chs=300x300&chld=M|0&cht=qr&chl=otpauth://totp/' + userCredentials + '%40' + domain + '%3Fsecret=' + secretKey

const domain = config.get('loginServer.otp');

const base32chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

function base32tohex(base32: string) {
  let bits = '';
  let hex = '';

  for (let i = 0; i < base32.length; i++) {
    let val = base32chars.indexOf(base32.charAt(i).toUpperCase());
    bits += (Array(5).fill(0).join('') + val.toString(2)).slice(-5);
  }

  for (let i = 0; i < bits.length - 3; i += 4) {
    let chunk = bits.substr(i, 4);
    hex = hex + parseInt(chunk, 2).toString(16);
  }

  return hex;
}

function randomBase32(length: number) {
  length += length % 2; // always could divide by 2

  let secret = [];

  for (let i = 0; i < length; i++) {
    secret.push(base32chars.charAt(Math.random() * base32chars.length | 0));
  }

  return secret.join('');
}
