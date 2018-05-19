module.exports = function () {
  var privateKey = [0x66, 0x89, 0x12, 0x20, 0x01, 0x50, 0x07, 0x12];
  var publicKey = null;
  var tKey = null;
  var enabled = false;

  return {
    get public() {
      if (publicKey == null) {
        publicKey = [
          Math.random() * 0xFF & 0xFF,
          Math.random() * 0xFF & 0xFF,
          Math.random() * 0xFF & 0xFF,
          Math.random() * 0xFF & 0xFF,
          Math.random() * 0xFF & 0xFF,
          Math.random() * 0xFF & 0xFF,
          Math.random() * 0xFF & 0xFF,
          Math.random() * 0xFF & 0xFF
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