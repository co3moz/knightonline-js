const unit = require('../../core/utils/unit');
const config = require('config');
const levelUp = config.get('gameServer.levelUp');

module.exports = async function ({ socket, opcode, body }) {
  let subOpCode = body.byte();

  if (subOpCode == 1) {
    quests(socket);
    myInfo(socket);
    sendTempOtherUserData(socket); // temp data

    socket.sendWithHeaders([
      opcode
    ]);
  }
}

let quests = socket => {
  let quests = socket.character.quests;

  socket.sendWithHeaders([
    0x64, // QUEST
    1,
    ...unit.short(quests.length),
    ...[].concat(...quests.map(quest => [
      ...unit.short(quest.id),
      quest.state
    ]))
  ]);
}

let myInfo = socket => {
  let c = socket.character;
  let v = socket.variables;

  let items = [];

  for (let i = 0; i < 75; i++) {
    let item = c.items[i];

    if (i == 48) {
      item = c.items[49];
    } else if (i == 49) {
      item = c.items[48];
    }

    if (item) {
      items.push(
        ...unit.int(item.id),
        ...unit.short(item.durability),
        ...unit.short(item.amount),
        item.flag,
        0, 0, // rental time,
        0, 0, 0, 0, // unknown
        0, 0, 0, 0 // unix expiration time
      );
    } else {
      items.push(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
    }
  }

  socket.sendWithHeaders([
    0x0E, // MYINFO
    ...unit.short(socket.session & 0xFFFF),
    ...unit.byte_string(c.name),
    ...unit.short(c.x * 10),
    ...unit.short(c.z * 10),
    ...unit.short(c.y * 10),
    c.nation == 'KARUS' ? 1 : 2,
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
    0, 0, 0, 0, 0, 0, 0, 0 // unknown
  ]);
}

let sendZoneAbility = socket => {
  // TODO: load zone abilities
  socket.sendWithHeaders([
    0x5E, // ZONEABILITY
    1,
    1, // trade with other nation
    0, // no pvp, no attack to other nation (fix here later this is for moradon)
    ...unit.short(20) // tariff
  ]);
}


let sendTempOtherUserData = socket => { // TODO: change this later
  let c = socket.character;
  let v = socket.variables;

  // TODO: load zone abilities
  socket.sendWithHeaders([
    0x16, // REQ_USERIN
    1, 0, // user count
    0,
    99, 0, // session id
    ...unit.byte_string('dummy_char'),
    1, 0, // karus
    0xFF, 0xFF, // clan id
    0, //fame
    0, 0, 0, 0, 0, 0, 0, 0xFF, 0xFF, 0, 0, 0, 0, 0, // clan details
    31, // level
    2, // race
    ...unit.short(102), // klass
    ...unit.short(8170), ...unit.short(4350), 0, 0, // x z y
    0, 0, 0, 0, 0, // face and hair data
    1, // standing
    1, 0, 0, 0, //  user state (giant / dwarf vs)
    1, // need party 
    1, // GM OR USER
    0, // party leader
    0, // visibility state
    0, // team color (1 blue 2 red)
    0, // is helmet hiding
    0, // is cospre hiding
    0, 0, // direction
    0, 0, 0, // unknown
    0, // chicken thing
    0, // rank
    0, 0, // np rank shit,

    ...Array(7 /* byte */ * 14 /* item */).fill(0), // item data
    21, // zone id
    0xFF, 0xFF, 0, 0, 0, 0, 0, 0, 1, //unknown shit
    0 // is genie active
  ]);
}