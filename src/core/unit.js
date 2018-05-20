const config = require('config');

exports.readShort = function readShort(data, i) {
  return data[i] + (data[i + 1] << 8);
}

exports.short = function short(i) {
  return [(i>>>0) & 0xFF, (i >>> 8) & 0xFF];
}

exports.readStringArray = function readText(data, i, maxlen) {
  let str = [];

  for (; ; i++) {
    if (!data[i] || str.length == maxlen) break;

    str.push(String.fromCharCode(data[i]));
  }

  return str;
}

exports.readString = function readText(data, i, maxlen) {
  return exports.readStringArray(data, i, maxlen).join('');
}

exports.stringFromArray = function string(i) {
  return [...exports.short(i.length), ...i];
}

exports.string = function string(i) {
  i = Array.from(Buffer.from(i, 'utf8'));

  return [...exports.short(i.length), ...i];
}

exports.stringWithoutLength = function stringWithoutLength(i) {
  return Array.from(Buffer.from(i, 'utf8'));
}

exports.config = function (name) {
  return exports.string(config.get(name));
}