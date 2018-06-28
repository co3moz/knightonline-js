const unit = require('../../core/utils/unit');
const otp = require('../../core/utils/otp');
const errorCodes = require('../utils/error_codes');

module.exports = async function ({ socket, body, db, opcode }) {
  let accountName = body.string();
  let password = body.string();
  body.skip(1);
  let otpCode = body.string();

  var resultCode = 0;
  let account;

  if (accountName.length > 20 || password.length > 28) {
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
            if (account.otp) {
              if (account.otpLastFail && account.otpLastFail > new Date(Date.now() - 1000 * 60 * 30) && account.otpTryCount > 5) {
                resultCode = 0xDD; // special for otp ban
              } else {
                if (otpCode) {
                  if (otp.generateOTP(account.otpSecret) != otpCode) {
                    resultCode = errorCodes.AUTH_OTP;
                  } else {
                    resultCode = errorCodes.AUTH_SUCCESS;
                  }
                } else {
                  resultCode = errorCodes.AUTH_OTP;
                }
              }
            } else {
              resultCode = errorCodes.AUTH_SUCCESS;
            }
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
    let premiumHours = -1;

    if (account.premium) {
      premiumHours = (Date.now() - account.premiumEndsAt) / 1000 / 3600;
      if (premiumHours < 0) {
        premiumHours = -1
      } else {
        premiumHours = premiumHours >>> 0;
      }
    }

    socket.sendWithHeaders([
      opcode, 0, 0, 0x01, ...unit.short(premiumHours), ...unit.string(accountName)
    ]);
  } else if (resultCode == errorCodes.AUTH_BANNED) {
    socket.sendWithHeaders([
      opcode, 0, 0, 0x04, 0xFF, 0xFF, ...unit.string(accountName), ...unit.string(account.bannedMessage)
    ]);
  } else if (resultCode == 0xDD) {
    socket.sendWithHeaders([
      opcode, 0, 0, 0x04, 0xFF, 0xFF, ...unit.string(accountName), ...unit.string('OTP invalid ban. Account is locked for 30 mins.')
    ]);
  } else {
    socket.sendWithHeaders([
      opcode, 0, 0, resultCode, 0xFF, 0xFF, ...unit.string(accountName)
    ]);
  }
}