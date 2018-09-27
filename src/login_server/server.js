const config = require('config');
const server = require('../core/server');
const database = require('../core/database');
const connectRedis = require('../core/redis/connect');

const loadVersions = require('./utils/load_versions');
const opCodes = require('./utils/op_codes');


module.exports = async function () {
  console.log('login server is going to start...');
  let db = await database();
  await connectRedis();

  let versions = await loadVersions(db);
  let { version: serverVersion } = versions[0];

  console.log('looks like latest server version is ' + serverVersion);

  await server({
    ip: config.get('loginServer.ip'),
    ports: config.get('loginServer.ports'),
    timeout: 5000,
    debug: true,

    onData: async ({ socket, opcode, length, body }) => {
      if (!opCodes[opcode]) return socket.debug('unknown opcode!');

      await require('./ops/' + opCodes[opcode])({ socket, body, versions, length, opcode, db, serverVersion });
    }
  });
}
