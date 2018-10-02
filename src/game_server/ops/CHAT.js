const unit = require('../../core/utils/unit');

module.exports = async function ({ body, socket, opcode }) {
  let type = body.byte();
  let message = body.string();


  if (socket.character.gm && message[0] === '+') { // is message contain '+' sign and character has gm rights?
    let args = message.substring(1).split(' ');
    let command = args.shift();

    if (!GM_COMMANDS[command]) {
      return socket.send([
        opcode, MESSAGE_TYPES.GM, 0, 0, 0, 0, ...unit.string(`### ERROR: Invalid command "${command}" ###`, 'ascii')
      ]);
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
      return socket.send([
        opcode, MESSAGE_TYPES.GM, 0, 0, 0, 0, ...unit.string(`### ERROR: notice requires text! ###`, 'ascii')
      ]);
    }

    socket.shared.region.allSend(socket, [
      opcode, MESSAGE_TYPES.WAR_SYSTEM, 0, 0, 0, 0, ...unit.string(`### NOTICE: ${text} ###`, 'ascii')
    ]);
  },

  notice_chat: (args, socket, opcode) => {
    let text = args.join(' ');
    if (text.length == 0) {
      return socket.send([
        opcode, MESSAGE_TYPES.GM, 0, 0, 0, 0, ...unit.string(`### ERROR: notice_chat requires text! ###`, 'ascii')
      ]);
    }

    socket.shared.region.allSend(socket, [
      opcode, MESSAGE_TYPES.PUBLIC, 0, 0, 0, 0, ...unit.string(`### NOTICE: ${text} ###`, 'ascii')
    ]);
  },

  notice_pm: (args, socket, opcode) => {
    return socket.send([
      opcode, MESSAGE_TYPES.PRIVATE, 0, 0, 0, ...unit.byte_string('[SERVER]'), ...unit.string(args.join(' '), 'ascii')
    ]);
  },

  help: (args, socket, opcode) => {
    return socket.send([
      opcode, MESSAGE_TYPES.GM, 0, 0, 0, 0, ...unit.string(`### HELP: ${GM_COMMANDS_LIST.join(', ')} ###`, 'ascii')
    ]);
  }
}

const GM_COMMANDS_LIST = Object.keys(GM_COMMANDS);


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
