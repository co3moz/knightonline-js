const unit = require('../../core/utils/unit');
const zoneRules = require('../var/zone_rules');

module.exports = socket => {
  let userZone = zoneRules.rules[socket.character.zone];

  if (!userZone) return;

  socket.send([
    0x5E, 1, // ZONEABILITY
    +!!(userZone.flag & zoneRules.flags.TRADE_OTHER_NATION),
    userZone.type,
    +!!(userZone.flag & zoneRules.flags.TALK_OTHER_NATION),
    ...unit.short(userZone.tariff) //TODO: dynamic tariff's for later
  ]);
}