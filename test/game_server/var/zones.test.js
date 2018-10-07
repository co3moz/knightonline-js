describe('zone definition test', async function () {
  let zoneCodes = require('../../../src/game_server/var/zone_codes');

  it('should all zones have rules', async function () {
    let { rules } = require('../../../src/game_server/var/zone_rules');

    for (let zone in zoneCodes) {
      if (!rules[zoneCodes[zone]]) {
        throw new Error('Zone rule is missing! Zone: ' + zone + ', ZoneID:' + zoneCodes[zone]);
      }
    }
  });

  
  it('should all zones have start position', async function () {
    let startPosition = require('../../../src/game_server/var/zone_start_position');

    for (let zone in zoneCodes) {
      if (!startPosition[zoneCodes[zone]]) {
        throw new Error('Zone start position is missing! Zone: ' + zone + ', ZoneID:' + zoneCodes[zone]);
      }
    }
  });
})