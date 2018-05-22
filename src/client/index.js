const client = require('./client');

(async function () {
  client().catch(x => {
    /* eslint-disable no-process-exit */
    console.error(x.stack);
    process.exit(1);
  });
})()