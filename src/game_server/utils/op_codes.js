module.exports = {
  VERSION_CHECK: 0x2B,
  LOGIN: 0x1
};

Object.keys(module.exports).forEach(x => module.exports[module.exports[x]] = x);