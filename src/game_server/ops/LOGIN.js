const unit = require('../../core/utils/unit');

module.exports = async function ({ socket, opcode, body, db }) {
  let sessionCode = body.string();
  let password = body.string();

  if (socket.user) {
    return; // don't allow this request if user already login
  }


  if (!(sessionCode.length != 30 || password.length > 28)) {
    let { Account } = db.models;

    let user = await Account.findOne({
      _id: sessionCode.substring(6, 30)
    }).exec();

    if (user && user.session == sessionCode && user.password == password) {
      let shared = socket.shared;
      let userMap = shared.userMap;
      let activeSocket = userMap[user.account];

      socket.setTimeout(10 * 60 * 1000); // 10 mins

      if (activeSocket && activeSocket != socket) {
        let um = userMap[user.account];
        um.send([
          0x10, 7, um.user.nation, 0, 0, 0,
          ...unit.string('[SERVER] Hesabiniza ' + socket.remoteAddress + ' ip adresinden yeni bir baglanti yapildi!', 'ascii')
        ]);

        await new Promise(r => setTimeout(r, 100));
        await um.terminate('another login request');
      }

      socket.user = user;
      userMap[user.account] = socket;


      socket.send([
        opcode,
        user.characters.length == 0 ? 0 : (user.nation & 0xFF) // if there is no character available, then allow user to change nation
      ]);
      return;
    }
  }

  socket.terminate('invalid credentails');
}