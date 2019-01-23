const config = require('config');
const server = require('../core/server');
const database = require('../core/database');
const connectRedis = require('../core/redis/connect');

module.exports = async function () {
  console.log('game server is going to start...');
  let db = await database();
  await connectRedis();

  let setItems = await loadSetItems(db); // find all

  let shared = {};
  let userMap = shared.userMap = {};
  let characterMap = shared.characterMap = {};
  shared.setItems = setItems;
  shared.region = require('./region');

  await server({
    ip: config.get('gameServer.ip'),
    ports: config.get('gameServer.ports'),
    debug: true,
    timeout: 5000, // 5 second at start

    onConnect: socket => {
    },

    onDisconnect: (socket) => {
      if (socket.user) {
        if (userMap[socket.user.account]) {
          delete userMap[socket.user.account];
        }
      }

      if (socket.character) {
        shared.region.remove(socket);
        if (characterMap[socket.character.name]) {
          delete characterMap[socket.character.name];
        }
      }
    },

    onData: async ({ socket, opcode, length, body }) => {
      require.cache[require.resolve('./utils/op_codes')] = undefined;
      let opCodes = require('./utils/op_codes');
      if (!opCodes[opcode]) return socket.debug('unknown opcode! 0x' + (opcode ? opcode.toString(16).padStart(2, '0') : '00'));


      // if (!socket.cryption || !socket.cryption.enabled) {
      //   // dont allow uncrypted messages 
      //   if (opCodes[opcode] != opCodes.VERSION_CHECK) return;
      // }

      // TODO: Dont allow if user didnt login

      require.cache[require.resolve('./ops/' + opCodes[opcode])] = undefined;
      await require('./ops/' + opCodes[opcode])({ socket, body, length, opcode, db });
    }
  }, shared);
}

async function loadSetItems(db) {
  return (await db.models.SetItem.find({}).exec()).reduce((obj, x) => {
    obj[x.id] = x.toJSON();
    delete obj[x.id].id;
    delete obj[x.id]._id;
    return obj;
  }, {})
}