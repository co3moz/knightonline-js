const config = require('config');
const server = require('../core/server');
const database = require('../core/database');
const connectRedis = require('../core/redis/connect');
const AI = require('./ai');

module.exports = async function () {
  console.log('game server is going to start...');
  let db = await database();

  console.log('redis connection...');
  await connectRedis();

  let setItems = await loadSetItems(db); // find all

  let shared = require('./shared');
  let region = require('./region');
  let userMap = shared.userMap;
  let characterMap = shared.characterMap;
  shared.setItems = setItems;
  region.setOnChange(require('./functions/onRegionUpdate'));
  region.setOnExit(require('./functions/onUserExit'));

  await AI(db, region);

  let serverInstances = await server({
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
        region.exit(socket);
        if (characterMap[socket.character.name]) {
          delete characterMap[socket.character.name];
        }
      }
    },

    onData: async ({ socket, opcode, length, body }) => {
      require.cache[require.resolve('./utils/op_codes')] = undefined;
      let opCodes = require('./utils/op_codes');

      if (!opCodes[opcode]) {
        return console.log('[SERVER] Unknown opcode received! (0x' + (opcode ? opcode.toString(16).padStart(2, '0') : '00') + ') | ' + body.array().map(x => (x < 16 ? '0' : '') + x.toString(16).toUpperCase()).join(' '));
      }

      // if (!socket.cryption || !socket.cryption.enabled) {
      //   // dont allow uncrypted messages 
      //   if (opCodes[opcode] != opCodes.VERSION_CHECK) return;
      // }

      // TODO: Dont allow if user didnt login

      require.cache[require.resolve('./ops/' + opCodes[opcode])] = undefined;
      await require('./ops/' + opCodes[opcode])({ socket, body, length, opcode, db });
    }
  });

  
}

async function loadSetItems(db) {
  let obj = {};
  let setItems = await db.models.SetItem.find({}).select(['-id', '-_id']).exec();

  for (let setItem of setItems) {
    obj[setItem.id] = setItem.toJSON();
  }

  return obj;
}