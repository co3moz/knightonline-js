const config = require('config');
const server = require('../core/server');
const database = require('../core/database');
const connectRedis = require('../core/redis/connect');

const opCodes = require('./utils/op_codes');

module.exports = async function () {
  console.log('game server is going to start...');
  let db = await database();
  await connectRedis();

  await server({
    ip: config.get('gameServer.ip'),
    ports: config.get('gameServer.ports'),
    debug: true,
    timeout: 10 * 60 * 1000, // 10 mins

    onConnect: (socket) => {
      let shared = socket.shared;
      if (!shared.userMap) {
        shared.userMap = {};
      }
    },

    onDisconnect: (socket) => {
      let shared = socket.shared;

      if (socket.user && shared.userMap) {
        let userMap = shared.userMap;
        let account = userMap[socket.user.accountName];
        if (account) {
          delete userMap[socket.user.accountName];
        }
      }
    },

    onData: async ({ socket, opcode, length, body }) => {
      if (!opCodes[opcode]) return socket.debug('unknown opcode!');


      // if (!socket.cryption || !socket.cryption.enabled) {
      //   // dont allow uncrypted messages 
      //   if (opCodes[opcode] != opCodes.VERSION_CHECK) return;
      // }

      // TODO: Dont allow if user didnt login

      await require('./ops/' + opCodes[opcode])({ socket, body, length, opcode, db });
    }
  });
}
