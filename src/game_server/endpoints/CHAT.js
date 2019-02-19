const { MESSAGE_TYPES, sendPlayerMessageToRegion, sendMessageToPlayerFromPlayer } = require('../functions/sendChatMessage');
delete require.cache[require.resolve('../functions/GMController')]
const { sendMessageToGM, GM_COMMANDS, GM_COMMANDS_HEADER } = require('../functions/GMController');
const region = require('../region');

module.exports = async function ({ body, socket, opcode }) {
  let type = body.byte();
  let message = body.string();

  if (socket.character.gm && type == 1 && message == '+') {
    return sendMessageToGM(socket, 'hello master, type help :)');
  }

  if ((type == 2 && socket.character.gm && socket.variables.chatTo == GM_COMMANDS_HEADER) ||
    (type == 1 && socket.character.gm && message[0] == '+')) {
    let args = (type == 1 ? message.substring(1) : message).split(' ');
    let command = args.shift();

    if (!GM_COMMANDS[command]) {
      return sendMessageToGM(socket, `ERROR: Invalid command "${command}"`);
    }

    return GM_COMMANDS[command](args, socket, opcode);
  }

  if (type == MESSAGE_TYPES.GENERAL) {
    if (message.length > 128) {
      message = message.substring(0, 128)
    }

    return sendPlayerMessageToRegion(socket, message);
  }

  if (type == MESSAGE_TYPES.PRIVATE) {
    if (!socket.variables.chatTo) {
      return;
    }

    let userRegionContainer = region.users[socket.variables.chatTo];

    if (!userRegionContainer) return;

    sendMessageToPlayerFromPlayer(userRegionContainer.socket, socket, MESSAGE_TYPES.PRIVATE, message); 
  }
}

