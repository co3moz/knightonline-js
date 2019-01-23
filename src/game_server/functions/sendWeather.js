const unit = require('../../core/utils/unit');

module.exports = socket => {

  socket.send([
    0x14, // WEATHER
    1, // rain
    0, // amount 0-100
    0
  ]);
}