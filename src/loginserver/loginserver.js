const config = require('config');
const server = require('../core/server');
const unit = require('../core/unit');
const database = require('../core/database');

const getLatestVersions = require('./utils/getLatestVersions');
const crypt = require('./utils/crypt');

async function main() {
  console.log('login server is going to start...');
  let db = await database();

  let versions = await getLatestVersions(db);
  let { version: serverVersion } = versions[0];

  console.log('looks like latest server version is ' + serverVersion);

  await server({
    ip: config.get('loginServer.ip'),
    port: config.get('loginServer.port'),
    debug: true,

    sendWithHeaders: function (response) {
      console.log('OUT', [...unit.short(response.length), ...response].join(', '));
      this.writeb([0xAA, 0x55, ...unit.short(response.length), ...response, 0x55, 0xAA]);
    },

    onData: async (data, socket) => {
      if (data[0] != 0xAA || data[1] != 0x55) {
        socket.debug('invalid protocol begin');
        socket.end();
        return;
      }


      const length = unit.readShort(data, 2);
      const opcode = data[4];

      console.log('IN', Array.from(data).slice(2, 4 + length).join(', '));

      if (data[4 + length] != 0x55 || data[5 + length] != 0xAA) {
        socket.debug('invalid protocol end');
        socket.end();
        return;
      }

      if (opcode == 0x1) { //  VERSION_REQ
        let clientVersion = unit.readShort(data, 5);
        socket.debug(`server version: ${serverVersion}, client version: ${clientVersion}`);

        socket.sendWithHeaders([
          0x1,
          ...unit.short(serverVersion)
        ]);
        return;
      }

      if (opcode == 0x2) { // DOWNLOADINFO_REQ
        let downloadSet = [];
        let clientVersion = unit.readShort(data, 5);

        for (let version of versions) {
          if (version.version > clientVersion) {
            downloadSet.push(unit.string(version.fileName));
          }
        }

        socket.sendWithHeaders([
          0x2,
          ...unit.config('loginServer.ftp.host'),
          ...unit.config('loginServer.ftp.dir'),
          ...unit.short(downloadSet.length),
          ...[].concat(...downloadSet)
        ]);
        return;
      }

      if (opcode == 0xF2) { // CRYPTION
        if (!socket.cryption) {
          socket.cryption = crypt();
        }

        socket.sendWithHeaders([
          0xF2,
          ...socket.cryption.public
        ]);

        socket.cryption.enabled = true;
      }

      if (opcode == 0xF3) {
        let accountLength = unit.readShort(data, 5);
        let account = unit.readString(data, 7);
        
        let passwordLength = unit.readShort(data, 5 + accountLength);
        let password = unit.readString(data, 7 + accountLength);

        console.log('LOGIN', account, password);  
      }

    }
  });

}

main().catch(x => {
  console.error(x.stack);
  process.exit(1);
});