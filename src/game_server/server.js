const config = require('config');
const server = require('../core/server');
const database = require('../core/database');
const connectRedis = require('../core/redis/connect');

const opCodes = require('./utils/op_codes');

module.exports = async function () {
  console.log('game server is going to start...');
  let db = await database();
  await connectRedis();

  let setItems = await loadSetItems(db); // find all

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

      if (!shared.characterMap) {
        shared.characterMap = {};
      }

      if (!shared.setItems) {
        shared.setItems = setItems;
      }

    },

    onDisconnect: (socket) => {
      let shared = socket.shared;

      if (socket.user && shared.userMap) {
        let userMap = shared.userMap;

        if (userMap[socket.user.accountName]) {
          delete userMap[socket.user.accountName];
        }
      }

      if (socket.character && shared.characterMap) {
        let characterMap = shared.characterMap;

        if (characterMap[socket.character.name]) {
          delete characterMap[socket.character.name];
        }
      }
    },

    onData: async ({ socket, opcode, length, body }) => {
      if (!opCodes[opcode]) return socket.debug('unknown opcode! 0x' + opcode.toString(16));


      // if (!socket.cryption || !socket.cryption.enabled) {
      //   // dont allow uncrypted messages 
      //   if (opCodes[opcode] != opCodes.VERSION_CHECK) return;
      // }

      // TODO: Dont allow if user didnt login

      await require('./ops/' + opCodes[opcode])({ socket, body, length, opcode, db });
    }
  });
}

async function loadSetItems(db) {
  return (await db.models.SetItem.find({}).exec()).reduce((obj, x) => {
    obj[x.id] = x.toJSON();
    delete obj[x.id].id;
    delete obj[x.id]._id;
    return obj;
  }, {})
}