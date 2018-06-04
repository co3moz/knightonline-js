module.exports = {
  VERSION_CHECK: 0x2B,
  LOGIN: 0x1,
  LOAD_GAME: 0x9F,
  SEL_NATION: 0x05,
  ALLCHAR_INFO_REQ: 0x0C,
  NEW_CHAR: 0x02,
  SEL_CHAR: 0x04,
  CHANGE_HAIR: 0x89, // client calls if hair = 0 
  SHOPPING_MALL: 0x6A,
  RENTAL: 0x73, // investigate this
  SPEEDHACK_CHECK: 0x41,
  HACK_TOOL: 0x72,
  SERVER_INDEX: 0x6B,
  GAME_START: 0x0D,
};

Object.keys(module.exports).forEach(x => module.exports[module.exports[x]] = x);