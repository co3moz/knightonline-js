const unit = require('../../core/utils/unit');
const otp = require('../../core/utils/otp');

module.exports = async function ({ socket, body, db, opcode }) {
  let accountName = body.string();
  let password = body.string();
  let otpCode = body.string();
  let ok;

  if (accountName.length > 20 || password.length > 28) {
    ok = 0;
  } else {
    try {
      let { Account } = db.models;

      let account = await Account.findOne({
        account: accountName
      }).exec();

      if (!account) {
        ok = 0;
      } else {
        let timeCheck = account.otpLastFail && account.otpLastFail > new Date(Date.now() - 1000 * 60 * 30); // 30mins of otp ban
        if (timeCheck) {
          if (account.otpTryCount > 5) {
            ok = 0;
          }
        }
        if (ok == undefined && account.password == password) {
          if (account.banned) {
            ok = 0;
          } else {
            if (account.otp) {
              if (otp.generateOTP(account.otpSecret) != otpCode) {
                ok = 2; // nonvalid

                if (timeCheck) {
                  account.otpTryCount = 1;
                } else {
                  account.otpTryCount = (account.otpTryCount | 0) + 1;
                }

                account.otpLastFail = new Date();
                await account.save();
              } else {
                ok = 1; // valid otp
              }
            } else {
              ok = 0;
            }
          }
        } else {
          ok = 0;
        }

      }
    } catch (e) {
      ok = 0;
    }
  }

  socket.send([
    opcode, ok, 0, ...unit.byte_string(otpCode)
  ]);
}