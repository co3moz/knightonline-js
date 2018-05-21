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

    onData: async ({ socket, opcode, length, data }) => {
      if (!opCodes[opcode]) return socket.debug('unknown opcode!');

      await require('./ops/' + opCodes[opcode])({ socket, data, length, opcode, db });
    }
  });
}
