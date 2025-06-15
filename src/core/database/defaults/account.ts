import { Account } from "@/models";

export async function AccountDefaults() {
  let testUsers = [
    {
      account: "test",
      password: "1",
    },
    {
      account: "test2",
      password: "1",
    },
    {
      account: "banned",
      password: "1",
      banned: true,
      bannedMessage: "banli hesap",
    },
    {
      account: "otp",
      password: "1",
      otp: true,
      otpSecret: "AAAAAAAAAAAAAAAA",
    },
  ];

  for (let user of testUsers) {
    let data = await Account.findOne({
      account: user.account,
    }).exec();

    if (data) {
      continue;
    }

    let account = new Account(user);

    await account.save();
  }
}
