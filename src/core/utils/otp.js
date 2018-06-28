const crypto = require('crypto');
const config = require('config');
const domain = config.get('loginServer.otp');

function base32tohex(base32) {
  let base32chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
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


exports.generateOTP = function (secret) {
  var mssg = Buffer.from((Array(16).fill(0).join('') + (Math.floor(Math.round(Date.now() / 1000) / 30)).toString(16)).slice(-16), 'hex');
  var key = Buffer.from(base32tohex(secret), 'hex');
  var hmac = crypto.createHmac('sha1', key);
  hmac.setEncoding('hex');
  hmac.update(mssg);
  hmac.end();
  hmac = hmac.read();
  return ((parseInt((hmac.substr(parseInt(hmac.slice(-1), 16) * 2, 8)), 16) & 2147483647) + '').slice(-6);
}

function randomBase32(length) {
  var base32chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  length = length % 2 === 0 ? length : length + 1;
  var secret = [];
  for (var i = 0; i < length; i++) {
    secret.push(base32chars.split('')[Math.floor(Math.random() * 32)]);
  }
  return secret.join('');
}

exports.randomSecret = () => randomBase32(16);


exports.generateUrl = (user, secret) => 'https://chart.googleapis.com/chart?chs=300x300&chld=M|0&cht=qr&chl=otpauth://totp/' + user + '%40' + domain + '%3Fsecret=' + secret