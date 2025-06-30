import { byte_string, short, string } from "../../core/utils/unit.js";
import { GenerateOTP } from "../../core/utils/otp.js";
import { Account, type IAccount } from "../../core/database/models/index.js";
import { addLoginServerEndpoint, LoginEndpointCodes } from "../endpoint.js";

addLoginServerEndpoint(LoginEndpointCodes.LOGIN_REQ, async function () {
  let accountName = this.body.string();
  let password = this.body.string();
  this.body.skip(1);
  let otpCode = this.body.string();

  var resultCode = 0;
  let account: IAccount;

  try {
    if (accountName.length > 20 || password.length > 28) {
      throw AuthenticationCode.INVALID;
    }

    account = await Account.findOne({
      account: accountName,
    }).exec();

    if (!account) {
      console.log(
        "[LOGIN] Invalid account (%s) access from %s",
        accountName,
        this.socket.remoteAddress
      );
      throw AuthenticationCode.NOT_FOUND;
    }

    if (account.password != password) {
      console.log(
        "[LOGIN] Invalid account (%s) access from %s",
        account.account,
        this.socket.remoteAddress
      );
      throw AuthenticationCode.INVALID;
    }

    if (account.banned) {
      throw AuthenticationCode.BANNED;
    }

    if (account.otp) {
      if (
        account.otpLastFail &&
        account.otpLastFail > new Date(Date.now() - 1000 * 60 * 30) &&
        account.otpTryCount > 5
      ) {
        console.log(
          "[LOGIN] Invalid account (%s) access from %s (OTP BAN)",
          account.account,
          this.socket.remoteAddress
        );
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
    if (e && typeof e == "number") {
      resultCode = e;
    } else {
      resultCode = AuthenticationCode.ERROR;
    }
  }

  if (resultCode == AuthenticationCode.SUCCESS) {
    let premiumHours = -1;

    if (account.premium) {
      premiumHours =
        (Date.now() - account.premiumEndsAt.getTime()) / 1000 / 3600;
      if (premiumHours < 0) {
        premiumHours = -1;
      } else {
        premiumHours = premiumHours >>> 0;
      }
    }

    console.log(
      "[LOGIN] Account connected (%s) from %s",
      account.account,
      this.socket.remoteAddress
    );

    return [
      LoginEndpointCodes.LOGIN_REQ,
      0,
      0,
      0x01,
      ...short(premiumHours),
      ...string(account.session),
    ];
  } else if (resultCode == AuthenticationCode.BANNED) {
    return [
      LoginEndpointCodes.LOGIN_REQ,
      0,
      0,
      0x04,
      0xff,
      0xff,
      ...string(accountName),
      ...string(account.bannedMessage),
    ];
  } else if (resultCode == AuthenticationCode.OTP_BAN) {
    return [
      LoginEndpointCodes.LOGIN_REQ,
      0,
      0,
      0x04,
      0xff,
      0xff,
      ...string(accountName),
      ...string("OTP invalid ban. Account is locked for 30 mins."),
    ];
  }

  return [
    LoginEndpointCodes.LOGIN_REQ,
    0,
    0,
    resultCode,
    0xff,
    0xff,
    ...string(accountName),
  ];
});

addLoginServerEndpoint(LoginEndpointCodes.CHECK_OTP, async function () {
  let accountName = this.body.string();
  let password = this.body.string();
  let otpCode = this.body.string();

  const result = await authenticateAccountWithOtp(
    accountName,
    password,
    otpCode
  );

  return [LoginEndpointCodes.CHECK_OTP, result, 0, ...byte_string(otpCode)];
});

async function authenticateAccountWithOtp(
  accountName: string,
  password: string,
  otpCode: string
) {
  if (accountName.length > 20 || password.length > 28) {
    return 0;
  }

  try {
    const account = await Account.findOne({
      account: accountName,
    }).exec();

    if (!account) {
      return 0;
    }

    let timeCheck =
      account.otpLastFail &&
      account.otpLastFail > new Date(Date.now() - 1000 * 60 * 30); // 30mins of otp ban

    if (timeCheck) {
      if (account.otpTryCount > 5) {
        return 0;
      }
    }

    if (account.password != password) {
      return 0;
    }

    if (account.banned) {
      return 0;
    }

    if (!account.otp) {
      return 0;
    }

    if (GenerateOTP(account.otpSecret) != otpCode) {
      if (timeCheck) {
        account.otpTryCount = 1;
      } else {
        account.otpTryCount = (account.otpTryCount | 0) + 1;
      }

      account.otpLastFail = new Date();
      await account.save();

      return 2; // nonvalid
    }

    return 1; // valid otp
  } catch (e) {
    return 0;
  }
}

function generateSession(): string {
  return Array(3).fill(0).map(generateRandomHexString).join("");
}

function generateRandomHexString(): string {
  return ((Math.random() * 0xff) | 0).toString(16).padStart(2, "0");
}

export enum AuthenticationCode {
  SUCCESS = 0x01,
  NOT_FOUND = 0x02,
  INVALID = 0x03,
  BANNED = 0x04,
  IN_GAME = 0x05,
  ERROR = 0x06,
  AGREEMENT = 0x0f,
  OTP = 0x10,
  OTP_BAN = 0xdd,
  FAILED = 0xff,
}
