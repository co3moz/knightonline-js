module.exports = {
  VERSION_REQ: 0x01,
  DOWNLOADINFO_REQ: 0x02,
  CRYPTION: 0xF2,
  LOGIN_REQ: 0xF3,
  SERVERLIST: 0xF5,
  NEWS: 0xF6,
  CHECK_OTP: 0xFA,
  UNK_REQ: 0xFD
};

Object.keys(module.exports).forEach(x => module.exports[module.exports[x]] = x);