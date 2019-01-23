const config = require('config');
const long = require('long');

exports.readShort = function readShort(data, i) {
  let sign = data[i + 1] & (1 << 7);
  let x = (((data[i + 1] & 0xFF) << 8) | (data[i] & 0xFF));
  if (sign) {
    return 0xFFFF0000 | x;
  }

  return x;
}


exports.readInt = function readInt(data, i) {
  return (data[i] + (data[i + 1] << 8) + (data[i + 2] << 16) + (data[i + 3] << 24 >>> 0)) >> 0;
}

exports.readUInt = function readInt(data, i) {
  return (data[i] + (data[i + 1] << 8) + (data[i + 2] << 16) + (data[i + 3] << 24 >>> 0)) >>> 0;
}

exports.short = function short(i) {
  return [(i >>> 0) & 0xFF, (i >>> 8) & 0xFF];
}

exports.int = function int(i) {
  return [(i >>> 0) & 0xFF, (i >>> 8) & 0xFF, (i >>> 16) & 0xFF, (i >>> 24) & 0xFF];
}

exports.long = function long(i) {
  if (i > Number.MAX_SAFE_INTEGER) return [255, 255, 255, 255, 255, 255, 31, 0];
  let l = i % 0x100000000 | 0;
  let h = i / 0x100000000 | 0;
  return [
    (l >>> 0) & 0xFF, (l >>> 8) & 0xFF, (l >>> 16) & 0xFF, (l >>> 24) & 0xFF,
    (h >>> 0) & 0xFF, (h >>> 8) & 0xFF, (h >>> 16) & 0xFF, (h >>> 24) & 0xFF
  ];
}


exports.readStringArray = function readText(data, i, len) {
  let str = [];

  for (; ; i++) {
    if (data[i] == undefined || str.length == len) break;

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

exports.string = function string(i, encoding) {
  i = Array.from(Buffer.from(i, encoding || 'utf8'));

  if (i.length > 65536) {
    i = i.slice(0, 65535);
  }

  return [...exports.short(i.length), ...i];
}

exports.byte_string = function string(i, encoding) {
  i = Array.from(Buffer.from(i, encoding || 'utf8'));

  if (i.length > 255) {
    i = i.slice(0, 255);
  }
  return [i.length, ...i];
}


exports.stringWithoutLength = function stringWithoutLength(i) {
  return Array.from(Buffer.from(i, 'utf8'));
}

exports.config = function (name) {
  return exports.string(config.get(name));
}

exports.queue = function (data) {
  var array = Array.from(data);

  // very long arrays may create performance issues

  return new queue(array)
}

function queue(array) {
  this._ = array;
}

queue.prototype.byte = function () {
  return this._.shift();
}

queue.prototype.short = function () {
  var data = exports.readShort(this._, 0);
  this._.splice(0, 2);
  return data;
}

queue.prototype.int = function () {
  var data = exports.readInt(this._, 0);
  this._.splice(0, 4);
  return data;
}

queue.prototype.uint = function () {
  var data = exports.readUInt(this._, 0);
  this._.splice(0, 4);
  return data;
}

queue.prototype.skip = function (l) {
  return this._.splice(0, l);
}

queue.prototype.string = function () {
  let len = this.short();
  let data = exports.readStringArray(this._, 0, len);

  this._.splice(0, data.length);
  return data.join('');
}

queue.prototype.byte_string = function () {
  let len = this.byte();
  let data = exports.readStringArray(this._, 0, len);

  this._.splice(0, data.length);
  return data.join('');
}

queue.prototype.array = function () {
  return this._;
}

queue.prototype.long = function () {
  return long.fromBytesLE(this.skip(8)).toNumber();
}