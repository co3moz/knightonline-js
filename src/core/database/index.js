module.exports = async function () {
  let db = require('./db');

  db = await db();

  const modelLoader = require('./model-loader');

  await modelLoader(db);
  
  return module.exports = db;
}