let path = require('path');

describe('smd reader test', async function () {
  let smdLoader;

  it('should load smd reader', async function () {
    smdLoader = require('../src/core/utils/smd_reader');
  });

  it('should load moradon.smd file', async function () {
    this.slow(2000);
    this.timeout(10000);
    let moradon = await smdLoader('moradon');
  })
})