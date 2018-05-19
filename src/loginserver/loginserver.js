const config = require('config');
const server = require('../core/server');
const unit = require('../core/unit');
const database = require('../core/database');

const getLatestVersions = require('./utils/getLatestVersions');
const crypt = require('./utils/crypt');
const errorCodes = require('./utils/errorCodes');


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

        downloadSet.reverse(); // VERSION DESC => ASC

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

        /*socket.sendWithHeaders([
          0xF2,
          ...socket.cryption.public
        ]);*/

        socket.sendWithHeaders([
          0xF2,
          0, 0, 0, 0, 0, 0, 0, 0
        ]);

        socket.cryption.enabled = true;
      }

      if (opcode == 0xF3) {
        let accountLength = unit.readShort(data, 5);
        let accountName = unit.readString(data, 7, accountLength);

        let passwordLength = unit.readShort(data, 7 + accountLength);
        let password = unit.readString(data, 9 + accountLength);

        console.log(accountName, password);

        var resultCode = 0;
        let account;

        if (accountLength > 20 || passwordLength > 28) {
          resultCode = errorCodes.AUTH_INVALID;
        } else {
          try {
            let { Account } = db.models;

            account = await Account.findOne({
              account: accountName
            }).exec();

            if (!account) {
              resultCode = errorCodes.AUTH_NOT_FOUND;
            } else {
              if (account.password == password) {
                if (account.banned) {
                  resultCode = errorCodes.AUTH_BANNED;
                } else {
                  resultCode = errorCodes.AUTH_SUCCESS;
                }
              } else {
                resultCode = errorCodes.AUTH_INVALID;
              }

            }
          } catch (e) {
            resultCode = errorCodes.AUTH_ERROR;
          }
        }

        if (resultCode == errorCodes.AUTH_SUCCESS) {
          socket.sendWithHeaders([
            0xF3, ...unit.short(0), resultCode, ...unit.short(-1 /* TODO: premium day remaining */), ...unit.string(accountName)
          ]);
        } else if (resultCode == errorCodes.AUTH_BANNED) {
          socket.sendWithHeaders([
            0xF3, ...unit.short(0), resultCode, ...unit.short(-1), ...unit.string(accountName), ...unit.string(account.bannedMessage)
          ]);
        } else {
          socket.sendWithHeaders([
            0xF3, ...unit.short(0), resultCode, ...unit.short(-1), ...unit.string(accountName)
          ]);
        }
        return;
      }

      if (opcode == 0xF5) {
        let echo = unit.readShort(data, 5);

        let servers = config.get('loginServer.servers');

        socket.sendWithHeaders([
          0xF5,
          ...unit.short(echo),
          servers.length,
          ...[].concat(...servers.map(server => {
            return [
              ...unit.string(server.ip),
              ...unit.string(server.lanip),
              ...unit.string(server.name),
              ...unit.short(-1 /* TODO: user count */),
              ...unit.short(0 /* TODO: server id */),
              ...unit.short(0 /* TODO: group id */),
              ...unit.short(0 /* TODO: player cap */),
              ...unit.short(0 /* TODO: free player cap */),
              0,
              ...unit.string(server.king.karus),
              ...unit.string(server.notice.karus),
              ...unit.string(server.king.elmorad),
              ...unit.string(server.notice.elmorad)
            ];
          }))
        ]);
        return;
      }

      if (opcode == 0xF6) {
        socket.sendWithHeaders([
          0xF6,
          ...unit.string('Login Notice'),
          ...unit.string('hello')
        ]);
      }

    }
  });

}

main().catch(x => {
  /* eslint-disable no-process-exit */
  console.error(x.stack);
  process.exit(1);
});