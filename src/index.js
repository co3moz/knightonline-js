const loginServer = require('./login_server/server');
const gameServer = require('./game_server/server');


(async function () {
  await loginServer();
  await gameServer();
})().catch(x => {
  /* eslint-disable no-process-exit */
  console.error(x.stack);
  process.exit(1);
});