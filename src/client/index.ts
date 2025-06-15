import { TestClient } from "./test-client.js";

(async function () {
  TestClient().catch((x) => {
    /* eslint-disable no-process-exit */
    console.error(x.stack);
    process.exit(1);
  });
})();
