import Client from './client'

(async function () {
  Client().catch(x => {
    /* eslint-disable no-process-exit */
    console.error(x.stack);
    process.exit(1);
  });
})()