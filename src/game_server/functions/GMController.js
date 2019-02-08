
const unit = require('../../core/utils/unit');
const region = require('../region');
const { MESSAGE_TYPES, sendMessageToPlayer } = require('./sendChatMessage');
const { sendWarp } = require('./sendWarp');
const sendRegionNPCShow = require('./sendRegionNPCShow');
const GM_COMMANDS_HEADER = exports.GM_COMMANDS_HEADER = '[GM CONTROLLER]';

const sendMessageToGM = exports.sendMessageToGM = (socket, message) => {
  sendMessageToPlayer(socket, MESSAGE_TYPES.PRIVATE, GM_COMMANDS_HEADER, message);
}

const GM_COMMANDS = exports.GM_COMMANDS = {
  notice: (args, socket, opcode) => {
    let text = args.join(' ');
    if (text.length == 0) {
      return sendMessageToGM(socket, `USAGE: notice text`);
    }

    region.allSend(socket, [
      opcode, MESSAGE_TYPES.WAR_SYSTEM, 0, 0, 0, 0, ...unit.string(`### NOTICE: ${text} ###`, 'ascii')
    ]);
  },

  chat: (args, socket, opcode) => {
    let text = args.join(' ');
    if (text.length == 0) {
      return sendMessageToGM(socket, `USAGE: chat text`);
    }

    region.allSend(socket, [
      opcode, MESSAGE_TYPES.PUBLIC, 0, 0, 0, 0, ...unit.string(`### NOTICE: ${text} ###`, 'ascii')
    ]);
  },

  pm: (args, socket, opcode) => {
    let text = args.join(' ');
    if (text.length == 0) {
      return sendMessageToGM(socket, `USAGE: pm text`);
    }

    let message = [
      opcode, MESSAGE_TYPES.PRIVATE, 0, 0, 0, ...unit.byte_string('[SERVER]'), ...unit.string(text, 'ascii')
    ];

    for (let s of region.query(socket, { all: true })) {
      message[2] = s.user.nation;
      s.send(message);
    }
  },

  count: (args, socket) => {
    sendMessageToGM(socket, `count: ${Object.keys(region.users).length}`);
  },

  near: (args, socket) => {
    for (let s of region.query(socket)) {
      sendMessageToGM(socket, s.character.name + ': ' + ((s.character.x * 10 >>> 0) / 10) + ' ' + ((s.character.z * 10 >>> 0) / 10));
    }
  },

  help: (args, socket) => {
    sendMessageToGM(socket, `HELP: ${GM_COMMANDS_LIST.join(', ')}`);
  },

  zone: (args, socket) => {
    let id = args.join(' ');
    if (id.length == 0) {
      return sendMessageToGM(socket, `USAGE: zone id`);
    }

    sendWarp(socket, +id);
  },

  npc: (args, socket) => {
    let name = args.join(' ');
    if (!name) {
      return sendMessageToGM(socket, `USAGE: npc name`);
    }

    const { Npc } = require('../../core/database').models;
    let promise;

    if (name.startsWith('!')) {
      promise = Npc.findOne({
        id: +name.substring(1)
      })
    } else {
      promise = Npc.findOne({
        name: new RegExp(name)
      })
    }

    promise.then(npc => {
      if (!npc) {
        throw new Error(`Unknown npc name! "${name}"`)
      }

      sendMessageToGM(socket, `Npc found! ${npc.name} id: ${npc.id}`);
    }).catch(e => {
      sendMessageToGM(socket, `ERROR: ${e.message}`);
    })
  },

  summon: (args, socket) => {
    let name = args.join(' ');
    if (!name) {
      return sendMessageToGM(socket, `USAGE: summon name`);
    }

    const { Npc } = require('../../core/database').models;
    let promise;

    if (name.startsWith('!')) {
      promise = Npc.findOne({
        id: +name.substring(1)
      })
    } else {
      promise = Npc.findOne({
        name: new RegExp(name)
      })
    }

    promise.then(npc => {
      if (!npc) {
        throw new Error(`Unknown npc name! "${name}"`)
      }

      const summon = require('../ai/summon');
      return summon(npc, {
        zone: socket.character.zone,
        leftX: socket.character.x,
        rightX: socket.character.x,
        topZ: socket.character.z,
        bottomZ: socket.character.z,
        direction: socket.character.direction,
      });
    }).then(regionNPC => {
      for (let userSocket of region.queryUsersByNpc(regionNPC)) {
        sendRegionNPCShow(userSocket, regionNPC);
      }


      sendMessageToGM(socket, `Summoned! "${regionNPC.npc.name}" uuid:${regionNPC.uuid}`);
    }).catch(e => {
      sendMessageToGM(socket, `ERROR: ${e.message}`);
    })

  }
}

const GM_COMMANDS_LIST = exports.GM_COMMANDS_LIST = Object.keys(GM_COMMANDS);