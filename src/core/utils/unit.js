const config = require('config');

exports.readShort = function readShort(data, i) {
  return data[i] + (data[i + 1] << 8);
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


exports.readStringArray = function readText(data, i, len) {
  (len || (len = 32000)); //max len

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

exports.string = function string(i) {
  i = Array.from(Buffer.from(i, 'utf8'));

  if (i.length > 65536) {
    i = i.slice(0, 65535);
  }

  return [...exports.short(i.length), ...i];
}

exports.byte_string = function string(i) {
  i = Array.from(Buffer.from(i, 'utf8'));

  if (i.length > 256) {
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

  return {
    byte() {
      return array.shift();
    },

    short() {
      var data = exports.readShort(array, 0);
      array.splice(0, 2);
      return data;
    },

    int() {
      var data = exports.readInt(array, 0);
      array.splice(0, 4);
      return data;
    },

    uint() {
      var data = exports.readUInt(array, 0);
      array.splice(0, 4);
      return data;
    },

    skip(l) {
      array.splice(0, l);
    },

    string() {
      let len = this.short();
      let data = exports.readStringArray(array, 0, len);

      array.splice(0, data.length);
      return data.join('');
    },

    byte_string() {
      let len = this.byte();
      let data = exports.readStringArray(array, 0, len);

      array.splice(0, data.length);
      return data.join('');
    }
  };
}