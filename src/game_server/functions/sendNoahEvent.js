const region = require('../region');
const unit = require('../../core/utils/unit');
const sendNoahChange = require('./sendNoahChange');

module.exports = (socket, noah) => {
  if (noah <= 0) return false; // this is event, not the punishment

  let chance = Math.random();
  let multiplier = 1;

  if (chance > 0.2) return false; // no luck
  if (chance > 0.18) multiplier = 2;
  else if (chance > 0.14) multiplier = 10;
  else if (chance > 0.10) multiplier = 50;
  else if (chance > 0.06) multiplier = 100;
  else if (chance > 0.02) multiplier = 500;
  else multiplier = 1000;

  region.regionSend(socket, [
    0x4A, // GOLD_CHANGE
    5, // Event
    ...unit.short(740), 0, 0, 0, 0, 0, 0, ...unit.short(multiplier), ...unit.short(socket.session)
  ]);


  sendNoahChange(socket, multiplier * noah);

  return true;
}