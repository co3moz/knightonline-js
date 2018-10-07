const unit = require('../../core/utils/unit');
const config = require('config');
const levelUp = config.get('gameServer.levelUp');
const { BREAST, LEG, HEAD, GLOVE, FOOT, SHOULDER, RIGHTHAND, LEFTHAND, CWING, CHELMET, CLEFT, CRIGHT, CTOP, FAIRY } = require('../var/item_slot');
const zoneRules = require('../var/zone_rules');

module.exports = async function ({ socket, opcode, body }) {
  let subOpCode = body.byte();

  if (socket.ingame) {
    return;
  }

  if (subOpCode == 1) {
    socket.shared.region.update(socket);

    quests(socket);
    notice(socket);
    time(socket);
    weather(socket);
    myInfo(socket);
    sendUserInOutData(socket); // temp data
    sendZoneAbility(socket);

    socket.send([
      opcode
    ]);
  } else if (subOpCode == 2) {
    socket.ingame = true;
  }
}

let notices = [
  ['KO-JS', 'Welcome to Knight Online Javascript Server']
];

let weather = socket => {
  socket.send([
    0x14, // WEATHER
    1, // rain
    0, // amount 0-100
    0
  ]);
}

let time = socket => {
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

let notice = socket => {
  let u = socket.user;
  let c = socket.character;

  let nation = u.nation;

  socket.send([
    0x2E,
    2,
    notices.length,
    ...[].concat(...notices.map(notice => [
      ...unit.string(notice[0]),
      ...unit.string(notice[1])
    ]))
  ]);

  socket.send([
    0x2E,
    1,
    notices.length,
    ...[].concat(...notices.map(notice => [
      ...unit.byte_string(notice[1] + ' ' + notice[1])
    ]))
  ]);

  socket.send([
    0x10, // CHAT
    5,
    nation,
    ...unit.short(socket.session & 0xFFFF),
    0,
    ...unit.string(`[SERVER] Server Time: ${new Date().toLocaleString('en-GB')}`)
  ]);

  socket.send([
    0x10, // CHAT
    5,
    nation,
    ...unit.short(socket.session & 0xFFFF),
    0,
    ...unit.string(`[SERVER] Welcome ${c.name}, ko-js is really working :)`)
  ]);
}

let quests = socket => {
  let quests = socket.character.quests;

  socket.send([
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
  let u = socket.user;
  let c = socket.character;
  let v = socket.variables;

  let nation = u.nation;

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

let sendZoneAbility = socket => {
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


let sendUserInOutData = socket => { // TODO: change this later
  let result = [0x16, 0, 0];

  let userCount = 0;
  for (let userSocket of socket.shared.region.query(socket)) {
    userCount++;
    let uu = userSocket.user;
    let uc = userSocket.character;
    result.push(0);
    result.push(...unit.short(userSocket.session));
    result.push(...unit.byte_string(uc.name));
    result.push(...unit.short(uu.nation));
    result.push(...unit.short(-1)); // clan Id
    result.push(0); // fame
    result.push(0, 0, 0, 0, 0, 0, 0, 0xFF, 0xFF, 0, 0, 0, 0, 0); // clan_details..
    result.push(uc.level);
    result.push(uc.race);
    result.push(...unit.short(uc.klass));
    result.push(...unit.short(uc.x * 10));
    result.push(...unit.short(uc.z * 10));
    result.push(...unit.short(uc.y * 10));
    result.push(uc.face);
    result.push(...unit.int(uc.hair));
    result.push(uc.hptype || 0);
    result.push(...unit.int(uc.abnormalType || 0));
    result.push(0); // need party
    result.push(uc.gm ? 0 : 1);
    result.push(0); // party leader?
    result.push(1); // invisibility state
    result.push(0); // teamcolor
    result.push(0); // helmet hiding
    result.push(0); // cospre hiding
    result.push(...unit.short(uc.direction));
    result.push(0); // chicken?
    result.push(uc.rank);
    result.push(1, 0);
    result.push(0, 0); // np rank

    for (let m of [BREAST, LEG, HEAD, GLOVE, FOOT, SHOULDER, RIGHTHAND, LEFTHAND, CWING, CHELMET, CLEFT, CRIGHT, CTOP, FAIRY]) {

      let item = uc.items[m];

      if (item) {
        result.push(...unit.int(item.id), ...unit.short(item.durability), item.flag);
      } else {
        result.push(0, 0, 0, 0, 0, 0, 0);
      }
    }

    result.push(uc.zone);
    result.push(0xFF, 0xFF, 0, 0, 0, 0, 0, 0, 0, 0/* genie */); //?
    result.push(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0); //?
  }

  result[1] = userCount & 0xFF;
  result[2] = userCount >>> 8;

  socket.sendCompressed(result);
}