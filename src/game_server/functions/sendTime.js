const unit = require('../../core/utils/unit');

module.exports = socket => {
  let now = new Date();
  
  socket.send([
    0x13,
    ...unit.short(now.getFullYear()),
    ...unit.short(now.getMonth() + 1),
    ...unit.short(now.getDate()),
    ...unit.short(now.getHours()),
    ...unit.short(now.getMinutes())
  ]);
}