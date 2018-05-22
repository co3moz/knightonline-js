module.exports = {
  AUTH_SUCCESS: 0x01,
  AUTH_NOT_FOUND: 0x02,
  AUTH_INVALID: 0x03,
  AUTH_BANNED: 0x04,
  AUTH_IN_GAME: 0x05,
  AUTH_ERROR: 0x06,
  AUTH_AGREEMENT: 0xF,
  AUTH_FAILED: 0xFF
};


Object.keys(module.exports).forEach(x => module.exports[module.exports[x]] = x);