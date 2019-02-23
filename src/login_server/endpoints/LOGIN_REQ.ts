import { Queue, string, configString, short } from '../../core/utils/unit';
import { ILoginSocket } from '../login_socket';
import { ILoginEndpoint } from '../endpoint';
import { Account, IAccount } from '../../core/database/models';
import { GenerateOTP } from '../../core/utils/otp';

export const LOGIN_REQ: ILoginEndpoint = async function (socket: ILoginSocket, body: Queue, opcode: number) {
  let accountName = body.string();
  let password = body.string();
  body.skip(1);
  let otpCode = body.string();

  var resultCode = 0;
  let account: IAccount;

  try {
    if (accountName.length > 20 || password.length > 28) {
      throw AuthenticationCode.INVALID;
    }

    account = await Account.findOne({
      account: accountName
    }).exec();

    if (!account) {
      throw AuthenticationCode.NOT_FOUND;
    }

    if (account.password != password) {
      throw AuthenticationCode.INVALID;
    }

    if (account.banned) {
      throw AuthenticationCode.BANNED;
    }

    if (account.otp) {
      if (account.otpLastFail && account.otpLastFail > new Date(Date.now() - 1000 * 60 * 30) && account.otpTryCount > 5) {
        throw AuthenticationCode.OTP_BAN; // special for otp ban
      }

      if (!otpCode) throw AuthenticationCode.OTP;

      if (GenerateOTP(account.otpSecret) != otpCode) {
        resultCode = AuthenticationCode.OTP;
      } else {
        resultCode = AuthenticationCode.SUCCESS;
        account.session = generateSession() + account._id;
        await account.save();
      }
    } else {
      resultCode = AuthenticationCode.SUCCESS;
      account.session = generateSession() + account._id;
      await account.save();
    }

  } catch (e) {
    if (e && typeof e == 'number') {
      resultCode = e;
    } else {
      resultCode = AuthenticationCode.ERROR;
    }
  }

  if (resultCode == AuthenticationCode.SUCCESS) {
    let premiumHours = -1;

    if (account.premium) {
      premiumHours = (Date.now() - account.premiumEndsAt.getTime()) / 1000 / 3600;
      if (premiumHours < 0) {
        premiumHours = -1
      } else {
        premiumHours = premiumHours >>> 0;
      }
    }

    socket.send([
      opcode, 0, 0, 0x01, ...short(premiumHours), ...string(account.session)
    ]);
  } else if (resultCode == AuthenticationCode.BANNED) {
    socket.send([
      opcode, 0, 0, 0x04, 0xFF, 0xFF, ...string(accountName), ...string(account.bannedMessage)
    ]);
  } else if (resultCode == AuthenticationCode.OTP_BAN) {
    socket.send([
      opcode, 0, 0, 0x04, 0xFF, 0xFF, ...string(accountName), ...string('OTP invalid ban. Account is locked for 30 mins.')
    ]);
  } else {
    socket.send([
      opcode, 0, 0, resultCode, 0xFF, 0xFF, ...string(accountName)
    ]);
  }
}


function generateSession(): string {
  return Array(3).fill(0).map(generateRandomHexString).join('');
}

function generateRandomHexString(): string {
  return (Math.random() * 0xFF | 0).toString(16).padStart(2, '0');
}

export enum AuthenticationCode {
  SUCCESS = 0x01,
  NOT_FOUND = 0x02,
  INVALID = 0x03,
  BANNED = 0x04,
  IN_GAME = 0x05,
  ERROR = 0x06,
  AGREEMENT = 0x0F,
  OTP = 0x10,
  OTP_BAN = 0xDD,
  FAILED = 0xFF
}