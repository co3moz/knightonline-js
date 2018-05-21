const unit = require('../../core/utils/unit');
const errorCodes = require('../utils/error_codes');

module.exports = async function ({ socket, data, db }) {
  let accountLength = unit.readShort(data, 5);
  let accountName = unit.readString(data, 7, accountLength);

  let passwordLength = unit.readShort(data, 7 + accountLength);
  let password = unit.readString(data, 9 + accountLength);

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
      0xF3, ...unit.short(0), resultCode, ...unit.short(premiumHours), ...unit.string(accountName)
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
}