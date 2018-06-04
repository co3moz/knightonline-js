const unit = require('../../core/utils/unit');
const { HEAD, BREAST, SHOULDER, RIGHTHAND, LEFTHAND, LEG, GLOVE, FOOT } = require('../var/item_slot');

module.exports = async function ({ socket, opcode, db }) {
  if (!socket.user.characters) {
    socket.user.characters = [];
  }

  var characters = [];

  let { Character } = db.models;
  for (var i = 0; i < 4; i++) {
    let characterName = socket.user.characters[i];

    let data = {
      name: '',
      hair: 0,
      klass: 0,
      race: 0,
      level: 0,
      face: 0,
      zone: 0
    };

    if (characterName) {
      let character = await Character.findOne({
        name: characterName
      }).select([
        'name', 'race', 'klass', 'hair', 'level', 'face', 'zone', 'items'
      ]).exec();

      if (character) {
        data.name = character.name;
        data.hair = character.hair;
        data.klass = character.klass;
        data.race = character.race;
        data.level = character.level;
        data.face = character.face;
        data.zone = character.zone;

        data.items = [];

        for (var m = 0; m < 14; m++) {
          if (m == HEAD || m == BREAST || m == SHOULDER || m == RIGHTHAND || m == LEFTHAND || m == LEG || m == GLOVE || m == FOOT) {
            let item = character.items[m];
            
            if (item) {
              data.items.push(...unit.int(item.id), ...unit.short(item.durability));
            } else {
              data.items.push(0, 0, 0, 0, 0, 0);
            }
          }
        }
      }
    }

    if (!data.items) {
      data.items = Array(6 * 8).fill(0); // (uint + short) * 8 item
    }

    characters.push(data);
  }

  socket.sendWithHeaders([
    opcode,
    1,
    1,
    ...[].concat(...characters.map(character => [
      ...unit.string(character.name),
      character.race,
      ...unit.short(character.klass),
      character.level,
      character.face,
      ...unit.int(character.hair),
      character.zone,
      ...character.items
    ]))
  ])
}