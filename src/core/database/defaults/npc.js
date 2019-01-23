const csvLoader = require('../utils/csv_loader');
const csvReader = require('../utils/csv_reader');

module.exports = async db => {
  let Npc = db.models.Npc;
  if (await Npc.findOne({}).exec()) {
    return false;
  }

  let npcs = await csvReader({
    file: 'npc',
    expected: 939,
    transfer: {
      sSid: "id",
      strName: "name",
      sPid: "pid",
      sSize: "size",
      iWeapon1: "weapon1",
      iWeapon2: "weapon2",
      byGroup: "group",
      byActType: "actType",
      byType: "type",
      byFamily: "family",
      byRank: "rank",
      byTitle: "title",
      iSellingGroup: "sellingGroup",
      sLevel: "level",
      iExp: "exp",
      iLoyalty: "loyalty",
      iHpPoint: "hp",
      sMpPoint: "mp",
      sAtk: "attack",
      sAc: "ac",
      sHitRate: "hitRate",
      sEvadeRate: "evadeRate",
      sDamage: "damage",
      sAttackDelay: "attackDelay",
      bySpeed1: "speed1",
      bySpeed2: "speed2",
      sStandtime: "standtime",
      iMagic1: "magic1",
      iMagic2: "magic2",
      iMagic3: "magic3",
      sFireR: "fireR",
      sColdR: "coldR",
      sLightningR: "lightningR",
      sMagicR: "magicR",
      sDiseaseR: "diseaseR",
      sPoisonR: "poisonR",
      sBulk: "bulk",
      byAttackRange: "attackRange",
      bySearchRange: "searchRange",
      byTracingRange: "tracingRange",
      iMoney: "money",
      sItem: "item",
      byDirectAttack: "directAttack",
      byMagicAttack: "magicAttack",
      sSpeed: "speed"
    },
    db
  });

  let pos = await csvReader({
    file: 'npc_monster_pos',
    expected: 4647,
    transfer: {
      ZoneID: 'zone',
      NpcID: 'npc',
      ActType: 'actType',
      RegenType: 'regenType',
      DungeonFamily: 'dungeonFamily',
      SpecialType: 'specialType',
      TrapNumber: 'trap',
      LeftX: 'leftX',
      TopZ: 'topZ',
      RightX: 'rightX',
      BottomZ: 'bottomZ',
      LimitMinX: 'minx',
      LimitMinZ: 'minz',
      LimitMaxX: 'maxx',
      LimitMaxZ: 'maxz',
      NumNPC: 'amount',
      RegTime: 'respawnTime',
      byDirection: 'direction',
      DotCnt: 'dot'
    },
    db
  });

  let grouped = groupBy(pos);

  for (let npc of npcs) {
    if (grouped[npc.id]) {
      npc.spawn = grouped[npc.id];
    } else {
      npc.spawn = [];
    }
  }


  try {
    let total = npcs.length;
    let sent = 0;
    while (npcs.length) {
      let arr = npcs.splice(0, 100);
      sent += arr.length;
      await Npc.insertMany(arr);
      console.log('npc patch sent %d status: %f %', sent, parseInt(sent / total * 1000) / 10);
    }
  } catch (e) {
    console.error('error ocurred on inserting npc!');
    throw e;
  }

}

function groupBy(array) {
  let data = {};

  for (let item of array) {
    let npc = item.npc;
    delete item.npc;

    if (data[npc]) {
      data[npc].push(item)
    } else {
      data[npc] = [item];
    }
  }

  return data;
}