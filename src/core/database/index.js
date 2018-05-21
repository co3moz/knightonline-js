module.exports = async function () {
  let db = require('./utils/connect');

  if (db.constructor == Function) { // create only one per one cluster
    db = await db();

    const modelLoader = require('./utils/model_loader');

    await modelLoader(db);

    const defaultChecker = require('./utils/default_checker');
    await defaultChecker(db);
  }

  return module.exports = db;
}