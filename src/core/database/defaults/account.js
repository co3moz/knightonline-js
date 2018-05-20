module.exports = async function (db) {
  let testUsers = [{
    account: 'test',
    password: '1',
  }, {
    account: 'banned',
    password: '1',
    banned: true,
    bannedMessage: 'banli hesap'
  }];

  let { Account } = db.models;

  for (let user of testUsers) {
    let data = await Account.findOne({
      account: user.account
    }).exec();

    if (data) {
      await data.remove();
    }

    let account = new Account(user);

    await account.save();
  }

  console.log('Test users have been defined!')
}