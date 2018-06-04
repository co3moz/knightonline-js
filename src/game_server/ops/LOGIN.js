const unit = require('../../core/utils/unit');

module.exports = async function ({ socket, opcode, body, db }) {
  let accountName = body.string();
  let password = body.string();

  if (socket.user) {
    return; // don't allow this request if user already login
  }


  if (!(accountName.length > 20 || password.length > 28)) {
    let { Account } = db.models;

    let account = await Account.findOne({
      account: accountName
    }).exec();

    if (account.password == password) {
      let shared = socket.shared;


      if (!shared.userMap) {
        shared.userMap = {};
      }

      let userMap = shared.userMap;
      let activeSocket = userMap[accountName];
      if (activeSocket && activeSocket != socket) {
        userMap[accountName].terminate('another login request');
        delete userMap[accountName];
      }

      socket.user = account;
      userMap[accountName] = socket;

      let nation = 0;
      if (account.nation == 'KARUS') {
        nation = 1;
      } else if (account.nation == 'ELMORAD') {
        nation = 2;
      } else if (account.nation == 'NONE') {
        nation = 3;
      }

      socket.sendWithHeaders([
        opcode,
        nation & 0xFF
      ]);
      return;
    }
  }

  socket.terminate('invalid credentails');
}