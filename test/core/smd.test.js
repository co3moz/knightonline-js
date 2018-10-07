let path = require('path');

describe.skip('smd reader test', async function () {
  let smdLoader;

  it('should load smd reader', async function () {
    smdLoader = require('../../src/core/utils/smd_reader');
  });

  it('should load moradon.smd file', async function () {
    this.slow(5000);
    this.timeout(10000);
    
    let moradon = await smdLoader('moradon');
  })
})