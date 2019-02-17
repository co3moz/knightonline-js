const unit = require('../../core/utils/unit');

module.exports = (socket) => {
  socket.send([
    0x54, // WEIGHT_CHANGE
    ...unit.int(socket.variables.itemWeight)
  ])
}