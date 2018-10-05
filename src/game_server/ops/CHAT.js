const unit = require('../../core/utils/unit');

module.exports = async function ({ body, socket, opcode }) {
  let type = body.byte();
  let message = body.string();

  if (socket.character.gm && type == 1 && message == '+') {
    return GM_SEND(socket, 'hello master, type help :)');
  }

  if ((type == 2 && socket.character.gm && socket.variables.chatTo == GM_COMMANDS_HEADER) ||
    (type == 1 && socket.character.gm && message[0] == '+')) {
    let args = (type == 1 ? message.substring(1) : message).split(' ');
    let command = args.shift();

    if (!GM_COMMANDS[command]) {
      return GM_SEND(socket, `ERROR: Invalid command "${command}"`);
    }

    return GM_COMMANDS[command](args, socket, opcode);
  }

  if (type == MESSAGE_TYPES.GENERAL) {
    if (message.length > 128) {
      message = message.substring(0, 128)
    }

    socket.shared.region.regionSend(socket, [
      opcode,
      type,
      socket.user.nation,
      ...unit.short(socket.session & 0xFFFF),
      ...unit.byte_string(socket.character.name),
      ...unit.string(message, 'ascii')
    ]);
  }

  if (type == MESSAGE_TYPES.PRIVATE) {
    if (!socket.variables.chatTo) {
      return;
    }

    let userSocket = socket.shared.region.users[socket.variables.chatTo];

    if (!userSocket) return;

    userSocket.socket.send([
      opcode,
      MESSAGE_TYPES.PRIVATE,
      socket.user.nation,
      ...unit.short(socket.session & 0xFFFF),
      ...unit.byte_string(socket.character.name),
      ...unit.string(message, 'ascii')
    ]);
  }
}

const GM_COMMANDS = {
  notice: (args, socket, opcode) => {
    let text = args.join(' ');
    if (text.length == 0) {
      return GM_SEND(socket, `USAGE: notice text`);
    }

    socket.shared.region.allSend(socket, [
      opcode, MESSAGE_TYPES.WAR_SYSTEM, 0, 0, 0, 0, ...unit.string(`### NOTICE: ${text} ###`, 'ascii')
    ]);
  },

  chat: (args, socket, opcode) => {
    let text = args.join(' ');
    if (text.length == 0) {
      return GM_SEND(socket, `USAGE: chat text`);
    }

    socket.shared.region.allSend(socket, [
      opcode, MESSAGE_TYPES.PUBLIC, 0, 0, 0, 0, ...unit.string(`### NOTICE: ${text} ###`, 'ascii')
    ]);
  },

  pm: (args, socket, opcode) => {
    let text = args.join(' ');
    if (text.length == 0) {
      return GM_SEND(socket, `USAGE: pm text`);
    }

    let message = [
      opcode, MESSAGE_TYPES.PRIVATE, 0, 0, 0, ...unit.byte_string('[SERVER]'), ...unit.string(text, 'ascii')
    ];

    for (let s of socket.shared.region.query(socket, { all: true })) {
      message[2] = s.user.nation;
      s.send(message);
    }
  },

  count: (args, socket) => {
    GM_SEND(socket, `count: ${Object.keys(socket.shared.region.users).length}`);
  },

  near: (args, socket) => {
    for (let s of socket.shared.region.query(socket)) {
      GM_SEND(socket, s.character.name + ': ' + ((s.character.x * 10 >>> 0) / 10) + ' ' + ((s.character.z * 10 >>> 0) / 10));
    }
  },

  help: (args, socket) => {
    GM_SEND(socket, `HELP: ${GM_COMMANDS_LIST.join(', ')}`);
  }
}

const GM_COMMANDS_HEADER = '[GM CONTROLLER]';
const GM_COMMANDS_LIST = Object.keys(GM_COMMANDS);
const GM_SEND = (socket, message) => {
  socket.send([
    0x10, MESSAGE_TYPES.PRIVATE, socket.user.nation, 0, 0,
    ...unit.byte_string(GM_COMMANDS_HEADER),
    ...unit.string(message, 'ascii')
  ]);
}

const MESSAGE_TYPES = {
  GENERAL: 1,
  PRIVATE: 2,
  PARTY: 3,
  FORCE: 4,
  SHOUT: 5,
  KNIGHTS: 6,
  PUBLIC: 7,
  WAR_SYSTEM: 8,
  PERMANENT: 9,
  END_PERMANENT: 10,
  MONUMENT_NOTICE: 11,
  GM: 12,
  COMMAND: 13,
  MERCHANT: 14,
  ALLIANCE: 15,
  ANNOUNCEMENT: 17,
  SEEKING_PARTY: 19,
  GM_INFO: 21,    // info window : "Level: 0, UserCount:16649" (NOTE: Think this is the missing overhead info (probably in form of a command (with args))
  COMMAND_PM: 22,    // Commander Chat PM??
  CLAN_NOTICE: 24,
  KROWAZ_NOTICE: 25,
  DEATH_NOTICE: 26,
  CHAOS_STONE_ENEMY_NOTICE: 27,    // The enemy has destroyed the Chaos stone something (Red text, middle of screen)
  CHAOS_STONE_NOTICE: 28,
  ANNOUNCEMENT_WHITE: 29,    // what's it used for?
  CHATROM: 33,
  NOAH_KNIGHTS: 34
}

module.exports.GM_COMMANDS_HEADER = GM_COMMANDS_HEADER;