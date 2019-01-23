
const unit = require('../../core/utils/unit');
const region = require('../region');
const { MESSAGE_TYPES, sendMessageToPlayer } = require('./sendChatMessage');
const GM_COMMANDS_HEADER = exports.GM_COMMANDS_HEADER = '[GM CONTROLLER]';

const sendMessageToGM = exports.sendMessageToGM = (socket, message) => {
  sendMessageToPlayer(socket, MESSAGE_TYPES.SHOUT, GM_COMMANDS_HEADER, message);
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

  test: (args, socket) => {
    socket.send([
      0x35, 3, 3, ...unit.byte_string('admin')
    ])
  }
}

const GM_COMMANDS_LIST = exports.GM_COMMANDS_LIST = Object.keys(GM_COMMANDS);