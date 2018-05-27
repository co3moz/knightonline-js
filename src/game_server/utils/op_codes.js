module.exports = {
  VERSION_CHECK: 0x2B,
  LOGIN: 0x1,
  LOAD_GAME: 0x9F,
  SEL_NATION: 0x05,
  ALLCHAR_INFO_REQ: 0x0C,
  NEW_CHAR: 0x02
};

Object.keys(module.exports).forEach(x => module.exports[module.exports[x]] = x);