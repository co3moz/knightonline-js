const config = require('config');

exports.readShort = function readShort(data, i) {
  return data[i] + (data[i + 1] << 8);
}

exports.short = function short(i) {
  return [i & 0xFF, (i >> 8) & 0xFF];
}

exports.readString = function readString(data, i) {
  let str = [];

  for (; ; i++) {
    if (!data[i]) break;

    str.push(String.fromCharCode(data[i]));
  }

  return str.join('');
}

exports.string = function string(i) {
  return [...exports.short(i.length), ...i.split('').map(x => x.charCodeAt(0))];
}

exports.config = function (name) {
  return exports.string(config.get(name));
}