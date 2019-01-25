
const unit = require('../../core/utils/unit');
const region = require('../region');
const { MESSAGE_TYPES, sendMessageToPlayer } = require('./sendChatMessage');
const { sendWarp } = require('./sendWarp');
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

  test: (args, socket) => {
    function showImaginaryClient(id) {
      socket.send([
        0x07,  // USER_IN_OUT
        1, 0, // show
        ...unit.short(id),
        ...require('./buildUserDetail')(socket)
      ]);
    }

    function hideImaginaryClient(id) {
      socket.send([
        0x07,  // USER_IN_OUT
        2, 0, // hide
        ...unit.short(id)
      ]);
    }


    for (let i = 10; i < 500; i++) {
      showImaginaryClient(i);
    }

    setTimeout(function () {
      for (let i = 10; i < 500; i++) {
        hideImaginaryClient(i);
      }
    }, 10000);

    sendMessageToPlayer(socket, 1, '[SERVER]', 'ok', undefined, -1);
  }
}

const GM_COMMANDS_LIST = exports.GM_COMMANDS_LIST = Object.keys(GM_COMMANDS);