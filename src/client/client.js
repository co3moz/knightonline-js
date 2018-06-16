const config = require('config');
const client = require('../core/client');
const unit = require('../core/utils/unit');
const hash = require('../core/utils/password_hash');
const errorCodes = require('../login_server/utils/error_codes');
const dbConnect = require('../core/database');

module.exports = async function () {
  let lcon;
  let gcon;
  let db;
  let data;
  let debug = true;

  try {
    db = await dbConnect();

    lcon = await client({
      ip: config.get('testClient.ip'),
      port: config.get('testClient.port') + (Math.random() * 9 >>> 0),
      debug,
      name: 'loginServer'
    });

    data = await lcon.sendAndWait([0x01, ...unit.short(1299)], 0x01);

    table({
      latestVersion: data.short()
    });


    data = await lcon.sendAndWait([0x02, ...unit.short(config.get('testClient.version'))], 0x02);

    let ftpAddress = data.string();
    let ftpRoot = data.string();
    let totalFiles = data.short();
    let files = [];
    for (var i = 0; i < totalFiles; i++) {
      files.push(data.string());
    }

    table({
      ftpAddress,
      ftpRoot
    });

    table(files, 'files');

    data = await lcon.sendAndWait([0xF3, ...unit.string(config.get('testClient.user')), ...unit.string(hash(config.get('testClient.password')))], 0xF3);
    data.skip(2);

    let resultCode = data.byte();
    let premiumHours = data.short();
    let accountName = data.string();

    table({
      accountName, resultCode: errorCodes[resultCode], premiumHours
    });

    if (resultCode != 1) return;

    /** TODO: ENCRYPTION */

    data = await lcon.sendAndWait([0xF6], 0xF6);

    table({
      header: data.string(),
      data: data.string()
    });

    data = await lcon.sendAndWait([0xF5, 1, 0], 0xF5);
    data.skip(2); // dummy 1, 0 

    let serverCount = data.byte();
    let servers = [];

    for (i = 0; i < serverCount; i++) {
      servers.push({
        ip: data.string(),
        lanip: data.string(),
        name: data.string(),
        onlineCount: data.short(),
        serverId: data.short(),
        groupId: data.short(),
        userPremiumLimit: data.short(),
        userFreeLimit: data.short(),
        unkwn: data.byte(),
        karusKing: data.string(),
        karusNotice: data.string(),
        elmoradKing: data.string(),
        elmoradNotice: data.string()
      });
    }
    table(servers, 'servers');


    lcon.terminate();
    lcon = null;

    gcon = await client({
      ip: servers[0].ip,
      port: 15001,
      debug,
      name: 'gameServer'
    });

    data = await gcon.sendAndWait([0x2B, 0xFF, 0xFF], 0x2B);
    data.skip(1);

    table({
      clientExeVersion: data.short(),
      cryption: data.skip(8),
      error: data.byte()
    });

    data = await gcon.sendAndWait([0x01, ...unit.string(config.get('testClient.user')), ...unit.string(hash(config.get('testClient.password')))], 0x01);

    table({
      nation: data.byte()
    });

    data = await gcon.sendAndWait([0x9F, 0x01], 0x9F);

    data = await gcon.sendAndWait([0x0C, 0x01], 0x0C);
    data.skip(2);

    let selectedChar;
    let characters = [];

    for (let i = 0; i < 4; i++) {
      let name = data.string();
      if (name.length == 0) {
        data.skip(10 + 6 * 8);
        continue;
      }

      selectedChar = name; // pick latest :D

      characters.push({
        name,
        race: data.byte(),
        klass: simplifyKlass(data.short()),
        level: data.byte(),
        face: data.byte(),
        hair: data.skip(4),
        zone: zones[data.byte()]
      });

      data.skip(6 * 8);
    }

    table(characters, 'chars');


    data = await gcon.sendAndWait([0x04, ...unit.string(config.get('testClient.user')), ...unit.string(selectedChar), 31], 0x04);
    data.skip(1); // 1


    gcon.sendWithHeaders([0x6A, 0x02]); // inventory data request, no need but we send it anyway
    gcon.sendWithHeaders([0x73, 0x02, 0x03, 0x02]); // rental thing, we dont expect anything again
    gcon.sendWithHeaders([0x72, 0x06, 0x29, 0xFA, 0xCE, 0x56, 0x02, 0, 0, 0]); // another request that we really do not know

    data = await gcon.sendAndWait([0x6B], 0x6B);
    data.skip(2); // short 1

    table({
      serverNo: data.short()
    });


    data = await gcon.sendAndWait([0x0D, 1, ...unit.byte_string(selectedChar)], 0x0D);

    data = await gcon.waitNextData(0x0E);
    let player = {}
    let items = [];

    player.socketId = data.short();
    player.name = data.byte_string();
    player.x = data.short() / 10;
    player.z = data.short() / 10;
    player.y = data.short() / 10;
    player.nation = data.byte() == 1 ? 'KARUS' : 'ELMORAD';
    player.race = data.byte();
    player.klass = simplifyKlass(data.short());
    player.face = data.byte();
    player.hair = data.skip(4);
    player.rank = data.byte();
    player.title = data.byte();
    data.skip(2);
    player.level = data.byte();
    player.remainingstat = data.short();
    player.need_exp = data.long();
    player.exp = data.long();
    player.np = data.int();
    player.npm = data.int();
    player.clanId = data.short();
    player.fame = data.byte();
    data.skip(14); // skip clan
    data.skip(4); // skip unknown
    player.maxhp = data.short();
    player.hp_ = data.short();
    player.maxmp = data.short();
    player.mp_ = data.short();
    player.maxweight = data.int();
    player.weight = data.int();
    player.str = `${data.byte()}+${data.byte()}`;
    player.hp = `${data.byte()}+${data.byte()}`;
    player.dex = `${data.byte()}+${data.byte()}`;
    player.int = `${data.byte()}+${data.byte()}`;
    player.mp = `${data.byte()}+${data.byte()}`;
    player.ap = data.short();
    player.ac = data.short();
    player.resistance = `f: ${data.byte()} co: ${data.byte()} l: ${data.byte()} m: ${data.byte()} cu: ${data.byte()} p: ${data.byte()}`;
    player.money = data.int();
    player.gm = data.byte() == 0
    data.skip(2);
    player.skill = data.skip(9);

    for (let i = 0; i < 75; i++) {
      let itemId = data.int();
      let durability = data.short();
      let amount = data.short();
      let flag = data.byte();
      let rentalTime = data.short();
      data.skip(4);
      let expr = data.int();

      if (itemId) {
        let item = await db.models.Item.findOne({ id: itemId }).exec();
        items.push({
          location: itemLoc[i] ? itemLoc[i] : i,
          name: item ? item.name : itemId,
          durability,
          amount,
          flag,
          rentalTime,
          expr
        });
      }
    }

    player.premium = !!data.byte();
    player.premium_type = data.byte();
    player.premium_time = data.short();
    player.camp = data.skip(6);
    player.genie = data.short();
    player.rebirth = `level ${data.short()} str: ${data.byte()} hp: ${data.byte()} dex: ${data.byte()} int: ${data.byte()} mp: ${data.byte()}`;

    data.skip(8); // ??
    player.coverTitle = data.short();
    player.skillTitle = data.short();
    player.returnStatus = data.int();


    table(player);
    table(items, 'items');


    data = await gcon.waitNextData(0x5E);
    data.skip(1); // byte(1) fixed
    table({
      canTradeWithOtherNation: !!data.byte(),
      zoneType: data.byte(),
      canTalkToOtherNation: !!data.byte(),
      mapTariff: data.short()
    });

    data = await gcon.waitNextData(0x54);
    table({
      itemWeightChangedTo: data.int()
    });

    data = await gcon.waitNextData(0x71);
    table({
      accountStatus: data.byte(),
      premiumType: data.byte(),
      premiumTime: data.int()
    });

    data = await gcon.waitNextData(0x2E, 0x01); // notice

    let amount = data.byte();

    for (let i = 0; i < amount; i++) {
      table({
        [`${data.byte_string()} | n1`]: data.byte_string()
      })
    }


    data = await gcon.waitNextData(0x2E, 0x02); // notice 2

    amount = data.byte();

    for (let i = 0; i < amount; i++) {
      table({
        [`${data.string()} | n2`]: data.string()
      })
    }

    data = await gcon.waitNextData(0x13); // time

    table({
      year: data.short(),
      month: data.short(),
      day: data.short(),
      hour: data.short(),
      min: data.short()
    });

    data = await gcon.waitNextData(0x14); // weather

    table({
      weather: data.byte(),
      weather_amount: data.short(),
    });

    data = await gcon.waitNextData(0x64, 0x01); // quest 1

    amount = data.short();

    for (let i = 0; i < amount; i++) {
      table({
        [`q[${data.short()}]`]: data.byte()
      })
    }


    data = await gcon.sendAndWait([0x3C, 0x41], 0x3C, 0x41); // knights top 10 request
    data.skip(2); // short 0

    let knights = [[], []];
    for (let m = 0; m < 2; m++) {
      for (let i = 0; i < 5; i++) {
        knights[m].push({
          id: data.short(),
          name: data.string(),
          markVersion: data.short()
        });
        data.skip(2);
      }
    }


    table(knights[0], 'karus');
    table(knights[1], 'elmorad');

    data = await gcon.sendAndWait([0x49, 0x01], 0x49, 0x02); // friend list
    let friendCount = data.short();

    for (let i = 0; i < friendCount; i++) {
      table({
        [`friend [${data.string()}]`]: { sid: data.short(), status: data.byte() }
      })
    }

    gcon.sendWithHeaders([0x87, 0, 0]); // helmet data (0, 0) as hide data of (helmet, cospre)

    gcon.sendWithHeaders([0x3C, 0x22]); // request knight ally list

    data = await gcon.sendAndWait([0x79, 0x2], 0x79, 0x2); // request skill data
    let skillCount = data.short();
    let skills = [];
    for (let i = 0; i < skillCount; i++) {
      skills.push(data.int());
    }

    table({
      skills: skills
    });

    data = await gcon.sendAndWait([0x6A, 0x06, 0x01], 0x6A, 0x06); // request letter count
    data.skip(1); // 1

    table({
      unreadLetterCount: data.byte()
    });

    gcon.sendWithHeaders([0x0D, 0x02, ...unit.byte_string(selectedChar)]); // game start 0x02
    

    data = await gcon.sendAndWait([0x98, 0x1], 0x98, 0x1);
    data.skip(1); // 1

    table({
      zone: data.byte()
    })

    data.skip(1); // 0 

    let userList = [];
    let userCount = data.short();
    for (let i = 0; i < userCount; i++) {
      userList.push({
        name: data.byte_string(),
        nation: data.byte() == 1 ? 'KARUS' : 'ELMORAD',
        unk1: data.short(),
        x: data.short() / 10,
        z: data.short() / 10,
        clanId: data.short(),
        version: data.short(),
        flag: data.byte(),
        grade: data.byte(),
        unk2: data.short()
      });

      for (let field in userList[i]) {
        if(userList[i][field] == 0) {
          delete userList[i][field];
        }
      }
    }

    table(userList, 'user');

    gcon.sendWithHeaders([0x09, 0x00, 0x00]); // send direction as short(0)
    gcon.sendWithHeaders([
      0x06,
      ...unit.short(player.x * 10), ...unit.short(player.z * 10), ...unit.short(player.y * 10),
      0x00, 0x00, 0x00, // speed and echo thing
      ...unit.short(player.x * 10), ...unit.short(player.z * 10), ...unit.short(player.y * 10)]); // send movement
      

    await delay(5000);

    console.log(gcon.getWaitingSignals());

  } finally {
    if (lcon) {
      lcon.terminate();
    }
    if (gcon) {
      gcon.terminate();
    }

    if (db) {
      db.disconnect();
    }
  }
}

