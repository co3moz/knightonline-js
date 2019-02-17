import * as config from 'config'
import * as mongoose from 'mongoose'
import { ClientFactory, IClientSocket } from '../core/client'
import { short, string, byte_string } from '../core/utils/unit'
import PasswordHash from '../core/utils/password_hash'
import OPCodes from '../game_server/utils/op_codes'
import { AuthenticationCode } from '../login_server/endpoints/LOGIN_REQ'
import Database from '../core/database'

export default async function Client() {
  let loginConnection: IClientSocket;
  let gameConnection: IClientSocket;
  let dbConnection: mongoose.Connection;
  let data: any;
  let debug = false;
  let loadItems = false;


  try {
    console.log('loading test client for testing ko-js');
    console.break();
    table({
      debug,
      loadItems
    });
    console.break();

    if (loadItems) {
      console.log('connecting to db...');
      dbConnection = await Database();
      console.log('connected to db');
      console.break();
    }


    console.log('connecting to login server...');
    loginConnection = await ClientFactory({
      ip: config.get('testClient.ip'),
      port: (<number>config.get('testClient.port')) + (Math.random() * 9 >>> 0),
      debug,
      name: 'loginServer'
    });
    console.log('connected to login server!');
    console.break();

    data = await loginConnection.sendAndWait([0x01, ...short(1299)], 0x01);

    table({
      latestVersion: data.short()
    });


    data = await loginConnection.sendAndWait([0x02, ...short(config.get('testClient.version'))], 0x02);

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

    data = await loginConnection.sendAndWait([0xF3, ...string(config.get('testClient.user')), ...string(PasswordHash(config.get('testClient.password')))], 0xF3);
    data.skip(2);

    let resultCode = data.byte();
    let premiumHours = data.short();
    let sessionCode = data.string();

    table({
      sessionCode, resultCode: AuthenticationCode[resultCode], premiumHours
    });

    if (resultCode != 1) return;

    /** TODO: ENCRYPTION */

    data = await loginConnection.sendAndWait([0xF6], 0xF6);

    table({
      header: data.string(),
      data: data.string()
    });

    data = await loginConnection.sendAndWait([0xF5, 1, 0], 0xF5);
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


    loginConnection.terminate();
    loginConnection = null;

    let pickedConfig = config.get('testClient.server');
    let picked = servers.filter(x => x.name == pickedConfig);

    console.log('connecting to game server...' + picked[0].name);
    gameConnection = await ClientFactory({
      ip: picked[0].ip,
      port: 15001,
      debug,
      name: 'gameServer'
    });
    console.log('connected to game server!');
    console.break();

    // data = await gcon.sendAndWait([opCodes._INTERNAL_QUERY, ...crypto.createHmac('sha1', config.get('gameServer.internalCommunicationSecret')).update(Buffer.from([0x01])).digest(), ...[0x01]], opCodes._INTERNAL_QUERY);
    // table({
    //   _internal_query_opcode: data.byte(),
    //   _internal_query_userCount: data.short()
    // })

    // await delay(1000);

    data = await gameConnection.sendAndWait([0x2B, 0xFF, 0xFF], 0x2B);
    data.skip(1);

    table({
      clientExeVersion: data.short(),
      cryption: data.skip(8),
      error: data.byte()
    });

    data = await gameConnection.sendAndWait([0x01, ...string(sessionCode), ...string(PasswordHash(config.get('testClient.password')))], 0x01);

    table({
      nation: data.byte()
    });

    data = await gameConnection.sendAndWait([0x9F, 0x01], 0x9F);

    data = await gameConnection.sendAndWait([0x0C, 0x01], 0x0C);
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


    data = await gameConnection.sendAndWait([0x04, ...string(sessionCode), ...string(selectedChar), 31], 0x04);
    data.skip(1); // 1


    gameConnection.send([0x6A, 0x02]); // inventory data request, no need but we send it anyway
    gameConnection.send([0x73, 0x02, 0x03, 0x02]); // rental thing, we dont expect anything again
    gameConnection.send([0x72, 0x06, 0x29, 0xFA, 0xCE, 0x56, 0x02, 0, 0, 0]); // another request that we really do not know

    data = await gameConnection.sendAndWait([0x6B], 0x6B);
    data.skip(2); // short 1

    table({
      serverNo: data.short()
    });


    data = await gameConnection.sendAndWait([0x0D, 1, ...byte_string(selectedChar)], 0x0D);

    data = await gameConnection.waitNextData(0x0E);

    let player: Dictionary<any> = {}
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
        let item;
        if (loadItems) {
          item = await dbConnection.models.Item.findOne({ id: itemId }).exec();
        }

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

    data = await gameConnection.waitNextData(0x64, 0x01); // quest 1

    let amount = data.short();

    for (let i = 0; i < amount; i++) {
      table({
        [`q[${data.short()}]`]: data.byte()
      })
    }


    data = await gameConnection.sendAndWait([0x3C, 0x41], 0x3C, 0x41); // knights top 10 request
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

    gameConnection.send([0x49, 0x01]); // friend list
    gameConnection.send([0x87, 0, 0]); // helmet data (0, 0) as hide data of (helmet, cospre)
    gameConnection.send([0x3C, 0x22]); // request knight ally list
    gameConnection.send([0x79, 0x2]); // request skill data
    gameConnection.send([0x6A, 0x06, 0x01]); // request letter count
    gameConnection.send([0x0D, 0x02, ...byte_string(selectedChar)]); // game start 0x02

    // await delay(1000);

    data = await gameConnection.sendAndWait([0x98, 0x1], 0x98, 0x1);
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
        flag: data.byte(),
        grade: data.byte(),
        version: data.short(),
        unk2: data.short()
      });
    }

    table(userList, 'user');

    gameConnection.send([0x09, 0x00, 0x00]); // send direction as short(0)


    setTimeout(function () {
      gameConnection.send([
        0x06,
        ...short(player.x * 10 - 500), ...short(player.z * 10), ...short(player.y * 10),
        0x00, 0x00, 0x00, // speed and echo thing
        ...short(player.x * 10 - 500), ...short(player.z * 10), ...short(player.y * 10)
      ]); // send movement
    }, 5000);

    // setTimeout(function () {
    //   gcon.send([0x29, 0x01, 0x02, 0x00, 0x00, 0x00, 0x00, 0x00]); // zone home
    // }, 5000);

    let d = 0;
    setInterval(function () {
      d += 5;
      gameConnection.send([0x09, ...short(d % 500)]);
    }, 60000)

    while (gameConnection.connected) {
      data = await gameConnection.waitNextData(); // get next waiting
      let opcode = data.byte();

      if (opcode == 0x15) {
        let subOpcode = data.byte();

        if (subOpcode == 1) {
          let userCount = data.short();
          let userIds = [];

          for (let i = 0; i < userCount; i++) {
            userIds.push(data.short());
          }

          table({
            userInRegion: userIds
          })

          gameConnection.send([ // ASK FOR MORE INFO
            0x16,
            ...short(userIds.length),
            ...[].concat(...userIds.map(x => short(x)))
          ]);
        } else if (subOpcode == 0) {
          table({
            userInRegion: 'reset'
          });
        } else if (subOpcode == 2) {
          table({
            userInRegion: 'end'
          });
        }
      } else if (opcode == OPCodes.CHAT) { // chat
        let message = {
          op: 'chat',
          type: data.byte(),
          nation: data.byte() == 1 ? 'KARUS' : 'ELMORAD',
          session: data.short(),
          name: data.byte_string(),
          message: data.string('ascii')
        };
        table(message);

        if (message.type == 2) { // private message
          let op35 = await gameConnection.sendAndWait([OPCodes.CHAT_TARGET, 0x01, ...string(message.name)], 0x35, 0x01);
          let canI = op35.short();
          if (canI == 0) {
            console.log('Cannot echo chat, because user is not seem online');
            console.break();
          } else if (canI == 0xFF) {
            console.log('Cannot echo chat, because user blocked private messages');
            console.break();
          } else {
            gameConnection.send([OPCodes.CHAT, message.type, ...string(message.message, 'ascii')])
            console.log('Echo sent to ' + message.name);
            console.break();
          }
        }
      } else if (opcode == 0x2E) { // notice

        let subOpcode = data.byte();
        if (subOpcode == 1) {
          let amount = data.byte();

          for (let i = 0; i < amount; i++) {
            table({
              [`notice#1 ${data.byte_string()}`]: data.byte_string()
            })
          }
        } else if (subOpcode == 2) {
          let amount = data.byte();

          for (let i = 0; i < amount; i++) {
            table({
              [`notice#2 ${data.string()}`]: data.string()
            })
          }
        }
      } else if (opcode == 0x6A) { // letter system
        let subOpcode = data.byte();

        if (subOpcode == 0x06) { // count
          data.skip(1); // 1

          table({
            unreadLetterCount: data.byte()
          });
        }

      } else if (opcode == 0x79) { // skill
        let subOpcode = data.byte();

        if (subOpcode == 2) { // skill data
          let skillCount = data.short();
          let skills = [];
          for (let i = 0; i < skillCount; i++) {
            skills.push(data.int());
          }

          table({
            skills: skills
          });
        }
      } else if (opcode == 0x49) { // friend stuff
        let subOpcode = data.byte();

        if (subOpcode == 2) { // friend list
          let friendCount = data.short();

          for (let i = 0; i < friendCount; i++) {
            table({
              [`friend [${data.string()}]`]: { sid: data.short(), status: data.byte() }
            })
          }
        }
      } else if (opcode == 0x64) { // quest data
        let subOpcode = data.byte();

        if (subOpcode == 1) {
          let amount = data.short();

          for (let i = 0; i < amount; i++) {
            table({
              [`quest#1 [${data.short()}]`]: data.byte()
            })
          }
        }
      } else if (opcode == 0x14) { // weather data
        table({
          weather: [data.byte(), data.short()]
        });
      } else if (opcode == 0x13) { // time data
        table({
          time: [data.short(), data.short(), data.short(), data.short(), data.short()]
        });
      } else if (opcode == 0x71) { // premium shit
        table({
          accountStatus: data.byte(),
          premiumType: data.byte(),
          premiumTime: data.int()
        });
      } else if (opcode == 0x5E) { // tariff change
        data.skip(1); // byte(1) fixed
        table({
          canTradeWithOtherNation: !!data.byte(),
          zoneType: data.byte(),
          canTalkToOtherNation: !!data.byte(),
          mapTariff: data.short()
        });
      } else if (opcode == 0x54) { // weight change
        table({
          itemWeightChangedTo: data.int()
        });
      } else if (opcode == 0x1C) { // NPCs IN RANGE
        let npcCount = data.short();
        let npcInRegion = [];

        for (let i = 0; i < npcCount; i++) {
          npcInRegion.push(data.short());
        }

        table({
          npcInRegion: npcInRegion
        });

        gameConnection.send([ // ASK FOR MORE INFO
          0x1D,
          ...short(npcInRegion.length),
          ...[].concat(...npcInRegion.map(x => short(x)))
        ]);
      } else if (opcode == 0x1D) { // NPC MORE INFO COMING
        let npcCount = data.short();
        let npcs = [];

        for (let i = 0; i < npcCount; i++) {
          npcs.push({
            id: data.short(),
            sid: data.short(),
            isMonster: data.byte() == 1 ? 'true' : 'false',
            pid: data.short(),
            sellingGroup: data.int(),
            type: data.byte(),
            unk: data.int(),
            size: data.short(),
            weapon1: data.int(),
            weapon2: data.int(),
            nation: data.byte(),
            level: data.byte(),
            x: data.short(),
            z: data.short(),
            y: data.short(),
            state: data.int(),
            oType: data.byte(),
            unk2: data.short(),
            unk3: data.short(),
            direction: data.short(),
          });
        }

        table(npcs, 'INCOMING_NPC_INFO');
      } else if (opcode == 0xA) { // NPC IN_OUT
        let type = data.byte();
        let id = data.short();

        if (type == 1) {
          table({
            npcIn: id,
            pid: data.short(),
            isMonster: data.byte() == 1 ? 'true' : 'false',
            sid: data.short(),
            sellingGroup: data.int(),
            type: data.byte(),
            unk: data.int(),
            size: data.short(),
            weapon1: data.int(),
            weapon2: data.int(),
            nation: data.byte(),
            level: data.byte(),
            x: data.short(),
            z: data.short(),
            y: data.short(),
            state: data.int(),
            oType: data.byte(),
            unk2: data.short(),
            unk3: data.short(),
            direction: data.short(),
          });
        } else if (type == 2) {
          table({
            npcOut: id
          });
        }
      } else if (opcode == 0xB) { // NPC MOVE
        /*data.byte();

        table({
          id: data.short(),
          x: data.short(),
          z: data.short(),
          y: data.short(),
          speed: data.short()
        });*/
      } else if (opcode == 0x6) { // User MOVE
        let move = [data.short(), data.short(), data.short(), data.short(), data.short()];
        data.byte();
        move.push(data.short(), data.short(), data.short());

        table({
          move
        });
      } else if (opcode == 0x9) { // User Rotate
        table({
          rotate: [data.short(), data.short()]
        });
      } else if (opcode == 0x7) { // User INOUT
        let type = data.short();
        let id = data.short();

        if (type == 2) {
          table({
            type: 'out of view',
            id
          }, 'USER_INOUT');
        } else {
          table({
            type,
            id,
            details: data.array()
          }, 'USER_INOUT');
        }
      } else if (opcode == 0x81) {
        table({
          story: data.skip(6)
        });
      } else if (opcode == 0x29) {
        let session = data.short();
        let type = data.byte();
        let value = data.int();

        if (type == 1) {
          if (value == 1) {
            table({
              standUp: [session]
            });
          } else if (value == 2) {
            table({
              sitdown: [session]
            });
          }
        } else if (type == 3) {
          let z = 'unknown';
          if (value == 1) z = 'normal';
          else if (value == 2) z = 'giant';
          else if (value == 3) z = 'dwarf';
          else if (value == 4) z = 'blinking';
          else if (value == 6) z = 'giant_target';

          table({
            abnormalChange: [session, z]
          });
        }

      } else if (opcode == 0x16) {
        let userCount = data.short();
        let users = [];

        for (let i = 0; i < userCount; i++) {
          let user: Dictionary<any> = {};

          data.byte();
          user.session = data.short();
          user.name = data.byte_string();
          user.nation = data.short();
          user.clanId = data.short();
          user.fame = data.byte();

          data.skip(15);

          user.level = data.byte();
          user.race = data.byte();
          user.klass = data.short();
          user.x = data.short();
          user.z = data.short();
          user.y = data.short();
          user.face = data.byte();
          user.hair = data.int();
          user.hpType = data.byte();
          user.abnormalType = data.int();
          user.needParty = data.byte();
          user.normalUser = data.byte();
          user.partyLeader = data.byte();
          user.invisibilityState = data.byte();
          user.teamColor = data.byte();
          user.helmet = data.byte();
          user.cospre = data.byte();
          user.direction = data.short();
          user.chicken = data.byte();
          user.rank = data.byte();

          user.items = data.skip(4 + 7 * 15);

          user.zone = data.byte();

          data.skip(21)

          users.push(user);
        }

        table(users, 'INCOMING_USER');
      } else {
        console.log('Unhandled opcode has arrived! (0x' + opcode.toString(16) + ') body: ' + data.array().map(x => (x < 16 ? '0' : '') + x.toString(16).toUpperCase()).join(' '));
      }

    }

    console.log('END!')

    console.log(gameConnection.getWaitingSignals());

  } finally {
    if (loginConnection) {
      loginConnection.terminate();
    }
    if (gameConnection) {
      gameConnection.terminate();
    }

    if (dbConnection) {
      dbConnection.close();
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

const table = function (data: any[] | object, name?: string) {
  if (data instanceof Array) {
    console.log(name + ' len:' + data.length);
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
      console.log(((name ? name + '::' : '') + key).padStart(30) + ':  ' + keep(data[key]));
    }
  }

  console.break();
}

function keep(data) {
  if (data == undefined) return 'undefined';
  if (data.constructor == String) {
    return `"${data}"`;
  }

  if (data.constructor == Array || data.constructor == Buffer) {
    return `[${data.join(' ')}]`;
  }

  if (data.constructor == Boolean) {
    return `${data}`;
  }

  return `(${data})`;
}

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

console.break = () => console.log('-'.repeat(50));

declare global {
  interface Console {
    break: () => void
  }
}

interface Dictionary<T> {
  [key: string]: T
}