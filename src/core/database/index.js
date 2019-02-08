module.exports = async function () {
  let db = require('./utils/connect');

  if (db.constructor == Function) { // create only one per one cluster
    db = await db();

    
    console.log('loading models...');
    const modelLoader = require('./utils/model_loader');
    await modelLoader(db);

    
   console.log('checking defaults...');
    const defaultChecker = require('./utils/default_checker');
    await defaultChecker(db);
  }

  return module.exports = db;
}