let itemLoc = {
  RIGHTEAR: 0,
  HEAD: 1,
  LEFTEAR: 2,
  NECK: 3,
  BREAST: 4,
  SHOULDER: 5,
  RIGHTHAND: 6,
  WAIST: 7,
  LEFTHAND: 8,
  RIGHTRING: 9,
  LEG: 10,
  LEFTRING: 11,
  GLOVE: 12,
  FOOT: 13
}

let zones = {
  ZONE_KARUS: 1,
  ZONE_ELMORAD: 2,
  ZONE_KARUS_ESLANT: 11,
  ZONE_ELMORAD_ESLANT: 12,
  ZONE_MORADON: 21,
  ZONE_DELOS: 30,
  ZONE_BIFROST: 31,
  ZONE_DESPERATION_ABYSS: 32,
  ZONE_HELL_ABYSS: 33,
  ZONE_DRAGON_CAVE: 34,
  ZONE_ARENA: 48,
  ZONE_ORC_ARENA: 51,
  ZONE_BLOOD_DON_ARENA: 52,
  ZONE_GOBLIN_ARENA: 53,
  ZONE_CAITHAROS_ARENA: 54,
  ZONE_FORGOTTEN_TEMPLE: 55,
  ZONE_MONSTER_SQUAD1: 81,
  ZONE_MONSTER_SQUAD2: 82,
  ZONE_MONSTER_SQUAD3: 83,

  ZONE_BATTLE: 61, // Napies Gorge
  ZONE_BATTLE2: 62, // Alseids Prairie
  ZONE_BATTLE3: 63, // Nieds Triangle
  ZONE_BATTLE4: 64, // Nereid's Island
  ZONE_BATTLE5: 65, // Zipang
  ZONE_BATTLE6: 66, // Oreads

  ZONE_NAPIES_GORDE: 61,
  ZONE_ALSEIDS_PRAIRIE: 62,
  ZONE_NIEDS_TRIANGLE: 63,
  ZONE_NEREIDSISLAND: 64,
  ZONE_ZIPANG: 65,
  ZONE_OREADS: 66,

  ZONE_SNOW_BATTLE: 69,
  ZONE_RONARK_LAND: 71,
  ZONE_ARDREAM: 72,
  ZONE_RONARK_LAND_BASE: 73,
  ZONE_KROWAZ_DOMINION: 75,
  ZONE_CLAN_WAR: 77,
  ZONE_NEW_RONARK_EVENT: 78,
  ZONE_BORDER_DEFENSE_WAR: 84,
  ZONE_CHAOS_DUNGEON: 85,
  ZONE_JURAD_MOUNTAIN: 87,
  ZONE_PRISON: 92,
  ZONE_ISILOON_ARENA: 93,
  ZONE_FELANKOR_ARENA: 94,
  ZONE_OLD_MORADON: 91
}

