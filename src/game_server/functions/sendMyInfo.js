const config = require('config');
const unit = require('../../core/utils/unit');
const { BAG2, FAIRY } = require('../var/item_slot');
const levelUp = config.get('gameServer.levelUp');

module.exports = socket => {
  let u = socket.user;
  let c = socket.character;
  let v = socket.variables;

  let nation = u.nation;

  let items = [];

  for (let i = 0; i < 75; i++) {
    let item = c.items[i];

    if (i == BAG2) {
      item = c.items[FAIRY];
    } else if (i == FAIRY) {
      item = c.items[BAG2];
    }

    if (item) {
      items.push(
        ...unit.int(item.id),
        ...unit.short(item.durability),
        ...unit.short(item.amount),
        item.flag,
        0, 0, // rental time,
        0, 0, 0, 0, // TODO: seal serial data
        0, 0, 0, 0 // unix expiration time
      );
    } else {
      items.push(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
    }
  }


  socket.sendCompressed([
    0x0E, // MYINFO
    ...unit.short(socket.session & 0xFFFF),
    ...unit.byte_string(c.name),
    ...unit.short(c.x * 10),
    ...unit.short(c.z * 10),
    ...unit.short(c.y * 10),
    nation,
    c.race,
    ...unit.short(c.klass),
    c.face,
    ...unit.int(c.hair),
    c.rank,
    c.title,
    1, 1,
    c.level,
    ...unit.short(c.statRemaining),
    ...unit.long(levelUp[c.level]),// maxExp
    ...unit.long(c.exp),// exp
    ...unit.int(c.loyalty),
    ...unit.int(c.loyaltyMonthly),
    ...unit.short(c.clan),
    c.fame,
    0, 0, 0, 0, 0, 0, 0, 0, 0xFF, 0xFF, 0, 0, 0, 0, // TODO: clan details
    2, 3, 4, 5, // unknown
    ...unit.short(v.maxHp || 0), ...unit.short(c.hp),
    ...unit.short(v.maxMp || 0), ...unit.short(c.mp),
    ...unit.int(v.maxWeight), ...unit.int(v.itemWeight),
    c.statStr, (v.statBonus[0] + v.statBuffBonus[0]),
    c.statHp, (v.statBonus[1] + v.statBuffBonus[1]),
    c.statDex, (v.statBonus[2] + v.statBuffBonus[2]),
    c.statInt, (v.statBonus[3] + v.statBuffBonus[3]),
    c.statMp, (v.statBonus[4] + v.statBuffBonus[4]),
    ...unit.short(v.totalHit), ...unit.short(v.totalAc),
    v.fireR, v.coldR, v.lightningR, v.magicR, v.curseR, v.poisonR,
    ...unit.int(c.money),
    c.gm ? 0 : 1, // 0=GM 1=USER
    0xFF, 0xFF,
    0, 0, 0, 0, 0, 0, 0, 0, 0, // TODO: skill
    ...items,
    socket.user.premium ? 1 : 0,
    0, // TODO: premium type
    0, 0, // TODO: premium time,
    0, // chicken flag
    0, 0, 0, 0, // TODO: manner point
    0, 0, 0, 0, 0, 0, // military camp
    0, 0, // genie time
    c.rebirth,
    0, 0, 0, 0, 0, // rebirth stats
    0, 0, 0, 0, 0, 0, 0, 0, // unknown
    0, 0, // cover title
    0, 0, // skill title
    1, 0, 0, 0, // return symbol //FIX: LATER
    0, 0
  ]);
}
