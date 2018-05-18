module.exports = function () {
  var privateKey = [0x8966, 0x2012, 0x5001, 0x1207];
  var publicKey = null;
  var tKey = null;
  var enabled = false;

  return {
    get public() {
      if (publicKey == null) {
        publicKey = [
          Math.random() * 0xFFFF & 0xFFFF,
          Math.random() * 0xFFFF & 0xFFFF,
          Math.random() * 0xFFFF & 0xFFFF,
          Math.random() * 0xFFFF & 0xFFFF
        ];

        tKey = publicKey.map((x, i) => privateKey[i] ^ x);
      }

      return publicKey;
    },

    get enabled() {
      return enabled;
    },

    set enabled(value) {
      return enabled = !!value;
    }
  }
}