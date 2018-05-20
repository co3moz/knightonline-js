module.exports = async function () {
  let db = require('./utils/connect');

  db = await db();

  const modelLoader = require('./utils/model_loader');

  await modelLoader(db);

  const defaultChecker = require('./utils/default_checker');
  await defaultChecker(db);
  
  return module.exports = db;
}