Object.keys(itemLoc).forEach(x => itemLoc[itemLoc[x]] = x);
Object.keys(zones).forEach(x => zones[zones[x]] = x);

function simplifyKlass(klass) {
  if (klass >= 100 && klass < 200) {
    klass -= 100;
  } else if (klass >= 200 && klass < 300) {
    klass -= 200;
  } else {
    return '(unknown class)';
  }

  if (klass == 1 || klass == 5 || klass == 6) {
    return 'warrior';
  }

  if (klass == 2 || klass == 7 || klass == 8) {
    return 'rogue';
  }

  if (klass == 3 || klass == 9 || klass == 10) {
    return 'magician';
  }

  if (klass == 4 || klass == 11 || klass == 12) {
    return 'priest';
  }

  if (klass == 5 || klass == 13 || klass == 14) {
    return 'kurian';
  }

  return '(unknown class)';
}

const table = function (data, name) {
  if (data.constructor == Array) {
    for (let key in data) {
      let header = (name + '.' + key).padStart(30);

      if (data[key].constructor == String) {
        console.log(header + ':  ' + keep(data[key]));
      } else {
        let m = data[key];
        var txt = '';
        for (let k in m) {
          txt += k + keep(m[k]) + ' ';
        }
        console.log(header + ':  ' + txt);
      }
    }
  } else {
    for (let key in data) {
      console.log(key.padStart(30) + ':  ' + keep(data[key]));
    }
  }
}

function keep(data) {
  if (data.constructor == String) {
    return `"${data}"`;
  }

  if (data.constructor == Array || data.constructor == Buffer) {
    return `[${data.map(x => x.toString(16).padStart(2, "0").toUpperCase()).join(' ')}]`;
  }

  if (data.constructor == Boolean) {
    return `${data}`;
  }

  return `(${data})`;
}

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))